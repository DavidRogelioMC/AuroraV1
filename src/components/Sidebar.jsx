import React, { useEffect, useState } from 'react';
import './Sidebar.css';
import { API } from 'aws-amplify';

function Sidebar({ userEmail, rol }) {
  const [estadoSolicitud, setEstadoSolicitud] = useState(null);

  useEffect(() => {
    const obtenerEstadoSolicitud = async () => {
      try {
        const response = await API.get('tuNombreAPI', '/estado-solicitud');
        if (response && response.estado) {
          setEstadoSolicitud(response.estado);
        }
      } catch (error) {
        console.error('Error al obtener estado de solicitud:', error);
      }
    };

    obtenerEstadoSolicitud();
  }, []);

  const solicitarRol = async () => {
    try {
      await API.post('tuNombreAPI', '/solicitar-rol', {});
      setEstadoSolicitud('pendiente');
    } catch (error) {
      console.error('Error al solicitar rol:', error);
    }
  };

  return (
    <div className="sidebar">
      <div className="perfil">
        <p>{userEmail}</p>
        <p>🔰 Rol: {rol}</p>

        {rol !== 'creador' && (
          estadoSolicitud === 'pendiente' ? (
            <div className="btn-solicitud enviada">✅ Solicitud enviada</div>
          ) : (
            <button className="btn-solicitud" onClick={solicitarRol}>
              📩 Solicitar rol de Creador
            </button>
          )
        )}
      </div>

      {/* Menú aquí */}
    </div>
  );
}

export default Sidebar;



