// src/components/VistaPreviaTemario.jsx

import React from 'react';
import './VistaPreviaTemario.css'; // Crearemos este archivo CSS a continuación

// Pequeña función de ayuda para renderizar texto que puede contener <br/>
const renderWithLineBreaks = (text) => {
  return text.split('<br/>').map((line, index, array) => (
    <React.Fragment key={index}>
      {line}
      {index < array.length - 1 && <br />}
    </React.Fragment>
  ));
};

function VistaPreviaTemario({ temario }) {
  if (!temario) {
    return null;
  }

  return (
    <div className="temario-vista-previa">
      {/* --- SECCIÓN DE ENCABEZADO --- */}
      <h1 className="curso-titulo">{temario.nombre_curso}</h1>
      <div className="info-grid">
        <div className="info-item">
          <span className="info-label">Versión</span>
          <span className="info-value">{temario.version_tecnologia}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Horas Totales</span>
          <span className="info-value">{temario.horas_totales}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Sesiones</span>
          <span className="info-value">{temario.numero_sesiones}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Soporte (EOL)</span>
          <span className="info-value">{temario.EOL}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Distribución General</span>
          <span className="info-value">{temario.porcentaje_teoria_practica_general}</span>
        </div>
      </div>

      {/* --- SECCIÓN DE DESCRIPCIÓN Y OBJETIVOS --- */}
      <div className="descripcion-seccion">
        <h2>Descripción General</h2>
        <p>{temario.descripcion_general}</p>
      </div>
      <div className="descripcion-seccion">
        <h2>Objetivos</h2>
        <ul>
          {(temario.objetivos || []).map((obj, i) => <li key={i}>{obj}</li>)}
        </ul>
      </div>
      <div className="descripcion-seccion">
        <h2>Audiencia</h2>
        <p>{temario.audiencia}</p>
      </div>
      <div className="descripcion-seccion">
        <h2>Prerrequisitos</h2>
        <p>{temario.prerrequisitos}</p>
      </div>

      {/* --- SECCIÓN DEL TEMARIO DETALLADO --- */}
      <h2>Temario Detallado</h2>
      {(temario.temario || []).map((cap, index) => (
        <div key={index} className="capitulo-container">
          <div className="capitulo-header">
            <h3>{cap.capitulo}</h3>
            <div className="capitulo-stats">
              <span>Duración: <strong>{cap.tiempo_capitulo_min} min</strong></span>
              <span>Distribución: <strong>{cap.porcentaje_teoria_practica_capitulo}</strong></span>
            </div>
          </div>
          <table className="subcapitulos-tabla">
            <thead>
              <tr>
                <th>Tema</th>
                <th>Sesión</th>
                <th>Duración</th>
              </tr>
            </thead>
            <tbody>
              {(cap.subcapitulos || []).map((sub, subIndex) => {
                const esPractico = sub.nombre.toLowerCase().includes('laboratorio') || sub.nombre.toLowerCase().includes('caso práctico') || sub.nombre.toLowerCase().includes('proyecto');
                return (
                  <tr key={subIndex} className={esPractico ? 'subcapitulo-practico' : ''}>
                    <td>{renderWithLineBreaks(sub.nombre)}</td>
                    <td>{sub.sesion}</td>
                    <td>{sub.tiempo_subcapitulo_min} min</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}

export default VistaPreviaTemario;
