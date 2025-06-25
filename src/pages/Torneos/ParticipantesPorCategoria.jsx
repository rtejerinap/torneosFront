import React, { useEffect, useState } from 'react';
import {
  Box, Typography, MenuItem, TextField, CircularProgress,
  List, ListItem, ListItemText, Divider
} from '@mui/material';

const BASE_URL = 'https://us-central1-torneos-305d7.cloudfunctions.net/api/api';

const ParticipantesPorCategoria = () => {
  const [categorias, setCategorias] = useState([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('');
  const [participantes, setParticipantes] = useState([]);
  const [loading, setLoading] = useState(false);

  // Traer todas las categorías al montar el componente
  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const res = await fetch(`${BASE_URL}/categorias`);
        const data = await res.json();
        setCategorias(data);
      } catch (error) {
        console.error('Error al cargar categorías:', error);
      }
    };

    fetchCategorias();
  }, []);

  const handleCategoriaChange = async (e) => {
    const id = e.target.value;
    setCategoriaSeleccionada(id);
    setLoading(true);
    setParticipantes([]);

    try {
      const res = await fetch(`${BASE_URL}/categorias/${id}/participantes`);
      const data = await res.json();
      setParticipantes(data);
    } catch (error) {
      console.error('Error al cargar participantes:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 700, mx: 'auto', p: 3 }}>
      <Typography variant="h5" gutterBottom>Buscar Participantes por Categoría</Typography>

      <TextField
        select
        fullWidth
        label="Seleccioná una categoría"
        value={categoriaSeleccionada}
        onChange={handleCategoriaChange}
        sx={{ mb: 3 }}
      >
        {categorias.map((cat) => (
          <MenuItem key={cat.id} value={cat.id}>
            {cat.nombre}
          </MenuItem>
        ))}
      </TextField>

      {loading ? (
        <Box display="flex" justifyContent="center" mt={2}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Typography variant="subtitle1" gutterBottom>
            Participantes encontrados: {participantes.length}
          </Typography>
          <List>
            {participantes.map((p) => (
              <React.Fragment key={p.id}>
                <ListItem>
                  <ListItemText
                    primary={`${p.apellido}, ${p.nombre}`}
                    secondary={`Edad: ${p.fechaNacimiento} | Peso: ${p.peso}kg | Cinturón: ${p.cinturon}`}
                  />
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
          </List>
        </>
      )}
    </Box>
  );
};

export default ParticipantesPorCategoria;
