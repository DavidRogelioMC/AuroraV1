// src/components/Sidebar.jsx
import { Link } from 'react-router-dom';
import './Sidebar.css';
import defaultFoto from '../assets/default.jpg';
import { useEffect, useState } from 'react';
import { Auth } from 'aws-amplify';
import AvatarModal from './AvatarModal';
import SolicitarRolCreadorAdmin from './SolicitarRolCreadorAdmin';

function Sidebar({ email, nombre, grupo }) {
  const [avatar, setAvatar] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [contraido, setContraido] = useState(false);

  useEffect(() => {
    Auth.currentAuthenticatedUser()
      .then((user) => setAvatar(user.attributes.picture))
      .catch(() => setAvatar(null));
  }, []);

  const toggleSidebar = () => {
    setContraido(!contraido);
  };

  const grupoFormateado = grupo === 'admin'
    ? 'Administrador'
    : grupo === 'participant'
    ? 'Participante'
    : 'Sin grupo';

  return (
    <div id="barraLateral" className={`sidebar ${contraido ? 'contraido' : ''}`}>
      <button id="toggleSidebar" onClick={toggleSidebar}>
        {contraido ? '➡️' : '⬅️'}
      </button>

      {!contraido && (
        <div id="perfilSidebar">
          <img
            src={avatar || defaultFoto}
            alt="Foto perfil"
            onClick={() => setIsModalOpen(true)}
          />
          <div className="nombre">{nombre || 'Usuario conectado'}</div>
          <div className="email">{email}</div>
          <div className="grupo">🎖️ Rol: {grupoFormateado}</div>
        </div>
      )}

      <AvatarModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      <div id="caminito">
        <Link to="/resumenes" className="nav-link">
          <div className="step">
            <div className="circle">🧠</div>
            {!contraido && <span>Resúmenes</span>}
          </div>
        </Link>

        <Link to="/actividades" className="nav-link">
          <div className="step">
            <div className="circle">📘</div>
            {!contraido && <span>Actividades</span>}
          </div>
        </Link>

        <Link to="/examenes" className="nav-link">
          <div className="step">
            <div className="circle">🔬</div>
            {!contraido && <span>Examen</span>}
          </div>
        </Link>

        {grupo === 'admin' && (
          <>
            <Link to="/admin" className="nav-link">
              <div className="step"><div className="circle">⚙️</div>{!contraido && <span>Admin</span>}</div>
            </Link>

            <Link to="/usuarios" className="nav-link">
              <div className="step"><div className="circle">👥</div>{!contraido && <span>Usuarios</span>}</div>
            </Link>

            {!contraido && <SolicitarRolCreadorAdmin email={email} />}
          </>
        )}
      </div>
    </div>
  );
}

export default Sidebar;
