import React, { useEffect, useState } from "react";
import { Box, MenuItem, TextField } from "@mui/material";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL;

const TorneoSelector = ({ torneoId, setTorneoId }) => {
  const [torneos, setTorneos] = useState([]);

  useEffect(() => {
    axios.get(`${API_BASE}/torneos/activos`).then(res => setTorneos(res.data));
  }, []);

  return (
    <Box sx={{ mb: 2 }}>
      <TextField
        select
        label="Torneo"
        value={torneoId}
        onChange={e => setTorneoId(e.target.value)}
        sx={{ minWidth: 250 }}
      >
        <MenuItem value="">Seleccione un torneo</MenuItem>
        {torneos.map(t => (
          <MenuItem key={t.id} value={t.id}>{t.nombre}</MenuItem>
        ))}
      </TextField>
    </Box>
  );
};

export default TorneoSelector;
