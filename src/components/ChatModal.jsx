// src/components/ChatModal.jsx (CÓDIGO FINAL Y COMPLETO)

import './ChatModal.css';
import { useState } from 'react';

// <-- CAMBIO 1: El array ahora tiene nombres visuales y nombres para el prompt -->
const basesDeConocimiento = [
  { 
    id: "AVDJ3M69B7",
    nombreVisual: "Python",
    nombreTemaPrompt: "Bases de programación en Python",
    icono: "🧠" 
  },
  { 
    id: "WKNJIRXQUT",
    nombreVisual: "AWS",
    nombreTemaPrompt: "Servicios básicos en la nube",
    icono: "☁️" 
  },
  { 
    id: "KWG4PHNXSD",
    nombreVisual: "AZ-104",
    nombreTemaPrompt: "Microsoft Azure Administrator AZ-104",
    icono: "🔬" 
  }
];

function ChatModal({ token }) {
  const [visible, setVisible] = useState(false);
  const [historial, setHistorial] = useState([]);
  const [pregunta, setPregunta] = useState('');
  
  const [baseActivaId, setBaseActivaId] = useState(basesDeConocimiento[0].id);

  const apiUrl = import.meta.env.VITE_API_CHAT;
  const historialUrl = import.meta.env.VITE_API_HISTORIAL;

  const agregarBurbuja = (tipo, texto) => {
    setHistorial(h => [...h, { tipo, texto }]);
  };

  const cargarHistorial = async () => {
    try {
      const res = await fetch(historialUrl, {
        method: 'GET',
        headers: { Authorization: token },
      });
      if (!res.ok) throw new Error('La respuesta del servidor no fue OK');
      const data = await res.json();
      setHistorial([]);
      if (data.historial && data.historial.length > 0) {
        data.historial.forEach(item => {
          agregarBurbuja('usuario', item.pregunta);
          agregarBurbuja('ia', item.respuesta);
        });
      } else {
        agregarBurbuja('ia', '¡Hola! Soy THOR. Selecciona un tema y hazme una pregunta.');
      }
    } catch (error) {
      console.error("No se pudo cargar el historial:", error);
      setHistorial([]);
      agregarBurbuja('ia', '¡Hola! Soy THOR, tu asistente de IA. ¿En qué puedo ayudarte hoy?');
    }
  };

  const enviarPregunta = async () => {
    if (!pregunta.trim()) return;
    
    const preguntaActual = pregunta;
    agregarBurbuja('usuario', preguntaActual);
    agregarBurbuja('ia', '⏳ Generando respuesta...');
    setPregunta('');

    try {
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          Authorization: token,
          'Content-Type': 'application/json',
        },
        // <-- CAMBIO 2: Enviamos el 'nombreTemaPrompt' a la Lambda -->
        body: JSON.stringify({ 
          pregunta: preguntaActual,
          knowledgeBaseId: baseActivaId,
          nombreTema: basesDeConocimiento.find(b => b.id === baseActivaId).nombreTemaPrompt
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

  const borrarHistorial = async () => {
    if (!window.confirm('¿Estás seguro de que deseas borrar tu historial?')) return;
    try {
      await fetch(historialUrl, {
        method: 'DELETE',
        headers: { Authorization: token },
      });
      setHistorial([]);
      agregarBurbuja('ia', '✅ Historial eliminado correctamente.');
    } catch {
      agregarBurbuja('ia', '❌ No se pudo eliminar el historial.');
    }
  };

  return (
    <>
      <button id="abrirChat" onClick={() => { setVisible(true); cargarHistorial(); }}>🤖</button>
      
      <div id="modalChat" className={visible ? 'show' : ''}>
        <header>
          <h2 className="chat-header">Asistente THOR</h2>
          <div>
            <button onClick={borrarHistorial}>🗑</button>
            <button onClick={() => setVisible(false)}>❌</button>
          </div>
        </header>

        <div className="base-selector">
          {basesDeConocimiento.map(base => (
            <button 
              key={base.id}
              className={`btn-tema ${base.id === baseActivaId ? 'activo' : ''}`}
              onClick={() => setBaseActivaId(base.id)}
            >
              <span className="btn-icono">{base.icono}</span>
              {/* <-- CAMBIO 3: Usamos 'nombreVisual' para el texto del botón --> */}
              <span className="btn-texto">{base.nombreVisual}</span>
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
