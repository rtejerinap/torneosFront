import React, { useState } from "react";
import { Box, Tabs, Tab } from "@mui/material";
import CrearZona from "../components/Zonas/CrearZona";
import ListarZonas from "../components/Zonas/ListarZonas";

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const ZonasManager = () => {
  const [tab, setTab] = useState(0);
  return (
    <Box sx={{ width: "100%" }}>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} aria-label="zonas-tabs">
        <Tab label="Listar Zonas" />
        <Tab label="Crear Zona" />
      </Tabs>
      <TabPanel value={tab} index={0}>
        <ListarZonas />
      </TabPanel>
      <TabPanel value={tab} index={1}>
        <CrearZona />
      </TabPanel>
    </Box>
  );
};

export default ZonasManager;
