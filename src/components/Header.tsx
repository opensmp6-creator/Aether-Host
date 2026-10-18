import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Wallet,
  PlusCircle,
  Shield,
  UserCheck,
  Server,
  HelpCircle,
  X,
  AlertTriangle,
  CheckCircle2,
  Info,
  SlidersHorizontal,
  GitBranch,
  ExternalLink,
} from 'lucide-react';
import { formatCurrency } from '../utils/categories';

export const Header: React.FC = () => {
  const {
    currentTab,
    setCurrentTab,
    balance,
    userRole,
    setUserRole,
    notifications,
    dismissNotification,
  } = useApp();

  const getTabTitle = () => {
    switch (currentTab) {
      case 'dashboard':
        return { title: 'Kunden Dashboard', subtitle: 'Übersicht deiner aktiven Cloud-Instanzen und Finanzen' };
      case 'my_services':
        return { title: 'Meine Dienste & Server', subtitle: 'Verwalte deine Root VPS, Gameserver und Bots' };
      case 'tickets':
        return { title: 'Support & Ticketbereich', subtitle: '24/7 Technischer Kundenservice & Hilfecenter' };
      case 'order_server':
        return { title: 'Server-Bestellung & Konfigurator', subtitle: 'Wähle Hardware, Betriebssystem und Standort nach Maß' };
      case 'balance':
        return { title: 'Guthaben & Zahlungsverlauf', subtitle: 'Konto aufladen, Rechnungen und Zahlungsarten verwalten' };
      case 'admin_panel':
        return { title: 'Admin & Rechteverwaltung', subtitle: 'Server-Status, Inhaber-Sperre & Testserver-Freigaben' };
      case 'server_deployment':
        return { title: 'Auf Server installieren & Node-Setup', subtitle: 'Linux SSH 1-Klick Installer, Docker Compose, Nginx & Host-Knoten Anbindung' };
      default:
        return { title: 'AetherHost Cloud', subtitle: 'Hosting Control Panel' };
    }
  };

  const { title, subtitle } = getTabTitle();

  return (
    <>
      <header className="h-18 bg-[#090e1b]/90 backdrop-blur-md border-b border-slate-800/80 px-6 flex items-center justify-between sticky top-0 z-20">
        {/* Title & Breadcrumb */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-400">Portal</span>
            <span className="text-xs text-slate-500">/</span>
            <span className="text-xs font-semibold text-sky-400 capitalize">{title}</span>
          </div>
          <h1 className="text-lg font-bold text-white tracking-tight">{title}</h1>
        </div>

        {/* Action Controls & Badges */}
        <div className="flex items-center gap-3">
          {/* Quick Balance Button */}
          <button
            onClick={() => setCurrentTab('balance')}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 text-slate-200 transition-all group"
            title="Guthaben ansehen & aufladen"
          >
            <Wallet className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
            <div className="flex flex-col text-left">
              <span className="text-[10px] text-slate-400 font-medium leading-none">Guthaben</span>
              <span className="text-xs font-bold text-emerald-300 font-mono leading-tight">
                {formatCurrency(balance)}
              </span>
            </div>
            <span className="ml-1 text-slate-400 hover:text-white p-0.5 rounded bg-slate-800/80">
              <PlusCircle className="w-3.5 h-3.5 text-sky-400" />
            </span>
          </button>

          {/* GitHub Repository Link */}
          <a
            href="https://github.com/opensmp6-creator/Aether-Host"
            target="_blank"
            rel="noreferrer"
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-all group"
            title="GitHub Repository: opensmp6-creator/Aether-Host öffnen"
          >
            <GitBranch className="w-3.5 h-3.5 text-sky-400 group-hover:rotate-12 transition-transform" />
            <span>GitHub</span>
            <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-slate-300" />
          </a>

          {/* Quick Order CTA */}
          <button
            onClick={() => setCurrentTab('order_server')}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-500/20 transition-all"
          >
            <Server className="w-3.5 h-3.5" />
            <span>Neuer Server</span>
          </button>

          {/* Role Mode Switcher (Kunde <-> Admin) */}
          <div className="flex items-center bg-slate-900/90 border border-slate-800 p-1 rounded-xl">
            <button
              onClick={() => {
                setUserRole('user');
                if (currentTab === 'admin_panel') setCurrentTab('dashboard');
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                userRole === 'user'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Kundenansicht aktivieren"
            >
              <UserCheck className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden md:inline">Kunde</span>
            </button>
            <button
              onClick={() => {
                setUserRole('admin');
                setCurrentTab('admin_panel');
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                userRole === 'admin'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Admin / Inhaber Panel öffnen"
            >
              <Shield className="w-3.5 h-3.5 text-rose-400" />
              <span className="hidden md:inline">Inhaber / Admin</span>
            </button>
          </div>
        </div>
      </header>

      {/* Floating Toast Notification Stack */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none px-4">
        {notifications.map((notif) => {
          let border = 'border-blue-500/40 bg-slate-900/95 text-slate-100';
          let Icon = Info;
          let iconColor = 'text-blue-400';

          if (notif.type === 'success') {
            border = 'border-emerald-500/40 bg-[#061e16]/95 text-emerald-100';
            Icon = CheckCircle2;
            iconColor = 'text-emerald-400';
          } else if (notif.type === 'error') {
            border = 'border-rose-500/50 bg-[#250d12]/95 text-rose-100';
            Icon = AlertTriangle;
            iconColor = 'text-rose-400';
          } else if (notif.type === 'warning') {
            border = 'border-amber-500/50 bg-[#221805]/95 text-amber-100';
            Icon = AlertTriangle;
            iconColor = 'text-amber-400';
          }

          return (
            <div
              key={notif.id}
              className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border shadow-2xl backdrop-blur-md text-xs font-medium transition-all transform translate-y-0 ${border}`}
            >
              <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${iconColor}`} />
              <div className="flex-1 leading-relaxed">{notif.message}</div>
              <button
                onClick={() => dismissNotification(notif.id)}
                className="text-slate-400 hover:text-white p-0.5 rounded"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </>
  );
};
