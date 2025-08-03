import React, { useState } from "react";
import "./ExamenesPage.css";

const ExamenesPage = () => {
  const [curso, setCurso] = useState("Python");
  const [modulo, setModulo] = useState("");
  const [resultado, setResultado] = useState("");
  const [error, setError] = useState("");

  const handleGenerar = async () => {
    setResultado("");
    setError("");

    try {
      const response = await fetch(
        "https://h6ysn7u0tl.execute-api.us-east-1.amazonaws.com/dev2/generar-examen",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ curso, topico: modulo }),
        }
      );

      if (!response.ok) throw new Error("Error al generar el examen");

      const data = await response.json();
      setResultado(data.resumen || "No se recibió contenido");
    } catch (err) {
      setError("Error al generar el examen: " + err.message);
    }
  };

  return (
    <div className="pagina-examenes">
      <h1>🧪 Generador de Exámenes</h1>
      <p>Selecciona el curso y un tema para generar preguntas de práctica.</p>

      <div className="formulario-examenes">
        <select value={curso} onChange={(e) => setCurso(e.target.value)}>
          <option value="Python">Python</option>
          <option value="AWS">AWS</option>
          <option value="Azure">Azure</option>
        </select>

        <input
          type="text"
          placeholder="Ej: módulo 1"
          value={modulo}
          onChange={(e) => setModulo(e.target.value)}
        />

        <button onClick={handleGenerar}>Generar examen</button>

        {error && <div className="error-examenes">{error}</div>}
      </div>

      {resultado && (
        <div className="resultado-examenes">
          <h2>📄 Examen Generado</h2>
          <div>{resultado}</div>
        </div>
      )}
    </div>
  );
};

export default ExamenesPage;
