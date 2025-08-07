import { Link } from 'react-router-dom';
import './Sidebar.css';
import defaultFoto from '../assets/default.jpg';
import { useEffect, useState } from 'react';
import { Auth } from 'aws-amplify';
import AvatarModal from './AvatarModal';

const DOMINIOS_NETEC = [
  'netec.com',
  'netec.com.mx',
  'netec.com.co',
  'netec.com.pe',
  'netec.com.cl',
  'netec.com.es',
];

function Sidebar({ email, nombre, grupo }) {
  const [avatar, setAvatar] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  // estado solicitud creador
  const [solicitando, setSolicitando] = useState(false);
  const [estadoSolicitud, setEstadoSolicitud] = useState(null); // 'pendiente' | 'aprobado' | 'rechazado' | null
  const [mensajeSolicitud, setMensajeSolicitud] = useState('');

  useEffect(() => {
    Auth.currentAuthenticatedUser()
      .then((user) => setAvatar(user.attributes?.picture || null))
      .catch(() => setAvatar(null));
  }, []);

  useEffect(() => {
    // Si el backend ya guarda estado, aquí podrías hacer GET para leerlo
    // y pintar el estado si existe. Lo dejamos opcional.
  }, [email]);

  const grupoFormateado =
    grupo === 'admin' ? 'Administrador' :
    grupo === 'participant' ? 'Participante' : 'Sin grupo';

  const dominioUsuario = (email || '').split('@')[1] || '';

  const puedeSolicitarCreador =
    grupo === 'admin' && DOMINIOS_NETEC.includes(dominioUsuario);

  const solicitarCreador = async () => {
    if (!email) return;

    try {
      setSolicitando(true);
      setMensajeSolicitud('');
      // usa tu endpoint productivo:
      const resp = await fetch(
        'https://h6ysn7u0tl.execute-api.us-east-1.amazonaws.com/dev2/solicitar-rol',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ correo: email }),
        }
      );
      const data = await resp.json();
      if (resp.ok) {
        // asumimos que queda "pendiente" hasta que alguien apruebe
        setEstadoSolicitud('pendiente');
        setMensajeSolicitud('✅ Solicitud enviada. Estado: Pendiente.');
      } else {
        setMensajeSolicitud(`❌ Error: ${data.error || 'No se pudo enviar la solicitud.'}`);
      }
    } catch (e) {
      setMensajeSolicitud('❌ Error de red al enviar la solicitud.');
    } finally {
      setSolicitando(false);
    }
  };

  return (
    <aside id="barraLateral" className={`sidebar ${collapsed ? 'is-collapsed' : ''}`}>
      {/* Botón contraer/expandir con separación superior */}
      <button
        className="toggle-btn"
        aria-label={collapsed ? 'Expandir sidebar' : 'Contraer sidebar'}
        onClick={() => setCollapsed(!collapsed)}
      >
        {collapsed ? '▶' : '◀'}
      </button>

      {/* Perfil */}
      <div id="perfilSidebar" className="perfil">
        <div className="avatar-wrapper" onClick={() => setIsModalOpen(true)}>
          <img
            src={avatar || defaultFoto}
            alt="Foto perfil"
            className="avatar"
          />
        </div>

        <div className="nombre" id="nombreSidebar">
          {collapsed ? '' : (nombre || 'Usuario conectado')}
        </div>
        <div className="email" id="emailSidebar">
          {collapsed ? '' : email}
        </div>
        <div className="grupo" id="grupoSidebar">
          {collapsed ? '' : `🎖️ Rol: ${grupoFormateado}`}
        </div>

        {/* Bloque Solicitar Creador – debajo del Rol */}
        {!collapsed && puedeSolicitarCreador && (
          <div className="solicitar-creador">
            <button
              type="button"
              className="btn-solicitar-creador"
              onClick={solicitarCreador}
              disabled={solicitando}
            >
              {solicitando ? 'Enviando…' : '📩 Solicitar rol de Creador'}
            </button>

            {estadoSolicitud === 'pendiente' && (
              <div className="estado estado-pendiente">Pendiente de aprobación</div>
            )}
            {estadoSolicitud === 'aprobado' && (
              <div className="estado estado-aprobado">Aprobado ✔</div>
            )}
            {estadoSolicitud === 'rechazado' && (
              <div className="estado estado-rechazado">Rechazado ✖</div>
            )}
            {mensajeSolicitud && (
              <div className="mensaje-solicitud">{mensajeSolicitud}</div>
            )}
          </div>
        )}
      </div>

      <AvatarModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      {/* Navegación */}
      <nav id="caminito" className="nav">
        <Link to="/resumenes" className="nav-link">
          <div className="step">
            <div className="circle">🧠</div>
            {!collapsed && <span>Resúmenes</span>}
          </div>
        </Link>

        <Link to="/actividades" className="nav-link">
          <div className="step">
            <div className="circle">📘</div>
            {!collapsed && <span>Actividades</span>}
          </div>
        </Link>

        <Link to="/examenes" className="nav-link">
          <div className="step">
            <div className="circle">🔬</div>
            {!collapsed && <span>Examen</span>}
          </div>
        </Link>

        {/* Solo visible para admin */}
        {grupo === 'admin' && (
          <>
            <Link to="/admin" className="nav-link">
              <div className="step">
                <div className="circle">⚙️</div>
                {!collapsed && <span>Admin</span>}
              </div>
            </Link>
            <Link to="/usuarios" className="nav-link">
              <div className="step">
                <div className="circle">👥</div>
                {!collapsed && <span>Usuarios</span>}
              </div>
            </Link>
          </>
        )}
      </nav>
    </aside>
  );
}

export default Sidebar;


