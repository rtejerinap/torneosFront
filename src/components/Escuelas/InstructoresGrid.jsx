// ✅ Versión para MUI v5 (@mui/material v5 y @mui/x-data-grid v5)
import React, { useEffect, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Box, IconButton, Modal, Typography, Button, TextField, MenuItem } from "@mui/material";
import axios from "axios";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import LoadingSvg from "../loader/LoadingSvg";

const API_BASE = import.meta.env.VITE_API_URL;

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

const InstructoresGrid = () => {
  const [instructores, setInstructores] = useState([]);
  const [maestros, setMaestros] = useState([]);
  const [paises, setPaises] = useState([]);
  const [provincias, setProvincias] = useState([]);
  const [selected, setSelected] = useState(null);
  const [editForm, setEditForm] = useState({ nombre: '', apellido: '', graduacion: '', paisId: '', provinciaId: '', maestroId: '' });
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState('view');
  const [loading, setLoading] = useState(true);

  const [modalParticipantes, setModalParticipantes] = useState(false);
  const [participantes, setParticipantes] = useState([]);
  const [torneoSel, setTorneoSel] = useState("");
  const [torneos, setTorneos] = useState([]);
  const [loadingParticipantes, setLoadingParticipantes] = useState(false);

  // ✅ paginación controlada (v5)
  const [pageSize, setPageSize] = useState(8);

  // Normalizador de ID estable (sin Math.random)
  const normalizeId = (r, idx) => {
    if (r?.id) return String(r.id);
    if (r?._id) return String(r._id);
    // Fallback "estable" por combinación de campos (mejor que índice suelto)
    const composite = [
      r?.apellido ?? "",
      r?.nombre ?? "",
      r?.graduacion ?? "",
      r?.paisId ?? "",
      r?.provinciaId ?? "",
      r?.maestroId ?? "",
    ].join("|");
    return composite || String(idx);
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [resInstructores, resMaestros, resPaises, resProvincias, resTorneos] = await Promise.all([
          axios.get(`${API_BASE}/instructores`),
          axios.get(`${API_BASE}/maestros`),
          axios.get(`${API_BASE}/paises`),
          axios.get(`${API_BASE}/provincias`),
          axios.get(`${API_BASE}/torneos/activos`),
        ]);

        // ✅ IDs estables para el DataGrid (todo string)
        const rowsInstructores = (resInstructores.data || [])
          .filter(Boolean)
          .map((i, idx) => ({ ...i, id: normalizeId(i, idx) }));

        setInstructores(rowsInstructores);
        setMaestros(Array.isArray(resMaestros.data) ? resMaestros.data : []);
        setPaises(Array.isArray(resPaises.data) ? resPaises.data : []);
        setProvincias(Array.isArray(resProvincias.data) ? resProvincias.data : []);
        setTorneos(Array.isArray(resTorneos.data) ? resTorneos.data : []);
      } catch (error) {
        setInstructores([]);
        setMaestros([]);
        setPaises([]);
        setProvincias([]);
        setTorneos([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleConsultarParticipantes = (row) => {
    setSelected(row);
    setTorneoSel("");
    setParticipantes([]);
    setModalParticipantes(true);
  };

  const fetchParticipantesInstructor = async () => {
    if (!selected || !torneoSel) return;
    setLoadingParticipantes(true);
    try {
      const res = await axios.get(`${API_BASE}/participantes/torneo/${torneoSel}/instructor/${selected.id}`);
      setParticipantes(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setParticipantes([]);
    } finally {
      setLoadingParticipantes(false);
    }
  };

  const getNombreMaestro = (id) => {
    if (!id) return "-";
    const m = maestros.find((maestro) => maestro && maestro.id === id);
    return m ? `${m.apellido}, ${m.nombre} (${m.graduacion})` : "-";
  };
  const getNombrePais = (id) => {
    if (!id) return "-";
    const p = paises.find((pais) => pais && pais.id === id);
    return p ? p.nombre : "-";
  };
  const getNombreProvincia = (id) => {
    if (!id) return "-";
    const p = provincias.find((prov) => prov && prov.id === id);
    return p ? p.nombre : "-";
  };

  const handleView = (row) => {
    setSelected(row);
    setModalType('view');
    setModalOpen(true);
  };
  const handleEdit = (row) => {
    setSelected(row);
    setEditForm({
      nombre: row.nombre || '',
      apellido: row.apellido || '',
      graduacion: row.graduacion || '',
      paisId: row.paisId || '',
      provinciaId: row.provinciaId || '',
      maestroId: row.maestroId || '',
    });
    setModalType('edit');
    setModalOpen(true);
  };

  const handleEditChange = (e) => {
    setEditForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selected) return;
    setSaving(true);
    try {
      await axios.put(`${API_BASE}/instructores/${selected.id}`, editForm);

      setModalOpen(false);
      setSelected(null);
      setEditForm({ nombre: '', apellido: '', graduacion: '', paisId: '', provinciaId: '', maestroId: '' });

      // Refrescar instructores con IDs estables
      const res = await axios.get(`${API_BASE}/instructores`);
      const rowsInstructores = (res.data || [])
        .filter(Boolean)
        .map((i, idx) => ({ ...i, id: normalizeId(i, idx) }));
      setInstructores(rowsInstructores);
    } catch (err) {
      alert("Error al actualizar instructor");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (row) => {
    if (window.confirm("¿Seguro que desea eliminar este instructor?")) {
      try {
        await axios.delete(`${API_BASE}/instructores/${row.id}`);
        setInstructores((prev) => prev.filter((i) => i.id !== row.id));
      } catch (error) {
        alert("Error al eliminar instructor");
      }
    }
  };

  const columns = [
    { field: "apellido", headerName: "Apellido", flex: 1 },
    { field: "nombre", headerName: "Nombre", flex: 1 },
    { field: "graduacion", headerName: "Graduación", flex: 1 },
    {
      field: "paisId",
      headerName: "País",
      flex: 1,
      renderCell: (params) => {
        const id = params.row?.paisId;
        if (!id || !Array.isArray(paises)) return <span style={{ color: 'red' }}>{id || ''}</span>;
        const pais = paises.find(p => p.id === id);
        if (!pais) return <span style={{ color: 'red' }}>{id}</span>;
        return pais.nombre;
      }
    },
    {
      field: "provinciaId",
      headerName: "Provincia",
      flex: 1,
      renderCell: (params) => {
        const id = params.row?.provinciaId;
        if (!id || !Array.isArray(provincias)) return <span style={{ color: 'red' }}>{id || ''}</span>;
        const prov = provincias.find(p => p.id === id);
        if (!prov) return <span style={{ color: 'red' }}>{id}</span>;
        return prov.nombre;
      }
    },
    {
      field: "maestroId",
      headerName: "Maestro",
      flex: 1.5,
      renderCell: (params) => {
        const id = params.row?.maestroId;
        if (!id || !Array.isArray(maestros)) return <span style={{ color: 'red' }}>{id || ''}</span>;
        const m = maestros.find(maestro => maestro.id === id);
        if (!m) return <span style={{ color: 'red' }}>{id}</span>;
        return `${m.apellido}, ${m.nombre} (${m.graduacion})`;
      }
    },
    {
      field: "acciones",
      headerName: "Acciones",
      flex: 1,
      minWidth: 200,
      renderCell: (params) => (
        <Box display="flex" gap={1}>
          <IconButton onClick={() => params.row && handleView(params.row)} aria-label="Ver detalle">
            <VisibilityIcon sx={{ color: '#1976d2' }} />
          </IconButton>
          <IconButton onClick={() => params.row && handleEdit(params.row)} aria-label="Editar">
            <EditIcon sx={{ color: '#1976d2' }} />
          </IconButton>
          <IconButton onClick={() => params.row && handleDelete(params.row)} aria-label="Eliminar">
            <DeleteIcon color="error" />
          </IconButton>
          <IconButton onClick={() => params.row && handleConsultarParticipantes(params.row)} aria-label="Consultar participantes">
            <SearchIcon sx={{ color: '#1976d2' }} />
          </IconButton>
        </Box>
      ),
      disableExport: true,
      filterable: false,
    },
  ];

  return (
    <Box sx={{ width: '100%', mt: 2 }}>
      {loading ? (
        <LoadingSvg />
      ) : (
        <DataGrid
          autoHeight
          rows={Array.isArray(instructores) ? instructores : []}
          columns={columns}

          // ✅ paginación (v5 controlada)
          pageSize={pageSize}
          rowsPerPageOptions={[8, 20, 50, 100]}
          onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
          pagination

          // IDs estables
          getRowId={(row) => row.id}

          // v5
          disableSelectionOnClick
          // Evita problemas en footer con selección (si lo tuvieras)
          hideFooterSelectedRowCount
        />
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <Box sx={style}>
          {modalType === 'view' && selected && (
            <>
              <Typography variant="h6">Detalle del Instructor</Typography>
              <Typography>Apellido: {selected.apellido}</Typography>
              <Typography>Nombre: {selected.nombre}</Typography>
              <Typography>Graduación: {selected.graduacion}</Typography>
              <Typography>País: {getNombrePais(selected.paisId)}</Typography>
              <Typography>Provincia: {getNombreProvincia(selected.provinciaId)}</Typography>
              <Typography>Maestro: {getNombreMaestro(selected.maestroId)}</Typography>
              <Button onClick={() => setModalOpen(false)} sx={{ mt: 2 }}>Cerrar</Button>
            </>
          )}
          {modalType === 'edit' && selected && (
            <form onSubmit={handleEditSubmit}>
              <Typography variant="h6" gutterBottom>Editar Instructor</Typography>
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
                  {["1º Dan","2º Dan","3º Dan","4º Dan","5º Dan","6º Dan","7º Dan","8º Dan"].map((grado) => (
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
                <TextField
                  select
                  name="maestroId"
                  label="Maestro"
                  value={editForm.maestroId}
                  onChange={handleEditChange}
                  required
                >
                  {maestros.map((m) => (
                    <MenuItem key={m.id} value={m.id}>{`${m.apellido}, ${m.nombre} (${m.graduacion})`}</MenuItem>
                  ))}
                </TextField>
                <Box display="flex" gap={2} justifyContent="center">
                  <Button type="submit" variant="contained" disabled={saving}>{saving ? "Guardando..." : "Guardar"}</Button>
                  <Button variant="outlined" onClick={() => setModalOpen(false)} disabled={saving}>Cancelar</Button>
                </Box>
              </Box>
            </form>
          )}
        </Box>
      </Modal>

      {/* Modal participantes por instructor y torneo */}
      <Modal open={modalParticipantes} onClose={() => setModalParticipantes(false)}>
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: '#fff', color: '#000', boxShadow: 24, borderRadius: 2, minWidth: 350, maxWidth: 600, p: 3, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>Participantes de {selected?.nombre} {selected?.apellido}</Typography>
          <TextField
            select
            label="Torneo"
            value={torneoSel}
            onChange={e => setTorneoSel(e.target.value)}
            sx={{ minWidth: 220, mb: 2 }}
          >
            <MenuItem value="">Seleccione un torneo</MenuItem>
            {torneos.map((t) => (
              <MenuItem key={t.id} value={t.id}>{t.nombre}</MenuItem>
            ))}
          </TextField>
          <Button variant="contained" onClick={fetchParticipantesInstructor} disabled={!torneoSel || loadingParticipantes} sx={{ ml: 2 }}>
            {loadingParticipantes ? "Cargando..." : "Consultar"}
          </Button>
          <Box sx={{ mt: 2, maxHeight: 300, overflowY: 'auto' }}>
            {participantes.length > 0 ? (
              <>
                <Typography variant="subtitle1">Total: {participantes.length}</Typography>
                <ul style={{ textAlign: 'left', margin: 0, padding: 0 }}>
                  {participantes.map((p) => (
                    <li key={p.id} style={{ marginBottom: 4 }}>
                      {p.apellido}, {p.nombre} - {p.documento}
                    </li>
                  ))}
                </ul>
              </>
            ) : torneoSel && !loadingParticipantes ? (
              <Typography variant="body2">No hay participantes para este instructor en el torneo seleccionado.</Typography>
            ) : null}
          </Box>
          <Button variant="outlined" sx={{ mt: 2 }} onClick={() => setModalParticipantes(false)}>Cerrar</Button>
        </Box>
      </Modal>
    </Box>
  );
};

export default InstructoresGrid;
