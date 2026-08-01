import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Topbar } from './Topbar';
import { Sidebar } from './Sidebar';


export const Layout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="app-layout">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <main className={`main-content ${isSidebarOpen ? 'shifted' : ''}`}>
        <Topbar onMenuClick={() => setIsSidebarOpen(true)} />
        <div className="content-area">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
