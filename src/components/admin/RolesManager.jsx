// src/components/RolesManager.jsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Typography,
  Modal,
  Paper,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Grid,
  Chip,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import axios from "axios";
import CheckIcon from "@mui/icons-material/Check";

const API_BASE = import.meta.env.VITE_API_URL;
const todosLosRoles = ["coach", "instructor", "maestro", "arbitro", "autoridad", "admin"];

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 600,
  bgcolor: "background.paper",
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
};

const RolesManager = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [modalAbierto, setModalAbierto] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [roles, setRoles] = useState([]);

  const obtenerUsuarios = async () => {
    try {
      const res = await axios.get(`${API_BASE}/roles`);
      setUsuarios(res.data);
    } catch (error) {
      console.error("Error al cargar usuarios", error);
    }
  };

  useEffect(() => {
    obtenerUsuarios();
  }, []);

  const abrirModal = (usuario) => {
    setUsuarioSeleccionado(usuario);
    setRoles(usuario.roles || []);
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setUsuarioSeleccionado(null);
  };

  const toggleRol = (rol) => {
    setRoles((prev) =>
      prev.includes(rol) ? prev.filter((r) => r !== rol) : [...prev, rol]
    );
  };

  const guardarRoles = async () => {
    try {
        await axios.put(`${API_BASE}/roles/${usuarioSeleccionado.id}`, {
            roles,
            email: usuarioSeleccionado.email
          });
          
      cerrarModal();
      obtenerUsuarios();
    } catch (error) {
      console.error("❌ Error al guardar roles:", error.response?.data || error.message);
      alert("Ocurrió un error al guardar los roles.");
    }
  };
  

  const columnas = [
    { field: "email", headerName: "Email", width: 250 },
    {
      field: "roles",
      headerName: "Roles",
      flex: 1,
      renderCell: (params) => (
        <Box>
          {(params.value || []).map((rol, i) => (
            <Chip key={i} label={rol} size="small" sx={{ mr: 0.5 }} />
          ))}
        </Box>
      ),
    },
    {
      field: "acciones",
      headerName: "Acciones",
      width: 150,
      renderCell: (params) => (
        <Button variant="outlined" size="small" onClick={() => abrirModal(params.row)}>
          Editar
        </Button>
      ),
    },
  ];

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Gestión de Roles
      </Typography>
      <TextField
        label="Buscar usuario"
        variant="outlined"
        size="small"
        value={filtro}
        onChange={(e) => setFiltro(e.target.value)}
        sx={{ mb: 2 }}
      />
      <Paper sx={{ height: 400 }}>
        <DataGrid
          rows={usuarios.filter((u) => u.email.includes(filtro))}
          columns={columnas}
          pageSize={5}
          rowsPerPageOptions={[5, 10]}
          getRowId={(row) => row.id}
        />
      </Paper>

      <Modal open={modalAbierto} onClose={cerrarModal}>
        <Box sx={style}>
          <Typography variant="h6" gutterBottom>
            Editar roles de {usuarioSeleccionado?.email}
          </Typography>
          <Grid container spacing={2}>
            {todosLosRoles.map((rol) => (
              <Grid item xs={6} key={rol}>
                <Button
                  fullWidth
                  variant={roles.includes(rol) ? "contained" : "outlined"}
                  color="primary"
                  onClick={() => toggleRol(rol)}
                  endIcon={roles.includes(rol) ? <CheckIcon /> : null}
                >
                  {rol}
                </Button>
              </Grid>
            ))}
          </Grid>
          <Box mt={3} sx={{ textAlign: "right" }}>
            <Button onClick={cerrarModal} sx={{ mr: 1 }}>
              Cancelar
            </Button>
            <Button variant="contained" onClick={guardarRoles}>
              Guardar cambios
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default RolesManager;
