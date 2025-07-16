// src/components/QuizActivity.jsx

import React, { useState } from 'react';
import './QuizActivity.css'; // Importamos su CSS

// --- El componente QuizQuestion no necesita cambios ---
function QuizQuestion({ pregunta, opciones, seleccion, onSeleccion, mostrarResultado, respuestaCorrecta }) {
  const getOpcionClassName = (opcion) => {
    if (!mostrarResultado) {
      return seleccion === opcion ? 'opcion-seleccionada' : '';
    }
    if (opcion === respuestaCorrecta) {
      return 'opcion-correcta';
    }
    if (seleccion === opcion && opcion !== respuestaCorrecta) {
      return 'opcion-incorrecta';
    }
    return '';
  };

  return (
    <div className="pregunta-quiz">
      <h3>{pregunta}</h3>
      <div className="opciones-quiz">
        {opciones.map((opcion, index) => (
          <div
            key={index}
            className={`opcion-quiz ${getOpcionClassName(opcion)}`}
            onClick={() => !mostrarResultado && onSeleccion(opcion)}
          >
            <span className="letra-opcion">{String.fromCharCode(97 + index)})</span>
            {opcion}
          </div>
        ))}
      </div>
    </div>
  );
}

// --- El componente QuizActivity es el que modificamos ---
function QuizActivity({ data }) {
  const [respuestasUsuario, setRespuestasUsuario] = useState({});
  const [mostrarResultados, setMostrarResultados] = useState(false);
  const [puntuacion, setPuntuacion] = useState(0);

  const handleSeleccion = (preguntaIndex, opcionSeleccionada) => {
    setRespuestasUsuario(prev => ({
      ...prev,
      [preguntaIndex]: opcionSeleccionada
    }));
  };

  const calificarQuiz = () => {
    let correctas = 0;
    data.forEach((preguntaData, index) => {
      if (respuestasUsuario[index] === preguntaData.respuesta) {
        correctas++;
      }
    });
    setPuntuacion(correctas);
    setMostrarResultados(true);
  };

  // --- 1. AÑADIMOS LA FUNCIÓN PARA REINICIAR ---
  const reiniciarQuiz = () => {
    setRespuestasUsuario({});    // Limpia las respuestas seleccionadas
    setMostrarResultados(false); // Oculta los resultados
    setPuntuacion(0);            // Resetea la puntuación
  };

  return (
    <div className="quiz-activity">
      {data.map((preguntaData, index) => (
        <QuizQuestion
          key={index}
          pregunta={preguntaData.pregunta}
          opciones={preguntaData.opciones}
          seleccion={respuestasUsuario[index]}
          onSeleccion={(opcion) => handleSeleccion(index, opcion)}
          mostrarResultado={mostrarResultados}
          respuestaCorrecta={preguntaData.respuesta}
        />
      ))}
      <div className="quiz-footer">
        {!mostrarResultados ? (
          <button onClick={calificarQuiz} disabled={Object.keys(respuestasUsuario).length !== data.length} className="btn-revisar">
            Calificar Quiz
          </button>
        ) : (
          // --- 2. MODIFICAMOS ESTA SECCIÓN PARA INCLUIR EL BOTÓN ---
          <div className="resultado-y-reinicio">
            <div className="resultado-final">
              Tu puntuación: {puntuacion} de {data.length}
            </div>
            <button onClick={reiniciarQuiz} className="btn-reiniciar">
              🔄 Intentar de nuevo
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default QuizActivity;
