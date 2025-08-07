// src/components/Sidebar.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Sidebar.css';
import SolicitarRolCreadorAdmin from './SolicitarRolCreadorAdmin';

function Sidebar() {
  const [sidebarAbierto, setSidebarAbierto] = useState(true);
  const [correo, setCorreo] = useState('');
  const [fotoPerfil, setFotoPerfil] = useState('');
  const [rol, setRol] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('id_token');
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const email = payload.email || '';
      setCorreo(email);
      setRol(payload['custom:rol'] || '');
      setFotoPerfil(`https://perfil-fotos-any1804.s3.amazonaws.com/${payload.sub}`);
    }
  }, []);

  const toggleSidebar = () => setSidebarAbierto(!sidebarAbierto);

  const handleCerrarSesion = () => {
    localStorage.clear();
    navigate('/');
  };

  const pasos = [
    { icono: '🧠', texto: 'Resúmenes', ruta: '/resumenes' },
    { icono: '📘', texto: 'Actividades', ruta: '/actividades' },
    { icono: '🔬', texto: 'Examen', ruta: '/examen' },
    { icono: '⚙️', texto: 'Admin', ruta: '/admin', soloAdmin: true },
    { icono: '👥', texto: 'Usuarios', ruta: '/usuarios', soloAdmin: true },
  ];

  return (
    <div id="barraLateral" className={sidebarAbierto ? 'abierto' : 'cerrado'}>
      <div className="toggle-container">
        <button className="toggle-btn" onClick={toggleSidebar}>☰</button>
      </div>

      <div id="perfilSidebar">
        <img src={fotoPerfil} alt="Foto" />
        {sidebarAbierto && (
          <>
            <div className="nombre">{correo}</div>
            <div className="email">{correo}</div>
            {rol && <div className="rol">🎓 Rol: {rol.charAt(0).toUpperCase() + rol.slice(1)}</div>}
          </>
        )}
        {sidebarAbierto && <div className="solicitud-creador-admin"><SolicitarRolCreadorAdmin correo={correo} /></div>}
      </div>

      <div id="caminito">
        {pasos.map((paso, i) => {
          if (paso.soloAdmin && rol !== 'admin') return null;
          return (
            <div className="step" key={i} onClick={() => navigate(paso.ruta)}>
              <div className="circle">{paso.icono}</div>
              {sidebarAbierto && <span>{paso.texto}</span>}
            </div>
          );
        })}
      </div>

      <div className="cerrar-sesion-container">
        <button className="cerrar-sesion-btn" onClick={handleCerrarSesion}>
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}

export default Sidebar;

