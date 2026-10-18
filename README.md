# 🚀 Aether-Host — Cloud & VPS Server Hosting Portal

[![GitHub Repository](https://img.shields.io/badge/GitHub-opensmp6--creator%2FAether--Host-181717?style=for-the-badge&logo=github)](https://github.com/opensmp6-creator/Aether-Host)
[![Node.js](https://img.shields.io/badge/Node.js-22.x_LTS-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS_v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

Ein modernes, voll responsives **Cloud- & Game-Server Hosting Dashboard** im eleganten Navy/Dark-Design mit integriertem Hardware-Konfigurator, 24h-Testserver-Workflow, Inhaber-Sperre, Guthabensystem und Admin-Steuerung.

---

## ✨ Features im Überblick

- 🌌 **Modernes Navy/Dark-Design**: Speziell gestaltetes UI mit abgerundeten Karten, Glassmorphism und blauen Akzenten.
- 📐 **Einklappbare Menüleiste**: Umschalten per Klick auf `<<` und `>>` zwischen Text- und kompakter Icon-Ansicht.
- 🖥️ **Kunden-Dashboard**:
  - Leerer Startzustand mit 0,00 € und 0 aktiven Servern.
  - 4 Übersichtskarten (Dienste, Guthaben, Aktive Dienste, Zahlungen).
  - 2 Info-Banner für Neubestellung und Support.
  - VPS-Serverliste mit Live-IP, Port, monatlichen Kosten und Status (**• In Betrieb** oder **• Suspended**).
  - Integrierte Web-Konsole, Neustart- und Power-Steuerung.
- ⚙️ **Server-Konfigurator**:
  - Kategorien: **Minecraft**, **Linux VPS**, **Discord Bot**, **FiveM**, **Voice/TeamSpeak**.
  - Automatische Betriebssystem-Empfehlung (Debian 12, Ubuntu 24.04 Java 21, Alpine, Windows Server) mit freier Auswahl.
  - Hardware-Schieberegler mit Live-Preisberechnung (RAM, vCPU, NVMe SSD).
  - Zahlungsarten: PayPal, Kreditkarte, Klarna, Paysafecard, Sofortüberweisung und internes Guthaben.
  - Konfigurations-Download als `.json` oder einsatzbereite `docker-compose.yml`.
- ⏱️ **24h-Testserver & Inhaber-Sperre**:
  - Kostenlose 24h-Testanfrage direkt im Bestellmenü.
  - **Owner-Sperre**: Der Inhaber kann festlegen, ob Teammitglieder Testserver freischalten dürfen oder ob die Freigabe gesperrt ist.
- 🛡️ **Admin-Panel**:
  - Kundenserver sperren (**Suspend**) und entsperren (**Unsuspend**).
  - Testserver-Anträge prüfen, genehmigen oder ablehnen.
  - Manuelle Guthaben-Gutschriften (+10 €, +25 €, +50 € oder frei wählbar).
  - Daten auf Werkszustand leeren oder Beispieldaten laden.
- 🔌 **Host-Node Manager & Full-Stack Server**:
  - Echte Root-Server per IP, SSH und Docker anbinden inklusive Live-Latenztest.

---

## ⚡ Schnell-Installation auf deinem Linux Server

### 1. Per Git-Klon & 1-Klick Installer (Empfohlen für Ubuntu / Debian / AlmaLinux)

Verbinde dich per SSH mit deinem Server (`ssh root@<Deine-Server-IP>`) und führe folgende Befehle aus:

```bash
# 1. Repository klonen
git clone https://github.com/opensmp6-creator/Aether-Host.git /var/www/aether-host
cd /var/www/aether-host

# 2. Automatisches Installationsskript ausführen
sudo bash install.sh
```

Das Skript installiert automatisch Node.js 22 LTS, baut die Web-Applikation und richtet den Systemd-Hintergrunddienst `aetherhost.service` ein.

Dein Dashboard ist sofort unter **`http://<Deine-Server-IP>:3000`** erreichbar!

---

### 2. Schnelle One-Liner Installation via cURL

```bash
curl -sSL https://raw.githubusercontent.com/opensmp6-creator/Aether-Host/main/install.sh | sudo bash
```

---

### 3. Starten mit Docker & Docker Compose

Falls du Docker auf deinem Server nutzt:

```bash
# Repository klonen
git clone https://github.com/opensmp6-creator/Aether-Host.git
cd Aether-Host

# Im Hintergrund starten
docker compose up -d --build
```

---

## 🌐 Eigene Domain & Kostenloses SSL (Nginx Reverse Proxy)

Um das Dashboard unter einer eigenen Domain (z. B. `https://mein-hosting.de`) zu betreiben:

1. Kopiere die beiliegende `nginx.conf`:
```bash
sudo cp nginx.conf /etc/nginx/sites-available/aetherhost.conf
sudo ln -s /etc/nginx/sites-available/aetherhost.conf /etc/nginx/sites-enabled/
```

2. Passe den `server_name` in `/etc/nginx/sites-available/aetherhost.conf` an deine Domain an.

3. Nginx neu laden und SSL-Zertifikat mit Certbot aktivieren:
```bash
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d mein-hosting.de
```

---

## 🛠️ Lokale Entwicklung

```bash
# Repository klonen
git clone https://github.com/opensmp6-creator/Aether-Host.git
cd Aether-Host

# Abhängigkeiten installieren
npm install

# Entwicklungsserver starten (Port 3000)
npm run dev

# Fullstack Production Build & Server starten
npm run build
npm run start
```

---

## 📂 Projektstruktur

```text
├── Dockerfile                  # Multi-Stage Docker Build
├── docker-compose.yml          # Docker Compose Konfiguration
├── install.sh                  # Automatischer Linux Installer
├── nginx.conf                  # Nginx VHost mit WebSocket & SSL Support
├── aetherhost.service          # Systemd Service Unit
├── server.ts                   # Express Backend & API-Endpunkte
├── package.json                # Abhängigkeiten & Scripts
├── src/
│   ├── components/             # Sidebar, Header, Modals
│   ├── context/                # AppContext (Zustand, Server, Finanzen)
│   ├── utils/                  # Kategorien, Preise, Docker-Generierung
│   ├── views/                  # Dashboard, Bestellung, Admin, Server-Setup
│   ├── App.tsx                 # Hauptlayout & Routing
│   └── main.tsx                # React Einstiegspunkt
```

---

## 👤 Autor & Repository

* **GitHub:** [opensmp6-creator](https://github.com/opensmp6-creator)
* **Projekt-Repository:** [opensmp6-creator/Aether-Host](https://github.com/opensmp6-creator/Aether-Host)
* **Lizenz:** MIT
