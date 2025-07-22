import { useState } from 'react';
import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(true); // Simula que ya inició sesión
  const [rol, setRol] = useState(null); // null, 'admin' o 'participant'

  const handleRolSeleccionado = (rolSeleccionado) => {
    setRol(rolSeleccionado);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setRol(null);
    // Aquí pondrías la lógica real para cerrar sesión en Cognito
  };

  if (!isLoggedIn) {
    return (
      <div className="rol-selector-container">
        <h2>Por favor inicia sesión</h2>
        {/* Aquí iría el formulario real de login */}
      </div>
    );
  }

  if (!rol) {
    return (
      <div className="rol-selector-container">
        <h2>Selecciona tu rol</h2>
        <button className="rol-selector-btn admin" onClick={() => handleRolSeleccionado('admin')}>
          Soy Admin
        </button>
        <button className="rol-selector-btn participant" onClick={() => handleRolSeleccionado('participant')}>
          Soy Participante
        </button>
      </div>
    );
  }

  return (
    <div className="App">
      <button id="logout" onClick={handleLogout}>
        Cerrar sesión
      </button>
      {rol === 'admin' && <h1>Bienvenida Admin</h1>}
      {rol === 'participant' && <h1>Bienvenida Participante</h1>}
    </div>
  );
}

export default App;
