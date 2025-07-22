// src/components/RolSelector.jsx
import React from 'react';

const RolSelector = ({ onSelect }) => {
  return (
    <div className="rol-selector-container">
      <h2>Selecciona tu rol para continuar:</h2>
      <button className="rol-selector-btn admin" onClick={() => onSelect('admin')}>
        Administrador
      </button>
      <button className="rol-selector-btn participant" onClick={() => onSelect('participant')}>
        Participante
      </button>
    </div>
  );
};

export default RolSelector;
