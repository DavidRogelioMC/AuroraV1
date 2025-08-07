// src/components/Sidebar.jsx
import { Link } from 'react-router-dom';
import './Sidebar.css';
import defaultFoto from '../assets/default.jpg';
import { useEffect, useState } from 'react';
import { Auth } from 'aws-amplify';
import AvatarModal from './AvatarModal';

function Sidebar({ email, nombre, grupo }) {
  const [avatar, setAvatar] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    Auth.currentAuthenticatedUser()
      .then((user) => setAvatar(user.attributes.picture))
      .catch(() => setAvatar(null));
  }, []);

  const grupoFormateado = grupo === 'admin'
    ? 'Administrador'
    : grupo === 'participant'
    ? 'Participante'
    : grupo === 'creador'
    ? 'Creador'
    : 'Sin grupo';

  const dominiosPermitidos = [
    "netec.com", "netec.com.mx", "netec.com.co",
    "netec.com.pe", "netec.com.cl", "netec.com.es"
  ];

  const dominioUsuario = email?.split('@')[1] || "";
  const puedeSolicitar = grupo === 'admin' && dominiosPermitidos.includes(dominioUsuario);

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

        {/* ✅ Solo visible para admin */}
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

        {/* ✅ Solo visible para admin con dominio de Netec */}
        {puedeSolicitar && (
          <Link to="/solicitar-rol" className="nav-link">
            <div className="step"><div className="circle">📩</div><span>Solicitar ser creador</span></div>
          </Link>
        )}
      </div>
    </div>
  );
}

export default Sidebar;


