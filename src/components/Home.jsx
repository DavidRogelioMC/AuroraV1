// src/components/Home.jsx (CÓDIGO COMPLETO)

import React from 'react';

// Estilos para este componente (colocados aquí para que sea un solo copy-paste)
const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    height: '100vh', // Ajustamos a 100vh para que ocupe toda la altura
    padding: '2rem',
    boxSizing: 'border-box',
    width: '100%', // Para que ocupe el ancho disponible
  },
  title: {
    fontSize: '2.5em',
    color: '#1b5784',
  },
  paragraph: {
    fontSize: '1.2em',
    color: '#333',
    marginTop: '20px',
  },
};

function Home() {
  return (
    // Aplicamos la clase que le da el "margin-left" y el "padding" para el layout
    // y nuestros estilos propios del home.
    <div className="page-content-container home-container" style={styles.container}>
      <h1 style={styles.title}>Bienvenido a THOR</h1>
      <p style={styles.paragraph}>
        Comienza tu experiencia educativa interactiva con IA.<br />
        Usa la barra lateral para acceder a las opciones.
      </p>
    </div>
  );
}

export default Home;
