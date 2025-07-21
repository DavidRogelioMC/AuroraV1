// src/components/GeneradorActividades.jsx (MODIFICADO PARA TODAS LAS ACTIVIDADES)

import { useState } from 'react';
import DOMPurify from 'dompurify';
import './ActividadesPage.css';
import QuizActivity from './QuizActivity';
import TrueFalseActivity from './TrueFalseActivity';
import MatchActivity from './MatchActivity';
import FillInTheBlankActivity from './FillInTheBlankActivity';

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
      setResultado(data.resultado);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  const renderActividad = () => {
    if (!resultado) return null;

    // Usamos un switch para decidir qué componente renderizar
    switch(tipoActividad) {
      case 'quiz':
        return Array.isArray(resultado) ? <QuizActivity data={resultado} /> : <div>Error de formato en la respuesta del Quiz.</div>;
      case 'truefalse':
        return Array.isArray(resultado) ? <TrueFalseActivity data={resultado} /> : <div>Error de formato en la respuesta de Verdadero/Falso.</div>;
      case 'match':
        return resultado.conceptos ? <MatchActivity data={resultado} /> : <div>Error de formato en la respuesta de Emparejamiento.</div>;
      case 'fill':
        return Array.isArray(resultado) ? <FillInTheBlankActivity data={resultado} /> : <div>Error de formato en la respuesta de Completar Espacios.</div>;
      default:
        // Fallback para cualquier otro caso o formato inesperado
        const textoBruto = resultado.texto_bruto || JSON.stringify(resultado);
        return <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(textoBruto) }} />;
    }
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
