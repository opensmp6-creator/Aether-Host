import { ServerCategory } from '../types';

export interface CategoryInfo {
  id: ServerCategory;
  name: string;
  tagline: string;
  recommendedOs: string;
  defaultRam: number;
  defaultCpu: number;
  defaultNvme: number;
  defaultPort: number;
  iconName: string;
  accentColor: string;
  badge: string;
  supportedOsList: string[];
}

export const CATEGORIES: Record<ServerCategory, CategoryInfo> = {
  minecraft: {
    id: 'minecraft',
    name: 'Minecraft Server',
    tagline: 'Paper, Purpur, Fabric & Forge mit DDoS-Schutz',
    recommendedOs: 'Ubuntu 24.04 LTS (Java 21 LTS)',
    defaultRam: 8,
    defaultCpu: 4,
    defaultNvme: 60,
    defaultPort: 25565,
    iconName: 'Pickaxe',
    accentColor: 'from-emerald-500 to-green-600',
    badge: 'Game Cloud',
    supportedOsList: [
      'Ubuntu 24.04 LTS (Java 21 LTS)',
      'Debian 12 Bookworm',
      'Alpine Linux 3.20 (Minimal)',
    ],
  },
  linux_vps: {
    id: 'linux_vps',
    name: 'Linux Cloud VPS',
    tagline: 'Voller Root-Zugriff, KVM-Virtualisierung & NVMe SSDs',
    recommendedOs: 'Debian 12 Bookworm',
    defaultRam: 4,
    defaultCpu: 2,
    defaultNvme: 80,
    defaultPort: 22,
    iconName: 'Server',
    accentColor: 'from-sky-500 to-blue-600',
    badge: 'Root Server',
    supportedOsList: [
      'Debian 12 Bookworm',
      'Ubuntu 24.04 LTS (Java 21 LTS)',
      'Ubuntu 22.04 LTS',
      'AlmaLinux 9 Enterprise',
      'Alpine Linux 3.20 (Minimal)',
      'Windows Server 2022 Standard',
    ],
  },
  discord_bot: {
    id: 'discord_bot',
    name: 'Discord Bot Hosting',
    tagline: '24/7 Node.js, Python & Go Bot Runner ohne Ausfallzeit',
    recommendedOs: 'Alpine Linux 3.20 (Minimal)',
    defaultRam: 2,
    defaultCpu: 1,
    defaultNvme: 20,
    defaultPort: 3000,
    iconName: 'Bot',
    accentColor: 'from-indigo-500 to-violet-600',
    badge: 'App Container',
    supportedOsList: [
      'Alpine Linux 3.20 (Minimal)',
      'Debian 12 Bookworm',
      'Ubuntu 24.04 LTS (Java 21 LTS)',
    ],
  },
  fivem: {
    id: 'fivem',
    name: 'FiveM GTA V Server',
    tagline: 'Optimiert für OneSync Infinity, txAdmin & Custom Scripts',
    recommendedOs: 'Windows Server 2022 Standard',
    defaultRam: 16,
    defaultCpu: 6,
    defaultNvme: 120,
    defaultPort: 30120,
    iconName: 'Flame',
    accentColor: 'from-amber-500 to-orange-600',
    badge: 'High Perf',
    supportedOsList: [
      'Windows Server 2022 Standard',
      'Ubuntu 24.04 LTS (Java 21 LTS)',
      'Debian 12 Bookworm',
    ],
  },
  voice_teamspeak: {
    id: 'voice_teamspeak',
    name: 'Voice & TeamSpeak 3',
    tagline: 'Kristallklarer Sprachkanal mit Sinusbot Audio-Integration',
    recommendedOs: 'Debian 12 Minimal',
    defaultRam: 2,
    defaultCpu: 1,
    defaultNvme: 25,
    defaultPort: 9987,
    iconName: 'Headphones',
    accentColor: 'from-cyan-500 to-teal-600',
    badge: 'Low Latency',
    supportedOsList: [
      'Debian 12 Minimal',
      'Ubuntu 24.04 LTS (Java 21 LTS)',
      'Alpine Linux 3.20 (Minimal)',
    ],
  },
};

export const ALL_OS_OPTIONS = [
  'Debian 12 Bookworm',
  'Ubuntu 24.04 LTS (Java 21 LTS)',
  'Ubuntu 22.04 LTS',
  'Windows Server 2022 Standard',
  'Alpine Linux 3.20 (Minimal)',
  'AlmaLinux 9 Enterprise',
  'Debian 12 Minimal',
];

export const LOCATIONS = [
  { id: 'fra', name: 'Frankfurt am Main (DE)', flag: '🇩🇪', ping: '12 ms', ddos: '1.2 Tbps Arbor Protect' },
  { id: 'ams', name: 'Amsterdam (NL)', flag: '🇳🇱', ping: '18 ms', ddos: '1.0 Tbps Voxility' },
  { id: 'hel', name: 'Helsinki (FI)', flag: '🇫🇮', ping: '26 ms', ddos: '800 Gbps Corero' },
];

/**
 * Calculates monthly price in EUR
 */
export function calculateMonthlyPrice(ramGb: number, cpuCores: number, nvmeGb: number): number {
  const base = 2.0;
  const ramCost = ramGb * 0.75;
  const cpuCost = cpuCores * 1.5;
  const nvmeCost = nvmeGb * 0.03;
  return Number((base + ramCost + cpuCost + nvmeCost).toFixed(2));
}

/**
 * Formats EUR currency cleanly
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  }).format(amount);
}

/**
 * Generates a realistic random IP address in customer subnet
 */
export function generateIpAddress(): string {
  const segment3 = Math.floor(Math.random() * 200) + 20;
  const segment4 = Math.floor(Math.random() * 250) + 2;
  return `45.132.${segment3}.${segment4}`;
}

/**
 * Generates a random secure root password
 */
export function generateRandomPassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%';
  let pwd = '';
  for (let i = 0; i < 14; i++) {
    pwd += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pwd;
}

/**
 * Generates exportable docker-compose.yml configuration
 */
export function generateDockerCompose(config: {
  name: string;
  category: ServerCategory;
  ramGb: number;
  cpuCores: number;
  port: number;
}): string {
  const safeName = config.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
  
  if (config.category === 'minecraft') {
    return `version: '3.8'

services:
  ${safeName}:
    image: itzg/minecraft-server:latest
    container_name: ${safeName}
    restart: unless-stopped
    ports:
      - "${config.port}:25565"
    environment:
      EULA: "TRUE"
      TYPE: "PAPER"
      VERSION: "LATEST"
      MEMORY: "${config.ramGb}G"
      SERVER_NAME: "${config.name}"
    volumes:
      - ./${safeName}-data:/data
    deploy:
      resources:
        limits:
          cpus: '${config.cpuCores}'
          memory: ${config.ramGb}G
`;
  }

  if (config.category === 'discord_bot') {
    return `version: '3.8'

services:
  ${safeName}:
    image: node:22-alpine
    container_name: ${safeName}
    restart: always
    working_dir: /app
    volumes:
      - ./:/app
    command: npm start
    environment:
      NODE_ENV: production
      PORT: ${config.port}
    deploy:
      resources:
        limits:
          cpus: '${config.cpuCores}'
          memory: ${config.ramGb}G
`;
  }

  if (config.category === 'voice_teamspeak') {
    return `version: '3.8'

services:
  ${safeName}:
    image: teamspeak:latest
    container_name: ${safeName}
    restart: unless-stopped
    ports:
      - "${config.port}:9987/udp"
      - "10011:10011"
      - "30033:30033"
    environment:
      TS3SERVER_LICENSE: accept
    volumes:
      - ./${safeName}-data:/var/ts3server
    deploy:
      resources:
        limits:
          cpus: '${config.cpuCores}'
          memory: ${config.ramGb}G
`;
  }

  return `version: '3.8'

services:
  ${safeName}:
    image: debian:12-slim
    container_name: ${safeName}
    restart: unless-stopped
    ports:
      - "${config.port}:22"
    environment:
      TZ: Europe/Berlin
    volumes:
      - ./${safeName}-root:/root
    deploy:
      resources:
        limits:
          cpus: '${config.cpuCores}'
          memory: ${config.ramGb}G
`;
}

/**
 * Calculates the next free unique port for a given category
 */
export function getNextAvailablePort(
  category: ServerCategory,
  usedPorts: number[]
): number {
  let port = CATEGORIES[category]?.defaultPort || 25565;
  while (usedPorts.includes(port)) {
    port += 1;
  }
  return port;
}
