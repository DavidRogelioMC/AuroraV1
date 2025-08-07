import React, { useState, useEffect } from 'react';

function obtenerRolDesdeToken() {
  const token = localStorage.getItem("id_token");
  if (!token) return null;

  const payloadBase64 = token.split('.')[1];
  const decodedPayload = JSON.parse(atob(payloadBase64));
  return decodedPayload["custom:rol"]; // Ej: "admin", "admin,creador"
}

function SolicitarRolCreadorAdmin() {
  const [rol, setRol] = useState('');
  const [correo, setCorreo] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    const rolActual = obtenerRolDesdeToken();
    setRol(rolActual);
  }, []);

  const handleEnviar = async () => {
    if (!correo) {
      setMensaje("⚠️ Ingresa un correo válido.");
      return;
    }

    setEnviando(true);
    const token = localStorage.getItem("id_token");

    try {
      const res = await fetch("https://h6ysn7u0tl.execute-api.us-east-1.amazonaws.com/dev2/solicitar-rol", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token
        },
        body: JSON.stringify({ correo })
      });

      const data = await res.json();
      setMensaje(data.message || "✅ Solicitud enviada.");
    } catch (error) {
      console.error("❌ Error al enviar solicitud:", error);
      setMensaje("❌ Error al enviar solicitud.");
    } finally {
      setEnviando(false);
    }
  };

  if (!rol?.includes("admin")) return null;

  return (
    <div className="p-4 border rounded-xl shadow-lg max-w-md mx-auto my-4 bg-white">
      <h2 className="text-lg font-bold mb-2">Solicitar rol de creador para un usuario</h2>
      <input
        type="email"
        placeholder="Correo del usuario"
        value={correo}
        onChange={(e) => setCorreo(e.target.value)}
        className="w-full px-3 py-2 border rounded mb-2"
      />
      <button
        onClick={handleEnviar}
        disabled={enviando}
        className="bg-[#035b6e] text-white px-4 py-2 rounded hover:bg-[#023846] transition w-full"
      >
        {enviando ? "Enviando..." : "Solicitar rol de creador"}
      </button>
      {mensaje && <p className="mt-2 text-green-700">{mensaje}</p>}
    </div>
  );
}

export default SolicitarRolCreadorAdmin;
