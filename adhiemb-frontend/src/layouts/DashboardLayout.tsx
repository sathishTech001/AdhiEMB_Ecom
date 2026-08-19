import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';

export function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-dark-bg">
      {/* Sidebar for desktop and mobile */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      {/* Main content wrapper */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        
        {/* Main scrollable content area */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-slate-50 p-4 md:p-6 dark:bg-dark-bg">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
