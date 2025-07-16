// src/components/FillInTheBlankActivity.jsx
import React, { useState } from 'react';
import './InteractiveActivity.css'; // Usaremos un CSS compartido

function FillInTheBlankStatement({ frase, respuesta, onRespuesta, index, mostrarResultado }) {
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
    </div>
  );
}


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
      if (respuestasUsuario[index] && respuestasUsuario[index].trim().toLowerCase() === item.respuesta.trim().toLowerCase()) {
        correctas++;
      }
    });
    setPuntuacion(correctas);
    setMostrarResultados(true);
  };

   // --- NUEVA FUNCIÓN PARA REINICIAR ---
  const reiniciarActividad = () => {
    setRespuestasUsuario({});    // Limpia las respuestas del usuario
    setMostrarResultados(false); // Oculta los resultados y correcciones
    setPuntuacion(0);            // Resetea la puntuación
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
        />
      ))}
      <div className="activity-footer">
        {!mostrarResultados ? (
          <button onClick={calificarActividad} className="btn-revisar">Calificar</button>
        ) : (
          <div className="resultado-final">Tu puntuación: {puntuacion} de {data.length}</div>
        )}
      </div>
    </div>
  );
}

export default FillInTheBlankActivity;
