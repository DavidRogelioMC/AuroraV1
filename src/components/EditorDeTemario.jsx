// src/components/EditorDeTemario.jsx (COMPLETO)
// Requiere: html2pdf.js (ya lo tienes) y este CSS: ./EditorDeTemario.css
// API esperada (tu Lambda):
//  POST   {apiBase}/temarios           body: { cursoId, contenido, nota?, autorEmail? }
//  GET    {apiBase}/temarios?cursoId=...             -> lista de versiones
//  GET    {apiBase}/temarios/{versionId}?cursoId=... -> contenido de versión específica

import React, { useState, useEffect, useRef } from 'react';
import html2pdf from 'html2pdf.js';
import './EditorDeTemario.css';

const API_BASE = import.meta.env.VITE_TEMARIOS_API || ''; // sin /temarios al final

function slugify(str = '') {
  return String(str)
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'curso';
}

function nowIso() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// Exporta CSV en memoria (Excel lo abre sin problemas)
function downloadCSV(filename, rows) {
  const csv = rows.map(r => r.map(cell => {
    const s = (cell ?? '').toString();
    if (s.includes('"') || s.includes(',') || s.includes('\n')) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  }).join(',')).join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Convierte un temario a filas para CSV
function temarioToRows(temario, meta = {}) {
  const rows = [];
  rows.push(['NombreCurso', temario?.nombre_curso || '']);
  rows.push(['VersionTecnologia', temario?.version_tecnologia || '']);
  rows.push(['HorasTotales', temario?.horas_totales ?? '']);
  rows.push(['NumeroSesiones', temario?.numero_sesiones ?? '']);
  rows.push(['EOL', temario?.EOL || '']);
  rows.push(['TeoriaPracticaGeneral', temario?.porcentaje_teoria_practica_general || '']);
  rows.push(['DescripcionGeneral', (temario?.descripcion_general || '').replace(/\n/g, ' ')]);
  rows.push(['Audiencia', (temario?.audiencia || '').replace(/\n/g, ' ')]);
  rows.push(['Prerrequisitos', (temario?.prerrequisitos || '').replace(/\n/g, ' ')]);
  rows.push(['Objetivos', (temario?.objetivos || '').replace(/\n/g, ' ')]);
  rows.push(['Meta_CursoId', meta.cursoId || '']);
  rows.push(['Meta_VersionId', meta.versionId || '']);
  rows.push(['Meta_CreatedAt', meta.createdAt || '']);
  rows.push([]); // línea en blanco

  rows.push(['Capítulo', 'Duración(min)', 'Teoría/Práctica', 'ObjetivosCapítulo', 'Subcapítulo', 'Minutos(Sub)', 'Sesión(Sub)']);
  (temario?.temario || []).forEach(cap => {
    const capObj = cap || {};
    const capName = capObj.capitulo || '';
    const tmin = capObj.tiempo_capitulo_min ?? '';
    const dist = capObj.porcentaje_teoria_practica_capitulo || '';
    const objCap = Array.isArray(capObj.objetivos_capitulo)
      ? capObj.objetivos_capitulo.join(' | ')
      : (capObj.objetivos_capitulo || '');

    const subs = capObj.subcapitulos || [];
    if (subs.length === 0) {
      rows.push([capName, tmin, dist, objCap, '', '', '']);
    } else {
      subs.forEach(sub => {
        const sName = typeof sub === 'object' ? (sub.nombre || '') : (sub || '');
        const sMin = typeof sub === 'object' ? (sub.tiempo_subcapitulo_min ?? '') : '';
        const sSes = typeof sub === 'object' ? (sub.sesion ?? '') : '';
        rows.push([capName, tmin, dist, objCap, sName, sMin, sSes]);
      });
    }
  });

  return rows;
}

function EditorDeTemario({ temarioInicial, onRegenerate, onSave, isLoading }) {
  const [temario, setTemario] = useState(temarioInicial);
  const [vista, setVista] = useState('detallada'); // 'detallada' | 'resumida'
  const [mostrarFormRegenerar, setMostrarFormRegenerar] = useState(false);

  // UI extras
  const [guardando, setGuardando] = useState(false);
  const [errorUi, setErrorUi] = useState('');
  const [okUi, setOkUi] = useState('');

  // Modal versiones
  const [modalVersiones, setModalVersiones] = useState(false);
  const [versiones, setVersiones] = useState([]);
  const [cargandoVersiones, setCargandoVersiones] = useState(false);

  // Modal exportar
  const [modalExportar, setModalExportar] = useState(false);
  const [exportTipo, setExportTipo] = useState('pdf'); // 'pdf' | 'excel'
  const [exportCount, setExportCount] = useState('5'); // '5' | '10' | '20' | 'all'
  const [seleccionadas, setSeleccionadas] = useState({}); // versionId -> boolean

  // PDF ref
  const pdfTargetRef = useRef(null);

  // Parámetros de regeneración
  const [params, setParams] = useState({
    tecnologia: temarioInicial?.version_tecnologia || '',
    tema_curso: temarioInicial?.tema_curso || temarioInicial?.nombre_curso || '',
    extension_curso_dias: temarioInicial?.numero_sesiones || 1,
    nivel_dificultad: temarioInicial?.nivel_dificultad || 'basico',
    audiencia: temarioInicial?.audiencia || '',
    enfoque: temarioInicial?.enfoque || ''
  });

  useEffect(() => {
    setTemario(temarioInicial);
    setParams({
      tecnologia: temarioInicial?.version_tecnologia || '',
      tema_curso: temarioInicial?.tema_curso || temarioInicial?.nombre_curso || '',
      extension_curso_dias: temarioInicial?.numero_sesiones || 1,
      nivel_dificultad: temarioInicial?.nivel_dificultad || 'basico',
      audiencia: temarioInicial?.audiencia || '',
      enfoque: temarioInicial?.enfoque || ''
    });
  }, [temarioInicial]);

  // --- Edición directa ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTemario(prev => ({ ...prev, [name]: value }));
  };

  const handleTemarioChange = (capIndex, subIndex, value) => {
    const nuevoTemario = JSON.parse(JSON.stringify(temario));
    if (subIndex === null) {
      nuevoTemario.temario[capIndex].capitulo = value;
    } else {
      if (typeof nuevoTemario.temario[capIndex].subcapitulos[subIndex] === 'object') {
        nuevoTemario.temario[capIndex].subcapitulos[subIndex].nombre = value;
      } else {
        nuevoTemario.temario[capIndex].subcapitulos[subIndex] = value;
      }
    }
    setTemario(nuevoTemario);
  };

  // --- Regenerar / Guardar ---
  const handleParamsChange = (e) => {
    const { name, value } = e.target;
    setParams(prev => ({ ...prev, [name]: value }));
  };

  const handleRegenerateClick = () => {
    setErrorUi('');
    setOkUi('');
    onRegenerate(params);
    setMostrarFormRegenerar(false);
  };

  const handleSaveClick = async () => {
    setErrorUi('');
    setOkUi('');
    if (!API_BASE) {
      setErrorUi('Falta configurar VITE_TEMARIOS_API.');
      return;
    }
    try {
      setGuardando(true);
      const cursoId = slugify(temario?.nombre_curso || params?.tema_curso || 'curso');
      const nota = window.prompt('Escribe una nota para esta versión (opcional):', `Guardado ${nowIso()}`) || '';
      const token = localStorage.getItem('id_token') || ''; // por si usas Authorizer
      const res = await fetch(`${API_BASE.replace(/\/$/,'')}/temarios`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          cursoId,
          contenido: temario,
          nota
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Error al guardar versión');
      setOkUi(`Versión guardada ✔ (versionId: ${data.versionId || 'N/A'})`);
    } catch (err) {
      console.error(err);
      setErrorUi(err.message || 'Error al guardar versión');
    } finally {
      setGuardando(false);
    }
  };

  // --- PDF ---
  const exportarPDF = () => {
    if (!pdfTargetRef.current) return;
    const titulo = temario?.nombre_curso || 'temario';
    const filename = `temario_${String(titulo).replace(/\s+/g, '_')}_${vista}.pdf`;
    html2pdf()
      .set({
        margin: [10, 10, 10, 10],
        filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, allowTaint: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      })
      .from(pdfTargetRef.current)
      .save();
  };

  // --- Versiones ---
  const abrirVersiones = async () => {
    setModalVersiones(true);
    setCargandoVersiones(true);
    setErrorUi('');
    setOkUi('');
    try {
      if (!API_BASE) { throw new Error('Falta VITE_TEMARIOS_API'); }
      const cursoId = slugify(temario?.nombre_curso || params?.tema_curso || 'curso');
      const token = localStorage.getItem('id_token') || '';
      const res = await fetch(`${API_BASE.replace(/\/$/,'')}/temarios?cursoId=${encodeURIComponent(cursoId)}`, {
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'No se pudo obtener versiones');
      setVersiones(Array.isArray(data) ? data : []);
      // reset selección
      const sel = {};
      (Array.isArray(data) ? data : []).forEach((v,i) => {
        if (i === 0) sel[v.versionId] = true; // por defecto última
      });
      setSeleccionadas(sel);
    } catch (e) {
      console.error(e);
      setErrorUi(e.message || 'Error al cargar versiones');
    } finally {
      setCargandoVersiones(false);
    }
  };

  const cargarVersion = async (versionId) => {
    setErrorUi('');
    setOkUi('');
    try {
      if (!API_BASE) { throw new Error('Falta VITE_TEMARIOS_API'); }
      const cursoId = slugify(temario?.nombre_curso || params?.tema_curso || 'curso');
      const token = localStorage.getItem('id_token') || '';
      const res = await fetch(`${API_BASE.replace(/\/$/,'')}/temarios/${encodeURIComponent(versionId)}?cursoId=${encodeURIComponent(cursoId)}`, {
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'No se pudo obtener la versión');
      setTemario(data);
      setOkUi(`Versión ${versionId} cargada ✔`);
      setModalVersiones(false);
    } catch (e) {
      console.error(e);
      setErrorUi(e.message || 'Error al cargar versión');
    }
  };

  // --- Exportar (selector) ---
  const abrirExportar = async () => {
    setModalExportar(true);
    setErrorUi('');
    setOkUi('');
    // también precargamos versiones (si no están)
    if (!versiones.length) {
      await abrirVersiones();
      setModalVersiones(false); // cerramos el modal de versiones si se abrió internamente
    }
  };

  const toggleSeleccion = (versionId) => {
    setSeleccionadas(prev => ({ ...prev, [versionId]: !prev[versionId] }));
  };

  const getVersionesParaExportar = () => {
    let lista = versiones.slice(); // ya viene ordenada por Lambda desc (más reciente primero)
    if (exportCount !== 'all') {
      const n = parseInt(exportCount, 10);
      lista = lista.slice(0, n);
    }
    // si el usuario seleccionó manualmente, respetamos esa selección
    const manual = Object.entries(seleccionadas).filter(([,v]) => !!v).map(([k]) => k);
    if (manual.length) {
      lista = lista.filter(v => manual.includes(v.versionId));
    }
    return lista;
  };

  const exportExcelCSV = async () => {
    try {
      if (!API_BASE) { throw new Error('Falta VITE_TEMARIOS_API'); }
      const cursoId = slugify(temario?.nombre_curso || params?.tema_curso || 'curso');
      const token = localStorage.getItem('id_token') || '';
      const elegidas = getVersionesParaExportar();
      if (!elegidas.length) { throw new Error('Selecciona al menos 1 versión'); }

      // Descarga cada versión y arma CSV consolidado
      const rows = [];
      rows.push(['CursoId', cursoId, 'Exportado', nowIso()]);
      rows.push([]);
      elegidas.forEach((v, idx) => {
        rows.push([`# Versión ${idx+1}`, `versionId=${v.versionId}`, `createdAt=${v.createdAt || ''}`, `isLatest=${v.isLatest ? 'sí' : 'no'}`]);
        rows.push([]);
      });

      rows.push(['---']);
      rows.push([]);

      for (const v of elegidas) {
        const url = `${API_BASE.replace(/\/$/,'')}/temarios/${encodeURIComponent(v.versionId)}?cursoId=${encodeURIComponent(cursoId)}`;
        const res = await fetch(url, { headers: { ...(token ? { 'Authorization': `Bearer ${token}` } : {}) } });
        const tmp = await res.json();
        if (!res.ok) throw new Error(tmp?.error || `Error al leer versión ${v.versionId}`);
        const bloque = temarioToRows(tmp, { cursoId, versionId: v.versionId, createdAt: v.createdAt || '' });
        rows.push([`== Versión ${v.versionId} ==`]);
        rows.push([]);
        rows.push(...bloque);
        rows.push([]);
        rows.push([]);
      }

      const filename = `temario_${cursoId}_v${elegidas.length}_${Date.now()}.csv`;
      downloadCSV(filename, rows);
      setOkUi(`Exportado ${filename} ✔`);
      setModalExportar(false);
    } catch (e) {
      console.error(e);
      setErrorUi(e.message || 'Error al exportar');
    }
  };

  if (!temario) return null;

  return (
    <div className="editor-container">

      {/* Avisos UI */}
      {(errorUi || okUi) && (
        <div className="ui-messages">
          {errorUi && <div className="msg error">{errorUi}</div>}
          {okUi && <div className="msg ok">{okUi}</div>}
        </div>
      )}

      {/* Selector de vista */}
      <div className="vista-selector">
        <button
          className={`btn-vista ${vista === 'resumida' ? 'activo' : ''}`}
          onClick={() => setVista('resumida')}
        >
          Vista Detallada
        </button>
        <button
          className={`btn-vista ${vista === 'detallada' ? 'activo' : ''}`}
          onClick={() => setVista('detallada')}
        >
          Vista Resumida
        </button>
      </div>

      <div className="vista-info">
        {vista === 'resumida'
          ? <p>📝 Vista completa con todos los campos editables organizados verticalmente</p>
          : <p>📋 Vista compacta con campos organizados en grillas para edición rápida</p>}
      </div>

      {isLoading ? (
        <div className="spinner-container">
          <div className="spinner"></div>
          <p>Generando nueva versión...</p>
        </div>
      ) : (
        <div ref={pdfTargetRef}>
          {vista === 'detallada' ? (
            // --- VISTA DETALLADA ---
            <div>
              <label className="editor-label">Nombre del Curso</label>
              <textarea name="nombre_curso" value={temario.nombre_curso || ''} onChange={handleInputChange} className="input-titulo" />

              <label className="editor-label">Versión de la Tecnología</label>
              <input name="version_tecnologia" value={temario.version_tecnologia || ''} onChange={handleInputChange} className="input-campo" />

              <label className="editor-label">Horas Totales</label>
              <input name="horas_totales" type="number" value={temario.horas_totales || ''} onChange={handleInputChange} className="input-campo" />

              <label className="editor-label">Número de Sesiones</label>
              <input name="numero_sesiones" type="number" value={temario.numero_sesiones || ''} onChange={handleInputChange} className="input-campo" />

              <label className="editor-label">EOL (Soporte)</label>
              <input name="EOL" value={temario.EOL || ''} onChange={handleInputChange} className="input-campo" placeholder="12 meses" />

              <label className="editor-label">Porcentaje Teoría/Práctica General</label>
              <input name="porcentaje_teoria_practica_general" value={temario.porcentaje_teoria_practica_general || ''} onChange={handleInputChange} className="input-campo" placeholder="30% Teoría / 70% Práctica" />

              <label className="editor-label">Descripción General</label>
              <textarea name="descripcion_general" value={temario.descripcion_general || ''} onChange={handleInputChange} className="textarea-descripcion" />

              <label className="editor-label">Audiencia</label>
              <textarea name="audiencia" value={temario.audiencia || ''} onChange={handleInputChange} className="textarea-descripcion" />

              <label className="editor-label">Prerrequisitos</label>
              <textarea name="prerrequisitos" value={temario.prerrequisitos || ''} onChange={handleInputChange} className="textarea-descripcion" />

              <label className="editor-label">Objetivos</label>
              <textarea name="objetivos" value={temario.objetivos || ''} onChange={handleInputChange} className="textarea-descripcion" placeholder="Lista los objetivos principales del curso, separados por líneas" />

              <h3>Temario Resumido</h3>
              {(temario.temario || []).map((cap, capIndex) => (
                <div key={capIndex} className="capitulo-editor">
                  <input value={cap.capitulo || ''} onChange={(e) => handleTemarioChange(capIndex, null, e.target.value)} className="input-capitulo" placeholder="Nombre del capítulo" />

                  <div className="capitulo-info-grid">
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
                        className="input-info"
                        placeholder="420"
                      />
                    </div>
                    <div className="info-item">
                      <label>Distribución Teoría/Práctica:</label>
                      <input
                        value={cap.porcentaje_teoria_practica_capitulo || ''}
                        onChange={(e) => {
                          const nuevoTemario = JSON.parse(JSON.stringify(temario));
                          nuevoTemario.temario[capIndex].porcentaje_teoria_practica_capitulo = e.target.value;
                          setTemario(nuevoTemario);
                        }}
                        className="input-info"
                        placeholder="40% Teoría / 60% Práctica"
                      />
                    </div>
                  </div>

                  <div className="objetivos-capitulo">
                    <label>Objetivos del Capítulo:</label>
                    <textarea
                      value={Array.isArray(cap.objetivos_capitulo) ? cap.objetivos_capitulo.join('\n') : (cap.objetivos_capitulo || '')}
                      onChange={(e) => {
                        const nuevoTemario = JSON.parse(JSON.stringify(temario));
                        const objetivosTexto = e.target.value;
                        if (objetivosTexto.includes('\n')) {
                          nuevoTemario.temario[capIndex].objetivos_capitulo = objetivosTexto.split('\n').filter(obj => obj.trim());
                        } else {
                          nuevoTemario.temario[capIndex].objetivos_capitulo = objetivosTexto;
                        }
                        setTemario(nuevoTemario);
                      }}
                      className="textarea-objetivos-capitulo"
                      placeholder="Escribe los objetivos del capítulo, uno por línea"
                    />
                  </div>

                  <ul>
                    {(cap.subcapitulos || []).map((sub, subIndex) => (
                      <li key={subIndex}>
                        <input
                          value={typeof sub === 'object' ? sub.nombre : sub}
                          onChange={(e) => handleTemarioChange(capIndex, subIndex, e.target.value)}
                          className="input-subcapitulo"
                          placeholder="Nombre del subcapítulo"
                        />
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ) : (
            // --- VISTA RESUMIDA ---
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

              <h3>Temario Detallado</h3>
              {(temario.temario || []).map((cap, capIndex) => (
                <div key={capIndex} className="capitulo-resumido">
                  <input value={cap.capitulo || ''} onChange={(e) => handleTemarioChange(capIndex, null, e.target.value)} className="input-capitulo-resumido" placeholder="Nombre del capítulo" />

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

                  <div className="objetivos-capitulo-resumido">
                    <label>Objetivos del Capítulo:</label>
                    <textarea
                      value={Array.isArray(cap.objetivos_capitulo) ? cap.objetivos_capitulo.join('\n') : (cap.objetivos_capitulo || '')}
                      onChange={(e) => {
                        const nuevoTemario = JSON.parse(JSON.stringify(temario));
                        const objetivosTexto = e.target.value;
                        if (objetivosTexto.includes('\n')) {
                          nuevoTemario.temario[capIndex].objetivos_capitulo = objetivosTexto.split('\n').filter(obj => obj.trim());
                        } else {
                          nuevoTemario.temario[capIndex].objetivos_capitulo = objetivosTexto;
                        }
                        setTemario(nuevoTemario);
                      }}
                      className="textarea-objetivos-resumido"
                      placeholder="Objetivos del capítulo, uno por línea"
                    />
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
        </div>
      )}

      {/* Footer de acciones */}
      <div className="acciones-footer">
        <button onClick={() => setMostrarFormRegenerar(prev => !prev)}>Ajustar y Regenerar</button>

        <div className="acciones-sep" />

        <button onClick={abrirVersiones} className="btn-secundario">Ver versiones</button>

        <button onClick={handleSaveClick} className="btn-guardar" disabled={guardando}>
          {guardando ? 'Guardando...' : 'Guardar Versión'}
        </button>

        <div className="export-menu">
          <button className="btn-exportar" onClick={abrirExportar}>Exportar ▾</button>
        </div>
      </div>

      {/* Form Regenerar */}
      {mostrarFormRegenerar && (
        <div className="regenerar-form">
          <h4>Regenerar con Nuevos Parámetros</h4>
          <div className="form-group">
            <label>Tecnología:</label>
            <input name="tecnologia" value={params.tecnologia} onChange={handleParamsChange} placeholder="Ej: AWS Serverless, React, Python, etc." />
          </div>
          <div className="form-group">
            <label>Tema del Curso:</label>
            <input name="tema_curso" value={params.tema_curso} onChange={handleParamsChange} placeholder="Tema principal del curso" />
          </div>
          <div className="form-group">
            <label>Duración (días):</label>
            <input name="extension_curso_dias" type="number" value={params.extension_curso_dias} onChange={handleParamsChange} />
          </div>
          <div className="form-group">
            <label>Nivel de Dificultad:</label>
            <select name="nivel_dificultad" value={params.nivel_dificultad} onChange={handleParamsChange}>
              <option value="basico">Básico</option>
              <option value="intermedio">Intermedio</option>
              <option value="avanzado">Avanzado</option>
            </select>
          </div>
          <div className="form-group">
            <label>Audiencia:</label>
            <textarea name="audiencia" value={params.audiencia} onChange={handleParamsChange} placeholder="Describe la audiencia objetivo del curso" />
          </div>
          <div className="form-group">
            <label>Enfoque (Opcional):</label>
            <textarea name="enfoque" value={params.enfoque} onChange={handleParamsChange} placeholder="Enfoque específico o características especiales del curso" />
          </div>
          <button onClick={handleRegenerateClick}>Regenerar</button>
        </div>
      )}

      {/* Modal Versiones */}
      {modalVersiones && (
        <div className="modal-overlay" onClick={() => setModalVersiones(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Versiones del temario</h3>
              <button className="modal-close" onClick={() => setModalVersiones(false)}>✕</button>
            </div>
            <div className="modal-body">
              {cargandoVersiones ? (
                <div className="spinner-container">
                  <div className="spinner"></div>
                </div>
              ) : (!versiones.length ? (
                <p>No hay versiones guardadas.</p>
              ) : (
                <ul className="lista-versiones">
                  {versiones.map(v => (
                    <li key={v.versionId} className="version-item">
                      <div>
                        <div className="version-id">versionId: <code>{v.versionId}</code></div>
                        <div className="version-meta">
                          <span>fecha: {v.createdAt || '—'}</span>
                          <span> | tamaño: {v.size ?? '—'}B</span>
                          {v.isLatest ? <span> | <strong>Última</strong></span> : null}
                          {v.autorEmail ? <span> | autor: {v.autorEmail}</span> : null}
                          {v.nota ? <span> | nota: {v.nota}</span> : null}
                        </div>
                      </div>
                      <div>
                        <button className="btn-secundario" onClick={() => cargarVersion(v.versionId)}>Cargar</button>
                        <label className="chkwrap">
                          <input type="checkbox" checked={!!seleccionadas[v.versionId]} onChange={() => toggleSeleccion(v.versionId)} />
                          <span>Seleccionar</span>
                        </label>
                      </div>
                    </li>
                  ))}
                </ul>
              ))}
            </div>
            <div className="modal-footer">
              <button className="btn-secundario" onClick={() => setModalVersiones(false)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Exportar */}
      {modalExportar && (
        <div className="modal-overlay" onClick={() => setModalExportar(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Exportar</h3>
              <button className="modal-close" onClick={() => setModalExportar(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="export-row">
                <label>Formato:</label>
                <div className="export-format">
                  <label><input type="radio" name="fmt" value="pdf" checked={exportTipo === 'pdf'} onChange={() => setExportTipo('pdf')} /> PDF</label>
                  <label><input type="radio" name="fmt" value="excel" checked={exportTipo === 'excel'} onChange={() => setExportTipo('excel')} /> Excel (CSV)</label>
                </div>
              </div>

              {exportTipo === 'pdf' ? (
                <p className="hint">Se exportará la vista actualmente visible (lo que ves en pantalla) a PDF.</p>
              ) : (
                <>
                  <div className="export-row">
                    <label>¿Cuántas versiones?</label>
                    <select value={exportCount} onChange={(e) => setExportCount(e.target.value)}>
                      <option value="5">Últimas 5</option>
                      <option value="10">Últimas 10</option>
                      <option value="20">Últimas 20</option>
                      <option value="all">Todas</option>
                    </select>
                  </div>

                  <div className="export-row">
                    <label>Selecciona manualmente (opcional):</label>
                    <div className="export-list">
                      {!versiones.length ? (
                        <p>No hay versiones para listar. Abre “Ver versiones” primero para cargarlas.</p>
                      ) : (
                        <ul className="lista-versiones compacta">
                          {versiones.map(v => (
                            <li key={v.versionId} className="version-item">
                              <label className="chkwrap">
                                <input type="checkbox" checked={!!seleccionadas[v.versionId]} onChange={() => toggleSeleccion(v.versionId)} />
                                <span>
                                  <code>{v.versionId}</code> · {v.createdAt || '—'} {v.isLatest ? '· Última' : ''} {v.nota ? `· ${v.nota}` : ''}
                                </span>
                              </label>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                  <p className="hint">Si eliges manualmente, se ignorará la cantidad seleccionada arriba y se exportarán solo las marcadas.</p>
                </>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn-secundario" onClick={() => setModalExportar(false)}>Cancelar</button>
              {exportTipo === 'pdf' ? (
                <button className="btn-guardar" onClick={exportarPDF}>Exportar PDF</button>
              ) : (
                <button className="btn-guardar" onClick={exportExcelCSV}>Exportar Excel</button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default EditorDeTemario;
