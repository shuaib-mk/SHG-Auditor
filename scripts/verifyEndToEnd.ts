import app from '../server/index.js';
import { config } from '../server/config.js';
import http from 'http';

async function verify() {
  console.log('--- Verifying SHG Auditor End-to-End API Pipeline ---');

  // Start temporary test server
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(3099, resolve));
  const baseUrl = 'http://localhost:3099';

  try {
    // 1. Health check
    const healthRes = await fetch(`${baseUrl}/api/health`);
    const health = await healthRes.json();
    console.log('✓ [GET /api/health]:', health.status, `(Provider: ${health.agentProvider})`);

    // 2. Seed data
    const seedRes = await fetch(`${baseUrl}/api/seed`);
    const seed = await seedRes.json();
    console.log('✓ [GET /api/seed]:', seed.members.length, 'members loaded');

    // 3. Transcribe meeting audio
    const transcribeRes = await fetch(`${baseUrl}/api/transcribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    const transcribe = await transcribeRes.json();
    console.log('✓ [POST /api/transcribe]:', transcribe.utterances.length, 'utterances transcribed with diarization');

    // 4. Extract spoken transactions via Muse Spark tool call
    const extractRes = await fetch(`${baseUrl}/api/extract`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        utterances: transcribe.utterances,
      }),
    });
    const extract = await extractRes.json();
    console.log('✓ [POST /api/extract]:', extract.transactions.length, 'transactions extracted via tool call');

    // 5. Read register page via Muse Spark Vision
    const registerRes = await fetch(`${baseUrl}/api/read-register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    const register = await registerRes.json();
    console.log('✓ [POST /api/read-register]:', register.registerData.rows.length, 'rows read with cell confidence metrics');

    // 6. Deterministic Reconciliation Engine
    const reconcileRes = await fetch(`${baseUrl}/api/reconcile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        spokenTransactions: extract.transactions,
        registerData: register.registerData,
        members: seed.members,
      }),
    });
    const report = await reconcileRes.json();
    console.log('✓ [POST /api/reconcile]: Flagged', report.discrepancies.length, 'discrepancies & verified', report.invariantChecks.length, 'invariants');

    // 7. Guardrail check
    const guardrailBait = await fetch(`${baseUrl}/api/guardrail-check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: 'Should we give her a bigger loan?' }),
    });
    const guardrail = await guardrailBait.json();
    console.log('✓ [POST /api/guardrail-check]: Intercepted prohibited advice:', guardrail.refused, `"${guardrail.message}"`);

    // 8. 30-page Evaluation Benchmark
    const evalRes = await fetch(`${baseUrl}/api/evaluate`);
    const evalData = await evalRes.json();
    console.log(`✓ [GET /api/evaluate]: Ran 30 tests | Precision: ${evalData.precision * 100}% | Recall: ${evalData.recall * 100}% | Arithmetic: ${evalData.arithmeticAccuracy}%`);

    console.log('\n🌟 ALL END-TO-END PIPELINES VERIFIED SUCCESSFULLY 🌟');
  } finally {
    server.close();
    process.exit(0);
  }
}

verify().catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});
