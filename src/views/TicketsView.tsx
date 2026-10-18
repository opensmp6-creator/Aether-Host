import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  LifeBuoy,
  PlusCircle,
  MessageSquare,
  Clock,
  Send,
  CheckCircle2,
  AlertCircle,
  User,
  Shield,
  HelpCircle,
} from 'lucide-react';
import { SupportTicket } from '../types';

export const TicketsView: React.FC = () => {
  const { tickets, createTicket, sendTicketReply, closeTicket, addToast } = useApp();

  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(
    tickets.length > 0 ? tickets[0].id : null
  );
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [replyText, setReplyText] = useState<string>('');

  // New ticket state
  const [newTitle, setNewTitle] = useState<string>('');
  const [newCategory, setNewCategory] = useState<'Allgemein' | 'Technik' | 'Rechnung' | 'Server'>('Technik');
  const [newPriority, setNewPriority] = useState<'Niedrig' | 'Mittel' | 'Hoch'>('Mittel');
  const [newInitialMessage, setNewInitialMessage] = useState<string>('');

  const activeTicket = tickets.find((t) => t.id === selectedTicketId) || tickets[0] || null;

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newInitialMessage.trim()) {
      addToast('Bitte fülle alle Pflichtfelder aus.', 'error');
      return;
    }

    createTicket({
      title: newTitle,
      category: newCategory,
      priority: newPriority,
      initialMessage: newInitialMessage,
    });

    setShowCreateModal(false);
    setNewTitle('');
    setNewInitialMessage('');
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !activeTicket) return;
    sendTicketReply(activeTicket.id, replyText);
    setReplyText('');
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <LifeBuoy className="w-6 h-6 text-sky-400" />
            <span>Support- & Ticketbereich</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Erhalte schnelle Hilfe von unseren System-Administratoren bei technischen Fragen.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-500/20 transition-all self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Neues Ticket erstellen</span>
        </button>
      </div>

      {tickets.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-slate-800 bg-[#0b1020]/40 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-sky-400 flex items-center justify-center mx-auto">
            <MessageSquare className="w-7 h-7" />
          </div>
          <div className="max-w-sm mx-auto space-y-1">
            <h4 className="text-base font-bold text-white">Keine aktiven Support-Tickets</h4>
            <p className="text-xs text-slate-400">
              Hast du Fragen zu deiner Server-Konfiguration, IP-Routen oder Zahlungen? Unser 24/7 Support ist gerne für dich da.
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md"
          >
            Jetzt Anfrage einreichen
          </button>
        </div>
      ) : (
        /* Two Column Layout: Ticket List (Left) & Active Chat Thread (Right) */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Ticket List */}
          <div className="p-4 rounded-2xl bg-[#0f172a]/80 border border-slate-800 space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block px-1">
              Deine Tickets ({tickets.length})
            </span>

            <div className="space-y-2">
              {tickets.map((t) => {
                const isSelected = activeTicket?.id === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTicketId(t.id)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all space-y-2 ${
                      isSelected
                        ? 'border-sky-500 bg-sky-950/40 shadow-sm'
                        : 'border-slate-800/80 bg-slate-900/60 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] font-bold text-sky-400">
                        {t.ticketNumber}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          t.status === 'closed'
                            ? 'bg-slate-800 text-slate-400'
                            : t.status === 'in_progress'
                            ? 'bg-blue-500/20 text-sky-300 border border-blue-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {t.status === 'closed'
                          ? 'Geschlossen'
                          : t.status === 'in_progress'
                          ? 'In Bearbeitung'
                          : 'Offen'}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-white truncate">{t.title}</h4>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/60">
                      <span>{t.category}</span>
                      <span className="font-mono text-[10px]">{t.updatedAt}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Ticket Chat Thread */}
          <div className="lg:col-span-2 p-6 rounded-2xl bg-[#0f172a]/80 border border-slate-800 flex flex-col justify-between min-h-[500px]">
            {activeTicket ? (
              <>
                {/* Header */}
                <div className="border-b border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-sky-400">
                        {activeTicket.ticketNumber}
                      </span>
                      <span className="text-xs text-slate-500">•</span>
                      <span className="text-xs text-slate-400">{activeTicket.category}</span>
                      <span className="text-xs text-slate-500">•</span>
                      <span className="text-[11px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20">
                        Priorität: {activeTicket.priority}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-white mt-1">{activeTicket.title}</h3>
                  </div>

                  {activeTicket.status !== 'closed' && (
                    <button
                      onClick={() => closeTicket(activeTicket.id)}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white text-xs border border-slate-800 transition-colors self-start sm:self-auto"
                    >
                      Ticket schließen
                    </button>
                  )}
                </div>

                {/* Message Thread */}
                <div className="flex-1 py-4 space-y-4 overflow-y-auto max-h-[420px] pr-2">
                  {activeTicket.messages.map((msg) => {
                    const isUser = msg.sender === 'user';

                    return (
                      <div
                        key={msg.id}
                        className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                            isUser
                              ? 'bg-blue-600 text-white'
                              : 'bg-emerald-600 text-white'
                          }`}
                        >
                          {isUser ? <User className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                        </div>

                        <div
                          className={`max-w-md p-3.5 rounded-2xl text-xs space-y-1 ${
                            isUser
                              ? 'bg-blue-600/25 border border-blue-500/40 text-slate-100 rounded-tr-none'
                              : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3 text-[10px] text-slate-400">
                            <span className="font-bold text-white">{msg.authorName}</span>
                            <span className="font-mono">{msg.timestamp}</span>
                          </div>
                          <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Reply Input Box */}
                {activeTicket.status === 'closed' ? (
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-center text-xs text-slate-400">
                    Dieses Ticket wurde geschlossen.
                  </div>
                ) : (
                  <form onSubmit={handleSendReply} className="pt-3 border-t border-slate-800 flex gap-2">
                    <input
                      type="text"
                      placeholder="Antwort verfassen..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:border-sky-500 focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={!replyText.trim()}
                      className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Senden</span>
                    </button>
                  </form>
                )}
              </>
            ) : null}
          </div>
        </div>
      )}

      {/* Create Ticket Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#0e172a] border border-slate-700 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-slate-800 bg-[#0a0f1d] flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Neues Support-Ticket eröffnen</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Betreff / Titel *
                </label>
                <input
                  type="text"
                  required
                  placeholder="z. B. Frage zu Firewall-Regeln"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-sky-500 focus:outline-none text-white text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Kategorie
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-sky-500 focus:outline-none text-white text-xs"
                  >
                    <option value="Technik">Technik & Konfiguration</option>
                    <option value="Server">Server & KVM</option>
                    <option value="Rechnung">Rechnung & Finanzen</option>
                    <option value="Allgemein">Allgemeine Anfrage</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Priorität
                  </label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-sky-500 focus:outline-none text-white text-xs"
                  >
                    <option value="Niedrig">Niedrig</option>
                    <option value="Mittel">Mittel</option>
                    <option value="Hoch">Hoch (Dringend)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Deine Nachricht / Problembeschreibung *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Beschreibe dein Anliegen möglichst detailliert..."
                  value={newInitialMessage}
                  onChange={(e) => setNewInitialMessage(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-sky-500 focus:outline-none text-white text-xs"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-500/20"
                >
                  Ticket absenden
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
