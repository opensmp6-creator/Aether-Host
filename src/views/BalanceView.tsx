import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PaymentMethod } from '../types';
import {
  Wallet,
  PlusCircle,
  CreditCard,
  Check,
  ArrowUpRight,
  Receipt,
  ShieldCheck,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { formatCurrency } from '../utils/categories';

export const BalanceView: React.FC = () => {
  const { balance, transactions, addBalance, addToast } = useApp();

  const [topUpAmount, setTopUpAmount] = useState<number>(25);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('paypal');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const handleDeposit = () => {
    if (topUpAmount <= 0 || isNaN(topUpAmount)) {
      addToast('Bitte wähle einen Betrag größer als 0 €.', 'error');
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      addBalance(
        topUpAmount,
        selectedMethod,
        `Guthaben-Aufladung via ${selectedMethod.toUpperCase()}`
      );
      setIsProcessing(false);
    }, 700);
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <Wallet className="w-6 h-6 text-emerald-400" />
          <span>Guthaben & Finanzen</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Lade dein Konto im Voraus auf, um Server ohne Unterbrechung zu verlängern oder neue Dienste sofort zu buchen.
        </p>
      </div>

      {/* Grid: Balance Card & Deposit Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Current Balance Card */}
        <div className="rounded-2xl bg-gradient-to-br from-[#0c221a] via-[#0f172a] to-[#091122] border border-emerald-500/30 p-6 shadow-2xl flex flex-col justify-between">
          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
              Verfügbares Guthaben
            </span>
            <div className="text-4xl font-extrabold text-white font-mono tracking-tight text-emerald-400">
              {formatCurrency(balance)}
            </div>
            <p className="text-xs text-slate-300 leading-relaxed pt-2">
              Dein Guthaben wird automatisch für anstehende Serververlängerungen und Neubestellungen verwendet.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-1 mt-6">
            <div className="flex justify-between text-slate-400">
              <span>Währung:</span>
              <span className="text-white font-mono font-bold">EUR (€)</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Auto-Verlängerung:</span>
              <span className="text-emerald-400 font-semibold">Aktiviert</span>
            </div>
          </div>
        </div>

        {/* Right: Deposit Form (2 Cols) */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-[#0f172a]/80 border border-slate-800 space-y-5">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <PlusCircle className="w-4 h-4 text-sky-400" />
            <span>Guthaben aufladen</span>
          </h3>

          {/* Preset Buttons */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Betrag auswählen:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[10, 25, 50, 100].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setTopUpAmount(amt)}
                  className={`py-3 px-4 rounded-xl border text-xs font-mono font-bold transition-all text-center ${
                    topUpAmount === amt
                      ? 'border-emerald-500 bg-emerald-950/40 text-emerald-300 ring-1 ring-emerald-500/30'
                      : 'border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  +{amt},00 €
                </button>
              ))}
            </div>
          </div>

          {/* Custom Amount */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Oder individuellen Betrag eingeben:
            </label>
            <div className="relative">
              <input
                type="number"
                min="5"
                max="500"
                step="5"
                value={topUpAmount}
                onChange={(e) => setTopUpAmount(Number(e.target.value))}
                className="w-full pl-4 pr-12 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-emerald-500 focus:outline-none text-white text-sm font-mono font-bold"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold font-mono">
                EUR (€)
              </span>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300">
              Zahlungsdienstleister:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSelectedMethod('paypal')}
                className={`p-2.5 rounded-xl border text-left text-xs font-medium flex items-center justify-between transition-all ${
                  selectedMethod === 'paypal'
                    ? 'border-sky-500 bg-sky-950/40 text-white ring-1 ring-sky-500/30'
                    : 'border-slate-800 bg-slate-900 text-slate-300'
                }`}
              >
                <span className="font-bold text-blue-400">PayPal</span>
                {selectedMethod === 'paypal' && <Check className="w-3.5 h-3.5 text-sky-400" />}
              </button>

              <button
                type="button"
                onClick={() => setSelectedMethod('credit_card')}
                className={`p-2.5 rounded-xl border text-left text-xs font-medium flex items-center justify-between transition-all ${
                  selectedMethod === 'credit_card'
                    ? 'border-sky-500 bg-sky-950/40 text-white ring-1 ring-sky-500/30'
                    : 'border-slate-800 bg-slate-900 text-slate-300'
                }`}
              >
                <span className="font-bold text-white">Kreditkarte</span>
                {selectedMethod === 'credit_card' && <Check className="w-3.5 h-3.5 text-sky-400" />}
              </button>

              <button
                type="button"
                onClick={() => setSelectedMethod('klarna')}
                className={`p-2.5 rounded-xl border text-left text-xs font-medium flex items-center justify-between transition-all ${
                  selectedMethod === 'klarna'
                    ? 'border-sky-500 bg-sky-950/40 text-white ring-1 ring-sky-500/30'
                    : 'border-slate-800 bg-slate-900 text-slate-300'
                }`}
              >
                <span className="font-bold text-pink-400">Klarna</span>
                {selectedMethod === 'klarna' && <Check className="w-3.5 h-3.5 text-sky-400" />}
              </button>

              <button
                type="button"
                onClick={() => setSelectedMethod('paysafecard')}
                className={`p-2.5 rounded-xl border text-left text-xs font-medium flex items-center justify-between transition-all ${
                  selectedMethod === 'paysafecard'
                    ? 'border-sky-500 bg-sky-950/40 text-white ring-1 ring-sky-500/30'
                    : 'border-slate-800 bg-slate-900 text-slate-300'
                }`}
              >
                <span className="font-bold text-sky-400">Paysafecard</span>
                {selectedMethod === 'paysafecard' && <Check className="w-3.5 h-3.5 text-sky-400" />}
              </button>

              <button
                type="button"
                onClick={() => setSelectedMethod('sofort')}
                className={`p-2.5 rounded-xl border text-left text-xs font-medium flex items-center justify-between transition-all ${
                  selectedMethod === 'sofort'
                    ? 'border-sky-500 bg-sky-950/40 text-white ring-1 ring-sky-500/30'
                    : 'border-slate-800 bg-slate-900 text-slate-300'
                }`}
              >
                <span className="font-bold text-amber-300">Sofortüberweisung</span>
                {selectedMethod === 'sofort' && <Check className="w-3.5 h-3.5 text-sky-400" />}
              </button>
            </div>
          </div>

          <button
            onClick={handleDeposit}
            disabled={isProcessing}
            className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>
              {isProcessing
                ? 'Zahlung wird verarbeitet...'
                : `Jetzt ${topUpAmount},00 € sicher aufladen`}
            </span>
          </button>
        </div>
      </div>

      {/* Transaction History Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <Receipt className="w-5 h-5 text-sky-400" />
              <span>Zahlungsverlauf & Rechnungen</span>
            </h3>
            <p className="text-xs text-slate-400">
              Übersicht aller Käufe, Rechnungen und Guthabenbuchungen
            </p>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {transactions.length} Buchungen
          </span>
        </div>

        {transactions.length === 0 ? (
          <div className="p-8 text-center rounded-2xl border border-dashed border-slate-800 bg-[#0b1020]/40 text-xs text-slate-400 space-y-1">
            <p className="font-semibold text-slate-300">Bisher wurden keine Zahlungen getätigt.</p>
            <p>Sobald du einen Server bestellst oder Guthaben einzahlst, erscheint die Buchung hier.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-[#0f172a]/90">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#0a0f1d] border-b border-slate-800 text-slate-400 uppercase font-semibold text-[11px]">
                <tr>
                  <th className="py-3 px-4">Rechnungs-Nr.</th>
                  <th className="py-3 px-4">Datum & Uhrzeit</th>
                  <th className="py-3 px-4">Beschreibung</th>
                  <th className="py-3 px-4">Zahlungsart</th>
                  <th className="py-3 px-4">Betrag</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-sky-400">
                      {tx.invoiceNumber}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 font-mono">
                      {tx.date}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-white">
                      {tx.description}
                    </td>
                    <td className="py-3.5 px-4 uppercase font-bold text-[11px] text-slate-400">
                      {tx.method}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-white">
                      {formatCurrency(tx.amount)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        <Check className="w-3 h-3" />
                        Erledigt
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
