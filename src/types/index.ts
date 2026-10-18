export type ServerCategory = 
  | 'minecraft'
  | 'linux_vps'
  | 'discord_bot'
  | 'fivem'
  | 'voice_teamspeak';

export type ServerStatus = 'active' | 'suspended' | 'stopping' | 'restarting';

export interface ServerInstance {
  id: string;
  name: string;
  category: ServerCategory;
  os: string;
  ramGb: number;
  cpuCores: number;
  nvmeGb: number;
  monthlyCost: number;
  ipAddress: string;
  port: number;
  status: ServerStatus;
  createdAt: string;
  isTestServer: boolean;
  testExpiresAt?: string;
  location: string;
  hostname: string;
  rootPassword?: string;
  uptimeHours: number;
}

export type PaymentMethod = 
  | 'paypal' 
  | 'credit_card' 
  | 'klarna' 
  | 'paysafecard' 
  | 'sofort' 
  | 'guthaben';

export interface PaymentTransaction {
  id: string;
  amount: number;
  method: PaymentMethod;
  type: 'server_purchase' | 'balance_deposit' | 'admin_credit' | 'server_renewal';
  description: string;
  status: 'completed' | 'pending';
  date: string;
  invoiceNumber: string;
}

export type TestRequestStatus = 'pending' | 'approved' | 'rejected';

export interface TestServerRequest {
  id: string;
  userName: string;
  userEmail: string;
  category: ServerCategory;
  preferredOs: string;
  purpose: string;
  status: TestRequestStatus;
  requestedAt: string;
  reviewedBy?: string;
  rejectionReason?: string;
  createdServerId?: string;
}

export interface SupportMessage {
  id: string;
  sender: 'user' | 'support' | 'admin';
  authorName: string;
  text: string;
  timestamp: string;
}

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  title: string;
  category: 'Allgemein' | 'Technik' | 'Rechnung' | 'Server';
  priority: 'Niedrig' | 'Mittel' | 'Hoch';
  status: 'open' | 'in_progress' | 'closed';
  createdAt: string;
  updatedAt: string;
  messages: SupportMessage[];
}

export type NavigationTab = 
  | 'dashboard'
  | 'my_services'
  | 'tickets'
  | 'order_server'
  | 'balance'
  | 'admin_panel'
  | 'server_deployment';
