import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  const isProduction = process.env.NODE_ENV === 'production';

  app.use(express.json());

  // API Endpoints for Self-Hosted Server
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'online',
      app: 'AetherHost Cloud & VPS Portal',
      version: '1.2.0',
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
      nodeVersion: process.version,
      platform: process.platform,
      memoryUsage: process.memoryUsage(),
    });
  });

  // Simulated Node Agent / Docker Socket Ping
  app.post('/api/node/test-connection', (req, res) => {
    const { host, port } = req.body;
    if (!host) {
      return res.status(400).json({ success: false, error: 'Host IP fehlt' });
    }
    // Simulate ping latency
    const pingMs = Math.floor(Math.random() * 20) + 8;
    return res.json({
      success: true,
      message: `Verbindung zu ${host}:${port || 22} erfolgreich hergestellt`,
      latencyMs: pingMs,
      dockerActive: true,
      kvmSupported: true,
      checkedAt: new Date().toISOString(),
    });
  });

  if (isProduction) {
    // Serve static files from Vite build output
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));

    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  } else {
    // In development mode, mount Vite in middleware mode
    try {
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
    } catch (err) {
      console.warn('Vite middleware could not be loaded in standard runner, serving fallback:', err);
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[AetherHost] Server läuft erfolgreich auf http://0.0.0.0:${PORT}`);
  });
}

startServer();
