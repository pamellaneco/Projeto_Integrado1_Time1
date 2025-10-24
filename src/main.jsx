import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import EmployeesTable from './components/EmployeesTable'
import DashboardLayout from './components/DashboardLayout';


import './index.css'
import './demos/ipc'
import LoginPage from './pages/LoginPage'

function Root() {
  const [route, setRoute] = React.useState(window.location.hash || '#/')

  React.useEffect(() => {
    const onHash = () => setRoute(window.location.hash || '#/')
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  // rotas mínimas: '#/dashboard' -> App, qualquer outra -> LoginPage
  if (route === '#/dashboard' || route === '#dashboard') {
    return <App />
  }

  return <LoginPage />
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <DashboardLayout>
      <EmployeesTable />
    </DashboardLayout>
  </React.StrictMode>,
)

postMessage({ payload: 'removeLoading' }, '*')

// src/App.jsx (ou seu arquivo principal)