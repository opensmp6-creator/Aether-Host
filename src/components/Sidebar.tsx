import React from 'react';
import { useApp } from '../context/AppContext';
import { NavigationTab } from '../types';
import {
  LayoutDashboard,
  Server,
  LifeBuoy,
  Cpu,
  Wallet,
  ShieldCheck,
  ChevronsLeft,
  ChevronsRight,
  Activity,
  Layers,
  Sparkles,
  HardDrive,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const {
    currentTab,
    setCurrentTab,
    isSidebarCollapsed,
    toggleSidebar,
    servers,
    testRequests,
    tickets,
    balance,
  } = useApp();

  const openTicketsCount = tickets.filter((t) => t.status !== 'closed').length;
  const pendingRequestsCount = testRequests.filter((r) => r.status === 'pending').length;

  interface NavItem {
    id: NavigationTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string | number | null;
    badgeColor?: string;
  }

  interface NavSection {
    title: string;
    items: NavItem[];
  }

  const sections: NavSection[] = [
    {
      title: 'Allgemein',
      items: [
        {
          id: 'dashboard',
          label: 'Dashboard',
          icon: LayoutDashboard,
        },
        {
          id: 'my_services',
          label: 'Meine Dienste',
          icon: Server,
          badge: servers.length > 0 ? servers.length : null,
          badgeColor: 'bg-blue-600/30 text-blue-400 border border-blue-500/30',
        },
        {
          id: 'tickets',
          label: 'Ticketbereich',
          icon: LifeBuoy,
          badge: openTicketsCount > 0 ? openTicketsCount : null,
          badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
        },
      ],
    },
    {
      title: 'Bestellung',
      items: [
        {
          id: 'order_server',
          label: 'Server-Bestellung',
          icon: Cpu,
        },
        {
          id: 'balance',
          label: 'Guthaben',
          icon: Wallet,
          badge: `${balance.toFixed(2)} €`,
          badgeColor: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
        },
      ],
    },
    {
      title: 'Admin & Hosting',
      items: [
        {
          id: 'admin_panel',
          label: 'Admin-Panel',
          icon: ShieldCheck,
          badge: pendingRequestsCount > 0 ? `${pendingRequestsCount} Neu` : null,
          badgeColor: 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse',
        },
        {
          id: 'server_deployment',
          label: 'Auf Server installieren',
          icon: HardDrive,
          badge: 'Self-Host',
          badgeColor: 'bg-sky-500/20 text-sky-300 border border-sky-500/40',
        },
      ],
    },
  ];

  return (
    <aside
      className={`relative flex flex-col shrink-0 bg-[#0c1222] border-r border-slate-800/80 transition-all duration-300 ease-in-out z-30 select-none ${
        isSidebarCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-18 flex items-center justify-between px-4 border-b border-slate-800/60 bg-[#090e1b]">
        {!isSidebarCollapsed ? (
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 border border-blue-400/30 shrink-0">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col truncate">
              <span className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
                Aether<span className="text-sky-400">Host</span>
                <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  Cloud
                </span>
              </span>
              <span className="text-xs text-slate-400 truncate">High-End VPS & Game</span>
            </div>
          </div>
        ) : (
          <div className="w-full flex justify-center">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 border border-blue-400/30">
              <Layers className="w-5 h-5 text-white" />
            </div>
          </div>
        )}

        {/* Collapsible toggle button: User specified << or >> */}
        <button
          onClick={toggleSidebar}
          title={isSidebarCollapsed ? 'Menü ausklappen (>>)' : 'Menü einklappen (<<)'}
          className={`p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors flex items-center justify-center border border-slate-800/80 ${
            isSidebarCollapsed ? 'absolute -right-3 top-5 bg-[#0e172a] shadow-md z-40' : ''
          }`}
        >
          {isSidebarCollapsed ? (
            <ChevronsRight className="w-4 h-4 text-sky-400" />
          ) : (
            <ChevronsLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        {sections.map((section) => (
          <div key={section.title} className="space-y-1.5">
            {!isSidebarCollapsed ? (
              <div className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                {section.title}
              </div>
            ) : (
              <div className="w-full h-px bg-slate-800/60 my-2" />
            )}

            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentTab(item.id)}
                    title={isSidebarCollapsed ? `${section.title}: ${item.label}` : undefined}
                    className={`group w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 relative ${
                      isActive
                        ? 'bg-blue-600/15 text-sky-300 border border-blue-500/30 shadow-sm shadow-blue-500/10'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                    } ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-sky-400 rounded-r-full shadow-sm shadow-sky-400/50" />
                    )}

                    <Icon
                      className={`w-5 h-5 shrink-0 transition-colors ${
                        isActive ? 'text-sky-400' : 'text-slate-400 group-hover:text-slate-200'
                      }`}
                    />

                    {!isSidebarCollapsed && (
                      <span className="truncate flex-1 text-left">{item.label}</span>
                    )}

                    {!isSidebarCollapsed && item.badge !== undefined && item.badge !== null && (
                      <span
                        className={`text-[11px] font-medium px-2 py-0.5 rounded-full shrink-0 ${
                          item.badgeColor || 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}

                    {isSidebarCollapsed && item.badge !== undefined && item.badge !== null && (
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-sky-400 ring-2 ring-[#0c1222]" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Network & Infrastructure Status Box */}
      <div className="p-3 border-t border-slate-800/60 bg-[#090e1b]/70">
        {!isSidebarCollapsed ? (
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-1.5">
            <div className="flex items-center justify-between text-slate-300 font-medium">
              <span className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Netzwerk: Frankfurt
              </span>
              <span className="text-emerald-400 font-mono text-[11px]">99.98%</span>
            </div>
            <div className="text-[11px] text-slate-400 flex items-center justify-between">
              <span>DDoS Schutz</span>
              <span className="text-slate-300">Aktiv (1.2 Tbps)</span>
            </div>
          </div>
        ) : (
          <div className="flex justify-center" title="Rechenzentrum: 99.98% Uptime - Aktiv">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          </div>
        )}
      </div>
    </aside>
  );
};
