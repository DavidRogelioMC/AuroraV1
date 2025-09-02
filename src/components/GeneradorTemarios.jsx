// src/components/GeneradorTemarios.jsx

import React, { useState } from 'react';
import EditorDeTemario from './EditorDeTemario'; // Asegúrate de que este componente exista
import './GeneradorTemarios.css'; // Crearemos este CSS

function GeneradorTemarios() {
  const [temarioGenerado, setTemarioGenerado] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Estado para los parámetros de la Lambda
  const [params, setParams] = useState({
    tema_curso: '',
    extension_curso_dias: 1,
    nivel_dificultad: 'basico',
    objetivos: '',
    enfoque: ''
  });

  // URL de tu API Gateway que invoca la Lambda de temarios
  const apiUrl = "URL_DE_TU_API_GATEWAY_PARA_TEMARIOS"; // <-- REEMPLAZA ESTO

  const handleParamChange = (e) => {
    const { name, value } = e.target;
    setParams(prev => ({ ...prev, [name]: value }));
  };

  // Función para generar/regenerar el temario
  const handleGenerar = async (nuevosParams = params) => {
    if (!nuevosParams.tema_curso) {
      setError("Por favor, especifica el tema del curso.");
      return;
    }
    setIsLoading(true);
    setError('');
    setTemarioGenerado(null); // Limpiamos el resultado anterior

    try {
      const token = localStorage.getItem("id_token"); // O como obtengas tu token
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
      
      // Añadimos los parámetros originales a los datos para usarlos en la re-generación
      const temarioCompleto = { ...data, ...nuevosParams };
      setTemarioGenerado(temarioCompleto);
      
    } catch (err) {
      console.error("Error al generar el temario:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Función para guardar el temario
  const handleSave = async (temarioParaGuardar) => {
    console.log("Guardando esta versión del temario:", temarioParaGuardar);
    // Aquí iría la lógica para llamar a tu Lambda de "GuardarTemario"
    // que subiría el resultado a S3 con versionamiento.
    // const response = await fetch("URL_LAMBDA_GUARDAR", { ... });
    alert("Funcionalidad de guardado en desarrollo.");
  };

  return (
    <div className="generador-temarios-container">
      <h2>Generador de Cursos Estándar</h2>
      <p>Introduce los detalles para generar una propuesta de temario con IA.</p>

      <div className="formulario-inicial">
        <div className="form-grid">
          <div className="form-group">
            <label>Tema Principal del Curso</label>
            <input name="tema_curso" value={params.tema_curso} onChange={handleParamChange} placeholder="Ej: Python, AWS, Scrum" />
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
          <label>Objetivos Específicos (Opcional)</label>
          <textarea name="objetivos" value={params.objetivos} onChange={handleParamChange} placeholder="Ej: Enfocarse en la creación de APIs REST con FastAPI" />
        </div>
        <div className="form-group">
          <label>Enfoque Adicional (Opcional)</label>
          <textarea name="enfoque" value={params.enfoque} onChange={handleParamChange} placeholder="Ej: Orientado a principiantes absolutos sin experiencia previa" />
        </div>
        
        <button className="btn-generar-principal" onClick={() => handleGenerar(params)} disabled={isLoading}>
          {isLoading ? 'Generando...' : 'Generar Propuesta de Temario'}
        </button>
      </div>

      {error && <div className="error-mensaje">{error}</div>}

      {temarioGenerado && (
        <EditorDeTemario
          temarioInicial={temarioGenerado}
          onRegenerate={handleGenerar} // La misma función sirve para regenerar
          onSave={handleSave}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}
export default GeneradorTemarios;
