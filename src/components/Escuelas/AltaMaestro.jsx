// src/pages/AltaMaestro.jsx
import React, { useEffect, useState } from "react";
import { Tabs, Tab } from "@mui/material";
import MaestrosGrid from "./MaestrosGrid";
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
  const [tab, setTab] = useState(0);
  const handleTabChange = (e, v) => setTab(v);

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
  <Box sx={{ maxWidth: 900, mx: 0, mt: 0, p: 0, width: '100%' }}>
      <Tabs value={tab} onChange={handleTabChange} sx={{ mb: 0.2 }}>
        <Tab label="Registrar Maestro" />
        <Tab label="Listado de Maestros" />
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
              <Grid item sx={{ mt: 0, mb: 0, p: 0, display: 'flex', alignItems: 'center' }}>
                <Button type="submit" variant="contained" sx={{ minWidth: 180, height: 56, mt: 0, mb: 0 }}>
                  Registrar Maestro
                </Button>
              </Grid>
      </Grid>
    </form>
      )}
      {tab === 1 && (
        <MaestrosGrid />
      )}
    </Box>
  );
};

export default AltaMaestro;
