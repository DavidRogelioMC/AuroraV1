import React, { useState } from 'react';
import './ExamenesPage.css';

const ExamenesPage = () => {
  const [curso, setCurso] = useState('Python');
  const [modulo, setModulo] = useState('');
  const [error, setError] = useState('');
  const [examen, setExamen] = useState(null);
  const [cargando, setCargando] = useState(false);

  const generarExamen = async () => {
    setCargando(true);
    setError('');
    setExamen(null);

    try {
      const response = await fetch('https://h6ysn7u0tl.execute-api.us-east-1.amazonaws.com/dev2/generar-examen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ curso, topico: modulo })
      });

      if (!response.ok) throw new Error('Error en la respuesta del servidor');
      const data = await response.json();

      if (!data || !data.preguntas || data.preguntas.length === 0) {
        setExamen({ preguntas: [] });
      } else {
        setExamen(data);
      }
    } catch (err) {
      setError('Error al generar el examen: ' + err.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="pagina-examenes">
      <h1>🧪 Generador de Exámenes</h1>
      <p>Selecciona el curso y un tema para generar preguntas de práctica.</p>

      <div className="formulario-examenes">
        <select value={curso} onChange={(e) => setCurso(e.target.value)}>
          <option value="Python">Python</option>
          <option value="AWS">AWS</option>
          <option value="Azure">Azure</option>
        </select>
        <input
          type="text"
          placeholder="Ej. módulo de tu examen"
          value={modulo}
          onChange={(e) => setModulo(e.target.value)}
        />
        <button onClick={generarExamen} disabled={cargando}>
          {cargando ? 'Generando...' : 'Generar examen'}
        </button>
      </div>

      {error && <div className="error-examenes">{error}</div>}

      {examen && (
        <div className="resultado-examen">
          <h2>📄 Examen Generado</h2>
          {examen.preguntas.length === 0 ? (
            <p>No se recibió contenido</p>
          ) : (
            examen.preguntas.map((pregunta, index) => (
              <div className="pregunta" key={index}>
                <strong>{index + 1}. {pregunta.pregunta}</strong>
                <ul>
                  {pregunta.opciones.map((opcion, i) => (
                    <li key={i}>{opcion}</li>
                  ))}
                </ul>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default ExamenesPage;

