// src/components/RolSelector.jsx
import React from 'react';
import './RolSelector.css';

function RolSelector() {
  const iniciarSesion = (rol) => {
    const clientId = '51g99km7557n98v3c763nk529o'; // ⚠️ Reemplaza si cambia
    const domain = 'us-east-1b7qvyydgp.auth.us-east-1.amazoncognito.com'; // ⚠️ Reemplaza si cambia
    const redirectUri = 'https://thor.netec.com.mx'; // ✅ Usa la URL de producción
    const responseType = 'code'; // Authorization Code Flow
    const state = rol;

    const url = `https://${domain}/signup?client_id=${clientId}&response_type=${responseType}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&state=${state}`;
    window.location.href = url;
  };

  return (
    <div className="rol-selector-container">
      <h2>¿Cómo deseas ingresar?</h2>
      <button className="rol-selector-btn admin" onClick={() => iniciarSesion('admin')}>
        Administrador
      </button>
      <button className="rol-selector-btn participant" onClick={() => iniciarSesion('participant')}>
        Participante
      </button>
    </div>
  );
}

export default RolSelector;


