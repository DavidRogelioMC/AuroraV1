// src/components/AdminPage.jsx
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import './AdminPage.css';

// Decodificador base64url seguro
const decodeJWT = (t) => {
  try {
    const part = (t || '').split('.')[1] || '';
    const normalized = part.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(normalized).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
    );
    return JSON.parse(json);
  } catch {
    return {};
  }
};

function AdminPage() {
  // 🔒 CANDADO: solo renderiza en /admin
  const { pathname } = useLocation();
  if (!pathname.startsWith('/admin')) return null;

  const [solicitudes, setSolicitudes] = useState([]);
  const [email, setEmail] = useState('');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(''); // correo en proceso

  const token = localStorage.getItem('id_token') || '';
  const API_BASE = 'https://h6ysn7u0tl.execute-api.us-east-1.amazonaws.com/dev2';

  // 👉 Solo ESTA persona puede aprobar/rechazar:
  const correoAutorizado = 'anette.flores@netec.com.mx';

  // Decodificar token y tomar el email
  useEffect(() => {
    if (!token) return;
    const payload = decodeJWT(token);
    setEmail((payload?.email || '').toLowerCase());
  }, [token]);

  const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

  const cargarSolicitudes = async () => {
    setCargando(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/obtener-solicitudes-rol`, {
        method: 'GET',
        headers: authHeader,
      });
      const data = await res.json().catch(() => ({}));
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

  const aprobarSolicitud = async (correo) => {
    setEnviando(correo);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/aprobar-rol`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader,
        },
        body: JSON.stringify({ correo }),
      });
      const raw = await res.text();
      const data = raw ? JSON.parse(raw) : {};
      if (!res.ok) throw new Error(data?.error || 'Error al aprobar');

      // Mantener fila y actualizar estado
      setSolicitudes((prev) =>
        prev.map((s) => (s.correo === correo ? { ...s, estado: 'aprobado' } : s))
      );
      alert(`✅ Usuario ${correo} aprobado como creador.`);
    } catch (e) {
      setError('No se pudo aprobar la solicitud.');
    } finally {
      setEnviando('');
    }
  };

  const rechazarSolicitud = async (correo) => {
    setEnviando(correo);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/rechazar-rol`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader,
        },
        body: JSON.stringify({ correo }),
      });
      const raw = await res.text();
      const data = raw ? JSON.parse(raw) : {};
      if (!res.ok) throw new Error(data?.error || 'Error al rechazar');

      // Mantener fila y actualizar estado
      setSolicitudes((prev) =>
        prev.map((s) => (s.correo === correo ? { ...s, estado: 'rechazado' } : s))
      );
      alert(`❌ Usuario ${correo} rechazado.`);
    } catch (e) {
      setError('No se pudo rechazar la solicitud.');
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
                    {puedeGestionar && (
                      <td className="col-acciones">
                        <button
                          className="btn-aprobar"
                          onClick={() => aprobarSolicitud(s.correo)}
                          disabled={enviando === s.correo}
                          title="Aprobar solicitud"
                        >
                          {enviando === s.correo ? 'Aplicando…' : '✅ Aprobar'}
                        </button>
                        <button
                          className="btn-rechazar"
                          onClick={() => rechazarSolicitud(s.correo)}
                          disabled={enviando === s.correo}
                          title="Rechazar solicitud"
                        >
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


