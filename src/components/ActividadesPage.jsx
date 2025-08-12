// src/components/AdminPage.jsx
import React, { useEffect, useState } from 'react';
import './AdminPage.css';

function AdminPage() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [email, setEmail] = useState('');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(''); // correo en proceso

  const token = localStorage.getItem('id_token');
  const correoAutorizado = 'anette.flores@netec.com.mx';

  // Decodifica el JWT de forma segura (manejo de base64url)
  useEffect(() => {
    if (!token) return;
    try {
      const payloadPart = token.split('.')[1] || '';
      const normalized = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
      const json = decodeURIComponent(
        atob(normalized)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const payload = JSON.parse(json);
      setEmail(payload?.email || '');
    } catch (e) {
      console.error('Error al decodificar token', e);
    }
  }, [token]);

  // Normaliza el shape de la respuesta
  const normalizeSolicitudes = (data) => {
    const arr =
      (Array.isArray(data?.solicitudes) && data.solicitudes) ||
      (Array.isArray(data?.items) && data.items) ||
      (Array.isArray(data?.Items) && data.Items) ||
      (Array.isArray(data) && data) ||
      [];
    return arr.map((x) => ({
      correo: x.correo || x.email || '',
      estado: (x.estado || 'pendiente').toLowerCase(),
      rol: x.rol || x.rol_solicitado || 'creador',
      fecha: x.fecha || '—',
    }));
  };

  const cargarSolicitudes = async () => {
    setCargando(true);
    setError('');
    try {
      const res = await fetch(
        'https://h6ysn7u0tl.execute-api.us-east-1.amazonaws.com/dev2/obtener-solicitudes-rol',
        {
          method: 'GET',
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setSolicitudes(normalizeSolicitudes(data));
    } catch (e) {
      console.error('obtener-solicitudes-rol error:', e);
      setError('No se pudieron cargar las solicitudes.');
      setSolicitudes([]);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarSolicitudes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // ÚNICA acción: Autorizar -> la Lambda aprueba o rechaza según dominio
  const autorizar = async (correo) => {
    setEnviando(correo);
    setError('');
    try {
      const res = await fetch(
        'https://h6ysn7u0tl.execute-api.us-east-1.amazonaws.com/dev2/aprobar-rol',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ correo }),
        }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'Error al autorizar');
      // Después de autorizar, recargamos desde la fuente de verdad (DynamoDB)
      await cargarSolicitudes();
      alert(data?.message || `Solicitud procesada para ${correo}.`);
    } catch (e) {
      console.error('autorizar error:', e);
      setError('No se pudo procesar la autorización.');
    } finally {
      setEnviando('');
    }
  };

  const puedeGestionar = email === correoAutorizado;

  return (
    <div className="pagina-admin">
      <h1>Panel de Administración</h1>
      <p>Desde aquí puedes revisar solicitudes para otorgar el rol "creador".</p>

      {!puedeGestionar && (
        <p className="solo-autorizado">
          🚫 Solo el administrador autorizado puede gestionar estas solicitudes.
        </p>
      )}

      <div className="acciones-encabezado">
        <button className="btn-recargar" onClick={cargarSolicitudes} disabled={cargando}>
          {cargando ? 'Actualizando…' : '↻ Actualizar'}
        </button>
      </div>

      {cargando ? (
        <div className="spinner">Cargando solicitudes…</div>
      ) : error ? (
        <div className="error-box">{error}</div>
      ) : solicitudes.length === 0 ? (
        <p>No hay solicitudes pendientes.</p>
      ) : (
        <div className="tabla-solicitudes">
          <table>
            <thead>
              <tr>
                <th>Correo</th>
                <th>Estado</th>
                <th>Rol</th>
                <th>Fecha</th>
                {puedeGestionar && <th>Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {solicitudes.map((s) => {
                const estado = (s.estado || 'pendiente').toLowerCase();
                return (
                  <tr key={s.correo}>
                    <td>{s.correo}</td>
                    <td>
                      <span className={`badge-estado ${estado}`}>
                        {estado.replace(/^./, (c) => c.toUpperCase())}
                      </span>
                    </td>
                    <td>{s.rol || 'creador'}</td>
                    <td>{s.fecha || '—'}</td>
                    {puedeGestionar && (
                      <td className="col-acciones">
                        <button
                          className="btn-aprobar"
                          onClick={() => autorizar(s.correo)}
                          disabled={enviando === s.correo || estado !== 'pendiente'}
                          title="Autorizar (la Lambda aprobará o rechazará según dominio)"
                        >
                          {enviando === s.correo ? 'Aplicando…' : '✅ Autorizar'}
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminPage;

