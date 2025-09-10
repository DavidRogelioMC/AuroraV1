import React, { useState } from 'react';
import EditorDeTemario from './EditorDeTemario'; 
import './GeneradorTemarios.css';

function GeneradorTemarios() {
  const [temarioGenerado, setTemarioGenerado] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Estado para los parámetros
  const [params, setParams] = useState({
    tecnologia: '',
    tema_curso: '',
    extension_curso_dias: 1,
    nivel_dificultad: 'basico',
    audiencia: '',
    enfoque: ''
  });

  // URL de tu API Gateway que invoca la Lambda
  const apiUrl = "https://h6ysn7u0tl.execute-api.us-east-1.amazonaws.com/dev2/PruebaTEM";

  const handleParamChange = (e) => {
    const { name, value } = e.target;
    setParams(prev => ({ ...prev, [name]: value }));
  };

  // Generar/regenerar temario
  const handleGenerar = async (nuevosParams = params) => {
    if (!nuevosParams.tema_curso || !nuevosParams.tecnologia) {
      setError("Por favor, especifica la tecnología y el tema del curso.");
      return;
    }
    if (!nuevosParams.audiencia?.trim()) {
      setError("Por favor, especifica la audiencia del curso.");
      return;
    }
    setIsLoading(true);
    setError('');
    setTemarioGenerado(null);

    try {
      const token = localStorage.getItem("id_token");
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(nuevosParams)
      });
      
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Ocurrió un error en el servidor.");
      }
      
      const temarioCompleto = { ...data, ...nuevosParams };
      setTemarioGenerado(temarioCompleto);
      
    } catch (err) {
      console.error("Error al generar el temario:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Guardar versión
  const handleSave = async (temarioParaGuardar) => {
    console.log("Guardando esta versión del temario:", temarioParaGuardar);
    alert("Funcionalidad de guardado en desarrollo.");
  };

  return (
    <div className="generador-temarios-container">
      <h2>Generador de Cursos Estándar</h2>
      <p>Introduce los detalles para generar una propuesta de temario con IA.</p>

      <div className="formulario-inicial">
        <div className="form-grid">
          <div className="form-group">
            <label>Tecnología</label>
            <input name="tecnologia" value={params.tecnologia} onChange={handleParamChange} placeholder="Ej: AWS Serverless, React, Python, etc." />
          </div>
          <div className="form-group">
            <label>Tema Principal del Curso</label>
            <input name="tema_curso" value={params.tema_curso} onChange={handleParamChange} placeholder="Ej: Arquitecturas Serverless, Desarrollo Frontend" />
          </div>
          <div className="form-group">
            <label>Duración (días)</label>
            <input name="extension_curso_dias" type="number" min="1" value={params.extension_curso_dias} onChange={handleParamChange} />
          </div>
          <div className="form-group">
            <label>Nivel de Dificultad</label>
            <select name="nivel_dificultad" value={params.nivel_dificultad} onChange={handleParamChange}>
              <option value="basico">Básico</option>
              <option value="intermedio">Intermedio</option>
              <option value="avanzado">Avanzado</option>
            </select>
          </div>
        </div>
        <div className="form-group">
          <label>Audiencia</label>
          <textarea name="audiencia" value={params.audiencia} onChange={handleParamChange} placeholder="Ej: Desarrolladores e Ingenieros de la Nube con experiencia en AWS" />
        </div>
        <div className="form-group">
          <label>Enfoque Adicional (Opcional)</label>
          <textarea name="enfoque" value={params.enfoque} onChange={handleParamChange} placeholder="Ej: Orientado a patrones de diseño, con énfasis en casos prácticos" />
        </div>
        
        <button className="btn-generar-principal" onClick={() => handleGenerar(params)} disabled={isLoading}>
          {isLoading ? 'Generando...' : 'Generar Propuesta de Temario'}
        </button>
      </div>

      {error && <div className="error-mensaje">{error}</div>}

      {temarioGenerado && (
        <EditorDeTemario
          temarioInicial={temarioGenerado}
          onRegenerate={handleGenerar}
          onSave={handleSave}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}

export default GeneradorTemarios;

