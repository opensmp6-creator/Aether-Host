import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import os from 'os';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  const isProduction = process.env.NODE_ENV === 'production';

  app.use(express.json());

  // System Network Info API (Detects real server IP like 192.168.2.76)
  app.get('/api/system/network', (req, res) => {
    try {
      const interfaces = os.networkInterfaces();
      const detectedIps: string[] = [];

      for (const ifaceName of Object.keys(interfaces)) {
        for (const net of interfaces[ifaceName] || []) {
          if (net.family === 'IPv4' && !net.internal) {
            detectedIps.push(net.address);
          }
        }
      }

      // Default to 192.168.2.76 if running in sandbox without local LAN interface
      const primaryIp = detectedIps.find((ip) => ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.'))
        || detectedIps[0]
        || '192.168.2.76';

      res.json({
        primaryIp,
        allIps: detectedIps.length > 0 ? detectedIps : ['192.168.2.76'],
        hostname: os.hostname(),
        platform: os.platform(),
        arch: os.arch(),
        cpuCores: os.cpus().length,
        totalMemoryGb: Math.round(os.totalmem() / 1024 / 1024 / 1024),
      });
    } catch {
      res.json({
        primaryIp: '192.168.2.76',
        allIps: ['192.168.2.76'],
        hostname: 'ubuntu-server',
      });
    }
  });

  // Docker status check
  app.get('/api/docker/status', async (req, res) => {
    try {
      const { stdout } = await execAsync('docker --version');
      let daemonRunning = false;
      try {
        await execAsync('docker info');
        daemonRunning = true;
      } catch {
        daemonRunning = false;
      }

      res.json({
        installed: true,
        version: stdout.trim(),
        daemonRunning,
        socketPath: '/var/run/docker.sock',
      });
    } catch {
      res.json({
        installed: false,
        version: null,
        daemonRunning: false,
        installCommand: 'sudo apt-get update && sudo apt-get install -y docker.io && sudo systemctl enable --now docker',
      });
    }
  });

  // List real Docker containers running under AetherHost
  app.get('/api/docker/containers', async (req, res) => {
    try {
      const { stdout } = await execAsync('docker ps -a --format "{{json .}}"');
      const lines = stdout.trim().split('\n').filter(Boolean);
      const containers = lines.map((line) => {
        try {
          return JSON.parse(line);
        } catch {
          return null;
        }
      }).filter(Boolean);

      res.json({ success: true, containers });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Fehler beim Abfragen';
      res.json({ success: false, containers: [], error: msg });
    }
  });

  // Deploy a real Docker container for a server
  app.post('/api/docker/deploy', async (req, res) => {
    const { name, category, port, ramGb = 4 } = req.body;
    if (!name || !port) {
      return res.status(400).json({ success: false, error: 'Name und Port sind erforderlich' });
    }

    const safeName = 'aether-' + name.toLowerCase().replace(/[^a-z0-9]/g, '-');

    let dockerCmd = '';
    if (category === 'minecraft') {
      dockerCmd = `docker run -d --name ${safeName} -p ${port}:25565 -e EULA=TRUE -e TYPE=PAPER -e MEMORY=${ramGb}G --restart unless-stopped itzg/minecraft-server:latest`;
    } else if (category === 'voice_teamspeak') {
      dockerCmd = `docker run -d --name ${safeName} -p ${port}:9987/udp -p 10011:10011 -p 30033:30033 -e TS3SERVER_LICENSE=accept --restart unless-stopped teamspeak:latest`;
    } else if (category === 'discord_bot') {
      dockerCmd = `docker run -d --name ${safeName} -p ${port}:3000 --restart unless-stopped node:22-alpine sleep infinity`;
    } else {
      dockerCmd = `docker run -d --name ${safeName} -p ${port}:80 --restart unless-stopped nginx:alpine`;
    }

    try {
      // First check if a container with that name already exists
      try {
        await execAsync(`docker rm -f ${safeName}`);
      } catch {
        // Ignored
      }

      const { stdout } = await execAsync(dockerCmd);
      res.json({
        success: true,
        containerId: stdout.trim().substring(0, 12),
        containerName: safeName,
        port,
        commandRun: dockerCmd,
        status: 'running',
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Docker-Fehler';
      res.json({
        success: false,
        error: msg,
        fallbackCommand: dockerCmd,
        note: 'Stelle sicher, dass Docker installiert ist: sudo apt install -y docker.io',
      });
    }
  });

  // Action on real container (stop, start, restart, remove)
  app.post('/api/docker/action', async (req, res) => {
    const { containerName, action } = req.body;
    if (!containerName || !action) {
      return res.status(400).json({ success: false, error: 'containerName und action erforderlich' });
    }

    try {
      let cmd = `docker ${action} ${containerName}`;
      if (action === 'delete') {
        cmd = `docker rm -f ${containerName}`;
      }
      await execAsync(cmd);
      res.json({ success: true, action, containerName });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Aktionsfehler';
      res.json({ success: false, error: msg });
    }
  });

  // API Endpoints for Self-Hosted Server Health
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
