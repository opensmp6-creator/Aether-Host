import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ShieldAlert,
  Server,
  Lock,
  Unlock,
  CheckCircle2,
  XCircle,
  Clock,
  Wallet,
  RotateCcw,
  Sparkles,
  AlertTriangle,
  UserCheck,
  PlusCircle,
  FileText,
  Sliders,
  Check,
  Shield,
  Trash2,
} from 'lucide-react';
import { formatCurrency, CATEGORIES } from '../utils/categories';
import { TestServerRequest } from '../types';

export const AdminPanelView: React.FC = () => {
  const {
    servers,
    testRequests,
    balance,
    teamCanManageTestServers,
    toggleTeamTestServerPermission,
    suspendServer,
    unsuspendServer,
    deleteServer,
    approveTestServer,
    rejectTestServer,
    addBalance,
    resetAllData,
    loadSampleData,
    addToast,
    setCurrentTab,
  } = useApp();

  // Guthaben manual credit state
  const [customCreditAmount, setCustomCreditAmount] = useState<string>('25');
  const [creditReason, setCreditReason] = useState<string>('Admin-Gutschrift / Goodwill');

  // Test request rejection state
  const [rejectingRequestId, setRejectingRequestId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState<string>('Kapazitätsengpass im gewählten Cluster.');

  // Acting role in admin panel: can be 'owner' or 'team' to demonstrate owner lock enforcement
  const [adminPersona, setAdminPersona] = useState<'owner' | 'team'>('owner');

  const pendingRequests = testRequests.filter((r) => r.status === 'pending');
  const resolvedRequests = testRequests.filter((r) => r.status !== 'pending');

  const handleApplyBalance = (amount: number) => {
    if (isNaN(amount) || amount <= 0) {
      addToast('Bitte gib einen gültigen Betrag größer als 0 ein.', 'error');
      return;
    }
    addBalance(amount, 'guthaben', creditReason || 'Admin Manuelle Gutschrift');
  };

  const handleApprove = (requestId: string) => {
    approveTestServer(requestId, adminPersona);
  };

  const handleRejectConfirm = (requestId: string) => {
    rejectTestServer(requestId, rejectReason);
    setRejectingRequestId(null);
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Top Banner & Persona Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-rose-950/40 via-[#181120] to-[#0f172a] border border-rose-500/30">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
            <span className="text-xs uppercase font-bold text-rose-400 tracking-wider">
              Administration & Infrastruktur
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-white tracking-tight mt-1">
            Admin Control Center & Inhaber-Rechte
          </h2>
          <p className="text-xs text-slate-400">
            Verwalte Kundenserver, bearbeite 24h-Testserver-Anträge und steuere Team-Berechtigungen.
          </p>
        </div>

        {/* Persona toggle: Acting as Inhaber vs Team Member & Server Deployment Button */}
        <div className="flex flex-col sm:items-end gap-2 self-start sm:self-auto">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentTab('server_deployment')}
              className="px-3 py-1 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 text-xs font-bold border border-sky-500/40 flex items-center gap-1.5 transition-colors"
            >
              <Server className="w-3.5 h-3.5" />
              <span>Auf eigenem Server installieren</span>
            </button>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold text-slate-400">Rolle:</span>
            <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800">
              <button
                onClick={() => setAdminPersona('owner')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  adminPersona === 'owner'
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Shield className="w-3.5 h-3.5 text-amber-300" />
                <span>Inhaber</span>
              </button>
              <button
                onClick={() => setAdminPersona('team')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  adminPersona === 'team'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Team</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Inhaber-Sperre & Guthaben Vergabe */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Owner-Sperre: Team-Berechtigungen */}
        <div className="p-6 rounded-2xl bg-[#0f172a]/80 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Inhaber-Sperre: Team-Berechtigung
                </h3>
                <p className="text-xs text-slate-400">
                  Steuert, ob Team-Mitglieder Testserver freigeben dürfen
                </p>
              </div>
            </div>

            {/* Toggle Switch */}
            <button
              onClick={toggleTeamTestServerPermission}
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                teamCanManageTestServers ? 'bg-emerald-600' : 'bg-rose-700'
              }`}
              title="Team-Berechtigung umschalten"
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                  teamCanManageTestServers ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div
            className={`p-4 rounded-xl border text-xs leading-relaxed space-y-1.5 ${
              teamCanManageTestServers
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-200'
            }`}
          >
            <div className="font-bold flex items-center gap-1.5">
              {teamCanManageTestServers ? (
                <>
                  <Unlock className="w-4 h-4 text-emerald-400" />
                  <span>Team-Freigabe AKTIV: Teammitglieder dürfen Anträge genehmigen</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 text-rose-400" />
                  <span>INHABER-SPERRE AKTIV: Team-Bearbeitung ist vollständig blockiert</span>
                </>
              )}
            </div>
            <p className="text-[11px] opacity-90">
              {teamCanManageTestServers
                ? 'Support-Mitarbeiter und Moderatoren können eingereichte 24h-Testserver selbstständig prüfen und aktivieren.'
                : 'Nur der Inhaber (Owner) besitzt die Rechte, Testserver freizuschalten. Wenn Teammitglieder versuchen freizuschalten, wird der Vorgang abgewiesen.'}
            </p>
          </div>
        </div>

        {/* 2. Guthaben vergeben (Manuelles Aufladen) */}
        <div className="p-6 rounded-2xl bg-[#0f172a]/80 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                Guthaben vergeben (Manuelle Gutschrift)
              </h3>
              <p className="text-xs text-slate-400">
                Aktueller Kundenstand:{' '}
                <span className="font-mono text-emerald-400 font-bold">
                  {formatCurrency(balance)}
                </span>
              </p>
            </div>
          </div>

          {/* Quick Credit Buttons */}
          <div className="grid grid-cols-4 gap-2">
            {[10, 25, 50, 100].map((amt) => (
              <button
                key={amt}
                onClick={() => handleApplyBalance(amt)}
                className="py-2 px-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 hover:bg-emerald-950/20 text-emerald-300 font-mono text-xs font-bold transition-all text-center"
              >
                +{amt} €
              </button>
            ))}
          </div>

          {/* Custom Credit Input */}
          <div className="flex gap-2">
            <input
              type="number"
              min="1"
              step="1"
              placeholder="Betrag in €"
              value={customCreditAmount}
              onChange={(e) => setCustomCreditAmount(e.target.value)}
              className="w-28 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono text-xs focus:border-emerald-500 focus:outline-none"
            />
            <input
              type="text"
              placeholder="Notiz / Buchungsgrund"
              value={creditReason}
              onChange={(e) => setCreditReason(e.target.value)}
              className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:border-emerald-500 focus:outline-none"
            />
            <button
              onClick={() => handleApplyBalance(Number(customCreditAmount))}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors shrink-0"
            >
              Gutschreiben
            </button>
          </div>
        </div>
      </div>

      {/* 3. Server sperren (Suspend / Unsuspend) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <Server className="w-5 h-5 text-sky-400" />
              <span>Server-Status & Sperrverwaltung (Suspend / Unsuspend)</span>
            </h3>
            <p className="text-xs text-slate-400">
              Sperre betrügerische oder überfällige Server per Klick oder reaktiviere sie sofort.
            </p>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {servers.length} Instanz{servers.length === 1 ? '' : 'en'} registriert
          </span>
        </div>

        {servers.length === 0 ? (
          <div className="p-8 text-center rounded-2xl border border-dashed border-slate-800 bg-[#0b1020]/40 text-xs text-slate-400">
            Aktuell sind keine Server im System angelegt.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-[#0f172a]/90">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#0a0f1d] border-b border-slate-800 text-slate-400 uppercase font-semibold text-[11px]">
                <tr>
                  <th className="py-3 px-4">Server</th>
                  <th className="py-3 px-4">IP & Port</th>
                  <th className="py-3 px-4">Specs</th>
                  <th className="py-3 px-4">Kosten</th>
                  <th className="py-3 px-4">Aktueller Status</th>
                  <th className="py-3 px-4 text-right">Admin-Aktion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {servers.map((srv) => {
                  const isSuspended = srv.status === 'suspended';

                  return (
                    <tr
                      key={srv.id}
                      className={`hover:bg-slate-800/40 transition-colors ${
                        isSuspended ? 'bg-rose-950/20' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white flex items-center gap-2">
                          {srv.name}
                          {srv.isTestServer && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              24h Test
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {srv.os} • ID: {srv.id}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-sky-300">
                        {srv.ipAddress}:{srv.port}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-slate-300">
                        {srv.ramGb}GB RAM | {srv.cpuCores}C | {srv.nvmeGb}GB
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-white">
                        {srv.monthlyCost === 0 ? '0,00 €' : formatCurrency(srv.monthlyCost)}
                      </td>

                      <td className="py-3.5 px-4">
                        {isSuspended ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                            • Suspended
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            • In Betrieb
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right space-x-2">
                        {isSuspended ? (
                          <button
                            onClick={() => unsuspendServer(srv.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all"
                            title="Server entsperren (Unsuspend)"
                          >
                            <Unlock className="w-3.5 h-3.5" />
                            <span>Entsperren (Unsuspend)</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => suspendServer(srv.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md shadow-rose-600/20 transition-all"
                            title="Server sperren (Suspend)"
                          >
                            <Lock className="w-3.5 h-3.5" />
                            <span>Sperren (Suspend)</span>
                          </button>
                        )}

                        <button
                          onClick={() => deleteServer(srv.id)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-300 border border-slate-700 transition-colors"
                          title="Server löschen"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 4. Test-Anfragen verwalten */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-400" />
              <span>Testserver-Anträge prüfen & verwalten</span>
            </h3>
            <p className="text-xs text-slate-400">
              Prüfe offene 24h-Anfragen. Genehmigte Instanzen werden sofort provisioniert.
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
            {pendingRequests.length} Offene Anträge
          </span>
        </div>

        {pendingRequests.length === 0 ? (
          <div className="p-6 rounded-2xl border border-dashed border-slate-800 bg-[#0b1020]/40 text-center text-xs text-slate-400 space-y-1">
            <p className="font-semibold text-slate-300">Keine offenen Testserver-Anträge vorhanden.</p>
            <p>Neue Anfragen aus dem Bestellmenü erscheinen hier zur Prüfung.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingRequests.map((req) => (
              <div
                key={req.id}
                className="p-5 rounded-2xl bg-[#0f172a]/90 border border-slate-800 hover:border-slate-700 space-y-4 shadow-lg"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-bold text-white block">{req.userName}</span>
                    <span className="text-[11px] text-slate-400 font-mono">{req.userEmail}</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {req.requestedAt}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Kategorie:</span>
                    <span className="text-white font-bold">{CATEGORIES[req.category]?.name || req.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Wunsch-OS:</span>
                    <span className="text-sky-300 font-mono">{req.preferredOs}</span>
                  </div>
                  <div className="pt-1 border-t border-slate-800">
                    <span className="text-slate-400 block text-[11px]">Zweck / Projekt:</span>
                    <p className="text-slate-200 italic mt-0.5">{req.purpose}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    onClick={() => setRejectingRequestId(req.id)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-300 text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition-colors"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Ablehnen</span>
                  </button>
                  <button
                    onClick={() => handleApprove(req.id)}
                    className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-colors"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>24h-Test genehmigen</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Resolved Requests history preview */}
        {resolvedRequests.length > 0 && (
          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 text-xs space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Zuletzt bearbeitete Anträge ({resolvedRequests.length})
            </span>
            <div className="space-y-1.5">
              {resolvedRequests.slice(0, 3).map((r) => (
                <div key={r.id} className="flex items-center justify-between text-[11px] text-slate-400 py-1 border-b border-slate-800/60 last:border-none">
                  <span>{r.userName} ({CATEGORIES[r.category]?.name})</span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-mono">{r.reviewedBy}</span>
                    {r.status === 'approved' ? (
                      <span className="text-emerald-400 font-bold">• Genehmigt</span>
                    ) : (
                      <span className="text-rose-400 font-bold">• Abgelehnt ({r.rejectionReason})</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 5. Daten zurücksetzen & Beispieldaten (As requested in prompt) */}
      <div className="p-6 rounded-2xl bg-[#0e1628] border border-slate-800 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-sky-400" />
            <span>System-Datenverwaltung & Werkszustand</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Setze alle Server, Guthaben und Transaktionen vollständig auf den leeren Startzustand zurück oder lade vorkonfigurierte Beispieldaten für Präsentationszwecke.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={resetAllData}
            className="px-4 py-2.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 text-rose-300 text-xs font-bold flex items-center gap-2 transition-all shadow-md shadow-rose-600/10"
          >
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <span>Alle Daten zurücksetzen (Werkszustand 0€ / 0 Server)</span>
          </button>

          <button
            onClick={loadSampleData}
            className="px-4 py-2.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-sky-300 text-xs font-bold flex items-center gap-2 transition-all"
          >
            <Sparkles className="w-4 h-4 text-sky-400" />
            <span>Demo-Beispieldaten laden</span>
          </button>
        </div>
      </div>

      {/* Rejection Modal */}
      {rejectingRequestId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#0e172a] border border-slate-700 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <h4 className="text-base font-bold text-white">Antrag ablehnen</h4>
            <p className="text-xs text-slate-300">
              Bitte gib dem Antragsteller einen kurzen Ablehnungsgrund an:
            </p>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:border-rose-500 focus:outline-none"
            />
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setRejectingRequestId(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Abbrechen
              </button>
              <button
                onClick={() => handleRejectConfirm(rejectingRequestId)}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold"
              >
                Ablehnung bestätigen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
