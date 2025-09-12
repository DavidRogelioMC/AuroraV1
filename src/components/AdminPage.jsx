// src/components/AdminPage.jsx
import React, { useEffect, useMemo, useState } from 'react';
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

  // Filtros y “vista” de rol
  const [filtroTexto, setFiltroTexto] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('all'); // all | pendiente | aprobado | rechazado
  const [vistaRol, setVistaRol] = useState(
    () => localStorage.getItem('ui_role_preview') || 'Administrador'
  );

  const token = localStorage.getItem('id_token');

  // auth header
  const authHeader = useMemo(() => {
    if (!token) return {};
    // En tu backend aceptas el raw token, así que lo dejamos igual
    return { Authorization: token };
  }, [token]);

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
        headers: { ...authHeader },
      });
      const data = await res.json().catch(() => ({}));
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
          ...authHeader,
        },
        body: JSON.stringify({ correo, accion }), // 'aprobar' | 'rechazar' | 'revocar'
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'Error en la acción');

      // Refrescar clientes
      pokeClientsToRefresh();

      setSolicitudes((prev) =>
        prev.map((s) =>
          s.correo === correo ? { ...s, estado: accion === 'aprobar' ? 'aprobado' : 'rechazado' } : s
        )
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
          ...authHeader,
        },
        body: JSON.stringify({ correo }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'Error al eliminar');

      // Forzar refresh en clientes (revierte a rol base por dominio y quita del grupo)
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

  // Filtrado en memoria
  const solicitudesFiltradas = useMemo(() => {
    const txt = filtroTexto.trim().toLowerCase();
    return solicitudes.filter((s) => {
      const estado = (s.estado || 'pendiente').toLowerCase();
      const correo = (s.correo || '').toLowerCase();
      const pasaTexto = !txt || correo.includes(txt);
      const pasaEstado = filtroEstado === 'all' || estado === filtroEstado;
      return pasaTexto && pasaEstado;
    });
  }, [solicitudes, filtroTexto, filtroEstado]);

  // Guardar "vista" de rol (solo UI / demo)
  useEffect(() => {
    localStorage.setItem('ui_role_preview', vistaRol);
  }, [vistaRol]);

  return (
    <div className="pagina-admin">
      <h1>Panel de Administración</h1>
      <p>Desde aquí puedes revisar solicitudes para otorgar el rol "creador".</p>

      {!puedeGestionar && (
        <p className="solo-autorizado">
          🚫 Solo la administradora autorizada puede aprobar/rechazar/revocar/eliminar.
        </p>
      )}

      {/* Filtros */}
      <div className="filtros">
        <input
          type="text"
          className="buscar-correo"
          placeholder="Buscar por correo…"
          value={filtroTexto}
          onChange={(e) => setFiltroTexto(e.target.value)}
        />

        <select
          className="select-estado"
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
          title="Filtrar por estado"
        >
          <option value="all">Todos los estados</option>
          <option value="pendiente">Pendiente</option>
          <option value="aprobado">Aprobado</option>
          <option value="rechazado">Rechazado</option>
        </select>

        <button className="btn-recargar" onClick={cargarSolicitudes} disabled={cargando}>
          {cargando ? 'Actualizando…' : '↻ Actualizar'}
        </button>
      </div>

      {/* Vista de rol (solo para probar UI) */}
      <div className="rol-preview">
        <label>Tu rol activo:&nbsp;</label>
        <select
          className="select-rol"
          value={vistaRol}
          onChange={(e) => setVistaRol(e.target.value)}
        >
          <option>Administrador</option>
          <option>Creador</option>
          <option>Participante</option>
        </select>
        <span className="hint">(tras cambiar, vuelve a iniciar sesión)</span>
      </div>

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
                const protegido = correo === ADMIN_EMAIL;

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
                        {protegido ? (
                          <span className="chip-protegido">🔒 Protegido</span>
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

