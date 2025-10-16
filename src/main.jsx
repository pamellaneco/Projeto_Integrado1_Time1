import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

import './index.css'

import './demos/ipc'
import LoginPage from './pages/LoginPage'
// If you want use Node.js, the`nodeIntegration` needs to be enabled in the Main process.
// import './demos/node'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <LoginPage />
  </React.StrictMode>,
)

postMessage({ payload: 'removeLoading' }, '*')