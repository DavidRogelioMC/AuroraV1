import { useState } from 'react';
import './ExamenesPage.css';

function ExamenesPage() {
  const [curso, setCurso] = useState('Python');
  const [topico, setTopico] = useState('');
  const [examen, setExamen] = useState(null);
  const [preguntaActualIndex, setPreguntaActualIndex] = useState(0);
  const [respuestaSeleccionada, setRespuestaSeleccionada] = useState([]);
  const [mostrarJustificacion, setMostrarJustificacion] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const knowledgeBaseMap = {
    Python: 'AVDJ3M69B7',
    AWS: 'WKNJIRXQUT',
    Azure: 'ZOWS9MQ9GG',
    IA: 'ZOWS9MQ9GG',
  };

  const handleGenerarExamen = async () => {
    if (!topico.trim()) {
      setError('Por favor ingresa un tópico válido.');
      return;
    }

    setLoading(true);
    setError('');
    setExamen(null);
    setPreguntaActualIndex(0);
    setRespuestaSeleccionada([]);
    setMostrarJustificacion(false);

    const knowledgeBaseId = knowledgeBaseMap[curso] || '';

    try {
      const response = await fetch('https://h6ysn7u0tl.execute-api.us-east-1.amazonaws.com/dev2/generar-examen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ knowledgeBaseId, topico })
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setExamen(data);
    } catch (err) {
      setError('Error al generar el examen: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const preguntaActual = examen?.preguntas?.[preguntaActualIndex];

  const handleSeleccion = (opcion) => {
    if (!preguntaActual) return;

    const esMultiple = preguntaActual.tipo === 'respuesta_múltiple';
    if (esMultiple) {
      if (respuestaSeleccionada.includes(opcion)) {
        setRespuestaSeleccionada(respuestaSeleccionada.filter(o => o !== opcion));
      } else {
        setRespuestaSeleccionada([...respuestaSeleccionada, opcion]);
      }
    } else {
      setRespuestaSeleccionada([opcion]);
    }
  };

  const esCorrecta = () => {
    const correctas = preguntaActual.respuestasCorrectas.sort().join(',');
    const seleccionadas = respuestaSeleccionada.sort().join(',');
    return correctas === seleccionadas;
  };

  const siguientePregunta = () => {
    setMostrarJustificacion(false);
    setRespuestaSeleccionada([]);
    setPreguntaActualIndex(p => p + 1);
  };

  if (!examen) {
    return (
      <div className="examen-page">
        <h1 className="titulo">🧪 Generador de Exámenes</h1>
        <div className="formulario">
          <select value={curso} onChange={(e) => setCurso(e.target.value)}>
            <option value="Python">Python</option>
            <option value="AWS">AWS</option>
            <option value="Azure">Azure</option>
            <option value="IA">IA</option>
          </select>

          <input
            type="text"
            placeholder="Tópico (ej: IAM, Lambda...)"
            value={topico}
            onChange={(e) => setTopico(e.target.value)}
          />

          <button onClick={handleGenerarExamen} disabled={loading}>
            {loading ? 'Generando...' : 'Generar examen'}
          </button>
        </div>

        {error && <p className="mensaje-error">{error}</p>}
      </div>
    );
  }

  return (
    <div className="examen-page">
      <h2 className="titulo">📝 Examen: {examen.tema}</h2>
      <p className="tipo-pregunta">Tipo: {preguntaActual.tipo}</p>
      <h3>{preguntaActualIndex + 1}. {preguntaActual.enunciado}</h3>

      <div className="opciones-container">
        {Object.entries(preguntaActual.opciones).map(([letra, texto]) => (
          <button
            key={letra}
            className={`opcion-btn ${
              respuestaSeleccionada.includes(letra)
                ? preguntaActual.respuestasCorrectas.includes(letra)
                  ? 'correcta'
                  : 'incorrecta'
                : ''
            }`}
            onClick={() => handleSeleccion(letra)}
            disabled={mostrarJustificacion}
          >
            <strong>{letra}:</strong> {texto}
          </button>
        ))}
      </div>

      {!mostrarJustificacion ? (
        <button
          className="btn-secundario"
          onClick={() => setMostrarJustificacion(true)}
          disabled={respuestaSeleccionada.length === 0}
        >
          Revisar
        </button>
      ) : (
        <>
          <p className={`resultado ${esCorrecta() ? 'acierto' : 'error'}`}>
            {esCorrecta() ? '✅ Respuesta correcta' : '❌ Respuesta incorrecta'}
          </p>
          <p className="justificacion">🧠 Justificación: {preguntaActual.justificacion}</p>
          {preguntaActualIndex < examen.preguntas.length - 1 ? (
            <button className="btn-siguiente" onClick={siguientePregunta}>Siguiente pregunta</button>
          ) : (
            <p>🏁 Fin del examen</p>
          )}
        </>
      )}
    </div>
  );
}

export default ExamenesPage;

