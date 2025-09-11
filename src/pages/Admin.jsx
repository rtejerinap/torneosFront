import React, { useState } from "react";
import { Typography, Box, Chip, Button, Modal, TextField } from "@mui/material";
import { useAuth } from "../context/AuthContext";
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import { auth } from "../firebase";

const Admin = () => {
  const { usuario, perfil, rol } = useAuth();
  const [openModal, setOpenModal] = useState(false);
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [repeatPass, setRepeatPass] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Detectar si el usuario es Google
  const isGoogleUser = usuario?.providerData?.[0]?.providerId === 'google.com';

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (newPass !== repeatPass) {
      setError("Las contraseñas nuevas no coinciden");
      return;
    }
    try {
      const email = usuario.email;
      const credential = EmailAuthProvider.credential(email, oldPass);
      await reauthenticateWithCredential(auth.currentUser, credential);
      await updatePassword(auth.currentUser, newPass);
      setSuccess("Contraseña actualizada correctamente");
      setOpenModal(false);
      setOldPass(""); setNewPass(""); setRepeatPass("");
    } catch (err) {
      setError("Error al cambiar la contraseña: " + (err?.message || JSON.stringify(err)));
    }
  };

  const isPasswordValid = newPass.length >= 6 && newPass === repeatPass;

  return (
    <div>
      <Typography variant="h5" gutterBottom>
        Bienvenido al panel de administración
      </Typography>
      <Typography variant="body1" gutterBottom>
        Usá el menú lateral para gestionar torneos, participantes, escuelas y más.
      </Typography>
      {usuario ? (
        <Box sx={{ mt: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 2, maxWidth: 500 }}>
          <Typography variant="h6" gutterBottom>Información de usuario</Typography>
          <Typography><b>Usuario:</b> {perfil?.documento || usuario?.displayName || usuario?.uid}</Typography>
          <Typography sx={{ mt: 1 }}><b>Roles:</b> {rol ? rol.map(r => <Chip key={r} label={r} sx={{ mr: 1, fontSize: 18, height: 32 }} size="medium" />) : "Sin rol"}</Typography>
          {/* Solo mostrar el botón si NO es usuario Google */}
          {!isGoogleUser && (
            <Button variant="outlined" sx={{ mt: 2 }} onClick={() => setOpenModal(true)}>
              Cambiar contraseña
            </Button>
          )}
        </Box>
      ) : (
        <Box sx={{ mt: 5, p: 3, bgcolor: '#fffbe6', borderRadius: 2, maxWidth: 500, textAlign: 'center', border: '1px solid #ffe082' }}>
          <Typography variant="h6" color="warning.main">No se encontró información de usuario.</Typography>
          <Typography>Verifica que estés logueado correctamente.</Typography>
        </Box>
      )}
      <Modal open={openModal} onClose={() => setOpenModal(false)}>
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: '#fff', boxShadow: 24, borderRadius: 2, p: 3, minWidth: 350 }}>
          <Typography variant="h6" gutterBottom>Cambiar contraseña</Typography>
          <form onSubmit={handleChangePassword}>
            <TextField
              label="Contraseña actual"
              type="password"
              value={oldPass}
              onChange={e => setOldPass(e.target.value)}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Nueva contraseña"
              type="password"
              value={newPass}
              onChange={e => setNewPass(e.target.value)}
              fullWidth
              margin="normal"
              required
              error={newPass.length > 0 && newPass.length < 6}
              helperText={newPass.length > 0 && newPass.length < 6 ? "La contraseña debe tener al menos 6 caracteres" : ""}
            />
            <TextField
              label="Repetir nueva contraseña"
              type="password"
              value={repeatPass}
              onChange={e => setRepeatPass(e.target.value)}
              fullWidth
              margin="normal"
              required
            />
            {error && <Typography color="error" sx={{ mt: 1 }}>{error}</Typography>}
            {success && <Typography color="success.main" sx={{ mt: 1 }}>{success}</Typography>}
            <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }} disabled={!isPasswordValid}>
              Actualizar
            </Button>
          </form>
        </Box>
      </Modal>
    </div>
  );
};

export default Admin;
