import React, { useState } from 'react';
import { Tabs, Tab, Box } from '@mui/material';
import ParticipantesPorCategoria from './ParticipantesPorCategoria';
//import ListadoTorneos from './ListadoTorneos';
import AltaTorneo from "./AltaTorneo";
import AltaCategoriaCombate from './AltaCategoriaCombate';
import BracketSelector from '../Combates/BracketSelector';

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
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `tab-${index}`,
    'aria-controls': `tabpanel-${index}`,
  };
}

const Torneos = () => {
  const [tabIndex, setTabIndex] = useState(0);

  const handleChange = (_, newValue) => {
    setTabIndex(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={tabIndex}
          onChange={handleChange}
          variant="fullWidth"
          textColor="primary"
          indicatorColor="primary"
          aria-label="Pestañas de torneos"
        >
          <Tab label="Listado de Torneos" {...a11yProps(0)} sx={{ textTransform: 'none' }} />
          <Tab label="Crear Torneo" {...a11yProps(1)} sx={{ textTransform: 'none' }} />
          <Tab label="Categorías de Combate" {...a11yProps(2)} sx={{ textTransform: 'none' }} /> 
          <Tab label="Participantes por Categoría" {...a11yProps(3)} sx={{ textTransform: 'none' }} />
          <Tab label="Llaves por categoría" {...a11yProps(4)} sx={{ textTransform: 'none' }} />
        </Tabs>
      </Box>

{/*   <TabPanel value={tabIndex} index={0}>
        <ListadoTorneos />
      </TabPanel> */}
      <TabPanel value={tabIndex} index={1}>
        <AltaTorneo />
      </TabPanel>
      <TabPanel value={tabIndex} index={2}>
        <AltaCategoriaCombate />
      </TabPanel>
      <TabPanel value={tabIndex} index={3}>
        <ParticipantesPorCategoria />
      </TabPanel>
      <TabPanel value={tabIndex} index={4}>
        <BracketSelector />
      </TabPanel>
    </Box>
  );
};

export default Torneos;
