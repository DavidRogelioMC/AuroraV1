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

// Helper seguro para leer grupos del token si lo necesitas
const decodeJWT = (t) => {
  try {
    const part = (t || '').split('.')[1] || '';
    const norm = part.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(norm).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
    );
    return JSON.parse(json);
  } catch { return {}; }
};

export default function Sidebar({ email = '', nombre, grupo = '', token }) {
  const [avatar, setAvatar] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [colapsado, setColapsado] = useState(false);

  // Estado de la solicitud de Creador
  const [estadoSolicitud, setEstadoSolicitud] = useState(''); // '', 'pendiente', 'aprobado', 'rechazado'
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    Auth.currentAuthenticatedUser()
      .then(u => setAvatar(u.attributes.picture))
      .catch(() => setAvatar(null));
  }, []);

  const dominio = useMemo(() => (email.split('@')[1] || '').toLowerCase(), [email]);
  const esNetec = DOMINIOS_PERMITIDOS.has(dominio);

  // Grupos desde el token por si los necesitas
  const payload = decodeJWT(token);
  const gruposToken = payload?.['cognito:groups'] || [];
  const esCreador = grupo === 'Creador' || gruposToken.includes('Creador');

  // Mostrar botón de solicitar creador SOLO si eres admin (por dominio/grupo) y aún no eres creador
  const puedeSolicitar = (grupo === 'Administrador' || esNetec) && !esCreador;

  // Solo Anette ve el botón de Admin
  const showAdmin = email.toLowerCase() === 'anette.flores@netec.com.mx';

  // Cargar estado actual de la solicitud (persiste aunque salga/entre)
  useEffect(() => {
    let cancel = false;
    const fetchEstado = async () => {
      if (!email || !token) return;
      try {
        const r = await fetch(`${API_BASE}/obtener-solicitudes-rol`, {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` }
        });
        const j = await r.json().catch(() => ({}));
        const lista = Array.isArray(j?.solicitudes) ? j.solicitudes : [];
        const mio = lista.find(s => (s.correo || '').toLowerCase() === email.toLowerCase());
        const e = (mio?.estado || '').toLowerCase(); // 'pendiente' | 'aprobado' | 'rechazado'
        if (!cancel) setEstadoSolicitud(e);
      } catch {
        /* silencio: no rompemos UI si falla */
      }
    };
    fetchEstado();
    return () => { cancel = true; };
  }, [email, token]);

  const toggle = () => setColapsado(v => !v);

  const enviarSolicitud = async () => {
    setEnviando(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/solicitar-rol`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ correo: email })
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j.error || 'Rechazado por servidor');
      // Queda en revisión aunque cierre sesión
      setEstadoSolicitud('pendiente');
    } catch (e) {
      console.error(e);
      setError('Error de red al enviar la solicitud.');
    } finally {
      setEnviando(false);
    }
  };

  // Texto de rol mostrado (lo manda App ya calculado)
  const rolTexto =
    grupo === 'Creador' ? 'Creador' :
    grupo === 'Administrador' ? 'Administrador' :
    'Participante';

  // Botón solicitar: deshabilitado si ya eres creador o está pendiente
  const disabledBtn = esCreador || estadoSolicitud === 'pendiente';
  const labelBtn = esCreador
    ? '✅ Ya eres Creador'
    : estadoSolicitud === 'pendiente'
      ? '⏳ Solicitud en revisión'
      : (enviando ? 'Enviando…' : '📩 Solicitar rol de Creador');

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
                disabled={disabledBtn}
              >
                {labelBtn}
              </button>
              {!!error && <div className="solicitar-creador-error">❌ {error}</div>}
              {/* Mensaje si fue rechazado: permitir reintentar */}
              {estadoSolicitud === 'rechazado' && (
                <div className="solicitar-creador-error" style={{opacity:0.9}}>
                  Tu solicitud fue rechazada. Puedes volver a intentarlo.
                </div>
              )}
            </div>
          )}
        </>}
      </div>

      <AvatarModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      {/* Navegación */}
      <div id="caminito" className="caminito">
        <Link to="/resumenes" className="nav-link">
          <div className="step">
            <div className="circle">🧠</div>
            {!colapsado && <span>Resúmenes</span>}
          </div>
        </Link>

        {/* ✅ Este link lleva a /actividades */}
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

        {showAdmin && (
          <Link to="/admin" className="nav-link">
            <div className="step">
              <div className="circle">⚙️</div>
              {!colapsado && <span>Admin</span>}
            </div>
          </Link>
        )}
      </div>
    </div>
  );
}

