import { useState } from 'react';
import './ResumenesPage.css';

const knowledgeBases = [
  { nombre: "Python", id: "AVDJ3M69B7" },
  { nombre: "AWS", id: "WKNJIRXQUT" },
  { nombre: "AZ-104", id: "ZOWS9MQ9GG" }
];

function ResumenesPage({ token }) {
  const [kbSeleccionadaId, setKbSeleccionadaId] = useState(knowledgeBases[0].id);
  const [topico, setTopico] = useState('');
  const [resultado, setResultado] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  const obtenerResumen = async () => {
    if (!topico.trim()) {
      setError("Por favor, escribe un tópico.");
      return;
    }

    setCargando(true);
    setError('');
    setResultado(null);

    try {
      const response = await fetch(import.meta.env.VITE_API_GENERAR_RESUMENES, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify({
          knowledgeBaseId: kbSeleccionadaId,
          topico: topico
        })
      });

      const data = await response.json();

      if (response.ok) {
        setResultado(data);
      } else {
        setError(data.error || 'Error al generar el resumen');
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="page-content-container pagina-resumenes">
      <h1>Generador de Resúmenes Educativos</h1>
      <p>Selecciona una base de conocimientos y escribe un tópico específico para generar un resumen e imagen.</p>

      <div className="formulario-resumenes">
        <select value={kbSeleccionadaId} onChange={(e) => setKbSeleccionadaId(e.target.value)}>
          {knowledgeBases.map((kb) => (
            <option key={kb.id} value={kb.id}>{kb.nombre}</option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Ej: módulo 1, redes en AWS..."
          value={topico}
          onChange={(e) => setTopico(e.target.value)}
        />

        <button onClick={obtenerResumen} disabled={cargando}>
          {cargando ? 'Generando...' : 'Obtener resumen'}
        </button>
      </div>

      {error && <div className="error-resumenes">{error}</div>}

      {resultado && (
        <div className="resultado-resumenes">
          <h2>✨ Contenido Mejorado</h2>
          <div
            className="texto-mejorado"
            dangerouslySetInnerHTML={{ __html: resultado.mejorado }}
          />

          <h2>🖼️ Imagen Generada</h2>
          <img
            src={resultado.imagen_url}
            alt="Imagen generada por IA"
            className="imagen-generada"
          />
        </div>
      )}
    </div>
  );
}

export default ResumenesPage;
