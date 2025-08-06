// src/components/ExamenesPage.jsx

import React, { useState } from "react";
import "./ExamenesPage.css"; // Crearemos un CSS para esta página

// Importamos el componente que muestra las preguntas
import PreguntaExamen from "./PreguntaExamen"; 

const ExamenesPage = () => {
  const [curso, setCurso] = useState("Python");
  const [topico, setTopico] = useState("");
  const [examen, setExamen] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [respuestasUsuario, setRespuestasUsuario] = useState({});
  const [mostrarResultados, setMostrarResultados] = useState(false);
  const [puntuacion, setPuntuacion] = useState(0);

  // Define aquí tus Knowledge Bases disponibles para los exámenes
  const cursos = {
    Python: "AVDJ3M69B7",
    AWS: "WKNJIRXQUT",
    "AZ-104": "KWG4PHNXSD"
  };
  
  // URL de tu API Gateway para generar el examen
  const apiUrl = import.meta.env.VITE_API_GENERAR_EXAMEN; // <-- ¡Usa la variable de entorno correcta!

  const generarExamen = async () => {
    setError(""); setExamen(null); setIsLoading(true); setRespuestasUsuario({}); setMostrarResultados(false); setPuntuacion(0);
    const knowledgeBaseId = cursos[curso];
    const token = localStorage.getItem("id_token");

    if (!token || !topico.trim()) {
      setError(!token ? "No autenticado." : "Por favor, escribe un tópico.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: token },
        body: JSON.stringify({ knowledgeBaseId, topico })
      });

      const responseText = await response.text();
      if (!response.ok) throw new Error(responseText);

      const data = JSON.parse(responseText);
      const examenGenerado = JSON.parse(data.texto);
      setExamen(examenGenerado);
    } catch (err) {
      console.error("Error al generar el examen:", err);
      setError(`Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleRespuesta = (preguntaIndex, respuesta) => {
    setRespuestasUsuario(prev => ({ ...prev, [preguntaIndex]: respuesta }));
  };

  const calificarExamen = () => {
    let correctas = 0;
    examen.preguntas.forEach((pregunta, index) => {
      const respUsuario = respuestasUsuario[index];
      const respCorrectas = pregunta.respuestasCorrectas.sort();
      if (pregunta.tipo === 'respuesta_múltiple' && respUsuario) {
        if (JSON.stringify(respUsuario.sort()) === JSON.stringify(respCorrectas)) correctas++;
      } else {
        if (JSON.stringify(respUsuario) === JSON.stringify(respCorrectas[0])) correctas++;
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
      <h2>🧪 Generador de Exámenes</h2>
      <p>Selecciona el curso y un tema para generar preguntas de práctica.</p>

      <select value={curso} onChange={(e) => setCurso(e.target.value)}>
        {Object.keys(cursos).map((nombre) => (
          <option key={nombre} value={nombre}>{nombre}</option>
        ))}
      </select>

      <input
        type="text"
        placeholder="Escribe el módulo o tema"
        value={topico}
        onChange={(e) => setTopico(e.target.value)}
      />

      <button onClick={generarExamen} disabled={isLoading}>
        {isLoading ? 'Generando...' : '🎯 Generar examen'}
      </button>

      {error && <p className="error">{error}</p>}
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
