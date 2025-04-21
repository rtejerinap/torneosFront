// src/pages/ParticipanteDetalle.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Box, Typography, CircularProgress, Paper, Divider, Grid } from "@mui/material";

const API_BASE = "https://us-central1-torneos-305d7.cloudfunctions.net/api";

const ParticipanteDetalle = () => {
  const { id } = useParams();
  const [participante, setParticipante] = useState(null);
  const [torneoNombre, setTorneoNombre] = useState("");
  const [escuelaNombre, setEscuelaNombre] = useState("");
  const [instructorNombre, setInstructorNombre] = useState("");
  const [maestroNombre, setMaestroNombre] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const obtenerParticipante = async () => {
      try {
        const res = await axios.get(`${API_BASE}/participantes/${id}`);
        const data = res.data;
        setParticipante(data);

        // Obtener nombres relacionados
        if (data.torneoId) {
          const torneoRes = await axios.get(`${API_BASE}/torneos/${data.torneoId}`);
          setTorneoNombre(torneoRes.data.nombre);
        }
        if (data.escuela_id) {
          const escuelaRes = await axios.get(`${API_BASE}/escuelas/${data.escuela_id}`);
          setEscuelaNombre(escuelaRes.data.nombre);
        }
        if (data.instructorId) {
          const instructorRes = await axios.get(`${API_BASE}/instructores/${data.instructorId}`);
          setInstructorNombre(`${instructorRes.data.nombre} ${instructorRes.data.apellido}`);
        } else if (data.otroInstructor) {
          setInstructorNombre(data.otroInstructor);
        }
        if (data.maestroId) {
          const maestroRes = await axios.get(`${API_BASE}/maestros/${data.maestroId}`);
          setMaestroNombre(`${maestroRes.data.nombre} ${maestroRes.data.apellido}`);
        } else if (data.otroMaestro) {
          setMaestroNombre(data.otroMaestro);
        }

      } catch (error) {
        console.error("Error al obtener participante:", error);
      } finally {
        setLoading(false);
      }
    };

    obtenerParticipante();
  }, [id]);

  if (loading) return <CircularProgress sx={{ display: "block", m: "auto", mt: 4 }} />;
  if (!participante) return <Typography align="center" mt={4}>Participante no encontrado</Typography>;

  return (
    <Box sx={{ maxWidth: 600, mx: "auto", mt: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Información del Participante
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={1}>
          <Grid item xs={12}><strong>Nombre:</strong> {participante.nombre} {participante.apellido}</Grid>
          <Grid item xs={12}><strong>Documento:</strong> {participante.documento}</Grid>
          <Grid item xs={12}><strong>Fecha de Nacimiento:</strong> {participante.fechaNacimiento}</Grid>
          <Grid item xs={12}><strong>Cinturón:</strong> {participante.cinturon}</Grid>
          <Grid item xs={12}><strong>Peso:</strong> {participante.peso} kg</Grid>
          <Grid item xs={12}><strong>Torneo:</strong> {torneoNombre}</Grid>
          <Grid item xs={12}><strong>Escuela:</strong> {escuelaNombre}</Grid>
          <Grid item xs={12}><strong>Instructor:</strong> {instructorNombre || "No especificado"}</Grid>
          <Grid item xs={12}><strong>Maestro:</strong> {maestroNombre || "No especificado"}</Grid>
          <Grid item xs={12}><strong>Modalidades:</strong> {[ 
            participante.tul && "Tul",
            participante.lucha && "Lucha",
            participante.equipos && "Equipos",
            participante.coach && "Coach",
            participante.arbitro && "Árbitro",
            participante.autoridad_mesa && "Autoridad Mesa"
          ].filter(Boolean).join(", ") || "Ninguna"}</Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default ParticipanteDetalle;
