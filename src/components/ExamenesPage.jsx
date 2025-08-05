
import React, { useState } from "react";
import "./ExamenesPage.css";

const ExamenesPage = () => {
  const [curso, setCurso] = useState("Python");
  const [topico, setTopico] = useState("");
  const [resultado, setResultado] = useState("");
  const [error, setError] = useState("");

  const cursos = {
    Python: "AVDJ3M69B7",
    AWS: "WKNJIRXQUT",
    "AZ-104": "KWG4PHNXSD"
  };

  const generarExamen = async () => {
    setError("");
    setResultado("");

    const knowledgeBaseId = cursos[curso];
    const token = localStorage.getItem("id_token");

    if (!token) {
      setError("❌ No hay token disponible. Inicia sesión nuevamente.");
      return;
    }

    try {
      const response = await fetch(
        "https://h6ysn7u0tl.execute-api.us-east-1.amazonaws.com/dev2/generar-examen",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token
          },
          body: JSON.stringify({
            knowledgeBaseId,
            topico
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        const msg = data?.error || data?.message || "Error desconocido";
        throw new Error(msg);
      }

      setResultado(data.texto || "✅ Examen generado correctamente.");
    } catch (err) {
      console.error("❌ Error al generar el examen:", err);
      setError(`Error al generar el examen: ${err.message}`);
    }
  };

  return (
    <div className="examenes-container">
      <h2>🧪 Generador de Exámenes</h2>
      <p>Selecciona el curso y un tema para generar preguntas de práctica.</p>

      <select value={curso} onChange={(e) => setCurso(e.target.value)}>
        {Object.keys(cursos).map((nombre) => (
          <option key={nombre} value={nombre}>
            {nombre}
          </option>
        ))}
      </select>

      <input
        type="text"
        placeholder="Escribe el módulo o tema"
        value={topico}
        onChange={(e) => setTopico(e.target.value)}
      />

      <button onClick={generarExamen}>🎯 Generar examen</button>

      {error && <p className="error">{error}</p>}
      {resultado && <pre className="resultado">{resultado}</pre>}
    </div>
  );
};

export default ExamenesPage;
