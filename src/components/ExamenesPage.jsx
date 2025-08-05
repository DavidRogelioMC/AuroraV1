import React, { useState } from "react";
import "./ExamenesPage.css";

const basesConocimiento = [
  {
    id: "AVDJ3M69B7",
    nombreVisual: "Python",
    nombreTemaPrompt: "Bases de programación en Python",
    icono: "🧠",
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

  const generarExamen = async () => {
    setError(null);

    const base = basesConocimiento.find(
      (b) => b.nombreVisual === cursoSeleccionado
    );

    if (!base) {
      setError("Base de conocimiento no encontrada.");
      return;
    }

    if (!topico.trim()) {
      setError("Debes ingresar un tema o módulo.");
      return;
    }

    const token = localStorage.getItem("idToken"); // 👈 asegúrate de usar este nombre en App.jsx también
    if (!token) {
      setError("Token no disponible. Inicia sesión nuevamente.");
      return;
    }

    try {
      const response = await fetch(
        "https://h6ysn7u0tl.execute-api.us-east-1.amazonaws.com/dev2/generar-examen",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
          body: JSON.stringify({
            knowledgeBaseId: base.id,
            topico: topico,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Error ${response.status}: ${JSON.stringify(errorData)}`
        );
      }

      const data = await response.json();
      console.log("✅ Examen generado:", data);

      // Aquí puedes redirigir, guardar en estado o mostrar al usuario
    } catch (err) {
      console.error(err);
      setError(`Error al generar el examen: ${err.message}`);
    }
  };

  return (
    <div className="contenedor-examen">
      <h2>🧪 Generador de Exámenes</h2>
      <p>Selecciona el curso y un tema para generar preguntas de práctica.</p>

      <select
        value={cursoSeleccionado}
        onChange={(e) => setCursoSeleccionado(e.target.value)}
      >
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

      <button onClick={generarExamen}>Generar examen</button>

      {error && <p className="error">{error}</p>}
    </div>
  );
}

export default ExamenesPage;


