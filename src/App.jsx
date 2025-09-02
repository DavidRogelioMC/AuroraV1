// src/App.jsx (CÓDIGO COMPLETO Y MODIFICADO)

import './amplify'; // DEBE cargarse antes de usar Auth
import { hostedUiAuthorizeUrl } from './amplify';
import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { Auth } from 'aws-amplify';

import Sidebar from './components/Sidebar';
import ChatModal from './components/ChatModal';
import ProfileModal from './components/ProfileModal';

import Home from './components/Home';
import ActividadesPage from './components/ActividadesPage';
import ResumenesPage from './components/ResumenesPage';
import ExamenesPage from './components/ExamenesPage';
import AdminPage from './components/AdminPage';
import GeneradorContenidosPage from './components/GeneradorContenidosPage'; // <-- IMPORTAMOS LA NUEVA PÁGINA

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
  const [email, setEmail] = useState('');
  const [rol, setRol] = useState('');

  const handleLogin = async () => {
    try {
      await Auth.federatedSignIn();
    } catch (e) {
      console.error('Amplify/Auth incompleto, usando fallback Hosted UI:', e?.message || e);
      const url = hostedUiAuthorizeUrl();
      if (url) {
        window.location.assign(url);
      } else {
        alert(
          'Falta configurar Cognito para login:\n' +
          '- VITE_COGNITO_DOMAIN\n- VITE_COGNITO_CLIENT_ID\n' +
          '(opcional) VITE_COGNITO_USER_POOL_ID'
        );
      }
    }
  };

  const handleLogout = async () => {
    localStorage.removeItem('id_token');
    try { await Auth.signOut(); } catch (e) { console.log('SignOut Amplify falló:', e?.message || e); }
  };

  useEffect(() => {
    (async () => {
      try {
        const session = await Auth.currentSession();
        const idt = session.getIdToken().getJwtToken();
        localStorage.setItem('id_token', idt);
        setToken(idt);

        const u = await Auth.currentAuthenticatedUser({ bypassCache: true });
        const freshEmail = u?.attributes?.email || '';
        const freshRol = normalizarRol(u?.attributes?.['custom:rol'] || '');
        setEmail(freshEmail);
        setRol(freshRol || (freshEmail === ADMIN_EMAIL ? 'admin' : ''));
      } catch {
        setToken('');
        setEmail('');
        setRol('');
      }
    })();
  }, []);

  useEffect(() => {
    if (!token) return;
    try {
      const decoded = jwtDecode(token);
      setEmail((prev) => prev || decoded?.email || '');
      setRol((prev) => prev || normalizarRol(decoded?.['custom:rol']));
    } catch (err) {
      console.error('❌ Error al decodificar token:', err);
      setEmail('');
      setRol('');
    }
  }, [token]);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    const refreshFromCognito = () => {
      Auth.currentAuthenticatedUser({ bypassCache: true })
        .then(u => {
          if (cancelled) return;
          const freshRol = normalizarRol(u?.attributes?.['custom:rol'] || '');
          const freshEmail = u?.attributes?.email || '';
          if (freshEmail && freshEmail !== email) setEmail(freshEmail);
          if (freshRol && freshRol !== rol) setRol(freshRol);
          if (freshEmail === ADMIN_EMAIL && !freshRol) setRol('admin');
        })
        .catch(err => {
          console.log('No se pudo refrescar atributos de Cognito', err?.message || err);
        })
        .finally(() => {
          if (localStorage.getItem('force_attr_refresh') === '1') {
            localStorage.removeItem('force_attr_refresh');
          }
        });
    };
    refreshFromCognito();
    const onFocus = () => refreshFromCognito();
    window.addEventListener('focus', onFocus);
    const onStorage = (e) => {
      if (e.key === 'force_attr_refresh' && e.newValue === '1') refreshFromCognito();
    };
    window.addEventListener('storage', onStorage);
    const iv = setInterval(refreshFromCognito, 60_000);
    return () => {
      cancelled = true;
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('storage', onStorage);
      clearInterval(iv);
    };
  }, [token, email, rol]);

  useEffect(() => {
    if (email === ADMIN_EMAIL && !rol) setRol('admin');
  }, [email, rol]);

  const adminAllowed = email === ADMIN_EMAIL;

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
            <Sidebar email={email} grupo={rol} token={token} />
            <ProfileModal token={token} />
            <ChatModal token={token} />
            <main className="main-content-area">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/actividades" element={<ActividadesPage token={token} />} />
                <Route path="/resumenes" element={<ResumenesPage />} />
                <Route path="/examenes" element={<ExamenesPage />} />
                <Route path="/generador-contenidos" element={<GeneradorContenidosPage />} />
                <Route path="/admin" element={adminAllowed ? <AdminPage /> : <Navigate to="/" replace />} />
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
