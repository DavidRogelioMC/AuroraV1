// src/components/SolicitarRolCreadorAdmin.jsx
import React, { useEffect, useState } from 'react';

function SolicitarRolCreadorAdmin({ email }) {
  const [estado, setEstado] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  const dominiosPermitidos = [
    "netec.com", "netec.com.mx", "netec.com.co",
    "netec.com.pe", "netec.com.cl", "netec.com.es"
  ];

  const dominio = email.split('@')[1];
  const puedeSolicitar = dominiosPermitidos.includes(dominio);

  useEffect(() => {
    if (!email || !puedeSolicitar) return;

    fetch(`https://h6ysn7u0tl.execute-api.us-east-1.amazonaws.com/dev2/estado-solicitud?correo=${email}`)
      .then(res => res.json())
      .then(data => {
        if (data.estado) setEstado(data.estado);
      })
      .catch(() => {
        setError('❌ Error al verificar el estado de la solicitud.');
      });
  }, [email]);

  const handleSolicitud = async () => {
    setMensaje('');
    setError('');

    try {
      const res = await fetch('https://h6ysn7u0tl.execute-api.us-east-1.amazonaws.com/dev2/solicitar-rol', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo: email })
      });

      const data = await res.json();
      if (res.ok) {
        setMensaje('✅ Solicitud enviada correctamente.');
        setEstado('pendiente');
      } else {
        setError(`❌ Error: ${data.error || 'No se pudo enviar la solicitud.'}`);
      }
    } catch {
      setError('❌ Error de red al enviar la solicitud.');
    }
  };

  if (!puedeSolicitar) return null;

  return (
    <div className="formulario-resumenes" style={{ marginTop: '20px' }}>
      <button onClick={handleSolicitud} disabled={estado === 'pendiente'}>
        📩 Solicitar Rol de Creador
      </button>

      {estado && <div style={{ marginTop: '10px' }}>
        <strong>Estado de la solicitud:</strong> {estado === 'aceptada'
          ? '✅ Aceptada'
          : estado === 'pendiente'
          ? '⏳ Pendiente'
          : estado === 'rechazada'
          ? '❌ Rechazada (puedes volver a intentar)'
          : estado}
      </div>}

      {mensaje && <div style={{ color: 'green', fontWeight: 'bold' }}>{mensaje}</div>}
      {error && <div className="error-resumenes">{error}</div>}
    </div>
  );
}

export default SolicitarRolCreadorAdmin;
