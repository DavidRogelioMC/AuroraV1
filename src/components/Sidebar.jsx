import { Link } from 'react-router-dom';
import './Sidebar.css';
import defaultFoto from '../assets/default.jpg';
import { useEffect, useMemo, useState } from 'react';
import { Auth } from 'aws-amplify';
import AvatarModal from './AvatarModal';

const API_BASE = 'https://h6ysn7u0tl.execute-api.us-east-1.amazonaws.com/dev2';
const DOMINIOS_PERMITIDOS = new Set([
  'netec.com', 'netec.com.mx', 'netec.com.co',
  'netec.com.pe', 'netec.com.cl', 'netec.com.es'
]);

function Sidebar({ email = '', nombre, grupo, token }) {
  const [avatar, setAvatar] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [colapsado, setColapsado] = useState(false);

  // Estados de la solicitud de creador
  const [enviando, setEnviando] = useState(false);
  const [ok, setOk] = useState(false);
  const [error, setError] = useState('');

  // Cargar avatar
  useEffect(() => {
    Auth.currentAuthenticatedUser()
      .then((u) => setAvatar(u.attributes.picture))
      .catch(() => setAvatar(null));
  }, []);

  const dominio = useMemo(() => email.split('@')[1]?.toLowerCase() || '', [email]);
  const esDominioNetec = DOMINIOS_PERMITIDOS.has(dominio);
  const puedeSolicitarCreador = grupo === 'admin' && esDominioNetec;

  const toggleColapso = () => setColapsado((v) => !v);

  const enviarSolicitud = async () => {
    setEnviando(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/solicitar-rol`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token
        },
        body: JSON.stringify({}) // correo lo toma de Cognito authorizer
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Rechazado por servidor');
      setOk(true);
    } catch (e) {
      console.error('❌ Error al enviar solicitud:', e);
      setError('Error de red al enviar la solicitud.');
    } finally {
      setEnviando(false);
    }
  };

  const grupoFormateado =
    grupo === 'admin' ? 'Administrador' :
    grupo === 'participant' ? 'Participante' :
    'Sin grupo';

  return (
    <div id="barraLateral" className={`sidebar ${colapsado ? 'sidebar--colapsado' : ''}`}>
      <button className="collapse-btn" onClick={toggleColapso}>
        {colapsado ? '▸' : '◂'}
      </button>

      <div className="perfilSidebar">
        <div className="avatar-wrap" onClick={() => setIsModalOpen(true)}>
          <img src={avatar || defaultFoto} alt="Avatar" className="avatar-img" />
        </div>

        {!colapsado && (
          <>
            <div className="nombre">{nombre || 'Usuario conectado'}</div>
            <div className="email">{email}</div>
            <div className="grupo">🎖️ Rol: {grupoFormateado}</div>

            {puedeSolicitarCreador && (
              <div className="solicitar-creador-card">
                <button
                  className="solicitar-creador-btn"
                  onClick={enviarSolicitud}
                  disabled={enviando || ok}
                >
                  {enviando
                    ? 'Enviando…'
                    : ok
                    ? '✅ Solicitud enviada'
                    : '📩 Solicitar rol de Creador'}
                </button>
                {!!error && <div className="solicitar-creador-error">❌ {error}</div>}
              </div>
            )}
          </>
        )}
      </div>

      <AvatarModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

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
        {grupo === 'admin' && (
          <>
            <Link to="/admin" className="nav-link">
              <div className="step"><div className="circle">⚙️</div>{!colapsado && <span>Admin</span>}</div>
            </Link>
            <Link to="/usuarios" className="nav-link">
              <div className="step"><div className="circle">👥</div>{!colapsado && <span>Usuarios</span>}</div>
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default Sidebar;

