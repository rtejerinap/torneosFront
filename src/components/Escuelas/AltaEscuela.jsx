// src/components/AltaEscuela.jsx
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

const AltaEscuela = () => {
  const [form, setForm] = useState({
    nombre: "",
    ciudad: "",
    paisId: "",
    provinciaId: "",
    instructorId: "",
    maestroId: "",
  });

  const [paises, setPaises] = useState([]);
  const [provincias, setProvincias] = useState([]);
  const [instructores, setInstructores] = useState([]);
  const [maestros, setMaestros] = useState([]);

  useEffect(() => {
    // Cargar países y maestros al inicio
    axios.get(`${API_BASE}/paises`).then((res) => setPaises(res.data));
    axios.get(`${API_BASE}/maestros`).then((res) => setMaestros(res.data));
  }, []);

  useEffect(() => {
    if (form.paisId) {
      axios.get(`${API_BASE}/provincias/pais/${form.paisId}`).then((res) =>
        setProvincias(res.data)
      );
    }
  }, [form.paisId]);

  useEffect(() => {
    if (form.provinciaId) {
      axios
        .get(`${API_BASE}/instructores/provincia/${form.provinciaId}`)
        .then((res) => setInstructores(res.data));
    } else {
      setInstructores([]);
    }
  }, [form.provinciaId]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/escuelas`, form);
      alert("Escuela registrada correctamente");
      setForm({
        nombre: "",
        ciudad: "",
        paisId: "",
        provinciaId: "",
        instructorId: "",
        maestroId: "",
      });
    } catch (error) {
      console.error("Error al registrar escuela:", error);
      alert("Ocurrió un error al registrar la escuela");
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: "auto", mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Alta de Escuela
      </Typography>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              name="nombre"
              label="Nombre de la escuela"
              value={form.nombre}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              name="ciudad"
              label="Ciudad"
              value={form.ciudad}
              onChange={handleChange}
              required
            />
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
            <TextField
              select
              fullWidth
              name="instructorId"
              label="Instructor"
              value={form.instructorId}
              onChange={handleChange}
            >
              <MenuItem value="">Ninguno</MenuItem>
              {instructores.map((i) => (
                <MenuItem key={i.id} value={i.id}>
                  {`${i.apellido}, ${i.nombre} (${i.graduacion})`}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12}>
            <TextField
              select
              fullWidth
              name="maestroId"
              label="Maestro"
              value={form.maestroId}
              onChange={handleChange}
            >
              <MenuItem value="">Ninguno</MenuItem>
              {maestros.map((m) => (
                <MenuItem key={m.id} value={m.id}>
                  {`${m.apellido}, ${m.nombre} (${m.graduacion})`}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12}>
            <Button type="submit" fullWidth variant="contained">
              Registrar Escuela
            </Button>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
};

export default AltaEscuela;
