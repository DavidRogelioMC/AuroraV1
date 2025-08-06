import React from 'react';
import './Sidebar.css';

function Sidebar({ user, rol }) {
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  return (
    <div className="sidebar">
      <div className="user-info">
        <div className="avatar" />
        <p className="username">Usuario conectado</p>
        <p className="email">{user?.attributes?.email || 'Sin correo'}</p>
        <p className="rol">🧪 Rol: {rol || 'sin rol'}</p>
      </div>

      <div className="menu">
        <button>🧠 Resúmenes</button>
        <button>📘 Actividades</button>
        <button>🔬 Examen</button>

        {rol === 'admin' && (
          <>
            <button>📊 Reportes</button>
            <button>⚙️ Administración</button>
          </>
        )}
      </div>

      <button className="logout-button" onClick={handleLogout}>
        Cerrar sesión
      </button>
    </div>
  );
}

export default Sidebar;
