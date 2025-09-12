// src/components/PreguntaExamen.jsx
import React from 'react';
import './PreguntaExamen.css'; // Crearemos este CSS

const PreguntaExamen = ({ pregunta, index, respuestaUsuario, onRespuesta, mostrarResultados }) => {
  
  const handleSeleccion = (opcionKey) => {
    if (mostrarResultados) return; // No permitir cambiar si ya se calificó
    
    // Para respuesta múltiple, manejamos un array
    if (pregunta.tipo === 'respuesta_múltiple') {
      const respuestasActuales = respuestaUsuario || [];
      if (respuestasActuales.includes(opcionKey)) {
        onRespuesta(respuestasActuales.filter(r => r !== opcionKey));
      } else {
        onRespuesta([...respuestasActuales, opcionKey]);
      }
    } else { // Para opción múltiple, solo una selección
      onRespuesta(opcionKey);
    }
  };

  const getOpcionClassName = (opcionKey) => {
    if (!mostrarResultados) {
      // Lógica de selección antes de calificar
      if (pregunta.tipo === 'respuesta_múltiple') {
        return (respuestaUsuario || []).includes(opcionKey) ? 'opcion-seleccionada' : 'opcion-item';
      }
      return respuestaUsuario === opcionKey ? 'opcion-seleccionada' : 'opcion-item';
    } else {
      // Lógica de colores después de calificar
      const esCorrecta = pregunta.respuestasCorrectas.includes(opcionKey);
      if (pregunta.tipo === 'respuesta_múltiple') {
        const fueSeleccionada = (respuestaUsuario || []).includes(opcionKey);
        if (esCorrecta) return 'opcion-correcta';
        if (fueSeleccionada) return 'opcion-incorrecta';
      } else {
        if (esCorrecta) return 'opcion-correcta';
        if (respuestaUsuario === opcionKey) return 'opcion-incorrecta';
      }
      return 'opcion-item';
    }
  };

  return (
    <div className="pregunta-container">
      <p className="enunciado">
        <strong>{index + 1}. ({pregunta.tipo.replace('_', ' ')})</strong> {pregunta.enunciado}
      </p>
      <div className="opciones-container">
        {Object.entries(pregunta.opciones).map(([letra, texto]) => (
          <div
            key={letra}
            className={getOpcionClassName(letra)}
            onClick={() => handleSeleccion(letra)}
          >
            <strong>{letra}:</strong> {texto}
          </div>
        ))}
      </div>
      {mostrarResultados && (
        <>
          <div className="respuesta-correcta">
            <strong>Respuesta(s) Correcta(s):</strong> {pregunta.respuestasCorrectas.join(", ")}
          </div>
          <div className="justificacion">
            <strong>Justificación:</strong> {pregunta.justificacion}
          </div>
        </>
      )}
    </div>
  );
};

export default PreguntaExamen;
