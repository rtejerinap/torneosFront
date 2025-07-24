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
    DialogContentText,
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

const Inscribirse = () => {
    const [torneos, setTorneos] = useState([]);
    const [paises, setPaises] = useState([]);
    const [provincias, setProvincias] = useState([]);
    const [escuelas, setEscuelas] = useState([]);
    const [instructores, setInstructores] = useState([]);
    const [maestros, setMaestros] = useState([]);
    const [openConfirm, setOpenConfirm] = useState(false);
    const [loading, setLoading] = useState(false);

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
        instructorId: "",
        otroInstructor: "",
        maestroId: "",
        otroMaestro: "",
        torneoId: "",
        tul: false,
        lucha: false,
        equipos: false,
        coach: false,
        arbitro: false,
        autoridad_mesa: false,
    };

    const [form, setForm] = useState(initialForm);

    const esCintoNegro = form.cinturon.includes("Dan") || form.cinturon.includes("Rojo punta negra");

    useEffect(() => {
        axios.get(`${API_BASE}/torneos/activos`).then((res) => setTorneos(res.data));
        axios.get(`${API_BASE}/paises`).then((res) => setPaises(res.data));
    }, []);

    useEffect(() => {
        if (form.paisId) {
            axios.get(`${API_BASE}/provincias/pais/${form.paisId}`).then((res) => setProvincias(res.data));
        }
    }, [form.paisId]);

    useEffect(() => {
        if (form.provinciaId) {
            axios.get(`${API_BASE}/escuelas/provincia/${form.provinciaId}`).then((res) => setEscuelas(res.data));
            axios.get(`${API_BASE}/instructores/provincia/${form.provinciaId}`).then((res) => setInstructores(res.data));
        }
        axios.get(`${API_BASE}/maestros`).then((res) => setMaestros(res.data));
    }, [form.provinciaId]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    };

    const handleOpenConfirm = (e) => {
        e.preventDefault();
        setOpenConfirm(true);
    };

    const handleConfirmSubmit = async () => {
        setOpenConfirm(false);
        setLoading(true);
        try {
            const payload = {
                ...form,
                instructorId: form.otroInstructor ? null : form.instructorId,
                maestroId: form.otroMaestro ? null : form.maestroId,
                otroInstructor: form.otroInstructor || null,
                otroMaestro: form.otroMaestro || null,
            };
            await axios.post(`${API_BASE}/participantes`, payload);
            alert("Inscripción exitosa");
            setForm(initialForm); // Limpiar formulario
        } catch (error) {
            alert("Error al enviar formulario");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {loading && <LoadingSvg />}
            <Box sx={{ p: 3, maxWidth: 1000, margin: "auto" }}>
                <Typography variant="h4" gutterBottom>
                    Formulario de Inscripción
                </Typography>
                <form onSubmit={handleOpenConfirm}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <TextField name="nombre" label="Nombre" fullWidth value={form.nombre} onChange={handleChange} required />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField name="apellido" label="Apellido" fullWidth value={form.apellido} onChange={handleChange} required />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField name="documento" label="Documento" fullWidth value={form.documento} onChange={handleChange} required />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                name="fechaNacimiento"
                                type="date"
                                label="Fecha de nacimiento"
                                fullWidth
                                value={form.fechaNacimiento}
                                onChange={handleChange}
                                InputLabelProps={{ shrink: true }}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                select
                                name="genero"
                                label="Género"
                                fullWidth
                                sx={{ minWidth: 100 }}
                                value={form.genero}
                                onChange={handleChange}
                                required
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
                                sx={{ minWidth: 100 }}
                                value={form.cinturon}
                                onChange={handleChange}
                                required
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
                            <TextField name="peso" label="Peso (kg)" fullWidth type="number" value={form.peso} onChange={handleChange} required />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                select
                                name="paisId"
                                label="País"
                                fullWidth 
                                sx={{ minWidth: 100 }}

                                value={form.paisId}
                                onChange={handleChange}
                                required
                            >
                                {paises.map((p) => (
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
                                sx={{ minWidth: 100 }}
                                value={form.provinciaId}
                                onChange={handleChange}
                                required
                            >
                                {provincias.map((p) => (
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
                                sx={{ minWidth: 100 }}
                                value={form.escuela_id}
                                onChange={handleChange}
                                
                            >
                                {escuelas.map((e) => (
                                    <MenuItem key={e.id} value={e.id}>{`${e.nombre}, ${e.ciudad}`}</MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                select
                                name="instructorId"
                                label="Instructor"
                                fullWidth
                                value={form.instructorId}
                                onChange={handleChange}
                            >
                                <MenuItem value="">Otro</MenuItem>
                                {instructores.map((i) => (
                                    <MenuItem key={i.id} value={i.id}>{`${i.nombre}, ${i.apellido}`}</MenuItem>
                                ))}
                            </TextField>
                            {form.instructorId === "" && (
                                <TextField name="otroInstructor" label="Otro instructor" fullWidth onChange={handleChange} />
                            )}
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                select
                                name="maestroId"
                                label="Maestro"
                                fullWidth
                                value={form.maestroId}
                                onChange={handleChange}
                            >
                                <MenuItem value="">Otro</MenuItem>
                                {maestros.map((m) => (
                                    <MenuItem key={m.id} value={m.id}>{`${m.nombre}, ${m.apellido}`}</MenuItem>
                                ))}
                            </TextField>
                            {form.maestroId === "" && (
                                <TextField name="otroMaestro" label="Otro maestro" fullWidth onChange={handleChange} />
                            )}
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                select
                                name="torneoId"
                                label="Torneo"
                                fullWidth
                                sx={{ minWidth: 100 }}

                                value={form.torneoId}
                                onChange={handleChange}
                                required
                            >
                                {torneos.map((t) => (
                                    <MenuItem key={t.id} value={t.id}>{t.nombre}</MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12}>
                            <FormGroup row>
                                <FormControlLabel control={<Checkbox checked={form.tul} onChange={handleChange} name="tul" />} label="Tul" />
                                <FormControlLabel control={<Checkbox checked={form.lucha} onChange={handleChange} name="lucha" />} label="Lucha" />
                                {esCintoNegro && (
                                    <>
                                        <FormControlLabel control={<Checkbox checked={form.equipos} onChange={handleChange} name="equipos" />} label="Equipos" />
                                        <FormControlLabel control={<Checkbox checked={form.coach} onChange={handleChange} name="coach" />} label="Coach" />
                                        <FormControlLabel control={<Checkbox checked={form.arbitro} onChange={handleChange} name="arbitro" />} label="Árbitro" />
                                        <FormControlLabel control={<Checkbox checked={form.autoridad_mesa} onChange={handleChange} name="autoridad_mesa" />} label="Autoridad Mesa" />
                                    </>
                                )}
                            </FormGroup>
                        </Grid>
                        <Grid item xs={12}>
                            <Button type="submit" variant="contained" color="primary" fullWidth>
                                Inscribirse
                            </Button>
                        </Grid>
                    </Grid>
                </form>

                <Dialog open={openConfirm && !loading} onClose={() => setOpenConfirm(false)} maxWidth="sm" fullWidth>
                    <DialogTitle>Confirmar inscripción</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Verificá los datos ingresados antes de enviar:
                        </DialogContentText>
                        <Box sx={{ mt: 2 }}>
                            <Typography variant="body2"><strong>Nombre:</strong> {form.nombre} {form.apellido}</Typography>
                            <Typography variant="body2"><strong>Documento:</strong> {form.documento}</Typography>
                            <Typography variant="body2"><strong>Fecha de nacimiento:</strong> {form.fechaNacimiento}</Typography>
                            <Typography variant="body2"><strong>Género:</strong> {form.genero}</Typography>
                            <Typography variant="body2"><strong>Cinturón:</strong> {form.cinturon}</Typography>
                            <Typography variant="body2"><strong>Peso:</strong> {form.peso} kg</Typography>
                            <Typography variant="body2">
                                <strong>País:</strong> {paises.find(p => p.id === form.paisId)?.nombre || form.paisId}
                            </Typography>

                            <Typography variant="body2">
                                <strong>Provincia:</strong> {provincias.find(p => p.id === form.provinciaId)?.nombre || form.provinciaId}
                            </Typography>

                            <Typography variant="body2">
                                <strong>Escuela:</strong> {
                                    escuelas.find(e => e.id === form.escuela_id)
                                        ? `${escuelas.find(e => e.id === form.escuela_id).nombre}, ${escuelas.find(e => e.id === form.escuela_id).ciudad}`
                                        : form.escuela_id
                                }
                            </Typography>

                            {form.instructorId ? (
                                <Typography variant="body2">
                                    <strong>Instructor:</strong> {
                                        instructores.find(i => i.id === form.instructorId)
                                            ? `${instructores.find(i => i.id === form.instructorId).nombre} ${instructores.find(i => i.id === form.instructorId).apellido}`
                                            : form.instructorId
                                    }
                                </Typography>
                            ) : (
                                <Typography variant="body2"><strong>Otro Instructor:</strong> {form.otroInstructor}</Typography>
                            )}

                            {form.maestroId ? (
                                <Typography variant="body2">
                                    <strong>Maestro:</strong> {
                                        maestros.find(m => m.id === form.maestroId)
                                            ? `${maestros.find(m => m.id === form.maestroId).nombre} ${maestros.find(m => m.id === form.maestroId).apellido}`
                                            : form.maestroId
                                    }
                                </Typography>
                            ) : (
                                <Typography variant="body2"><strong>Otro Maestro:</strong> {form.otroMaestro}</Typography>
                            )}

                            <Typography variant="body2">
                                <strong>Torneo:</strong> {torneos.find(t => t.id === form.torneoId)?.nombre || form.torneoId}
                            </Typography>

                            <Typography variant="body2" sx={{ mt: 1 }}><strong>Modalidades:</strong></Typography>
                            <ul style={{ marginTop: 0 }}>
                                {form.tul && <li>Tul</li>}
                                {form.lucha && <li>Lucha</li>}
                                {form.equipos && <li>Equipos</li>}
                                {form.coach && <li>Coach</li>}
                                {form.arbitro && <li>Árbitro</li>}
                                {form.autoridad_mesa && <li>Autoridad de Mesa</li>}
                                {!form.tul && !form.lucha && !form.equipos && !form.coach && !form.arbitro && !form.autoridad_mesa && (
                                    <li>Sin modalidades seleccionadas</li>
                                )}
                            </ul>
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenConfirm(false)} color="secondary">
                            Cancelar
                        </Button>
                        <Button onClick={handleConfirmSubmit} variant="contained" color="primary" disabled={loading}>
                            Confirmar y enviar
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </>
    );
};

export default Inscribirse;
