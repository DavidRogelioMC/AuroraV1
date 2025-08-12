import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import './AdminPage.css';

const ADMIN_EMAIL = 'anette.flores@netec.com.mx';
const API_BASE = 'https://h6ysn7u0tl.execute-api.us-east-1.amazonaws.com/dev2';

function AdminPage() {
  const { pathname } = useLocation();
  if (!pathname.startsWith('/ajustes')) return null;

  const [solicitudes, setSolicitudes] = useState([]);
  const [email, setEmail] = useState('');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState('');

  const token = localStorage.getItem('id_token');

  useEffect(() => {
    if (!token) return;
    try {
      const payload = JSON.parse(atob((token.split('.')[1] || '').replace(/-/g, '+').replace(/_/g, '/')));
      setEmail(payload?.email || '');
    } catch (e) {
      console.error('Error al decodificar token', e);
    }
  }, [token]);

  const cargarSolicitudes = async () => {
    setCargando(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/obtener-solicitudes-rol`, {
        method: 'GET',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      setSolicitudes(Array.isArray(data?.solicitudes) ? data.solicitudes : []);
    } catch (e) {
      console.error(e);
      setError('No se pudieron cargar las solicitudes.');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarSolicitudes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const callAccion = async (correo, accion) => {
    setEnviando(correo);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/aprobar-rol`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ correo, accion }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || `Error al ${accion}`);
      await cargarSolicitudes();
      alert(data?.message || `Acción ${accion} aplicada a ${correo}.`);
    } catch (e) {
      console.error(e);
      setError(`No se pudo ${accion} la solicitud.`);
    } finally {
      setEnviando('');
    }
  };

  const aprobar = (c) => callAccion(c, 'aprobar');
  const rechazar = (c) => callAccion(c, 'rechazar'); // para solicitudes PENDIENTES
  const revocar  = (c) => callAccion(c, 'revocar');  // para usuarios APROBADOS

  const puedeGestionar = email === ADMIN_EMAIL;

  return (
    <div className="pagina-admin">
      <h1>Panel de Ajustes</h1>
      <p>Revisión y gestión del rol <b>creador</b>.</p>

      {!puedeGestionar && (
        <p className="solo-autorizado">🚫 Solo el administrador autorizado puede aprobar/rechazar/revocar.</p>
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
        <p>No hay solicitudes.</p>
      ) : (
        <div className="tabla-solicitudes">
          <table>
            <thead>
              <tr>
                <th>Correo</th>
                <th>Estado</th>
                {puedeGestionar && <th>Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {solicitudes.map((s) => {
                const estado = (s.estado || 'pendiente').toLowerCase();
                const isPendiente = estado === 'pendiente';
                const isAprobado  = estado === 'aprobado';
                return (
                  <tr key={s.correo}>
                    <td>{s.correo}</td>
                    <td>
                      <span className={`badge-estado ${estado}`}>
                        {estado.replace(/^./, (c) => c.toUpperCase())}
                      </span>
                    </td>
                    {puedeGestionar && (
                      <td className="col-acciones">
                        {/* Aprobar solo si NO está aprobado todavía */}
                        {!isAprobado && (
                          <button
                            className="btn-aprobar"
                            onClick={() => aprobar(s.correo)}
                            disabled={enviando === s.correo}
                            title="Aprobar solicitud"
                          >
                            {enviando === s.correo ? 'Aplicando…' : '✅ Aprobar'}
                          </button>
                        )}

                        {/* Rechazar solo si está PENDIENTE */}
                        {isPendiente && (
                          <button
                            className="btn-rechazar"
                            onClick={() => rechazar(s.correo)}
                            disabled={enviando === s.correo}
                            title="Rechazar solicitud"
                          >
                            {enviando === s.correo ? 'Aplicando…' : '❌ Rechazar'}
                          </button>
                        )}

                        {/* Revocar solo si está APROBADO */}
                        {isAprobado && (
                          <button
                            className="btn-rechazar"
                            onClick={() => revocar(s.correo)}
                            disabled={enviando === s.correo}
                            title="Revocar rol de creador"
                          >
                            {enviando === s.correo ? 'Aplicando…' : '🗑️ Revocar'}
                          </button>
                        )}
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


