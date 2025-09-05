// ✅ Versión MUI v5 (@mui/material v5 y @mui/x-data-grid v5)
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

const grados = ["4º Dan", "5º Dan", "6º Dan", "7º Dan", "8º Dan", "9º Dan"];

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

  // Paginación controlada (v5)
  const [pageSize, setPageSize] = useState(100);

  // IDs estables (string)
  const normalizeId = (r, idx) => {
    if (r?.id) return String(r.id);
    if (r?._id) return String(r._id);
    const composite = [
      r?.apellido ?? "",
      r?.nombre ?? "",
      r?.graduacion ?? "",
      r?.paisId ?? "",
      r?.provinciaId ?? "",
    ].join("|");
    return composite || String(idx);
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchMaestros(), fetchPaisesProvincias()]).finally(() => setLoading(false));
  }, []);

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
      setPaises(Array.isArray(resPaises.data) ? resPaises.data : []);
      setProvincias(Array.isArray(resProvincias.data) ? resProvincias.data : []);
    } catch {
      setPaises([]);
      setProvincias([]);
    }
  };

  const fetchMaestros = async () => {
    try {
      const res = await axios.get(`${API_BASE}/maestros`);
      const rows = (res.data || []).filter(Boolean).map((m, idx) => ({ ...m, id: normalizeId(m, idx) }));
      setMaestros(rows);
    } catch {
      setMaestros([]);
    }
  };

  const handleEditChange = (e) => setEditForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editMaestro) return;
    try {
      await axios.put(`${API_BASE}/maestros/${editMaestro.id}`, { ...editForm });
      setModalEdit(false);
      setEditMaestro(null);
      await fetchMaestros();
    } catch {
      alert("Error al actualizar maestro");
    }
  };

  const handleDelete = async () => {
    if (!deleteMaestro) return;
    try {
      await axios.delete(`${API_BASE}/maestros/${deleteMaestro.id}`);
      setModalDelete(false);
      setDeleteMaestro(null);
      await fetchMaestros();
    } catch {
      alert("Error al eliminar maestro");
      setModalDelete(false);
      setDeleteMaestro(null);
    }
  };

  const columns = [
    { field: "nombre", headerName: "Nombre", width: 140 },
    { field: "apellido", headerName: "Apellido", width: 140 },
    { field: "graduacion", headerName: "Graduación", width: 140 },
    {
      field: "pais",
      headerName: "País",
      width: 160,
      renderCell: (params) => {
        const id = params.row?.paisId || params.row?.pais;
        if (!id || !Array.isArray(paises)) return <span style={{ color: "red" }}>{id || ""}</span>;
        const p = paises.find((x) => x.id === id);
        return p ? p.nombre : <span style={{ color: "red" }}>{id}</span>;
      },
    },
    {
      field: "provincia",
      headerName: "Provincia",
      width: 180,
      renderCell: (params) => {
        const id = params.row?.provinciaId || params.row?.provincia;
        if (!id || !Array.isArray(provincias)) return <span style={{ color: "red" }}>{id || ""}</span>;
        const p = provincias.find((x) => x.id === id);
        return p ? p.nombre : <span style={{ color: "red" }}>{id}</span>;
      },
    },
    {
      field: "acciones",
      headerName: "Acciones",
      width: esAdmin ? 160 : 90,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Box display="flex" gap={1}>
          <IconButton onClick={() => { setDetalle(params.row); setModalDetalle(true); }} aria-label="Ver detalle">
            <VisibilityIcon sx={{ color: "#1976d2" }} />
          </IconButton>
          {esAdmin && (
            <>
              <IconButton onClick={() => { setEditMaestro(params.row); setModalEdit(true); }} aria-label="Editar">
                <EditIcon sx={{ color: "#1976d2" }} />
              </IconButton>
              <IconButton onClick={() => { setDeleteMaestro(params.row); setModalDelete(true); }} aria-label="Eliminar">
                <DeleteIcon color="error" />
              </IconButton>
            </>
          )}
        </Box>
      ),
    },
  ];

  return (
    <Box>
      {/* ⬇️ Quitamos altura fija: NO height en el Paper */}
      <Paper sx={{ mb: 2 }}>
        {loading ? (
          <LoadingSvg />
        ) : (
          <DataGrid
            /* ⬇️ Hace que el grid crezca según el contenido (sin scroll interno) */
            autoHeight

            rows={Array.isArray(maestros) ? maestros : []}
            columns={columns}
            getRowId={(row) => row.id}
            disableSelectionOnClick

            /* Paginado controlado; al cambiar el tamaño de página, el alto se ajusta */
            pageSize={pageSize}
            rowsPerPageOptions={[10, 20, 50, 100]}
            onPageSizeChange={(newSize) => setPageSize(Number(newSize))}
            pagination

            hideFooterSelectedRowCount
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
                  return pais ? pais.nombre : <span style={{ color: "red" }}>{id}</span>;
                })()}
              </Typography>
              <Typography>
                Provincia: {(() => {
                  const id = detalle.provinciaId || detalle.provincia;
                  const prov = Array.isArray(provincias) ? provincias.find(p => p.id === id) : null;
                  return prov ? prov.nombre : <span style={{ color: "red" }}>{id}</span>;
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
              <TextField name="nombre" label="Nombre" value={editForm.nombre} onChange={handleEditChange} required />
              <TextField name="apellido" label="Apellido" value={editForm.apellido} onChange={handleEditChange} required />
              <TextField select name="graduacion" label="Graduación" value={editForm.graduacion} onChange={handleEditChange} required>
                {grados.map((grado) => (
                  <MenuItem key={grado} value={grado}>{grado}</MenuItem>
                ))}
              </TextField>
              <TextField select name="paisId" label="País" value={editForm.paisId} onChange={handleEditChange} required>
                {paises.map((pais) => (
                  <MenuItem key={pais.id} value={pais.id}>{pais.nombre}</MenuItem>
                ))}
              </TextField>
              <TextField select name="provinciaId" label="Provincia" value={editForm.provinciaId} onChange={handleEditChange} required>
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
