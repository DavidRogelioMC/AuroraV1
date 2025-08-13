// src/components/AdminPage.jsx
import React, { useEffect, useMemo, useState } from 'react';
import './AdminPage.css';

const ADMIN_EMAIL = 'anette.flores@netec.com.mx';
const API_BASE = 'https://h6ysn7u0tl.execute-api.us-east-1.amazonaws.com/dev2';

function AdminPage() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [email, setEmail] = useState('');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(''); // correo en proceso
  const [busca, setBusca] = useState('');
  const [filtro, setFiltro] = useState('all'); // all|pendiente|aprobado|rechazado
  const [rolActivo, setRolActivo] = useState(
    (typeof window !== 'undefined' && localStorage.getItem('ui_active_role')) || 'admin'
  );

  const token = localStorage.getItem('id_token') || '';

  // decodifica el email del token
  useEffect(() => {
    if (!token) return;
    try {
      const payload = JSON.parse(atob((token.split('.')[1] || '').replace(/-/g, '+').replace(/_/g, '/')));
      setEmail((payload?.email || '').toLowerCase());
    } catch {}
  }, [token]);

  const authHeaders = useMemo(() => {
    if (!token) return {};
    const v = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    return { Authorization: v, 'Content-Type': 'application/json' };
  }, [token]);

  const puedeGestionar = email === ADMIN_EMAIL;

  const cargarSolicitudes = async () => {
    setCargando(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/obtener-solicitudes-rol`, {
        method: 'GET',
        headers: authHeaders,
      });
      const data = await res.json().catch(() => ({}));
      setSolicitudes(Array.isArray(data?.solicitudes) ? data.solicitudes : []);
    } catch {
      setError('No se pudieron cargar las solicitudes.');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargarSolicitudes(); /* eslint-disable-next-line */ }, [token]);

  // simulación “Tu rol activo” (solo Anette). Nota: requiere re-login para que toda la app lo use.
  const onChangeRolActivo = (v) => {
    setRolActivo(v);
    try {
      localStorage.setItem('ui_active_role', v);
    } catch {}
    // Mostramos nota: ya la lleva en el placeholder general del diseño
  };

  // fuerza refresh de atributos en clientes (cuando approves/revokes)
  const pokeClientsToRefresh = () => {
    try { localStorage.setItem('force_attr_refresh', '1'); } catch {}
  };

  const accionSolicitud = async (correo, accion) => {
    setEnviando(correo);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/aprobar-rol`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ correo, accion }), // aprobar | rechazar | revocar
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'Error en la acción');

      pokeClientsToRefresh();

      setSolicitudes(prev =>
        prev.map(s => (s.correo === correo ? { ...s, estado: accion === 'aprobar' ? 'aprobado' : 'rechazado' } : s))
      );
      alert(`✅ Acción ${accion} aplicada para ${correo}.`);
    } catch (e) {
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
        headers: authHeaders,
        body: JSON.stringify({ correo }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'Error al eliminar');

      pokeClientsToRefresh();

      setSolicitudes(prev => prev.filter(s => s.correo !== correo));
      alert(`🗑️ Solicitud de ${correo} eliminada.`);
    } catch {
      setError('No se pudo eliminar la solicitud.');
    } finally {
      setEnviando('');
    }
  };

  const solicitudesFiltradas = useMemo(() => {
    return solicitudes
      .filter(s => {
        const e = (s.estado || 'pendiente').toLowerCase();
        if (filtro !== 'all' && e !== filtro) return false;
        if (busca && !String(s.correo || '').toLowerCase().includes(busca.toLowerCase())) return false;
        return true;
      });
  }, [solicitudes, filtro, busca]);

  return (
    <div className="pagina-admin">
      <h1>{puedeGestionar ? 'Panel de Administración' : 'Panel de Ajustes'}</h1>
      <p>{puedeGestionar
        ? 'Desde aquí puedes revisar solicitudes para otorgar el rol "creador".'
        : 'Revisión y estado de tu solicitud del rol "creador".'}
      </p>

      {!puedeGestionar && (
        <p className="solo-autorizado">🚫 Solo la administradora autorizada puede aprobar/rechazar/revocar.</p>
      )}

      <div className="acciones-encabezado">
        {/* Buscador */}
        <input
          type="text"
          placeholder="Buscar por correo…"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="buscar-input"
        />

        {/* Filtro de estado */}
        <select value={filtro} onChange={(e) => setFiltro(e.target.value)} className="select-estado">
          <option value="all">Todos los estados</option>
          <option value="pendiente">Pendiente</option>
          <option value="aprobado">Aprobado</option>
          <option value="rechazado">Rechazado</option>
        </select>

        <button className="btn-recargar" onClick={cargarSolicitudes} disabled={cargando}>
          {cargando ? 'Actualizando…' : '↻ Actualizar'}
        </button>
      </div>

      {/* Selector de rol activo (solo Anette) */}
      {puedeGestionar && (
        <div style={{ margin: '10px 0 6px' }}>
          <label style={{ marginRight: 10 }}>Tu rol activo:&nbsp;</label>
          <select value={rolActivo} onChange={(e)=>onChangeRolActivo(e.target.value)}>
            <option value="admin">Administrador</option>
            <option value="creador">Creador</option>
            <option value="participant">Participante</option>
          </select>
          <span style={{ marginLeft: 10, opacity: 0.8 }}>(tras cambiar, vuelve a iniciar sesión)</span>
        </div>
      )}

      {cargando ? (
        <div className="spinner">Cargando solicitudes…</div>
      ) : error ? (
        <div className="error-box">{error}</div>
      ) : solicitudesFiltradas.length === 0 ? (
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
              {solicitudesFiltradas.map((s) => {
                const estado = (s.estado || 'pendiente').toLowerCase();
                const correo = s.correo;
                const esRoot = correo === ADMIN_EMAIL;

                return (
                  <tr key={correo}>
                    <td>{correo}</td>
                    <td><span className={`badge-estado ${estado}`}>{estado.replace(/^./, c => c.toUpperCase())}</span></td>
                    {puedeGestionar && (
                      <td className="col-acciones">
                        {esRoot ? (
                          <span className="btn-protegido">🔒 Protegido</span>
                        ) : (
                          <>
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

