import React, { useState, useEffect } from 'react';
import {
  TextField, Button, MenuItem, Grid, Typography, Box, Divider
} from '@mui/material';
const API_BASE = import.meta.env.VITE_API_URL;

const rangoEdades = [
  { label: '5 a 6 años', min: 5, max: 6 },
  { label: '7 a 8 años', min: 7, max: 8 },
  { label: '9 a 10 años', min: 9, max: 10 },
  { label: '11 a 13 años', min: 11, max: 13 },
  { label: '14 a 15 años', min: 14, max: 15 },
  { label: '16 a 17 años', min: 16, max: 17 },
  { label: '18 a 29 años', min: 18, max: 29 },
  { label: '30 a 39 años', min: 30, max: 39 },
  { label: '40 a 49 años', min: 40, max: 49 },
  { label: '50 a 59 años', min: 50, max: 59 },
  { label: '60+ años', min: 60, max: 99 }
];

const rangoPesos = [
  { label: '-40 kg', min: 0, max: 40 },
  { label: '-45 kg', min: 41, max: 45 },
  { label: '-50 kg', min: 46, max: 50 },
  { label: '-57 kg', min: 51, max: 57 },
  { label: '-64 kg', min: 58, max: 64 },
  { label: '-71 kg', min: 65, max: 71 },
  { label: '-78 kg', min: 72, max: 78 },
  { label: '-85 kg', min: 79, max: 85 },
  { label: '+85 kg', min: 86, max: 200 }
];

const ORDEN_CINTURONES = [
  '10º Gup - Blanco',
  '9º Gup - Blanco punta amarilla',
  '8º Gup - Amarillo',
  '7º Gup - Amarillo punta verde',
  '6º Gup - Verde',
  '5º Gup - Verde punta azul',
  '4º Gup - Azul',
  '3º Gup - Azul punta roja',
  '2º Gup - Rojo',
  '1º Gup - Rojo punta negra',
  '1º Dan - Negro',
  '2º Dan - Negro',
  '3º Dan - Negro',
  '4º Dan - Negro',
  '5º Dan - Negro',
  '6º Dan - Negro'
];

const tiemposRound = [
  { label: '60 segundos', value: 60 },
  { label: '90 segundos', value: 90 },
  { label: '120 segundos', value: 120 }
];

const AltaCategoriaCombate = () => {
  const [torneos, setTorneos] = useState([]);
  const [form, setForm] = useState({
    sexo: '',
    edad_min: '',
    edad_max: '',
    peso_minimo: '',
    peso_maximo: '',
    graduacion_desde: '',
    graduacion_hasta: '',
    tiempo_por_round_preliminar: '',
    cantidad_de_rounds_preliminar: '',
    tiempo_por_round_final: '',
    cantidad_de_rounds_final: '',
    tiempo_extra: '',
    id_torneo: ''
  });

  const fieldStyle = { minWidth: 180 };

  useEffect(() => {
    const fetchTorneos = async () => {
      try {
const res = await fetch(`${API_BASE}/torneos`);
        const data = await res.json();
        setTorneos(data);
      } catch (err) {
        console.error('Error al cargar torneos:', err);
      }
    };
    fetchTorneos();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const numericFields = [
      'edad_min', 'edad_max', 'peso_minimo', 'peso_maximo',
      'tiempo_por_round_preliminar', 'cantidad_de_rounds_preliminar',
      'tiempo_por_round_final', 'cantidad_de_rounds_final', 'tiempo_extra'
    ];
    setForm({ ...form, [name]: numericFields.includes(name) ? parseInt(value) : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const edadSel = rangoEdades.find(r => r.min === form.edad_min);
    const pesoSel = rangoPesos.find(r => r.min === form.peso_minimo);
    const nombreAuto = `${form.sexo} | ${edadSel?.label} | ${pesoSel?.label} | ${form.graduacion_desde} a ${form.graduacion_hasta}`;

    const indiceGraduacionMin = ORDEN_CINTURONES.findIndex(g => g === form.graduacion_desde);
    const indiceGraduacionMax = ORDEN_CINTURONES.findIndex(g => g === form.graduacion_hasta);

    const payload = {
      ...form,
      nombre: nombreAuto,
      graduacion_desde_index: indiceGraduacionMin,
      graduacion_hasta_index: indiceGraduacionMax
    };

    try {
const res = await fetch(`${API_BASE}/api/categorias`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const contentType = res.headers.get("content-type");
      if (!res.ok || !contentType?.includes("application/json")) {
        const text = await res.text();
        console.error("Respuesta no válida:", text);
        alert("Error del servidor al crear la categoría.");
        return;
      }

      const result = await res.json();

      if (res.ok) {
        alert('Categoría creada con éxito');
        setForm({
          sexo: '', edad_min: '', edad_max: '', peso_minimo: '', peso_maximo: '',
          graduacion_desde: '', graduacion_hasta: '', tiempo_por_round_preliminar: '',
          cantidad_de_rounds_preliminar: '', tiempo_por_round_final: '',
          cantidad_de_rounds_final: '', tiempo_extra: '', id_torneo: ''
        });
      } else {
        alert(result.error || 'Error al crear categoría');
      }
    } catch (err) {
      console.error('Error al enviar datos:', err);
      alert('Error al enviar datos');
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 700, margin: '0 auto' }}>
      <Typography variant="h5" gutterBottom>Crear Categoría de Combate</Typography>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField select label="Sexo" name="sexo" value={form.sexo} onChange={handleChange} sx={fieldStyle} fullWidth>
              <MenuItem value="masculino">Masculino</MenuItem>
              <MenuItem value="femenino">Femenino</MenuItem>
              <MenuItem value="mixto">Mixto</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField select label="Rango de Edad" name="edad_min" value={form.edad_min && form.edad_max ? `${form.edad_min}-${form.edad_max}` : ''}
              onChange={(e) => {
                const r = rangoEdades.find(opt => `${opt.min}-${opt.max}` === e.target.value);
                if (r) setForm({ ...form, edad_min: r.min, edad_max: r.max });
              }} sx={fieldStyle} fullWidth>
              {rangoEdades.map((r) => (
                <MenuItem key={r.label} value={`${r.min}-${r.max}`}>{r.label}</MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField select label="Rango de Peso" name="peso_minimo" value={form.peso_minimo && form.peso_maximo ? `${form.peso_minimo}-${form.peso_maximo}` : ''}
              onChange={(e) => {
                const r = rangoPesos.find(opt => `${opt.min}-${opt.max}` === e.target.value);
                if (r) setForm({ ...form, peso_minimo: r.min, peso_maximo: r.max });
              }} sx={fieldStyle} fullWidth>
              {rangoPesos.map((r) => (
                <MenuItem key={r.label} value={`${r.min}-${r.max}`}>{r.label}</MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField select label="Graduación Desde" name="graduacion_desde" value={form.graduacion_desde} onChange={handleChange} sx={fieldStyle} fullWidth>
              {ORDEN_CINTURONES.map((g) => (
                <MenuItem key={g} value={g}>{g}</MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField select label="Graduación Hasta" name="graduacion_hasta" value={form.graduacion_hasta} onChange={handleChange} sx={fieldStyle} fullWidth>
              {ORDEN_CINTURONES.map((g) => (
                <MenuItem key={g} value={g}>{g}</MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12}><Divider sx={{ my: 2 }} /><Typography variant="h6">Preliminares</Typography></Grid>

          <Grid item xs={12} sm={6}>
            <TextField select label="Tiempo por round (preliminar)" name="tiempo_por_round_preliminar" value={form.tiempo_por_round_preliminar} onChange={handleChange} sx={fieldStyle} fullWidth>
              {tiemposRound.map((op) => (
                <MenuItem key={op.value} value={op.value}>{op.label}</MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField type="number" label="Cantidad de rounds (preliminar)" name="cantidad_de_rounds_preliminar" value={form.cantidad_de_rounds_preliminar} onChange={handleChange} fullWidth />
          </Grid>

          <Grid item xs={12}><Divider sx={{ my: 2 }} /><Typography variant="h6">Finales</Typography></Grid>

          <Grid item xs={12} sm={6}>
            <TextField select label="Tiempo por round (final)" name="tiempo_por_round_final" value={form.tiempo_por_round_final} onChange={handleChange} sx={fieldStyle} fullWidth>
              {tiemposRound.map((op) => (
                <MenuItem key={op.value} value={op.value}>{op.label}</MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField type="number" label="Cantidad de rounds (final)" name="cantidad_de_rounds_final" value={form.cantidad_de_rounds_final} onChange={handleChange} fullWidth />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField type="number" label="Tiempo extra (segundos)" name="tiempo_extra" value={form.tiempo_extra} onChange={handleChange} fullWidth />
          </Grid>

          <Grid item xs={12}>
            <TextField select label="Torneo" name="id_torneo" value={form.id_torneo} onChange={handleChange} sx={fieldStyle} fullWidth>
              {torneos.map((torneo) => (
                <MenuItem key={torneo.id} value={torneo.id}>{torneo.nombre}</MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12}>
            <Button type="submit" variant="contained" fullWidth>
              Crear Categoría
            </Button>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
};

export default AltaCategoriaCombate;
