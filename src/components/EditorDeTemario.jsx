// src/components/EditorDeTemario.jsx (CÓDIGO COMPLETO Y FUNCIONAL)

import React, { useState, useEffect } from 'react';
import './EditorDeTemario.css';

function EditorDeTemario({ temarioInicial, onRegenerate, onSave, isLoading }) {
  const [temario, setTemario] = useState(temarioInicial);
  const [vista, setVista] = useState('detallada'); // Inicia en la vista editable
  const [mostrarFormRegenerar, setMostrarFormRegenerar] = useState(false);

  // Estado para los parámetros de re-generación. Se inicializa con los datos del temario actual.
  const [params, setParams] = useState({
    tema_curso: temarioInicial?.tema_curso || temarioInicial?.nombre_curso || '',
    extension_curso_dias: temarioInicial?.numero_sesiones || 1,
    nivel_dificultad: temarioInicial?.nivel_dificultad || 'basico',
    objetivos: temarioInicial?.objetivos || '', // Ahora usa objetivos directamente
    enfoque: temarioInicial?.enfoque || ''
  });

  // Efecto para actualizar el temario si la prop `temarioInicial` cambia
  useEffect(() => {
    setTemario(temarioInicial);
    // También actualizamos los params por si se regenera
    setParams({
      tema_curso: temarioInicial?.tema_curso || temarioInicial?.nombre_curso || '',
      extension_curso_dias: temarioInicial?.numero_sesiones || 1,
      nivel_dificultad: temarioInicial?.nivel_dificultad || 'basico',
      objetivos: temarioInicial?.objetivos || '',
      enfoque: temarioInicial?.enfoque || ''
    });
  }, [temarioInicial]);

  // --- MANEJADORES DE EDICIÓN DIRECTA ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTemario(prev => ({ ...prev, [name]: value }));
  };

  const handleTemarioChange = (capIndex, subIndex, value) => {
    const nuevoTemario = JSON.parse(JSON.stringify(temario)); // Deep copy para evitar mutaciones
    if (subIndex === null) {
      nuevoTemario.temario[capIndex].capitulo = value;
    } else {
      // Maneja ambos formatos de subcapítulos (string u objeto)
      if (typeof nuevoTemario.temario[capIndex].subcapitulos[subIndex] === 'object') {
        nuevoTemario.temario[capIndex].subcapitulos[subIndex].nombre = value;
      } else {
        nuevoTemario.temario[capIndex].subcapitulos[subIndex] = value;
      }
    }
    setTemario(nuevoTemario);
  };

  // --- MANEJADORES DE RE-GENERACIÓN Y GUARDADO ---
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
        <button 
          className={`btn-vista ${vista === 'detallada' ? 'activo' : ''}`}
          onClick={() => setVista('detallada')}
        >
          Vista Detallada
        </button>
        <button 
          className={`btn-vista ${vista === 'resumida' ? 'activo' : ''}`}
          onClick={() => setVista('resumida')}
        >
          Vista Resumida
        </button>
      </div>
      
      <div className="vista-info">
        {vista === 'detallada' ? (
          <p>📝 Vista completa con todos los campos editables organizados verticalmente</p>
        ) : (
          <p>📋 Vista compacta con campos organizados en grillas para edición rápida</p>
        )}
      </div>

      {isLoading ? (
        <div className="spinner-container">
          <div className="spinner"></div>
          <p>Generando nueva versión...</p>
        </div>
      ) : vista === 'detallada' ? (
        // --- VISTA DETALLADA Y EDITABLE ---
        <div>
          <label className="editor-label">Nombre del Curso</label>
          <textarea name="nombre_curso" value={temario.nombre_curso || ''} onChange={handleInputChange} className="input-titulo" />
          
          <label className="editor-label">Versión de la Tecnología</label>
          <input name="version_tecnologia" value={temario.version_tecnologia || ''} onChange={handleInputChange} className="input-campo" />
          
          <label className="editor-label">Horas Totales</label>
          <input name="horas_totales" type="number" value={temario.horas_totales || ''} onChange={handleInputChange} className="input-campo" />
          
          <label className="editor-label">Número de Sesiones</label>
          <input name="numero_sesiones" type="number" value={temario.numero_sesiones || ''} onChange={handleInputChange} className="input-campo" />
          
          <label className="editor-label">Descripción General</label>
          <textarea name="descripcion_general" value={temario.descripcion_general || ''} onChange={handleInputChange} className="textarea-descripcion" />
          
          <label className="editor-label">Audiencia</label>
          <textarea name="audiencia" value={temario.audiencia || ''} onChange={handleInputChange} className="textarea-descripcion" />
          
          <label className="editor-label">Prerrequisitos</label>
          <textarea name="prerrequisitos" value={temario.prerrequisitos || ''} onChange={handleInputChange} className="textarea-descripcion" />
          
          <label className="editor-label">Objetivos</label>
          <textarea name="objetivos" value={temario.objetivos || ''} onChange={handleInputChange} className="textarea-descripcion" placeholder="Lista los objetivos principales del curso, separados por líneas" />

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
        // --- VISTA RESUMIDA TAMBIÉN EDITABLE ---
        <div className="vista-resumida-editable">
          <input name="nombre_curso" value={temario.nombre_curso || ''} onChange={handleInputChange} className="input-titulo-resumido" placeholder="Nombre del curso" />
          
          <div className="info-grid">
            <div className="info-item">
              <label>Versión:</label>
              <input name="version_tecnologia" value={temario.version_tecnologia || ''} onChange={handleInputChange} className="input-info" />
            </div>
            <div className="info-item">
              <label>Horas:</label>
              <input name="horas_totales" type="number" value={temario.horas_totales || ''} onChange={handleInputChange} className="input-info" />
            </div>
            <div className="info-item">
              <label>Sesiones:</label>
              <input name="numero_sesiones" type="number" value={temario.numero_sesiones || ''} onChange={handleInputChange} className="input-info" />
            </div>
            <div className="info-item">
              <label>EOL:</label>
              <input name="EOL" value={temario.EOL || ''} onChange={handleInputChange} className="input-info" />
            </div>
            <div className="info-item">
              <label>Distribución General:</label>
              <input name="porcentaje_teoria_practica_general" value={temario.porcentaje_teoria_practica_general || ''} onChange={handleInputChange} className="input-info" placeholder="60% Teoría / 40% Práctica" />
            </div>
          </div>

          <div className="seccion-editable">
            <h3>Descripción General</h3>
            <textarea name="descripcion_general" value={temario.descripcion_general || ''} onChange={handleInputChange} className="textarea-resumido" />
          </div>

          <div className="seccion-editable">
            <h3>Audiencia</h3>
            <textarea name="audiencia" value={temario.audiencia || ''} onChange={handleInputChange} className="textarea-resumido" />
          </div>

          <div className="seccion-editable">
            <h3>Prerrequisitos</h3>
            <textarea name="prerrequisitos" value={temario.prerrequisitos || ''} onChange={handleInputChange} className="textarea-resumido" />
          </div>

          <div className="seccion-editable">
            <h3>Objetivos</h3>
            <textarea name="objetivos" value={temario.objetivos || ''} onChange={handleInputChange} className="textarea-resumido" placeholder="Lista los objetivos principales del curso, separados por líneas" />
          </div>

          <h3>Temario Resumido</h3>
          {(temario.temario || []).map((cap, capIndex) => (
            <div key={capIndex} className="capitulo-resumido">
              <input value={cap.capitulo || ''} onChange={(e) => handleTemarioChange(capIndex, null, e.target.value)} className="input-capitulo-resumido" placeholder="Nombre del capítulo"/>
              
              {/* Grid de información del capítulo */}
              <div className="info-grid-capitulo">
                <div className="info-item">
                  <label>Duración (min):</label>
                  <input 
                    type="number" 
                    value={cap.tiempo_capitulo_min || ''} 
                    onChange={(e) => {
                      const nuevoTemario = JSON.parse(JSON.stringify(temario));
                      nuevoTemario.temario[capIndex].tiempo_capitulo_min = parseInt(e.target.value) || 0;
                      setTemario(nuevoTemario);
                    }}
                    className="input-info-small" 
                    placeholder="120"
                  />
                </div>
                <div className="info-item">
                  <label>Distribución:</label>
                  <input 
                    value={cap.porcentaje_teoria_practica_capitulo || ''} 
                    onChange={(e) => {
                      const nuevoTemario = JSON.parse(JSON.stringify(temario));
                      nuevoTemario.temario[capIndex].porcentaje_teoria_practica_capitulo = e.target.value;
                      setTemario(nuevoTemario);
                    }}
                    className="input-info-small" 
                    placeholder="70% Teoría / 30% Práctica"
                  />
                </div>
              </div>

              <div className="subcapitulos-resumidos">
                {(cap.subcapitulos || []).map((sub, subIndex) => (
                  <div key={subIndex} className="subcapitulo-item">
                    <input
                      value={typeof sub === 'object' ? sub.nombre : sub}
                      onChange={(e) => handleTemarioChange(capIndex, subIndex, e.target.value)}
                      className="input-subcapitulo-resumido"
                      placeholder="Subcapítulo"
                    />
                    <div className="subcapitulo-tiempos">
                      <input
                        type="number"
                        value={typeof sub === 'object' ? sub.tiempo_subcapitulo_min || '' : ''}
                        onChange={(e) => {
                          const nuevoTemario = JSON.parse(JSON.stringify(temario));
                          if (typeof nuevoTemario.temario[capIndex].subcapitulos[subIndex] === 'object') {
                            nuevoTemario.temario[capIndex].subcapitulos[subIndex].tiempo_subcapitulo_min = parseInt(e.target.value) || 0;
                          } else {
                            nuevoTemario.temario[capIndex].subcapitulos[subIndex] = {
                              nombre: nuevoTemario.temario[capIndex].subcapitulos[subIndex],
                              tiempo_subcapitulo_min: parseInt(e.target.value) || 0
                            };
                          }
                          setTemario(nuevoTemario);
                        }}
                        className="input-tiempo-sub"
                        placeholder="min"
                      />
                      <input
                        type="number"
                        value={typeof sub === 'object' ? sub.sesion || '' : ''}
                        onChange={(e) => {
                          const nuevoTemario = JSON.parse(JSON.stringify(temario));
                          if (typeof nuevoTemario.temario[capIndex].subcapitulos[subIndex] === 'object') {
                            nuevoTemario.temario[capIndex].subcapitulos[subIndex].sesion = parseInt(e.target.value) || 0;
                          } else {
                            nuevoTemario.temario[capIndex].subcapitulos[subIndex] = {
                              nombre: nuevoTemario.temario[capIndex].subcapitulos[subIndex],
                              sesion: parseInt(e.target.value) || 0
                            };
                          }
                          setTemario(nuevoTemario);
                        }}
                        className="input-sesion-sub"
                        placeholder="sesión"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="acciones-footer">
        <button onClick={() => setMostrarFormRegenerar(prev => !prev)}>Ajustar y Regenerar</button>
        <button onClick={handleSaveClick} className="btn-guardar">Guardar Versión</button>
      </div>

      {mostrarFormRegenerar && (
        <div className="regenerar-form">
          <h4>Regenerar con Nuevos Parámetros</h4>
          <div className="form-group">
            <label>Duración (días):</label>
            <input name="extension_curso_dias" type="number" value={params.extension_curso_dias} onChange={handleParamsChange} />
          </div>
          <div className="form-group">
            <label>Nivel:</label>
            <select name="nivel_dificultad" value={params.nivel_dificultad} onChange={handleParamsChange}>
              <option value="basico">Básico</option>
              <option value="intermedio">Intermedio</option>
              <option value="avanzado">Avanzado</option>
            </select>
          </div>
          <div className="form-group">
            <label>Objetivos (Opcional):</label>
            <textarea name="objetivos" value={params.objetivos} onChange={handleParamsChange} placeholder="Objetivos específicos del curso" />
          </div>
          <div className="form-group">
            <label>Enfoque (Opcional):</label>
            <textarea name="enfoque" value={params.enfoque} onChange={handleParamsChange} />
          </div>
          <button onClick={handleRegenerateClick}>Regenerar</button>
        </div>
      )}
    </div>
  );
}

export default EditorDeTemario;
