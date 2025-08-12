// src/components/Sidebar.jsx
import { Link } from 'react-router-dom';
import './Sidebar.css';
import defaultFoto from '../assets/default.jpg';
import { useEffect, useMemo, useState } from 'react';
import { Auth } from 'aws-amplify';
import AvatarModal from './AvatarModal';

const API_BASE = 'https://h6ysn7u0tl.execute-api.us-east-1.amazonaws.com/dev2';
const DOMINIOS_PERMITIDOS = new Set([
  'netec.com','netec.com.mx','netec.com.co','netec.com.pe','netec.com.cl','netec.com.es','netec.com.pr'
]);

// base64url-safe
const decodeJWT = (t) => {
  if (!t) return null;
  try {
    const part = t.split('.')[1] || '';
    const normalized = part.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(normalized).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
};

export default function Sidebar({ email = '', nombre, grupo, token }) {
  const [avatar, setAvatar] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [colapsado, setColapsado] = useState(false);

  // Estado persistente de la solicitud de Creador
  const [estadoSolicitud, setEstadoSolicitud] = useState(''); // '', 'pendiente','aprobado','rechazado'
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    Auth.currentAuthenticatedUser()
      .then(u => setAvatar(u.attributes.picture))
      .catch(() => setAvatar(null));
  }, []);

  const dominio = useMemo(() => (email.split('@')[1] || '').toLowerCase(), [email]);
  const esNetec = DOMINIOS_PERMITIDOS.has(dominio);
  const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

  // Leer grupos del token
  const payload = decodeJWT(token);
  const groups = payload?.['cognito:groups'] || [];
  const esCreador = groups.includes('Creador');        // ✅ único criterio para “Creador”
  const esAdminPorDominio = esNetec || groups.includes('Administrador');

  // Texto de rol
  const rolTexto =
    esCreador ? 'Creador' :
    esAdminPorDominio ? 'Administrador' :
    'Participante';

  // Menú Admin visible para @netec.* y para Anette explícitamente
  const correoAutorizado = 'anette.flores@netec.com.mx';
  const esAdminParaUI = esAdminPorDominio || email === correoAutorizado;

  // Traer estado REAL desde backend (si existe solicitud)
  useEffect(() => {
    let cancel = false;
    const fetchEstado = async () => {
      try {
        const r = await fetch(`${API_BASE}/obtener-solicitudes-rol`, { headers: authHeader });
        if (!r.ok) return;
        const j = await r.json().catch(() => ({}));
        const lista = Array.isArray(j?.solicitudes) ? j.solicitudes : [];
        const item = lista.find(s => (s.correo || '').toLowerCase() === email.toLowerCase());
        const e = (item?.estado || '').toLowerCase();
        if (!cancel) setEstadoSolicitud(e || '');
      } catch { /* noop */ }
    };
    if (email) fetchEstado();
    return () => { cancel = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email, token]);

  const toggle = () => setColapsado(v => !v);

  // Botón para solicitar Creador
  const puedeSolicitar = esNetec && !esCreador;
  const disableBtn = estadoSolicitud === 'pendiente' || esCreador;
  const labelBtn =
    esCreador ? '✅ Ya eres Creador' :
    estadoSolicitud === 'pendiente' ? '⏳ Solicitud en revisión' :
    (enviando ? 'Enviando…' : '📩 Solicitar rol de Creador');

  const enviarSolicitud = async () => {
    setEnviando(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/solicitar-rol`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader
        },
        body: JSON.stringify({ correo: email })
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j.error || 'Rechazado por servidor');
      setEstadoSolicitud('pendiente'); // persistente hasta que Anette apruebe/rechace
    } catch (e) {
      console.error(e);
      setError('Error de red al enviar la solicitud.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div id="barraLateral" className={`sidebar ${colapsado ? 'sidebar--colapsado' : ''}`}>
      <button className="collapse-btn" onClick={toggle}>
        {colapsado ? '▸' : '◂'}
      </button>

      <div className="perfilSidebar">
        <div className="avatar-wrap" onClick={() => setIsModalOpen(true)}>
          <img src={avatar || defaultFoto} alt="Avatar" className="avatar-img"/>
        </div>

        {!colapsado && <>
          <div className="nombre">{nombre || 'Usuario conectado'}</div>
          <div className="email">{email}</div>
          <div className="grupo">🎖️ Rol: {rolTexto}</div>

          {puedeSolicitar && (
            <div className="solicitar-creador-card">
              <button
                className="solicitar-creador-btn"
                onClick={enviarSolicitud}
                disabled={disableBtn}
              >
                {labelBtn}
              </button>
              {!!error && <div className="solicitar-creador-error">❌ {error}</div>}
            </div>
          )}
        </>}
      </div>

      <AvatarModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      <div id="caminito" className="caminito">
        <Link to="/resumenes" className="nav-link">
          <div className="step">
            <div className="circle">🧠</div>
            {!colapsado && <span>Resúmenes</span>}
          </div>
        </Link>
        <Link to="/actividades" className="nav-link">
          <div className="step">
            <div className="circle">📘</div>
            {!colapsado && <span>Actividades</span>}
          </div>
        </Link>
        <Link to="/examenes" className="nav-link">
          <div className="step">
            <div className="circle">🔬</div>
            {!colapsado && <span>Examen</span>}
          </div>
        </Link>

        {esAdminParaUI && (
          <>
            <Link to="/admin" className="nav-link">
              <div className="step">
                <div className="circle">⚙️</div>
                {!colapsado && <span>Admin</span>}
              </div>
            </Link>
            <Link to="/usuarios" className="nav-link">
              <div className="step">
                <div className="circle">👥</div>
                {!colapsado && <span>Usuarios</span>}
              </div>
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
