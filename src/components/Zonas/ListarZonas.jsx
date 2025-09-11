
import React, { useEffect, useState } from "react";
import { Typography, CircularProgress, Box, IconButton, Grid, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Tooltip, MenuItem, Select, InputLabel, FormControl } from "@mui/material";
import Autocomplete from '@mui/material/Autocomplete';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL;

const ListarZonas = () => {
  const [zonas, setZonas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editZona, setEditZona] = useState(null);
  const [editNombre, setEditNombre] = useState("");
  const [editDescripcion, setEditDescripcion] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState("");
  const [torneoId, setTorneoId] = useState("");
  const [torneos, setTorneos] = useState([]);
  const [modalIntegrante, setModalIntegrante] = useState({ open: false, zona: null, tipo: '', posicion: null });
  const [participantes, setParticipantes] = useState([]);
  const [selectedParticipante, setSelectedParticipante] = useState(null);
  const [integranteLoading, setIntegranteLoading] = useState(false);
  const [integrantesZona, setIntegrantesZona] = useState({}); // { [participanteId]: participanteData }

  // Obtener datos de integrantes por ID y guardar en cache local
  const fetchIntegrante = async (id) => {
    if (!id) return null;
    if (integrantesZona[id]) return integrantesZona[id];
    try {
      const res = await axios.get(`${API_BASE}/participantes/${id}`);
      setIntegrantesZona(prev => ({ ...prev, [id]: res.data }));
      return res.data;
    } catch {
      return null;
    }
  };

  // Efecto para cargar datos de integrantes al renderizar zonas
  useEffect(() => {
    zonas.forEach(zona => {
      if (zona.autoridadId) fetchIntegrante(zona.autoridadId);
      if (zona.arbitroId) fetchIntegrante(zona.arbitroId);
      if (Array.isArray(zona.juecesId)) zona.juecesId.forEach(jid => jid && fetchIntegrante(jid));
    });
    // eslint-disable-next-line
  }, [zonas]);
  // Abrir modal para agregar/cambiar integrante
  const handleOpenIntegrante = (zona, tipo, posicion = null) => {
    setModalIntegrante({ open: true, zona, tipo, posicion });
    setSelectedParticipante(null);
    let query = '';
    if (tipo === 'autoridad') query = 'autoridad_mesa=true';
    if (tipo === 'arbitro') query = 'arbitro=true';
    if (tipo === 'juez') query = 'juez=true';
    axios.get(`${API_BASE}/participantes/rol?${query}`)
      .then(res => setParticipantes(res.data))
      .catch(() => setParticipantes([]));
  };

  // Guardar integrante en la zona
  const handleSaveIntegrante = async () => {
    if (!selectedParticipante) return;
    setIntegranteLoading(true);
    try {
      const body = {
        tipo: modalIntegrante.tipo,
        participanteId: selectedParticipante.id || selectedParticipante._id
      };
      if (modalIntegrante.tipo === 'juez') {
        body.posicion = modalIntegrante.posicion;
      }
      await axios.put(`${API_BASE}/zonas/${modalIntegrante.zona.id || modalIntegrante.zona._id}/integrante`, body);
      setModalIntegrante({ open: false, zona: null, tipo: '', posicion: null });
      fetchZonas();
    } catch {
      alert('Error al agregar/cambiar integrante');
    } finally {
      setIntegranteLoading(false);
    }
  };

  useEffect(() => {
    axios.get(`${API_BASE}/torneos/activos`).then((res) => setTorneos(res.data));
  }, []);

  const fetchZonas = () => {
    if (!torneoId) {
      setZonas([]);
      return;
    }
    setLoading(true);
    axios.get(`${API_BASE}/zonas?torneoId=${torneoId}`)
      .then(res => setZonas(res.data))
      .catch(() => setError("No se pudieron cargar las zonas."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchZonas();
    // eslint-disable-next-line
  }, [torneoId]);

  const handleEdit = (zona) => {
    setEditZona(zona);
    setEditNombre(zona.nombre);
    setEditDescripcion(zona.descripcion);
  };

  const handleEditSave = async () => {
    setEditLoading(true);
    try {
      await axios.put(`${API_BASE}/zonas/${editZona.id || editZona._id}`, {
        nombre: editNombre,
        descripcion: editDescripcion
      });
      setEditZona(null);
      fetchZonas();
    } catch {
      alert("Error al modificar la zona");
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async (zona) => {
    if (!window.confirm(`¿Eliminar zona "${zona.nombre}"?`)) return;
    setDeleteLoading(zona.id || zona._id);
    try {
      await axios.delete(`${API_BASE}/zonas/${zona.id || zona._id}`);
      fetchZonas();
    } catch {
      alert("Error al eliminar la zona");
    } finally {
      setDeleteLoading("");
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Listado de Zonas</Typography>
      <TextField
        select
        label="Torneo"
        value={torneoId}
        onChange={e => setTorneoId(e.target.value)}
        fullWidth
        sx={{ mb: 2 }}
      >
        {torneos.map((t) => (
          <MenuItem key={t.id} value={t.id}>{t.nombre}</MenuItem>
        ))}
      </TextField>
      {loading && <CircularProgress />}
      {error && <Typography color="error">{error}</Typography>}
      <Grid container spacing={2} sx={{ mt: 2 }}>
        {zonas.map((zona) => (
          <Grid item xs={12} md={6} lg={4} key={zona.id || zona._id}>
            <Box sx={{ border: '1px solid #ddd', borderRadius: 2, p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="h6">{zona.nombre}</Typography>
              <Typography variant="body2" color="text.secondary">{zona.descripcion}</Typography>
              {/* Estado actual de integrantes */}
              <Box sx={{ mt: 1, mb: 1 }}>
                <Typography variant="subtitle2">Autoridad:</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    {zona.autoridadId ? (
                      integrantesZona[zona.autoridadId]
                        ? `${integrantesZona[zona.autoridadId].apellido.toUpperCase()}, ${integrantesZona[zona.autoridadId].nombre.toUpperCase()} - ${integrantesZona[zona.autoridadId].grado || ''} ${integrantesZona[zona.autoridadId].cinturon || ''}`
                        : <span style={{ color: '#aaa' }}>Cargando...</span>
                    ) : 'Sin asignar'}
                  </Typography>
                  <Button size="small" variant="outlined" onClick={() => handleOpenIntegrante(zona, 'autoridad')}>Cambiar</Button>
                </Box>
                <Typography variant="subtitle2" sx={{ mt: 1 }}>Árbitro:</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    {zona.arbitroId ? (
                      integrantesZona[zona.arbitroId]
                        ? `${integrantesZona[zona.arbitroId].apellido.toUpperCase()}, ${integrantesZona[zona.arbitroId].nombre.toUpperCase()} - ${integrantesZona[zona.arbitroId].grado || ''} ${integrantesZona[zona.arbitroId].cinturon || ''}`
                        : <span style={{ color: '#aaa' }}>Cargando...</span>
                    ) : 'Sin asignar'}
                  </Typography>
                  <Button size="small" variant="outlined" onClick={() => handleOpenIntegrante(zona, 'arbitro')}>Cambiar</Button>
                </Box>
                <Typography variant="subtitle2" sx={{ mt: 1 }}>Jueces:</Typography>
                {[0,1,2,3].map((idx) => {
                  const juezId = Array.isArray(zona.juecesId) ? zona.juecesId[idx] : null;
                  return (
                    <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Typography variant="body2" color="text.secondary">
                        {juezId ? (
                          integrantesZona[juezId]
                            ? `${integrantesZona[juezId].apellido.toUpperCase()}, ${integrantesZona[juezId].nombre.toUpperCase()} - ${integrantesZona[juezId].grado || ''} ${integrantesZona[juezId].cinturon || ''}`
                            : <span style={{ color: '#aaa' }}>Cargando...</span>
                        ) : `Sin asignar (${idx + 1})`}
                      </Typography>
                      <Button size="small" variant="outlined" onClick={() => handleOpenIntegrante(zona, 'juez', idx)}>Cambiar</Button>
                    </Box>
                  );
                })}
              </Box>
              <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                <Tooltip title="Modificar">
                  <span>
                    <IconButton color="primary" onClick={() => handleEdit(zona)}>
                      <EditIcon />
                    </IconButton>
                  </span>
                </Tooltip>
                <Tooltip title="Eliminar">
                  <span>
                    <IconButton color="error" onClick={() => handleDelete(zona)} disabled={deleteLoading === (zona.id || zona._id)}>
                      <DeleteIcon />
                    </IconButton>
                  </span>
                </Tooltip>
              </Box>
            </Box>
          </Grid>
        ))}
      </Grid>
      {!loading && zonas.length === 0 && !error && (
        <Typography>No hay zonas registradas.</Typography>
      )}

      {/* Modal de edición */}
      <Dialog open={!!editZona} onClose={() => setEditZona(null)}>
        <DialogTitle>Modificar Zona</DialogTitle>
        <DialogContent>
          <TextField
            label="Nombre"
            value={editNombre}
            onChange={e => setEditNombre(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            label="Descripción"
            value={editDescripcion}
            onChange={e => setEditDescripcion(e.target.value)}
            fullWidth
            multiline
            rows={2}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditZona(null)} disabled={editLoading}>Cancelar</Button>
          <Button onClick={handleEditSave} variant="contained" disabled={editLoading}>
            {editLoading ? "Guardando..." : "Guardar"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal para agregar/cambiar integrante */}
      <Dialog open={modalIntegrante.open} onClose={() => setModalIntegrante({ open: false, zona: null, tipo: '', posicion: null })} maxWidth="sm" fullWidth>
        <DialogTitle>Seleccionar {modalIntegrante.tipo === 'autoridad' ? 'Autoridad' : modalIntegrante.tipo === 'arbitro' ? 'Árbitro' : 'Juez'} para la zona</DialogTitle>
        <DialogContent>
          <Autocomplete
            options={participantes}
            getOptionLabel={(option) => `${option.apellido.toUpperCase()}, ${option.nombre.toUpperCase()} (${option.documento}) - ${option.grado || ''} ${option.cinturon || ''}`}
            value={selectedParticipante}
            onChange={(_, value) => setSelectedParticipante(value)}
            renderInput={(params) => <TextField {...params} label="Participante" fullWidth />}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalIntegrante({ open: false, zona: null, tipo: '', posicion: null })} disabled={integranteLoading}>Cancelar</Button>
          <Button onClick={handleSaveIntegrante} variant="contained" disabled={!selectedParticipante || integranteLoading}>
            {integranteLoading ? 'Guardando...' : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ListarZonas;
