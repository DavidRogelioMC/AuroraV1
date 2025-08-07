// src/components/SolicitarRolCreadorAdmin.jsx
import React, { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';

function SolicitarRolCreadorAdmin() {
  const [correo, setCorreo] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [esAdmin, setEsAdmin] = useState(false);
  const [token, setToken] = useState('');

  useEffect(() => {
    const storedToken = localStorage.getItem('id_token');
    if (storedToken) {
      setToken(storedToken);
      const decoded = jwtDecode(storedToken);
      const rol = decoded['custom:rol'];
      setEsAdmin(rol === 'admin');
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje('');
    setError('');

    const dominio = correo.split('@')[1];
    const dominiosPermitidos = [
      "netec.com", "netec.com.mx", "netec.com.co",
      "netec.com.pe", "netec.com.cl", "netec.com.es"
    ];

    if (!dominiosPermitidos.includes(dominio)) {
      setError("❌ El dominio no está autorizado.");
      return;
    }

    try {
      const response = await fetch('https://h6ysn7u0tl.execute-api.us-east-1.amazonaws.com/dev2/solicitar-rol', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token
        },
        body: JSON.stringify({ correo })
      });

      const data = await response.json();
      if (response.ok) {
        setMensaje("✅ Solicitud enviada correctamente.");
        setCorreo('');
      } else {
        setError(`❌ Error: ${data.error || 'No se pudo enviar la solicitud.'}`);
      }
    } catch (err) {
      setError("❌ Error de red al enviar la solicitud.");
    }
  };

  if (!esAdmin) return null;

  return (
    <form onSubmit={handleSubmit} className="formulario-resumenes">
      <input
        type="email"
        placeholder="Correo del usuario que recibirá el rol"
        value={correo}
        onChange={(e) => setCorreo(e.target.value)}
        required
      />
      <button type="submit">📩 Solicitar Rol de Creador</button>

      {mensaje && <div style={{ color: "green", fontWeight: "bold" }}>{mensaje}</div>}
      {error && <div className="error-resumenes">{error}</div>}
    </form>
  );
}

export default SolicitarRolCreadorAdmin;
