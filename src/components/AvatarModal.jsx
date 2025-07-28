import { Auth } from "aws-amplify";
import avatarOptions from "../assets/avatars"; // Ajusta la ruta si es distinta

export default function AvatarModal({ isOpen, onClose }) {
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [error, setError] = useState("");

  const handleSave = async () => {
    try {
      const user = await Auth.currentAuthenticatedUser({ bypassCache: true });

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
