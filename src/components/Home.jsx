// src/components/Home.jsx (CÓDIGO COMPLETO)

import React from 'react';

// Ya no necesitamos estilos en línea para el contenedor aquí.
// Los estilos los gestiona 'index.css' con la clase '.home-container'
function Home() {
  return (
    <div className="home-container">
      <h1>Bienvenido a THOR</h1>
      <p>
        Comienza tu experiencia educativa interactiva con IA.<br />
        Usa la barra lateral para acceder a las opciones.
      </p>
    </div>
  );
}

export default Home;
