import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ServerCategory, PaymentMethod } from '../types';
import {
  CATEGORIES,
  ALL_OS_OPTIONS,
  LOCATIONS,
  calculateMonthlyPrice,
  formatCurrency,
  generateDockerCompose,
} from '../utils/categories';
import {
  Server,
  Cpu,
  HardDrive,
  Sliders,
  Check,
  ShieldCheck,
  Download,
  FileCode,
  CreditCard,
  Sparkles,
  Zap,
  Globe,
  Clock,
  Send,
  HelpCircle,
  AlertCircle,
  Flame,
  Bot,
  Headphones,
  Pickaxe,
  Wallet,
} from 'lucide-react';

export const OrderConfiguratorView: React.FC = () => {
  const {
    orderServer,
    requestTestServer,
    balance,
    teamCanManageTestServers,
    setCurrentTab,
    addToast,
  } = useApp();

  // Configurator state
  const [selectedCategory, setSelectedCategory] = useState<ServerCategory>('linux_vps');
  const [serverName, setServerName] = useState<string>('');
  const [selectedOs, setSelectedOs] = useState<string>(CATEGORIES.linux_vps.recommendedOs);
  const [ramGb, setRamGb] = useState<number>(CATEGORIES.linux_vps.defaultRam);
  const [cpuCores, setCpuCores] = useState<number>(CATEGORIES.linux_vps.defaultCpu);
  const [nvmeGb, setNvmeGb] = useState<number>(CATEGORIES.linux_vps.defaultNvme);
  const [selectedLocation, setSelectedLocation] = useState<string>(LOCATIONS[0].name);

  // Modals & Progress
  const [showCheckoutModal, setShowCheckoutModal] = useState<boolean>(false);
  const [showTestServerModal, setShowTestServerModal] = useState<boolean>(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('paypal');
  const [isDeploying, setIsDeploying] = useState<boolean>(false);
  const [deployStep, setDeployStep] = useState<string>('');

  // Test Server form state
  const [testForm, setTestForm] = useState({
    userName: '',
    userEmail: '',
    purpose: '',
  });

  // When category changes, automatically update the recommended OS and suggested specs
  const handleCategoryChange = (cat: ServerCategory) => {
    setSelectedCategory(cat);
    const catConfig = CATEGORIES[cat];
    // Automatische Betriebssystem-Zuweisung gemäß Anforderung
    setSelectedOs(catConfig.recommendedOs);
    setRamGb(catConfig.defaultRam);
    setCpuCores(catConfig.defaultCpu);
    setNvmeGb(catConfig.defaultNvme);
  };

  const monthlyPrice = calculateMonthlyPrice(ramGb, cpuCores, nvmeGb);
  const hourlyPrice = (monthlyPrice / 730).toFixed(4);

  // Download export as JSON
  const handleExportJson = () => {
    const configData = {
      name: serverName || `${CATEGORIES[selectedCategory].name} Instanz`,
      category: selectedCategory,
      os: selectedOs,
      specs: {
        ramGb,
        cpuCores,
        nvmeGb,
      },
      location: selectedLocation,
      monthlyCost: monthlyPrice,
      exportedAt: new Date().toISOString(),
      provider: 'AetherHost Cloud Services',
    };

    const blob = new Blob([JSON.stringify(configData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `server-spec-${selectedCategory}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('Konfiguration als .json exportiert!', 'success');
  };

  // Download export as docker-compose.yml
  const handleExportDocker = () => {
    const composeContent = generateDockerCompose({
      name: serverName || selectedCategory,
      category: selectedCategory,
      ramGb,
      cpuCores,
      port: CATEGORIES[selectedCategory].defaultPort,
    });

    const blob = new Blob([composeContent], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `docker-compose-${selectedCategory}.yml`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('docker-compose.yml erfolgreich exportiert!', 'success');
  };

  // Confirm Purchase & Instant Provisioning Simulation
  const handleConfirmOrder = async () => {
    setIsDeploying(true);
    setDeployStep('Prüfe Zahlungsautorisierung...');

    await new Promise((r) => setTimeout(r, 600));
    setDeployStep('Allokiere KVM Virtualisierung & RAM...');

    await new Promise((r) => setTimeout(r, 700));
    setDeployStep(`Installiere ${selectedOs} auf NVMe SSD...`);

    await new Promise((r) => setTimeout(r, 800));
    setDeployStep('Weise öffentliche IPv4-Adresse & DDoS-Profile zu...');

    await new Promise((r) => setTimeout(r, 500));

    const result = await orderServer({
      name: serverName,
      category: selectedCategory,
      os: selectedOs,
      ramGb,
      cpuCores,
      nvmeGb,
      location: selectedLocation,
      paymentMethod: selectedPaymentMethod,
    });

    setIsDeploying(false);
    setShowCheckoutModal(false);

    if (result.success) {
      setCurrentTab('dashboard');
    }
  };

  // Submit 24h Test Server Request
  const handleSubmitTestRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testForm.userName || !testForm.userEmail || !testForm.purpose) {
      addToast('Bitte fülle alle Pflichtfelder aus.', 'error');
      return;
    }

    requestTestServer({
      userName: testForm.userName,
      userEmail: testForm.userEmail,
      category: selectedCategory,
      preferredOs: selectedOs,
      purpose: testForm.purpose,
    });

    setShowTestServerModal(false);
    setTestForm({ userName: '', userEmail: '', purpose: '' });
  };

  const getCategoryIcon = (catId: ServerCategory) => {
    switch (catId) {
      case 'minecraft':
        return <Pickaxe className="w-5 h-5" />;
      case 'linux_vps':
        return <Server className="w-5 h-5" />;
      case 'discord_bot':
        return <Bot className="w-5 h-5" />;
      case 'fivem':
        return <Flame className="w-5 h-5" />;
      case 'voice_teamspeak':
        return <Headphones className="w-5 h-5" />;
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Sliders className="w-6 h-6 text-sky-400" />
            <span>Server-Bestellung & Hardware-Konfigurator</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Wähle deine Server-Kategorie, passe Hardwareressourcen live an und starte deine Instanz sofort.
          </p>
        </div>

        {/* 24h Test Server Request Button */}
        <button
          onClick={() => setShowTestServerModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 text-xs font-bold transition-all shadow-lg shadow-amber-500/10 self-start sm:self-auto"
        >
          <Clock className="w-4 h-4 text-amber-400" />
          <span>Kostenlosen 24h-Testserver anfordern</span>
        </button>
      </div>

      {/* Step 1: Kategorien-Auswahl */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">1</span>
            Kategorie auswählen
          </label>
          <span className="text-xs text-slate-400">Automatische OS-Vorauswahl inklusive</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {(Object.keys(CATEGORIES) as ServerCategory[]).map((catKey) => {
            const cat = CATEGORIES[catKey];
            const isSelected = selectedCategory === catKey;

            return (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(catKey)}
                className={`text-left p-4 rounded-2xl border transition-all duration-150 flex flex-col justify-between relative group ${
                  isSelected
                    ? 'border-sky-500 bg-sky-950/40 shadow-lg shadow-sky-500/15 ring-1 ring-sky-500/40'
                    : 'border-slate-800 bg-[#0f172a]/70 hover:border-slate-700 hover:bg-[#111a31]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 ${
                        isSelected
                          ? 'bg-sky-500 text-white shadow-md shadow-sky-500/30'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {getCategoryIcon(catKey)}
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isSelected
                          ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {cat.badge}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white tracking-tight">{cat.name}</h3>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {cat.tagline}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Empfohlen:</span>
                  <span className="text-sky-300 font-medium truncate max-w-[110px]" title={cat.recommendedOs}>
                    {cat.recommendedOs.split(' ')[0]}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid: Configurator Controls (Left) & Price Summary / Export (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Sliders & Options */}
        <div className="lg:col-span-2 space-y-6">
          {/* Server Name & Location */}
          <div className="p-6 rounded-2xl bg-[#0f172a]/80 border border-slate-800 space-y-5">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">2</span>
              Instanzname & Standort
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Server-Name / Hostname (optional)
                </label>
                <input
                  type="text"
                  placeholder={`z. B. Mein-${CATEGORIES[selectedCategory].name.replace(' ', '-')}`}
                  value={serverName}
                  onChange={(e) => setServerName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-sky-500 focus:outline-none text-white text-xs placeholder:text-slate-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Rechenzentrum-Standort
                </label>
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-sky-500 focus:outline-none text-white text-xs"
                >
                  {LOCATIONS.map((loc) => (
                    <option key={loc.id} value={loc.name}>
                      {loc.flag} {loc.name} (Ping ~{loc.ping})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Automatisches Betriebssystem & Manueller Override */}
          <div className="p-6 rounded-2xl bg-[#0f172a]/80 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">3</span>
                Betriebssystem (Automatisch vorausgewählt)
              </h3>
              <span className="text-[11px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Empfohlen für {CATEGORIES[selectedCategory].name}
              </span>
            </div>

            <p className="text-xs text-slate-400">
              Passend zu deiner Kategorie haben wir <span className="text-white font-semibold">{CATEGORIES[selectedCategory].recommendedOs}</span> vorselektiert. Du kannst dies jederzeit manuell ändern:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              {ALL_OS_OPTIONS.map((osOption) => {
                const isSelected = selectedOs === osOption;
                const isRecommended = CATEGORIES[selectedCategory].recommendedOs === osOption;

                return (
                  <button
                    key={osOption}
                    onClick={() => setSelectedOs(osOption)}
                    className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                      isSelected
                        ? 'border-sky-500 bg-sky-950/40 text-white ring-1 ring-sky-500/30'
                        : 'border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                          isSelected ? 'border-sky-400 bg-sky-500' : 'border-slate-600'
                        }`}
                      >
                        {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                      <span className="text-xs font-medium truncate">{osOption}</span>
                    </div>

                    {isRecommended && (
                      <span className="text-[10px] uppercase font-bold text-sky-400 bg-sky-500/10 px-1.5 py-0.5 rounded border border-sky-500/20 shrink-0">
                        Auto
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Hardware-Schieberegler (RAM, CPU, NVMe) */}
          <div className="p-6 rounded-2xl bg-[#0f172a]/80 border border-slate-800 space-y-6">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">4</span>
              Hardware-Schieberegler (Live-Ressourcen)
            </h3>

            {/* Slider 1: RAM */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-sky-400" />
                  Arbeitsspeicher (RAM)
                </span>
                <span className="font-mono text-sm font-extrabold text-sky-400 bg-sky-500/10 px-2.5 py-0.5 rounded-lg border border-sky-500/20">
                  {ramGb} GB DDR5 ECC
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="64"
                step="1"
                value={ramGb}
                onChange={(e) => setRamGb(Number(e.target.value))}
                className="w-full accent-sky-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>1 GB</span>
                <span>8 GB (Std)</span>
                <span>16 GB</span>
                <span>32 GB</span>
                <span>64 GB</span>
              </div>
            </div>

            {/* Slider 2: CPU Cores */}
            <div className="space-y-2 pt-2 border-t border-slate-800/80">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300 flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-indigo-400" />
                  Prozessorkerne (vCPU)
                </span>
                <span className="font-mono text-sm font-extrabold text-indigo-300 bg-indigo-500/10 px-2.5 py-0.5 rounded-lg border border-indigo-500/20">
                  {cpuCores} {cpuCores === 1 ? 'vCPU Kern' : 'vCPU Kerne'} (AMD EPYC™)
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="16"
                step="1"
                value={cpuCores}
                onChange={(e) => setCpuCores(Number(e.target.value))}
                className="w-full accent-indigo-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>1 vCPU</span>
                <span>2 Kerne</span>
                <span>4 Kerne</span>
                <span>8 Kerne</span>
                <span>16 Kerne</span>
              </div>
            </div>

            {/* Slider 3: NVMe Speicher */}
            <div className="space-y-2 pt-2 border-t border-slate-800/80">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300 flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-emerald-400" />
                  NVMe SSD Speicher
                </span>
                <span className="font-mono text-sm font-extrabold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-lg border border-emerald-500/20">
                  {nvmeGb} GB Gen4 NVMe
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="500"
                step="10"
                value={nvmeGb}
                onChange={(e) => setNvmeGb(Number(e.target.value))}
                className="w-full accent-emerald-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>10 GB</span>
                <span>50 GB</span>
                <span>120 GB</span>
                <span>250 GB</span>
                <span>500 GB</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Live Pricing, Checkout Button & Export Options */}
        <div className="space-y-5">
          {/* Summary Box */}
          <div className="rounded-2xl bg-gradient-to-b from-[#111c38] to-[#0c1326] border border-blue-500/40 p-6 shadow-2xl space-y-6 sticky top-24">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-sky-400">
                Konfigurations-Übersicht
              </span>
              <h3 className="text-lg font-bold text-white mt-1">
                {CATEGORIES[selectedCategory].name}
              </h3>
              <p className="text-xs text-slate-400">{selectedOs}</p>
            </div>

            {/* Hardware Quick Summary */}
            <div className="space-y-2.5 py-3 border-y border-slate-800 text-xs text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Arbeitsspeicher:</span>
                <span className="font-mono font-bold text-white">{ramGb} GB RAM</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Prozessor:</span>
                <span className="font-mono font-bold text-white">{cpuCores} vCPU Kerne</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">NVMe Speicher:</span>
                <span className="font-mono font-bold text-white">{nvmeGb} GB NVMe</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Rechenzentrum:</span>
                <span className="text-slate-200">{selectedLocation}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">DDoS-Schutz:</span>
                <span className="text-emerald-400 font-semibold">Inklusive (Permanent)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Traffic:</span>
                <span className="text-emerald-400 font-semibold">Unbegrenzt (Fair-Use)</span>
              </div>
            </div>

            {/* Price Display */}
            <div>
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-slate-400">Monatlicher Preis:</span>
                <div className="text-right">
                  <div className="text-3xl font-extrabold text-white font-mono tracking-tight text-sky-400">
                    {formatCurrency(monthlyPrice)}
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">
                    ~{hourlyPrice} € / Stunde
                  </span>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Keine Einrichtungsgebühr. Jederzeit kündbar oder skalierbar.
              </p>
            </div>

            {/* Checkout Action */}
            <div className="space-y-3">
              <button
                onClick={() => setShowCheckoutModal(true)}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2"
              >
                <CreditCard className="w-4 h-4" />
                <span>Zur Kasse & Server starten</span>
              </button>

              <button
                onClick={() => setShowTestServerModal(true)}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 text-xs font-semibold border border-amber-500/30 transition-all flex items-center justify-center gap-2"
              >
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Als 24h-Testserver anfordern</span>
              </button>
            </div>

            {/* Required Download / Export Features */}
            <div className="pt-4 border-t border-slate-800/80 space-y-2">
              <span className="text-[11px] uppercase font-semibold text-slate-400 block">
                Konfiguration herunterladen
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleExportJson}
                  className="p-2 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                  title="Als .json herunterladen"
                >
                  <Download className="w-3.5 h-3.5 text-sky-400" />
                  <span>.json</span>
                </button>
                <button
                  onClick={handleExportDocker}
                  className="p-2 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                  title="Als docker-compose.yml herunterladen"
                >
                  <FileCode className="w-3.5 h-3.5 text-sky-400" />
                  <span>docker-compose</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Checkout Modal (PayPal, Kreditkarte, Klarna, Paysafecard, Sofortüberweisung) */}
      {showCheckoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#0e172a] border border-slate-700 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            {isDeploying ? (
              /* Deployment animation / terminal */
              <div className="p-8 text-center space-y-6">
                <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-sky-400 flex items-center justify-center mx-auto animate-pulse">
                  <Server className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-white">Server wird bereitgestellt...</h3>
                  <p className="text-xs text-sky-400 font-mono animate-bounce">{deployStep}</p>
                </div>
                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                  <div className="bg-sky-500 h-full animate-[progress_2s_ease-in-out_infinite] w-2/3" />
                </div>
              </div>
            ) : (
              <>
                <div className="p-5 border-b border-slate-800 bg-[#0a0f1d] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <CreditCard className="w-5 h-5 text-sky-400" />
                    <h3 className="text-base font-bold text-white">Kasse & Zahlungsart wählen</h3>
                  </div>
                  <button
                    onClick={() => setShowCheckoutModal(false)}
                    className="text-slate-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>

                <div className="p-6 space-y-5">
                  {/* Order summary row */}
                  <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-white block">
                        {serverName || CATEGORIES[selectedCategory].name}
                      </span>
                      <span className="text-slate-400 font-mono">
                        {ramGb}GB RAM • {cpuCores} vCPU • {selectedOs}
                      </span>
                    </div>
                    <span className="text-base font-bold text-sky-400 font-mono">
                      {formatCurrency(monthlyPrice)}
                    </span>
                  </div>

                  {/* Payment Method Selector */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                      Zahlungsart auswählen:
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {/* PayPal */}
                      <button
                        type="button"
                        onClick={() => setSelectedPaymentMethod('paypal')}
                        className={`p-3 rounded-xl border text-left flex items-center justify-between text-xs font-medium transition-all ${
                          selectedPaymentMethod === 'paypal'
                            ? 'border-sky-500 bg-sky-950/40 text-white ring-1 ring-sky-500/30'
                            : 'border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-blue-400">PayPal</span>
                        </div>
                        {selectedPaymentMethod === 'paypal' && <Check className="w-4 h-4 text-sky-400" />}
                      </button>

                      {/* Kreditkarte */}
                      <button
                        type="button"
                        onClick={() => setSelectedPaymentMethod('credit_card')}
                        className={`p-3 rounded-xl border text-left flex items-center justify-between text-xs font-medium transition-all ${
                          selectedPaymentMethod === 'credit_card'
                            ? 'border-sky-500 bg-sky-950/40 text-white ring-1 ring-sky-500/30'
                            : 'border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">Kreditkarte</span>
                          <span className="text-[10px] text-slate-400">(Visa/MC)</span>
                        </div>
                        {selectedPaymentMethod === 'credit_card' && <Check className="w-4 h-4 text-sky-400" />}
                      </button>

                      {/* Klarna */}
                      <button
                        type="button"
                        onClick={() => setSelectedPaymentMethod('klarna')}
                        className={`p-3 rounded-xl border text-left flex items-center justify-between text-xs font-medium transition-all ${
                          selectedPaymentMethod === 'klarna'
                            ? 'border-sky-500 bg-sky-950/40 text-white ring-1 ring-sky-500/30'
                            : 'border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-pink-400">Klarna</span>
                          <span className="text-[10px] text-slate-400">(Rechnung)</span>
                        </div>
                        {selectedPaymentMethod === 'klarna' && <Check className="w-4 h-4 text-sky-400" />}
                      </button>

                      {/* Paysafecard */}
                      <button
                        type="button"
                        onClick={() => setSelectedPaymentMethod('paysafecard')}
                        className={`p-3 rounded-xl border text-left flex items-center justify-between text-xs font-medium transition-all ${
                          selectedPaymentMethod === 'paysafecard'
                            ? 'border-sky-500 bg-sky-950/40 text-white ring-1 ring-sky-500/30'
                            : 'border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sky-400">Paysafecard</span>
                        </div>
                        {selectedPaymentMethod === 'paysafecard' && <Check className="w-4 h-4 text-sky-400" />}
                      </button>

                      {/* Sofortüberweisung */}
                      <button
                        type="button"
                        onClick={() => setSelectedPaymentMethod('sofort')}
                        className={`p-3 rounded-xl border text-left flex items-center justify-between text-xs font-medium transition-all ${
                          selectedPaymentMethod === 'sofort'
                            ? 'border-sky-500 bg-sky-950/40 text-white ring-1 ring-sky-500/30'
                            : 'border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-amber-300">Sofortüberweisung</span>
                        </div>
                        {selectedPaymentMethod === 'sofort' && <Check className="w-4 h-4 text-sky-400" />}
                      </button>

                      {/* Konto-Guthaben */}
                      <button
                        type="button"
                        onClick={() => setSelectedPaymentMethod('guthaben')}
                        className={`p-3 rounded-xl border text-left flex items-center justify-between text-xs font-medium transition-all ${
                          selectedPaymentMethod === 'guthaben'
                            ? 'border-emerald-500 bg-emerald-950/40 text-white ring-1 ring-emerald-500/30'
                            : 'border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-emerald-400">Konto-Guthaben</span>
                          <span className="text-[10px] text-slate-400">({formatCurrency(balance)})</span>
                        </div>
                        {selectedPaymentMethod === 'guthaben' && <Check className="w-4 h-4 text-emerald-400" />}
                      </button>
                    </div>
                  </div>

                  {selectedPaymentMethod === 'guthaben' && balance < monthlyPrice && (
                    <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>
                        Dein Guthaben ({formatCurrency(balance)}) reicht für diesen Server nicht aus. Bitte wähle eine externe Zahlungsart oder lade dein Guthaben auf.
                      </span>
                    </div>
                  )}

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleConfirmOrder}
                      disabled={selectedPaymentMethod === 'guthaben' && balance < monthlyPrice}
                      className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      <span>Jetzt kostenpflichtig bestellen & sofort starten</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* 24h-Testserver Request Modal */}
      {showTestServerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#0e172a] border border-slate-700 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-slate-800 bg-[#0a0f1d] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Clock className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">24h-Testserver anfordern (Kostenlos)</h3>
              </div>
              <button
                onClick={() => setShowTestServerModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitTestRequest} className="p-6 space-y-4">
              <p className="text-xs text-slate-300 leading-relaxed">
                Teste unsere Infrastruktur für 24 Stunden vollkommen unverbindlich. Deine Anfrage wird nach Einreichung im Admin-Bereich geprüft.
              </p>

              {/* Inhaber-Sperre Status Note */}
              {!teamCanManageTestServers ? (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block">Inhaber-Prüfung aktiv</span>
                    <span>
                      Aufgrund hoher Nachfrage werden Testserver aktuell ausschließlich vom Server-Inhaber persönlich geprüft.
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-sky-300 text-xs flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-sky-400 shrink-0" />
                  <span>Schnelle Freigabe: Unser Support-Team ist berechtigt, deinen Antrag direkt freizugeben.</span>
                </div>
              )}

              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Dein Name / Discord-Tag *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="z. B. Alex#1337"
                    value={testForm.userName}
                    onChange={(e) => setTestForm({ ...testForm, userName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-amber-400 focus:outline-none text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    E-Mail Adresse *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="deine@email.de"
                    value={testForm.userEmail}
                    onChange={(e) => setTestForm({ ...testForm, userEmail: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-amber-400 focus:outline-none text-white text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Kategorie
                    </label>
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-white">
                      {CATEGORIES[selectedCategory].name}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Gewähltes OS
                    </label>
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-sky-300 truncate">
                      {selectedOs}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Verwendungszweck / Projektbeschreibung *
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Beschreibe kurz, was du auf dem 24h-Testserver ausprobieren möchtest (z.B. FiveM Skripte testen, Minecraft Paper Benchmark...)"
                    value={testForm.purpose}
                    onChange={(e) => setTestForm({ ...testForm, purpose: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-amber-400 focus:outline-none text-white text-xs"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowTestServerModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 flex items-center gap-1.5 transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Antrag einreichen</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
