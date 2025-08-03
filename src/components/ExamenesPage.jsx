import React, { useState } from "react";
import "./ExamenesPage.css";

function ExamenesPage() {
  const [curso, setCurso] = useState("AWS");
  const [topico, setTopico] = useState("");
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState("");

  const generarExamen = async () => {
    setError("");
    setResultado(null);

    try {
      const response = await fetch(
        "https://h6ysn7u0tl.execute-api.us-east-1.amazonaws.com/dev2/generar-examen",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ curso, topico }),
        }
      );

      if (!response.ok) {
        throw new Error("No se pudo generar el examen.");
      }

      const data = await response.json();

      // Manejo por si la Lambda devuelve string en lugar de JSON directo
      const parsed = typeof data === "string" ? JSON.parse(data) : data;

      setResultado(parsed.resumen || "No se recibió contenido");
    } catch (err) {
      console.error(err);
      setError("Error al generar el examen: " + err.message);
    }
  };

  return (
    <div className="pagina-examenes">
      <h1>🧪 Generador de Exámenes</h1>
      <p>Selecciona el curso y un tema para generar preguntas de práctica.</p>

      <div className="formulario-examenes">
        <select value={curso} onChange={(e) => setCurso(e.target.value)}>
          <option value="AWS">AWS</option>
          <option value="Python">Python</option>
          <option value="Azure">Azure</option>
        </select>

        <input
          type="text"
          placeholder="Escribe el módulo de tu examen"
          value={topico}
          onChange={(e) => setTopico(e.target.value)}
        />

        <button onClick={generarExamen}>Generar examen</button>

        {error && <div className="error-examenes">{error}</div>}
      </div>

      {resultado && (
        <div className="resultado-examenes">
          <h2>📄 Examen Generado</h2>
          <p>{resultado}</p>
        </div>
      )}
    </div>
  );
}

export default ExamenesPage;
