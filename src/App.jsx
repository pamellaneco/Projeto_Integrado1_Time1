// src/App.jsx

import DashboardLayout from './components/DashboardLayout';
import EmployeesTable from './components/EmployeesTable';
// Não precisamos mais do App.css se ele não tiver nada
// import './App.css';

function App() {
  return (
    // O DashboardLayout AGORA é o elemento principal.
    <DashboardLayout>
      <EmployeesTable />
    </DashboardLayout>
  );
}

export default App;