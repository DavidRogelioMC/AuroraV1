import { useState } from 'react';
import './ResumenesPage.css';

const basesDeConocimiento = [
  { id: 'AVDJ3M69B7', nombre: 'Python' },
  { id: 'WKNJIRXQUT', nombre: 'AWS' },
  { id: 'SX4C4WD4GV', nombre: 'AZ-104' }
];

function ResumenesPage() {
  const [knowledgeBaseId, setKnowledgeBaseId] = useState(basesDeConocimiento[0].id);
  const [topico, setTopico] = useState('');
  const [resultado, setResultado] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  const obtenerResumen = async () => {
    if (!topico.trim()) {
      setError('⚠️ Debes ingresar un tópico válido.');
      return;
    }

    setCargando(true);
    setError('');
    setResultado(null);

    try {
      const response = await fetch('https://h6ysn7u0tl.execute-api.us-east-1.amazonaws.com/dev2/resumen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ knowledgeBaseId, topico })
      });

      const data = await response.json();
      let parsed = typeof data.body === 'string' ? JSON.parse(data.body) : data.body;

      if (response.ok) {
        setResultado(parsed);
      } else {
        setError(parsed?.error || '❌ Error al generar el resumen.');
      }
    } catch (err) {
      setError('🚫 Error de conexión con el servidor.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="page-content-container pagina-resumenes">
      <h1>📚 Generador de Resúmenes Educativos</h1>
      <p>Selecciona tu curso y escribe un tópico específico para generar un resumen.</p>

      <div className="formulario-resumenes">
        <select value={knowledgeBaseId} onChange={(e) => setKnowledgeBaseId(e.target.value)}>
          {basesDeConocimiento.map((kb) => (
            <option key={kb.id} value={kb.id}>{kb.nombre}</option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Tópico (ej: regiones en AWS, funciones en Python...)"
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
          <h2>📘 Resumen: {topico}</h2>
          {Object.entries(resultado).map(([seccion, datos]) => (
            <div key={seccion} className="seccion-resumen">
              <h3>{seccion}</h3>
              <div className="texto-mejorado">{datos.texto}</div>
              {datos.imagen_url && (
                <img
                  src={datos.imagen_url}
                  alt={`Imagen de la sección ${seccion}`}
                  className="imagen-generada"
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ResumenesPage;

