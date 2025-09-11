import React, { useEffect, useState } from "react";
import { Box, Typography, Paper, Grid, Chip, Divider, Button } from "@mui/material";
import { CheckCircleOutline, HighlightOff, Person, EmojiEvents, QrCode2 } from "@mui/icons-material";
import axios from "axios";
import LoadingSvg from "/src/components/loader/LoadingSvg";
import { useAuth } from "../context/AuthContext";
import ParticipanteDetalleModal from "../components/ParticipanteDetalleModal";

const API_BASE = import.meta.env.VITE_API_URL;

// Componente para mostrar cada campo de información
const InfoItem = ({ label, value }) => (
  <Typography variant="body1" sx={{ mb: 1 }}>
    <Box component="span" sx={{ fontWeight: 'bold' }}>{label}:</Box> {value}
  </Typography>
);

// Componente para mostrar las modalidades con Chips
const ModalityChip = ({ label, value }) => (
  <Chip
    icon={value ? <CheckCircleOutline /> : <HighlightOff />}
    label={label}
    color={value ? "success" : "default"}
    variant="outlined"
    sx={{ mr: 1, mb: 1 }}
  />
);

const MiInscripcion = () => {
  const { usuario } = useAuth();
  const [participante, setParticipante] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const handleOpenModal = () => setModalOpen(true);
  const handleCloseModal = () => setModalOpen(false);

  useEffect(() => {
    if (!usuario?.uid) return;
    setLoading(true);
    axios.get(`${API_BASE}/participantes/usuario/${usuario.uid}`)
      .then(res => {
        const data = Array.isArray(res.data) ? res.data[0] : res.data;
        setParticipante(data);
      })
      .catch(() => setError("No se encontró inscripción asociada a este usuario."))
      .finally(() => setLoading(false));
  }, [usuario]);

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", mt: { xs: 2, sm: 4 }, px: 2 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ textAlign: 'center' }}>
        Mi Inscripción
      </Typography>
      {loading && <LoadingSvg />}
      {error && <Typography color="error" sx={{ textAlign: 'center' }}>{error}</Typography>}
      
      {participante && (
        <Paper sx={{ p: { xs: 2, sm: 3 }, mt: 2, borderRadius: 3, boxShadow: 3 }}>
          <Typography variant="h5" component="h2" gutterBottom sx={{ textAlign: 'center', fontWeight: 'medium' }}>
            {participante.apellido?.toUpperCase()}, {participante.nombre?.toUpperCase()}
          </Typography>
          <Divider sx={{ my: 2 }} />

          <Grid container spacing={{ xs: 2, md: 4 }}>
            {/* Datos Personales y del Torneo */}
            <Grid item xs={12} md={6}>
              <Box>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}><Person sx={{ mr: 1 }} /> Datos Personales</Typography>
                <InfoItem label="Documento" value={participante.documento} />
                <InfoItem label="Fecha Nac" value={participante.fechaNacimiento} />
                <InfoItem label="Género" value={participante.genero} />
                <InfoItem label="Peso" value={`${participante.peso} kg`} />
                <InfoItem label="Cinturón" value={participante.cinturon} />
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}><EmojiEvents sx={{ mr: 1 }} /> Datos del Torneo</Typography>
                <InfoItem label="Torneo" value={participante.torneo} />
                <InfoItem label="Escuela" value={participante.escuela} />
                <InfoItem label="Maestro" value={participante.maestro} />
                <InfoItem label="Instructor" value={participante.instructor} />
                <InfoItem label="Pagado" value={participante.pagado ? "Sí" : "No"} />
              </Box>
            </Grid>

            {/* Modalidades y Roles */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>Modalidades y Roles</Typography>
              <Box>
                <ModalityChip label="Tul" value={participante.tul} />
                <ModalityChip label="Lucha" value={participante.lucha} />
                <ModalityChip label="Equipos" value={participante.equipos} />
                <ModalityChip label="Coach" value={participante.coach} />
                <ModalityChip label="Árbitro" value={participante.arbitro} />
                <ModalityChip label="Autoridad de Mesa" value={participante.autoridad_mesa} />
              </Box>
            </Grid>

            {/* Código QR -> Ahora Credencial Digital Modal */}
            {participante.qr && (
              <Grid item xs={12} sx={{ textAlign: 'center', mt: 2 }}>
                <Divider sx={{ my: 2 }} />
                <Button 
                  variant="contained" 
                  onClick={handleOpenModal}
                  startIcon={<QrCode2 />}
                >
                  Ver Credencial Digital
                </Button>
              </Grid>
            )}
          </Grid>
        </Paper>
      )}

      {participante && (
        <ParticipanteDetalleModal
          open={modalOpen}
          onClose={handleCloseModal}
          participanteId={participante.id}
          torneoNombre={participante.torneo}
        />
      )}

      {!loading && !participante && !error && (
        <Typography sx={{ textAlign: 'center', mt: 4 }}>No tienes ninguna inscripción registrada.</Typography>
      )}
    </Box>
  );
};

export default MiInscripcion;