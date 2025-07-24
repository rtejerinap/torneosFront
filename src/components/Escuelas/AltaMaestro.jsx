// src/pages/AltaMaestro.jsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Grid,
  TextField,
  MenuItem,
  Typography,
} from "@mui/material";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL;

const grados = [
  "4º Dan",
  "5º Dan",
  "6º Dan",
  "7º Dan",
  "8º Dan",
  "9º Dan",
];

const AltaMaestro = () => {
  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    graduacion: "",
    provinciaId: "",
    paisId: "",
  });

  const [paises, setPaises] = useState([]);
  const [provincias, setProvincias] = useState([]);

  useEffect(() => {
    const fetchDatos = async () => {
      try {
        const [resPaises, resProvincias] = await Promise.all([
          axios.get(`${API_BASE}/paises`),
          axios.get(`${API_BASE}/provincias`),
        ]);
        setPaises(resPaises.data);
        setProvincias(resProvincias.data);
      } catch (error) {
        console.error("Error al obtener países/provincias:", error);
      }
    };
    fetchDatos();
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/maestros`, form);
      alert("Maestro registrado correctamente");
      setForm({
        nombre: "",
        apellido: "",
        graduacion: "",
        provinciaId: "",
        paisId: "",
      });
    } catch (error) {
      console.error("Error al registrar maestro:", error);
      alert("Ocurrió un error al registrar el maestro");
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: "auto", mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Alta de Maestro
      </Typography>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              name="nombre"
              label="Nombre"
              value={form.nombre}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              name="apellido"
              label="Apellido"
              value={form.apellido}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              select
              fullWidth
              name="graduacion"
              label="Graduación"
              value={form.graduacion}
              onChange={handleChange}
              required
            >
              {grados.map((grado) => (
                <MenuItem key={grado} value={grado}>
                  {grado}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12}>
            <TextField
              select
              fullWidth
              name="paisId"
              label="País"
              value={form.paisId}
              onChange={handleChange}
              required
            >
              {paises.map((pais) => (
                <MenuItem key={pais.id} value={pais.id}>
                  {pais.nombre}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12}>
            <TextField
              select
              fullWidth
              name="provinciaId"
              label="Provincia"
              value={form.provinciaId}
              onChange={handleChange}
              required
            >
              {provincias.map((prov) => (
                <MenuItem key={prov.id} value={prov.id}>
                  {prov.nombre}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12}>
            <Button type="submit" fullWidth variant="contained">
              Registrar Maestro
            </Button>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
};

export default AltaMaestro;
