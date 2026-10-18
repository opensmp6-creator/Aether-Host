import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  ServerInstance,
  PaymentTransaction,
  TestServerRequest,
  SupportTicket,
  NavigationTab,
  ServerCategory,
  PaymentMethod,
} from '../types';
import {
  calculateMonthlyPrice,
  generateIpAddress,
  generateRandomPassword,
  CATEGORIES,
} from '../utils/categories';

interface AppContextType {
  // Navigation & Role
  currentTab: NavigationTab;
  setCurrentTab: (tab: NavigationTab) => void;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
  userRole: 'user' | 'admin';
  setUserRole: (role: 'user' | 'admin') => void;

  // Data State
  servers: ServerInstance[];
  balance: number;
  transactions: PaymentTransaction[];
  testRequests: TestServerRequest[];
  tickets: SupportTicket[];
  teamCanManageTestServers: boolean; // Owner lock setting
  notifications: Array<{ id: string; type: 'success' | 'info' | 'warning' | 'error'; message: string }>;

  // Actions
  orderServer: (config: {
    name: string;
    category: ServerCategory;
    os: string;
    ramGb: number;
    cpuCores: number;
    nvmeGb: number;
    location: string;
    paymentMethod: PaymentMethod;
  }) => Promise<{ success: boolean; serverId?: string; message?: string }>;

  requestTestServer: (data: {
    userName: string;
    userEmail: string;
    category: ServerCategory;
    preferredOs: string;
    purpose: string;
  }) => { success: boolean; message: string };

  approveTestServer: (
    requestId: string,
    actingAs: 'owner' | 'team'
  ) => { success: boolean; message: string };

  rejectTestServer: (
    requestId: string,
    reason: string
  ) => { success: boolean; message: string };

  toggleTeamTestServerPermission: () => void;
  suspendServer: (serverId: string) => void;
  unsuspendServer: (serverId: string) => void;
  deleteServer: (serverId: string) => void;
  restartServer: (serverId: string) => void;
  powerToggleServer: (serverId: string) => void;

  addBalance: (amount: number, method: PaymentMethod, note?: string) => void;
  resetAllData: () => void;
  loadSampleData: () => void;

  createTicket: (data: {
    title: string;
    category: 'Allgemein' | 'Technik' | 'Rechnung' | 'Server';
    priority: 'Niedrig' | 'Mittel' | 'Hoch';
    initialMessage: string;
  }) => void;
  sendTicketReply: (ticketId: string, text: string) => void;
  closeTicket: (ticketId: string) => void;
  dismissNotification: (id: string) => void;
  addToast: (message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'aetherhost_state_v1';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation & UI state
  const [currentTab, setCurrentTab] = useState<NavigationTab>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<'user' | 'admin'>('user');
  const [notifications, setNotifications] = useState<Array<{ id: string; type: 'success' | 'info' | 'warning' | 'error'; message: string }>>([]);

  // Business state - starts clean and empty according to requirements
  const [servers, setServers] = useState<ServerInstance[]>([]);
  const [balance, setBalance] = useState<number>(0.0);
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [testRequests, setTestRequests] = useState<TestServerRequest[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [teamCanManageTestServers, setTeamCanManageTestServers] = useState<boolean>(true);

  // Load from localStorage if present
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.servers) setServers(parsed.servers);
        if (typeof parsed.balance === 'number') setBalance(parsed.balance);
        if (parsed.transactions) setTransactions(parsed.transactions);
        if (parsed.testRequests) setTestRequests(parsed.testRequests);
        if (parsed.tickets) setTickets(parsed.tickets);
        if (typeof parsed.teamCanManageTestServers === 'boolean') {
          setTeamCanManageTestServers(parsed.teamCanManageTestServers);
        }
      }
    } catch {
      // Ignore parse error and keep clean state
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          servers,
          balance,
          transactions,
          testRequests,
          tickets,
          teamCanManageTestServers,
        })
      );
    } catch {
      // Local storage full or unavailable
    }
  }, [servers, balance, transactions, testRequests, tickets, teamCanManageTestServers]);

  const toggleSidebar = () => {
    setIsSidebarCollapsed((prev) => !prev);
  };

  const addToast = (message: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
    const id = Date.now().toString() + Math.random().toString().slice(2, 6);
    setNotifications((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 4500);
  };

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // Order Server
  const orderServer = async (config: {
    name: string;
    category: ServerCategory;
    os: string;
    ramGb: number;
    cpuCores: number;
    nvmeGb: number;
    location: string;
    paymentMethod: PaymentMethod;
  }) => {
    const cost = calculateMonthlyPrice(config.ramGb, config.cpuCores, config.nvmeGb);

    // If paid with guthaben, check balance
    if (config.paymentMethod === 'guthaben') {
      if (balance < cost) {
        addToast(`Guthaben nicht ausreichend (${balance.toFixed(2)} € < ${cost.toFixed(2)} €). Bitte lade dein Guthaben auf oder wähle eine andere Zahlungsart.`, 'error');
        return { success: false, message: 'Unzureichendes Guthaben' };
      }
      setBalance((prev) => Number((prev - cost).toFixed(2)));
    }

    const newServerId = 'srv-' + Math.random().toString(36).substring(2, 9);
    const categoryDefaults = CATEGORIES[config.category];

    const newServer: ServerInstance = {
      id: newServerId,
      name: config.name.trim() || `${categoryDefaults.name} #${Math.floor(Math.random() * 900 + 100)}`,
      category: config.category,
      os: config.os,
      ramGb: config.ramGb,
      cpuCores: config.cpuCores,
      nvmeGb: config.nvmeGb,
      monthlyCost: cost,
      ipAddress: generateIpAddress(),
      port: categoryDefaults.defaultPort,
      status: 'active',
      createdAt: new Date().toLocaleDateString('de-DE'),
      isTestServer: false,
      location: config.location,
      hostname: `${config.category.replace('_', '-')}-${newServerId.slice(4)}.aethercloud.de`,
      rootPassword: generateRandomPassword(),
      uptimeHours: 0,
    };

    const newTransaction: PaymentTransaction = {
      id: 'tx-' + Math.random().toString(36).substring(2, 9),
      amount: cost,
      method: config.paymentMethod,
      type: 'server_purchase',
      description: `Kauf: ${newServer.name} (${config.ramGb}GB RAM, ${config.cpuCores} vCPU)`,
      status: 'completed',
      date: new Date().toLocaleString('de-DE', { dateStyle: 'short', timeStyle: 'short' }),
      invoiceNumber: `INV-2026-${Math.floor(Math.random() * 89999 + 10000)}`,
    };

    setServers((prev) => [newServer, ...prev]);
    setTransactions((prev) => [newTransaction, ...prev]);

    addToast(`Server "${newServer.name}" erfolgreich bereitgestellt! IP: ${newServer.ipAddress}`, 'success');
    return { success: true, serverId: newServerId };
  };

  // 24h Test Server Request
  const requestTestServer = (data: {
    userName: string;
    userEmail: string;
    category: ServerCategory;
    preferredOs: string;
    purpose: string;
  }) => {
    const newReqId = 'req-' + Math.random().toString(36).substring(2, 9);
    const newReq: TestServerRequest = {
      id: newReqId,
      userName: data.userName.trim() || 'Kunde',
      userEmail: data.userEmail.trim(),
      category: data.category,
      preferredOs: data.preferredOs,
      purpose: data.purpose.trim() || 'Projekt-Testlauf',
      status: 'pending',
      requestedAt: new Date().toLocaleString('de-DE', { dateStyle: 'short', timeStyle: 'short' }),
    };

    setTestRequests((prev) => [newReq, ...prev]);
    addToast('24h-Testserver Anfrage erfolgreich übermittelt! Das Team prüft deinen Antrag in Kürze.', 'info');
    return { success: true, message: 'Anfrage eingereicht' };
  };

  // Admin: Approve Test Server
  const approveTestServer = (requestId: string, actingAs: 'owner' | 'team') => {
    // Check Owner Lock!
    if (!teamCanManageTestServers && actingAs === 'team') {
      addToast('Aktion blockiert! Der Inhaber hat die Team-Bearbeitung für Testserver gesperrt.', 'error');
      return { success: false, message: 'Inhaber-Sperre aktiv: Team darf Testserver nicht freigeben.' };
    }

    const req = testRequests.find((r) => r.id === requestId);
    if (!req) return { success: false, message: 'Anfrage nicht gefunden' };

    const catDefaults = CATEGORIES[req.category];
    const newServerId = 'test-srv-' + Math.random().toString(36).substring(2, 8);

    // Calculate 24 hours expiry timestamp
    const expires = new Date();
    expires.setHours(expires.getHours() + 24);

    const testServer: ServerInstance = {
      id: newServerId,
      name: `[24h-Test] ${catDefaults.name}`,
      category: req.category,
      os: req.preferredOs || catDefaults.recommendedOs,
      ramGb: Math.min(catDefaults.defaultRam, 8),
      cpuCores: Math.min(catDefaults.defaultCpu, 4),
      nvmeGb: 30,
      monthlyCost: 0,
      ipAddress: generateIpAddress(),
      port: catDefaults.defaultPort,
      status: 'active',
      createdAt: new Date().toLocaleDateString('de-DE'),
      isTestServer: true,
      testExpiresAt: expires.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) + ' Uhr (Morgen)',
      location: 'Frankfurt am Main (DE)',
      hostname: `test-${req.category.replace('_', '-')}.aethercloud.de`,
      rootPassword: generateRandomPassword(),
      uptimeHours: 0,
    };

    setServers((prev) => [testServer, ...prev]);
    setTestRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? { ...r, status: 'approved', reviewedBy: actingAs === 'owner' ? 'Inhaber (Root)' : 'Team Support', createdServerId: newServerId }
          : r
      )
    );

    addToast(`24h Testserver genehmigt! Server ist live unter ${testServer.ipAddress}.`, 'success');
    return { success: true, message: 'Testserver genehmigt' };
  };

  // Admin: Reject Test Server
  const rejectTestServer = (requestId: string, reason: string) => {
    setTestRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? { ...r, status: 'rejected', rejectionReason: reason || 'Kriterien nicht erfüllt.', reviewedBy: 'Admin Team' }
          : r
      )
    );
    addToast('Testserver-Antrag abgelehnt.', 'info');
    return { success: true, message: 'Antrag abgelehnt' };
  };

  // Toggle Owner Lock for Team Permissions
  const toggleTeamTestServerPermission = () => {
    setTeamCanManageTestServers((prev) => {
      const next = !prev;
      addToast(
        next
          ? 'Inhaber-Einstellung: Team darf Testserver-Anfragen ab sofort bearbeiten.'
          : 'Inhaber-Sperre AKTIV: Team-Bearbeitung für Testserver wurde gesperrt.',
        next ? 'info' : 'warning'
      );
      return next;
    });
  };

  // Server state operations
  const suspendServer = (serverId: string) => {
    setServers((prev) =>
      prev.map((s) => (s.id === serverId ? { ...s, status: 'suspended' } : s))
    );
    addToast(`Server #${serverId} wurde gesperrt (Suspended).`, 'warning');
  };

  const unsuspendServer = (serverId: string) => {
    setServers((prev) =>
      prev.map((s) => (s.id === serverId ? { ...s, status: 'active' } : s))
    );
    addToast(`Server #${serverId} wurde reaktiviert (In Betrieb).`, 'success');
  };

  const deleteServer = (serverId: string) => {
    const srv = servers.find((s) => s.id === serverId);
    setServers((prev) => prev.filter((s) => s.id !== serverId));
    addToast(`Server "${srv?.name || serverId}" wurde gelöscht.`, 'info');
  };

  const powerToggleServer = (serverId: string) => {
    setServers((prev) =>
      prev.map((s) => {
        if (s.id !== serverId) return s;
        if (s.status === 'suspended') {
          addToast('Gesperrte Server können nicht gestartet werden. Bitte an den Admin wenden.', 'error');
          return s;
        }
        const newStatus = s.status === 'active' ? 'stopping' : 'active';
        return { ...s, status: newStatus };
      })
    );
  };

  const restartServer = (serverId: string) => {
    setServers((prev) =>
      prev.map((s) => (s.id === serverId ? { ...s, status: 'restarting' } : s))
    );
    addToast('Server wird neu gestartet...', 'info');
    setTimeout(() => {
      setServers((prev) =>
        prev.map((s) => (s.id === serverId && s.status !== 'suspended' ? { ...s, status: 'active' } : s))
      );
      addToast('Server Neustart abgeschlossen!', 'success');
    }, 1500);
  };

  // Guthaben / Balance Top-Up
  const addBalance = (amount: number, method: PaymentMethod, note: string = 'Guthaben-Aufladung') => {
    const formattedAmount = Number(amount.toFixed(2));
    setBalance((prev) => Number((prev + formattedAmount).toFixed(2)));

    const tx: PaymentTransaction = {
      id: 'tx-dep-' + Math.random().toString(36).substring(2, 9),
      amount: formattedAmount,
      method: method,
      type: method === 'guthaben' ? 'admin_credit' : 'balance_deposit',
      description: note,
      status: 'completed',
      date: new Date().toLocaleString('de-DE', { dateStyle: 'short', timeStyle: 'short' }),
      invoiceNumber: `DEP-2026-${Math.floor(Math.random() * 89999 + 10000)}`,
    };

    setTransactions((prev) => [tx, ...prev]);
    addToast(`Guthaben um ${formattedAmount.toFixed(2)} € erfolgreich aufgeladen!`, 'success');
  };

  // Reset to pristine zero empty state as requested
  const resetAllData = () => {
    setServers([]);
    setBalance(0.0);
    setTransactions([]);
    setTestRequests([]);
    setTickets([]);
    setTeamCanManageTestServers(true);
    localStorage.removeItem(STORAGE_KEY);
    addToast('Alle Daten wurden auf Werkszustand (0 Server, 0,00 € Guthaben, 0 Zahlungen) zurückgesetzt.', 'info');
  };

  // Load realistic sample data for instant exploration
  const loadSampleData = () => {
    const sampleServers: ServerInstance[] = [
      {
        id: 'srv-vps101',
        name: 'Debian Production Cloud VPS',
        category: 'linux_vps',
        os: 'Debian 12 Bookworm',
        ramGb: 8,
        cpuCores: 4,
        nvmeGb: 100,
        monthlyCost: 17.0,
        ipAddress: '45.132.84.19',
        port: 22,
        status: 'active',
        createdAt: '12.10.2026',
        isTestServer: false,
        location: 'Frankfurt am Main (DE)',
        hostname: 'vps-node01.aethercloud.de',
        rootPassword: generateRandomPassword(),
        uptimeHours: 142,
      },
      {
        id: 'srv-mc202',
        name: 'SMP Minecraft Community',
        category: 'minecraft',
        os: 'Ubuntu 24.04 LTS (Java 21 LTS)',
        ramGb: 12,
        cpuCores: 4,
        nvmeGb: 80,
        monthlyCost: 19.4,
        ipAddress: '45.132.99.112',
        port: 25565,
        status: 'active',
        createdAt: '15.10.2026',
        isTestServer: false,
        location: 'Frankfurt am Main (DE)',
        hostname: 'mc-smp.aethercloud.de',
        rootPassword: generateRandomPassword(),
        uptimeHours: 72,
      },
      {
        id: 'srv-fivem303',
        name: 'German Night RP (txAdmin)',
        category: 'fivem',
        os: 'Windows Server 2022 Standard',
        ramGb: 16,
        cpuCores: 6,
        nvmeGb: 120,
        monthlyCost: 26.6,
        ipAddress: '45.132.140.7',
        port: 30120,
        status: 'suspended',
        createdAt: '08.10.2026',
        isTestServer: false,
        location: 'Amsterdam (NL)',
        hostname: 'fivem-rp.aethercloud.de',
        rootPassword: generateRandomPassword(),
        uptimeHours: 0,
      },
    ];

    const sampleTransactions: PaymentTransaction[] = [
      {
        id: 'tx-init-01',
        amount: 50.0,
        method: 'paypal',
        type: 'balance_deposit',
        description: 'PayPal Sofortaufladung',
        status: 'completed',
        date: '08.10.2026, 14:20',
        invoiceNumber: 'DEP-2026-88412',
      },
      {
        id: 'tx-init-02',
        amount: 26.6,
        method: 'guthaben',
        type: 'server_purchase',
        description: 'Kauf: German Night RP (16GB RAM, 6 vCPU)',
        status: 'completed',
        date: '08.10.2026, 14:22',
        invoiceNumber: 'INV-2026-55319',
      },
      {
        id: 'tx-init-03',
        amount: 17.0,
        method: 'credit_card',
        type: 'server_purchase',
        description: 'Kauf: Debian Production Cloud VPS',
        status: 'completed',
        date: '12.10.2026, 18:05',
        invoiceNumber: 'INV-2026-61208',
      },
    ];

    const sampleRequests: TestServerRequest[] = [
      {
        id: 'req-demo-1',
        userName: 'Max Mustermann',
        userEmail: 'max@gaming-hub.de',
        category: 'minecraft',
        preferredOs: 'Ubuntu 24.04 LTS (Java 21 LTS)',
        purpose: 'Testen unseres neuen Paper 1.21.3 Plugin-Pakets',
        status: 'pending',
        requestedAt: 'Vor 20 Minuten',
      },
      {
        id: 'req-demo-2',
        userName: 'Elena_Dev',
        userEmail: 'elena@botstudio.io',
        category: 'discord_bot',
        preferredOs: 'Alpine Linux 3.20 (Minimal)',
        purpose: 'Stresstest für Discord Ticket-Bot mit 10.000 Membern',
        status: 'pending',
        requestedAt: 'Vor 1 Stunde',
      },
    ];

    const sampleTickets: SupportTicket[] = [
      {
        id: 't-101',
        ticketNumber: 'TICK-8849',
        title: 'Portfreigabe für zusätzlichen RCON Port',
        category: 'Technik',
        priority: 'Mittel',
        status: 'in_progress',
        createdAt: 'Gestern, 16:30',
        updatedAt: 'Heute, 09:15',
        messages: [
          {
            id: 'm-1',
            sender: 'user',
            authorName: 'Kunde',
            text: 'Hallo Support-Team, könnt ihr mir bitte Port 25575 für RCON auf meinem Minecraft Server freischalten?',
            timestamp: 'Gestern, 16:30',
          },
          {
            id: 'm-2',
            sender: 'support',
            authorName: 'Lukas (AetherHost Tech)',
            text: 'Guten Tag! Der Port 25575 ist standardmäßig in der Firewall bereits geroutet. Du musst lediglich in deiner server.properties "enable-rcon=true" und "rcon.port=25575" einstellen.',
            timestamp: 'Heute, 09:15',
          },
        ],
      },
    ];

    setServers(sampleServers);
    setBalance(25.4);
    setTransactions(sampleTransactions);
    setTestRequests(sampleRequests);
    setTickets(sampleTickets);
    addToast('Beispieldaten erfolgreich geladen! (3 Server, Guthaben, Zahlungen & Testanfragen)', 'success');
  };

  // Support Tickets
  const createTicket = (data: {
    title: string;
    category: 'Allgemein' | 'Technik' | 'Rechnung' | 'Server';
    priority: 'Niedrig' | 'Mittel' | 'Hoch';
    initialMessage: string;
  }) => {
    const num = Math.floor(Math.random() * 8999 + 1000);
    const newTicket: SupportTicket = {
      id: 'tick-' + Math.random().toString(36).substring(2, 8),
      ticketNumber: `TICK-${num}`,
      title: data.title,
      category: data.category,
      priority: data.priority,
      status: 'open',
      createdAt: 'Gerade eben',
      updatedAt: 'Gerade eben',
      messages: [
        {
          id: 'msg-' + Date.now(),
          sender: 'user',
          authorName: 'Du',
          text: data.initialMessage,
          timestamp: new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }),
        },
      ],
    };

    setTickets((prev) => [newTicket, ...prev]);
    addToast(`Ticket #${newTicket.ticketNumber} wurde erfolgreich eröffnet!`, 'success');

    // Simulate auto acknowledgment from bot/support
    setTimeout(() => {
      setTickets((prev) =>
        prev.map((t) => {
          if (t.id !== newTicket.id) return t;
          return {
            ...t,
            status: 'in_progress',
            updatedAt: 'Gerade eben',
            messages: [
              ...t.messages,
              {
                id: 'msg-reply-' + Date.now(),
                sender: 'support',
                authorName: 'Support Bot (Auto-Antwort)',
                text: 'Vielen Dank für deine Nachricht! Ein Mitarbeiter aus dem Fachbereich hat dein Ticket übernommen und antwortet in der Regel innerhalb weniger Minuten.',
                timestamp: new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }),
              },
            ],
          };
        })
      );
    }, 1800);
  };

  const sendTicketReply = (ticketId: string, text: string) => {
    if (!text.trim()) return;

    setTickets((prev) =>
      prev.map((t) => {
        if (t.id !== ticketId) return t;
        return {
          ...t,
          updatedAt: 'Gerade eben',
          messages: [
            ...t.messages,
            {
              id: 'msg-' + Date.now(),
              sender: 'user',
              authorName: 'Du',
              text: text.trim(),
              timestamp: new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }),
            },
          ],
        };
      })
    );

    // Support simulated answer
    setTimeout(() => {
      setTickets((prev) =>
        prev.map((t) => {
          if (t.id !== ticketId) return t;
          return {
            ...t,
            messages: [
              ...t.messages,
              {
                id: 'msg-staff-' + Date.now(),
                sender: 'support',
                authorName: 'Support Agent (Julian)',
                text: 'Danke für das Update! Wir haben die Server-Logs geprüft und die Konfiguration entsprechend angepasst. Bitte teste es jetzt erneut.',
                timestamp: new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }),
              },
            ],
          };
        })
      );
    }, 2000);
  };

  const closeTicket = (ticketId: string) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === ticketId ? { ...t, status: 'closed' } : t))
    );
    addToast('Ticket wurde geschlossen.', 'info');
  };

  return (
    <AppContext.Provider
      value={{
        currentTab,
        setCurrentTab,
        isSidebarCollapsed,
        setIsSidebarCollapsed,
        toggleSidebar,
        userRole,
        setUserRole,
        servers,
        balance,
        transactions,
        testRequests,
        tickets,
        teamCanManageTestServers,
        notifications,
        orderServer,
        requestTestServer,
        approveTestServer,
        rejectTestServer,
        toggleTeamTestServerPermission,
        suspendServer,
        unsuspendServer,
        deleteServer,
        restartServer,
        powerToggleServer,
        addBalance,
        resetAllData,
        loadSampleData,
        createTicket,
        sendTicketReply,
        closeTicket,
        dismissNotification,
        addToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
