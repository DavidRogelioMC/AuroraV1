// src/components/EditorDeTemario.jsx (CÓDIGO COMPLETO Y FUNCIONAL)

import React, { useState, useEffect } from 'react';
import './EditorDeTemario.css';

function EditorDeTemario({ temarioInicial, onRegenerate, onSave, isLoading }) {
  const [temario, setTemario] = useState(temarioInicial);
  const [vista, setVista] = useState('detallada');
  const [mostrarFormRegenerar, setMostrarFormRegenerar] = useState(false);

  // Estado inicial para los parámetros de re-generación
  const [params, setParams] = useState({
    tema_curso: temarioInicial?.tema_curso || '',
    extension_curso_dias: temarioInicial?.numero_sesiones || 1,
    nivel_dificultad: temarioInicial?.nivel_dificultad || 'basico',
    objetivos: temarioInicial?.objetivos_usuario || '',
    enfoque: temarioInicial?.enfoque || ''
  });

  useEffect(() => {
    setTemario(temarioInicial);
  }, [temarioInicial]);

  // --- MANEJADORES DE EDICIÓN DIRECTA ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTemario(prev => ({ ...prev, [name]: value }));
  };

  const handleTemarioChange = (capIndex, subIndex, value) => {
    const nuevoTemario = JSON.parse(JSON.stringify(temario)); // Deep copy
    if (subIndex === null) {
      nuevoTemario.temario[capIndex].capitulo = value;
    } else {
      nuevoTemario.temario[capIndex].subcapitulos[subIndex] = value;
    }
    setTemario(nuevoTemario);
  };

  // --- MANEJADORES DE RE-GENERACIÓN ---
  const handleParamsChange = (e) => {
    const { name, value } = e.target;
    setParams(prev => ({ ...prev, [name]: value }));
  };

  const handleRegenerateClick = () => {
    onRegenerate(params);
    setMostrarFormRegenerar(false);
  };

  const handleSaveClick = () => {
    onSave(temario);
  };

  if (!temario) return null;

  return (
    <div className="editor-container">
      <div className="vista-selector">
        <button className={`btn-vista ${vista === 'detallada' ? 'activo' : ''}`} onClick={() => setVista('detallada')}>
          Vista Detallada (Editable)
        </button>
        <button className={`btn-vista ${vista === 'resumida' ? 'activo' : ''}`} onClick={() => setVista('resumida')}>
          Vista Resumida
        </button>
      </div>

      {isLoading ? (
        <div className="spinner-container">
          <div className="spinner"></div><p>Generando nueva versión...</p>
        </div>
      ) : vista === 'detallada' ? (
        <div>
          <label className="editor-label">Nombre del Curso</label>
          <textarea name="nombre_curso" value={temario.nombre_curso || ''} onChange={handleInputChange} className="input-titulo" />
          
          <label className="editor-label">Descripción General</label>
          <textarea name="descripcion_general" value={temario.descripcion_general || ''} onChange={handleInputChange} className="textarea-descripcion" />

          <h3>Temario Detallado</h3>
          {(temario.temario || []).map((cap, capIndex) => (
            <div key={capIndex} className="capitulo-editor">
              <input value={cap.capitulo || ''} onChange={(e) => handleTemarioChange(capIndex, null, e.target.value)} className="input-capitulo" placeholder="Nombre del capítulo"/>
              <ul>
                {(cap.subcapitulos || []).map((sub, subIndex) => (
                  <li key={subIndex}>
                    <input value={typeof sub === 'object' ? sub.nombre : sub} onChange={(e) => handleTemarioChange(capIndex, subIndex, e.target.value)} className="input-subcapitulo" placeholder="Nombre del subcapítulo"/>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : (
        <div className="vista-resumida">
          <h1>{temario.nombre_curso}</h1>
          <div className="seccion-resumen"><h2>Objetivos del Curso</h2><ul>{(temario.objetivos || []).map((obj, i) => <li key={i}>{obj}</li>)}</ul></div>
          <div className="seccion-resumen"><h2>Descripción</h2><p>{temario.descripcion_general}</p></div>
          <div className="seccion-resumen"><h2>Audiencia</h2><p>{temario.audiencia}</p></div>
          <div className="seccion-resumen"><h2>Esquema del Curso</h2>
            {(temario.temario || []).map((cap, i) => (
              <div key={i} className="capitulo-resumido"><strong>{cap.capitulo}</strong>
                <ul>
                  {(cap.subcapitulos || []).map((sub, j) => <li key={j}>{typeof sub === 'object' ? sub.nombre : sub}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="acciones-footer">
        <button onClick={() => setMostrarFormRegenerar(prev => !prev)}>Ajustar y Regenerar</button>
        <button onClick={handleSaveClick} className="btn-guardar">Guardar Versión</button>
      </div>

      {mostrarFormRegenerar && (
        <div className="regenerar-form">
          <h4>Regenerar Temario con Nuevos Parámetros</h4>
          <div className="form-group">
            <label>Duración (días):</label>
            <input name="extension_curso_dias" type="number" value={params.extension_curso_dias} onChange={handleParamsChange} />
          </div>
          <div className="form-group">
            <label>Nivel:</label>
            <select name="nivel_dificultad" value={params.nivel_dificultad} onChange={handleParamsChange}>
              <option value="basico">Básico</option><option value="intermedio">Intermedio</option><option value="avanzado">Avanzado</option>
            </select>
          </div>
          <div className="form-group">
            <label>Enfoque:</label>
            <textarea name="enfoque" value={params.enfoque} onChange={handleParamsChange} />
          </div>
          <button onClick={handleRegenerateClick}>Regenerar</button>
        </div>
      )}
    </div>
  );
}

export default EditorDeTemario;
