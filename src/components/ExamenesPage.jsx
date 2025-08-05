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
  const [respuesta, setRespuesta] = useState(null);

  const generarExamen = async () => {
    setError(null);
    setRespuesta(null);

    const base = basesConocimiento.find((b) => b.nombreVisual === cursoSeleccionado);
    if (!base) {
      setError("❌ Base de conocimiento no encontrada.");
      return;
    }

    const token = localStorage.getItem("id_token"); // 👈 Asegúrate de que sea exactamente "id_token"
    if (!token) {
      setError("❌ Token no disponible. Inicia sesión nuevamente.");
      return;
    }

    if (!base.id || !topico) {
      setError("❌ knowledgeBaseId o topico vacío.");
      return;
    }

    const payload = {
      knowledgeBaseId: base.id,
      topico: topico.trim(),
    };

    console.log("📤 Payload enviado:", payload);

    try {
      const response = await fetch("https://h6ysn7u0tl.execute-api.us-east-1.amazonaws.com/dev2/generar-examen", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Error ${response.status}: ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      console.log("✅ Examen generado:", data);
      setRespuesta(data);
    } catch (err) {
      console.error("❌ Error al generar el examen:", err.message);
      setError(`Error al generar el examen: ${err.message}`);
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

      <button onClick={generarExamen}>🎯 Generar examen</button>

      {error && <p className="error">{error}</p>}

      {respuesta && (
        <div className="examen-renderizado">
          <h3>📄 Preguntas generadas:</h3>
          {respuesta.preguntas?.map((pregunta, index) => (
            <div key={index} className="pregunta">
              <p><strong>{index + 1}. {pregunta.texto}</strong></p>

              {pregunta.tipo === "opcion_multiple" && (
                <ul>
                  {pregunta.opciones.map((opcion, i) => (
                    <li key={i}>{opcion}</li>
                  ))}
                </ul>
              )}

              {pregunta.tipo === "verdadero_falso" && <p>Opción: Verdadero o Falso</p>}
              {pregunta.tipo === "llenar_espacios" && <p><em>(Respuesta esperada: {pregunta.respuesta})</em></p>}
              {pregunta.tipo === "emparejar" && (
                <div style={{ display: "flex", gap: "2rem" }}>
                  <ul>
                    {pregunta.pares.map((par, i) => (
                      <li key={i}>{par.izquierda}</li>
                    ))}
                  </ul>
                  <ul>
                    {pregunta.pares.map((par, i) => (
                      <li key={i}>{par.derecha}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ExamenesPage;
