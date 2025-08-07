import './AdminPage.css';
import { useState } from 'react';
import axios from 'axios';

function AdminPage() {
  const [email, setEmail] = useState('');

  const handleSubmit = async () => {
    try {
      const response = await axios.post('https://h6ysn7u0tl.execute-api.us-east-1.amazonaws.com/dev2/solicitar-rol-creador', {
        email,
      });
      alert(response.data.message || 'Solicitud enviada con éxito');
      setEmail('');
    } catch (error) {
      console.error('Error al solicitar rol de creador', error);
      alert('Hubo un error al enviar la solicitud');
    }
  };

  return (
    <div className="admin-container">
      <h1>👑 Panel de Administración</h1>
      <p>Aquí puedes solicitar el rol de creador para un usuario autorizado.</p>

      <input
        type="email"
        placeholder="Correo del usuario autorizado"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="admin-input"
      />
      <button onClick={handleSubmit} className="admin-button">
        📩 Solicitar Rol de Creador
      </button>

      <hr />

      <h2>📋 Solicitudes Recientes</h2>
      <p>Próximamente verás aquí las solicitudes pendientes para aprobar o rechazar.</p>
    </div>
  );
}

export default AdminPage;
