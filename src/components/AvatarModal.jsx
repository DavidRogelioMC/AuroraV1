import React, { useState } from "react";
import AvatarSelector from "./AvatarSelector";
import { Auth } from "aws-amplify";

export default function AvatarModal({ isOpen, onClose }) {
  const [message, setMessage] = useState("");

  if (!isOpen) return null; // Si no está abierto, no renderiza nada

  const handleAvatarSelect = async (avatarUrl) => {
    try {
      const user = await Auth.currentAuthenticatedUser();
      await Auth.updateUserAttributes(user, { picture: avatarUrl });
      setMessage("✅ Avatar actualizado correctamente");
      setTimeout(() => {
        setMessage("");
        onClose(); // Cierra el modal después de actualizar
      }, 1000);
    } catch (error) {
      console.error(error);
      setMessage("❌ Error al actualizar avatar");
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          background: "white",
          padding: "20px",
          borderRadius: "10px",
          maxWidth: "500px",
          textAlign: "center",
        }}
      >
        <h2>Elige tu avatar</h2>
        <AvatarSelector onSelect={handleAvatarSelect} />
        <p>{message}</p>
        <button onClick={onClose}>Cerrar</button>
      </div>
    </div>
  );
}
