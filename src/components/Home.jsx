// src/components/Home.jsx
function Home() {
  return (
    <div
      style={{
        marginLeft: '10cm', // espacio para el sidebar
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        backgroundColor: '#f5f9ff',
        fontFamily: 'Segoe UI, Tahoma, sans-serif',
      }}
    >
      <div>
        <h1 style={{ fontSize: '2.5em', color: '#1b5784' }}>Bienvenido a AURORA</h1>
        <p style={{ fontSize: '1.2em', color: '#333', marginTop: '10px' }}>
          Comienza tu experiencia educativa interactiva con IA.<br />
          Usa la barra lateral para acceder a las opciones.
        </p>
      </div>
    </div>
  );
}

export default Home;
