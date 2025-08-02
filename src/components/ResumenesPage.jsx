// src/components/ResumenesPage.jsx

import { useState } from 'react';
import './ResumenesPage.css'; // Importa los estilos

function ResumenesPage() {
  const [tema, setTema] = useState('');
  const [modulo, setModulo] = useState('');
  const [resultado, setResultado] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  const obtenerResumen = async () => {
    setCargando(true);
    setError('');
    setResultado(null);

    try {
      const response = await fetch('https://h6ysn7u0tl.execute-api.us-east-1.amazonaws.com/prod', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tema, modulo })
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
      <p>Genera automáticamente un resumen mejorado y una imagen educativa a partir de tu módulo.</p>

      <div className="formulario-resumenes">
        <input
          type="text"
          placeholder="Tema (ej: arquitectura)"
          value={tema}
          onChange={(e) => setTema(e.target.value)}
        />
        <input
          type="text"
          placeholder="Módulo (ej: modulo1)"
          value={modulo}
          onChange={(e) => setModulo(e.target.value)}
        />
        <button onClick={obtenerResumen} disabled={cargando}>
          {cargando ? 'Generando...' : 'Obtener resumen'}
        </button>
      </div>

      {error && <div className="error-resumenes">{error}</div>}

      {resultado && (
        <div className="resultado-resumenes">
          <h2>🧾 Contenido Original</h2>
          <pre>{JSON.stringify(resultado.original, null, 2)}</pre>

          <h2>✨ Contenido Mejorado</h2>
          <div className="texto-mejorado">{resultado.mejorado}</div>

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
