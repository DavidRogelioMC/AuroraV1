import './Sidebar.css';
import defaultFoto from '../assets/default.jpg';
import { Link } from 'react-router-dom';

function Sidebar() {
  return (
    <div id="barraLateral">
      <div id="perfilSidebar">
        <img id="fotoPerfilSidebar" src={defaultFoto} alt="Foto perfil" />
        <div className="nombre" id="nombreSidebar">Usuario</div>
        <div className="email" id="emailSidebar">usuario@ejemplo.com</div>
      </div>

      <div id="caminito">
        <Link to="/" className="step">
          <div className="circle">🧠</div>
          <span>Módulos</span>
        </Link>

        <Link to="/" className="step">
          <div className="circle">📘</div>
          <span>Actividades</span>
        </Link>

        <Link to="/" className="step">
          <div className="circle">🔬</div>
          <span>Examen</span>
        </Link>
      </div>
    </div>
  );
}

export default Sidebar;
