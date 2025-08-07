import React, { useEffect, useState } from 'react';

function SolicitarRolCreadorAdmin({ correoAutenticado }) {
  const [estado, setEstado] = useState(''); // '', 'pendiente', 'aceptado', 'rechazado'
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const token = localStorage.getItem('id_token');

  // Traer estado inicial
  useEffect(() => {
    if (!correoAutenticado) return;

    const url = `https://h6ysn7u0tl.execute-api.us-east-1.amazonaws.com/dev2/obtener-solicitudes-rol?correo=${encodeURIComponent(correoAutenticado)}`;

    fetch(url, { headers: token ? { Authorization: token } : {} })
      .then(r => r.ok ? r.json() : Promise.reject(r))
      .then(data => {
        if (data?.estado) setEstado(data.estado); // 'pendiente' | 'aceptado' | 'rechazado'
      })
      .catch(() => {});
  }, [correoAutenticado, token]);

  const solicitar = async () => {
    setMsg(''); setErr('');
    try {
      const res = await fetch('https://h6ysn7u0tl.execute-api.us-east-1.amazonaws.com/dev2/solicitar-rol', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: token } : {})
        },
        body: JSON.stringify({ correo: correoAutenticado })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'No se pudo enviar la solicitud');
      setEstado('pendiente');
      setMsg('✅ Solicitud enviada. Queda en revisión.');
    } catch (e) {
      setErr('❌ Error al enviar la solicitud.');
    }
  };

  const renderEstado = () => {
    if (estado === 'pendiente') return <div style={{color: 'orange', marginTop: 6}}>⏳ Solicitud en revisión</div>;
    if (estado === 'aceptado')  return <div style={{color: 'lightgreen', marginTop: 6}}>✅ Ya eres creador</div>;
    if (estado === 'rechazado') return <div style={{color: 'salmon', marginTop: 6}}>❌ Solicitud rechazada. Puedes volver a intentar.</div>;
    return null;
  };

  return (
    <div>
      {/* Botón siempre visible; si está "pendiente" lo desactivamos */}
      <button
        onClick={solicitar}
        disabled={estado === 'pendiente'}
        style={{
          width: '100%', padding: '10px 12px',
          backgroundColor: estado === 'pendiente' ? '#0a4e60' : '#035b6e',
          opacity: estado === 'pendiente' ? 0.9 : 1,
          color: '#fff', border: 'none', borderRadius: 8,
          fontWeight: 700, cursor: estado === 'pendiente' ? 'not-allowed' : 'pointer'
        }}
        title={correoAutenticado || ''}
      >
        👑 Solicitar Rol de Creador
      </button>

      {renderEstado()}
      {msg && <div style={{ color: 'lightgreen', marginTop: 6 }}>{msg}</div>}
      {err && <div style={{ color: 'salmon', marginTop: 6 }}>{err}</div>}
    </div>
  );
}

export default SolicitarRolCreadorAdmin;

