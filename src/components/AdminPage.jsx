// src/components/AdminPage.jsx
import React, { useEffect, useState } from 'react';
import './AdminPage.css';
import { Auth } from 'aws-amplify';

// base64url-safe
const decodeJWT = (token) => {
  if (!token) return null;
  try {
    const part = token.split('.')[1] || '';
    const normalized = part.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(normalized).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
    );
    return JSON.parse(json);
  } catch { return null; }
};

const refreshTokens = async () => {
  try {
    await Auth.currentAuthenticatedUser({ bypassCache: true });
    const session = await Auth.currentSession();
    const id = session?.getIdToken()?.getJwtToken();
    if (id) localStorage.setItem('id_token', id);
    return id || null;
  } catch { return null; }
};

function AdminPage() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [email, setEmail] = useState('');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState('');

  const token = localStorage.getItem('id_token');
  const correoAutorizado = 'anette.flores@netec.com.mx';

  useEffect(() => {
    if (!token) return;
    const payload = decodeJWT(token);
    setEmail(payload?.email || '');
  }, [token]);

  const cargarSolicitudes = async () => {
    setCargando(true);
    setError('');
    try {
      const res = await fetch(
        'https://h6ysn7u0tl.execute-api.us-east-1.amazonaws.com/dev2/obtener-solicitudes-rol',
        { method: 'GET', headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
      const data = await res.json();
      setSolicitudes(Array.isArray(data?.solicitudes) ? data.solicitudes : []);
    } catch {
      setError('No se pudieron cargar las solicitudes.');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargarSolicitudes(); /* eslint-disable-next-line */ }, [token]);

  const aprobarSolicitud = async (correo) => {
    setEnviando(correo); setError('');
    try {
      const res = await fetch(
        'https://h6ysn7u0tl.execute-api.us-east-1.amazonaws.com/dev2/aprobar-rol',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          body: JSON.stringify({ correo })
        }
      );
      const raw = await res.text(); const data = raw ? JSON.parse(raw) : {};
      if (!res.ok) throw new Error(data?.error || data?.detail || 'Error al aprobar');
      await cargarSolicitudes();
      await refreshTokens();
      alert(`✅ Usuario ${correo} aprobado como creador.`);
    } catch (e) {
      setError('No se pudo aprobar la solicitud.');
    } finally { setEnviando(''); }
  };

  // usamos el mismo endpoint con 'accion: rechazar'
  const rechazarSolicitud = async (correo) => {
    setEnviando(correo); setError('');
    try {
      const res = await fetch(
        'https://h6ysn7u0tl.execute-api.us-east-1.amazonaws.com/dev2/aprobar-rol',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          body: JSON.stringify({ correo, accion: 'rechazar' })
        }
      );
      const raw = await res.text(); const data = raw ? JSON.parse(raw) : {};
      if (!res.ok) throw new Error(data?.error || data?.detail || 'Error al rechazar');
      await cargarSolicitudes();
      await refreshTokens();
      alert(`❌ Usuario ${correo} rechazado.`);
    } catch (e) {
      setError('No se pudo rechazar la solicitud.');
    } finally { setEnviando(''); }
  };

  const puedeGestionar = email === correoAutorizado;

  return (
    <div className="pagina-admin">
      <h1>Panel de Administración</h1>
      <p>Desde aquí puedes revisar solicitudes para otorgar el rol "creador".</p>

      {!puedeGestionar && (
        <p className="solo-autorizado">🚫 Solo el administrador autorizado puede gestionar estas solicitudes.</p>
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
                <th>Correo</th><th>Estado</th>{puedeGestionar && <th>Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {solicitudes.map((s) => {
                const estado = (s.estado || 'pendiente').toLowerCase();
                return (
                  <tr key={s.correo}>
                    <td>{s.correo}</td>
                    <td><span className={`badge-estado ${estado}`}>{estado.replace(/^./, c => c.toUpperCase())}</span></td>
                    {puedeGestionar && (
                      <td className="col-acciones">
                        <button className="btn-aprobar" onClick={() => aprobarSolicitud(s.correo)} disabled={enviando === s.correo} title="Aprobar solicitud">
                          {enviando === s.correo ? 'Aplicando…' : '✅ Aprobar'}
                        </button>
                        <button className="btn-rechazar" onClick={() => rechazarSolicitud(s.correo)} disabled={enviando === s.correo} title="Rechazar solicitud">
                          {enviando === s.correo ? 'Aplicando…' : '❌ Rechazar'}
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

