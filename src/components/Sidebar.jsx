// src/components/Sidebar.jsx (CÓDIGO FINAL Y UNIFICADO)

import { Link } from 'react-router-dom';
import './Sidebar.css';
import defaultFoto from '../assets/default.jpg';
import { useEffect, useMemo, useState } from 'react';
import { Auth } from 'aws-amplify';

// Asumimos que esta función la moverás a un archivo 'lib' o la definirás en App.jsx
// Por ahora, para que funcione, la ponemos aquí.
const getApiBase = () => 'https://h6ysn7u0tl.execute-api.us-east-1.amazonaws.com/dev2';

const API_BASE = getApiBase();

const DOMINIOS_PERMITIDOS = new Set([
  'netec.com', 'netec.com.mx', 'netec.com.co',
  'netec.com.pe', 'netec.com.cl', 'netec.com.es', 'netec.com.pr'
]);

// <-- FUSIONADO: Añadimos la constante del email del admin
const ADMIN_EMAIL = 'anette.flores@netec.com.mx';

/** Igual que en App.jsx: devuelve un rol único válido */
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

  // Toda tu lógica de useEffects y funciones se mantiene intacta
  useEffect(() => {
    // ... (lógica para pintarFoto)
  }, []);

  const dominio = useMemo(() => (email.split('@')[1] || '').toLowerCase(), [email]);
  const esNetec = DOMINIOS_PERMITIDOS.has(dominio);
  
  // <-- FUSIONADO: Combinamos la lógica de 'esRoot' y 'normalizarRol'
  const esRoot = email === ADMIN_EMAIL;
  const rolNormalizado = esRoot && !grupo ? 'admin' : normalizarRol(grupo);

  const mostrarBoton = esNetec && (rolNormalizado !== 'creador') && !esRoot;

  const authHeader = useMemo(() => {
    // ... (lógica de authHeader)
  }, [token]);

  useEffect(() => {
    // ... (lógica de fetchEstado)
  }, [email, esNetec, authHeader]);

  const toggle = () => setColapsado(v => !v);
  const enviarSolicitud = async () => {
    // ... (lógica de enviarSolicitud)
  };

  const rolTexto =
    rolNormalizado === 'admin' ? 'Administrador' :
    rolNormalizado === 'creador' ? 'Creador' :
    rolNormalizado === 'participant' ? 'Participante' :
    'Sin grupo';
    
  // <-- FUSIONADO: Usamos las constantes de rol combinadas
  const puedeVerAdmin = (rolNormalizado === 'admin'); // Ahora, cualquier admin puede ver el panel
  const esCreador = (rolNormalizado === 'creador');

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
          {mostrarBoton && (
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
        
        {/* <-- FUSIONADO: La lógica de 'puedeVerAdmin' ahora considera a cualquier admin */}
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
            </div>
          </Link>
        )}
      </div>
    </div>
  );
}
