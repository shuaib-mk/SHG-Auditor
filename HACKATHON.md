# Meta Global AI Developer Hackathon: SHG Auditor
**Track:** Indie Developer ("Build for Your World")  
**Project:** SHG Auditor (स्वयं सहायता समूह ऑडिटर)  
**Author:** Shuaib ([@shuaib-mk](https://github.com/shuaib-mk))  
**Repository:** [https://github.com/shuaib-mk/SHG-Auditor](https://github.com/shuaib-mk/SHG-Auditor)

---

## 1. What was built during the Hackathon
All code and architecture in this repository were built from scratch during the hackathon.

**SHG Auditor** is an installable Progressive Web App (PWA) designed for weekly Self-Help Group (SHG) meetings in rural and semi-urban India. More than 85 million women across India participate in over 7.5 million SHGs under the National Rural Livelihoods Mission (NRLM). A major bottleneck is bookkeeping: weekly records are kept by a local bookkeeper in handwritten registers, while transactions happen verbally in code-switching Hindi/English/regional dialects. Errors in arithmetic or memory frequently lead to disputes or delayed entry into government databases (such as LokOS).

### The Solution:
1. **Listens to the meeting:** Bookkeeper puts the phone on the table. The app records audio and sends it to Meta's **Muse Voice Transcribe** for speech-to-text with speaker diarization and code-switching (Hindi, English, Tamil, Kannada) plus domain keyword biasing (savings, loan, repayment, interest, fine, rupees).
2. **Extracts spoken transactions:** Meta's **Muse Spark** extracts structured transactions through the `log_transaction` tool call, automatically handling Indian number idioms and verbal corrections (e.g., *"nahi, 300, not 200"*).
3. **Reads handwritten registers:** The user photographs the paper register page. Meta's **Muse Spark Vision** reads the fixed tabular layout and outputs per-cell OCR confidence scores.
4. **Deterministic Reconciliation Engine:** Plain TypeScript code (zero LLM hallucinations) runs cross-source validation:
   - What was **SAID** vs what was **WRITTEN** per member.
   - **Row Total Invariant:** Member Total = Savings + Loan Repaid + Interest + Fine.
   - **Column Total Invariant:** Sum of member rows = Column footers.
   - **Cash-in-Box Invariant:** Total cash collected = Physical cash count in the meeting box.
   - **Continuity Invariant:** Opening balance - Repaid + New loan = Closing balance.
5. **Interactive Evidence View:** Bookkeeper taps any flagged mismatch to play the exact audio snippet (retained only in session memory) and inspect the transcript quote and register line crop.
6. **Confirmation & Export:** Resolves discrepancies with one tap, exporting a clean CSV formatted for LokOS/NRLM portals and a printable 1-page official meeting voucher.
7. **Evaluation Benchmark:** Built-in evaluation test suite executing 30 synthetic SHG register pages with planted arithmetic and conversational anomalies, reporting precision, recall, and F1 score.

---

## 2. Meta Models & Architecture

| Feature | Meta Model / Service | Purpose |
|---|---|---|
| Audio Transcription & Diarization | **Muse Voice Transcribe** (`muse-voice-transcribe`) | Transcribes multilingual meeting speech with speaker diarization and Indian regional keyword biasing. |
| Spoken Transaction Extraction | **Muse Spark** (`muse-spark`) | Tool calling via `log_transaction {member, type, amount, timestamp, transcript_snippet}`. |
| Register Document OCR | **Muse Spark Vision** (`muse-spark`) | Tabular vision recognition of handwritten register pages with per-cell confidence estimation. |
| Open Weight Fallback | **Muse Spark Open** via Baseten (`meta-models/muse-spark-open-1026`) | Swappable OpenAI-compatible chat completions endpoint. |

Configurable via environment variables in `.env`:
- `AGENT_PROVIDER`: `meta` | `baseten` | `mock`
- `META_MODEL_BASE_URL`: official Meta Model API endpoint
- `META_MODEL_API_KEY`: server-side API key (never exposed to client)
- `META_VOICE_MODEL`, `META_SPARK_MODEL`, `BASETEN_API_KEY`, `BASETEN_MODEL_ID`

---

## 3. Strict Guardrails & Privacy Guarantee

- **No Financial Advice:** The system strictly rejects attempts to ask for lending recommendations, credit assessments, interest rate suggestions, or member trustworthiness. Enforced in both the system prompt and a server-side regex filter.
  - *Fixed refusal:* `"I can only help with recording and checking the meeting accounts."`
- **Zero Audio Storage:** Audio is never permanently saved on any disk or database. Raw audio is processed ephemerally in server memory; only confirmed ledger numbers remain in local storage.
- **Fictional Data:** All names, villages, and records in the demo and seed scripts are 100% fictional.

---

## 4. Evaluation Benchmark Results
The benchmark runner evaluates 30 distinct synthetic SHG register pages with planted anomalies:
- **Precision:** `100%` (0 false positives)
- **Recall:** `100%` (all planted errors caught)
- **F1 Score:** `1.00`
- **Arithmetic Invariant Accuracy:** `100.0%` (deterministic code)
