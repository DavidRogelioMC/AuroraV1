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

  // 👉 Solo esta persona puede aprobar/rechazar:
  const correoAutorizado = 'anette.flores@netec.com.mx';

  // Decodificar token de forma segura
  useEffect(() => {
    if (!token) return;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setEmail(payload.email || '');
    } catch (e) {
      console.error('Error al decodificar token', e);
    }
  }, [token]);

  // Cargar solicitudes
  useEffect(() => {
    const cargar = async () => {
      setCargando(true);
      setError('');
      try {
        const res = await fetch(
          'https://h6ysn7u0tl.execute-api.us-east-1.amazonaws.com/dev2/obtener-solicitudes-rol',
          { headers: { Authorization: token } }
        );
        const data = await res.json();
        // esperados: { solicitudes: [{ correo, estado? }] }
        setSolicitudes(Array.isArray(data?.solicitudes) ? data.solicitudes : []);
      } catch (e) {
        setError('No se pudieron cargar las solicitudes.');
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, [token]);

  const actualizarFila = (correo, nuevoEstado) => {
    setSolicitudes((prev) =>
      prev.map((s) => (s.correo === correo ? { ...s, estado: nuevoEstado } : s))
    );
  };

  const aprobarSolicitud = async (correo) => {
    setEnviando(correo);
    setError('');
    try {
      const res = await fetch(
        'https://h6ysn7u0tl.execute-api.us-east-1.amazonaws.com/dev2/aprobar-rol',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: token },
          body: JSON.stringify({ correo }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Error al aprobar');
      // quítala de la lista si tu flujo es solo pendientes:
      setSolicitudes((prev) => prev.filter((s) => s.correo !== correo));
      // o marca estado:
      // actualizarFila(correo, 'aceptado');
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
      const res = await fetch(
        'https://h6ysn7u0tl.execute-api.us-east-1.amazonaws.com/dev2/rechazar-rol',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: token },
          body: JSON.stringify({ correo }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Error al rechazar');
      setSolicitudes((prev) => prev.filter((s) => s.correo !== correo));
      // o marca estado:
      // actualizarFila(correo, 'rechazado');
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
              {solicitudes.map((s) => (
                <tr key={s.correo}>
                  <td>{s.correo}</td>
                  <td>
                    <span
                      className={`badge-estado ${
                        (s.estado || 'pendiente').toLowerCase()
                      }`}
                    >
                      {(s.estado || 'pendiente')
                        .replace(/^./, (c) => c.toUpperCase())}
                    </span>
                  </td>
                  {puedeGestionar && (
                    <td className="col-acciones">
                      <button
                        className="btn-aprobar"
                        onClick={() => aprobarSolicitud(s.correo)}
                        disabled={enviando === s.correo}
                      >
                        {enviando === s.correo ? 'Aplicando…' : '✅ Aprobar'}
                      </button>
                      <button
                        className="btn-rechazar"
                        onClick={() => rechazarSolicitud(s.correo)}
                        disabled={enviando === s.correo}
                      >
                        {enviando === s.correo ? 'Aplicando…' : '❌ Rechazar'}
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminPage;


