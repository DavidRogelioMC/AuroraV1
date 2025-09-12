import React, { useState } from 'react';
import EditorDeTemario from './EditorDeTemario'; 
import './GeneradorTemarios.css';

function GeneradorTemarios() {
  const [temarioGenerado, setTemarioGenerado] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState(''); // Para mensajes informativos

  // Estado para los parámetros
  const [params, setParams] = useState({
    tecnologia: '',
    tema_curso: '',
    nivel_dificultad: 'basico',
    sector: '',
    enfoque: '',
    objetivo_tipo: 'saber_hacer',
    codigo_certificacion: '',
    bloom_level_override: '',
    horas_por_sesion: 7,
    numero_sesiones_por_semana: 3
  });

  // URL de tu API Gateway que invoca la Lambda de temarios
  const apiUrl = "https://h6ysn7u0tl.execute-api.us-east-1.amazonaws.com/dev2/PruebadeTEMAR"; // <-- REEMPLAZA ESTO

  const handleParamChange = (e) => {
    const { name, value } = e.target;
    setParams(prev => ({ ...prev, [name]: value }));
  };

  // Generar/regenerar temario
  const handleGenerar = async (nuevosParams = params) => {
    // Validaciones según la lambda
    if (!nuevosParams.tema_curso || !nuevosParams.tecnologia) {
      setError("Por favor, especifica la tecnología y el tema del curso.");
      return;
    }
    if (!nuevosParams.sector?.trim()) {
      setError("Por favor, especifica el sector del curso.");
      return;
    }
    if (nuevosParams.objetivo_tipo === 'certificacion' && !nuevosParams.codigo_certificacion?.trim()) {
      setError("Por favor, especifica el código de certificación cuando el objetivo es 'certificacion'.");
      return;
    }
    
    // Validaciones adicionales según la lambda
    if (nuevosParams.horas_por_sesion < 4 || nuevosParams.horas_por_sesion > 12) {
      setError("Las horas por sesión deben estar entre 4 y 12.");
      return;
    }
    if (nuevosParams.numero_sesiones_por_semana < 3 || nuevosParams.numero_sesiones_por_semana > 7) {
      setError("El número de sesiones por semana debe estar entre 3 y 7 (mínimo 3 para generar 3 capítulos).");
      return;
    }

    setIsLoading(true);
    setError('');
    setInfoMessage(''); // Limpiar mensajes anteriores
    setTemarioGenerado(null);

    try {
      const token = localStorage.getItem("id_token");
      
      // Asegurar que los números sean enteros
      const parametrosLimpios = {
        ...nuevosParams,
        horas_por_sesion: parseInt(nuevosParams.horas_por_sesion),
        numero_sesiones_por_semana: parseInt(nuevosParams.numero_sesiones_por_semana)
      };

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(parametrosLimpios)
      });
      
      const data = await response.json();

      if (!response.ok) {
        // Manejo mejorado de errores según la lambda
        if (data.errors && Array.isArray(data.errors)) {
          throw new Error(`Errores de validación:\n${data.errors.join('\n')}`);
        }
        throw new Error(data.error || data.message || "Ocurrió un error en el servidor.");
      }
      
      // Mostrar información sobre resolución de conflictos si existe
      if (data._conflictos_resueltos) {
        console.log("Conflictos resueltos por la lambda:", data._conflictos_resueltos);
        setInfoMessage(`Ajustes automáticos aplicados: ${data._conflictos_resueltos}`);
      }
      if (data._validation_warnings && data._validation_warnings.length > 0) {
        console.warn("Advertencias de validación:", data._validation_warnings);
      }
      
      const temarioCompleto = { ...data, ...parametrosLimpios };
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
            <label>Sector</label>
            <input name="sector" value={params.sector} onChange={handleParamChange} placeholder="Ej: Bancario, Educativo, Salud, Gobierno" />
          </div>
          <div className="form-group">
            <label>Nivel de Dificultad</label>
            <select name="nivel_dificultad" value={params.nivel_dificultad} onChange={handleParamChange}>
              <option value="basico">Básico</option>
              <option value="intermedio">Intermedio</option>
              <option value="avanzado">Avanzado</option>
            </select>
          </div>
          <div className="form-group">
            <label>Objetivo del Curso</label>
            <select name="objetivo_tipo" value={params.objetivo_tipo} onChange={handleParamChange}>
              <option value="saber_hacer">Saber Hacer</option>
              <option value="certificacion">Certificación</option>
            </select>
          </div>
          <div className="form-group">
            <label>Horas por Sesión</label>
            <input 
              name="horas_por_sesion" 
              type="number" 
              min="4" 
              max="12" 
              value={params.horas_por_sesion} 
              onChange={handleParamChange}
              title="Entre 4 y 12 horas por sesión"
            />
            <small className="help-text">Entre 4 y 12 horas (rango permitido por la lambda)</small>
          </div>
          <div className="form-group">
            <label>Sesiones por Semana</label>
            <input 
              name="numero_sesiones_por_semana" 
              type="number" 
              min="3" 
              max="7" 
              value={params.numero_sesiones_por_semana} 
              onChange={handleParamChange}
              title="Entre 3 y 7 sesiones por semana (mínimo 3 para generar 3 capítulos)"
            />
            <small className="help-text">Entre 3 y 7 sesiones (mínimo 3 capítulos obligatorios)</small>
          </div>
        </div>
        
        {params.objetivo_tipo === 'certificacion' && (
          <div className="form-group">
            <label>Código de Certificación</label>
            <input name="codigo_certificacion" value={params.codigo_certificacion} onChange={handleParamChange} placeholder="Ej: AWS-SAA-C03, Microsoft AZ-104" />
          </div>
        )}
        
        <div className="form-group">
          <label>Enfoque Adicional (Opcional)</label>
          <textarea name="enfoque" value={params.enfoque} onChange={handleParamChange} placeholder="Ej: Orientado a patrones de diseño, con énfasis en casos prácticos" />
        </div>
        
        <div className="form-group">
          <label>Nivel de Bloom Personalizado (Opcional)</label>
          <input name="bloom_level_override" value={params.bloom_level_override} onChange={handleParamChange} placeholder="Ej: Niveles 3-4 (Aplicar, Analizar)" />
        </div>
        
        <button className="btn-generar-principal" onClick={() => handleGenerar(params)} disabled={isLoading}>
          {isLoading ? 'Generando...' : 'Generar Propuesta de Temario'}
        </button>
      </div>

      {error && <div className="error-mensaje">{error}</div>}
      {infoMessage && <div className="info-mensaje">{infoMessage}</div>}

      {temarioGenerado && (
        <div>
          {/* Mostrar información de ajustes automáticos si existen */}
          {temarioGenerado._conflictos_resueltos && (
            <div className="conflictos-info">
              <h4>🔧 Ajustes Automáticos Aplicados</h4>
              <p>{temarioGenerado._conflictos_resueltos}</p>
              {temarioGenerado._parametros_finales && (
                <div className="parametros-finales">
                  <strong>Parámetros finales:</strong>
                  <ul>
                    <li>Teoría: {temarioGenerado._parametros_finales.teoria}</li>
                    <li>Práctica: {temarioGenerado._parametros_finales.practica}</li>
                    <li>Horas por sesión: {temarioGenerado._parametros_finales.horas_por_sesion}</li>
                    <li>Sesiones por semana: {temarioGenerado._parametros_finales.sesiones_por_semana}</li>
                  </ul>
                </div>
              )}
            </div>
          )}
          
          {/* Mostrar advertencias de validación si existen */}
          {temarioGenerado._validation_warnings && temarioGenerado._validation_warnings.length > 0 && (
            <div className="validation-warnings">
              <h4>⚠️ Advertencias de Validación</h4>
              <ul>
                {temarioGenerado._validation_warnings.map((warning, index) => (
                  <li key={index}>{warning}</li>
                ))}
              </ul>
            </div>
          )}

          <EditorDeTemario
            temarioInicial={temarioGenerado}
            onRegenerate={handleGenerar}
            onSave={handleSave}
            isLoading={isLoading}
          />
        </div>
      )}
    </div>
  );
}

export default GeneradorTemarios;


