import JSZip from 'jszip';

export async function generateProjectZip(): Promise<Blob> {
  const zip = new JSZip();

  // Root configuration files
  zip.file(
    'package.json',
    JSON.stringify(
      {
        name: 'aether-host',
        private: true,
        version: '1.0.0',
        type: 'module',
        scripts: {
          dev: 'vite --port=3000 --host=0.0.0.0',
          build: 'vite build',
          start: 'tsx server.ts',
          preview: 'vite preview',
        },
        dependencies: {
          '@google/genai': '^2.4.0',
          '@tailwindcss/vite': '^4.3.3',
          '@vitejs/plugin-react': '^6.1.1',
          dotenv: '^17.2.3',
          express: '^4.21.2',
          jszip: '^3.10.1',
          'lucide-react': '^0.546.0',
          motion: '^12.23.24',
          react: '^19.0.1',
          'react-dom': '^19.0.1',
          tailwindcss: '^4.3.3',
          tsx: '^4.21.0',
          typescript: '^7.0.2',
          vite: '^8.3.0',
        },
        devDependencies: {
          '@types/express': '^4.17.21',
          '@types/node': '^22.14.0',
          '@types/react': '^19.3.0',
          '@types/react-dom': '^19.3.0',
        },
      },
      null,
      2
    )
  );

  zip.file(
    'tsconfig.json',
    JSON.stringify(
      {
        compilerOptions: {
          target: 'ES2022',
          experimentalDecorators: true,
          useDefineForClassFields: false,
          module: 'ESNext',
          types: ['vite/client'],
          lib: ['ES2022', 'DOM', 'DOM.Iterable'],
          skipLibCheck: true,
          moduleResolution: 'bundler',
          isolatedModules: true,
          moduleDetection: 'force',
          allowJs: true,
          jsx: 'react-jsx',
          paths: {
            '@/*': ['./*'],
          },
          allowImportingTsExtensions: true,
          noEmit: true,
        },
      },
      null,
      2
    )
  );

  zip.file(
    'vite.config.ts',
    `import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
  };
});
`
  );

  zip.file(
    'index.html',
    `<!doctype html>
<html lang="de">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>AetherHost - Cloud & VPS Server Portal</title>
    <meta name="description" content="Modernes Cloud- & Game-Server Hosting Dashboard mit VPS-Konfigurator, 24h-Testservern und Admin-Verwaltung." />
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`
  );

  zip.file(
    'server.ts',
    `import express from 'express';
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

  app.get('/api/health', (req, res) => {
    res.json({
      status: 'online',
      app: 'AetherHost Cloud & VPS Portal',
      version: '1.2.0',
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
    });
  });

  app.post('/api/node/test-connection', (req, res) => {
    const { host, port } = req.body;
    const pingMs = Math.floor(Math.random() * 20) + 8;
    res.json({
      success: true,
      message: \`Verbindung zu \${host}:\${port || 22} hergestellt\`,
      latencyMs: pingMs,
      dockerActive: true,
      kvmSupported: true,
    });
  });

  const distPath = path.resolve(__dirname, 'dist');
  app.use(express.static(distPath));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(distPath, 'index.html'));
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(\`[AetherHost] Server läuft auf http://0.0.0.0:\${PORT}\`);
  });
}

startServer();
`
  );

  zip.file(
    'Dockerfile',
    `FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
COPY package*.json ./
RUN npm install --only=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.ts ./server.ts
EXPOSE 3000
CMD ["npx", "tsx", "server.ts"]
`
  );

  zip.file(
    'docker-compose.yml',
    `version: '3.8'

services:
  aetherhost:
    build: .
    container_name: aetherhost-panel
    restart: always
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
`
  );

  zip.file(
    'install.sh',
    `#!/usr/bin/env bash
set -e

echo "=== AetherHost - Installation auf Ubuntu / Debian ==="

if [ "$EUID" -ne 0 ]; then
  echo "[FEHLER] Bitte mit sudo ausführen: sudo bash install.sh"
  exit 1
fi

echo "[1/4] Installiere Node.js 22 LTS..."
if command -v apt-get &> /dev/null; then
  apt-get update -y
  apt-get install -y curl git ufw
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  apt-get install -y nodejs
fi

echo "[2/4] Installiere NPM Abhängigkeiten und baue Dashboard..."
cd "$(dirname "$0")"
npm install
npm run build

echo "[3/4] Richte Systemd Dienst 'aetherhost.service' ein..."
cat <<EOF > /etc/systemd/system/aetherhost.service
[Unit]
Description=AetherHost Cloud Dashboard
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=$(pwd)
ExecStart=$(which npx) tsx server.ts
Restart=always
RestartSec=5
Environment=NODE_ENV=production
Environment=PORT=3000

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable aetherhost.service
systemctl restart aetherhost.service

echo "[4/4] Öffne Firewall Port 3000..."
if command -v ufw &> /dev/null; then
  ufw allow 3000/tcp || true
fi

SERVER_IP=$(curl -s https://api.ipify.org || hostname -I | awk '{print $1}')
echo "============================================================"
echo " ERFOLG! AetherHost läuft jetzt auf: http://\${SERVER_IP}:3000"
echo "============================================================"
`
  );

  zip.file(
    'README.md',
    `# Aether-Host (https://github.com/opensmp6-creator/Aether-Host)

Modernes Cloud & VPS Server Portal.

## Installation auf Ubuntu Server:
\`\`\`bash
sudo bash install.sh
\`\`\`
`
  );

  return await zip.generateAsync({ type: 'blob' });
}
