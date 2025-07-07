// src/components/ChatModal.jsx
import './ChatModal.css';
import { useState } from 'react';

// --- PASO 1: Define tus temas (Bases de Conocimiento) ---
// Coloca esto justo al principio del componente.
const basesDeConocimiento = [
  {
    nombre: "Python",
    id: "AVDJ3M69B7",
    icono: "🧠" 
  },
  {
    nombre: "AWS",
    id: "WKNJIRXQUT",
    icono: "☁️" 
  },
  {
    nombre: "AZ 104",
    id: "ZOWS9MQ9GG",
    icono: "🔬"
  }
];


function ChatModal({ token }) {
  const [visible, setVisible] = useState(false);
  const [historial, setHistorial] = useState([]);
  const [pregunta, setPregunta] = useState('');
  
  // --- PASO 2: Crea el estado para el tema activo ---
  // Elige uno por defecto.
  const [baseActivaId, setBaseActivaId] = useState(basesDeConocimiento[0].id);

  const apiUrl = import.meta.env.VITE_API_CHAT;
  const historialUrl = import.meta.env.VITE_API_HISTORIAL;

  const agregarBurbuja = (tipo, texto) => {
    setHistorial(h => [...h, { tipo, texto }]);
  };

  const cargarHistorial = async () => { /* ... (sin cambios) ... */ };

  // --- PASO 4: Modifica la función `enviarPregunta` ---
  const enviarPregunta = async () => {
    if (!pregunta.trim()) return;
    agregarBurbuja('usuario', pregunta);
    agregarBurbuja('ia', '⏳ Generando respuesta...');
    setPregunta('');

    try {
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          Authorization: token,
          'Content-Type': 'application/json',
        },
        // ¡CAMBIO CLAVE AQUÍ!
        // Ahora enviamos tanto la pregunta como el ID de la base de conocimiento.
        body: JSON.stringify({ 
          pregunta: pregunta,
          knowledgeBaseId: baseActivaId  // <-- Añadimos el ID activo
        }),
      });
      const data = await res.json();
      setHistorial(prev =>
        prev.map((h, i) =>
          i === prev.length - 1 ? { ...h, texto: data.respuesta || '❌ Sin respuesta.' } : h
        )
      );
    } catch {
      setHistorial(prev =>
        prev.map((h, i) =>
          i === prev.length - 1 ? { ...h, texto: '❌ Error al consultar la API.' } : h
        )
      );
    }
  };

  const borrarHistorial = async () => { /* ... (sin cambios) ... */ };

  return (
    <>
      <button id="abrirChat" onClick={() => { setVisible(true); cargarHistorial(); }}>🤖</button>
      <div id="modalChat" className={visible ? 'show' : ''}>
        <header>
          <div>
            <button onClick={borrarHistorial}>🗑 Limpiar chat</button>
            <button onClick={() => setVisible(false)}>❌</button>
          </div>
        </header>

        {/* --- PASO 3: Agrega los botones a la interfaz (JSX) --- */}
        {/* Coloca esto justo después del <header> y antes de #historial */}
        <div className="base-selector">
          {basesDeConocimiento.map(base => (
            <button 
              key={base.id}
              className={`btn-tema ${base.id === baseActivaId ? 'activo' : ''}`}
              onClick={() => setBaseActivaId(base.id)}
            >
              {base.icono} {base.nombre}
            </button>
          ))}
        </div>

        <div id="historial">
          <div id="historialContenido">
            {historial.map((msg, idx) => (
              <div key={idx} className={`chat-burbuja ${msg.tipo}`}>
                {msg.texto}
              </div>
            ))}
          </div>
        </div>
        <div id="inputContainer">
          <input
            type="text"
            value={pregunta}
            onChange={e => setPregunta(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && enviarPregunta()}
            placeholder="Escribe tu mensaje"
          />
          <button onClick={enviarPregunta}>Enviar</button>
        </div>
      </div>
    </>
  );
}

export default ChatModal;
