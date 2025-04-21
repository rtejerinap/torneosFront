// src/pages/AdminParticipantes.jsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  Grid,
  Button,
  Modal,
  Paper,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import axios from "axios";

const API_BASE = "https://us-central1-torneos-305d7.cloudfunctions.net/api";

const AdminParticipantes = () => {
  const [torneos, setTorneos] = useState([]);
  const [escuelas, setEscuelas] = useState([]);
  const [participantes, setParticipantes] = useState([]);
  const [filtros, setFiltros] = useState({ torneoId: "", escuelaId: "" });
  const [modalOpen, setModalOpen] = useState(false);
  const [detalle, setDetalle] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [torneosRes, escuelasRes] = await Promise.all([
          axios.get(`${API_BASE}/torneos/activos`),
          axios.get(`${API_BASE}/escuelas`),
        ]);
        setTorneos(torneosRes.data);
        setEscuelas(escuelasRes.data);
      } catch (err) {
        console.error("Error al cargar torneos o escuelas", err);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    setFiltros((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const buscarParticipantes = async () => {
    if (!filtros.torneoId || !filtros.escuelaId) return;
    try {
      const res = await axios.get(
        `${API_BASE}/participantes/torneo/${filtros.torneoId}/escuela/${filtros.escuelaId}`
      );
      setParticipantes(res.data);
    } catch (err) {
      console.error("Error al buscar participantes", err);
    }
  };

  const columnas = [
    { field: "nombre", headerName: "Nombre", flex: 1 },
    { field: "apellido", headerName: "Apellido", flex: 1 },
    { field: "documento", headerName: "Documento", flex: 1 },
    { field: "peso", headerName: "Peso (kg)", flex: 1 },
    { field: "cinturon", headerName: "Cinturón", flex: 1 },
    {
      field: "ver",
      headerName: "Ver Detalles",
      flex: 1,
      renderCell: (params) => (
        <Button
          variant="outlined"
          size="small"
          onClick={() => abrirModal(params.row)}
        >
          Ver
        </Button>
      ),
    },
  ];

  const abrirModal = (datos) => {
    setDetalle(datos);
    setModalOpen(true);
  };

  const cerrarModal = () => setModalOpen(false);

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Gestión de Participantes
      </Typography>
      <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <Grid item xs={12} sm={5}>
          <TextField
            select
            fullWidth
            name="torneoId"
            label="Torneo"
            value={filtros.torneoId}
            onChange={handleChange}
          >
            {torneos.map((t) => (
              <MenuItem key={t.id} value={t.id}>
                {`${t.nombre} - ${t.fecha}`}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12} sm={5}>
          <TextField
            select
            fullWidth
            name="escuelaId"
            label="Escuela"
            value={filtros.escuelaId}
            onChange={handleChange}
          >
            {escuelas.map((e) => (
              <MenuItem key={e.id} value={e.id}>
                {`${e.nombre}, ${e.ciudad}`}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12} sm={2}>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={buscarParticipantes}
          >
            Buscar
          </Button>
        </Grid>
      </Grid>

      <Paper sx={{ height: 500 }}>
        <DataGrid
          rows={participantes.map((p) => ({ id: p.id, ...p }))}
          columns={columnas}
          pageSize={10}
          rowsPerPageOptions={[10, 20, 50]}
        />
      </Paper>

      <Modal open={modalOpen} onClose={cerrarModal}>
  <Box
    sx={{
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      bgcolor: "background.paper",
      boxShadow: 24,
      p: 4,
      borderRadius: 2,
      minWidth: 300,
    }}
  >
    <Typography variant="h6" gutterBottom>
      Datos del Participante
    </Typography>
    {detalle && (
      <Box>
        <Typography>Nombre: {detalle.nombre}</Typography>
        <Typography>Apellido: {detalle.apellido}</Typography>
        <Typography>Documento: {detalle.documento}</Typography>
        <Typography>Fecha Nac: {detalle.fechaNacimiento}</Typography>
        <Typography>Peso: {detalle.peso} kg</Typography>
        <Typography>Cinturón: {detalle.cinturon}</Typography>

        {detalle.qr && (
          <Box mt={2} textAlign="center">
            <Typography variant="subtitle1">Código QR</Typography>
            <img src={detalle.qr} alt="QR Participante" style={{ width: 150 }} />
          </Box>
        )}
      </Box>
    )}
  </Box>
</Modal>

    </Box>
  );
};

export default AdminParticipantes;