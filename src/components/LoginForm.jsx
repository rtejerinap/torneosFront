import React, { useState } from "react";
import { auth, googleProvider } from "../firebase";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { Button, TextField, Box, Typography, Divider } from "@mui/material";

const LoginForm = ({ onLoginSuccess }) => {
  const [documento, setDocumento] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const email = documento ? `${documento}@taekwondo.com` : "";

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      if (onLoginSuccess) onLoginSuccess();
    } catch (err) {
      setError("Usuario o contraseña incorrectos");
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    try {
      await signInWithPopup(auth, googleProvider);
      if (onLoginSuccess) onLoginSuccess();
    } catch (err) {
      setError("Error al ingresar con Google");
    }
  };

  return (
    <Box sx={{ maxWidth: 400, mx: "auto", mt: 4, p: 3, boxShadow: 2, borderRadius: 2, bgcolor: "#fff" }}>
      <Typography variant="h5" align="center" gutterBottom>Ingreso de Usuario</Typography>
      <form onSubmit={handleLogin}>
        <TextField
          label="Documento"
          value={documento}
          onChange={e => setDocumento(e.target.value)}
          fullWidth
          margin="normal"
          required
        />
        <TextField
          label="Contraseña"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          fullWidth
          margin="normal"
          required
        />
        <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>Ingresar</Button>
      </form>
      <Divider sx={{ my: 3 }}>O</Divider>
      <Button variant="contained" color="success" fullWidth onClick={handleGoogleLogin}>
        Ingresar con Google
      </Button>
      {error && <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>}
    </Box>
  );
};

export default LoginForm;
