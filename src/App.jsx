// src/App.jsx (VERSIÓN FINAL Y COMPLETA)

import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Importación de componentes y estilos
import Sidebar from './components/Sidebar';
import ChatModal from './components/ChatModal';
import ProfileModal from './components/ProfileModal';
import Home from './components/Home';
import './index.css'; // Mantenemos la importación de tu CSS principal

// Importación de assets
import logo from './assets/Netec.png';
import previewImg from './assets/Preview.png';

function App() {
  const [token, setToken] = useState(localStorage.getItem("id_token"));

  // Variables de configuración de Cognito
  const clientId = import.meta.env.VITE_COGNITO_CLIENT_ID;
  const domain = import.meta.env.VITE_COGNITO_DOMAIN;
  const redirectUri = import.meta.env.VITE_REDIRECT_URI;
  const loginUrl = `${domain}/login?response_type=token&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}`;

  // Efecto para manejar el token
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes("id_token")) {
      const newToken = hash.split("id_token=")[1].split("&")[0];
      localStorage.setItem("id_token", newToken);
      setToken(newToken);
      window.history.pushState("", document.title, window.location.pathname + window.location.search);
    }
  }, []);

  // Función para cerrar sesión
  const handleLogout = () => {
    const logoutUrl = `${domain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(redirectUri)}`;
    localStorage.removeItem("id_token");
    setToken(null);
    window.location.href = logoutUrl;
  };

  return (
    <>
      {!token ? (
        // --- PANTALLA DE INICIO ---
        <div id="paginaInicio">
          <div className="header-bar">
            <img className="logo" src={logo} alt="Logo Netec" />
            <div className="subtitle">Aprendizaje Efectivo</div>
          </div>
          <div className="main-content">
            <div className="illustration">
              <img
                src={previewImg}
                alt="Ilustración"
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            </div>
            <button className="login-button" onClick={() => (window.location.href = loginUrl)}>
              Comenzar Ahora
            </button>
          </div>
          <div className="country-flags">
            {/* ... tus banderas aquí ... */}
          </div>
        </div>
      ) : (
        // --- VISTA PRINCIPAL (CON MAQUETACIÓN CORREGIDA) ---
        <Router>
          <div id="contenidoPrincipal">
            <Sidebar token={token} />
            <ProfileModal token={token} />
            <ChatModal token={token} />
            
            {/* Envolvemos las rutas en <main> para poder aplicar estilos */}
            <main className="main-content-area">
              <Routes>
                <Route path="/" element={<Home />} />
              </Routes>
            </main>
            
            <button id="logout" onClick={handleLogout}>Cerrar sesión</button>
          </div>
        </Router>
      )}
    </>
  );
}

export default App;
