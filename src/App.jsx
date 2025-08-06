import React, { useEffect, useState } from 'react';
import { Amplify, Auth } from 'aws-amplify';
import awsExports from './aws-exports';
import Sidebar from './Sidebar';
import './App.css';

Amplify.configure(awsExports);

function App() {
  const [user, setUser] = useState(null);
  const [rol, setRol] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await Auth.currentAuthenticatedUser({ bypassCache: true }); // fuerza token nuevo
        setUser(currentUser);

        const userRol = currentUser.attributes['custom:rol'] || 'participant';
        setRol(userRol);
      } catch (error) {
        console.error("Error al obtener usuario:", error);
        setUser(null);
        setRol(null);
      }
    };

    fetchUser();
  }, []);

  return (
    <div className="App">
      <Sidebar user={user} rol={rol} />
      <div className="main-content">
        <h1>Bienvenido a THOR</h1>
        <p>Comienza tu experiencia educativa interactiva con IA.</p>
        <p>Usa la barra lateral para acceder a las opciones.</p>
      </div>
    </div>
  );
}

export default App;

