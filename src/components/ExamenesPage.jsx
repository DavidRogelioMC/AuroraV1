// src/components/ExamenesPage.jsx (VERSIÓN INTERACTIVA)
import React, { useState } from "react";
import "./ExamenesPage.css";
import PreguntaExamen from "./PreguntaExamen"; // <-- IMPORTAMOS EL NUEVO COMPONENTE

const ExamenesPage = () => {
  const [curso, setCurso] = useState("Python");
  const [topico, setTopico] = useState("");
  const [examen, setExamen] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // --- NUEVOS ESTADOS PARA LA INTERACTIVIDAD ---
  const [respuestasUsuario, setRespuestasUsuario] = useState({}); // { 0: 'A', 1: ['B', 'C'], ... }
  const [mostrarResultados, setMostrarResultados] = useState(false);
  const [puntuacion, setPuntuacion] = useState(0);

  const cursos = {
    Python: "AVDJ3M69B7", AWS: "WKNJIRXQUT", "AZ-104": "KWG4PHNXSD"
  };

  const generarExamen = async () => {
    setError(""); setExamen(null); setIsLoading(true); setRespuestasUsuario({}); setMostrarResultados(false); setPuntuacion(0);
    // ... tu lógica de fetch se queda igual ...
    // Asegúrate de que el try/catch actualice el estado 'examen' con el JSON parseado.
  };

  const handleRespuesta = (preguntaIndex, respuesta) => {
    setRespuestasUsuario(prev => ({
      ...prev,
      [preguntaIndex]: respuesta
    }));
  };

  const calificarExamen = () => {
    let correctas = 0;
    examen.preguntas.forEach((pregunta, index) => {
      const respUsuario = respuestasUsuario[index];
      const respCorrectas = pregunta.respuestasCorrectas;
      if (JSON.stringify(respUsuario) === JSON.stringify(respCorrectas.sort())) {
        correctas++;
      } else if (pregunta.tipo === 'respuesta_múltiple' && respUsuario) {
        if (JSON.stringify(respUsuario.sort()) === JSON.stringify(respCorrectas.sort())) {
          correctas++;
        }
      }
    });
    setPuntuacion(correctas);
    setMostrarResultados(true);
  };
  
  const reiniciarExamen = () => {
    setRespuestasUsuario({});
    setMostrarResultados(false);
    setPuntuacion(0);
  }

  return (
    <div className="examenes-container">
      {/* ... tu formulario de generación (sin cambios) ... */}

      {isLoading && <div className="spinner"></div>}
      
      {examen && (
        <div className="examen-resultado">
          <h3>Examen sobre: {examen.tema}</h3>
          {examen.preguntas.map((pregunta, index) => (
            <PreguntaExamen
              key={index}
              index={index}
              pregunta={pregunta}
              respuestaUsuario={respuestasUsuario[index]}
              onRespuesta={(respuesta) => handleRespuesta(index, respuesta)}
              mostrarResultados={mostrarResultados}
            />
          ))}
          <div className="examen-footer">
            {!mostrarResultados ? (
              <button onClick={calificarExamen} className="btn-calificar">Calificar Examen</button>
            ) : (
              <div className="resultado-final-container">
                <p>Puntuación Final: {puntuacion} de {examen.preguntas.length}</p>
                <button onClick={reiniciarExamen} className="btn-reiniciar">Volver a Intentar</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
export default ExamenesPage;
