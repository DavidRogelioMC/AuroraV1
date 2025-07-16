// src/components/FillInTheBlankActivity.jsx

import React, { useState } from 'react';
import './FillInTheBlankActivity.css'; // Asegúrate de que este archivo CSS exista y tenga los estilos

// Componente para una sola frase
function FillInTheBlankStatement({ frase, respuesta, onRespuesta, index, mostrarResultado, valorInicial }) {
  // El valor del input ahora se controla desde el componente padre
  const esCorrecta = valorInicial.trim().toLowerCase() === respuesta.trim().toLowerCase();

  const getClassName = () => {
    if (!mostrarResultado) return '';
    return esCorrecta ? 'input-correcto' : 'input-incorrecto';
  };
  
  const handleChange = (e) => {
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
                value={valorInicial}
                onChange={handleChange}
                disabled={mostrarResultado}
              />
            )}
          </React.Fragment>
        ))}
      </label>
      {mostrarResultado && !esCorrecta && <span className="respuesta-correcta-fill">Respuesta: {respuesta}</span>}
    </div>
  );
}

// Componente principal de la actividad
function FillInTheBlankActivity({ data }) {
  const [respuestasUsuario, setRespuestasUsuario] = useState({});
  const [mostrarResultados, setMostrarResultados] = useState(false);
  const [puntuacion, setPuntuacion] = useState(0);

  const handleRespuesta = (index, valor) => {
    setRespuestasUsuario(prev => ({ ...prev, [index]: valor }));
  };

  const calificarActividad = () => {
    let correctas = 0;
    data.forEach((item, index) => {
      const respuestaUsuario = respuestasUsuario[index] || '';
      if (respuestaUsuario.trim().toLowerCase() === item.respuesta.trim().toLowerCase()) {
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
  };

  return (
    <div className="interactive-activity">
      {data.map((item, index) => (
        <FillInTheBlankStatement
          key={index}
          index={index}
          frase={item.frase}
          respuesta={item.respuesta}
          onRespuesta={(valor) => handleRespuesta(index, valor)}
          mostrarResultado={mostrarResultados}
          // Pasamos el valor actual o un string vacío para que el input se resetee
          valorInicial={respuestasUsuario[index] || ''} 
        />
      ))}
      <div className="activity-footer">
        {!mostrarResultados ? (
          <button onClick={calificarActividad} className="btn-revisar">Calificar</button>
        ) : (
          <div className="resultado-y-reinicio">
            <div className="resultado-final">Tu puntuación: {puntuacion} de {data.length}</div>
            {/* --- ESTA ES LA SECCIÓN CORREGIDA --- */}
            <button onClick={reiniciarActividad} className="btn-reiniciar">
              🔄 Intentar de nuevo
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default FillInTheBlankActivity;
