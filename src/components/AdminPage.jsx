import { useEffect, useState } from "react";
import "./AdminPage.css";

function AdminPage() {
  const [correo, setCorreo] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [solicitudes, setSolicitudes] = useState([]);
  const token = localStorage.getItem("id_token");

  const API_URL = "https://h6ysn7u0tl.execute-api.us-east-1.amazonaws.com/dev2";

  const solicitarRol = async () => {
    try {
      const response = await fetch(`${API_URL}/solicitar-rol-creador`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify({ correo }),
      });

      const data = await response.json();
      setMensaje(data.mensaje || "Solicitud enviada.");
      setCorreo("");
    } catch (error) {
      console.error("Error al solicitar rol:", error);
      setMensaje("Error al enviar la solicitud.");
    }
  };

  const obtenerSolicitudes = async () => {
    try {
      const response = await fetch(`${API_URL}/obtener-solicitudes-rol`, {
        method: "GET",
        headers: {
          Authorization: token,
        },
      });

      const data = await response.json();
      setSolicitudes(data.solicitudes || []);
    } catch (error) {
      console.error("Error al obtener solicitudes:", error);
    }
  };

  useEffect(() => {
    obtenerSolicitudes();
  }, []);

  return (
    <div className="admin-container">
      <h2>👑 Panel de Administración</h2>
      <p>Aquí puedes solicitar el rol de creador para un usuario autorizado.</p>

      <div className="solicitar-rol">
        <input
          type="email"
          placeholder="Correo del usuario autorizado"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
        />
        <button onClick={solicitarRol}>📩 Solicitar Rol de Creador</button>
      </div>

      {mensaje && <p style={{ color: "green" }}>{mensaje}</p>}

      <hr />

      <h3>📥 Solicitudes Recientes</h3>
      {solicitudes.length === 0 ? (
        <p>No hay solicitudes pendientes por ahora.</p>
      ) : (
        <ul className="solicitudes-lista">
          {solicitudes.map((s, i) => (
            <li key={i} className="solicitud-item">
              <span>{s.correo}</span>
              {/* Los botones de aprobar/rechazar los agregamos luego si quieres */}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default AdminPage;

