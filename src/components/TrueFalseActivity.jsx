// src/components/TrueFalseActivity.jsx (CÓDIGO COMPLETO Y CORREGIDO)

import { useState } from 'react';
import './TrueFalseActivity.css'; // Asegúrate de que este archivo CSS exista

function TrueFalseActivity({ data }) {
  const [preguntaActualIndex, setPreguntaActualIndex] = useState(0);
  const [seleccionUsuario, setSeleccionUsuario] = useState(null); // true o false
  const [haRespondido, setHaRespondido] = useState(false);
  const [puntuacion, setPuntuacion] = useState(0);

  const [mostrarJustificacion, setMostrarJustificacion] = useState(false);
  const [mostrarResultadosFinales, setMostrarResultadosFinales] = useState(false);

  const preguntaActual = data[preguntaActualIndex];

  const handleSeleccion = (valor) => {
    if (haRespondido) return;
    setSeleccionUsuario(valor);
  };

  const revisarRespuesta = () => {
    if (seleccionUsuario === null) return;
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
  };

  const getButtonClass = (valorBoton) => {
    if (!haRespondido) {
      return seleccionUsuario === valorBoton ? 'btn-vf btn-seleccionado' : 'btn-vf';
    }
    // Si ya respondió
    if (valorBoton === preguntaActual.respuesta) return 'btn-vf btn-correcto';
    if (valorBoton === seleccionUsuario) return 'btn-vf btn-incorrecto';
    return 'btn-vf btn-deshabilitado';
  };

  if (mostrarResultadosFinales) {
    return (
      <div className="true-false-activity final-results">
        <h2>Actividad Completada</h2>
        <p className="puntuacion-final">Tu puntuación final es: {puntuacion} de {data.length}</p>
        <button onClick={reiniciarActividad} className="btn-reinicio-final">
          Volver a Intentar
        </button>
      </div>
    );
  }

  return (
    <div className="true-false-activity">
      <div className="afirmacion-vf">
        <p className="texto-afirmacion">
          {`Pregunta ${preguntaActualIndex + 1}: ${preguntaActual.afirmacion}`}
        </p>

        <div className="botones-vf">
          <button
            className={getButtonClass(true)}
            onClick={() => handleSeleccion(true)}
            disabled={haRespondido}
          >
            Verdadero
          </button>
          <button
            className={getButtonClass(false)}
            onClick={() => handleSeleccion(false)}
            disabled={haRespondido}
          >
            Falso
          </button>
        </div>
      </div>
      
      {/* --- SECCIÓN DEL FOOTER MODIFICADA --- */}
      <div className="vf-footer">
        {!haRespondido ? (
          <div className="resultado-y-reinicio">
            <span></span> {/* Elemento vacío para empujar el botón a la derecha */}
            <button onClick={revisarRespuesta} disabled={seleccionUsuario === null} className="btn-revisar">
              Calificar
            </button>
          </div>
        ) : (
          <div className="footer-botones-resultado">
            <button onClick={siguientePregunta} className="btn-siguiente">
              {preguntaActualIndex < data.length - 1 ? 'Siguiente' : 'Finalizar'}
            </button>
            <div className="grupo-botones-secundarios">
              <button onClick={() => setMostrarJustificacion(true)} className="btn-justificacion">
                Ver Justificación
              </button>
              <button onClick={reiniciarActividad} className="btn-reiniciar">
                Reiniciar
              </button>
            </div>
          </div>
        )}
      </div>

      {mostrarJustificacion && haRespondido && (
        <div className="justificacion-container">
          <h4>Justificación</h4>
          <p>{preguntaActual.justificacion}</p>
          <button onClick={() => setMostrarJustificacion(false)} className="btn-ocultar-justificacion">
            Ocultar
          </button>
        </div>
      )}
    </div>
  );
}

export default TrueFalseActivity;
