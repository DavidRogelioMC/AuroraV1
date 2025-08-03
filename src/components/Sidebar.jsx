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
        <div className="grupo" id="grupoSidebar">🎖️ Rol: {grupo || 'Sin grupo'}</div>
      </div>

      <AvatarModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      <div id="caminito">
        {/* Resúmenes */}
        <Link to="/resumenes" className="nav-link">
          <div className="step" style={{ cursor: 'pointer' }}>
            <div className="circle">🧠</div>
            <span>Resúmenes</span>
          </div>
        </Link>

        {/* Actividades */}
        <Link to="/actividades" className="nav-link">
          <div className="step" style={{ cursor: 'pointer' }}>
            <div className="circle">📘</div>
            <span>Actividades</span>
          </div>
        </Link>

        {/* Examen */}
        <Link to="/examenes" className="nav-link">
          <div className="step" style={{ cursor: 'pointer' }}>
            <div className="circle">🔬</div>
            <span>Examen</span>
          </div>
        </Link>
      </div>
    </div>
  );
}

export default Sidebar;

