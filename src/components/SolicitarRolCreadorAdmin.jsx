import React, { useState, useEffect } from 'react';
import './SolicitarRolCreadorAdmin.css';

function SolicitarRolCreadorAdmin() {
  const [correo, setCorreo] = useState('');
  const [estadoSolicitud, setEstadoSolicitud] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const token = localStorage.getItem("id_token");

  useEffect(() => {
    if (!token) return;

    const payload = JSON.parse(atob(token.split('.')[1]));
    const email = payload.email;
    setCorreo(email);

    fetch(`https://h6ysn7u0tl.execute-api.us-east-1.amazonaws.com/dev2/obtener-solicitudes-rol?correo=${email}`, {
      method: 'GET',
      headers: { Authorization: token }
    })
      .then(res => res.json())
      .then(data => {
        if (data.estado) setEstadoSolicitud(data.estado);
      });
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje('');
    setError('');

    try {
      const response = await fetch('https://h6ysn7u0tl.execute-api.us-east-1.amazonaws.com/dev2/solicitar-rol', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token
        },
        body: JSON.stringify({ correo })
      });

      const data = await response.json();
      if (response.ok) {
        setMensaje("✅ Solicitud enviada correctamente.");
        setEstadoSolicitud("pendiente");
      } else {
        setError(`❌ Error: ${data.error || 'No se pudo enviar la solicitud.'}`);
      }
    } catch (err) {
      setError("❌ Error de red al enviar la solicitud.");
    }
  };

  return (
    <div className="formulario-solicitud-rol">
      <h2>Solicitud de Rol de Creador</h2>

      <div>
        <strong>Correo autenticado:</strong><br />
        {correo}
      </div>

      <form onSubmit={handleSubmit}>
        {(estadoSolicitud === '' || estadoSolicitud === 'rechazado') && (
          <button type="submit">📩 Solicitar Acceso como Creador</button>
        )}

        {estadoSolicitud === 'pendiente' && (
          <div className="estado-solicitud pendiente">⏳ Solicitud en revisión</div>
        )}

        {estadoSolicitud === 'aceptado' && (
          <div className="estado-solicitud aceptado">✅ Ya eres creador</div>
        )}

        {estadoSolicitud === 'rechazado' && (
          <div className="estado-solicitud rechazado">❌ Solicitud rechazada, puedes volver a intentar</div>
        )}

        {mensaje && <div className="estado-solicitud aceptado">{mensaje}</div>}
        {error && <div className="estado-solicitud rechazado">{error}</div>}
      </form>
    </div>
  );
}

export default SolicitarRolCreadorAdmin;

