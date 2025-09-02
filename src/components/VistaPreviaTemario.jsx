// src/components/VistaPreviaTemario.jsx (VERSIÓN FINAL Y CORREGIDA)

import React from 'react';
import './VistaPreviaTemario.css';

// Función de ayuda para renderizar texto que puede contener <br/>
const renderWithLineBreaks = (text) => {
  if (typeof text !== 'string') return text;
  return text.split('<br/>').map((line, index, array) => (
    <React.Fragment key={index}>
      {line}
      {index < array.length - 1 && <br />}
    </React.Fragment>
  ));
};

function VistaPreviaTemario({ temario }) {
  if (!temario || Object.keys(temario).length === 0) {
    return <div className="temario-vista-previa"><p>No hay datos de temario para mostrar.</p></div>;
  }

  return (
    <div className="temario-vista-previa">
      {/* --- SECCIÓN DE ENCABEZADO --- */}
      <h1 className="curso-titulo">{temario.nombre_curso}</h1>
      <p className="version-tecnologia">Versión de la Tecnología: {temario.version_tecnologia}</p>
      
      <ul className="info-lista">
        <li><strong>Horas Totales:</strong> {temario.horas_totales}</li>
        <li><strong>Sesiones:</strong> {temario.numero_sesiones}</li>
        <li><strong>Soporte (EOL):</strong> {temario.EOL}</li>
        <li><strong>Distribución General:</strong> {temario.porcentaje_teoria_practica_general}</li>
      </ul>

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
          <h3 className="capitulo-titulo">{cap.capitulo}</h3>
          <ul className="info-lista-capitulo">
            <li><strong>Duración Estimada:</strong> {Math.floor(cap.tiempo_capitulo_min / 60)} horas ({cap.tiempo_capitulo_min} min)</li>
            <li><strong>Distribución:</strong> {cap.porcentaje_teoria_practica_capitulo}</li>
          </ul>

          {/* --- LA TABLA CORREGIDA --- */}
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
                const esPractico = typeof sub.nombre === 'string' && (
                  sub.nombre.toLowerCase().includes('laboratorio') ||
                  sub.nombre.toLowerCase().includes('caso práctico') ||
                  sub.nombre.toLowerCase().includes('proyecto')
                );
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
