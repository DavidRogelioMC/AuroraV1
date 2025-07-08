// src/components/Home.jsx (CÓDIGO COMPLETO)

import React from 'react'; // Buena práctica importar React

// Estilos CSS para este componente específico
// Es mejor poner esto en un archivo Home.css, pero para simplicidad, lo ponemos aquí.
const styles = {
  homeContainer: {
    width: '100%',
    minHeight: '100vh',
    backgroundColor: '#f5f9ff',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontFamily: 'Segoe UI, Tahoma, sans-serif',
    boxSizing: 'border-box',
    textAlign: 'center',
  },
  title: {
    fontSize: '2.5em',
    color: '#1b5784',
  },
  paragraph: {
    fontSize: '1.2em',
    color: '#333',
    marginTop: '20px', // Reducido el margen excesivo
  },
};


function Home() {
  // El 'paddingLeft' se elimina porque ahora lo maneja el 'margin-left' del contenedor padre
  return (
    <div style={styles.homeContainer}>
      <div>
        <h1 style={styles.title}>Bienvenido a THOR</h1>
        <p style={styles.paragraph}>
          Comienza tu experiencia educativa interactiva con IA.<br />
          Usa la barra lateral para acceder a las opciones.
        </p>
      </div>
    </div>
  );
}

export default Home;
