// src/components/AdminPage.jsx
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import './AdminPage.css';

const ADMIN_EMAIL = 'anette.flores@netec.com.mx';
const API_BASE = 'https://h6ysn7u0tl.execute-api.us-east-1.amazonaws.com/dev2';

function AdminPage() {
  // 🔒 Evitar render fuera de /admin
  const { pathname } = useLocation();
  if (!pathname.startsWith('/admin')) return null;

  const [solicitudes, setSolicitudes] = useState([]);
  const [email, setEmail] = useState('');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(''); // correo en proceso
  const token = localStorage.getItem('id_token');

  // Decodificar token simple para email
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
        headers: token ? { Authorization: token } : {},
      });
      const data = await res.json();
      setSolicitudes(Array.isArray(data?.solicitudes) ? data.solicitudes : []);
    } catch (e) {
      setError('No se pudieron cargar las solicitudes.');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarSolicitudes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const puedeGestionar = email === ADMIN_EMAIL;

  // helper para forzar refresh de atributos en los clientes
  const pokeClientsToRefresh = () => {
    try {
      localStorage.setItem('force_attr_refresh', '1');
    } catch {}
  };

  const accionSolicitud = async (correo, accion) => {
    setEnviando(correo);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/aprobar-rol`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: token } : {}),
        },
        body: JSON.stringify({ correo, accion }), // 'aprobar' | 'rechazar' | 'revocar'
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'Error en la acción');

      // Forzar que los clientes refresquen su rol
      pokeClientsToRefresh();

      // Saca de la tabla o recarga
      setSolicitudes((prev) =>
        prev.map((s) => (s.correo === correo ? { ...s, estado: accion === 'aprobar' ? 'aprobado' : 'rechazado' } : s))
      );
      alert(`✅ Acción ${accion} aplicada para ${correo}.`);
    } catch (e) {
      console.error(e);
      setError(`No se pudo ${accion} la solicitud.`);
    } finally {
      setEnviando('');
    }
  };

  const eliminarSolicitud = async (correo) => {
    setEnviando(correo);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/eliminar-solicitud`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: token } : {}),
        },
        body: JSON.stringify({ correo }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'Error al eliminar');

      // Forzar refresh en clientes (revierte a admin y quita del grupo en Lambda)
      pokeClientsToRefresh();

      setSolicitudes((prev) => prev.filter((s) => s.correo !== correo));
      alert(`🗑️ Solicitud de ${correo} eliminada.`);
    } catch (e) {
      console.error(e);
      setError('No se pudo eliminar la solicitud.');
    } finally {
      setEnviando('');
    }
  };

  return (
    <div className="pagina-admin">
      <h1>Panel de Administración</h1>
      <p>Desde aquí puedes revisar solicitudes para otorgar el rol "creador".</p>

      {!puedeGestionar && (
        <p className="solo-autorizado">
          🚫 Solo el administrador autorizado puede aprobar/rechazar/revocar.
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
                const correo = s.correo;
                return (
                  <tr key={correo}>
                    <td>{correo}</td>
                    <td>
                      <span className={`badge-estado ${estado}`}>
                        {estado.replace(/^./, (c) => c.toUpperCase())}
                      </span>
                    </td>
                    {puedeGestionar && (
                      <td className="col-acciones">
                        <button
                          className="btn-aprobar"
                          onClick={() => accionSolicitud(correo, 'aprobar')}
                          disabled={enviando === correo}
                          title="Aprobar"
                        >
                          {enviando === correo ? 'Aplicando…' : '✅ Aprobar'}
                        </button>
                        <button
                          className="btn-rechazar"
                          onClick={() => accionSolicitud(correo, 'rechazar')}
                          disabled={enviando === correo}
                          title="Rechazar"
                        >
                          {enviando === correo ? 'Aplicando…' : '❌ Rechazar'}
                        </button>
                        <button
                          className="btn-rechazar"
                          onClick={() => accionSolicitud(correo, 'revocar')}
                          disabled={enviando === correo}
                          title="Revocar rol"
                          style={{ marginLeft: 8 }}
                        >
                          {enviando === correo ? 'Aplicando…' : '🗑️ Revocar'}
                        </button>
                        <button
                          className="btn-rechazar"
                          onClick={() => eliminarSolicitud(correo)}
                          disabled={enviando === correo}
                          title="Eliminar solicitud (DynamoDB)"
                          style={{ marginLeft: 8 }}
                        >
                          {enviando === correo ? 'Eliminando…' : '🗑️ Eliminar'}
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
