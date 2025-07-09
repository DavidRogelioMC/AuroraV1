// src/components/TrueFalseActivity.jsx

import React, { useState } from 'react';
import './TrueFalseActivity.css'; // Importamos su CSS

function TrueFalseStatement({ afirmacion, respuesta, seleccion, onSeleccion, mostrarResultado }) {
  
  const getButtonClassName = (valor) => {
    if (!mostrarResultado) {
      return seleccion === valor ? 'btn-seleccionado' : '';
    }
    if (valor === respuesta) {
      return 'btn-correcto';
    }
    if (seleccion === valor && valor !== respuesta) {
      return 'btn-incorrecto';
    }
    return 'btn-deshabilitado';
  };

  return (
    <div className="afirmacion-vf">
      <p className="texto-afirmacion">{afirmacion}</p>
      <div className="botones-vf">
        <button
          className={`btn-vf ${getButtonClassName(true)}`}
          onClick={() => !mostrarResultado && onSeleccion(true)}
          disabled={mostrarResultado}
        >
          Verdadero
        </button>
        <button
          className={`btn-vf ${getButtonClassName(false)}`}
          onClick={() => !mostrarResultado && onSeleccion(false)}
          disabled={mostrarResultado}
        >
          Falso
        </button>
      </div>
    </div>
  );
}

function TrueFalseActivity({ data }) {
  const [respuestasUsuario, setRespuestasUsuario] = useState({});
  const [mostrarResultados, setMostrarResultados] = useState(false);
  const [puntuacion, setPuntuacion] = useState(0);

  const handleSeleccion = (index, valor) => {
    setRespuestasUsuario(prev => ({
      ...prev,
      [index]: valor
    }));
  };

  const calificarActividad = () => {
    let correctas = 0;
    data.forEach((item, index) => {
      if (respuestasUsuario[index] === item.respuesta) {
        correctas++;
      }
    });
    setPuntuacion(correctas);
    setMostrarResultados(true);
  };

  return (
    <div className="true-false-activity">
      {data.map((item, index) => (
        <TrueFalseStatement
          key={index}
          afirmacion={item.afirmacion}
          respuesta={item.respuesta}
          seleccion={respuestasUsuario[index]}
          onSeleccion={(valor) => handleSeleccion(index, valor)}
          mostrarResultado={mostrarResultados}
        />
      ))}
      <div className="vf-footer">
        {!mostrarResultados && (
          <button onClick={calificarActividad} disabled={Object.keys(respuestasUsuario).length !== data.length} className="btn-revisar">
            Calificar
          </button>
        )}
        {mostrarResultados && (
          <div className="resultado-final">
            Tu puntuación: {puntuacion} de {data.length}
          </div>
        )}
      </div>
    </div>
  );
}

export default TrueFalseActivity;
