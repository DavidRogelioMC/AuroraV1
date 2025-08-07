// src/components/AdminPage.jsx
import React, { useEffect, useState } from 'react';
import './AdminPage.css';

function AdminPage() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [email, setEmail] = useState('');
  const token = localStorage.getItem('id_token');

  const correoAdmin = 'anetteliz1842000@icloud.com';

  useEffect(() => {
    const tokenData = JSON.parse(atob(token.split('.')[1]));
    setEmail(tokenData.email);
  }, [token]);

  useEffect(() => {
    fetch('https://h6ysn7u0tl.execute-api.us-east-1.amazonaws.com/dev2/obtener-solicitudes-rol', {
      method: 'GET',
      headers: {
        Authorization: token,
      }
    })
      .then(res => res.json())
      .then(data => {
        setSolicitudes(data.solicitudes || []);
      });
  }, [token]);

  const aprobarSolicitud = (correo) => {
    fetch('https://h6ysn7u0tl.execute-api.us-east-1.amazonaws.com/dev2/aprobar-rol', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
      body: JSON.stringify({ correo }),
    })
      .then(res => res.json())
      .then(() => {
        alert(`✅ Usuario ${correo} aprobado como creador.`);
        setSolicitudes(solicitudes.filter(s => s.correo !== correo));
      });
  };

  const rechazarSolicitud = (correo) => {
    fetch('https://h6ysn7u0tl.execute-api.us-east-1.amazonaws.com/dev2/rechazar-rol', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
      body: JSON.stringify({ correo }),
    })
      .then(res => res.json())
      .then(() => {
        alert(`❌ Usuario ${correo} rechazado.`);
        setSolicitudes(solicitudes.filter(s => s.correo !== correo));
      });
  };

  return (
    <div className="pagina-admin">
      <h1>Panel de Administración</h1>
      <p>Desde aquí puedes revisar solicitudes para otorgar el rol "creador".</p>

      {email === correoAdmin ? (
        <div className="tabla-solicitudes">
          {solicitudes.length === 0 ? (
            <p>No hay solicitudes pendientes.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Correo</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {solicitudes.map((s) => (
                  <tr key={s.correo}>
                    <td>{s.correo}</td>
                    <td>
                      <button onClick={() => aprobarSolicitud(s.correo)}>✅ Aprobar</button>
                      <button onClick={() => rechazarSolicitud(s.correo)}>❌ Rechazar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ) : (
        <p style={{ color: 'red' }}>🚫 Solo el administrador autorizado puede gestionar estas solicitudes.</p>
      )}
    </div>
  );
}

export default AdminPage;


