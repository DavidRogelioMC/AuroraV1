// src/components/Sidebar.jsx (CÓDIGO MODIFICADO)

// --- 1. IMPORTAMOS EL COMPONENTE 'Link' DE REACT ROUTER ---
import { Link } from 'react-router-dom';

import './Sidebar.css';
import defaultFoto from '../assets/default.jpg';

// El componente ya no necesita la prop 'onOpenActividades'
function Sidebar() {
  return (
    <div id="barraLateral">
      <div id="perfilSidebar">
        <img id="fotoPerfilSidebar" src={defaultFoto} alt="Foto perfil" />
        <div className="nombre" id="nombreSidebar">Usuario</div>
        <div className="email" id="emailSidebar">usuario@ejemplo.com</div>
      </div>

      <div id="caminito">
        {/* Módulos (se mantiene sin cambios) */}
        <div className="step">
          <div className="circle">🧠</div>
          <span>Módulos</span>
        </div>

        {/* --- 2. MODIFICAMOS EL BOTÓN "ACTIVIDADES" --- */}
        {/* Envolvemos todo el 'step' en un componente <Link> */}
        {/* Esto lo convierte en un enlace de navegación a la ruta '/actividades' */}
        <Link to="/actividades" className="nav-link">
          <div className="step" style={{ cursor: 'pointer' }}>
            <div className="circle">📘</div>
            <span>Actividades</span>
          </div>
        </Link>

        {/* Examen (se mantiene sin cambios) */}
        <div className="step">
          <div className="circle">🔬</div>
          <span>Examen</span>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
