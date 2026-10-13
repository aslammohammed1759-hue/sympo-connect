import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { AuthProvider } from './AuthContext.jsx'
import { isConfigured } from './supabaseClient.js'
import './styles.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    {isConfigured ? (
      <AuthProvider><App /></AuthProvider>
    ) : (
      <div className="setup"><h1>SympoConnect setup needed</h1>
        <p>Copy <code>.env.example</code> to <code>.env.local</code>, add your Supabase URL and anon key, then restart <code>npm run dev</code>. See README.md.</p></div>
    )}
  </BrowserRouter>
)
