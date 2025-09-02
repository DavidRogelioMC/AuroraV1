// src/components/GeneradorTemarios.jsx

import React, { useState } from 'react';
import EditorDeTemario from './EditorDeTemario'; // El componente que ya tienes
// ... y su CSS

function GeneradorTemarios() {
  const [temarioGenerado, setTemarioGenerado] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [params, setParams] = useState({
    tema_curso: 'Python',
    extension_curso_dias: 1,
    nivel_dificultad: 'basico',
    objetivos: '',
    enfoque: ''
  });

  const handleParamChange = (e) => {
    const { name, value } = e.target;
    setParams(prev => ({ ...prev, [name]: value }));
  };

  const handleGenerar = async () => {
    setIsLoading(true);
    // Llama a tu Lambda de "Generar Temario" con los 'params'
    // ...
    // const data = await response.json();
    // setTemarioGenerado(data);
    setIsLoading(false);
  };

  // ... (tus funciones onRegenerate y onSave)

  return (
    <div className="generador-temarios-container">
      <h2>Generador de Cursos Estándar</h2>
      <div className="formulario-inicial">
        {/* Formulario para los parámetros iniciales */}
        <input name="tema_curso" value={params.tema_curso} onChange={handleParamChange} placeholder="Tema del curso" />
        {/* ... más campos para días, nivel, etc. ... */}
        <button onClick={handleGenerar} disabled={isLoading}>
          {isLoading ? 'Generando...' : 'Generar Propuesta'}
        </button>
      </div>

      {temarioGenerado && (
        <EditorDeTemario
          temarioInicial={temarioGenerado}
          // onRegenerate={...}
          // onSave={...}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}
export default GeneradorTemarios;
