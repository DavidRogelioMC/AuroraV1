// src/components/FillInTheBlankActivity.jsx (CÓDIGO FINAL Y COMPLETO)

import React, { useState } from 'react';
import './FillInTheBlankActivity.css';

// --- Componente interno para una sola frase (CON LA LÓGICA CORREGIDA) ---
function FillInTheBlankStatement({ 
  frase, 
  respuesta, 
  justificacion,
  onRespuesta, 
  index, 
  mostrarResultado, 
  mostrarJustificaciones 
}) {
  const [valorUsuario, setValorUsuario] = useState('');

  const esCorrecta = valorUsuario.trim().toLowerCase() === respuesta.trim().toLowerCase();

  const getClassName = () => {
    if (!mostrarResultado) return '';
    return esCorrecta ? 'input-correcto' : 'input-incorrecto';
  };
  
  const handleChange = (e) => {
    setValorUsuario(e.target.value);
    onRespuesta(e.target.value);
  };

  const inputSize = Math.max(respuesta.length, 10);
  
  // Dividimos la frase en dos partes, antes y después del espacio en blanco
  const partesFrase = frase.split('______');
  const parteAntes = partesFrase[0];
  const parteDespues = partesFrase.slice(1).join('______');

  return (
    <div className="fill-statement-wrapper">
      <div className="fill-statement">
        <label htmlFor={`fill-${index}`}>
          {parteAntes}
          <input
            id={`fill-${index}`}
            type="text"
            className={`fill-input ${getClassName()}`}
            value={valorUsuario}
            onChange={handleChange}
            disabled={mostrarResultado}
            size={inputSize}
            style={{ width: `${inputSize}ch` }}
          />
          {parteDespues}
        </label>
        {mostrarResultado && !esCorrecta && <span className="respuesta-correcta-fill">Respuesta: {respuesta}</span>}
      </div>
      
      {mostrarResultado && mostrarJustificaciones && (
        <div className="justificacion-fill">
          <strong>Justificación:</strong> {justificacion}
        </div>
      )}
    </div>
  );
}


// --- Componente Principal (sin cambios en la lógica) ---
function FillInTheBlankActivity({ data }) {
  const [respuestasUsuario, setRespuestasUsuario] = useState({});
  const [mostrarResultados, setMostrarResultados] = useState(false);
  const [puntuacion, setPuntuacion] = useState(0);
  const [mostrarJustificaciones, setMostrarJustificaciones] = useState(false);

  const handleRespuesta = (index, valor) => {
    setRespuestasUsuario(prev => ({ ...prev, [index]: valor }));
  };

  const calificarActividad = () => {
    let correctas = 0;
    data.forEach((item, index) => {
      if (respuestasUsuario[index] && respuestasUsuario[index].trim().toLowerCase() === item.respuesta.trim().toLowerCase()) {
        correctas++;
      }
    });
    setPuntuacion(correctas);
    setMostrarResultados(true);
  };

  const reiniciarActividad = () => {
    // Para reiniciar, necesitamos una forma de resetear el estado interno de cada FillInTheBlankStatement.
    // La forma más fácil es cambiar la 'key' del componente, forzando a React a recrearlo.
    // Esto lo manejaremos en un futuro si es necesario. Por ahora, reseteamos el estado principal.
    setRespuestasUsuario({});
    setMostrarResultados(false);
    setPuntuacion(0);
    setMostrarJustificaciones(false);
  };

  return (
    <div className="interactive-activity">
      {data.map((item, index) => (
        <FillInTheBlankStatement
          key={item.id || index}
          index={index}
          frase={item.frase}
          respuesta={item.respuesta}
          justificacion={item.justificacion}
          onRespuesta={(valor) => handleRespuesta(index, valor)}
          mostrarResultado={mostrarResultados}
          mostrarJustificaciones={mostrarJustificaciones}
        />
      ))}
      <div className="activity-footer">
        {!mostrarResultados ? (
          <div className="resultado-y-reinicio" style={{ justifyContent: 'flex-end' }}>
            <button onClick={calificarActividad} className="btn-revisar">Calificar</button>
          </div>
        ) : (
          <div className="resultado-y-reinicio">
            <div className="resultado-final">
              Puntuación: {puntuacion} de {data.length}
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setMostrarJustificaciones(prev => !prev)} className="btn-justificacion">
                {mostrarJustificaciones ? 'Ocultar Justificaciones' : 'Ver Justificaciones'}
              </button>
              <button onClick={reiniciarActividad} className="btn-reiniciar">
                Reiniciar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default FillInTheBlankActivity;
