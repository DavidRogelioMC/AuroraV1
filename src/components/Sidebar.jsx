import { Link } from 'react-router-dom';
import './Sidebar.css';
import defaultFoto from '../assets/default.jpg';
import { useEffect, useMemo, useState } from 'react';
import { Auth } from 'aws-amplify';
import AvatarModal from './AvatarModal';

const API_BASE = 'https://h6ysn7u0tl.execute-api.us-east-1.amazonaws.com/dev2';

const DOMINIOS_PERMITIDOS = new Set([
  'netec.com', 'netec.com.mx', 'netec.com.co', 'netec.com.pe', 'netec.com.cl', 'netec.com.es'
]);

function Sidebar({ email, nombre, grupo, token }) {
  const [avatar, setAvatar] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [colapsado, setColapsado] = useState(false);

  // estados del botón solicitar creador
  const [enviando, setEnviando] = useState(false);
  const [ok, setOk] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    Auth.currentAuthenticatedUser()
      .then((user) => setAvatar(user.attributes?.picture))
      .catch(() => setAvatar(null));
  }, []);

  const grupoFormateado =
    grupo === 'admin' ? 'Administrador' :
    grupo === 'participant' ? 'Participante' : 'Sin grupo';

  const dominio = useMemo(() => (email?.split('@')[1] || '').toLowerCase(), [email]);
  const esDominioNetec = DOMINIOS_PERMITIDOS.has(dominio);
  const puedeSolicitarCreador = grupo === 'admin' && esDominioNetec;

  const toggleColapso = () => setColapsado((v) => !v);

  const enviarSolicitudCreador = async () => {
    setEnviando(true);
    setOk(false);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/solicitar-rol`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Si tu API no requiere Auth, puedes quitar la siguiente línea:
          ...(token ? { Authorization: token } : {})
        },
        body: JSON.stringify({ correo: email })
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.error || 'Solicitud rechazada por el servidor');
      }
      setOk(true);
    } catch (e) {
      console.error('❌ Error al enviar solicitud:', e);
      setError('Error de red al enviar la solicitud.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div id="barraLateral" className={`sidebar ${colapsado ? 'sidebar--colapsado' : ''}`}>
      {/* Botón colapsar/expandir */}
      <button
        type="button"
        className="collapse-btn"
        aria-label={colapsado ? 'Expandir barra lateral' : 'Colapsar barra lateral'}
        onClick={toggleColapso}
      >
        {colapsado ? '▸' : '◂'}
      </button>

      <div id="perfilSidebar" className="perfilSidebar">
        <div className="avatar-wrap" onClick={() => setIsModalOpen(true)}>
          <img
            src={avatar || defaultFoto}
            alt="Foto perfil"
            className="avatar-img"
          />
        </div>

        {!colapsado && (
          <>
            <div className="nombre" id="nombreSidebar">{nombre || 'Usuario conectado'}</div>
            <div className="email" id="emailSidebar">{email}</div>
            <div className="grupo" id="grupoSidebar">🎖️ Rol: {grupoFormateado}</div>

            {/* Botón Solicitar rol de Creador (debajo del rol) */}
            {puedeSolicitarCreador && (
              <div className="solicitar-creador-card">
                <button
                  className="solicitar-creador-btn"
                  onClick={enviarSolicitudCreador}
                  disabled={enviando || ok}
                >
                  {enviando ? 'Enviando…' : (ok ? '✅ Solicitud enviada' : '📩 Solicitar rol de Creador')}
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

        {grupo === 'admin' && (
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

export default Sidebar;


