import React, { useState } from "react";
import "./ExamenesPage.css";

const basesConocimiento = [
  {
    id: "AVDJ3M69B7",
    nombreVisual: "Python",
    nombreTemaPrompt: "Bases de programación en Python",
    icono: "🐍",
  },
  {
    id: "WKNJIRXQUT",
    nombreVisual: "AWS",
    nombreTemaPrompt: "Servicios básicos en la nube",
    icono: "☁️",
  },
  {
    id: "KWG4PHNXSD",
    nombreVisual: "AZ-104",
    nombreTemaPrompt: "Microsoft Azure Administrator AZ-104",
    icono: "🔬",
  },
];

function ExamenesPage() {
  const [cursoSeleccionado, setCursoSeleccionado] = useState("Python");
  const [topico, setTopico] = useState("módulo 1");
  const [error, setError] = useState(null);
  const [respuesta, setRespuesta] = useState(null);
  const [cargando, setCargando] = useState(false);

  const generarExamen = async () => {
    setError(null);
    setRespuesta(null);
    setCargando(true);

    const base = basesConocimiento.find(b => b.nombreVisual === cursoSeleccionado);
    if (!base) {
      setError("❌ Base de conocimiento no encontrada.");
      setCargando(false);
      return;
    }

    try {
      const response = await fetch("https://h6ysn7u0tl.execute-api.us-east-1.amazonaws.com/dev2/generar-examen", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          knowledgeBaseId: base.id,
          topico: topico,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Error ${response.status}: ${JSON.stringify(data)}`);
      }

      setRespuesta(data.texto);
    } catch (err) {
      console.error("❌ Error completo:", err);
      setError(`Error al generar el examen: ${err.message}`);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="contenedor-examen">
      <h2>🧪 Generador de Exámenes</h2>
      <p>Selecciona el curso y un tema para generar preguntas de práctica.</p>

      <select value={cursoSeleccionado} onChange={(e) => setCursoSeleccionado(e.target.value)}>
        {basesConocimiento.map((b) => (
          <option key={b.id} value={b.nombreVisual}>
            {b.icono} {b.nombreVisual}
          </option>
        ))}
      </select>

      <input
        type="text"
        value={topico}
        onChange={(e) => setTopico(e.target.value)}
        placeholder="Ingresa el tema o módulo"
      />

      <button onClick={generarExamen} disabled={cargando}>
        {cargando ? "Generando..." : "🎯 Generar examen"}
      </button>

      {error && <p className="error">{error}</p>}
      {respuesta && (
        <div className="resultado">
          <h3>📋 Resultado:</h3>
          <pre>{respuesta}</pre>
        </div>
      )}
    </div>
  );
}

export default ExamenesPage;
