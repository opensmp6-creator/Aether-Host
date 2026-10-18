import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Server,
  Wallet,
  Activity,
  CreditCard,
  PlusCircle,
  ExternalLink,
  MessageSquare,
  AlertCircle,
  Terminal,
  Power,
  RotateCw,
  FileCode,
  Download,
  Copy,
  Check,
  ShieldAlert,
  Cpu,
  HardDrive,
  Layers,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { formatCurrency, generateDockerCompose } from '../utils/categories';
import { ServerInstance } from '../types';
import { ImportServerModal } from '../components/ImportServerModal';

export const DashboardView: React.FC = () => {
  const {
    servers,
    balance,
    transactions,
    setCurrentTab,
    powerToggleServer,
    restartServer,
    addToast,
    loadSampleData,
  } = useApp();

  const [showImportModal, setShowImportModal] = useState<boolean>(false);
  const [selectedServer, setSelectedServer] = useState<ServerInstance | null>(null);
  const [copiedIp, setCopiedIp] = useState<string | null>(null);
  const [consoleLogs, setConsoleLogs] = useState<string[]>([
    '[systemd] Starting AetherHost Virtual Machine instance...',
    '[systemd] Reached target Network (Pre-Initialization).',
    '[systemd] Mounted NVMe root file system on /dev/nvme0n1p1.',
    '[cloud-init] Setting up SSH host keys and security profiles.',
    '[network] DHCP ACK received: Interface eth0 assigned.',
    '[systemd] Started OpenSSH Server Daemon on port 22.',
    '[aether-agent] Heartbeat active. Telemetry healthy. 0 packets dropped.',
  ]);

  const activeServersCount = servers.filter((s) => s.status === 'active').length;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIp(id);
    addToast('In die Zwischenablage kopiert!', 'info');
    setTimeout(() => setCopiedIp(null), 2000);
  };

  const handleDownloadDocker = (srv: ServerInstance) => {
    const content = generateDockerCompose({
      name: srv.name,
      category: srv.category,
      ramGb: srv.ramGb,
      cpuCores: srv.cpuCores,
      port: srv.port,
    });
    const blob = new Blob([content], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `docker-compose-${srv.id}.yml`;
    a.click();
    URL.revokeObjectURL(url);
    addToast(`docker-compose.yml für "${srv.name}" heruntergeladen!`, 'success');
  };

  const handleDownloadJson = (srv: ServerInstance) => {
    const blob = new Blob([JSON.stringify(srv, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `server-config-${srv.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addToast(`Konfiguration als .json heruntergeladen!`, 'success');
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* 4 Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Anzahl der Dienste */}
        <div className="bg-[#0f172a]/80 backdrop-blur border border-slate-800 hover:border-slate-700/80 rounded-2xl p-5 shadow-lg shadow-black/20 flex flex-col justify-between transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 tracking-wide uppercase">
              Anzahl der Dienste
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-sky-400 group-hover:scale-110 transition-transform">
              <Server className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-white tracking-tight font-mono">
              {servers.length}
            </div>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
              <span>Instanzen gesamt</span>
            </p>
          </div>
        </div>

        {/* Card 2: Guthaben */}
        <div className="bg-[#0f172a]/80 backdrop-blur border border-slate-800 hover:border-slate-700/80 rounded-2xl p-5 shadow-lg shadow-black/20 flex flex-col justify-between transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 tracking-wide uppercase">
              Guthaben
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-emerald-400 tracking-tight font-mono">
              {formatCurrency(balance)}
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs text-slate-400">Verfügbarer Betrag</span>
              <button
                onClick={() => setCurrentTab('balance')}
                className="text-xs text-sky-400 hover:text-sky-300 font-semibold"
              >
                + Aufladen
              </button>
            </div>
          </div>
        </div>

        {/* Card 3: Aktive Dienste */}
        <div className="bg-[#0f172a]/80 backdrop-blur border border-slate-800 hover:border-slate-700/80 rounded-2xl p-5 shadow-lg shadow-black/20 flex flex-col justify-between transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 tracking-wide uppercase">
              Aktive Dienste
            </span>
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 group-hover:scale-110 transition-transform">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-white tracking-tight font-mono flex items-baseline gap-2">
              <span>{activeServersCount}</span>
              <span className="text-xs font-normal text-slate-500">/ {servers.length}</span>
            </div>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400" />
              <span>In Betrieb & erreichbar</span>
            </p>
          </div>
        </div>

        {/* Card 4: Zahlungen */}
        <div className="bg-[#0f172a]/80 backdrop-blur border border-slate-800 hover:border-slate-700/80 rounded-2xl p-5 shadow-lg shadow-black/20 flex flex-col justify-between transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 tracking-wide uppercase">
              Zahlungen
            </span>
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-white tracking-tight font-mono">
              {transactions.length}
            </div>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
              <span>Getätigte Transaktionen</span>
            </p>
          </div>
        </div>
      </div>

      {/* 2 Info-Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Banner 1: Neuen Service bestellen */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-900/40 via-[#0e1b38] to-[#0a1226] border border-blue-500/30 p-6 flex flex-col justify-between shadow-xl">
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="space-y-2 relative z-10">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-sky-300 text-xs font-medium">
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              <span>High-End Cloud Instanzen</span>
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              Neuen Service konfigurieren & bestellen
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed max-w-md">
              Stelle deinen Minecraft-Server, Linux VPS, Discord-Bot oder FiveM-Server in Sekunden bereit. Flexible Hardware-Schieberegler und sofortige Aktivierung.
            </p>
          </div>

          <div className="mt-5 flex items-center gap-3 relative z-10">
            <button
              onClick={() => setCurrentTab('order_server')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-lg shadow-blue-600/30"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Jetzt konfigurieren</span>
            </button>
            <button
              onClick={() => setCurrentTab('order_server')}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 text-xs font-medium border border-slate-700/60"
            >
              <span>24h-Test anfragen</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Banner 2: Support & Discord-Bereich */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#121c33]/80 via-[#0f172a] to-[#0a0f1d] border border-slate-800 p-6 flex flex-col justify-between shadow-xl">
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="space-y-2 relative z-10">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-medium">
              <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
              <span>24/7 Community & Support</span>
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              Support & Discord Community
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed max-w-md">
              Benötigst du Hilfe bei Portfreigaben, txAdmin oder Minecraft Plugins? Unser deutsches Support-Team hilft dir im Ticketbereich oder direkt auf Discord weiter.
            </p>
          </div>

          <div className="mt-5 flex items-center gap-3 relative z-10">
            <button
              onClick={() => setCurrentTab('tickets')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-bold transition-all border border-slate-700"
            >
              <MessageSquare className="w-4 h-4 text-sky-400" />
              <span>Ticketbereich öffnen</span>
            </button>
            <a
              href="https://discord.com"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#5865F2]/20 hover:bg-[#5865F2]/30 text-indigo-200 text-xs font-medium border border-[#5865F2]/40 transition-colors"
            >
              <span>Discord beitreten</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* VPS-Serverliste */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <Server className="w-5 h-5 text-sky-400" />
              <span>VPS & Instanzen Übersicht</span>
            </h2>
            <p className="text-xs text-slate-400">
              Live-Status, Netzwerkadressen und Systemauslastung deiner Server
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
            <button
              onClick={() => setShowImportModal(true)}
              className="inline-flex items-center gap-1.5 text-xs text-emerald-300 hover:text-white px-3 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-500/40 hover:bg-emerald-900/50 transition-colors shadow-sm"
            >
              <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>Laufenden Server hinzufügen</span>
            </button>

            {servers.length === 0 && (
              <button
                onClick={loadSampleData}
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Beispieldaten für Test laden</span>
              </button>
            )}
          </div>
        </div>

        {/* Leerer Startzustand Hinweis zur Bestellung */}
        {servers.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-800 bg-[#0b1020]/50 p-10 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-sky-400 flex items-center justify-center mx-auto shadow-inner">
              <Server className="w-8 h-8 opacity-80" />
            </div>
            <div className="max-w-md mx-auto space-y-1.5">
              <h4 className="text-base font-bold text-white">Keine aktiven Server vorhanden</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Du hast aktuell noch keinen Server gemietet. Konfiguriere jetzt deine gewünschte Instanz oder binde deinen bereits laufenden Heimserver (z. B. 192.168.2.76) direkt ein.
              </p>
            </div>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => setShowImportModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Laufenden Server einbinden</span>
              </button>
              <button
                onClick={() => setCurrentTab('order_server')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition-all"
              >
                <Server className="w-4 h-4" />
                <span>Neuen Server bestellen</span>
              </button>
              <button
                onClick={() => setCurrentTab('order_server')}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all"
              >
                <span>24h-Testserver beantragen</span>
              </button>
            </div>
          </div>
        ) : (
          /* Live Server Table & Cards */
          <div className="grid grid-cols-1 gap-3.5">
            {servers.map((srv) => {
              const isSuspended = srv.status === 'suspended';
              const isStopping = srv.status === 'stopping';
              const isRestarting = srv.status === 'restarting';

              return (
                <div
                  key={srv.id}
                  className={`rounded-2xl bg-[#0f172a]/90 border transition-all duration-200 p-5 shadow-lg ${
                    isSuspended
                      ? 'border-rose-500/40 bg-[#160e15]/90'
                      : 'border-slate-800 hover:border-slate-700/80 hover:bg-[#111a31]/90'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Left: Server Name, Category, OS & Badges */}
                    <div className="space-y-1.5 min-w-[240px]">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="text-sm font-bold text-white tracking-tight">
                          {srv.name}
                        </span>

                        {/* Status Badge: • In Betrieb oder • Suspended */}
                        {isSuspended ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                            • Suspended (Gesperrt)
                          </span>
                        ) : isRestarting ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse">
                            <RotateCw className="w-3 h-3 animate-spin" />
                            • Startet neu...
                          </span>
                        ) : isStopping ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-500/20 text-slate-300 border border-slate-500/30">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                            • Gestoppt
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            • In Betrieb
                          </span>
                        )}

                        {srv.isTestServer && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                            24h Test
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-slate-400 flex items-center gap-2 flex-wrap">
                        <span className="text-slate-300 font-medium">{srv.os}</span>
                        <span>•</span>
                        <span>{srv.location}</span>
                        <span>•</span>
                        <span className="font-mono text-slate-400 text-[11px]">ID: {srv.id}</span>
                      </div>
                    </div>

                    {/* Middle: Hardware Specs */}
                    <div className="grid grid-cols-3 gap-3 py-2 px-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">RAM</span>
                        <span className="font-bold text-white font-mono">{srv.ramGb} GB DDR5</span>
                      </div>
                      <div className="flex flex-col border-l border-slate-800 pl-3">
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">vCPU</span>
                        <span className="font-bold text-white font-mono">{srv.cpuCores} Kerne</span>
                      </div>
                      <div className="flex flex-col border-l border-slate-800 pl-3">
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">NVMe</span>
                        <span className="font-bold text-white font-mono">{srv.nvmeGb} GB</span>
                      </div>
                    </div>

                    {/* Right: IP, Monthly Cost, Actions */}
                    <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-3">
                      <div className="text-left lg:text-right">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-semibold text-sky-300 bg-sky-950/60 border border-sky-800/40 px-2 py-0.5 rounded">
                            {srv.ipAddress}:{srv.port}
                          </span>
                          <button
                            onClick={() => handleCopy(`${srv.ipAddress}:${srv.port}`, srv.id)}
                            className="text-slate-400 hover:text-white p-1 rounded bg-slate-800/80 transition-colors"
                            title="IP & Port kopieren"
                          >
                            {copiedIp === srv.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                        <div className="text-xs text-slate-400 mt-1">
                          Kosten:{' '}
                          <span className="text-white font-bold font-mono">
                            {srv.monthlyCost === 0 ? '0,00 € (Test)' : `${srv.monthlyCost.toFixed(2)} € / Monat`}
                          </span>
                        </div>
                      </div>

                      {/* Quick Action Buttons */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          onClick={() => setSelectedServer(srv)}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 flex items-center gap-1.5 transition-colors"
                        >
                          <Terminal className="w-3.5 h-3.5 text-sky-400" />
                          <span>Details & Konsole</span>
                        </button>

                        <button
                          onClick={() => restartServer(srv.id)}
                          disabled={isSuspended}
                          className={`p-1.5 rounded-lg border text-xs transition-colors ${
                            isSuspended
                              ? 'opacity-40 cursor-not-allowed bg-slate-800/50 border-slate-800 text-slate-500'
                              : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300 hover:text-white'
                          }`}
                          title="Neustart"
                        >
                          <RotateCw className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => powerToggleServer(srv.id)}
                          disabled={isSuspended}
                          className={`p-1.5 rounded-lg border text-xs transition-colors ${
                            isSuspended
                              ? 'opacity-40 cursor-not-allowed bg-slate-800/50 border-slate-800 text-slate-500'
                              : srv.status === 'active'
                              ? 'bg-rose-500/15 hover:bg-rose-500/25 border-rose-500/30 text-rose-300'
                              : 'bg-emerald-500/15 hover:bg-emerald-500/25 border-emerald-500/30 text-emerald-300'
                          }`}
                          title={srv.status === 'active' ? 'Herunterfahren' : 'Starten'}
                        >
                          <Power className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Server Details & Console Modal */}
      {selectedServer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#0e1628] border border-slate-700/80 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 bg-[#0a0f1d] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 text-sky-400 flex items-center justify-center">
                  <Server className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    {selectedServer.name}
                    {selectedServer.status === 'suspended' ? (
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        Suspended
                      </span>
                    ) : (
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        In Betrieb
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    Host: {selectedServer.hostname} • {selectedServer.os}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedServer(null)}
                className="text-slate-400 hover:text-white p-2 rounded-lg bg-slate-800/80"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {/* Credentials & Access Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
                  <span className="text-[11px] text-slate-400 uppercase font-semibold">IP & SSH Port</span>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm font-bold text-sky-300">
                      ssh root@{selectedServer.ipAddress} -p {selectedServer.port}
                    </span>
                    <button
                      onClick={() => handleCopy(`ssh root@${selectedServer.ipAddress} -p ${selectedServer.port}`, 'ssh')}
                      className="text-slate-400 hover:text-white"
                      title="SSH Befehl kopieren"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
                  <span className="text-[11px] text-slate-400 uppercase font-semibold">Root Passwort</span>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm font-bold text-amber-300">
                      {selectedServer.rootPassword || 'Aeth#Pass2026!'}
                    </span>
                    <button
                      onClick={() => handleCopy(selectedServer.rootPassword || 'Aeth#Pass2026!', 'pwd')}
                      className="text-slate-400 hover:text-white"
                      title="Passwort kopieren"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Live Web Console simulation */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Terminal className="w-4 h-4 text-emerald-400" />
                    Live Web-Terminal & System-Logs
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">TTY /dev/pts/0</span>
                </div>
                <div className="bg-[#050811] border border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-300 space-y-1 h-44 overflow-y-auto">
                  {consoleLogs.map((log, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="text-emerald-500 font-bold">$</span>
                      <span className="leading-relaxed">{log}</span>
                    </div>
                  ))}
                  <div className="flex items-center gap-2 pt-1 text-sky-400">
                    <span className="animate-pulse">root@{selectedServer.hostname}:~#</span>
                    <span className="w-2 h-4 bg-sky-400 animate-pulse inline-block" />
                  </div>
                </div>
              </div>

              {/* Export Downloads: JSON & Docker-Compose as required in spec */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      Konfigurations-Export
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Lade die Server-Spezifikationen als .json oder als docker-compose.yml herunter
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleDownloadJson(selectedServer)}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 text-sky-400" />
                    <span>Als config.json herunterladen</span>
                  </button>
                  <button
                    onClick={() => handleDownloadDocker(selectedServer)}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-sky-300 text-xs font-semibold border border-blue-500/40 transition-colors"
                  >
                    <FileCode className="w-3.5 h-3.5 text-sky-400" />
                    <span>Als docker-compose.yml herunterladen</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 bg-[#0a0f1d] flex items-center justify-between">
              <div className="text-xs text-slate-400">
                Uptime: <span className="text-white font-mono">{selectedServer.uptimeHours} Stunden</span>
              </div>
              <button
                onClick={() => setSelectedServer(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
              >
                Schließen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Existing Server Modal */}
      <ImportServerModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
      />
    </div>
  );
};
