import { useState } from 'react';

export default function Actividades() {
  const [tema, setTema] = useState('');
  const [modulo, setModulo] = useState('');
  const [tipo, setTipo] = useState('fill');
  const [resultado, setResultado] = useState('');
  const token = localStorage.getItem('id_token');

  const generarActividad = async () => {
    if (!tema || !modulo) {
      alert("Por favor completa todos los campos.");
      return;
    }

    setResultado("⏳ Generando actividad...");

    try {
      const res = await fetch("https://h6ysn7u0tl.execute-api.us-east-1.amazonaws.com/dev2/generarActividad", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token
        },
        body: JSON.stringify({ tema, modulo, tipo })
      });

      const text = await res.text();
      const data = JSON.parse(text);

      if (!data.preguntas || data.preguntas.length === 0) {
        throw new Error("No se generaron preguntas.");
      }

      const html = data.preguntas.map(p => `<div class='card'>${p.texto}</div>`).join("");
      setResultado(html);
    } catch (err) {
      setResultado(`❌ Error: ${err.message}`);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>🎯 Generador de Actividades con IA</h2>
      <input value={tema} onChange={e => setTema(e.target.value)} placeholder="Tema" />
      <input value={modulo} onChange={e => setModulo(e.target.value)} placeholder="Nombre del módulo (.txt)" />
      <select value={tipo} onChange={e => setTipo(e.target.value)}>
        <option value="fill">Fill in the blank</option>
        <option value="quiz">Quiz</option>
      </select>
      <button onClick={generarActividad}>Generar Actividad</button>
      <div dangerouslySetInnerHTML={{ __html: resultado }} />
    </div>
  );
}
