// src/components/EditorDeTemario.jsx
import React, { useState, useEffect } from 'react';
import './EditorDeTemario.css';

function EditorDeTemario({ temarioInicial, onRegenerate, onSave, isLoading }) {
  const [temario, setTemario] = useState(temarioInicial);
  const [vista, setVista] = useState('detallada');

  useEffect(() => {
    setTemario(temarioInicial);
  }, [temarioInicial]);

  const handleInputChange = (e) => {
    // ... (lógica para manejar cambios en los inputs)
  };

  if (!temario) return null;

  return (
    <div className="editor-container">
      <div className="vista-selector">
        <button className={`btn-vista ${vista === 'detallada' ? 'activo' : ''}`} onClick={() => setVista('detallada')}>
          Vista Detallada (Editable)
        </button>
        <button className={`btn-vista ${vista === 'resumida' ? 'activo' : ''}`} onClick={() => setVista('resumida')}>
          Vista Resumida
        </button>
      </div>

      {isLoading ? (
        <div className="spinner-container">
          <div className="spinner"></div>
          <p>Generando nueva versión...</p>
        </div>
      ) : vista === 'detallada' ? (
        <div>
          <h3>Vista Detallada (En construcción)</h3>
          <pre>{JSON.stringify(temario, null, 2)}</pre>
        </div>
      ) : (
        <div className="vista-resumida">
          <h3>Vista Resumida (En construcción)</h3>
          <h1>{temario.nombre_curso}</h1>
          <p>{temario.descripcion_general}</p>
        </div>
      )}
    </div>
  );
}
export default EditorDeTemario;
