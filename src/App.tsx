import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './views/DashboardView';
import { MyServicesView } from './views/MyServicesView';
import { TicketsView } from './views/TicketsView';
import { OrderConfiguratorView } from './views/OrderConfiguratorView';
import { BalanceView } from './views/BalanceView';
import { AdminPanelView } from './views/AdminPanelView';
import { ServerDeploymentView } from './views/ServerDeploymentView';

const MainLayout: React.FC = () => {
  const { currentTab } = useApp();

  const renderContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'my_services':
        return <MyServicesView />;
      case 'tickets':
        return <TicketsView />;
      case 'order_server':
        return <OrderConfiguratorView />;
      case 'balance':
        return <BalanceView />;
      case 'admin_panel':
        return <AdminPanelView />;
      case 'server_deployment':
        return <ServerDeploymentView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#080d1a] text-slate-100">
      {/* Collapsible Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#080d1a]">
        {/* Top Header */}
        <Header />

        {/* Viewport Router Content */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-b from-[#080d1a] to-[#060a14]">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
