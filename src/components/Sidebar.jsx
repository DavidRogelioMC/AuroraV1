import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Sidebar.css';
import { Auth } from 'aws-amplify';
import { Brain, BookOpen, Microscope, Settings } from 'lucide-react'; // íconos opcionales

function Sidebar({ user, rol }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await Auth.signOut();
      localStorage.clear();
      navigate('/');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
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
        <button onClick={() => navigate('/resumenes')}>
          <Brain size={24} style={{ marginRight: 8 }} />
          Resúmenes
        </button>

        <button onClick={() => navigate('/actividades')}>
          <BookOpen size={24} style={{ marginRight: 8 }} />
          Actividades
        </button>

        <button onClick={() => navigate('/examen')}>
          <Microscope size={24} style={{ marginRight: 8 }} />
          Examen
        </button>

        {rol === 'admin' && (
          <>
            <button onClick={() => navigate('/reportes')}>
              📊 Reportes
            </button>
            <button onClick={() => navigate('/admin')}>
              <Settings size={24} style={{ marginRight: 8 }} />
              Administración
            </button>
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
