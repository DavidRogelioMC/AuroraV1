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
  const [colapsado, setColapsado] = useState(false);

  useEffect(() => {
    Auth.currentAuthenticatedUser()
      .then((user) => setAvatar(user.attributes.picture))
      .catch(() => setAvatar(null));
  }, []);

  const grupoFormateado =
    grupo === 'admin'
      ? 'Administrador'
      : grupo === 'participant'
      ? 'Participante'
      : 'Sin grupo';

  return (
    <div id="barraLateral" className={colapsado ? 'colapsado' : ''}>
      <button id="toggleSidebar" onClick={() => setColapsado(!colapsado)}>
        {colapsado ? '➡️' : '⬅️'}
      </button>

      {!colapsado && (
        <div id="perfilSidebar">
          <img
            src={avatar || defaultFoto}
            alt="Foto perfil"
            onClick={() => setIsModalOpen(true)}
          />
          <div className="nombre">{nombre || 'Usuario'}</div>
          <div className="email">{email}</div>
          <div className="grupo">🎖️ Rol: {grupoFormateado}</div>
        </div>
      )}

      <AvatarModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      <div id="caminito">
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

