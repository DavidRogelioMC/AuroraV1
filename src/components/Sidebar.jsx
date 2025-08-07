import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Sidebar.css';
import SolicitarRolCreadorAdmin from './SolicitarRolCreadorAdmin';

function Sidebar() {
  const [sidebarAbierto, setSidebarAbierto] = useState(true);
  const [email, setEmail] = useState('');
  const [rol, setRol] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('id_token');
    if (!token) return;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setEmail(payload.email || '');
      setRol((payload['custom:rol'] || '').toLowerCase()); // "admin" | "participant" | ...
    } catch (e) {
      console.error('No se pudo decodificar el token:', e);
    }
  }, []);

  const toggleSidebar = () => setSidebarAbierto((s) => !s);
  const cerrarSesion = () => {
    localStorage.removeItem('id_token');
    navigate('/');
  };

  // Ítems del menú (con emojis como en tu UI)
  const items = [
    { icono: '🧠', texto: 'Resúmenes', ruta: '/resumenes' },
    { icono: '📘', texto: 'Actividades', ruta: '/actividades' },
    { icono: '🔬', texto: 'Examen', ruta: '/examenes' },
    { icono: '⚙️', texto: 'Admin', ruta: '/admin', soloAdmin: true },
    { icono: '👥', texto: 'Usuarios', ruta: '/usuarios', soloAdmin: true },
  ];

  const esAdmin = rol === 'admin';

  return (
    <div id="barraLateral" className={sidebarAbierto ? 'abierto' : 'cerrado'}>
      {/* Botón de contraer/expandir con separación */}
      <div className="toggle-container">
        <button className="toggle-btn" onClick={toggleSidebar} aria-label="Contraer/Expandir">▸</button>
      </div>

      {/* Perfil */}
      <div id="perfilSidebar">
        <img
          src="https://cdn-icons-png.flaticon.com/512/847/847969.png"
          alt="Foto perfil"
        />

        {/* Mostrar textos solo cuando está abierto */}
        {sidebarAbierto && (
          <>
            <div className="nombre">{email || 'Usuario'}</div>
            {/* QUITAMOS el duplicado del correo */}
            {/* <div className="email">{email}</div> */}
            <div className="rol">🎖️ Rol: {esAdmin ? 'Administrador' : 'Participante'}</div>

            {/* Botón de solicitar rol de creador (debajo del rol), usando email autenticado */}
            {esAdmin && (
              <div className="solicitud-creador-admin">
                <SolicitarRolCreadorAdmin correoAutenticado={email} />
              </div>
            )}
          </>
        )}
      </div>

      {/* Navegación */}
      <div id="caminito">
        {items.map((it, idx) => {
          if (it.soloAdmin && !esAdmin) return null;
          return (
            <div key={idx} className="step" onClick={() => navigate(it.ruta)}>
              <div className="circle">{it.icono}</div>
              {sidebarAbierto && <span>{it.texto}</span>}
            </div>
          );
        })}
      </div>

      {/* Cerrar sesión */}
      <div className="cerrar-sesion-container">
        <button className="cerrar-sesion-btn" onClick={cerrarSesion}>
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}

export default Sidebar;

