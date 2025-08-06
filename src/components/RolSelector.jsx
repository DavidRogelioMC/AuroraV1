// src/components/RolSelector.jsx

import React from 'react';
import './RolSelector.css';

function RolSelector() {
  const iniciarSesion = (rol) => {
    const clientId = '51g99km7557n98v3c763nk529o';
    const domain = 'us-east-1b7qvyydgp.auth.us-east-1.amazoncognito.com';
    const redirectUri = 'http://localhost:5173'; // ⚠️ cambia esto a tu URL real si estás en producción
    const responseType = 'code'; // usa 'token' si estás en flujo implícito

    const url = `https://${domain}/signup?client_id=${clientId}&response_type=${responseType}&redirect_uri=${redirectUri}&state=${rol}`;
    window.location.href = url;
  };

  return (
    <div className="rol-selector-container">
      <h2>¿Cómo deseas ingresar?</h2>
      <button className="rol-selector-btn admin" onClick={() => iniciarSesion('Administrador')}>
        Administrador
      </button>
      <button className="rol-selector-btn participant" onClick={() => iniciarSesion('Participante')}>
        Participante
      </button>
    </div>
  );
}

export default RolSelector;
