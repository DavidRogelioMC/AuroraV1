// src/components/QuizActivity.jsx

import React, { useState, useEffect } from 'react';
import './QuizActivity.css'; // Asegúrate de que este archivo CSS exista

// Componente para una sola pregunta del quiz
function QuizQuestion({ bloqueTexto, index, onRespuesta, respuestaUsuario, mostrarResultado }) {
  const [pregunta, setPregunta] = useState('');
  const [opciones, setOpciones] = useState([]);
  const [respuestaCorrecta, setRespuestaCorrecta] = useState('');

  // Esta es la lógica clave: procesar el bloque de texto cuando llega
  useEffect(() => {
    const lineas = bloqueTexto.split('\n').map(l => l.trim()).filter(l => l);
    if (lineas.length > 0) {
      setPregunta(lineas[0].split('.', 1).slice(1).join('.').trim());
      
      const opcionesParseadas = [];
      let respuestaCorrectaParseada = '';
      
      lineas.slice(1).forEach(linea => {
        let textoOpcion = linea.split(')', 1).slice(1).join(')').trim();
        if (linea.startsWith('*')) {
          respuestaCorrectaParseada = textoOpcion;
        }
        opcionesParseadas.push(textoOpcion);
      });
      
      setOpciones(opcionesParseadas);
      setRespuestaCorrecta(respuestaCorrectaParseada);
    }
  }, [bloqueTexto]); // Se ejecuta cada vez que el texto del bloque cambia

  const getOpcionClassName = (opcion) => {
    if (!mostrarResultado) {
      return respuestaUsuario === opcion ? 'opcion-seleccionada' : '';
    }
    if (opcion === respuestaCorrecta) return 'opcion-correcta';
    if (respuestaUsuario === opcion) return 'opcion-incorrecta';
    return 'btn-deshabilitado';
  };

  return (
    <div className="pregunta-quiz">
      <h3>{index + 1}. {pregunta}</h3>
      <div className="opciones-quiz">
        {opciones.map((opcion, i) => (
          <button
            key={i}
            className={`btn-opcion ${getOpcionClassName(opcion)}`}
            onClick={() => !mostrarResultado && onRespuesta(opcion)}
            disabled={mostrarResultado}
          >
            {opcion}
          </button>
        ))}
      </div>
    </div>
  );
}

// Componente principal que recibe los datos de la Lambda
function QuizActivity({ data }) {
  const [respuestasUsuario, setRespuestasUsuario] = useState({});
  const [mostrarResultados, setMostrarResultados] = useState(false);
  const [puntuacion, setPuntuacion] = useState(0);

  const handleRespuesta = (preguntaIndex, respuesta) => {
    setRespuestasUsuario(prev => ({ ...prev, [preguntaIndex]: respuesta }));
  };

  const calificarActividad = () => {
    let correctas = 0;
    data.forEach((item, index) => {
      // Para calificar, también necesitamos procesar la respuesta correcta del texto original
      const lineas = item.texto.split('\n');
      const lineaCorrecta = lineas.find(l => l.trim().startsWith('*'));
      if (lineaCorrecta) {
        const respuestaCorrecta = lineaCorrecta.split(')', 1).slice(1).join(')').trim();
        if (respuestasUsuario[index] === respuestaCorrecta) {
          correctas++;
        }
      }
    });
    setPuntuacion(correctas);
    setMostrarResultados(true);
  };

  const reiniciarQuiz = () => {
    setRespuestasUsuario({});
    setMostrarResultados(false);
    setPuntuacion(0);
  };

  return (
    <div className="interactive-activity">
      {data.map((item, index) => (
        <QuizQuestion
          key={index}
          index={index}
          bloqueTexto={item.texto}
          onRespuesta={(respuesta) => handleRespuesta(index, respuesta)}
          respuestaUsuario={respuestasUsuario[index]}
          mostrarResultado={mostrarResultados}
        />
      ))}
      <div className="activity-footer">
        {!mostrarResultados ? (
          <button onClick={calificarActividad} disabled={Object.keys(respuestasUsuario).length !== data.length} className="btn-revisar">
            Calificar
          </button>
        ) : (
          <div className="resultado-y-reinicio">
            <div className="resultado-final">Tu puntuación: {puntuacion} de {data.length}</div>
            <button onClick={reiniciarQuiz} className="btn-reiniciar">🔄 Intentar de nuevo</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default QuizActivity;
