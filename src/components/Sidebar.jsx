// src/components/Sidebar.jsx
import { Link } from 'react-router-dom';
import './Sidebar.css';
import defaultFoto from '../assets/default.jpg';
import { useEffect, useState } from 'react';
import { Auth } from 'aws-amplify';
import AvatarModal from './AvatarModal';
import SolicitarRolCreadorAdmin from './SolicitarRolCreadorAdmin'; // 👈 Asegúrate de tener este archivo

function Sidebar({ email, nombre, grupo }) {
  const [avatar, setAvatar] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [colapsado, setColapsado] = useState(false);

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

  const toggleSidebar = () => setColapsado(!colapsado);

  return (
    <div id="barraLateral" className={`sidebar ${colapsado ? 'collapsed' : ''}`}>
      <button className="toggle-btn" onClick={toggleSidebar}>{colapsado ? '➡️' : '⬅️'}</button>

      {!colapsado && (
        <>
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

                {/* ✅ Solicitar acceso a rol creador */}
                <div className="step">
                  <SolicitarRolCreadorAdmin />
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default Sidebar;


