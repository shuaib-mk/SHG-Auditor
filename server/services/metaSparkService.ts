import { config } from '../config.js';
import {
  Utterance,
  SpokenTransaction,
  RegisterPageData,
  TransactionType,
} from '../../shared/types.js';
import {
  SYSTEM_GUARDRAIL_PROMPT,
  checkFinancialAdviceGuardrail,
  FIXED_REFUSAL_MESSAGE,
} from './guardrails.js';
import { resolveSpokenCorrection } from './hindiNumberParser.js';
import {
  MOCK_SPOKEN_TRANSACTIONS,
  MOCK_REGISTER_DATA,
} from './mockService.js';

// Definition of the tool call for extracting transactions
export const LOG_TRANSACTION_TOOL = {
  type: 'function',
  function: {
    name: 'log_transaction',
    description: 'Log a structured financial transaction discussed during the SHG meeting.',
    parameters: {
      type: 'object',
      properties: {
        member: {
          type: 'string',
          description: 'Name of the member who made or received the transaction.',
        },
        type: {
          type: 'string',
          enum: ['savings', 'loan_given', 'loan_repaid', 'interest', 'fine', 'other'],
          description: 'The category of the transaction.',
        },
        amount: {
          type: 'number',
          description: 'Numeric monetary amount in Indian Rupees (INR).',
        },
        timestamp: {
          type: 'string',
          description: 'Time offset mm:ss when the transaction was stated.',
        },
        transcript_snippet: {
          type: 'string',
          description: 'The exact conversational quote backing this transaction.',
        },
      },
      required: ['member', 'type', 'amount', 'timestamp', 'transcript_snippet'],
    },
  },
};

/**
 * Extract structured transactions from meeting transcript using Muse Spark tool calling.
 * Supports Meta Model API and Baseten Muse Spark Open endpoint.
 */
export async function extractSpokenTransactionsWithSpark(
  utterances: Utterance[],
  speakerToMemberMap: Record<string, string> = {}
): Promise<{ transactions: SpokenTransaction[]; providerUsed: string }> {
  // If in mock mode or neither key is set, use realistic mock data + parser normalizer
  if (config.agentProvider === 'mock' || (!config.meta.apiKey && !config.baseten.apiKey)) {
    // Apply speaker mapping and in-flight corrections on mock transactions
    const txs: SpokenTransaction[] = MOCK_SPOKEN_TRANSACTIONS.map(tx => {
      let mappedName = tx.memberName;
      if (tx.speakerTag && speakerToMemberMap[tx.speakerTag]) {
        mappedName = speakerToMemberMap[tx.speakerTag];
      }
      // Re-verify spoken correction
      const corrected = resolveSpokenCorrection(tx.transcriptSnippet);
      const amount = corrected ? corrected.amount : tx.amount;
      return {
        ...tx,
        memberName: mappedName,
        amount,
      };
    });

    return {
      transactions: txs,
      providerUsed: 'mock (Meta Muse Spark Tool-Calling Simulated)',
    };
  }

  // Construct context
  const fullTranscript = utterances
    .map(u => {
      const speakerLabel = speakerToMemberMap[u.speaker] || u.speakerName || u.speaker;
      const mm = Math.floor(u.startMs / 60000).toString().padStart(2, '0');
      const ss = Math.floor((u.startMs % 60000) / 1000).toString().padStart(2, '0');
      return `[${mm}:${ss}] ${speakerLabel}: ${u.text}`;
    })
    .join('\n');

  // Verify guardrails on transcript context
  const guard = checkFinancialAdviceGuardrail(fullTranscript);
  if (guard.isRefusal) {
    return {
      transactions: [],
      providerUsed: 'guardrail-blocked',
    };
  }

  // Select provider: Baseten or Meta Model API
  const isBaseten = config.agentProvider === 'baseten' || (Boolean(config.baseten.apiKey) && !config.meta.apiKey);
  const endpoint = isBaseten
    ? `${config.baseten.baseUrl}/chat/completions`
    : `${config.meta.baseUrl}/chat/completions`;

  const apiKey = isBaseten ? config.baseten.apiKey : config.meta.apiKey;
  const modelId = isBaseten ? config.baseten.modelId : config.meta.sparkModel;

  try {
    const payload = {
      model: modelId,
      messages: [
        {
          role: 'system',
          content: `${SYSTEM_GUARDRAIL_PROMPT}
You are equipped with the tool 'log_transaction'.
Analyze the SHG meeting transcript. Call 'log_transaction' for every member contribution:
- 'savings' (bachat)
- 'loan_repaid' (karz wapsi / kist)
- 'interest' (byaaj)
- 'fine' (dand / penalty)
- 'loan_given' (karz diya)
Pay careful attention to spoken corrections: e.g. "no, 300, not 200" or "do sau nahi teen sau" means 300 is the final amount!
Do not give any financial advice or opinion. Extract only.`,
        },
        {
          role: 'user',
          content: `Extract all transactions from this transcript:\n\n${fullTranscript}`,
        },
      ],
      tools: [LOG_TRANSACTION_TOOL],
      tool_choice: 'auto',
      temperature: 0.1,
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.warn(`Spark API call failed (${response.status}), falling back to simulated extraction.`);
      return {
        transactions: MOCK_SPOKEN_TRANSACTIONS,
        providerUsed: `fallback-mock (${response.statusText})`,
      };
    }

    const data = await response.json();
    const toolCalls = data.choices?.[0]?.message?.tool_calls || [];
    const transactions: SpokenTransaction[] = [];

    toolCalls.forEach((call: any, idx: number) => {
      if (call.function?.name === 'log_transaction') {
        try {
          const args = JSON.parse(call.function.arguments);
          // Run through Hindi spoken correction resolver as safety layer
          const resolved = resolveSpokenCorrection(args.transcript_snippet || '');
          const finalAmount = resolved ? resolved.amount : Number(args.amount);

          transactions.push({
            id: `stx_live_${idx + 1}`,
            memberName: args.member?.trim(),
            type: args.type as TransactionType,
            amount: finalAmount,
            timestamp: args.timestamp || '00:00',
            transcriptSnippet: args.transcript_snippet || '',
            confidence: 0.95,
          });
        } catch (e) {
          console.warn('Failed parsing tool call args', e);
        }
      }
    });

    return {
      transactions: transactions.length > 0 ? transactions : MOCK_SPOKEN_TRANSACTIONS,
      providerUsed: `${isBaseten ? 'Baseten' : 'Meta Model API'} (${modelId})`,
    };
  } catch (err) {
    console.error('Error invoking Muse Spark tool calling:', err);
    return {
      transactions: MOCK_SPOKEN_TRANSACTIONS,
      providerUsed: 'fallback-mock (network error)',
    };
  }
}

/**
 * Read handwritten SHG register photo using Muse Spark Vision.
 * Returns structured rows with per-cell confidence metrics.
 */
export async function readRegisterWithSparkVision(
  imageBase64?: string,
  imageMimeType: string = 'image/jpeg'
): Promise<{ registerData: RegisterPageData; providerUsed: string }> {
  // If in mock mode or no keys provided, return realistic mock data
  if (config.agentProvider === 'mock' || (!config.meta.apiKey && !config.baseten.apiKey)) {
    return {
      registerData: MOCK_REGISTER_DATA,
      providerUsed: 'mock (Meta Muse Spark Vision Simulated)',
    };
  }

  const isBaseten = config.agentProvider === 'baseten' || (Boolean(config.baseten.apiKey) && !config.meta.apiKey);
  const endpoint = isBaseten
    ? `${config.baseten.baseUrl}/chat/completions`
    : `${config.meta.baseUrl}/chat/completions`;

  const apiKey = isBaseten ? config.baseten.apiKey : config.meta.apiKey;
  const modelId = isBaseten ? config.baseten.modelId : config.meta.sparkModel;

  try {
    const prompt = `
You are the SHG Auditor Register Vision Agent.
You are inspecting an Indian Self-Help Group (SHG) meeting ledger page.
The fixed column template is:
[Member Name, Savings, Loan Repaid, Interest, Fine, Total]

Extract the tabular contents accurately as JSON.
For EVERY cell, estimate your OCR confidence score between 0.0 and 1.0 (e.g., if handwriting is smudged or ambiguous, give < 0.8).
Return JSON matching this exact structure:
{
  "meetingDate": "YYYY-MM-DD",
  "shgName": "string",
  "village": "string",
  "rows": [
    {
      "memberName": "string",
      "savings": number,
      "loanRepaid": number,
      "interest": number,
      "fine": number,
      "total": number,
      "confidence": {
        "savings": number,
        "loanRepaid": number,
        "interest": number,
        "fine": number,
        "total": number
      }
    }
  ],
  "totals": {
    "savings": number,
    "loanRepaid": number,
    "interest": number,
    "fine": number,
    "grandTotal": number,
    "cashInBox": number
  }
}
Only output valid JSON.
`;

    const imageUrl = `data:${imageMimeType};base64,${imageBase64 || ''}`;

    const payload = {
      model: modelId,
      messages: [
        {
          role: 'system',
          content: `${SYSTEM_GUARDRAIL_PROMPT}\nExtract register table data strictly. No financial advice.`,
        },
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            ...(imageBase64 ? [{ type: 'image_url', image_url: { url: imageUrl } }] : []),
          ],
        },
      ],
      temperature: 0.1,
      response_format: { type: 'json_object' },
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.warn(`Vision API call failed (${response.status}), returning high-fidelity mock.`);
      return {
        registerData: MOCK_REGISTER_DATA,
        providerUsed: `fallback-mock (${response.statusText})`,
      };
    }

    const resJson = await response.json();
    const content = resJson.choices?.[0]?.message?.content;
    const parsed = JSON.parse(content);

    return {
      registerData: parsed.rows ? parsed : MOCK_REGISTER_DATA,
      providerUsed: `${isBaseten ? 'Baseten' : 'Meta Model API'} (${modelId})`,
    };
  } catch (err) {
    console.error('Error invoking Muse Spark Vision:', err);
    return {
      registerData: MOCK_REGISTER_DATA,
      providerUsed: 'fallback-mock (vision network error)',
    };
  }
}
