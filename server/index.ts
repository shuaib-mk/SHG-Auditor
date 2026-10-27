import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config.js';
import { apiRouter } from './routes/api.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Request logging for audit trail
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (req.path.startsWith('/api')) {
      console.log(`[${req.method}] ${req.path} -> ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// Mount API routes
app.use('/api', apiRouter);

// Serve frontend build if present
const clientDist = path.join(__dirname, '../client/dist');
app.use(express.static(clientDist));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  const indexPath = path.join(clientDist, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.status(200).send(`
        <div style="font-family: sans-serif; padding: 40px; text-align: center;">
          <h2>SHG Auditor Backend Running on :${config.port}</h2>
          <p>API endpoints ready at <code>/api/*</code>.</p>
          <p>Start the frontend with <code>npm run dev:client</code> (default port 5173).</p>
        </div>
      `);
    }
  });
});

app.listen(config.port, () => {
  console.log(`===============================================`);
  console.log(`🚀 SHG Auditor API Server running on port ${config.port}`);
  console.log(`   Agent Provider: ${config.agentProvider}`);
  console.log(`   Meta Voice Model: ${config.meta.voiceModel}`);
  console.log(`   Meta Spark Model: ${config.meta.sparkModel}`);
  console.log(`   Baseten Model: ${config.baseten.modelId}`);
  console.log(`===============================================`);
});

export default app;
