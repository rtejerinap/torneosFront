import React from "react";
import { Link } from "react-router-dom";
import { Box, Typography, Button, Grid } from "@mui/material";

const Inicio = () => {
  return (
    <Box sx={{ width: "100%" }}>
      <Typography variant="h4" gutterBottom>
        Bienvenido al sistema de torneos de Taekwondo
      </Typography>
      <Typography variant="body1" gutterBottom>
        Registrá participantes y gestioná tus torneos con facilidad.
      </Typography>
      <Grid container spacing={2} mt={2}>
        <Grid item xs={12} sm={6}>
          <Button
            variant="contained"
            color="secondary"
            component={Link}
            to="/inscribirse"
            fullWidth
          >
            Inscribirse
          </Button>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Button variant="outlined" fullWidth disabled>
            Próximamente...
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Inicio;
