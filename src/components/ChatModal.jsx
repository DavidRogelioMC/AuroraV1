// src/components/ChatModal.jsx

import './ChatModal.css';
import { useState } from 'react';

// Array con las bases de conocimiento disponibles.
const basesDeConocimiento = [
  { nombre: "Python", id: "AVDJ3M69B7", icono: "🧠" },
  { nombre: "AWS", id: "WKNJIRXQUT", icono: "☁️" },
  { nombre: "AZ 104", id: "ZOWS9MQ9GG", icono: "🔬" }
];

function ChatModal({ token }) {
  const [visible, setVisible] = useState(false);
  const [historial, setHistorial] = useState([]);
  const [pregunta, setPregunta] = useState('');
  
  // Estado para el tema activo, con un valor por defecto.
  const [baseActivaId, setBaseActivaId] = useState(basesDeConocimiento[0].id);

  const apiUrl = import.meta.env.VITE_API_CHAT;
  const historialUrl = import.meta.env.VITE_API_HISTORIAL;

  // Función para agregar mensajes a la vista
  const agregarBurbuja = (tipo, texto) => {
    setHistorial(h => [...h, { tipo, texto }]);
  };

  // --- FUNCIÓN 'cargarHistorial' MODIFICADA Y MEJORADA ---
  const cargarHistorial = async () => {
    try {
      const res = await fetch(historialUrl, {
        method: 'GET',
        headers: { Authorization: token },
      });
  
      // Si la respuesta no es exitosa (ej. 404, 500), no continuamos.
      if (!res.ok) {
        throw new Error('La respuesta del servidor no fue OK');
      }
  
      const data = await res.json();
  
      // Limpiamos el historial actual para evitar duplicados al reabrir.
      setHistorial([]);
  
      // Si el historial existe y tiene elementos, lo mostramos.
      if (data.historial && data.historial.length > 0) {
        data.historial.forEach(item => {
          agregarBurbuja('usuario', item.pregunta);
          agregarBurbuja('ia', item.respuesta);
        });
      } else {
        // SI NO HAY HISTORIAL, MOSTRAMOS UN MENSAJE DE BIENVENIDA.
        agregarBurbuja('ia', '¡Hola! Soy THOR. Selecciona un tema y hazme una pregunta.');
      }
  
    } catch (error) {
      // Si hay un error de red o la respuesta no fue 'ok', mostramos un mensaje de bienvenida.
      console.error("No se pudo cargar el historial:", error);
      setHistorial([]); // Aseguramos que el historial esté limpio
      agregarBurbuja('ia', '¡Hola! Soy THOR, tu asistente de IA. ¿En qué puedo ayudarte hoy?');
    }
  };

  // Función para enviar la pregunta
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
        body: JSON.stringify({ 
          pregunta: preguntaActual,
          knowledgeBaseId: baseActivaId,
          nombreTema: basesDeConocimiento.find(b => b.id === baseActivaId).nombre 
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

  // Función para borrar el historial
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

        {/* Bloque de botones de tema */}
        <div className="base-selector">
          {basesDeConocimiento.map(base => (
            <button 
              key={base.id}
              className={`btn-tema ${base.id === baseActivaId ? 'activo' : ''}`}
              onClick={() => setBaseActivaId(base.id)}
            >
              <span className="btn-icono">{base.icono}</span>
              <span className="btn-texto">{base.nombre}</span>
            </button>
          ))}
        </div>

        {/* El resto de la interfaz del chat */}
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
