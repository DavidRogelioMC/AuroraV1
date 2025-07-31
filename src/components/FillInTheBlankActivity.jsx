// src/components/FillInTheBlankActivity.jsx (VERSIÓN MEJORADA)

import React, { useState } from 'react';
import './FillInTheBlankActivity.css';

// --- Componente interno para una sola frase ---
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

  // --- LÓGICA MEJORADA PARA EL INPUT ---
  // Calculamos el tamaño del input basado en la longitud de la respuesta, con un mínimo.
  const inputSize = Math.max(respuesta.length, 10); // Mínimo de 10 caracteres de ancho

  return (
    <div className="fill-statement-wrapper">
      <div className="fill-statement">
        <label htmlFor={`fill-${index}`}>
          {frase.split('______').map((part, i) => (
            <React.Fragment key={i}>
              {part}
              {i < frase.split('______').length - 1 && (
                <input
                  id={`fill-${index}`}
                  type="text"
                  className={`fill-input ${getClassName()}`}
                  value={valorUsuario}
                  onChange={handleChange}
                  disabled={mostrarResultado}
                  size={inputSize} // <-- ¡AQUÍ ESTÁ LA MAGIA!
                  style={{ width: `${inputSize}ch` }} // ch = unidad de ancho de carácter
                />
              )}
            </React.Fragment>
          ))}
        </label>
        {mostrarResultado && !esCorrecta && <span className="respuesta-correcta-fill">Respuesta: {respuesta}</span>}
      </div>
      
      {/* --- La justificación ahora está fuera del div de la frase --- */}
      {mostrarResultado && mostrarJustificaciones && (
        <div className="justificacion-fill">
          <strong>Justificación:</strong> {justificacion}
        </div>
      )}
    </div>
  );
}


// --- Componente Principal (sin cambios en la lógica, solo para completitud) ---
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
          <button onClick={calificarActividad} className="btn-revisar">Calificar</button>
        ) : (
          <div className="resultado-y-reinicio">
            <div className="resultado-final">Puntuación: {puntuacion} de {data.length}</div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setMostrarJustificaciones(prev => !prev)} className="btn-justificacion">
                {mostrarJustificaciones ? 'Ocultar Justificaciones' : 'Ver Justificaciones'}
              </button>
              <button onClick={reiniciarActividad} className="btn-reiniciar">Reiniciar</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default FillInTheBlankActivity;
