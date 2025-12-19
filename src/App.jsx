// src/App.jsx

import React from 'react';
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
    <DashboardLayout>
      {Page}
    </DashboardLayout>
  );
}

export default App;