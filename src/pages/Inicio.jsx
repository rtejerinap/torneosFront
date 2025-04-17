import React from "react";
import { Link } from "react-router-dom";
import { Button, Typography, Box } from "@mui/material";

const Inicio = () => {
  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        gap: 2,
      }}
    >
      <Typography variant="h4" gutterBottom>
        Bienvenido al sistema de torneos de Taekwondo
      </Typography>
      <Typography variant="body1">
        Registrá participantes y gestioná tus torneos con facilidad.
      </Typography>
      <Button
        variant="contained"
        color="secondary"
        component={Link}
        to="/inscribirse"
        sx={{ mt: 2 }}
      >
        Inscribirse
      </Button>
    </Box>
  );
};

export default Inicio;
