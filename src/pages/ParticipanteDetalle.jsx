// src/pages/ParticipanteDetalle.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Box, Typography, CircularProgress, Paper, Divider, Grid } from "@mui/material";

const API_BASE = import.meta.env.VITE_API_URL;

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
    <Box
      sx={{
        maxWidth: 600,
        mx: "auto",
        mt: 4,
        bgcolor: "#2c2c2c",
        borderRadius: 2,
        overflow: "hidden",
        boxShadow: 3,
        fontFamily: "Arial, sans-serif",
      }}
    >
      {/* Cabecera con logo */}
      <Box sx={{ bgcolor: "#000", textAlign: "center", p: 2 }}>
        <img
          src="/logo.png"
          alt="Logo"
          style={{
            maxWidth: "100%",
            maxHeight: 80,
            height: "auto",
            objectFit: "contain",
          }}
        />
      </Box>
  
      {/* Contenido blanco con los datos */}
      <Box sx={{ bgcolor: "#fff", color: "#000", textAlign: "center", p: 3 }}>
        <Typography variant="h3" gutterBottom>
          Participante
        </Typography>
        <Typography variant="h5" gutterBottom>
          Torneo: {torneoNombre}
        </Typography>
  
        <Typography fontSize={18}>Nombre: {participante.nombre} {participante.apellido}</Typography>
        <Typography fontSize={18}>Documento: {participante.documento}</Typography>
        <Typography fontSize={18}>Fecha de Nacimiento: {participante.fechaNacimiento}</Typography>
        <Typography fontSize={18}>Cinturón: {participante.cinturon}</Typography>
        <Typography fontSize={18}>Peso: {participante.peso} kg</Typography>
        <Typography fontSize={18}>Escuela: {escuelaNombre}</Typography>
        <Typography fontSize={18}>Instructor: {instructorNombre || "No especificado"}</Typography>
        <Typography fontSize={18}>Maestro: {maestroNombre || "No especificado"}</Typography>
        <Typography fontSize={18}>
          Modalidades: {[ 
            participante.tul && "Tul",
            participante.lucha && "Lucha",
            participante.equipos && "Equipos",
            participante.coach && "Coach",
            participante.arbitro && "Árbitro",
            participante.autoridad_mesa && "Autoridad Mesa"
          ].filter(Boolean).join(", ") || "Ninguna"}
        </Typography>
      </Box>
    </Box>
  );
  
};

export default ParticipanteDetalle;
