// src/components/Sidebar.jsx (CÓDIGO FINAL CON LÓGICA DE ROLES CORREGIDA)

import { Link } from 'react-router-dom';
import './Sidebar.css';
import defaultFoto from '../assets/default.jpg';
import { useEffect, useMemo, useState } from 'react';
import { Auth } from 'aws-amplify';

const getApiBase = () => 'https://h6ysn7u0tl.execute-api.us-east-1.amazonaws.com/dev2';
const API_BASE = getApiBase();

const DOMINIOS_PERMITIDOS = new Set([
  'netec.com', 'netec.com.mx', 'netec.com.co',
  'netec.com.pe', 'netec.com.cl', 'netec.com.es', 'netec.com.pr'
]);

const ADMIN_EMAIL = 'anette.flores@netec.com.mx';

const normalizarRol = (raw) => {
  if (!raw) return '';
  const parts = String(raw).toLowerCase().split(/[,\s]+/).filter(Boolean);
  if (parts.includes('creador')) return 'creador';
  if (parts.includes('admin')) return 'admin';
  if (parts.includes('participant')) return 'participant';
  return parts[0] || '';
};

export default function Sidebar({ email = '', nombre, grupo = '', token }) {
  const [avatar, setAvatar] = useState(null);
  const [colapsado, setColapsado] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [estado, setEstado] = useState('');
  const [error, setError] = useState('');

  // Lógica de useEffects para cargar datos (sin cambios)
  useEffect(() => {
    // ... (tu lógica para pintarFoto se queda igual)
  }, []);

  const dominio = useMemo(() => (email.split('@')[1] || '').toLowerCase(), [email]);
  const esNetec = DOMINIOS_PERMITIDOS.has(dominio);
  
  const authHeader = useMemo(() => {
    if (!token) return {};
    const v = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    return { Authorization: v };
  }, [token]);

  useEffect(() => {
    // ... (tu lógica de fetchEstado se queda igual)
  }, [email, esNetec, authHeader]);

  const toggle = () => setColapsado(v => !v);
  const enviarSolicitud = async () => {
    // ... (tu lógica de enviarSolicitud se queda igual)
  };

  // --- INICIO DE LA LÓGICA DE ROLES CORREGIDA ---
  const esRoot = email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
  let rolFinal = normalizarRol(grupo);

  // Regla prioritaria: si es el usuario root, su rol SIEMPRE es 'admin'.
  if (esRoot) {
    rolFinal = 'admin';
  }

  const rolTexto =
    rolFinal === 'admin' ? 'Administrador' :
    rolFinal === 'creador' ? 'Creador' :
    rolFinal === 'participant' ? 'Participante' :
    'Sin grupo';
    
  const puedeVerAdmin = (rolFinal === 'admin');
  const esCreador = (rolFinal === 'creador');
  const mostrarBotonSolicitud = esNetec && (rolFinal !== 'creador') && !esRoot;
  // --- FIN DE LA LÓGICA DE ROLES CORREGIDA ---

  const disabled = estado === 'pendiente' || estado === 'aprobado' || enviando;
  const label =
    estado === 'aprobado'  ? '✅ Ya eres Creador'
  : estado === 'pendiente' ? '⏳ Solicitud enviada'
  : '📩 Solicitar rol de Creador';

  return (
    <div id="barraLateral" className={`sidebar ${colapsado ? 'sidebar--colapsado' : ''}`}>
      <button className="collapse-btn" onClick={toggle}>
        {colapsado ? '▸' : '◂'}
      </button>
      <div className="perfilSidebar">
        <div className="avatar-wrap" title="Foto de perfil">
          <img src={avatar || defaultFoto} alt="Avatar" className="avatar-img"/>
        </div>
        {!colapsado && <>
          <div className="nombre">{nombre || 'Usuario conectado'}</div>
          <div className="email">{email}</div>
          <div className="grupo">🎖️ Rol: {rolTexto}</div>
          {mostrarBotonSolicitud && (
            <div className="solicitar-creador-card">
              <button className="solicitar-creador-btn" onClick={enviarSolicitud} disabled={disabled} title={email}>
                {label}
              </button>
              {!!error && <div className="solicitar-creador-error">❌ {error}</div>}
              {estado === 'rechazado' && (
                <div className="solicitar-creador-error" style={{color:'#ffd18a'}}>
                  ❗ Tu última solicitud fue rechazada. Puedes volver a intentarlo.
                </div>
              )}
            </div>
          )}
        </>}
      </div>

      <div id="caminito" className="caminito">
        <Link to="/resumenes" className="nav-link">
          <div className="step"><div className="circle">🧠</div>{!colapsado && <span>Resúmenes</span>}</div>
        </Link>
        <Link to="/actividades" className="nav-link">
          <div className="step"><div className="circle">📘</div>{!colapsado && <span>Actividades</span>}</div>
        </Link>
        <Link to="/examenes" className="nav-link">
          <div className="step"><div className="circle">🔬</div>{!colapsado && <span>Examen</span>}</div>
        </Link>
        
        {puedeVerAdmin && (
          <Link to="/admin" className="nav-link" title="Panel de administración">
            <div className="step"><div className="circle">⚙️</div>{!colapsado && <span>Admin</span>}</div>
          </Link>
        )}

        {esCreador ? (
          <Link to="/generador-contenidos" className="nav-link" title="Generador de Contenidos">
            <div className="step">
              <div className="circle">✍️</div>
              {!colapsado && <span>Contenidos</span>}
            </div>
          </Link>
        ) : (
          <Link to="/usuarios" className="nav-link">
            <div className="step">
              <div className="circle">👥</div>
              {!colapsado && <span>Usuarios</span>}
            </d  iv>
          </Link>
        )}
      </div>
    </div>
  );
}
