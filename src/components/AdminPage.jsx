// src/components/AdminPage.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import './AdminPage.css';

const ADMIN_EMAIL = 'anette.flores@netec.com.mx';
const API_BASE = 'https://h6ysn7u0tl.execute-api.us-east-1.amazonaws.com/dev2';

function AdminPage() {
  const token = localStorage.getItem('id_token') || '';
  const { pathname } = useLocation();

  const [email, setEmail] = useState('');
  const [solicitudes, setSolicitudes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState('');

  // Decodificar email del token (simple)
  useEffect(() => {
    if (!token) return;
    try {
      const payload = JSON.parse(atob((token.split('.')[1] || '').replace(/-/g, '+').replace(/_/g, '/')));
      setEmail(payload?.email || '');
    } catch {}
  }, [token]);

  const esRoot = email === ADMIN_EMAIL;
  const esVistaAjustes = pathname.startsWith('/ajustes');

  const headers = useMemo(() => (token ? { Authorization: token } : {}), [token]);

  const cargarSolicitudes = async () => {
    setCargando(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/obtener-solicitudes-rol`, {
        method: 'GET',
        headers
      });
      const data = await res.json();
      let lista = Array.isArray(data?.solicitudes) ? data.solicitudes : [];
      // Si NO es root o estamos en /ajustes, solo ver mi registro
      if (!esRoot || esVistaAjustes) {
        lista = lista.filter(s => (s.correo || '').toLowerCase() === email.toLowerCase());
      }
      setSolicitudes(lista);
    } catch (e) {
      setError('No se pudieron cargar las solicitudes.');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (!email) return;
    cargarSolicitudes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email, esRoot, esVistaAjustes]);

  const pokeClientsToRefresh = () => {
    try {
      localStorage.setItem('force_attr_refresh', '1');
    } catch {}
  };

  const accionSolicitud = async (correo, accion) => {
    if (!esRoot) return;                 // solo root gestiona
    if ((correo || '').toLowerCase() === ADMIN_EMAIL) {
      alert('⛔ No puedes modificar a la cuenta raíz.');
      return;
    }

    setEnviando(correo);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/aprobar-rol`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify({ correo, accion }) // 'aprobar' | 'rechazar' | 'revocar'
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'Error en la acción');

      pokeClientsToRefresh();
      await cargarSolicitudes();
      alert(`✅ Acción ${accion} aplicada para ${correo}.`);
    } catch (e) {
      setError(`No se pudo ${accion} la solicitud.`);
    } finally {
      setEnviando('');
    }
  };

  const eliminarSolicitud = async (correo) => {
    if (!esRoot) return;
    if ((correo || '').toLowerCase() === ADMIN_EMAIL) {
      alert('⛔ No puedes eliminar la solicitud de la cuenta raíz.');
      return;
    }
    if (!confirm(`¿Eliminar la solicitud de ${correo}?`)) return;

    setEnviando(correo);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/eliminar-solicitud`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify({ correo })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'Error al eliminar');

      pokeClientsToRefresh();
      await cargarSolicitudes();
      alert(`🧹 Solicitud de ${correo} eliminada.`);
    } catch (e) {
      setError('No se pudo eliminar la solicitud.');
    } finally {
      setEnviando('');
    }
  };

  return (
    <div className="pagina-admin">
      <h1>{esRoot && !esVistaAjustes ? 'Panel de Administración' : 'Panel de Ajustes'}</h1>
      <p>
        {esRoot && !esVistaAjustes
          ? 'Desde aquí puedes revisar solicitudes para otorgar el rol "creador".'
          : 'Revisión y estado de tu solicitud del rol "creador".'}
      </p>

      {!esRoot && (
        <p className="solo-autorizado">
          🚫 Solo la administradora autorizada puede aprobar/rechazar/revocar.
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
                {esRoot && !esVistaAjustes && <th>Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {solicitudes.map((s) => {
                const estado = (s.estado || 'pendiente').toLowerCase();
                const correo = s.correo || '';

                return (
                  <tr key={correo}>
                    <td>{correo}</td>
                    <td>
                      <span className={`badge-estado ${estado}`}>
                        {estado.replace(/^./, (c) => c.toUpperCase())}
                      </span>
                    </td>

                    {esRoot && !esVistaAjustes && (
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
                          {enviando === correo ? 'Eliminando…' : '🧹 Eliminar'}
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
