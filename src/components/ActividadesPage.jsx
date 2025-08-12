// src/components/AdminPage.jsx
import React, { useEffect, useState } from 'react';
import './AdminPage.css';

function AdminPage() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [email, setEmail] = useState('');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState('');
  const [debugInfo, setDebugInfo] = useState(null); // 👈 para diagnosticar

  const token = localStorage.getItem('id_token');
  const correoAutorizado = 'anette.flores@netec.com.mx';

  // decodifica JWT (base64url-safe)
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

  // 🔧 convierte AttributeValue de DynamoDB v3 a JS plano
  const fromAttrVal = (v) => {
    if (!v || typeof v !== 'object') return v;
    if ('S' in v) return v.S;
    if ('N' in v) return v.N;
    if ('BOOL' in v) return v.BOOL;
    if ('SS' in v) return v.SS;
    if ('M' in v) {
      const out = {};
      for (const k of Object.keys(v.M)) out[k] = fromAttrVal(v.M[k]);
      return out;
    }
    return v;
  };

  // 🧹 normaliza distintas formas de respuesta
  const normalizeSolicitudes = (raw) => {
    // 1) intenta arreglos típicos
    let arr =
      (Array.isArray(raw?.solicitudes) && raw.solicitudes) ||
      (Array.isArray(raw?.items) && raw.items) ||
      (Array.isArray(raw?.Items) && raw.Items) ||
      (Array.isArray(raw) && raw) ||
      [];

    // 2) si parece ser v3 crudo (Items con AttributeValue), convierte
    if (arr.length && arr[0] && typeof arr[0] === 'object' && ('S' in (arr[0].correo || {}))) {
      arr = arr.map((it) => ({
        correo: fromAttrVal(it.correo),
        estado: String(fromAttrVal(it.estado) ?? 'pendiente').toLowerCase(),
        rol: fromAttrVal(it.rol_solicitado) || fromAttrVal(it.rol) || 'creador',
        fecha: fromAttrVal(it.fecha) || '—',
      }));
      return arr;
    }

    // 3) arreglo “limpio”
    return arr.map((x) => ({
      correo: x.correo || x.email || '',
      estado: String(x.estado ?? 'pendiente').toLowerCase(),
      rol: x.rol || x.rol_solicitado || 'creador',
      fecha: x.fecha || '—',
    }));
  };

  const cargarSolicitudes = async () => {
    setCargando(true);
    setError('');
    setDebugInfo(null);
    try {
      const url = 'https://h6ysn7u0tl.execute-api.us-east-1.amazonaws.com/dev2/obtener-solicitudes-rol';
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const text = await res.text(); // 👈 leemos crudo primero
      let data;
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        data = { rawText: text };
      }

      console.debug('GET /obtener-solicitudes-rol -> status', res.status, 'data:', data);

      if (!res.ok) {
        throw new Error(`HTTP ${res.status} ${res.statusText} ${text?.slice(0, 300) || ''}`);
      }

      const normalizadas = normalizeSolicitudes(data);
      setSolicitudes(normalizadas);

      // Si vino vacío, mostramos bloque de depuración
      if (!normalizadas.length) {
        setDebugInfo({
          status: res.status,
          hasAuthHeader: !!token,
          headers: Object.fromEntries([...res.headers.entries()]),
          preview: typeof text === 'string' ? text.slice(0, 500) : String(text),
        });
      }
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

  // Acción única: Autorizar (Lambda decide aprobar/rechazar por dominio)
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
      const text = await res.text();
      let data;
      try { data = JSON.parse(text); } catch { data = { rawText: text }; }
      if (!res.ok) throw new Error(data?.error || text || 'Error al autorizar');
      await cargarSolicitudes(); // reconsulta DynamoDB
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
        <>
          <p>No hay solicitudes pendientes.</p>
          {debugInfo && (
            <div className="error-box" style={{ marginTop: '10px' }}>
              <div><b>DEBUG</b> (muéstrame este bloque si sigue vacío):</div>
              <div>status: {debugInfo.status}</div>
              <div>authHeader: {String(debugInfo.hasAuthHeader)}</div>
              <div>headers: <code>{JSON.stringify(debugInfo.headers)}</code></div>
              <div>preview: <code>{debugInfo.preview}</code></div>
            </div>
          )}
        </>
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

