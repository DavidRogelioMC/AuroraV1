// src/components/QuizActivity.jsx (CÓDIGO COMPLETO)

import { useState } from 'react';
import './InteractiveActivity.css'; // Asegúrate de que este archivo CSS exista

function QuizActivity({ data }) {
  const [preguntaActualIndex, setPreguntaActualIndex] = useState(0);
  const [seleccionUsuario, setSeleccionUsuario] = useState(null);
  const [haRespondido, setHaRespondido] = useState(false);
  const [puntuacion, setPuntuacion] = useState(0);
  
  // --- Estados nuevos ---
  const [mostrarJustificacion, setMostrarJustificacion] = useState(false);
  const [mostrarResultadosFinales, setMostrarResultadosFinales] = useState(false);

  const preguntaActual = data[preguntaActualIndex];

  const handleSeleccion = (opcion) => {
    if (haRespondido) return;
    setSeleccionUsuario(opcion);
  };

  const revisarRespuesta = () => {
    if (!seleccionUsuario) return;
    setHaRespondido(true);
    if (seleccionUsuario === preguntaActual.respuesta) {
      setPuntuacion(p => p + 1);
    }
  };

  const siguientePregunta = () => {
    if (preguntaActualIndex < data.length - 1) {
      setPreguntaActualIndex(i => i + 1);
      setHaRespondido(false);
      setSeleccionUsuario(null);
      setMostrarJustificacion(false);
    } else {
      setMostrarResultadosFinales(true);
    }
  };
  
  const reiniciarActividad = () => {
    setPreguntaActualIndex(0);
    setSeleccionUsuario(null);
    setHaRespondido(false);
    setPuntuacion(0);
    setMostrarJustificacion(false);
    setMostrarResultadosFinales(false);
  }

  const getButtonClass = (opcion) => {
    if (!haRespondido) {
      return seleccionUsuario === opcion ? 'opcion-seleccionada' : 'opcion';
    }
    if (opcion === preguntaActual.respuesta) return 'opcion-correcta';
    if (opcion === seleccionUsuario) return 'opcion-incorrecta';
    return 'opcion';
  };

  if (mostrarResultadosFinales) {
    return (
      <div className="interactive-activity final-results">
        <h2>Actividad Completada</h2>
        <p className="puntuacion-final">Tu puntuación final es: {puntuacion} de {data.length}</p>
        <button onClick={reiniciarActividad} className="btn-reinicio">
          Volver a Intentar
        </button>
      </div>
    )
  }

  return (
    <div className="interactive-activity">
      <div className="activity-header">
        <h3>Pregunta {preguntaActualIndex + 1} de {data.length}</h3>
        <div className="puntuacion-actual">Puntuación: {puntuacion}</div>
      </div>
      <p className="pregunta-texto">{preguntaActual.pregunta}</p>

      <div className="opciones-container">
        {preguntaActual.opciones.map((opcion, index) => (
          <button
            key={index}
            className={getButtonClass(opcion)}
            onClick={() => handleSeleccion(opcion)}
            disabled={haRespondido}
          >
            {opcion}
          </button>
        ))}
      </div>

      <div className="activity-footer">
        {!haRespondido ? (
          <button onClick={revisarRespuesta} disabled={!seleccionUsuario} className="btn-revisar">Revisar</button>
        ) : (
          <div className="footer-botones-resultado">
            <button onClick={siguientePregunta} className="btn-siguiente">
              {preguntaActualIndex < data.length - 1 ? 'Siguiente Pregunta' : 'Finalizar'}
            </button>
            <button onClick={() => setMostrarJustificacion(true)} className="btn-justificacion">
              Ver Justificación
            </button>
            <button onClick={reiniciarActividad} className="btn-reinicio">
              Reiniciar
            </button>
          </div>
        )}
      </div>

      {mostrarJustificacion && haRespondido && (
        <div className="justificacion-container">
          <h4>Justificación</h4>
          <p>{preguntaActual.justificacion}</p>
          <button onClick={() => setMostrarJustificacion(false)} className="btn-ocultar-justificacion">Ocultar</button>
        </div>
      )}
    </div>
  );
}

export default QuizActivity;
