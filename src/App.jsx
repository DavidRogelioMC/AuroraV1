import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

import Sidebar from './components/Sidebar';
import ChatModal from './components/ChatModal';
import ProfileModal from './components/ProfileModal';
import Home from './components/Home';
import ActividadesPage from './components/ActividadesPage';
import ResumenesPage from './components/ResumenesPage';
import ExamenesPage from './components/ExamenesPage';
import AdminPage from './components/AdminPage';

import './index.css';
import logo from './assets/Netec.png';
import previewImg from './assets/Preview.png';
import chileFlag from './assets/chile.png';
import peruFlag from './assets/peru.png';
import colombiaFlag from './assets/colombia.png';
import mexicoFlag from './assets/mexico.png';
import espanaFlag from './assets/espana.png';

const DOMINIOS_PERMITIDOS = new Set([
  'netec.com','netec.com.mx','netec.com.co','netec.com.pe','netec.com.cl','netec.com.es','netec.com.pr'
]);

function App() {
  const [token, setToken] = useState(localStorage.getItem('id_token'));
  const [email, setEmail] = useState('');
  const [rolUI, setRolUI] = useState('');              // 'Creador' | 'Administrador' | 'Participante'
  const [adminAllowed, setAdminAllowed] = useState(false); // /admin SOLO para anette

  const clientId = import.meta.env.VITE_COGNITO_CLIENT_ID;
  const domain = import.meta.env.VITE_COGNITO_DOMAIN;
  const redirectUri = import.meta.env.VITE_REDIRECT_URI_TESTING;
  const loginUrl = `${domain}/login?response_type=token&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}`;

  // Captura id_token del hash al volver de Cognito
  useEffect(() => {
    const hash = window.location.hash || '';
    if (hash.includes('id_token')) {
      const newToken = hash.split('id_token=')[1].split('&')[0];
      localStorage.setItem('id_token', newToken);
      setToken(newToken);
      // limpia el hash
      window.history.pushState('', document.title, window.location.pathname + window.location.search);
    }
  }, []);

  // Decodifica token y calcula rol visual + permiso /admin
  useEffect(() => {
    if (!token) return;

    try {
      const decoded = jwtDecode(token);
      const mail = (decoded.email || '').toLowerCase();
      const groups = decoded['cognito:groups'] || [];
      const dominio = (mail.split('@')[1] || '').toLowerCase();

      setEmail(mail);

      const esNetec = DOMINIOS_PERMITIDOS.has(dominio);
      const esAdminGrupo = groups.includes('Administrador');
      const esCreadorGrupo = groups.includes('Creador');
      const esAnette = mail === 'anette.flores@netec.com.mx';

      // Rol visual en Sidebar (prioridad: Creador > Admin > Participante)
      if (esCreadorGrupo) {
        setRolUI('Creador');
      } else if (esNetec || esAdminGrupo) {
        setRolUI('Administrador');
      } else {
        setRolUI('Participante');
      }

      // 🔒 /admin SOLO Anette
      setAdminAllowed(esAnette);
    } catch (err) {
      console.error('❌ Error al decodificar el token:', err);
      setEmail('');
      setRolUI('');
      setAdminAllowed(false);
    }
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem('id_token');
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
            <Sidebar email={email} grupo={rolUI} token={token} />

            <ProfileModal token={token} />
            <ChatModal token={token} />

            <main className="main-content-area">
              <Routes>
                <Route path="/" element={<Home />} />
                {/* ✅ Actividades SIEMPRE muestra tu módulo de actividades */}
                <Route path="/actividades" element={<ActividadesPage token={token} />} />
                <Route path="/resumenes" element={<ResumenesPage />} />
                <Route path="/examenes" element={<ExamenesPage />} />

                {/* 🔒 /admin SOLO para anette.flores@netec.com.mx */}
                <Route
                  path="/admin"
                  element={adminAllowed ? <AdminPage /> : <Navigate to="/" replace />}
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


