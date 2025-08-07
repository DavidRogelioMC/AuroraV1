// src/components/AdminPage.jsx
import React, { useEffect, useState } from 'react';
import './AdminPage.css';

function AdminPage() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [emailUsuario, setEmailUsuario] = useState("");

  const idToken = localStorage.getItem("id_token");

  useEffect(() => {
    if (idToken) {
      try {
        const payload = JSON.parse(atob(idToken.split('.')[1]));
        setEmailUsuario(payload.email || "");
      } catch (error) {
        console.error("Error al decodificar el token:", error);
      }
    }
  }, [idToken]);

  useEffect(() => {
    const obtenerSolicitudes = async () => {
      try {
        const response = await fetch("https://3d0051a6-795c-4b88-aaa1-bbd2a8f4ab75.dev2.execute-api.us-east-1.amazonaws.com/dev2/obtener-solicitudes-rol", {
          headers: {
            Authorization: idToken,
          },
        });
        const data = await response.json();
        setSolicitudes(data.solicitudes || []);
      } catch (error) {
        console.error("Error al obtener solicitudes:", error);
      }
    };

    if (emailUsuario === "anette.flores@netec.com.mx") {
      obtenerSolicitudes();
    }
  }, [emailUsuario, idToken]);

  const manejarAccion = async (correo, accion) => {
    try {
      const response = await fetch("https://3d0051a6-795c-4b88-aaa1-bbd2a8f4ab75.dev2.execute-api.us-east-1.amazonaws.com/dev2/aprobar-rol", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: idToken,
        },
        body: JSON.stringify({ correo, accion }),
      });

      const data = await response.json();
      alert(data.message || "Operación completada.");
      setSolicitudes((prev) => prev.filter((s) => s.correo !== correo));
    } catch (error) {
      console.error("Error al realizar la acción:", error);
      alert("Error al procesar la solicitud.");
    }
  };

  return (
    <div className="pagina-admin">
      <h1>Panel de Administración</h1>
      <p>Aquí puedes ver y gestionar solicitudes de rol creador.</p>

      <h2>Solicitudes Pendientes</h2>

      {emailUsuario === "anette.flores@netec.com.mx" ? (
        solicitudes.length === 0 ? (
          <p>No hay solicitudes en este momento.</p>
        ) : (
          <ul className="lista-solicitudes">
            {solicitudes.map((s) => (
              <li key={s.correo} className="item-solicitud">
                {s.correo}
                <div className="botones">
                  <button onClick={() => manejarAccion(s.correo, "aprobar")} className="btn-aprobar">
                    ✅ Aprobar
                  </button>
                  <button onClick={() => manejarAccion(s.correo, "rechazar")} className="btn-rechazar">
                    ❌ Rechazar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )
      ) : (
        <p>No tienes permiso para ver esta sección.</p>
      )}
    </div>
  );
}

export default AdminPage;

