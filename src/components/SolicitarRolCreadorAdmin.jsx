// src/components/SolicitarRolCreadorAdmin.jsx
import React, { useEffect, useState } from 'react';

const API_BASE = 'https://h6ysn7u0tl.execute-api.us-east-1.amazonaws.com/dev2';

function SolicitarRolCreadorAdmin({ correoAutenticado }) {
  const [estado, setEstado] = useState(''); // '', 'pendiente','aprobado','rechazado'
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const token = localStorage.getItem('id_token');
  const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

  useEffect(() => {
    if (!correoAutenticado) return;
    const fetchEstado = async () => {
      try {
        const r = await fetch(`${API_BASE}/obtener-solicitudes-rol`, { headers: authHeader });
        if (!r.ok) return;
        const data = await r.json().catch(() => ({}));
        const lista = Array.isArray(data?.solicitudes) ? data.solicitudes : [];
        const it = lista.find(s => (s.correo || '').toLowerCase() === correoAutenticado.toLowerCase());
        const e = (it?.estado || '').toLowerCase();
        setEstado(e || '');
      } catch {}
    };
    fetchEstado();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [correoAutenticado, token]);

  const solicitar = async () => {
    setMsg(''); setErr('');
    try {
      const res = await fetch(`${API_BASE}/solicitar-rol`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader },
        body: JSON.stringify({ correo: correoAutenticado })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'No se pudo enviar la solicitud');
      setEstado('pendiente');
      setMsg('✅ Solicitud enviada. Queda en revisión.');
    } catch {
      setErr('❌ Error al enviar la solicitud.');
    }
  };

  const disabled = estado === 'pendiente' || estado === 'aprobado';

  return (
    <div>
      <button
        onClick={solicitar}
        disabled={disabled}
        style={{
          width: '100%', padding: '10px 12px',
          backgroundColor: disabled ? '#0a4e60' : '#035b6e',
          opacity: disabled ? 0.9 : 1,
          color: '#fff', border: 'none', borderRadius: 8,
          fontWeight: 700, cursor: disabled ? 'not-allowed' : 'pointer'
        }}
        title={correoAutenticado || ''}
      >
        👑 {estado === 'aprobado' ? 'Ya eres Creador'
            : estado === 'pendiente' ? 'Solicitud enviada (Pendiente)'
            : 'Solicitar Rol de Creador'}
      </button>

      {estado === 'pendiente' && <div style={{color:'orange',marginTop:6}}>⏳ Solicitud en revisión</div>}
      {estado === 'aprobado'  && <div style={{color:'lightgreen',marginTop:6}}>✅ Ya eres creador</div>}
      {estado === 'rechazado' && <div style={{color:'salmon',marginTop:6}}>❌ Rechazada. Puedes volver a intentar.</div>}

      {msg && <div style={{ color: 'lightgreen', marginTop: 6 }}>{msg}</div>}
      {err && <div style={{ color: 'salmon', marginTop: 6 }}>{err}</div>}
    </div>
  );
}

export default SolicitarRolCreadorAdmin;


