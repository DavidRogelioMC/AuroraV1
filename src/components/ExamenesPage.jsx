// src/components/ExamenesPage.jsx (VERSIÓN MEJORADA)

import React, { useState } from "react";
import "./ExamenesPage.css";

const ExamenesPage = () => {
  const [curso, setCurso] = useState("Python");
  const [topico, setTopico] = useState("");
  const [examen, setExamen] = useState(null); // <-- CAMBIO 1: Ahora guardaremos el objeto del examen
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false); // <-- AÑADIMOS ESTADO DE CARGA

  const cursos = {
    Python: "AVDJ3M69B7",
    AWS: "WKNJIRXQUT",
    "AZ-104": "KWG4PHNXSD"
  };

  const generarExamen = async () => {
    setError("");
    setExamen(null);
    setIsLoading(true);

    const knowledgeBaseId = cursos[curso];
    const token = localStorage.getItem("id_token");

    if (!token) {
      setError("❌ No hay token disponible. Inicia sesión nuevamente.");
      setIsLoading(false);
      return;
    }
    if (!topico.trim()) {
      setError("❌ Por favor, escribe un tópico para el examen.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(
        "https://h6ysn7u0tl.execute-api.us-east-1.amazonaws.com/dev2/generar-examen",
        {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: token },
          body: JSON.stringify({ knowledgeBaseId, topico })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Error desconocido");
      }

      // --- CAMBIO 2: Parseamos el JSON que viene dentro de 'texto' ---
      const examenGenerado = JSON.parse(data.texto);
      setExamen(examenGenerado);

    } catch (err) {
      console.error("❌ Error al generar el examen:", err);
      setError(`Error al generar el examen: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

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
      
      {/* --- CAMBIO 3: Renderizamos el examen de forma estructurada --- */}
      {isLoading && <div className="spinner"></div>}
      
      {examen && (
        <div className="examen-resultado">
          <h3>Examen sobre: {examen.tema}</h3>
          {examen.preguntas.map((pregunta, index) => (
            <div key={index} className="pregunta-container">
              <p className="enunciado"><strong>{index + 1}. ({pregunta.tipo})</strong> {pregunta.enunciado}</p>
              <div className="opciones-container">
                {Object.entries(pregunta.opciones).map(([letra, texto]) => (
                  <div key={letra} className="opcion-item">
                    <strong>{letra}:</strong> {texto}
                  </div>
                ))}
              </div>
              <div className="respuesta-correcta">
                <strong>Respuesta(s) Correcta(s):</strong> {pregunta.respuestasCorrectas.join(", ")}
              </div>
              <div className="justificacion">
                <strong>Justificación:</strong> {pregunta.justificacion}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExamenesPage;
