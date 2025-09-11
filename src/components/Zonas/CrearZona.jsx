
import React, { useState, useEffect } from "react";
import { Typography, TextField, Button, Box, Alert, MenuItem } from "@mui/material";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL;

const CrearZona = () => {
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [torneoId, setTorneoId] = useState("");
  const [torneos, setTorneos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    axios.get(`${API_BASE}/torneos/activos`).then((res) => setTorneos(res.data));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await axios.post(`${API_BASE}/zonas`, { nombre, descripcion, torneoId });
      setSuccess("Zona creada correctamente.");
      setNombre("");
      setDescripcion("");
    } catch (err) {
      setError("Error al crear la zona.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Crear Nueva Zona</Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          select
          label="Torneo"
          value={torneoId}
          onChange={e => setTorneoId(e.target.value)}
          fullWidth
          required
          sx={{ mb: 2 }}
        >
          {torneos.map((t) => (
            <MenuItem key={t.id} value={t.id}>{t.nombre}</MenuItem>
          ))}
        </TextField>
        <TextField
          label="Nombre"
          value={nombre}
          onChange={e => setNombre(e.target.value)}
          fullWidth
          required
          sx={{ mb: 2 }}
        />
        <TextField
          label="Descripción"
          value={descripcion}
          onChange={e => setDescripcion(e.target.value)}
          fullWidth
          multiline
          rows={2}
          sx={{ mb: 2 }}
        />
        <Button type="submit" variant="contained" color="primary" disabled={loading}>
          {loading ? "Creando..." : "Crear Zona"}
        </Button>
      </form>
      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}
    </Box>
  );
};

export default CrearZona;
