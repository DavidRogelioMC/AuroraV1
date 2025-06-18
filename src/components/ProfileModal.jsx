// src/components/ProfileModal.jsx
import './ProfileModal.css';
import defaultFoto from '../assets/default.jpg';
import { useState } from 'react';

function ProfileModal({ token }) {
  const [visible, setVisible] = useState(false);
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [foto, setFoto] = useState(defaultFoto);
  const [archivo, setArchivo] = useState(null);

  const perfilUrl = import.meta.env.VITE_API_UPLOAD;

  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setArchivo(file);
    const reader = new FileReader();
    reader.onload = (e) => setFoto(e.target.result);
    reader.readAsDataURL(file);
  };

  const parseJwt = (token) => {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  };

  const subirFotoAS3 = async () => {
    const userId = parseJwt(token).sub;
    const nombreArchivo = `${userId}.jpg`;

    const presign = await fetch(perfilUrl, {
      method: 'POST',
      headers: {
        Authorization: token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fileName: nombreArchivo,
        fileType: archivo.type,
      }),
    });

    const data = await presign.json();
    const res = await fetch(data.url, {
      method: 'PUT',
      headers: { 'Content-Type': archivo.type },
      body: archivo,
    });

    if (!res.ok) throw new Error('Error al subir a S3');
    return data.url.split('?')[0];
  };

  const guardarPerfil = async () => {
    try {
      const fotoUrl = archivo ? await subirFotoAS3() : foto;
      document.getElementById('fotoPerfilSidebar').src = fotoUrl;
      document.getElementById('nombreSidebar').textContent = nombre || 'Usuario';
      document.getElementById('emailSidebar').textContent = email || 'usuario@ejemplo.com';
      alert('✅ Perfil guardado correctamente');
      setVisible(false);
    } catch {
      alert('❌ Error al guardar perfil');
    }
  };

  return (
    <>
      <div id="modalPerfil" style={{ display: visible ? 'block' : 'none' }}>
        <h3>Mi perfil</h3>
        <div className="foto-container">
          <img id="previewFoto" src={foto} alt="Foto perfil" />
          <br />
          <input type="file" id="inputFoto" accept="image/*" onChange={handleFotoChange} />
        </div>
        <label>Nombre:</label>
        <input type="text" id="nombrePerfil" placeholder="Tu nombre" onChange={(e) => setNombre(e.target.value)} />
        <label>Email:</label>
        <input type="email" id="emailPerfil" placeholder="Correo electrónico" onChange={(e) => setEmail(e.target.value)} />
        <div className="botones">
          <button id="guardarPerfil" onClick={guardarPerfil}>💾 Guardar</button>
          <button id="cerrarPerfil" onClick={() => setVisible(false)}>❌</button>
        </div>
      </div>
      <img
        id="fotoPerfilSidebar"
        src={foto}
        alt="Foto perfil"
        onClick={() => setVisible(true)}
        style={{ display: 'none' }} // Se reemplaza por el que está en Sidebar
      />
    </>
  );
}

export default ProfileModal;
