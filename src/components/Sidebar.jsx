// src/components/Sidebar.jsx
import React, { useState, useEffect } from "react";
import "./Sidebar.css";
import { useNavigate } from "react-router-dom";
import { FaBrain, FaBook, FaMicroscope, FaUsers, FaTools, FaSignOutAlt, FaBars } from "react-icons/fa";
import { jwtDecode } from "jwt-decode";
import SolicitarRolCreadorAdmin from "./SolicitarRolCreadorAdmin";

function Sidebar() {
  const [sidebarAbierto, setSidebarAbierto] = useState(true);
  const [correo, setCorreo] = useState("");
  const [rol, setRol] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("id_token");
    if (token) {
      const decoded = jwtDecode(token);
      setCorreo(decoded.email);
      setRol(decoded["custom:rol"] || "");
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("id_token");
    navigate("/");
  };

  const toggleSidebar = () => {
    setSidebarAbierto(!sidebarAbierto);
  };

  const mostrarBotonCreador = rol === "Administrador";

  return (
    <div id="barraLateral" className={sidebarAbierto ? "abierto" : "cerrado"}>
      <div className="toggle-container">
        <button onClick={toggleSidebar} className="toggle-btn">
          <FaBars />
        </button>
      </div>

      <div id="perfilSidebar">
        <img src="https://cdn-icons-png.flaticon.com/512/9131/9131529.png" alt="Perfil" />
        {sidebarAbierto && (
          <>
            <div className="nombre">{correo}</div>
            <div className="email">{correo}</div>
            <div className="rol">
              <span>🎓 Rol: {rol || "Participante"}</span>
            </div>
            {mostrarBotonCreador && (
              <div className="solicitud-creador-admin">
                <SolicitarRolCreadorAdmin />
              </div>
            )}
          </>
        )}
      </div>

      <div id="caminito">
        <div className="step" onClick={() => navigate("/resumenes")}>
          <div className="circle"><FaBrain /></div>
          {sidebarAbierto && <span>Resúmenes</span>}
        </div>
        <div className="step" onClick={() => navigate("/actividades")}>
          <div className="circle"><FaBook /></div>
          {sidebarAbierto && <span>Actividades</span>}
        </div>
        <div className="step" onClick={() => navigate("/examen")}>
          <div className="circle"><FaMicroscope /></div>
          {sidebarAbierto && <span>Examen</span>}
        </div>
        {rol === "Administrador" && (
          <>
            <div className="step" onClick={() => navigate("/admin")}>
              <div className="circle"><FaTools /></div>
              {sidebarAbierto && <span>Admin</span>}
            </div>
            <div className="step" onClick={() => navigate("/usuarios")}>
              <div className="circle"><FaUsers /></div>
              {sidebarAbierto && <span>Usuarios</span>}
            </div>
          </>
        )}
      </div>

      <div className="cerrar-sesion-container">
        <button onClick={handleLogout} className="cerrar-sesion-btn">
          <FaSignOutAlt /> {sidebarAbierto && "Cerrar sesión"}
        </button>
      </div>
    </div>
  );
}

export default Sidebar;

