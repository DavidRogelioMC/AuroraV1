// src/components/SolicitarRolCreadorAdmin.jsx
import React, { useState } from 'react';

function SolicitarRolCreadorAdmin({ correo }) {
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [estado, setEstado] = useState('');

  const dominiosPermitidos = [
    "netec.com", "netec.com.mx", "netec.com.co",
    "netec.com.pe", "netec.com.cl", "netec.com.es"
  ];

  const handleSubmit = async () => {
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
        setEstado('enviado');
        setMensaje("✅ Solicitud enviada correctamente.");
      } else {
        setEstado('fallo');
        setError(`❌ Error: ${data.error || 'No se pudo enviar la solicitud.'}`);
      }
    } catch {
      setEstado('fallo');
      setError("❌ Error de red al enviar la solicitud.");
    }
  };

  return (
    <div>
      <button
        style={{
          width: '100%',
          padding: '8px',
          backgroundColor: '#035b6e',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          fontWeight: 'bold',
          marginTop: '4px',
        }}
        onClick={handleSubmit}
        disabled={estado === 'enviado'}
      >
        👑 Solicitar Rol de Creador
      </button>
      {mensaje && <div style={{ color: "lightgreen", fontSize: '13px' }}>{mensaje}</div>}
      {error && <div style={{ color: "salmon", fontSize: '13px' }}>{error}</div>}
    </div>
  );
}

export default SolicitarRolCreadorAdmin;
