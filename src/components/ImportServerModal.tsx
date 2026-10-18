import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ServerCategory } from '../types';
import { CATEGORIES, ALL_OS_OPTIONS } from '../utils/categories';
import {
  Server,
  PlusCircle,
  Check,
  X,
  Cpu,
  HardDrive,
  Zap,
  Globe,
  Lock,
  Sparkles,
} from 'lucide-react';

interface ImportServerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ImportServerModal: React.FC<ImportServerModalProps> = ({ isOpen, onClose }) => {
  const { importExistingServer } = useApp();

  const [name, setName] = useState<string>('Mein laufender Ubuntu Server');
  const [category, setCategory] = useState<ServerCategory>('linux_vps');
  const [os, setOs] = useState<string>('Ubuntu 24.04 LTS (Java 21 LTS)');
  const [ipAddress, setIpAddress] = useState<string>('192.168.2.76');
  const [port, setPort] = useState<number>(22);
  const [ramGb, setRamGb] = useState<number>(8);
  const [cpuCores, setCpuCores] = useState<number>(4);
  const [nvmeGb, setNvmeGb] = useState<number>(100);
  const [monthlyCost, setMonthlyCost] = useState<number>(0);
  const [rootPassword, setRootPassword] = useState<string>('Vorhanden');
  const [location, setLocation] = useState<string>('Lokaler Ubuntu Server (192.168.2.76)');

  if (!isOpen) return null;

  const handleApplyPreset = (type: 'ubuntu_local' | 'minecraft_local' | 'discord_bot') => {
    if (type === 'ubuntu_local') {
      setName('Ubuntu Host Server');
      setCategory('linux_vps');
      setOs('Ubuntu 24.04 LTS');
      setIpAddress('192.168.2.76');
      setPort(22);
      setRamGb(16);
      setCpuCores(4);
      setNvmeGb(240);
      setMonthlyCost(0);
      setLocation('Lokaler Heimserver (192.168.2.76)');
    } else if (type === 'minecraft_local') {
      setName('Minecraft Community SMP');
      setCategory('minecraft');
      setOs('Ubuntu 24.04 LTS (Java 21 LTS)');
      setIpAddress('192.168.2.76');
      setPort(25565);
      setRamGb(8);
      setCpuCores(4);
      setNvmeGb(50);
      setMonthlyCost(0);
      setLocation('Heimserver Minecraft');
    } else if (type === 'discord_bot') {
      setName('24/7 Discord Ticket Bot');
      setCategory('discord_bot');
      setOs('Alpine Linux 3.20 (Minimal)');
      setIpAddress('192.168.2.76');
      setPort(3000);
      setRamGb(2);
      setCpuCores(1);
      setNvmeGb(20);
      setMonthlyCost(0);
      setLocation('Docker Container');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    importExistingServer({
      name,
      category,
      os,
      ipAddress,
      port,
      ramGb,
      cpuCores,
      nvmeGb,
      monthlyCost,
      rootPassword,
      location,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-[#0e172a] border border-slate-700 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 bg-[#0a0f1d] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Bereits laufenden Server hinzufügen</h3>
              <p className="text-xs text-slate-400">
                Binde deinen vorhandenen Server direkt als aktive Instanz ein
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg bg-slate-800/80"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1 text-xs">
          {/* Quick Presets */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Schnell-Vorlagen:
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleApplyPreset('ubuntu_local')}
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 hover:bg-emerald-950/20 text-slate-200 text-left font-medium transition-all"
              >
                <span className="font-bold text-white block">Ubuntu Server</span>
                <span className="text-[10px] text-emerald-400 font-mono">192.168.2.76:22</span>
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset('minecraft_local')}
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 hover:bg-emerald-950/20 text-slate-200 text-left font-medium transition-all"
              >
                <span className="font-bold text-white block">Minecraft SMP</span>
                <span className="text-[10px] text-emerald-400 font-mono">Port 25565</span>
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset('discord_bot')}
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 hover:bg-emerald-950/20 text-slate-200 text-left font-medium transition-all"
              >
                <span className="font-bold text-white block">Discord Bot</span>
                <span className="text-[10px] text-emerald-400 font-mono">Node.js Bot</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            {/* Name */}
            <div>
              <label className="block font-medium text-slate-300 mb-1">
                Server-Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            {/* Kategorie */}
            <div>
              <label className="block font-medium text-slate-300 mb-1">
                Kategorie *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ServerCategory)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:border-emerald-500 focus:outline-none"
              >
                {(Object.keys(CATEGORIES) as ServerCategory[]).map((catKey) => (
                  <option key={catKey} value={catKey}>
                    {CATEGORIES[catKey].name}
                  </option>
                ))}
              </select>
            </div>

            {/* IP Address */}
            <div>
              <label className="block font-medium text-slate-300 mb-1">
                IP-Adresse / Hostname *
              </label>
              <input
                type="text"
                required
                value={ipAddress}
                onChange={(e) => setIpAddress(e.target.value)}
                placeholder="192.168.2.76 oder mein-server.de"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono focus:border-emerald-500 focus:outline-none"
              />
            </div>

            {/* Port */}
            <div>
              <label className="block font-medium text-slate-300 mb-1">
                Port *
              </label>
              <input
                type="number"
                required
                value={port}
                onChange={(e) => setPort(Number(e.target.value))}
                placeholder="22, 25565, 30120..."
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono focus:border-emerald-500 focus:outline-none"
              />
            </div>

            {/* OS */}
            <div>
              <label className="block font-medium text-slate-300 mb-1">
                Betriebssystem / Software
              </label>
              <select
                value={os}
                onChange={(e) => setOs(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:border-emerald-500 focus:outline-none"
              >
                {ALL_OS_OPTIONS.map((osOption) => (
                  <option key={osOption} value={osOption}>
                    {osOption}
                  </option>
                ))}
              </select>
            </div>

            {/* Location */}
            <div>
              <label className="block font-medium text-slate-300 mb-1">
                Standort / Notiz
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Lokaler Server oder RZ"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Hardware Specs */}
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
            <span className="font-semibold text-slate-300 block uppercase tracking-wider text-[11px]">
              Hardware-Ressourcen:
            </span>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">RAM (GB)</label>
                <input
                  type="number"
                  min="1"
                  max="256"
                  value={ramGb}
                  onChange={(e) => setRamGb(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">vCPU Kerne</label>
                <input
                  type="number"
                  min="1"
                  max="64"
                  value={cpuCores}
                  onChange={(e) => setCpuCores(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Speicher (GB)</label>
                <input
                  type="number"
                  min="10"
                  max="2000"
                  value={nvmeGb}
                  onChange={(e) => setNvmeGb(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono font-bold"
                />
              </div>
            </div>
          </div>

          {/* Optional Costs & Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-slate-300 mb-1">
                Monatliche Kosten in € (0,00 € für eigenen Server)
              </label>
              <input
                type="number"
                step="0.01"
                value={monthlyCost}
                onChange={(e) => setMonthlyCost(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-300 mb-1">
                Root Passwort / Notiz (optional)
              </label>
              <input
                type="text"
                value={rootPassword}
                onChange={(e) => setRootPassword(e.target.value)}
                placeholder="Passwort hinterlegen..."
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-600/20 flex items-center gap-1.5 transition-all"
            >
              <Check className="w-4 h-4" />
              <span>Server als aktiv einbinden</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
