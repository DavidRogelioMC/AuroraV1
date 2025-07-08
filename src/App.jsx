import { useEffect, useState } from 'react';
import Sidebar from './components/Sidebar';
import ChatModal from './components/ChatModal';
import ProfileModal from './components/ProfileModal';
import './index.css';
import logo from './assets/Netec.png';
import previewImg from './assets/Preview.png';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';

// Importar banderas
import chileFlag from './assets/flags/chile.png';
import peruFlag from './assets/flags/peru.png';
import colombiaFlag from './assets/flags/colombia.png';
import mexicoFlag from './assets/flags/mexico.png';
import espanaFlag from './assets/flags/espana.png';

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
        <div id="paginaInicio">
          <div className="header-bar">
            <img className="logo" src={logo} alt="Logo Netec" />
          </div>

          <div className="main-content">
            <div className="page-container">
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
          </div>

          {/* Sección de banderas */}
          <div className="country-flags">
            <div className="flag-item">
              <img src={chileFlag} alt="Chile" className="flag-image" />
              <div className="flag-label">Chile</div>
            </div>
            <div className="flag-item">
              <img src={peruFlag} alt="Perú" className="flag-image" />
              <div className="flag-label">Perú</div>
            </div>
            <div className="flag-item">
              <img src={colombiaFlag} alt="Colombia" className="flag-image" />
              <div className="flag-label">Colombia</div>
            </div>
            <div className="flag-item">
              <img src={mexicoFlag} alt="México" className="flag-image" />
              <div className="flag-label">México</div>
            </div>
            <div className="flag-item">
              <img src={espanaFlag} alt="España" className="flag-image" />
              <div className="flag-label">España</div>
            </div>
          </div>
        </div>
      ) : (
        <Router>
          <div id="contenidoPrincipal">
            <Sidebar token={token} />
            <ProfileModal token={token} />
            <ChatModal token={token} />
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

