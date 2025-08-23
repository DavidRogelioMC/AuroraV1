import React, { useState } from "react";
import { avatarOptions } from "../assets/avatars";

export default function AvatarSelector({ onSelect }) {
  const [selected, setSelected] = useState(null);

  const handleSelect = (avatar) => {
    setSelected(avatar);
    onSelect(avatar);
  };

  return (
    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
      {avatarOptions.map((avatar, index) => (
        <img
          key={index}
          src={avatar}
          alt="avatar"
          onClick={() => handleSelect(avatar)}
          style={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            cursor: "pointer",
            border: selected === avatar ? "3px solid #007BFF" : "2px solid gray",
          }}
        />
      ))}
    </div>
  );
}
