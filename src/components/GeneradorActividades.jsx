// src/components/GeneradorActividades.jsx (MODIFICADO)

import { useState } from 'react';
import DOMPurify from 'dompurify';
import './ActividadesPage.css';
import QuizActivity from './QuizActivity'; // <-- IMPORTAMOS EL NUEVO COMPONENTE

const knowledgeBasesDisponibles = [
  { nombre: "Python", id: "AVDJ3M69B7" },
  { nombre: "AWS", id: "WKNJIRXQUT" },
  { nombre: "AZ-104", id: "ZOWS9MQ9GG" }
];

function GeneradorActividades({ token, tipoActividad }) {
  const [kbSeleccionadaId, setKbSeleccionadaId] = useState(knowledgeBasesDisponibles[0].id);
  const [topicoEspecifico, setTopicoEspecifico] = useState('');
  
  const [resultado, setResultado] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const apiUrl = import.meta.env.VITE_API_GENERAR_ACTIVIDADES;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!topicoEspecifico) {
      setError("Por favor, describe un tópico.");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setResultado(null);

    try {
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": token },
        body: JSON.stringify({
          knowledgeBaseId: kbSeleccionadaId,
          topico: topicoEspecifico,
          tipo: tipoActividad,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Ocurrió un error.");
      }
      const data = await res.json();
      setResultado(data.resultado); // Guardamos el objeto 'resultado' completo

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  // --- Nueva función para renderizar la actividad correcta ---
  const renderActividad = () => {
    if (!resultado) return null;

    if (tipoActividad === 'quiz') {
      // Si el resultado es un array (como esperamos para quiz), lo renderizamos
      if (Array.isArray(resultado)) {
        return <QuizActivity data={resultado} />;
      }
    }
    
    // Fallback para otros tipos de actividad o formatos no esperados
    return (
      <div className="actividad-generada">
        <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(resultado.texto_bruto || JSON.stringify(resultado)) }} />
      </div>
    );
  };

  return (
    <div className="generador-container">
      <h2>Crear Actividad: {tipoActividad.charAt(0).toUpperCase() + tipoActividad.slice(1)}</h2>
      <form onSubmit={handleSubmit} className="generador-form">
        <div className="form-group">
          <label htmlFor="knowledgeBase">Selecciona la Base de Conocimientos</label>
          <select id="knowledgeBase" value={kbSeleccionadaId} onChange={(e) => setKbSeleccionadaId(e.target.value)} required>
            {knowledgeBasesDisponibles.map(kb => (
              <option key={kb.id} value={kb.id}>{kb.nombre}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="topico">Tópico Específico</label>
          <input id="topico" type="text" value={topicoEspecifico} onChange={(e) => setTopicoEspecifico(e.target.value)} placeholder="Ej: Bucles 'for' en Python" required />
        </div>
        <p>Estás a punto de generar una actividad de tipo: <strong>{tipoActividad}</strong>.</p>
        <button type="submit" className="btn-generar" disabled={isLoading}>
          {isLoading ? 'Generando...' : 'Generar Actividad'}
        </button>
      </form>
      <div className="resultado-area">
        {isLoading && <div className="spinner"></div>}
        {error && <div className="error-mensaje">{error}</div>}
        {resultado && (
          <>
            <h3>Actividad Generada:</h3>
            {renderActividad()}
          </>
        )}
      </div>
    </div>
  );
}

export default GeneradorActividades;
