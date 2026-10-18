import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Server,
  PlusCircle,
  Copy,
  Check,
  Terminal,
  Power,
  RotateCw,
  Search,
  Filter,
  FileCode,
  Download,
  AlertTriangle,
  Clock,
  Sparkles,
} from 'lucide-react';
import { formatCurrency, generateDockerCompose, CATEGORIES } from '../utils/categories';
import { ServerInstance, ServerCategory } from '../types';
import { ImportServerModal } from '../components/ImportServerModal';

export const MyServicesView: React.FC = () => {
  const {
    servers,
    setCurrentTab,
    powerToggleServer,
    restartServer,
    addToast,
    loadSampleData,
  } = useApp();

  const [showImportModal, setShowImportModal] = useState<boolean>(false);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeModalServer, setActiveModalServer] = useState<ServerInstance | null>(null);

  const filteredServers = servers.filter((srv) => {
    const matchesFilter = selectedFilter === 'all' || srv.category === selectedFilter;
    const matchesSearch =
      srv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      srv.ipAddress.includes(searchQuery) ||
      srv.os.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    addToast('Kopiert!', 'info');
    setTimeout(() => setCopiedId(null), 2000);
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
    addToast(`docker-compose.yml heruntergeladen!`, 'success');
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Server className="w-6 h-6 text-sky-400" />
            <span>Meine Dienste & Cloud Server</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Hier findest du alle deine gebuchten VPS, Gameserver und Testinstanzen.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
          <button
            onClick={() => setShowImportModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-xs font-bold border border-emerald-500/40 transition-all shadow-sm"
          >
            <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>Laufenden Server hinzufügen</span>
          </button>
          <button
            onClick={() => setCurrentTab('order_server')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-500/20 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Neuen Server buchen</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-[#0f172a]/80 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <button
            onClick={() => setSelectedFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              selectedFilter === 'all'
                ? 'bg-sky-500 text-white font-bold'
                : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
            }`}
          >
            Alle ({servers.length})
          </button>
          {(Object.keys(CATEGORIES) as ServerCategory[]).map((catKey) => {
            const count = servers.filter((s) => s.category === catKey).length;
            return (
              <button
                key={catKey}
                onClick={() => setSelectedFilter(catKey)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                  selectedFilter === catKey
                    ? 'bg-sky-500 text-white font-bold'
                    : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
                }`}
              >
                {CATEGORIES[catKey].name.split(' ')[0]} ({count})
              </button>
            );
          })}
        </div>

        {/* Search input */}
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Server suchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:border-sky-500 focus:outline-none placeholder:text-slate-500"
          />
        </div>
      </div>

      {/* Server List */}
      {filteredServers.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-slate-800 bg-[#0b1020]/40 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-sky-400 flex items-center justify-center mx-auto">
            <Server className="w-7 h-7" />
          </div>
          <div className="max-w-sm mx-auto space-y-1">
            <h4 className="text-base font-bold text-white">Keine Dienste gefunden</h4>
            <p className="text-xs text-slate-400">
              {servers.length === 0
                ? 'Du besitzt aktuell noch keine Server. Klicke auf "Neuen Server buchen", um sofort loszulegen.'
                : 'Keine Server entsprechen deinem aktuellen Suchfilter.'}
            </p>
          </div>
          {servers.length === 0 && (
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => setCurrentTab('order_server')}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold"
              >
                Server-Bestellung aufrufen
              </button>
              <button
                onClick={loadSampleData}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
              >
                Beispieldaten laden
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredServers.map((srv) => {
            const isSuspended = srv.status === 'suspended';

            return (
              <div
                key={srv.id}
                className={`rounded-2xl border bg-[#0f172a]/90 p-5 space-y-4 shadow-xl transition-all ${
                  isSuspended
                    ? 'border-rose-500/40 bg-[#160d16]'
                    : 'border-slate-800 hover:border-slate-700 hover:bg-[#111a31]'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm tracking-tight truncate block max-w-[180px]">
                        {srv.name}
                      </span>
                      {srv.isTestServer && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          24h Test
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-400 block font-mono">
                      {srv.os}
                    </span>
                  </div>

                  {/* Status Badge */}
                  {isSuspended ? (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      • Suspended
                    </span>
                  ) : (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      • In Betrieb
                    </span>
                  )}
                </div>

                {/* Specs Box */}
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs grid grid-cols-3 gap-2 text-center">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-semibold">RAM</span>
                    <span className="font-mono font-bold text-white">{srv.ramGb} GB</span>
                  </div>
                  <div className="border-x border-slate-800">
                    <span className="text-[10px] text-slate-400 block uppercase font-semibold">vCPU</span>
                    <span className="font-mono font-bold text-white">{srv.cpuCores} C</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-semibold">NVMe</span>
                    <span className="font-mono font-bold text-white">{srv.nvmeGb} GB</span>
                  </div>
                </div>

                {/* IP & Pricing */}
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">IP & Port:</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-sky-300 font-semibold">
                        {srv.ipAddress}:{srv.port}
                      </span>
                      <button
                        onClick={() => handleCopy(`${srv.ipAddress}:${srv.port}`, srv.id)}
                        className="text-slate-400 hover:text-white"
                      >
                        {copiedId === srv.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Monatlich:</span>
                    <span className="font-mono text-white font-bold">
                      {srv.monthlyCost === 0 ? '0,00 € (Test)' : `${srv.monthlyCost.toFixed(2)} €`}
                    </span>
                  </div>

                  {srv.isTestServer && srv.testExpiresAt && (
                    <div className="flex items-center justify-between text-amber-300 font-medium">
                      <span>Testzeit läuft ab:</span>
                      <span className="font-mono text-[11px]">{srv.testExpiresAt}</span>
                    </div>
                  )}
                </div>

                {/* Card Action Buttons */}
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setActiveModalServer(srv)}
                    className="flex-1 py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Terminal className="w-3.5 h-3.5 text-sky-400" />
                    <span>Konsole</span>
                  </button>

                  <button
                    onClick={() => handleDownloadDocker(srv)}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                    title="docker-compose.yml herunterladen"
                  >
                    <FileCode className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => restartServer(srv.id)}
                    disabled={isSuspended}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-400 hover:text-white transition-colors"
                    title="Server neu starten"
                  >
                    <RotateCw className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => powerToggleServer(srv.id)}
                    disabled={isSuspended}
                    className={`p-2 rounded-lg transition-colors disabled:opacity-30 ${
                      srv.status === 'active'
                        ? 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                    }`}
                    title={srv.status === 'active' ? 'Herunterfahren' : 'Starten'}
                  >
                    <Power className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Terminal Details Modal */}
      {activeModalServer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#0e1628] border border-slate-700 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-white">{activeModalServer.name}</h3>
                <p className="text-xs text-slate-400 font-mono">
                  ssh root@{activeModalServer.ipAddress} -p {activeModalServer.port}
                </p>
              </div>
              <button
                onClick={() => setActiveModalServer(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="bg-[#050811] border border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-300 space-y-1.5 h-48 overflow-y-auto">
              <div className="text-slate-400">--- AetherHost Cloud Console Initialized ---</div>
              <div className="text-emerald-400">[OK] Kernel initialized with 6.8.0-cloud-amd64</div>
              <div>[OK] Network bridge connected to {activeModalServer.ipAddress}</div>
              <div>[OK] Firewall rules active (Inbound TCP/UDP {activeModalServer.port})</div>
              <div>[INFO] System load: 0.12, 0.08, 0.05 | Free Memory: {activeModalServer.ramGb - 1.2} GB</div>
              <div className="text-sky-400">root@{activeModalServer.hostname}:~# _</div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-400">
                Root Passwort: <span className="font-mono text-amber-300 font-bold">{activeModalServer.rootPassword || 'Aeth#2026!'}</span>
              </span>
              <button
                onClick={() => setActiveModalServer(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
              >
                Schließen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Server Modal */}
      <ImportServerModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
      />
    </div>
  );
};
