import React, { useEffect, useState } from "react";
import axios from "axios";
import LoadingSvg from "/src/components/loader/LoadingSvg";
import {
  Box,
  Button,
  MenuItem,
  TextField,
  Typography,
  Grid,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";

const API_BASE = import.meta.env.VITE_API_URL;
const cinturonesITF = [
  { grado: "10º Gup", nombre: "Blanco", color: "#ffffff" },
  { grado: "9º Gup", nombre: "Blanco punta amarilla", color: "linear-gradient(to right, #ffffff 50%, #f1c40f 50%)" },
  { grado: "8º Gup", nombre: "Amarillo", color: "#f1c40f" },
  { grado: "7º Gup", nombre: "Amarillo punta verde", color: "linear-gradient(to right, #f1c40f 50%, #27ae60 50%)" },
  { grado: "6º Gup", nombre: "Verde", color: "#27ae60" },
  { grado: "5º Gup", nombre: "Verde punta azul", color: "linear-gradient(to right, #27ae60 50%, #2980b9 50%)" },
  { grado: "4º Gup", nombre: "Azul", color: "#2980b9" },
  { grado: "3º Gup", nombre: "Azul punta roja", color: "linear-gradient(to right, #2980b9 50%, #c0392b 50%)" },
  { grado: "2º Gup", nombre: "Rojo", color: "#c0392b" },
  { grado: "1º Gup", nombre: "Rojo punta negra", color: "linear-gradient(to right, #c0392b 50%, #000000 50%)" },
  { grado: "1º Dan", nombre: "Negro", color: "#000000" },
  { grado: "2º Dan", nombre: "Negro", color: "#000000" },
  { grado: "3º Dan", nombre: "Negro", color: "#000000" },
  { grado: "4º Dan", nombre: "Negro", color: "#000000" },
  { grado: "5º Dan", nombre: "Negro", color: "#000000" },
  { grado: "6º Dan", nombre: "Negro", color: "#000000" },
  { grado: "7º Dan", nombre: "Negro", color: "#000000" },
  { grado: "8º Dan", nombre: "Negro", color: "#000000" },
  { grado: "9º Dan", nombre: "Negro", color: "#000000" },
];

const EditParticipanteModal = ({ open, onClose, participante, onUpdated, torneos, paises, provincias, escuelas, instructores, maestros }) => {
  const initialForm = {
    nombre: "",
    apellido: "",
    documento: "",
    fechaNacimiento: "",
    genero: "",
    cinturon: "",
    peso: "",
    paisId: "",
    provinciaId: "",
    escuela_id: "",
    otraEscuela: "",
    instructorId: "",
    otroInstructor: "",
    maestroId: "",
    otroMaestro: "",
    torneoId: "",
    tul: false,
    lucha: false,
    paisId: "",
    coach: false,
    arbitro: false,
    juez: false,
    autoridad_mesa: false,
  };

  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);

  // Inicializar selects dependientes correctamente
  const [localPaises, setLocalPaises] = useState([]);
  const [localProvincias, setLocalProvincias] = useState([]);
  const [localEscuelas, setLocalEscuelas] = useState([]);
  const [localInstructores, setLocalInstructores] = useState([]);
  const [localMaestros, setLocalMaestros] = useState([]);

  // Handler igual que en Inscribirse
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "maestroId") {
      setForm((prev) => ({
        ...prev,
        maestroId: value,
        otroMaestro: value === "" ? prev.otroMaestro : ""
      }));
      return;
    }
    if (name === "instructorId") {
      setForm((prev) => ({
        ...prev,
        instructorId: value,
        // Si selecciona un instructor, limpiar otroInstructor
        otroInstructor: value !== "" ? "" : prev.otroInstructor
      }));
      return;
    }
    if (name === "otroMaestro") {
      setForm((prev) => ({
        ...prev,
        otroMaestro: value,
        maestroId: value ? "" : prev.maestroId
      }));
      return;
    }
    if (name === "otroInstructor") {
      setForm((prev) => ({
        ...prev,
        otroInstructor: value,
        // Si escribe otroInstructor, limpiar instructorId
        instructorId: value ? "" : prev.instructorId
      }));
      return;
    }
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  useEffect(() => {
    if (participante) {
      setForm({ ...initialForm, ...participante });
    }
  }, [participante]);

  // Cargar países al montar
  useEffect(() => {
    axios.get(`${API_BASE}/paises`).then((res) => setLocalPaises(res.data));
  }, []);

  // Provincias según país
  useEffect(() => {
    if (form.paisId) {
      axios.get(`${API_BASE}/provincias/pais/${form.paisId}`).then((res) => setLocalProvincias(res.data));
    } else {
      setLocalProvincias([]);
    }
  }, [form.paisId]);

  // Escuelas, instructores y maestros según provincia
  useEffect(() => {
    if (form.provinciaId) {
      axios.get(`${API_BASE}/escuelas/provincia/${form.provinciaId}`).then((res) => setLocalEscuelas(res.data));
      axios.get(`${API_BASE}/instructores/provincia/${form.provinciaId}`).then((res) => setLocalInstructores(res.data));
    } else {
      setLocalEscuelas([]);
      setLocalInstructores([]);
    }
    // Maestros siempre global
    axios.get(`${API_BASE}/maestros`).then((res) => setLocalMaestros(res.data));
  }, [form.provinciaId]);

  // Solo Dan (no Rojo punta negra)
  const esDan = form.cinturon.includes("Dan");
  // Coach a partir de Azul (4º Gup - Azul), Azul punta roja, Rojo, Rojo punta negra y todos los Danes
  const azulYArriba = [
    "4º Gup - Azul",
    "3º Gup - Azul punta roja",
    "2º Gup - Rojo",
    "1º Gup - Rojo punta negra",
    "1º Dan - Negro",
    "2º Dan - Negro",
    "3º Dan - Negro",
    "4º Dan - Negro",
    "5º Dan - Negro",
    "6º Dan - Negro",
    "7º Dan - Negro",
    "8º Dan - Negro",
    "9º Dan - Negro"
  ];
  const esAzulParaArriba = azulYArriba.some(g => form.cinturon === g);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        instructorId: form.otroInstructor ? null : form.instructorId,
        maestroId: form.otroMaestro ? null : form.maestroId,
        otroInstructor: form.otroInstructor || null,
        otroMaestro: form.otroMaestro || null,
        escuela_id: form.otraEscuela ? null : form.escuela_id,
        otraEscuela: form.otraEscuela || null,
      };
      console.log('🟡 PUT participante payload:', payload);
      await axios.put(`${API_BASE}/participantes/${participante.id}`, payload);
      onUpdated && onUpdated();
      onClose && onClose();
    } catch (error) {
      alert("Error al actualizar participante");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (!open || !participante) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Editar Participante</DialogTitle>
      <DialogContent>
        {loading && <LoadingSvg />}
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }} autoComplete="off">
          <Grid container spacing={{ xs: 1, sm: 2 }}>
            <Grid item xs={12} sm={6}>
              <TextField name="nombre" label="Nombre" fullWidth size="medium" value={form.nombre} onChange={handleChange} required inputProps={{ style: { fontSize: 18 } }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField name="apellido" label="Apellido" fullWidth size="medium" value={form.apellido} onChange={handleChange} required inputProps={{ style: { fontSize: 18 } }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField name="documento" label="Documento" fullWidth size="medium" value={form.documento} onChange={handleChange} required inputProps={{ style: { fontSize: 18 } }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="fechaNacimiento"
                type="date"
                label="Fecha de nacimiento"
                fullWidth
                size="medium"
                value={form.fechaNacimiento}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                required
                inputProps={{ style: { fontSize: 18 } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                name="genero"
                label="Género"
                fullWidth
                size="medium"
                sx={{ minWidth: 100 }}
                value={form.genero}
                onChange={handleChange}
                required
                SelectProps={{ MenuProps: { PaperProps: { style: { maxHeight: 200 } } } }}
                inputProps={{ style: { fontSize: 18 } }}
              >
                <MenuItem value="Masculino">Masculino</MenuItem>
                <MenuItem value="Femenino">Femenino</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                name="cinturon"
                label="Grado"
                fullWidth
                size="medium"
                sx={{ minWidth: 100 }}
                value={form.cinturon}
                onChange={handleChange}
                required
                SelectProps={{ MenuProps: { PaperProps: { style: { maxHeight: 250 } } } }}
                inputProps={{ style: { fontSize: 18 } }}
              >
                {cinturonesITF.map((c, i) => (
                  <MenuItem key={i} value={`${c.grado} - ${c.nombre}`}>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Box
                        sx={{
                          width: 24,
                          height: 12,
                          mr: 1,
                          borderRadius: "4px",
                          background: c.color,
                          border: "1px solid #ccc"
                        }}
                      />
                      {`${c.grado} - ${c.nombre}`}
                    </Box>
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField name="peso" label="Peso (kg)" fullWidth size="medium" type="number" value={form.peso} onChange={handleChange} required inputProps={{ style: { fontSize: 18 } }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                name="paisId"
                label="País"
                fullWidth
                size="medium"
                sx={{ minWidth: 100 }}
                value={form.paisId}
                onChange={handleChange}
                required
                SelectProps={{ MenuProps: { PaperProps: { style: { maxHeight: 200 } } } }}
                inputProps={{ style: { fontSize: 18 } }}
              >
                {localPaises.map((p) => (
                  <MenuItem key={p.id} value={p.id}>{p.nombre}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                name="provinciaId"
                label="Provincia"
                fullWidth
                size="medium"
                sx={{ minWidth: 100 }}
                value={form.provinciaId}
                onChange={handleChange}
                required
                SelectProps={{ MenuProps: { PaperProps: { style: { maxHeight: 200 } } } }}
                inputProps={{ style: { fontSize: 18 } }}
              >
                {localProvincias.map((p) => (
                  <MenuItem key={p.id} value={p.id}>{p.nombre}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                select
                name="escuela_id"
                label="Escuela"
                fullWidth
                size="medium"
                sx={{ minWidth: 100 }}
                value={form.escuela_id}
                onChange={handleChange}
                SelectProps={{ MenuProps: { PaperProps: { style: { maxHeight: 200 } } } }}
                inputProps={{ style: { fontSize: 18 } }}
              >
                <MenuItem value="">Otra</MenuItem>
                {localEscuelas.map((e) => (
                  <MenuItem key={e.id} value={e.id}>{`${e.nombre}, ${e.ciudad}`}</MenuItem>
                ))}
              </TextField>
              {form.escuela_id === "" && (
                <TextField name="otraEscuela" label="Otra escuela" fullWidth size="medium" value={form.otraEscuela} onChange={handleChange} inputProps={{ style: { fontSize: 18 } }} />
              )}
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                name="instructorId"
                label="Instructor"
                fullWidth
                size="medium"
                value={form.instructorId}
                onChange={handleChange}
                SelectProps={{ MenuProps: { PaperProps: { style: { maxHeight: 200 } } } }}
                inputProps={{ style: { fontSize: 18 } }}
              >
                <MenuItem value="">Otro</MenuItem>
                {localInstructores.map((i) => (
                  <MenuItem key={i.id} value={i.id}>{`${i.nombre} ${i.apellido}`}</MenuItem>
                ))}
              </TextField>
              {form.instructorId === "" && (
                <TextField name="otroInstructor" label="Otro instructor" fullWidth size="medium" value={form.otroInstructor} onChange={handleChange} inputProps={{ style: { fontSize: 18 } }} />
              )}
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                name="maestroId"
                label="Maestro"
                fullWidth
                size="medium"
                value={form.maestroId}
                onChange={handleChange}
                SelectProps={{ MenuProps: { PaperProps: { style: { maxHeight: 200 } } } }}
                inputProps={{ style: { fontSize: 18 } }}
              >
                <MenuItem value="">Otro</MenuItem>
                {localMaestros.map((m) => (
                  <MenuItem key={m.id} value={m.id}>{`${m.nombre}, ${m.apellido}`}</MenuItem>
                ))}
              </TextField>
              {form.maestroId === "" && (
                <TextField name="otroMaestro" label="Otro maestro" fullWidth size="medium" value={form.otroMaestro} onChange={handleChange} inputProps={{ style: { fontSize: 18 } }} />
              )}
            </Grid>
            <Grid item xs={12}>
              <FormGroup row sx={{ flexWrap: 'wrap' }}>
                <FormControlLabel control={<Checkbox checked={form.tul} onChange={handleChange} name="tul" sx={{ p: 0.5 }} />} label={<span style={{ fontSize: 16 }}>Tul</span>} sx={{ m: { xs: 0.5, sm: 1 } }} />
                <FormControlLabel control={<Checkbox checked={form.lucha} onChange={handleChange} name="lucha" sx={{ p: 0.5 }} />} label={<span style={{ fontSize: 16 }}>Lucha</span>} sx={{ m: { xs: 0.5, sm: 1 } }} />
                {esAzulParaArriba && (
                  <FormControlLabel control={<Checkbox checked={form.coach} onChange={handleChange} name="coach" sx={{ p: 0.5 }} />} label={<span style={{ fontSize: 16 }}>Coach</span>} sx={{ m: { xs: 0.5, sm: 1 } }} />
                )}
                {esDan && (
                  <>
                    <FormControlLabel control={<Checkbox checked={form.equipos} onChange={handleChange} name="equipos" sx={{ p: 0.5 }} />} label={<span style={{ fontSize: 16 }}>Equipos</span>} sx={{ m: { xs: 0.5, sm: 1 } }} />
                    <FormControlLabel control={<Checkbox checked={form.arbitro} onChange={handleChange} name="arbitro" sx={{ p: 0.5 }} />} label={<span style={{ fontSize: 16 }}>Árbitro</span>} sx={{ m: { xs: 0.5, sm: 1 } }} />
                    <FormControlLabel control={<Checkbox checked={form.juez} onChange={handleChange} name="juez" sx={{ p: 0.5 }} />} label={<span style={{ fontSize: 16 }}>Juez</span>} sx={{ m: { xs: 0.5, sm: 1 } }} />
                    <FormControlLabel control={<Checkbox checked={form.autoridad_mesa} onChange={handleChange} name="autoridad_mesa" sx={{ p: 0.5 }} />} label={<span style={{ fontSize: 16 }}>Autoridad Mesa</span>} sx={{ m: { xs: 0.5, sm: 1 } }} />
                  </>
                )}
              </FormGroup>
            </Grid>
          </Grid>
          <DialogActions sx={{ px: { xs: 1, sm: 3 }, pb: { xs: 1, sm: 2 } }}>
            <Button onClick={onClose} color="secondary" sx={{ fontSize: { xs: 16, sm: 18 } }}>
              Cancelar
            </Button>
            <Button type="submit" variant="contained" color="primary" disabled={loading} sx={{ fontSize: { xs: 16, sm: 18 } }}>
              Guardar cambios
            </Button>
          </DialogActions>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default EditParticipanteModal;
