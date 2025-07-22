import React from 'react';

const RolSelector = ({ onSelect }) => {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h2>Selecciona tu rol para continuar:</h2>
      <button style={{ margin: '1rem', padding: '0.5rem 1rem' }} onClick={() => onSelect('admin')}>
        Administrador
      </button>
      <button style={{ margin: '1rem', padding: '0.5rem 1rem' }} onClick={() => onSelect('participant')}>
        Participante
      </button>
    </div>
  );
};

export default RolSelector;
