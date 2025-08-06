import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Auth } from 'aws-amplify';
import { jwtDecode } from "jwt-decode";

// Componentes
import Sidebar from './components/Sidebar';
import ChatModal from './components/ChatModal';
import ProfileModal from './components/ProfileModal';
import Home from './components/Home';
import ActividadesPage from './components/ActividadesPage';
import ResumenesPage from './components/ResumenesPage';
import ExamenesPage from './components/ExamenesPage';

// Estilos y assets
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
  const [grupo, setGrupo] = useState("Sin grupo");

  const clientId = import.meta.env.VITE_COGNITO_CLIENT_ID;
  const domain = import.meta.env.VITE_COGNITO_DOMAIN;
  const redirectUri = import.meta.env.VITE_REDIRECT_URI_TESTING;
  const loginUrl = `${domain}/login?response_type=token&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}`;

  useEffect(() => {
    Auth.currentAuthenticatedUser()
      .then(user => {
        console.log("🟢 Sesión activa:", user);
      })
      .catch(async err => {
        try {
          const user = await Auth.federatedSignIn();
          console.log("✅ Usuario autenticado por código:", user);
        } catch (error) {
          console.log("❌ Error al autenticar:", error);
        }
      });
  }, []);

  useEffect(() => {
    Auth.currentSession()
      .then(session => console.log("✅ Sesión activa:", session))
      .catch(() => Auth.signOut());
  }, []);

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
        setEmail(decoded.email);
      } catch (err) {
        console.error("❌ Error al decodificar el token:", err);
      }
    }
  }, [token]);

  // ✅ Extrae el grupo desde el token
  useEffect(() => {
    Auth.currentAuthenticatedUser()
      .then(user => {
        const grupos = user.signInUserSession.accessToken.payload["cognito:groups"];
        if (grupos && grupos.length > 0) {
          setGrupo(grupos[0]);
        } else {
          setGrupo("Sin grupo");
        }
      })
      .catch(() => setGrupo("Sin grupo"));
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
                <a href="https://www.netec.com/cursos-ti-chile" target="_blank" rel="noopener noreferrer" className="flag-item">
                  <img src={chileFlag} alt="Chile" className="flag-image" />
                  <div className="flag-label">Chile</div>
                </a>
                <a href="https://www.netec.com/cursos-ti-peru" target="_blank" rel="noopener noreferrer" className="flag-item">
                  <img src={peruFlag} alt="Perú" className="flag-image" />
                  <div className="flag-label">Perú</div>
                </a>
                <a href="https://www.netec.com/cursos-ti-colombia" target="_blank" rel="noopener noreferrer" className="flag-item">
                  <img src={colombiaFlag} alt="Colombia" className="flag-image" />
                  <div className="flag-label">Colombia</div>
                </a>
                <a href="https://www.netec.com/cursos-ti-mexico" target="_blank" rel="noopener noreferrer" className="flag-item">
                  <img src={mexicoFlag} alt="México" className="flag-image" />
                  <div className="flag-label">México</div>
                </a>
                <a href="https://www.netec.es/" target="_blank" rel="noopener noreferrer" className="flag-item">
                  <img src={espanaFlag} alt="España" className="flag-image" />
                  <div className="flag-label">España</div>
                </a>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <Router>
          <div id="contenidoPrincipal">
            <Sidebar email={email} grupo={grupo} />
            <div style={{ padding: '1rem', background: '#f3f3f3', fontSize: '0.9rem' }}>
              <strong>📧 Correo: {email}</strong><br />
              <strong>🎖️ Rol: {grupo}</strong>
            </div>

            <ProfileModal token={token} />
            <ChatModal token={token} />

            <main className="main-content-area">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/actividades" element={<ActividadesPage token={token} />} />
                <Route path="/resumenes" element={<ResumenesPage />} />
                <Route path="/examenes" element={<ExamenesPage />} />
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

