import React, { useState } from "react";
import "./ExamenesPage.css"; // Asegúrate que exista y tenga tu estilo

function ExamenesPage() {
  const [curso, setCurso] = useState("Python");
  const [topico, setTopico] = useState("");
  const [resultado, setResultado] = useState("");
  const [cargando, setCargando] = useState(false);

  const cursos = [
    { nombre: "Python", id: "AVDJ3M69B7" },
    { nombre: "AWS", id: "WKNJIRXQUT" },
    { nombre: "AZ-104", id: "ZOWS9MQ9GG" }
  ];

  const handleGenerarExamen = async () => {
    if (!topico) return alert("Escribe un tópico");
    setCargando(true);
    setResultado("");

    try {
      const response = await fetch("https://TU_ENDPOINT_AQUI/dev2/generar-examen", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          knowledgeBaseId: cursos.find(c => c.nombre === curso).id,
          topico
        })
      });

      const data = await response.json();
      setResultado(data.texto || "No se generó examen.");
    } catch (err) {
      console.error(err);
      setResultado("Ocurrió un error al generar el examen.");
    }

    setCargando(false);
  };

  return (
    <div className="contenedor-examenes">
      <h2 className="titulo">🧪 Generador de Exámenes Simuladores</h2>

      <div className="formulario">
        <select value={curso} onChange={e => setCurso(e.target.value)}>
          {cursos.map(c => (
            <option key={c.id} value={c.nombre}>{c.nombre}</option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Tópico (ej: IAM, VPC, clases en Python...)"
          value={topico}
          onChange={e => setTopico(e.target.value)}
        />

        <button onClick={handleGenerarExamen}>
          {cargando ? "Generando..." : "Obtener examen"}
        </button>
      </div>

      <pre className="resultado">{resultado}</pre>
    </div>
  );
}

export default ExamenesPage;
