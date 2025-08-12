// src/components/AdminPage.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import './AdminPage.css';

const ADMIN_EMAIL = 'anette.flores@netec.com.mx';
const API_BASE = 'https://h6ysn7u0tl.execute-api.us-east-1.amazonaws.com/dev2';

function AdminPage() {
  // Render SOLO en /ajustes
  const { pathname } = useLocation();
  if (!pathname.startsWith('/ajustes')) return null;

  const [solicitudes, setSolicitudes] = useState([]);
  const [email, setEmail] = useState('');
  const [rolToken, setRolToken] = useState(''); // admin | creador
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(''); // correo en proceso

  // UI búsqueda / filtro (solo se muestran a Anette)
  const [q, setQ] = useState('');
  const [fEstado, setFEstado] = useState('todos'); // todos|pendiente|aprobado|rechazado

  const token = localStorage.getItem('id_token');
  const auth = token?.startsWith('Bearer ') ? token : `Bearer ${token}`;

  // Decodificar token
  useEffect(() => {
    if (!token) return;
    try {
      const payload = JSON.parse(atob((token.split('.')[1] || '').replace(/-/g, '+').replace(/_/g, '/')));
      setEmail(String(payload?.email || '').toLowerCase());
      setRolToken(String(payload?.['custom:rol'] || '').toLowerCase());
    } catch (e) {
      console.error('Error al decodificar token', e);
    }
  }, [token]);

  const esRoot = email === ADMIN_EMAIL;

  // Traer solicitudes (el backend ya limita: si NO es root, devuelve solo la suya)
  const cargarSolicitudes = async () => {
    setCargando(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/obtener-solicitudes-rol`, {
        method: 'GET',
        headers: { Authorization: auth }
      });
      const data = await res.json();
      const lista = Array.isArray(data?.solicitudes) ? data.solicitudes : [];
      setSolicitudes(lista);
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

  // Acciones de rol
  const callAccion = async (correo, accion) => {
    setEnviando(correo);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/aprobar-rol`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: auth },
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
  const rechazar = (c) => callAccion(c, 'rechazar');
  const revocar  = (c) => callAccion(c, 'revocar');

  // Eliminar solicitud (solo root)
  const eliminar = async (correo) => {
    if (!window.confirm(`¿Eliminar la solicitud de ${correo}?`)) return;
    setEnviando(correo);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/eliminar-solicitud`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: auth },
        body: JSON.stringify({ correo }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'Error al eliminar');
      await cargarSolicitudes();
    } catch (e) {
      console.error(e);
      setError('No se pudo eliminar la solicitud.');
    } finally {
      setEnviando('');
    }
  };

  // Cambiar rol activo de Anette
  const cambiarRolActivo = async (rolNuevo) => {
    try {
      const res = await fetch(`${API_BASE}/set-rol-activo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: auth },
        body: JSON.stringify({ rol: rolNuevo })
      });
      const j = await res.json().catch(()=>({}));
      if (!res.ok) throw new Error(j.error || 'Error');
      setRolToken(rolNuevo);
      alert(`Rol activo cambiado a ${rolNuevo}. Cierra sesión y vuelve a entrar para refrescar el token.`);
    } catch (e) {
      alert('No se pudo cambiar el rol activo.');
    }
  };

  // Búsqueda y filtros (solo root)
  const listaFiltrada = useMemo(() => {
    let arr = solicitudes.slice();
    if (esRoot) {
      if (q.trim()) {
        const cmp = q.trim().toLowerCase();
        arr = arr.filter(s => (s.correo || '').toLowerCase().includes(cmp));
      }
      if (fEstado !== 'todos') {
        arr = arr.filter(s => (s.estado || '').toLowerCase() === fEstado);
      }
    } else {
      arr = arr.filter(s => (s.correo || '').toLowerCase() === email);
    }
    return arr;
  }, [solicitudes, q, fEstado, esRoot, email]);

  const puedeGestionar = esRoot;

  return (
    <div className="pagina-admin">
      <h1>Panel de Ajustes</h1>
      <p>Revisión y gestión del rol <b>creador</b>.</p>

      {/* Selector de rol activo (Anette) */}
      {esRoot && (
        <div className="cinta-rol">
          <b>Tu rol activo:</b>
          <select
            value={rolToken === 'creador' ? 'creador' : 'admin'}
            onChange={(e) => cambiarRolActivo(e.target.value)}
            className="select-rol"
          >
            <option value="creador">Creador</option>
            <option value="admin">Administrador</option>
          </select>
          <small>(tras cambiar, vuelve a iniciar sesión)</small>
        </div>
      )}

      {!puedeGestionar && (
        <p className="solo-autorizado">🚫 Solo el administrador autorizado puede aprobar/rechazar/revocar.</p>
      )}

      {/* Barra de búsqueda y filtro (solo root) */}
      {esRoot && (
        <div className="barra-busqueda">
          <input
            type="text"
            placeholder="Buscar por correo…"
            value={q}
            onChange={e => setQ(e.target.value)}
            className="input-buscar"
          />
          <select
            value={fEstado}
            onChange={e => setFEstado(e.target.value)}
            className="select-estado"
          >
            <option value="todos">Todos los estados</option>
            <option value="pendiente">Pendiente</option>
            <option value="aprobado">Aprobado</option>
            <option value="rechazado">Rechazado</option>
          </select>
          <button className="btn-recargar" onClick={cargarSolicitudes} disabled={cargando}>
            {cargando ? 'Actualizando…' : '↻ Actualizar'}
          </button>
        </div>
      )}

      {!esRoot && (
        <div className="acciones-encabezado">
          <button className="btn-recargar" onClick={cargarSolicitudes} disabled={cargando}>
            {cargando ? 'Actualizando…' : '↻ Actualizar'}
          </button>
        </div>
      )}

      {cargando ? (
        <div className="spinner">Cargando solicitudes…</div>
      ) : error ? (
        <div className="error-box">{error}</div>
      ) : listaFiltrada.length === 0 ? (
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
              {listaFiltrada.map((s) => {
                const estado = (s.estado || 'pendiente').toLowerCase();
                const isPendiente = estado === 'pendiente';
                const isAprobado  = estado === 'aprobado';
                const isRootRow   = (s.correo || '').toLowerCase() === ADMIN_EMAIL;

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
                        {isRootRow ? (
                          <button className="btn-root" disabled title="Usuario protegido">
                            🛡️ Protegido
                          </button>
                        ) : (
                          <>
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

                            {/* 🗑️ Eliminar de la base (solo root) */}
                            <button
                              className="btn-eliminar"
                              onClick={() => eliminar(s.correo)}
                              disabled={enviando === s.correo}
                              title="Eliminar registro de la base de datos"
                            >
                              {enviando === s.correo ? 'Eliminando…' : '🗑️ Eliminar'}
                            </button>
                          </>
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
