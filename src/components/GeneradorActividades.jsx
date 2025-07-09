// src/components/GeneradorActividades.jsx

import { useState } from 'react';
import DOMPurify from 'dompurify';
import './ActividadesPage.css'; // Crearemos este archivo a continuación

function GeneradorActividades({ token, tipoActividad }) {
  const [tema, setTema] = useState('');
  const [modulo, setModulo] = useState('');
  
  const [resultado, setResultado] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const apiUrl = "https://h6ysn7u0tl.execute-api.us-east-1.amazonaws.com/dev";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setResultado(null);

    try {
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": token },
        body: JSON.stringify({
          tema: tema,
          modulo: modulo,
          tipo: tipoActividad,
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
        <div className="form-group">
          <label htmlFor="tema">Tema (Carpeta en S3)</label>
          <input id="tema" type="text" value={tema} onChange={(e) => setTema(e.target.value)} placeholder="Ej: aws" required />
        </div>
        <div className="form-group">
          <label htmlFor="modulo">Módulo (Nombre del archivo sin .txt)</label>
          <input id="modulo" type="text" value={modulo} onChange={(e) => setModulo(e.target.value)} placeholder="Ej: s3-basico" required />
        </div>
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
              <div key={index} className="actividad-item" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(item.texto) }} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default GeneradorActividades;
