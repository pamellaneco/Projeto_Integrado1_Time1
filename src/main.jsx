import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import EmployeesTable from './components/EmployeesTable'
import DashboardLayout from './components/DashboardLayout';


import './index.css'
import './demos/ipc'
import LoginPage from './pages/LoginPage'

function Root() {
  // use the current hash if present, otherwise default to login
  const [route, setRoute] = React.useState(window.location.hash || '#/')

  // React.useEffect(() => {
  //   const onHash = () => setRoute(window.location.hash || '#/login')
  //   window.addEventListener('hashchange', onHash)
  //   return () => window.removeEventListener('hashchange', onHash)
  // }, [])

  // rotas mínimas:
  // - '#/login' -> LoginPage
  // - qualquer hash que comece com '#/' (ex: '#/dashboard', '#/escalas', '#/funcionarios') -> App (dashboard)
  if (route === '#/login') {
    return <LoginPage />
  }

  if (route.startsWith('#/')) {
    return <App />
  }

  // fallback
  return <LoginPage />
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
)

postMessage({ payload: 'removeLoading' }, '*')

// src/App.jsx (ou seu arquivo principal)