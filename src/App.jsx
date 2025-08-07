import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

import Sidebar from './components/Sidebar';
import ChatModal from './components/ChatModal';
import ProfileModal from './components/ProfileModal';
import Home from './components/Home';
import ActividadesPage from './components/ActividadesPage';
import ResumenesPage from './components/ResumenesPage';
import ExamenesPage from './components/ExamenesPage';
import AdminPage from './components/AdminPage';
import SolicitarRolCreadorAdmin from './components/SolicitarRolCreadorAdmin'; // ✅ NUEVO

import './index.css';
import logo from './assets/Netec.png';
import previewImg from './assets/Preview.png';
import chileFlag from './assets/chile.png';
import peruFlag from './assets/peru.png';
import colombiaFlag from './assets/colombia.png';
import mexicoFlag from './assets/mexico.png';
import espanaFlag from './assets/espana.png';

function App() {
  const [token, setToken] = useState(localStorage.getItem("id_token"));
  const [email, setEmail] = useState("");
  const [rol, setRol] = useState("");

  const clientId = import.meta.env.VITE_COGNITO_CLIENT_ID;
  const domain = import.meta.env.VITE_COGNITO_DOMAIN;
  const redirectUri = import.meta.env.VITE_REDIRECT_URI_TESTING;
  const loginUrl = `${domain}/login?response_type=token&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}`;

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes("id_token")) {
      const newToken = hash.split("id_token=")[1].split("&")[0];
      localStorage.setItem("id_token", newToken);
      setToken(newToken);
      window.history.pushState("", document.title, window.location.pathname + window.location.search);
    }
  }, []);

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setEmail(decoded.email || "");
        setRol(decoded["custom:rol"] || "");
      } catch (err) {
        console.error("❌ Error al decodificar el token:", err);
      }
    }
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem("id_token");
    const logoutUrl = `${domain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(redirectUri)}`;
    window.location.href = logoutUrl;
  };

  return (
    <>
      {!token ? (
        <div id="paginaInicio">
          <div className="header-bar">
            <img className="logo-left" src={logo} alt="Logo Netec" />
          </div>
          <div className="main-content">
            <div className="page-container">
              <div className="illustration-centered">
                <img src={previewImg} alt="Ilustración" className="preview-image" />
              </div>
              <button className="login-button" onClick={() => (window.location.href = loginUrl)}>
                🚀 Comenzar Ahora
              </button>
              <div className="country-flags">
                {[{ flag: chileFlag, label: "Chile", url: "https://www.netec.com/cursos-ti-chile" },
                  { flag: peruFlag, label: "Perú", url: "https://www.netec.com/cursos-ti-peru" },
                  { flag: colombiaFlag, label: "Colombia", url: "https://www.netec.com/cursos-ti-colombia" },
                  { flag: mexicoFlag, label: "México", url: "https://www.netec.com/cursos-ti-mexico" },
                  { flag: espanaFlag, label: "España", url: "https://www.netec.es/" }]
                  .map(({ flag, label, url }) => (
                    <a key={label} href={url} target="_blank" rel="noopener noreferrer" className="flag-item">
                      <img src={flag} alt={label} className="flag-image" />
                      <div className="flag-label">{label}</div>
                    </a>
                  ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <Router>
          <div id="contenidoPrincipal" style={{ display: 'flex', height: '100vh' }}>
            <Sidebar email={email} nombre={email} grupo={rol} />
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '1rem', background: '#f3f3f3', fontSize: '0.9rem' }}>
                <strong>📧 Correo: {email}</strong>
              </div>

              <ProfileModal token={token} />
              <ChatModal token={token} />

              <main className="main-content-area" style={{ padding: '1rem' }}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/actividades" element={<ActividadesPage token={token} />} />
                  <Route path="/resumenes" element={<ResumenesPage />} />
                  <Route path="/examenes" element={<ExamenesPage />} />
                  <Route path="/admin" element={rol === "admin" ? <AdminPage /> : <Home />} />
                  <Route path="/solicitar-rol" element={<SolicitarRolCreadorAdmin />} />
                </Routes>
              </main>

              <button id="logout" onClick={handleLogout} style={{ margin: '1rem' }}>
                Cerrar sesión
              </button>
            </div>
          </div>
        </Router>
      )}
    </>
  );
}

export default App;

