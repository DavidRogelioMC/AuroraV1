// src/components/ChatModal.jsx
import './ChatModal.css';
import { useState } from 'react';

function ChatModal({ token }) {
  const [visible, setVisible] = useState(false);
  const [historial, setHistorial] = useState([]);
  const [pregunta, setPregunta] = useState('');

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
      const data = await res.json();
      setHistorial([]);
      data.historial.forEach(item => {
        agregarBurbuja('usuario', item.pregunta);
        agregarBurbuja('ia', item.respuesta);
      });
    } catch {
      agregarBurbuja('ia', '⚠️ No se pudo cargar el historial.');
    }
  };

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
        body: JSON.stringify({ pregunta }),
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
          <strong>A U R O R A</strong>
          <div>
            <button onClick={borrarHistorial}>🗑 Limpiar chat</button>
            <button onClick={() => setVisible(false)}>❌</button>
          </div>
        </header>
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
