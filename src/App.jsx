// src/App.jsx (CÓDIGO FINAL CON LÓGICA DE ROLES MEJORADA)

import './amplify';
import { hostedUiAuthorizeUrl } from './amplify';
import { useEffect, useState, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { Auth } from 'aws-amplify';

// Componentes
import Sidebar from './components/Sidebar';
import ChatModal from './components/ChatModal';
import ProfileModal from './components/ProfileModal';
import Home from './components/Home';
import ActividadesPage from './components/ActividadesPage';
import ResumenesPage from './components/ResumenesPage';
import ExamenesPage from './components/ExamenesPage';
import AdminPage from './components/AdminPage';
import GeneradorContenidosPage from './components/GeneradorContenidosPage';
import GeneradorTemarios from './components/GeneradorTemarios';

// Estilos y Assets
import './index.css';
import logo from './assets/Netec.png';
import previewImg from './assets/Preview.png';
import chileFlag from './assets/chile.png';
import peruFlag from './assets/peru.png';
import colombiaFlag from './assets/colombia.png';
import mexicoFlag from './assets/mexico.png';
import espanaFlag from './assets/espana.png';

const ADMIN_EMAIL = 'anette.flores@netec.com.mx';

const normalizarRol = (raw) => {
  if (!raw) return '';
  const parts = String(raw).toLowerCase().split(/[,\s]+/).filter(Boolean);
  if (parts.includes('creador')) return 'creador';
  if (parts.includes('admin')) return 'admin';
  if (parts.includes('participant')) return 'participant';
  return parts[0] || '';
};

function App() {
  const [token, setToken] = useState(localStorage.getItem('id_token') || '');
  const [user, setUser] = useState(null); // <-- Estado unificado para el usuario

  // En tu App.jsx

// ... (la definición de 'loginUrl' con useMemo se queda igual)

const handleLogin = () => {
  // Simplemente verificamos si la URL se pudo construir y redirigimos.
  // Sin 'try...catch', sin 'async/await', sin 'Auth.federatedSignIn'.
  if (loginUrl) {
    window.location.href = loginUrl;
  } else {
    // Este alert es útil si las variables de entorno no se cargan.
    alert(
      'Falta configurar Cognito para login:\n' +
      '- VITE_COGNITO_DOMAIN\n- VITE_COGNITO_CLIENT_ID\n' +
      '- VITE_REDIRECT_URI_TESTING'
    );
  }
};

  const handleLogout = async () => {
    localStorage.removeItem('id_token');
    setToken('');
    setUser(null);
    try { await Auth.signOut(); } catch (e) { console.log('SignOut Amplify falló:', e?.message || e); }
  };

  // --- useEffect PRINCIPAL PARA GESTIONAR LA SESIÓN ---
  useEffect(() => {
    let cancelled = false;

    const updateUserSession = async () => {
      try {
        const session = await Auth.currentSession();
        const idToken = session.getIdToken().getJwtToken();
        const authenticatedUser = await Auth.currentAuthenticatedUser({ bypassCache: true });
        
        if (cancelled) return;
        
        const decodedToken = jwtDecode(idToken);
        const email = (authenticatedUser.attributes.email || decodedToken.email || '').toLowerCase();
        let rol = normalizarRol(authenticatedUser.attributes['custom:rol'] || decodedToken['custom:rol']);

        // Lógica de Admin robusta y centralizada
        if (email === ADMIN_EMAIL) {
          rol = 'admin';
        }
        
        setToken(idToken);
        setUser({
          email: email,
          rol: rol,
          nombre: authenticatedUser.attributes.name || 'Usuario' 
        });
        localStorage.setItem('id_token', idToken);
        
      } catch (err) {
        if (cancelled) return;
        localStorage.removeItem('id_token');
        setToken('');
        setUser(null);
      }
    };

    const hash = window.location.hash;
    if (hash.includes("id_token=")) {
      window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
    }
    
    updateUserSession();

    window.addEventListener('focus', updateUserSession);

    return () => {
      cancelled = true;
      window.removeEventListener('focus', updateUserSession);
    };
  }, []);

  const puedeVerAdmin = user?.rol === 'admin';

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
              <button className="login-button" onClick={handleLogin}>
                🚀 Comenzar Ahora
              </button>
              <div className="country-flags">
                {[
                  { flag: chileFlag, label: 'Chile', url: 'https://www.netec.com/cursos-ti-chile' },
                  { flag: peruFlag, label: 'Perú', url: 'https://www.netec.com/cursos-ti-peru' },
                  { flag: colombiaFlag, label: 'Colombia', url: 'https://www.netec.com/cursos-ti-colombia' },
                  { flag: mexicoFlag, label: 'México', url: 'https://www.netec.com/cursos-ti-mexico' },
                  { flag: espanaFlag, label: 'España', url: 'https://www.netec.es/' }
                ].map(({ flag, label, url }) => (
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
          <div id="contenidoPrincipal">
            <Sidebar 
              email={user?.email || ''} 
              nombre={user?.nombre || ''}
              grupo={user?.rol || ''} 
              token={token} 
            />
            <ProfileModal token={token} />
            <ChatModal token={token} />
            <main className="main-content-area">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/actividades" element={<ActividadesPage token={token} />} />
                <Route path="/resumenes" element={<ResumenesPage />} />
                <Route path="/examenes" element={<ExamenesPage />} />
                <Route path="/generador-contenidos" element={<GeneradorContenidosPage />}>
                  <Route path="curso-estandar" element={<GeneradorTemarios />} />
                </Route>
                <Route
                  path="/admin"
                  element={puedeVerAdmin ? <AdminPage /> : <Navigate to="/" replace />}
                />
                <Route path="*" element={<Navigate to="/" replace />} />
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
