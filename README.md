# SHG Auditor

An installable web app (PWA) for Indian Self-Help Group (SHG) bookkeepers to reconcile weekly meeting records using speech, handwritten ledger photos, and deterministic arithmetic checks.

Built for the **Meta Global AI Developer Hackathon** (Indie Developer track: *Build for Your World*).

---

## What it does

At weekly SHG meetings, bookkeepers record transactions in handwritten notebooks while members verbally discuss their contributions. SHG Auditor checks three things:
1. **What was SAID** (via audio recording + Meta Muse Voice Transcribe diarization)
2. **What was WRITTEN** (via photo upload + Meta Muse Spark Vision OCR)
3. **Whether the TOTALS add up** (deterministic arithmetic cross-check)

Every discrepancy is flagged with evidence (audio snippet + transcript line + register row crop). Once reviewed, the final accounts export as a clean CSV ready for government entry (LokOS / NRLM) and a printable 1-page meeting voucher.

---

## Tech Stack

- **Frontend:** React 19, TypeScript, Vite, Lucide Icons, Vanilla CSS (Mobile-first, PWA, Light/Dark mode, Hindi & English i18n).
- **Backend:** Node.js, Express, Multer, Zod.
- **AI Models:**
  - **Muse Voice Transcribe:** Multilingual speech-to-text with speaker diarization and Indian language keyword biasing.
  - **Muse Spark:** Tool-calling (`log_transaction`) and multimodal vision for register table reading.
  - Swappable to **Muse Spark Open** via Baseten (`meta-models/muse-spark-open-1026`).
- **Testing:** Vitest for deterministic invariant checks and guardrail refusal tests.

---

## Getting Started

### 1. Prerequisites
- Node.js 18+ (tested on Node v20/v24)
- npm

### 2. Installation
```bash
git clone https://github.com/shuaib-mk/SHG-Auditor.git
cd SHG-Auditor
npm install
```

### 3. Environment Setup
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
By default, `AGENT_PROVIDER=mock` is set so the entire app and demo data run out-of-the-box without needing API keys. To connect live Meta Model API or Baseten keys:
```env
AGENT_PROVIDER=meta
META_MODEL_BASE_URL=https://api.meta.com/v1
META_MODEL_API_KEY=your_key_here
META_VOICE_MODEL=muse-voice-transcribe
META_SPARK_MODEL=muse-spark

# Or Baseten alternative:
# AGENT_PROVIDER=baseten
# BASETEN_API_KEY=your_baseten_key
# BASETEN_MODEL_ID=meta-models/muse-spark-open-1026
```

### 4. Running Locally
Start both backend (port 3001) and frontend (port 5173):
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Development & Testing

- **Run Unit Tests:**
  ```bash
  npm test
  ```
  Runs tests for mathematical invariants, spoken number correction parsing, and guardrail refusal checks.

- **Run End-to-End Pipeline Check:**
  ```bash
  npx tsx scripts/verifyEndToEnd.ts
  ```

- **Generate Fictional Seed Data:**
  ```bash
  npm run seed
  ```

- **Build Production Bundle:**
  ```bash
  npm run build
  ```

---

## Guardrails & Privacy

- **No Financial Advice:** The agent strictly records and checks arithmetic. It never gives lending advice, recommends interest rates, or comments on creditworthiness. If asked, it returns a fixed refusal:
  > *"I can only help with recording and checking the meeting accounts."*
- **No Permanent Audio Storage:** Audio is processed ephemerally in session memory and is never written to disk or database.
- **Fictional Data:** All names and records in the demo and seed scripts are fictional.

---

## License
MIT
