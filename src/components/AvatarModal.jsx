import { useState, useEffect } from "react";
import { Auth, Hub } from "aws-amplify";
import { avatarOptions } from "../assets/avatars";

export default function AvatarModal({ isOpen, onClose }) {
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [error, setError] = useState("");

  // Primer useEffect: Revisión de sesión con retardo
  useEffect(() => {
    const timer = setTimeout(() => {
      Auth.currentSession()
        .then(session => console.log("🟢 Sesión válida (revisada tarde):", session))
        .catch(err => console.log("🔴 No hay sesión (revisada tarde):", err));
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Segundo useEffect: Escucha de eventos y verificación inmediata
  useEffect(() => {
    const checkUser = async () => {
      try {
        const session = await Auth.currentSession();
        console.log("🟢 Sesión válida (checkUser):", session);
      } catch (error) {
        console.log("🔴 No hay sesión activa (checkUser):", error);
      }
    };

    checkUser();

    const listener = (data) => {
      if (data.payload.event === "signIn") {
        console.log("✅ Usuario logueado (Hub)");
      }
      if (data.payload.event === "signOut") {
        console.log("👋 Usuario salió (Hub)");
      }
    };

    Hub.listen("auth", listener);
    return () => Hub.remove("auth", listener);
  }, []);

  const handleSave = async () => {
    try {
      const session = await Auth.currentSession().catch(() => null);
      if (!session) {
        setError("⚠️ La sesión expiró. Cierra sesión e inicia nuevamente.");
        return;
      }

      const user = await Auth.currentAuthenticatedUser({ bypassCache: false });
      console.log("✅ Usuario autenticado:", user);
      console.log("🔎 Avatar seleccionado:", selectedAvatar);

      await Auth.updateUserAttributes(user, {
        picture: selectedAvatar
      });

      setError("");
      alert("✅ Avatar actualizado correctamente");
      onClose();
    } catch (err) {
      console.error("❌ Error al actualizar avatar:", err);
      setError("Error al actualizar avatar");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal">
      <h2>Elige tu avatar</h2>

      <div className="avatar-grid">
        {avatarOptions.map((avatar) => (
          <img
            key={avatar}
            src={avatar}
            alt="avatar"
            onClick={() => setSelectedAvatar(avatar)}
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              border: selectedAvatar === avatar ? "3px solid blue" : "2px solid gray",
              cursor: "pointer",
            }}
          />
        ))}
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <button onClick={handleSave}>Guardar</button>
      <button onClick={onClose}>Cerrar</button>
    </div>
  );
}
