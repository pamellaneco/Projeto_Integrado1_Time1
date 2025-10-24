// src/components/DashboardLayout.jsx - NOVA ESTRUTURA

import React from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import './DashboardLayout.css';

function DashboardLayout({ children }) {
  return (
    // Container principal que empilha TopBar e o corpo verticalmente
    <div className="dashboard-layout">
      <TopBar />
      {/* Novo container para a parte de baixo (Sidebar + Conteúdo) */}
      <div className="dashboard-body">
        <Sidebar />
        <main className="page-content">
          {children}
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;