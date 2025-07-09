// src/components/ActividadesPage.jsx (CÓDIGO COMPLETO)

import { useState } from 'react';
import GeneradorActividades from './GeneradorActividades'; // Importa el generador

// Asumimos que este CSS es un archivo separado para ActividadesPage
import './ActividadesPage.css'; 

const tiposDeActividad = [
  { id: 'quiz', nombre: 'Opción Múltiple', icono: '❓' },
  { id: 'fill', nombre: 'Completar Espacios', icono: '✏️' },
  { id: 'truefalse', nombre: 'Verdadero o Falso', icono: '✅' },
  { id: 'match', nombre: 'Emparejamiento', icono: '🔗' },
];

function ActividadesPage({ token }) {
  const [tipoSeleccionado, setTipoSeleccionado] = useState(null);

  // Si no se ha seleccionado un tipo, muestra los botones de selección
  if (!tipoSeleccionado) {
    return (
      // Aplica la clase de layout general y la específica de esta página
      <div className="page-content-container seleccion-actividad-container">
        <h1>Generador de Actividades</h1>
        <p>Elige el tipo de ejercicio interactivo que deseas crear a partir de tus documentos.</p>
        <div className="botones-actividad">
          {tiposDeActividad.map((tipo) => (
            <button key={tipo.id} className="btn-tipo-actividad" onClick={() => setTipoSeleccionado(tipo.id)}>
              <span className="icono-actividad">{tipo.icono}</span>
              <span>{tipo.nombre}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Si ya se seleccionó un tipo, muestra el generador
  return (
    // Aplica la clase de layout general y la específica de esta vista
    <div className="page-content-container pagina-generador">
      <button className="btn-volver" onClick={() => setTipoSeleccionado(null)}>
        ← Volver a seleccionar tipo
      </button>
      <GeneradorActividades token={token} tipoActividad={tipoSeleccionado} />
    </div>
  );
}

export default ActividadesPage;
