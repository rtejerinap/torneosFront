
import { Checkbox, CircularProgress, TextField, Button, MenuItem, Grid, Typography, Box, Divider, Tabs, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, List, ListItem, ListItemText } from '@mui/material';
import dayjs from 'dayjs';

import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import GroupIcon from '@mui/icons-material/Group';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
const BracketView = React.lazy(() => import('./Combates/BracketView'));

const API_BASE = import.meta.env.VITE_API_URL;

// Función para calcular la edad
const calcularEdad = (fechaNacimiento) => {
  if (!fechaNacimiento) return '';
  const hoy = dayjs();
  const nacimiento = dayjs(fechaNacimiento);
  return hoy.diff(nacimiento, 'year');
};
const rangoEdades = [
  { label: '5 a 6 años', min: 5, max: 6 },
  { label: '7 a 8 años', min: 7, max: 8 },
  { label: '9 a 10 años', min: 9, max: 10 },
  { label: '11 a 13 años', min: 11, max: 13 },
  { label: '14 a 15 años', min: 14, max: 15 },
  { label: '16 a 17 años', min: 16, max: 17 },
  { label: '18 a 29 años', min: 18, max: 29 },
  { label: '30 a 39 años', min: 30, max: 39 },
  { label: '40 a 49 años', min: 40, max: 49 },
  { label: '50 a 59 años', min: 50, max: 59 },
  { label: '60+ años', min: 60, max: 99 }
];

const rangoPesos = [
  { label: '-40 kg', min: 0, max: 40 },
  { label: '-45 kg', min: 41, max: 45 },
  { label: '-50 kg', min: 46, max: 50 },
  { label: '-57 kg', min: 51, max: 57 },
  { label: '-64 kg', min: 58, max: 64 },
  { label: '-71 kg', min: 65, max: 71 },
  { label: '-78 kg', min: 72, max: 78 },
  { label: '-85 kg', min: 79, max: 85 },
  { label: '+85 kg', min: 86, max: 200 }
];

const ORDEN_CINTURONES = [
  '10º Gup - Blanco',
  '9º Gup - Blanco punta amarilla',
  '8º Gup - Amarillo',
  '7º Gup - Amarillo punta verde',
  '6º Gup - Verde',
  '5º Gup - Verde punta azul',
  '4º Gup - Azul',
  '3º Gup - Azul punta roja',
  '2º Gup - Rojo',
  '1º Gup - Rojo punta negra',
  '1º Dan - Negro',
  '2º Dan - Negro',
  '3º Dan - Negro',
  '4º Dan - Negro',
  '5º Dan - Negro',
  '6º Dan - Negro'
];

const tiemposRound = [
  { label: '60 segundos', value: 60 },
  { label: '90 segundos', value: 90 },
  { label: '120 segundos', value: 120 }
];

const Categorias = () => {
  const { rol } = useAuth();
  const isAdmin = rol && rol.includes('admin');
  const [modalLlave, setModalLlave] = useState({ open: false, llaveId: null });
  const [seleccionados, setSeleccionados] = useState([]);
  const [modalParticipantes, setModalParticipantes] = useState({ open: false, categoria: null, participantes: [], loading: false });
  const [tab, setTab] = useState(0);
  const [torneos, setTorneos] = useState([]);
  const [form, setForm] = useState({
    sexo: '', edad_min: '', edad_max: '', peso_minimo: '', peso_maximo: '',
    graduacion_desde: '', graduacion_hasta: '', tiempo_por_round_preliminar: '',
    cantidad_de_rounds_preliminar: '', tiempo_por_round_final: '', cantidad_de_rounds_final: '',
    tiempo_extra: '', id_torneo: ''
  });
  const [categorias, setCategorias] = useState([]);
  const [torneoSel, setTorneoSel] = useState('');
  const [filtroSexo, setFiltroSexo] = useState('');
  const [filtroRango, setFiltroRango] = useState('');
  const [filtroModalidad, setFiltroModalidad] = useState('');
  const [modal, setModal] = useState({ open: false, type: '', categoria: null });
  const [editForm, setEditForm] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const fieldStyle = { minWidth: 180 };

  useEffect(() => {
    axios.get(`${API_BASE}/torneos/activos`).then(res => setTorneos(res.data)).catch(() => setTorneos([]));
  }, []);

  useEffect(() => {
    if (tab === 1 && torneoSel && filtroSexo && filtroRango && filtroModalidad) {
      axios.get(`${API_BASE}/api/categorias/filtrar?sexo=${filtroSexo}&rango=${filtroRango}&id_torneo=${torneoSel}&modalidad=${filtroModalidad}`)
        .then(res => setCategorias(res.data))
        .catch(() => setCategorias([]));
    } else {
      setCategorias([]);
    }
  }, [tab, torneoSel, filtroSexo, filtroRango, filtroModalidad]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const numericFields = [
      'edad_min', 'edad_max', 'peso_minimo', 'peso_maximo',
      'tiempo_por_round_preliminar', 'cantidad_de_rounds_preliminar',
      'tiempo_por_round_final', 'cantidad_de_rounds_final', 'tiempo_extra'
    ];
    setForm({ ...form, [name]: numericFields.includes(name) ? parseInt(value) : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const edadSel = rangoEdades.find(r => r.min === form.edad_min);
    const pesoSel = rangoPesos.find(r => r.min === form.peso_minimo);
    const nombreAuto = `${form.sexo} | ${edadSel?.label} | ${pesoSel?.label} | ${form.graduacion_desde} a ${form.graduacion_hasta}`;
    const indiceGraduacionMin = ORDEN_CINTURONES.findIndex(g => g === form.graduacion_desde);
    const indiceGraduacionMax = ORDEN_CINTURONES.findIndex(g => g === form.graduacion_hasta);
    const payload = {
      ...form,
      nombre: nombreAuto,
      graduacion_desde_index: indiceGraduacionMin,
      graduacion_hasta_index: indiceGraduacionMax
    };
    try {
      const res = await fetch(`${API_BASE}/api/categorias`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const contentType = res.headers.get("content-type");
      if (!res.ok || !contentType?.includes("application/json")) {
        const text = await res.text();
        console.error("Respuesta no válida:", text);
        alert("Error del servidor al crear la categoría.");
        return;
      }
      const result = await res.json();
      if (res.ok) {
        alert('Categoría creada con éxito');
        setForm({
          sexo: '', edad_min: '', edad_max: '', peso_minimo: '', peso_maximo: '',
          graduacion_desde: '', graduacion_hasta: '', tiempo_por_round_preliminar: '',
          cantidad_de_rounds_preliminar: '', tiempo_por_round_final: '', cantidad_de_rounds_final: '',
          tiempo_extra: '', id_torneo: ''
        });
      } else {
        alert(result.error || 'Error al crear categoría');
      }
    } catch (err) {
      console.error('Error al enviar datos:', err);
      alert('Error al enviar datos');
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 900, margin: '0 auto' }}>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        {isAdmin && <Tab label="Crear categoría" />}
        <Tab label="Ver categorías" />
      </Tabs>
      {isAdmin && tab === 0 && (
        <>
          <Typography variant="h5" gutterBottom>Crear Categoría de Combate</Typography>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField select label="Sexo" name="sexo" value={form.sexo} onChange={handleChange} sx={fieldStyle} fullWidth>
                  <MenuItem value="masculino">Masculino</MenuItem>
                  <MenuItem value="femenino">Femenino</MenuItem>
                  <MenuItem value="mixto">Mixto</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField select label="Rango de Edad" name="edad_min" value={form.edad_min && form.edad_max ? `${form.edad_min}-${form.edad_max}` : ''}
                  onChange={(e) => {
                    const r = rangoEdades.find(opt => `${opt.min}-${opt.max}` === e.target.value);
                    if (r) setForm({ ...form, edad_min: r.min, edad_max: r.max });
                  }} sx={fieldStyle} fullWidth>
                  {rangoEdades.map((r) => (
                    <MenuItem key={r.label} value={`${r.min}-${r.max}`}>{r.label}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField select label="Rango de Peso" name="peso_minimo" value={form.peso_minimo && form.peso_maximo ? `${form.peso_minimo}-${form.peso_maximo}` : ''}
                  onChange={(e) => {
                    const r = rangoPesos.find(opt => `${opt.min}-${opt.max}` === e.target.value);
                    if (r) setForm({ ...form, peso_minimo: r.min, peso_maximo: r.max });
                  }} sx={fieldStyle} fullWidth>
                  {rangoPesos.map((r) => (
                    <MenuItem key={r.label} value={`${r.min}-${r.max}`}>{r.label}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField select label="Graduación Desde" name="graduacion_desde" value={form.graduacion_desde} onChange={handleChange} sx={fieldStyle} fullWidth>
                  {ORDEN_CINTURONES.map((g) => (
                    <MenuItem key={g} value={g}>{g}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField select label="Graduación Hasta" name="graduacion_hasta" value={form.graduacion_hasta} onChange={handleChange} sx={fieldStyle} fullWidth>
                  {ORDEN_CINTURONES.map((g) => (
                    <MenuItem key={g} value={g}>{g}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12}><Divider sx={{ my: 2 }} /><Typography variant="h6">Preliminares</Typography></Grid>
              <Grid item xs={12} sm={6}>
                <TextField select label="Tiempo por round (preliminar)" name="tiempo_por_round_preliminar" value={form.tiempo_por_round_preliminar} onChange={handleChange} sx={fieldStyle} fullWidth>
                  {tiemposRound.map((op) => (
                    <MenuItem key={op.value} value={op.value}>{op.label}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField type="number" label="Cantidad de rounds (preliminar)" name="cantidad_de_rounds_preliminar" value={form.cantidad_de_rounds_preliminar} onChange={handleChange} fullWidth />
              </Grid>
              <Grid item xs={12}><Divider sx={{ my: 2 }} /><Typography variant="h6">Finales</Typography></Grid>
              <Grid item xs={12} sm={6}>
                <TextField select label="Tiempo por round (final)" name="tiempo_por_round_final" value={form.tiempo_por_round_final} onChange={handleChange} sx={fieldStyle} fullWidth>
                  {tiemposRound.map((op) => (
                    <MenuItem key={op.value} value={op.value}>{op.label}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField type="number" label="Cantidad de rounds (final)" name="cantidad_de_rounds_final" value={form.cantidad_de_rounds_final} onChange={handleChange} fullWidth />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField type="number" label="Tiempo extra (segundos)" name="tiempo_extra" value={form.tiempo_extra} onChange={handleChange} fullWidth />
              </Grid>
              <Grid item xs={12}>
                <TextField select label="Torneo" name="id_torneo" value={form.id_torneo} onChange={handleChange} sx={fieldStyle} fullWidth>
                  {torneos.map((torneo) => (
                    <MenuItem key={torneo.id} value={torneo.id}>{torneo.nombre}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <Button type="submit" variant="contained" fullWidth>
                  Crear Categoría
                </Button>
              </Grid>
            </Grid>
          </form>
        </>
      )}
      {tab === (isAdmin ? 1 : 0) && (
        <Box>
          <Typography variant="h5" gutterBottom>Listado de Categorías</Typography>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={3}>
              <TextField
                select
                label="Seleccionar Torneo"
                value={torneoSel}
                onChange={e => setTorneoSel(e.target.value)}
                fullWidth
              >
                <MenuItem value="">Seleccione un torneo</MenuItem>
                {torneos.map((torneo) => (
                  <MenuItem key={torneo.id} value={torneo.id}>{torneo.nombre}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                select
                label="Sexo"
                value={filtroSexo}
                onChange={e => setFiltroSexo(e.target.value)}
                fullWidth
              >
                <MenuItem value="">Seleccione sexo</MenuItem>
                <MenuItem value="masculino">Masculino</MenuItem>
                <MenuItem value="femenino">Femenino</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                select
                label="Rango de edad"
                value={filtroRango}
                onChange={e => setFiltroRango(e.target.value)}
                fullWidth
              >
                <MenuItem value="">Seleccione rango</MenuItem>
                <MenuItem value="infantiles">Infantiles (5-13)</MenuItem>
                <MenuItem value="juvenilesA">Juveniles A (13-14)</MenuItem>
                <MenuItem value="juvenilesB">Juveniles B (16-17)</MenuItem>
                <MenuItem value="mayores">Mayores (18-34)</MenuItem>
                <MenuItem value="mayoresPlata">Mayores Plata (35-44)</MenuItem>
                <MenuItem value="mayoresOro">Mayores Oro (45-59)</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                select
                label="Modalidad"
                value={filtroModalidad}
                onChange={e => setFiltroModalidad(e.target.value)}
                fullWidth
              >
                <MenuItem value="">Seleccione modalidad</MenuItem>
                <MenuItem value="Lucha">Lucha</MenuItem>
                <MenuItem value="tul">Tul</MenuItem>
              </TextField>
            </Grid>
          </Grid>
          {torneoSel && filtroSexo && filtroRango && (
            <TableContainer component={Paper} sx={{ mt: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Nombre</TableCell>
                    <TableCell>Sexo</TableCell>
                    <TableCell>Edad</TableCell>
                    <TableCell>Peso</TableCell>
                    <TableCell>Graduación</TableCell>
                    <TableCell align="center">Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {categorias.map((cat) => (
                    <TableRow key={cat.id}>
                      <TableCell>{cat.nombre}</TableCell>
                      <TableCell>{cat.sexo}</TableCell>
                      <TableCell>{cat.edad_min} - {cat.edad_max}</TableCell>
                      <TableCell>{cat.peso_minimo} - {cat.peso_maximo} kg</TableCell>
                      <TableCell>{cat.graduacion_desde} a {cat.graduacion_hasta}</TableCell>
                      <TableCell align="center">
                        <IconButton size="small" sx={{ color: '#1976d2' }} onClick={() => setModal({ open: true, type: 'view', categoria: cat })} title="Ver detalles"><VisibilityIcon /></IconButton>
                        {isAdmin && <IconButton size="small" sx={{ color: '#1976d2' }} onClick={() => { setEditForm(cat); setModal({ open: true, type: 'edit', categoria: cat }); }} title="Editar"><EditIcon /></IconButton>}
                        {isAdmin && <IconButton size="small" color="error" onClick={() => setModal({ open: true, type: 'delete', categoria: cat })} title="Eliminar"><DeleteIcon /></IconButton>}
                        <IconButton size="small" sx={{ color: '#388e3c' }} onClick={async () => {
                          setModalParticipantes({ open: true, categoria: cat, participantes: [], loading: true });
                          try {
                            const res = await fetch(`${API_BASE}/api/categorias/${cat.id}/participantes`);
                            const data = await res.json();
                            setModalParticipantes({ open: true, categoria: cat, participantes: data, loading: false });
                          } catch (error) {
                            setModalParticipantes({ open: true, categoria: cat, participantes: [], loading: false });
                          }
                        }} title="Ver participantes"><GroupIcon /></IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      )}
      {/* Modals: Participantes, BracketView, Ver, Editar, Eliminar (same as before) */}
      {/* Modal Participantes por Categoría */}
      <Dialog open={modalParticipantes.open} onClose={() => setModalParticipantes({ open: false, categoria: null, participantes: [], loading: false })} maxWidth="sm" fullWidth>
        <DialogTitle>Participantes de la Categoría</DialogTitle>
        <DialogContent dividers>
          {modalParticipantes.loading ? (
            <Box display="flex" justifyContent="center" mt={2}><CircularProgress /></Box>
          ) : (
            <>
              <Typography variant="subtitle1" gutterBottom>
                Categoría: <b>{modalParticipantes.categoria?.nombre}</b>
              </Typography>
              <Typography variant="subtitle2" gutterBottom>
                Participantes encontrados: {modalParticipantes.participantes.length}
              </Typography>
              {isAdmin && (
                <Box mb={2}>
                  <Button
                    variant="contained"
                    color="primary"
                    disabled={seleccionados.length === 0}
                    onClick={async () => {
                      try {
                        await fetch(`${API_BASE}/combates/generar-llaves-manual`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            categoriaId: modalParticipantes.categoria?.id,
                            participanteIds: seleccionados,
                            tipoLlave: modalParticipantes.categoria?.modalidad || 'lucha'
                          })
                        });
                        alert('Llave generada correctamente');
                        setSeleccionados([]);
                        // Recargar participantes
                        setModalParticipantes((prev) => ({ ...prev, loading: true }));
                        try {
                          const res = await fetch(`${API_BASE}/api/categorias/${modalParticipantes.categoria?.id}/participantes`);
                          const data = await res.json();
                          setModalParticipantes((prev) => ({ ...prev, participantes: data, loading: false }));
                        } catch (error) {
                          setModalParticipantes((prev) => ({ ...prev, participantes: [], loading: false }));
                        }
                      } catch (err) {
                        alert('Error al generar la llave');
                      }
                    }}
                  >
                    Generar llave manual
                  </Button>
                </Box>
              )}
              <List>
                {modalParticipantes.participantes.map((p) => {
                  const modalidad = modalParticipantes.categoria?.modalidad;
                  const llaveId = modalidad === 'Lucha' ? p.llave_lucha_id : p.llave_tul_id;

                  return (
                    <React.Fragment key={p.id}>
                      <ListItem
                        secondaryAction={
                          llaveId ? (
                            <IconButton edge="end" title="Ver llave" onClick={() => setModalLlave({ open: true, llaveId: llaveId })}>
                              <VisibilityIcon />
                            </IconButton>
                          ) : (
                            isAdmin ? (
                              <Checkbox
                                edge="end"
                                checked={seleccionados.includes(p.id)}
                                onChange={(_, checked) => {
                                  setSeleccionados((prev) =>
                                    checked
                                      ? [...prev, p.id]
                                      : prev.filter((id) => id !== p.id)
                                  );
                                }}
                              />
                            ) : null
                          )
                        }
                        disabled={!!llaveId || !isAdmin}
                      >
                        <ListItemText
                          primary={
                            <span style={llaveId
                              ? { color: '#c62828', fontWeight: 900, fontSize: '1.08em', background: '#fffbe6', padding: '2px 4px', borderRadius: 3 }
                              : {}}>
                              {`${p.apellido}, ${p.nombre}`}
                            </span>
                          }
                          secondary={
                            <span style={llaveId
                              ? { color: '#c62828', fontWeight: 700, background: '#fffbe6', padding: '2px 4px', borderRadius: 3 }
                              : {}}>
                              {`Edad: ${calcularEdad(p.fechaNacimiento)} | Peso: ${p.peso}kg | Cinturón: ${p.cinturon}`}
                            </span>
                          }
                        />
                      </ListItem>
                      <Divider />
                    </React.Fragment>
                  );
                })}
              </List>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setModalParticipantes({ open: false, categoria: null, participantes: [], loading: false }); setSeleccionados([]); }}>Cerrar</Button>
        </DialogActions>
      </Dialog>
      {/* Modal BracketView para llave */}
      <Dialog open={modalLlave.open} onClose={() => setModalLlave({ open: false, llaveId: null })} maxWidth="lg" fullWidth>
        <DialogTitle>Llave de la categoría</DialogTitle>
        <DialogContent dividers>
          {modalLlave.llaveId && (
            <Box sx={{ minHeight: 400 }}>
              <React.Suspense fallback={<div>Cargando...</div>}>
                <BracketView llaveId={modalLlave.llaveId} />
              </React.Suspense>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalLlave({ open: false, llaveId: null })}>Cerrar</Button>
        </DialogActions>
      </Dialog>
      {/* Modal Ver Detalles */}
      <Dialog open={modal.open && modal.type === 'view'} onClose={() => setModal({ open: false })} maxWidth="sm" fullWidth>
        <DialogTitle>Detalles de la Categoría</DialogTitle>
        <DialogContent dividers>
          {modal.categoria && (
            <Box>
              <Typography><b>Nombre:</b> {modal.categoria.nombre}</Typography>
              <Typography><b>Sexo:</b> {modal.categoria.sexo}</Typography>
              <Typography><b>Edad:</b> {modal.categoria.edad_min} - {modal.categoria.edad_max}</Typography>
              <Typography><b>Peso:</b> {modal.categoria.peso_minimo} - {modal.categoria.peso_maximo} kg</Typography>
              <Typography><b>Graduación:</b> {modal.categoria.graduacion_desde} a {modal.categoria.graduacion_hasta}</Typography>
              <Typography><b>Rounds Preliminar:</b> {modal.categoria.cantidad_de_rounds_preliminar} x {modal.categoria.tiempo_por_round_preliminar}s</Typography>
              <Typography><b>Rounds Final:</b> {modal.categoria.cantidad_de_rounds_final} x {modal.categoria.tiempo_por_round_final}s</Typography>
              <Typography><b>Tiempo extra:</b> {modal.categoria.tiempo_extra}s</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModal({ open: false })}>Cerrar</Button>
        </DialogActions>
      </Dialog>
      {/* Modal Eliminar */}
      <Dialog open={modal.open && modal.type === 'delete'} onClose={() => setModal({ open: false })} maxWidth="xs">
        <DialogTitle>Eliminar Categoría</DialogTitle>
        <DialogContent dividers>
          {modal.categoria && (
            <Typography>¿Seguro que deseas eliminar la categoría <b>{modal.categoria.nombre}</b>?</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModal({ open: false })} disabled={deleteLoading}>Cancelar</Button>
          <Button color="error" variant="contained" disabled={deleteLoading} onClick={async () => {
            setDeleteLoading(true);
            try {
              await axios.delete(`${API_BASE}/api/categorias/${modal.categoria.id}`);
              setCategorias(categorias.filter(c => c.id !== modal.categoria.id));
              setModal({ open: false });
            } catch (e) {
              alert('Error al eliminar');
            } finally {
              setDeleteLoading(false);
            }
          }}>Eliminar</Button>
        </DialogActions>
      </Dialog>
      {/* Modal Editar */}
      <Dialog open={modal.open && modal.type === 'edit'} onClose={() => setModal({ open: false })} maxWidth="sm" fullWidth>
        <DialogTitle>Editar Categoría</DialogTitle>
        <DialogContent dividers>
          {editForm && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField select label="Sexo" name="sexo" value={editForm.sexo} onChange={e => setEditForm(f => ({ ...f, sexo: e.target.value }))} fullWidth>
                  <MenuItem value="masculino">Masculino</MenuItem>
                  <MenuItem value="femenino">Femenino</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Edad mínima" type="number" name="edad_min" value={editForm.edad_min} onChange={e => setEditForm(f => ({ ...f, edad_min: parseInt(e.target.value) }))} fullWidth />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Edad máxima" type="number" name="edad_max" value={editForm.edad_max} onChange={e => setEditForm(f => ({ ...f, edad_max: parseInt(e.target.value) }))} fullWidth />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Peso mínimo" type="number" name="peso_minimo" value={editForm.peso_minimo} onChange={e => setEditForm(f => ({ ...f, peso_minimo: parseInt(e.target.value) }))} fullWidth />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Peso máximo" type="number" name="peso_maximo" value={editForm.peso_maximo} onChange={e => setEditForm(f => ({ ...f, peso_maximo: parseInt(e.target.value) }))} fullWidth />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField select label="Graduación Desde" name="graduacion_desde" value={editForm.graduacion_desde} onChange={e => setEditForm(f => ({ ...f, graduacion_desde: e.target.value }))} fullWidth>
                  {ORDEN_CINTURONES.map((g) => (
                    <MenuItem key={g} value={g}>{g}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField select label="Graduación Hasta" name="graduacion_hasta" value={editForm.graduacion_hasta} onChange={e => setEditForm(f => ({ ...f, graduacion_hasta: e.target.value }))} fullWidth>
                  {ORDEN_CINTURONES.map((g) => (
                    <MenuItem key={g} value={g}>{g}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Tiempo por round (preliminar)" type="number" name="tiempo_por_round_preliminar" value={editForm.tiempo_por_round_preliminar} onChange={e => setEditForm(f => ({ ...f, tiempo_por_round_preliminar: parseInt(e.target.value) }))} fullWidth />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Cantidad de rounds (preliminar)" type="number" name="cantidad_de_rounds_preliminar" value={editForm.cantidad_de_rounds_preliminar} onChange={e => setEditForm(f => ({ ...f, cantidad_de_rounds_preliminar: parseInt(e.target.value) }))} fullWidth />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Tiempo por round (final)" type="number" name="tiempo_por_round_final" value={editForm.tiempo_por_round_final} onChange={e => setEditForm(f => ({ ...f, tiempo_por_round_final: parseInt(e.target.value) }))} fullWidth />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Cantidad de rounds (final)" type="number" name="cantidad_de_rounds_final" value={editForm.cantidad_de_rounds_final} onChange={e => setEditForm(f => ({ ...f, cantidad_de_rounds_final: parseInt(e.target.value) }))} fullWidth />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Tiempo extra (segundos)" type="number" name="tiempo_extra" value={editForm.tiempo_extra} onChange={e => setEditForm(f => ({ ...f, tiempo_extra: parseInt(e.target.value) }))} fullWidth />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModal({ open: false })} disabled={editLoading}>Cancelar</Button>
          <Button variant="contained" disabled={editLoading} onClick={async () => {
            setEditLoading(true);
            try {
              await axios.put(`${API_BASE}/api/categorias/${editForm.id}`, editForm);
              setCategorias(categorias.map(c => c.id === editForm.id ? { ...editForm } : c));
              setModal({ open: false });
            } catch (e) {
              alert('Error al editar');
            } finally {
              setEditLoading(false);
            }
          }}>Guardar</Button>
        </DialogActions>
      </Dialog>
      
    </Box>
  );
};

export default Categorias;
