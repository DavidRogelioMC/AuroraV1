// src/components/AdminPage.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './AdminPage.css';

function AdminPage({ token, email }) {
  const [solicitudes, setSolicitudes] = useState([]);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    if (!token) return;

    const fetchSolicitudes = async () => {
      try {
        const response = await axios.get(
          'https://h6ysn7u0tl.execute-api.us-east-1.amazonaws.com/dev2/obtener-solicitudes-rol',
          {
            headers: {
              Authorization: token
            }
          }
        );
        setSolicitudes(response.data);
      } catch (error) {
        console.error("❌ Error al obtener solicitudes:", error);
        setMensaje("No se pudieron cargar las solicitudes.");
      }
    };

    fetchSolicitudes();
  }, [token]);

  const manejarAccion = async (correo, accion) => {
    try {
      const endpoint =
        accion === "aprobar"
          ? 'https://h6ysn7u0tl.execute-api.us-east-1.amazonaws.com/dev2/aprobar-rol-creador'
          : 'https://h6ysn7u0tl.execute-api.us-east-1.amazonaws.com/dev2/rechazar-rol-creador';

      const response = await axios.post(
        endpoint,
        { correo },
        {
          headers: {
            Authorization: token
          }
        }
      );

      setMensaje(`✅ Solicitud ${accion}ada correctamente.`);
      // Actualizar la lista eliminando la solicitud procesada
      setSolicitudes(prev => prev.filter(s => s.correo !== correo));
    } catch (error) {
      console.error(`❌ Error al ${accion} solicitud:`, error);
      setMensaje(`Error al ${accion} solicitud.`);
    }
  };

  return (
    <div className="pagina-admin">
      <h1>Panel de Administración</h1>
      <p>Desde aquí puedes ver y gestionar solicitudes de rol creador.</p>

      {mensaje && <p className="mensaje">{mensaje}</p>}

      <div className="seccion-solicitudes">
        <h2>Solicitudes Pendientes</h2>
        {solicitudes.length === 0 ? (
          <p>No hay solicitudes en este momento.</p>
        ) : (
          <ul>
            {solicitudes.map((solicitud, index) => (
              <li key={index} className="solicitud-item">
                <span>📧 {solicitud.correo}</span>

                {email === "anette.flores@netec.com.mx" && (
                  <div className="acciones">
                    <button
                      className="btn-aprobar"
                      onClick={() => manejarAccion(solicitud.correo, "aprobar")}
                    >
                      ✅ Aprobar
                    </button>
                    <button
                      className="btn-rechazar"
                      onClick={() => manejarAccion(solicitud.correo, "rechazar")}
                    >
                      ❌ Rechazar
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default AdminPage;


