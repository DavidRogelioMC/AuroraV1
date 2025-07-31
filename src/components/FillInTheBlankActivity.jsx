// src/components/FillInTheBlankActivity.jsx (CÓDIGO COMPLETO Y CORREGIDO)

import React, { useState } from 'react';
import './FillInTheBlankActivity.css';

// --- Componente interno para una sola frase ---
function FillInTheBlankStatement({ 
  frase, 
  respuesta, 
  justificacion, // Nueva prop
  onRespuesta, 
  index, 
  mostrarResultado, 
  mostrarJustificaciones // Nueva prop
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

  return (
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
              />
            )}
          </React.Fragment>
        ))}
      </label>
      {mostrarResultado && !esCorrecta && <span className="respuesta-correcta-fill">Respuesta: {respuesta}</span>}
      
      {/* --- NUEVA ÁREA PARA MOSTRAR LA JUSTIFICACIÓN --- */}
      {mostrarResultado && mostrarJustificaciones && (
        <div className="justificacion-fill">
          <strong>Justificación:</strong> {justificacion}
        </div>
      )}
    </div>
  );
}


// --- Componente Principal ---
function FillInTheBlankActivity({ data }) { // data es [{id, frase, respuesta, justificacion}, ...]
  const [respuestasUsuario, setRespuestasUsuario] = useState({});
  const [mostrarResultados, setMostrarResultados] = useState(false);
  const [puntuacion, setPuntuacion] = useState(0);

  // --- NUEVO ESTADO PARA LAS JUSTIFICACIONES ---
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
          justificacion={item.justificacion} // Pasamos la justificación
          onRespuesta={(valor) => handleRespuesta(index, valor)}
          mostrarResultado={mostrarResultados}
          mostrarJustificaciones={mostrarJustificaciones} // Pasamos el estado
        />
      ))}

      {/* --- SECCIÓN DEL FOOTER MODIFICADA --- */}
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
            
            {/* Grupo de botones para Justificación y Reinicio */}
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
