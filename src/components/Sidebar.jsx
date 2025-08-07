import { Link } from 'react-router-dom';
import './Sidebar.css';
import defaultFoto from '../assets/default.jpg';
import { useEffect, useState } from 'react';
import { Auth } from 'aws-amplify';
import AvatarModal from './AvatarModal';

const API_BASE = 'https://h6ysn7u0tl.execute-api.us-east-1.amazonaws.com/dev2';

function Sidebar({ email, nombre, grupo }) {
  const [avatar, setAvatar] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // estado para solicitud de rol de creador
  const [reqStatus, setReqStatus] = useState({ state: 'idle', msg: '' }); 
  // states: idle | sending | ok | error

  useEffect(() => {
    Auth.currentAuthenticatedUser()
      .then((user) => setAvatar(user.attributes?.picture))
      .catch(() => setAvatar(null));
  }, []);

  const grupoFormateado =
    grupo === 'admin' ? 'Administrador' :
    grupo === 'participant' ? 'Participante' :
    grupo?.includes('creador') ? 'Creador' :
    'Sin grupo';

  const solicitarCreador = async () => {
    setReqStatus({ state: 'sending', msg: '' });

    try {
      const token = localStorage.getItem('id_token') || '';

      const res = await fetch(`${API_BASE}/solicitar-rol`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: token } : {})
        },
        body: JSON.stringify({ correo: email })
      });

      // intenta leer el cuerpo para dar un mensaje útil
      let payloadText = '';
      try { payloadText = await res.text(); } catch {}
      let payload;
      try { payload = payloadText ? JSON.parse(payloadText) : {}; } catch { payload = {}; }

      if (!res.ok) {
        const msg = payload?.error || `HTTP ${res.status}${payloadText ? ` – ${payloadText}` : ''}`;
        setReqStatus({ state: 'error', msg: `Error: ${msg}` });
        return;
      }

      // OK
      setReqStatus({
        state: 'ok',
        msg: '✅ Solicitud enviada. Estado: pendiente.'
      });
    } catch (e) {
      setReqStatus({ state: 'error', msg: '❌ Error de red al enviar la solicitud.' });
    }
  };

  return (
    <div id="barraLateral" className="sidebar">
      <div id="perfilSidebar" style={{ textAlign: 'center', padding: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <img
            src={avatar || defaultFoto}
            alt="Foto perfil"
            style={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              objectFit: 'cover',
              cursor: 'pointer',
            }}
            onClick={() => setIsModalOpen(true)}
          />
        </div>

        <div className="nombre" id="nombreSidebar">{nombre || 'Usuario conectado'}</div>
        <div className="email" id="emailSidebar">{email}</div>
        <div className="grupo" id="grupoSidebar">🎖️ Rol: {grupoFormateado}</div>

        {/* Botón para solicitar rol de Creador (usa el correo del login) */}
        <button
          className="btn-solicitar-creador"
          onClick={solicitarCreador}
          disabled={reqStatus.state === 'sending'}
          style={{ marginTop: 10 }}
        >
          {reqStatus.state === 'sending' ? 'Enviando…' : '📩 Solicitar rol de Creador'}
        </button>

        {/* Mensaje de estado */}
        {reqStatus.state === 'ok' && (
          <div style={{ color: '#2e7d32', fontWeight: 600, marginTop: 6 }}>{reqStatus.msg}</div>
        )}
        {reqStatus.state === 'error' && (
          <div className="error-resumenes" style={{ marginTop: 6 }}>{reqStatus.msg}</div>
        )}
      </div>

      <AvatarModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      <div id="caminito">
        <Link to="/resumenes" className="nav-link">
          <div className="step"><div className="circle">🧠</div><span>Resúmenes</span></div>
        </Link>

        <Link to="/actividades" className="nav-link">
          <div className="step"><div className="circle">📘</div><span>Actividades</span></div>
        </Link>

        <Link to="/examenes" className="nav-link">
          <div className="step"><div className="circle">🔬</div><span>Examen</span></div>
        </Link>

        {grupo === 'admin' && (
          <>
            <Link to="/admin" className="nav-link">
              <div className="step"><div className="circle">⚙️</div><span>Admin</span></div>
            </Link>
            <Link to="/usuarios" className="nav-link">
              <div className="step"><div className="circle">👥</div><span>Usuarios</span></div>
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default Sidebar;


