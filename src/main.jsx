import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { AuthProvider } from './AuthContext.jsx'
import { configError, isConfigured } from './supabaseClient.js'
import './styles.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    {isConfigured ? (
      <AuthProvider><App /></AuthProvider>
    ) : (
      <div className="setup"><h1>SympoConnect setup needed</h1>
        <p>{configError}</p><p>See README.md for setup details. Never use the service-role key in the browser.</p></div>
    )}
  </BrowserRouter>
)
