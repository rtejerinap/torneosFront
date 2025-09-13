import React from "react";
import { useAuth } from "../context/AuthContext";
import { Box, Tabs, Tab } from "@mui/material";
import BracketView from "./Combates/BracketView";
import CrearZona from "../components/Zonas/CrearZona";
import ListarZonas from "../components/Zonas/ListarZonas";
import { useEffect, useState } from "react";
import {  Typography, MenuItem, TextField, CircularProgress, Divider } from "@mui/material";
import axios from "axios";

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const ZonasManager = () => {
  const { rol } = useAuth();
  const isAdmin = Array.isArray(rol) ? rol.includes('admin') : rol === 'admin';
  const [tab, setTab] = useState(0);
  const [zonas, setZonas] = useState([]);
  const [zonaId, setZonaId] = useState("");
  const [zonaInfo, setZonaInfo] = useState(null);
  const [loadingZona, setLoadingZona] = useState(false);
  const [llaves, setLlaves] = useState([]);
  const [loadingLlaves, setLoadingLlaves] = useState(false);
  const API_BASE = import.meta.env.VITE_API_URL;
  const [llaveSeleccionada, setLlaveSeleccionada] = useState(null);

  useEffect(() => {
    axios.get(`${API_BASE}/zonas`).then(res => setZonas(res.data)).catch(() => setZonas([]));
  }, []);

  useEffect(() => {
    if (!zonaId) {
      setZonaInfo(null);
      setLlaves([]);
      return;
    }
    setLoadingZona(true);
    axios.get(`${API_BASE}/zonas/${zonaId}`)
      .then(res => setZonaInfo(res.data))
      .catch(() => setZonaInfo(null))
      .finally(() => setLoadingZona(false));
    setLoadingLlaves(true);
    axios.get(`${API_BASE}/combates/llaves-por-zona/${zonaId}`)
      .then(res => setLlaves(res.data))
      .catch(() => setLlaves([]))
      .finally(() => setLoadingLlaves(false));
  }, [zonaId]);

  return (
    <Box sx={{ width: "100%" }}>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} aria-label="zonas-tabs">
        {isAdmin && <Tab label="Listar Zonas" />}
        {isAdmin && <Tab label="Crear Zona" />}
        <Tab label="Consulta Zona" />
      </Tabs>
      {isAdmin && <TabPanel value={tab} index={0}><ListarZonas /></TabPanel>}
      {isAdmin && <TabPanel value={tab} index={1}><CrearZona /></TabPanel>}
      <TabPanel value={tab} index={isAdmin ? 2 : 0}>
        <div
          style={{
            padding: '16px',
            width: '100%',
            margin: 0,
            boxSizing: 'border-box',
          }}
        >
          <h2 style={{ fontSize: '1.3em', fontWeight: 700, marginBottom: 18 }}>Consulta de zona</h2>
          <div
            style={{
              display: 'flex',
              flexDirection: window.innerWidth > 900 ? 'row' : 'column',
              gap: 12,
              width: '100%',
              flexWrap: 'wrap',
              alignItems: 'flex-end',
              marginBottom: 18,
            }}
          >
            <div style={{ minWidth: 220, flex: 1 }}>
              <label style={{ fontWeight: 500, marginBottom: 4 }}>Seleccionar zona:</label>
              <select
                style={{
                  border: '1px solid #bbb',
                  borderRadius: 6,
                  padding: '10px',
                  fontSize: 16,
                  width: '100%',
                  marginBottom: 10,
                  minWidth: 200,
                  maxWidth: '100%',
                }}
                value={zonaId}
                onChange={e => setZonaId(e.target.value)}
              >
                <option value="">-- Seleccioná una zona --</option>
                {zonas.map(z => (
                  <option key={z.id} value={z.id}>{z.nombre}</option>
                ))}
              </select>
            </div>
          </div>
          {loadingZona ? <CircularProgress /> : zonaInfo && (
            <div style={{ marginBottom: 18, padding: 16, border: '1px solid #ddd', borderRadius: 8 }}>
              <div style={{ fontWeight: 700, fontSize: '1.1em', marginBottom: 6 }}>{zonaInfo.nombre}</div>
              <div style={{ color: '#666', marginBottom: 8 }}>{zonaInfo.descripcion}</div>
              <Divider sx={{ my: 1 }} />
              <div style={{ fontWeight: 500, marginBottom: 4 }}>Autoridad:</div>
              <div style={{ color: '#444', marginBottom: 4 }}>{zonaInfo.autoridad_nombre || 'Sin asignar'}</div>
              <div style={{ fontWeight: 500, marginBottom: 4 }}>Árbitro:</div>
              <div style={{ color: '#444', marginBottom: 4 }}>{zonaInfo.arbitro_nombre || 'Sin asignar'}</div>
              <div style={{ fontWeight: 500, marginBottom: 4 }}>Jueces:</div>
              {(zonaInfo.jueces_nombres && zonaInfo.jueces_nombres.length > 0)
                ? zonaInfo.jueces_nombres.map((j, idx) => (
                  <div key={idx} style={{ color: '#444', marginBottom: 2 }}>{j || `Sin asignar (${idx + 1})`}</div>
                ))
                : [0,1,2,3].map(idx => <div key={idx} style={{ color: '#444', marginBottom: 2 }}>{`Sin asignar (${idx + 1})`}</div>)}
            </div>
          )}
          <Divider sx={{ my: 2 }} />
          <div style={{ fontWeight: 700, fontSize: '1.1em', marginBottom: 8 }}>Llaves asignadas a la zona</div>
          {loadingLlaves ? <CircularProgress /> : (
            llaves.length > 0 ? (
              <div>
                {llaves.map(l => (
                  <div key={l.id} style={{ padding: 8, marginBottom: 8, border: '1px solid #eee', borderRadius: 6 }}>
                    <span
                      style={{ cursor: 'pointer', color: '#1976d2', textDecoration: 'underline', fontWeight: 600 }}
                      onClick={() => setLlaveSeleccionada(l.id)}
                    >
                      {l.nombre}
                    </span>
                  </div>
                ))}
              </div>
            ) : <div style={{ color: '#666' }}>No hay llaves asignadas a esta zona.</div>
          )}
          {llaveSeleccionada && (
            <div style={{ marginTop: 24 }}>
              <BracketView llaveId={llaveSeleccionada} />
            </div>
          )}
        </div>
      </TabPanel>
    </Box>
  );
};

export default ZonasManager;
