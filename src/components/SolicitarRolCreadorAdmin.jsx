// src/components/SolicitarRolCreadorAdmin.jsx
import React, { useState } from 'react';

function SolicitarRolCreadorAdmin() {
  const [correo, setCorreo] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  const dominiosPermitidos = [
    "netec.com", "netec.com.mx", "netec.com.co",
    "netec.com.pe", "netec.com.cl", "netec.com.es"
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje('');
    setError('');

    const dominio = correo.split('@')[1];
    if (!dominiosPermitidos.includes(dominio)) {
      setError("❌ Dominio no autorizado.");
      return;
    }

    try {
      const response = await fetch('https://h6ysn7u0tl.execute-api.us-east-1.amazonaws.com/dev2/solicitar-rol', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo })
      });

      const data = await response.json();
      if (response.ok) {
        setMensaje("✅ Solicitud enviada correctamente.");
        setCorreo('');
      } else {
        setError(`❌ Error: ${data.error || 'No se pudo enviar la solicitud.'}`);
      }
    } catch (err) {
      setError("❌ Error de red al enviar la solicitud.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="formulario-resumenes">
      <input
        type="email"
        placeholder="Correo del usuario autorizado"
        value={correo}
        onChange={(e) => setCorreo(e.target.value)}
        required
      />
      <button type="submit">📩 Solicitar Rol de Creador</button>

      {mensaje && <div style={{ color: "green", fontWeight: "bold" }}>{mensaje}</div>}
      {error && <div className="error-resumenes">{error}</div>}
    </form>
  );
}

export default SolicitarRolCreadorAdmin;


