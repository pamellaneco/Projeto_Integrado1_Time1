import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import EmployeesTable from './components/EmployeesTable'
import DashboardLayout from './components/DashboardLayout';


import './index.css'

import './demos/ipc'
// If you want use Node.js, the`nodeIntegration` needs to be enabled in the Main process.
// import './demos/node'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <DashboardLayout>
    <EmployeesTable/>
    </DashboardLayout>
  </React.StrictMode>,
)

postMessage({ payload: 'removeLoading' }, '*')

// src/App.jsx (ou seu arquivo principal)