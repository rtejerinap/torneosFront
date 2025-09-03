import React, { useEffect, useState } from "react";
import { Tabs, Tab } from "@mui/material";
import InstructoresGrid from "./InstructoresGrid";
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
  "1º Dan",
  "2º Dan",
  "3º Dan",
  "4º Dan",
  "5º Dan",
  "6º Dan",
  "7º Dan",
  "8º Dan",
];

const AltaInstructor = () => {
  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    graduacion: "",
    paisId: "",
    provinciaId: "",
    maestroId: "",
  });

  const [paises, setPaises] = useState([]);
  const [provincias, setProvincias] = useState([]);
  const [maestros, setMaestros] = useState([]);

  useEffect(() => {
    const fetchDatos = async () => {
      try {
        const [resPaises, resProvincias, resMaestros] = await Promise.all([
          axios.get(`${API_BASE}/paises`),
          axios.get(`${API_BASE}/provincias`),
          axios.get(`${API_BASE}/maestros`),
        ]);
        setPaises(resPaises.data);
        setProvincias(resProvincias.data);
        setMaestros(resMaestros.data);
      } catch (error) {
        console.error("Error al obtener datos:", error);
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
      await axios.post(`${API_BASE}/instructores`, form);
      alert("Instructor registrado correctamente");
      setForm({
        nombre: "",
        apellido: "",
        graduacion: "",
        paisId: "",
        provinciaId: "",
        maestroId: "",
      });
    } catch (error) {
      console.error("Error al registrar instructor:", error);
      alert("Ocurrió un error al registrar el instructor");
    }
  };

  const [tab, setTab] = useState(0);
  const handleTabChange = (e, v) => setTab(v);

  return (
    <Box sx={{ maxWidth: 900, mx: 0, mt: 0, p: 0, width: '100%' }}>
      <Tabs value={tab} onChange={handleTabChange} sx={{ mb: 0.2 }}>
        <Tab label="Registrar Instructor" />
        <Tab label="Listado de Instructores" />
      </Tabs>
      {tab === 0 && (
        <form onSubmit={handleSubmit} style={{ marginTop: 0, paddingTop: 0 }}>
          <Grid container spacing={1} alignItems="center" sx={{ mt: 0, mb: 0, p: 0, pt: 0 }}>
            <Grid item xs={12} sm={6} sx={{ mt: 0, mb: 0, p: 0 }}>
              <TextField
                fullWidth
                sx={{ minWidth: 220, mt: 0, mb: 0 }}
                name="nombre"
                label="Nombre"
                value={form.nombre}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6} sx={{ mt: 0, mb: 0, p: 0 }}>
              <TextField
                fullWidth
                sx={{ minWidth: 220, mt: 0, mb: 0 }}
                name="apellido"
                label="Apellido"
                value={form.apellido}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item sx={{ mt: 0, mb: 0, p: 0 }}>
              <TextField
                select
                sx={{ minWidth: 120, mt: 0, mb: 0 }}
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
            <Grid item sx={{ mt: 0, mb: 0, p: 0 }}>
              <TextField
                select
                sx={{ minWidth: 120, mt: 0, mb: 0 }}
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
            <Grid item sx={{ mt: 0, mb: 0, p: 0 }}>
              <TextField
                select
                sx={{ minWidth: 120, mt: 0, mb: 0 }}
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
            <Grid item sx={{ mt: 0, mb: 0, p: 0 }}>
              <TextField
                select
                sx={{ minWidth: 180, mt: 0, mb: 0 }}
                name="maestroId"
                label="Maestro"
                value={form.maestroId}
                onChange={handleChange}
                required
              >
                {maestros.map((m) => (
                  <MenuItem key={m.id} value={m.id}>
                    {`${m.apellido}, ${m.nombre} (${m.graduacion})`}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item sx={{ mt: 0, mb: 0, p: 0, display: 'flex', alignItems: 'center' }}>
              <Button type="submit" variant="contained" sx={{ minWidth: 180, height: 56, mt: 0, mb: 0 }}>
                Registrar Instructor
              </Button>
            </Grid>
          </Grid>
        </form>
      )}
      {tab === 1 && (
        <InstructoresGrid />
      )}
    </Box>
  );
};

export default AltaInstructor;
