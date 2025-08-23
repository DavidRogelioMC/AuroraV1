// ...imports existentes...
// Asegúrate de tener el mismo API_BASE que ya usas en Sidebar

useEffect(() => {
  let cancelled = false;

  async function pintarFoto() {
    try {
      // 1) si Cognito.picture ya trae una URL válida, úsala
      const u = await Auth.currentAuthenticatedUser({ bypassCache: true });
      const pic = u?.attributes?.picture || "";
      if (/^https?:\/\//i.test(pic)) {
        if (!cancelled) setAvatar(pic);
        return;
      }
    } catch {}

    // 2) si no, consulta a tu backend
    try {
      const token = localStorage.getItem("id_token");
      if (!token) return;
      const r = await fetch(`${API_BASE}/perfil`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!r.ok) return;
      const d = await r.json();
      if (!cancelled && d?.photoUrl) setAvatar(d.photoUrl);
    } catch {}
  }

  pintarFoto();

  // Escucha actualizaciones provenientes del Modal
  const onUpd = (e) => {
    const url = e.detail?.photoUrl;
    if (url) setAvatar(url);
  };
  window.addEventListener("profilePhotoUpdated", onUpd);

  return () => {
    cancelled = true;
    window.removeEventListener("profilePhotoUpdated", onUpd);
  };
}, []);

