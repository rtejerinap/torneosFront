import React from "react";
import { Link } from "react-router-dom";
import { Box, Typography, Button, Grid } from "@mui/material";

const Inicio = () => {
  return (
    <Box sx={{ width: "100%" }}>
      <Typography variant="h4" gutterBottom>
        Bienvenido al sistema de torneos de Taekwondo
      </Typography>
      <Box sx={{ width: "100%", mt: 2, mb: 2 }}>
  {/* Imagen para dispositivos móviles */}
  <Box
    component="img"
    src="./../../public/torneo_m.PNG"
    alt="Banner Torneo Mobile"
    sx={{
      width: "100%",
      display: { xs: "block", md: "none" },
      borderRadius: 2,
    }}
  />

  {/* Imagen para escritorio */}
  <Box
    component="img"
    src="./../../public/torneo.PNG"
    alt="Banner Torneo Desktop"
    sx={{
      width: "100%",
      display: { xs: "none", md: "block" },
      borderRadius: 2,
    }}
  />
</Box>

      <Typography variant="body1" gutterBottom>
        Registrá participantes y gestioná tus torneos con facilidad.
      </Typography>
       
   
    </Box>
  );
};

export default Inicio;
