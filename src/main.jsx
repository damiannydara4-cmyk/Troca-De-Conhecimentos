import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { AuthProvider } from './contexts/AuthContext.jsx'
import { ConversasProvider } from './contexts/ConversasContext.jsx'

// Bootstrap primeiro, depois a identidade visual do projeto (que o sobrescreve)
import 'bootstrap/dist/css/bootstrap.min.css'
import './styles/global.css'


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ConversasProvider>
          <App />
        </ConversasProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)