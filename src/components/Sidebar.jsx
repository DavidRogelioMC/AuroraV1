import { Link } from 'react-router-dom';
import './Sidebar.css';
import defaultFoto from '../assets/default.jpg';
import { useEffect, useState } from 'react';
import { Auth } from 'aws-amplify';
import AvatarModal from './AvatarModal'; // 🔹 Importamos el modal

function Sidebar({ email }) {
  const [avatar, setAvatar] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false); // Estado para abrir/cerrar modal

  useEffect(() => {
    Auth.currentAuthenticatedUser()
      .then((user) => setAvatar(user.attributes.picture))
      .catch(() => setAvatar(null));
  }, []);

  return (
    <div id="barraLateral" className="sidebar"> 
      <div id="perfilSidebar" style={{ textAlign: "center", padding: "10px" }}>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
          <img
            src={avatar || defaultFoto}
            alt="Foto perfil"
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              objectFit: "cover",
              cursor: "pointer",
            }}
            onClick={() => setIsModalOpen(true)} // 🔹 Abre el modal al hacer clic
          />
        </div>
        <div className="nombre" id="nombreSidebar">Usuario</div>
        <div className="email" id="emailSidebar">{email}</div>
      </div>

      <AvatarModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      <div id="caminito">
        <div className="step">
          <div className="circle">🧠</div>
          <span>Módulos</span>
        </div>

        <Link to="/actividades" className="nav-link">
          <div className="step" style={{ cursor: 'pointer' }}>
            <div className="circle">📘</div>
            <span>Actividades</span>
          </div>
        </Link>

        <div className="step">
          <div className="circle">🔬</div>
          <span>Examen</span>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
