// src/App.jsx (CÓDIGO COMPLETO Y MODIFICADO)

import { useEffect, useState } from 'react';
import Sidebar from './components/Sidebar';
import ChatModal from './components/ChatModal';
import ProfileModal from './components/ProfileModal';
import './index.css'; // Asegúrate de importar tu CSS principal
import logo from './assets/Netec.png';
import previewImg from './assets/Preview.png';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';

function App() {
  const [token, setToken] = useState(localStorage.getItem("id_token"));

  const clientId = import.meta.env.VITE_COGNITO_CLIENT_ID;
  const domain = import.meta.env.VITE_COGNITO_DOMAIN;
  const redirectUri = import.meta.env.VITE_REDIRECT_URI;

  const loginUrl = `${domain}/login?response_type=token&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}`;

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes("id_token")) {
      const newToken = hash.split("id_token=")[1].split("&")[0];
      localStorage.setItem("id_token", newToken);
      setToken(newToken);
      // Limpiamos la URL para una mejor UX, eliminando el token de la barra de direcciones
      window.history.pushState("", document.title, window.location.pathname + window.location.search);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("id_token");
    const logoutUrl = `${domain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(redirectUri)}`;
    window.location.href = logoutUrl;
  };

  return (
    <>
      {!token ? (
        // --- PANTALLA DE LOGIN (SIN CAMBIOS) ---
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
            <div className="flag-item">
              <div className="flag chile"></div>
              <div className="flag-label">Chile</div>
            </div>
            <div className="flag-item">
              <div className="flag colombia"></div>
              <div className="flag-label">Colombia</div>
            </div>
            <div className="flag-item">
              <div className="flag mexico"></div>
              <div className="flag-label">México</div>
            </div>
            <div className="flag-item">
              <div className="flag peru"></div>
              <div className="flag-label">Perú</div>
            </div>
            <div className="flag-item">
              <div className="flag panama"></div>
              <div className="flag-label">Panamá</div>
            </div>
          </div>
        </div>
      ) : (
        // --- VISTA PRINCIPAL (CON LA ESTRUCTURA MODIFICADA) ---
        <Router>
          <div id="contenidoPrincipal">
            <Sidebar token={token} />
            <ProfileModal token={token} />
            <ChatModal token={token} />

            {/* ----- INICIO DEL CAMBIO CRÍTICO ----- */}
            {/* Envolvemos las rutas en un <main> con la clase que definimos en el CSS */}
            <main className="main-content-area">
              <Routes>
                <Route path="/" element={<Home />} />
              </Routes>
            </main>
            {/* ------ FIN DEL CAMBIO CRÍTICO ------ */}

            <button id="logout" onClick={handleLogout}>Cerrar sesión</button>
          </div>
        </Router>
      )}
    </>
  );
}

export default App;
