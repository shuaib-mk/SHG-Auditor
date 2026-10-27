import { Router, Request, Response } from 'express';
import multer from 'multer';
import { z } from 'zod';
import { transcribeMeetingAudio } from '../services/metaVoiceService.js';
import {
  extractSpokenTransactionsWithSpark,
  readRegisterWithSparkVision,
} from '../services/metaSparkService.js';
import { reconcileAccounts } from '../services/reconciler.js';
import {
  checkFinancialAdviceGuardrail,
  FIXED_REFUSAL_MESSAGE,
} from '../services/guardrails.js';
import { runEvaluationSuite } from '../services/evaluator.js';
import {
  MOCK_SHG_MEMBERS,
  MOCK_UTTERANCES,
  MOCK_REGISTER_DATA,
  generateRegisterSvg,
} from '../services/mockService.js';
import { config } from '../config.js';

const upload = multer({
  limits: {
    fileSize: config.limits.maxAudioSizeMb * 1024 * 1024,
  },
  storage: multer.memoryStorage(),
});

export const apiRouter = Router();

// 1. Health & Configuration Check
apiRouter.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    app: 'SHG Auditor',
    version: '1.0.0',
    agentProvider: config.agentProvider,
    metaVoiceModel: config.meta.voiceModel,
    metaSparkModel: config.meta.sparkModel,
    basetenModel: config.baseten.modelId,
    timestamp: new Date().toISOString(),
  });
});

// 2. Meeting Audio Transcription with Speaker Diarization
apiRouter.post(
  '/transcribe',
  upload.single('audio'),
  async (req: Request, res: Response) => {
    try {
      const audioBuffer = req.file?.buffer;
      const mimeType = req.file?.mimetype;

      let memberNames: string[] = [];
      if (req.body.memberNames) {
        try {
          memberNames = JSON.parse(req.body.memberNames);
        } catch {
          memberNames = [];
        }
      }

      const result = await transcribeMeetingAudio({
        audioBuffer,
        mimeType,
        memberNames,
      });

      res.json(result);
    } catch (err: any) {
      console.error('Transcription error:', err);
      res.status(500).json({ error: 'Failed to transcribe audio', details: err.message });
    }
  }
);

// 3. Spoken Transaction Extraction with Tool Calling (Muse Spark)
const ExtractSchema = z.object({
  utterances: z.array(
    z.object({
      id: z.string(),
      speaker: z.string(),
      speakerName: z.string().optional(),
      text: z.string(),
      startMs: z.number(),
      endMs: z.number(),
    })
  ),
  speakerToMemberMap: z.record(z.string(), z.string()).optional(),
});

apiRouter.post('/extract', async (req: Request, res: Response) => {
  try {
    const parse = ExtractSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ error: 'Invalid payload', details: parse.error.format() });
    }

    const { utterances, speakerToMemberMap } = parse.data;
    const result = await extractSpokenTransactionsWithSpark(utterances, speakerToMemberMap);

    res.json(result);
  } catch (err: any) {
    console.error('Extraction error:', err);
    res.status(500).json({ error: 'Failed to extract transactions', details: err.message });
  }
});

// 4. Register Photo OCR / Vision Reading
apiRouter.post(
  '/read-register',
  upload.single('image'),
  async (req: Request, res: Response) => {
    try {
      const imageBuffer = req.file?.buffer;
      const base64 = imageBuffer ? imageBuffer.toString('base64') : undefined;
      const mimeType = req.file?.mimetype || 'image/jpeg';

      const result = await readRegisterWithSparkVision(base64, mimeType);
      res.json(result);
    } catch (err: any) {
      console.error('Register reading error:', err);
      res.status(500).json({ error: 'Failed to read register', details: err.message });
    }
  }
);

// 5. Deterministic Reconciliation Engine
const ReconcileSchema = z.object({
  spokenTransactions: z.array(z.any()),
  registerData: z.object({
    meetingDate: z.string().optional(),
    shgName: z.string().optional(),
    village: z.string().optional(),
    rows: z.array(z.any()),
    totals: z.object({
      savings: z.number(),
      loanRepaid: z.number(),
      interest: z.number(),
      fine: z.number(),
      grandTotal: z.number(),
      cashInBox: z.number().optional(),
    }),
  }),
  members: z.array(z.any()).optional(),
  interestRatePercent: z.number().optional(),
});

apiRouter.post('/reconcile', (req: Request, res: Response) => {
  try {
    const parse = ReconcileSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ error: 'Invalid reconciliation payload', details: parse.error.format() });
    }

    const { spokenTransactions, registerData, members, interestRatePercent } = parse.data;
    const memberRoster = members && members.length > 0 ? members : MOCK_SHG_MEMBERS;

    const report = reconcileAccounts({
      spokenTransactions,
      registerData: registerData as any,
      members: memberRoster,
      interestRatePercent,
    });

    res.json(report);
  } catch (err: any) {
    console.error('Reconciliation error:', err);
    res.status(500).json({ error: 'Reconciliation failed', details: err.message });
  }
});

// 6. Guardrail Check / Bait Refusal Endpoint
apiRouter.post('/guardrail-check', (req: Request, res: Response) => {
  const query = req.body.query || '';
  const check = checkFinancialAdviceGuardrail(query);

  if (check.isRefusal) {
    return res.json({
      refused: true,
      message: FIXED_REFUSAL_MESSAGE,
      pattern: check.matchedPattern,
    });
  }

  res.json({
    refused: false,
    message: 'Query passed neutral arithmetic bounds.',
  });
});

// 7. Evaluation Benchmark Suite Runner
apiRouter.get('/evaluate', (req: Request, res: Response) => {
  try {
    const results = runEvaluationSuite();
    res.json(results);
  } catch (err: any) {
    console.error('Evaluation suite error:', err);
    res.status(500).json({ error: 'Failed to run evaluation suite', details: err.message });
  }
});

// 8. Fictional Seed Data & Register Demo Image
apiRouter.get('/seed', (req: Request, res: Response) => {
  const svg = generateRegisterSvg(MOCK_REGISTER_DATA);
  res.json({
    members: MOCK_SHG_MEMBERS,
    sampleUtterances: MOCK_UTTERANCES,
    sampleRegisterData: MOCK_REGISTER_DATA,
    sampleRegisterSvg: svg,
  });
});

// 9. Raw SVG Endpoint for Register Image Preview
apiRouter.get('/seed/register-image.svg', (req: Request, res: Response) => {
  const svg = generateRegisterSvg(MOCK_REGISTER_DATA);
  res.setHeader('Content-Type', 'image/svg+xml');
  res.send(svg);
});
