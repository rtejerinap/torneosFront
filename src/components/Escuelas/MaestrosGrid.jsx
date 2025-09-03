import React, { useEffect, useState } from "react";
import LoadingSvg from "../loader/LoadingSvg";
import { Box, Button, Modal, Typography, IconButton, Paper, TextField, MenuItem } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL;

const grados = [
  "4º Dan",
  "5º Dan",
  "6º Dan",
  "7º Dan",
  "8º Dan",
  "9º Dan",
];

const MaestrosGrid = () => {
  const [maestros, setMaestros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detalle, setDetalle] = useState(null);
  const [modalDetalle, setModalDetalle] = useState(false);
  const [editMaestro, setEditMaestro] = useState(null);
  const [modalEdit, setModalEdit] = useState(false);
  const [deleteMaestro, setDeleteMaestro] = useState(null);
  const [modalDelete, setModalDelete] = useState(false);
  const [paises, setPaises] = useState([]);
  const [provincias, setProvincias] = useState([]);
  const [editForm, setEditForm] = useState({ nombre: "", apellido: "", graduacion: "", paisId: "", provinciaId: "" });
  const { rol } = useAuth();
  const esAdmin = rol && (Array.isArray(rol) ? rol.includes("admin") : rol === "admin");

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchMaestros(), fetchPaisesProvincias()]).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    console.log("Paises cargados:", paises);
    console.log("Provincias cargadas:", provincias);
    console.log("Maestros:", maestros);
  }, [paises, provincias, maestros]);

  useEffect(() => {
    if (modalEdit && editMaestro) {
      setEditForm({
        nombre: editMaestro.nombre || "",
        apellido: editMaestro.apellido || "",
        graduacion: editMaestro.graduacion || "",
        paisId: editMaestro.pais?.id || editMaestro.paisId || "",
        provinciaId: editMaestro.provincia?.id || editMaestro.provinciaId || "",
      });
    }
  }, [modalEdit, editMaestro]);
  const fetchPaisesProvincias = async () => {
    try {
      const [resPaises, resProvincias] = await Promise.all([
        axios.get(`${API_BASE}/paises`),
        axios.get(`${API_BASE}/provincias`),
      ]);
      setPaises(resPaises.data);
      setProvincias(resProvincias.data);
    } catch (error) {
      setPaises([]);
      setProvincias([]);
    }
  };
  const handleEditChange = (e) => {
    setEditForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editMaestro) return;
    try {
      await axios.put(`${API_BASE}/maestros/${editMaestro.id}`, {
        ...editForm,
      });
      setModalEdit(false);
      setEditMaestro(null);
      fetchMaestros();
    } catch (err) {
      alert("Error al actualizar maestro");
    }
  };

  const fetchMaestros = async () => {
    try {
      const res = await axios.get(`${API_BASE}/maestros`);
      setMaestros(res.data);
    } catch (err) {
      setMaestros([]);
    }
  };

  const handleDelete = async () => {
    if (!deleteMaestro) return;
    try {
      await axios.delete(`${API_BASE}/maestros/${deleteMaestro.id}`);
      setModalDelete(false);
      setDeleteMaestro(null);
      fetchMaestros();
    } catch (err) {
      alert("Error al eliminar maestro");
      setModalDelete(false);
      setDeleteMaestro(null);
    }
  };

  const columns = [
    { field: "nombre", headerName: "Nombre", width: 120 },
    { field: "apellido", headerName: "Apellido", width: 120 },
    { field: "graduacion", headerName: "Graduación", width: 120 },
    { field: "pais", headerName: "País", width: 120, renderCell: (params) => {
      if (!params || !params.row) return "";
      const id = params.row.paisId || params.row.pais;
      if (!id || !Array.isArray(paises)) return <span style={{color:'red'}}>{id || ''}</span>;
      const pais = paises.find(p => p.id === id);
      if (!pais) {
        return <span style={{color:'red'}}>{id}</span>;
      }
      return pais.nombre;
    } },
    { field: "provincia", headerName: "Provincia", width: 120, renderCell: (params) => {
      if (!params || !params.row) return "";
      const id = params.row.provinciaId || params.row.provincia;
      if (!id || !Array.isArray(provincias)) return <span style={{color:'red'}}>{id || ''}</span>;
      const prov = provincias.find(p => p.id === id);
      if (!prov) {
        return <span style={{color:'red'}}>{id}</span>;
      }
      return prov.nombre;
    } },
    {
      field: "acciones",
      headerName: "Acciones",
      width: esAdmin ? 150 : 80,
      renderCell: (params) => (
        <Box display="flex" gap={1}>
          <IconButton onClick={() => { setDetalle(params.row); setModalDetalle(true); }} aria-label="Ver detalle">
            <VisibilityIcon sx={{ color: '#1976d2' }} />
          </IconButton>
          {esAdmin && (
            <>
              <IconButton onClick={() => { setEditMaestro(params.row); setModalEdit(true); }} aria-label="Editar">
                <EditIcon sx={{ color: '#1976d2' }} />
              </IconButton>
              <IconButton onClick={() => { setDeleteMaestro(params.row); setModalDelete(true); }} aria-label="Eliminar">
                <DeleteIcon color="error" />
              </IconButton>
            </>
          )}
        </Box>
      )
    }
  ];

  return (
    <Box>
      <Paper sx={{ height: 500, mb: 2 }}>
        {loading ? (
          <LoadingSvg />
        ) : (
          <DataGrid
            rows={maestros.map((m) => ({ id: m.id, ...m }))}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[10, 20, 50]}
          />
        )}
      </Paper>
      {/* Modal detalle */}
      <Modal open={modalDetalle} onClose={() => setModalDetalle(false)}>
        <Box sx={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", bgcolor: "#fff", color: "#000", boxShadow: 24, borderRadius: 2, minWidth: 350, maxWidth: 400, p: 3, textAlign: "center" }}>
          <Typography variant="h6" gutterBottom>Detalle del Maestro</Typography>
          {detalle && (
            <>
              <Typography>Nombre: {detalle.nombre}</Typography>
              <Typography>Apellido: {detalle.apellido}</Typography>
              <Typography>Graduación: {detalle.graduacion}</Typography>
              <Typography>
                País: {(() => {
                  const id = detalle.paisId || detalle.pais;
                  const pais = Array.isArray(paises) ? paises.find(p => p.id === id) : null;
                  return pais ? pais.nombre : <span style={{color:'red'}}>{id}</span>;
                })()}
              </Typography>
              <Typography>
                Provincia: {(() => {
                  const id = detalle.provinciaId || detalle.provincia;
                  const prov = Array.isArray(provincias) ? provincias.find(p => p.id === id) : null;
                  return prov ? prov.nombre : <span style={{color:'red'}}>{id}</span>;
                })()}
              </Typography>
            </>
          )}
          <Button sx={{ mt: 2 }} variant="outlined" onClick={() => setModalDetalle(false)}>Cerrar</Button>
        </Box>
      </Modal>
      {/* Modal editar */}
      <Modal open={modalEdit} onClose={() => setModalEdit(false)}>
        <Box sx={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", bgcolor: "#fff", color: "#000", boxShadow: 24, borderRadius: 2, minWidth: 350, maxWidth: 400, p: 3, textAlign: "center" }}>
          <Typography variant="h6" gutterBottom>Editar Maestro</Typography>
          <form onSubmit={handleEditSubmit}>
            <Box display="flex" flexDirection="column" gap={2}>
              <TextField
                name="nombre"
                label="Nombre"
                value={editForm.nombre}
                onChange={handleEditChange}
                required
              />
              <TextField
                name="apellido"
                label="Apellido"
                value={editForm.apellido}
                onChange={handleEditChange}
                required
              />
              <TextField
                select
                name="graduacion"
                label="Graduación"
                value={editForm.graduacion}
                onChange={handleEditChange}
                required
              >
                {grados.map((grado) => (
                  <MenuItem key={grado} value={grado}>{grado}</MenuItem>
                ))}
              </TextField>
              <TextField
                select
                name="paisId"
                label="País"
                value={editForm.paisId}
                onChange={handleEditChange}
                required
              >
                {paises.map((pais) => (
                  <MenuItem key={pais.id} value={pais.id}>{pais.nombre}</MenuItem>
                ))}
              </TextField>
              <TextField
                select
                name="provinciaId"
                label="Provincia"
                value={editForm.provinciaId}
                onChange={handleEditChange}
                required
              >
                {provincias.map((prov) => (
                  <MenuItem key={prov.id} value={prov.id}>{prov.nombre}</MenuItem>
                ))}
              </TextField>
              <Box display="flex" gap={2} justifyContent="center">
                <Button type="submit" variant="contained">Guardar</Button>
                <Button variant="outlined" onClick={() => setModalEdit(false)}>Cancelar</Button>
              </Box>
            </Box>
          </form>
        </Box>
      </Modal>
      {/* Modal eliminar */}
      <Modal open={modalDelete} onClose={() => setModalDelete(false)}>
        <Box sx={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", bgcolor: "#fff", color: "#000", boxShadow: 24, borderRadius: 2, minWidth: 350, maxWidth: 400, p: 3, textAlign: "center" }}>
          <Typography variant="h6" gutterBottom>¿Seguro que deseas eliminar este maestro?</Typography>
          <Typography fontSize={18} sx={{ mb: 2 }}>{deleteMaestro?.nombre} {deleteMaestro?.apellido}</Typography>
          <Box display="flex" justifyContent="center" gap={2}>
            <Button variant="contained" color="error" onClick={handleDelete}>Eliminar</Button>
            <Button variant="outlined" onClick={() => setModalDelete(false)}>Cancelar</Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default MaestrosGrid;
