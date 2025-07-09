// src/components/GeneradorActividades.jsx (VERSIÓN FINAL PARA KNOWLEDGE BASES)

import { useState } from 'react';
import DOMPurify from 'dompurify';
import './ActividadesPage.css'; // Usamos el CSS de la página padre para los estilos

// Definimos las Knowledge Bases disponibles (estas deben coincidir con tus KBs reales)
const knowledgeBasesDisponibles = [
  { nombre: "Python", id: "AVDJ3M69B7" }, // <-- REEMPLAZA CON TU ID REAL
  { nombre: "AWS", id: "WKNJIRXQUT" },    // <-- REEMPLAZA CON TU ID REAL
  { nombre: "AZ-104", id: "SX4C4WD4GV" }  // <-- REEMPLAZA CON TU ID REAL
];

function GeneradorActividades({ token, tipoActividad }) {
  // --- Estados para controlar el formulario ---
  // Ahora seleccionamos una Knowledge Base por su ID
  const [kbSeleccionadaId, setKbSeleccionadaId] = useState(knowledgeBasesDisponibles[0].id);
  const [topicoEspecifico, setTopicoEspecifico] = useState(''); // El campo de texto libre

  // ... (tipoActividad viene de las props, resultado, isLoading, error se mantienen)
  const [resultado, setResultado] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const apiUrl = import.meta.env.VITE_API_GENERAR_ACTIVIDADES; 

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!topicoEspecifico || !kbSeleccionadaId) {
      setError("Por favor, selecciona un tema y describe un tópico.");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setResultado(null);

    try {
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": token },
        // --- ¡CAMBIO CLAVE AQUÍ! Enviamos los nuevos parámetros ---
        body: JSON.stringify({
          knowledgeBaseId: kbSeleccionadaId,
          topico: topicoEspecifico,
          tipo: tipoActividad, // El tipo de actividad sigue siendo el mismo
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Ocurrió un error en el servidor.");
      }
      const data = await res.json();
      setResultado(data.preguntas);

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="generador-container">
      <h2>Crear Actividad: {tipoActividad.charAt(0).toUpperCase() + tipoActividad.slice(1)}</h2>
      <form onSubmit={handleSubmit} className="generador-form">
        {/* --- Nuevo campo para seleccionar la Knowledge Base --- */}
        <div className="form-group">
          <label htmlFor="knowledgeBase">Selecciona la Base de Conocimientos</label>
          <select
            id="knowledgeBase"
            value={kbSeleccionadaId}
            onChange={(e) => setKbSeleccionadaId(e.target.value)}
            required
          >
            {knowledgeBasesDisponibles.map(kb => (
              <option key={kb.id} value={kb.id}>
                {kb.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* --- Nuevo campo para el Tópico Específico --- */}
        <div className="form-group">
          <label htmlFor="topico">Tópico Específico</label>
          <input
            id="topico"
            type="text"
            value={topicoEspecifico}
            onChange={(e) => setTopicoEspecifico(e.target.value)}
            placeholder="Ej: Funciones Lambda en AWS, Bucles 'for' en Python"
            required
          />
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
          <div className="actividad-generada">
            <h3>Resultado:</h3>
            {resultado.map((item, index) => (
              <div 
                key={index} 
                className="actividad-item"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(item.texto) }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default GeneradorActividades;
