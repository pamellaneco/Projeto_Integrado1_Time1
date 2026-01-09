// src/App.jsx

import React from 'react';
import { Toaster } from 'react-hot-toast';
import DashboardLayout from './components/DashboardLayout';
import EmployeesTable from './components/EmployeesTable';
import ScalesPage from './pages/ScalesPage';
import DashboardPage from './pages/DashboardPage';

// Roteamento mínimo dentro do Dashboard: mostra a página correta
// quando o usuário está no dashboard (hashs: #/dashboard, #/funcionarios, #/escalas)
function App() {
  const [hash, setHash] = React.useState(window.location.hash || '#/dashboard');

  React.useEffect(() => {
    const onHash = () => setHash(window.location.hash || '#/dashboard');
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  let Page = <DashboardPage />;
  if (hash === '#/escalas') Page = <ScalesPage />;
  if (hash === '#/dashboard' || hash === '#/inicio') Page = <DashboardPage />;
  if (hash === '#/funcionarios') Page = <EmployeesTable />;

  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#FFFFFF',
            color: '#2A3E4B',
            border: '1px solid #e9ecef',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            fontSize: '14px',
            fontWeight: '500',
          },
          success: {
            duration: 3000,
            style: {
              background: '#D1E7DD',
              color: '#0F5132',
              border: '1px solid #A3CFBB',
            },
            iconTheme: {
              primary: '#0F5132',
              secondary: '#D1E7DD',
            },
          },
          error: {
            duration: 4000,
            style: {
              background: '#FFEBEE',
              color: '#C62828',
              border: '1px solid #EF5350',
            },
            iconTheme: {
              primary: '#C62828',
              secondary: '#FFEBEE',
            },
          },
          loading: {
            style: {
              background: '#FFFFFF',
              color: '#2A3E4B',
              border: '1px solid #ced4da',
            },
            iconTheme: {
              primary: '#2A3E4B',
              secondary: '#FFFFFF',
            },
          },
        }}
      />
      <DashboardLayout>
        {Page}
      </DashboardLayout>
    </>
  );
}

export default App;