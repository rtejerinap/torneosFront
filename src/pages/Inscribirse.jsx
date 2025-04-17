import React, { useEffect, useState } from "react";
import axios from "axios";
import {
    Box,
    Button,
    MenuItem,
    TextField,
    Typography,
    Grid,
} from "@mui/material";

const API_BASE = "https://us-central1-torneos-305d7.cloudfunctions.net/api";

// 🥋 Cinturones ITF
const cinturonesITF = [
    { grado: "9º Gup", nombre: "Blanco", color: "#ffffff" },
    { grado: "8º Gup", nombre: "Blanco punta amarilla", color: "linear-gradient(to right, #ffffff 50%, #f1c40f 50%)" },
    { grado: "7º Gup", nombre: "Amarillo", color: "#f1c40f" },
    { grado: "6º Gup", nombre: "Amarillo punta verde", color: "linear-gradient(to right, #f1c40f 50%, #27ae60 50%)" },
    { grado: "5º Gup", nombre: "Verde", color: "#27ae60" },
    { grado: "4º Gup", nombre: "Verde punta azul", color: "linear-gradient(to right, #27ae60 50%, #2980b9 50%)" },
    { grado: "3º Gup", nombre: "Azul", color: "#2980b9" },
    { grado: "2º Gup", nombre: "Azul punta roja", color: "linear-gradient(to right, #2980b9 50%, #c0392b 50%)" },
    { grado: "1º Gup", nombre: "Rojo", color: "#c0392b" },
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
    const [escuelas, setEscuelas] = useState([]);
    const [form, setForm] = useState({
        nombre: "",
        apellido: "",
        documento: "",
        fechaNacimiento: "",
        cinturon: "",
        peso: "",
        torneoId: "",
        escuela_id: "",
    });

    const obtenerDatos = async () => {
        try {
            const [tRes, eRes] = await Promise.all([
                axios.get(`${API_BASE}/torneos/activos`),
                axios.get(`${API_BASE}/escuelas`),
            ]);
            setTorneos(tRes.data);
            setEscuelas(eRes.data);
        } catch (err) {
            console.error("❌ Error al obtener datos:", err.response?.data || err.message);
        }
    };

    useEffect(() => {
        obtenerDatos();
    }, []);

    const handleChange = (e) => {
        setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_BASE}/participantes`, form);
            alert("Inscripción exitosa");
            setForm({
                nombre: "",
                apellido: "",
                documento: "",
                fechaNacimiento: "",
                cinturon: "",
                peso: "",
                torneoId: "",
                escuela_id: "",
            });
        } catch (err) {
            console.error("❌ Error al inscribir:", err.response?.data || err.message);
            alert("Error al inscribir");
        }
    };

    return (
        <Box
        sx={{
          minHeight: "100vh",
          bgcolor: "#f5f5f5",
          display: "flex",
          justifyContent: "center",
          alignItems: "start", // Podés usar "center" si querés centrar también verticalmente
          pt: 6,
          px: 2,
        }}
      >
        <Box
          sx={{
            width: "100%",
            maxWidth: "1200px",
            bgcolor: "white",
            boxShadow: 3,
            borderRadius: 2,
            p: 4,
          }}
        >
                <Typography variant="h5" gutterBottom>
                    Formulario de Inscripción
                </Typography>
                <form onSubmit={handleSubmit}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth name="nombre" label="Nombre" value={form.nombre} onChange={handleChange} required />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth name="apellido" label="Apellido" value={form.apellido} onChange={handleChange} required />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField fullWidth name="documento" label="Documento" value={form.documento} onChange={handleChange} required />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                name="fechaNacimiento"
                                label="Fecha de Nacimiento"
                                type="date"
                                value={form.fechaNacimiento}
                                onChange={handleChange}
                                InputLabelProps={{ shrink: true }}
                                required
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                            sx={{ minWidth: 150}}

                                select
                                fullWidth
                                name="cinturon"
                                label="Cinturón"
                                value={form.cinturon}
                                onChange={handleChange}
                                required
                            >
                                {cinturonesITF.map((c, index) => (
                                    <MenuItem key={index} value={`${c.grado} - ${c.nombre}`}>
                                        <Box
                                            sx={{
                                                width: 24,
                                                height: 12,
                                                border: "1px solid #ccc",
                                                background: c.color,
                                                display: "inline-block",
                                                mr: 1,
                                                verticalAlign: "middle",
                                            }}
                                        />
                                        {`${c.grado} - ${c.nombre}`}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField fullWidth name="peso" label="Peso (kg)" type="number" value={form.peso} onChange={handleChange} />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                select
                                sx={{ minWidth: 150}}
                                fullWidth
                                name="torneoId"
                                label="Torneo"
                                value={form.torneoId}
                                onChange={handleChange}
                                required
                            >
                                {torneos.length === 0 ? (
                                    <MenuItem disabled>No hay torneos activos</MenuItem>
                                ) : (
                                    torneos.map((t) => (
                                        <MenuItem key={t.id} value={t.id}>
                                            {t.nombre}
                                        </MenuItem>
                                    ))
                                )}
                            </TextField>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                select
                                sx={{ minWidth: 150}}
                                fullWidth
                                name="escuela_id"
                                label="Escuela"
                                value={form.escuela_id}
                                onChange={handleChange}
                                required
                            >
                                {escuelas.map((e) => (
                                    <MenuItem key={e.id} value={e.id}>
                                        {`${e.nombre}, ${e.ciudad}`}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12}>
                            <Button type="submit" fullWidth variant="contained" color="primary">
                                Inscribirse
                            </Button>
                        </Grid>
                    </Grid>
                </form>
            </Box>
        </Box>
    );
};

export default Inscribirse;
