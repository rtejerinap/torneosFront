import * as React from 'react';
import { Tabs, Tab, Box } from '@mui/material';
// Importamos los componentes de formulario ya creados
import AltaMaestro from './AltaMaestro';
import AltaInstructor from './AltaInstructor';
import AltaEscuela from './AltaEscuela';

// Componente auxiliar para el contenido de cada pestaña (TabPanel)
function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 0 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

// (Opcional) Función para generar propiedades de accesibilidad para cada Tab
function a11yProps(index) {
  return {
    id: `tab-${index}`,
    'aria-controls': `tabpanel-${index}`,
  };
}

export default function AltasUsuariosTabs() {
  // Estado local para controlar la pestaña activa (0 = Maestros, 1 = Instructores)
  const [tabIndex, setTabIndex] = React.useState(0);

  const handleChange = (event, newIndex) => {
    setTabIndex(newIndex);
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Encabezado de pestañas con una línea divisoria inferior */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs 
          value={tabIndex} 
          onChange={handleChange} 
          aria-label="Pestañas de registro de maestros e instructores"
          variant="fullWidth"  /* Ocupa ancho completo para mejor responsividad */
          textColor="primary"  /* Opcional: color del texto de la pestaña activa */
          indicatorColor="primary" /* Opcional: color del indicador debajo de la pestaña activa */
        >
          <Tab label="Maestros" {...a11yProps(0)} sx={{ textTransform: 'none' }} />
          <Tab label="Instructores" {...a11yProps(1)} sx={{ textTransform: 'none' }} />
          <Tab label="Escuelas" {...a11yProps(2)} sx={{ textTransform: 'none' }} />

        </Tabs>
      </Box>

      {/* Paneles de contenido para cada pestaña */}
      <TabPanel value={tabIndex} index={0}>
        {/* Contenido de la primera pestaña */}
        <AltaMaestro />
      </TabPanel>
      <TabPanel value={tabIndex} index={1}>
        {/* Contenido de la segunda pestaña */}
        <AltaInstructor />
      </TabPanel>
      <TabPanel value={tabIndex} index={2}>
        {/* Contenido de la tercer pestaña */}
        <AltaEscuela />
      </TabPanel>
    </Box>
  );
}
