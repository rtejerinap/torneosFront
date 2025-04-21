import React from "react";
import { Typography } from "@mui/material";

const Admin = () => {
  return (
    <div>
      <Typography variant="h5" gutterBottom>
        Bienvenido al panel de administración
      </Typography>
      <Typography variant="body1">
        Usá el menú lateral para gestionar torneos, participantes, escuelas y más.
      </Typography>
    </div>
  );
};

export default Admin;
