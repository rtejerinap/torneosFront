// ✅ MUI v5 + DataGrid v5
import React, { useEffect, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import {
  Button,
  Modal,
  Box,
  Typography,
  TextField,
  MenuItem,
  Paper,
} from "@mui/material";
import axios from "axios";
import TorneoSelector from "./TorneoSelector";

const API_BASE = import.meta.env.VITE_API_URL;

const ParticipantesSimple = () => {
  const [mostrarOtros, setMostrarOtros] = useState(true);
  const [torneoId, setTorneoId] = useState("");
  const [participantes, setParticipantes] = useState([]);
  const [selectionModel, setSelectionModel] = useState([]); // ✅ v5
  const [modalAsignar, setModalAsignar] = useState(false);
  const [instructorAsignar, setInstructorAsignar] = useState("");
  const [instructores, setInstructores] = useState([]);
  const [asignando, setAsignando] = useState(false);
  const [asignarMsg, setAsignarMsg] = useState("");

  useEffect(() => {
    const cargarDatos = async () => {
      if (!torneoId) {
        setParticipantes([]);
        setSelectionModel([]);
        return;
      }
      try {
        const [resPart, resInstr] = await Promise.all([
          axios.get(`${API_BASE}/participantes/torneo/${torneoId}`),
          axios.get(`${API_BASE}/instructores`),
        ]);

        const rows = (resPart.data || [])
          .map((p) => ({
            ...p,
            id: p?.id ? String(p.id) : p?._id ? String(p._id) : undefined,
          }))
          .filter((p) => !!p.id);

        setParticipantes(rows);
        setInstructores(resInstr.data || []);
        setSelectionModel([]); // limpiar selección al cambiar de torneo
      } catch {
        setParticipantes([]);
        setInstructores([]);
        setSelectionModel([]);
      }
    };

    cargarDatos();
  }, [torneoId]);

  const columnas = [
    { field: "nombre", headerName: "Nombre", width: 120 },
    { field: "apellido", headerName: "Apellido", width: 120 },
    { field: "documento", headerName: "Documento", width: 120 },
    { field: "cinturon", headerName: "Cinturón", width: 120 },
    { field: "peso", headerName: "Peso", width: 90 },
    { field: "instructorId", headerName: "Instructor", width: 140 },
    { field: "maestroId", headerName: "Maestro", width: 140 },
    ...(mostrarOtros ? [
      { field: "otroInstructor", headerName: "Otro Instructor", width: 140 },
      { field: "otroMaestro", headerName: "Otro Maestro", width: 140 },
    ] : []),
  ];

  const refrescarParticipantes = async () => {
    if (!torneoId) return;
    try {
      const res = await axios.get(`${API_BASE}/participantes/torneo/${torneoId}`);
      const rows = (res.data || [])
        .map((p) => ({
          ...p,
          id: p?.id ? String(p.id) : p?._id ? String(p._id) : undefined,
        }))
        .filter((p) => !!p.id);
      setParticipantes(rows);
      setSelectionModel([]); // limpiar selección después de asignar
    } catch {
      setParticipantes([]);
      setSelectionModel([]);
    }
  };

  const cerrarModal = () => {
    setModalAsignar(false);
    setInstructorAsignar("");
    setAsignarMsg("");
  };

  return (
    <Box>
      <Box sx={{ mb: 2 }}>
        <Button
          variant="outlined"
          size="small"
          onClick={() => setMostrarOtros((v) => !v)}
        >
          {mostrarOtros ? "Ocultar 'Otro Maestro' y 'Otro Instructor'" : "Mostrar 'Otro Maestro' y 'Otro Instructor'"}
        </Button>
      </Box>
      <TorneoSelector torneoId={torneoId} setTorneoId={setTorneoId} />

      {torneoId && (
        <>
          <Paper sx={{ height: 500, mb: 2 }}>
            <DataGrid
              rows={participantes}
              columns={columnas}
              getRowId={(row) => row.id}
              checkboxSelection
              disableSelectionOnClick  // ✅ v5
              selectionModel={selectionModel} // ✅ v5
              onSelectionModelChange={(newSelection) => {
                const arr = Array.isArray(newSelection) ? newSelection : [];
                setSelectionModel(arr.map(String));
              }}
              hideFooterSelectedRowCount // evita selector problemático en footer
            />
          </Paper>

          <Button
            variant="contained"
            color="success"
            disabled={selectionModel.length === 0}
            onClick={() => setModalAsignar(true)}
          >
            Asignar a instructor
          </Button>
        </>
      )}

      <Modal open={modalAsignar} onClose={cerrarModal}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "#fff",
            color: "#000",
            boxShadow: 24,
            borderRadius: 2,
            minWidth: 350,
            maxWidth: 520,
            p: 3,
            textAlign: "center",
          }}
        >
          <Typography variant="h6" gutterBottom>
            Asignar participantes seleccionados a otro instructor
          </Typography>

          <Box
            sx={{
              mb: 2,
              maxHeight: 200,
              overflowY: "auto",
              border: "1px solid #eee",
              borderRadius: 1,
              p: 1,
              textAlign: "left",
            }}
          >
            {selectionModel.length === 0 ? (
              <Typography color="warning.main">No hay alumnos seleccionados.</Typography>
            ) : (
              <>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Alumnos a asignar:
                </Typography>
                {participantes
                  .filter((p) => selectionModel.includes(p.id))
                  .map((p) => (
                    <Typography key={p.id} fontSize={15}>
                      {p.apellido}, {p.nombre}
                    </Typography>
                  ))}
              </>
            )}
          </Box>

          <TextField
            select
            fullWidth
            label="Instructor destino"
            value={instructorAsignar}
            onChange={(e) => setInstructorAsignar(e.target.value)}
            sx={{ mb: 2 }}
          >
            <MenuItem value="">Seleccione un instructor</MenuItem>
            {instructores.map((i) => (
              <MenuItem key={i.id} value={i.id}>
                {`${i.apellido}, ${i.nombre}${i.graduacion ? ` (${i.graduacion})` : ""}`}
              </MenuItem>
            ))}
          </TextField>

          <Box sx={{ display: "flex", gap: 1, justifyContent: "center" }}>
            <Button
              variant="contained"
              color="success"
              disabled={!instructorAsignar || asignando}
              onClick={async () => {
                setAsignando(true);
                setAsignarMsg("");
                try {
                  await axios.put(
                    `${API_BASE}/participantes/asignar-instructor-limpiar-otro`,
                    { participanteIds: selectionModel, instructorId: instructorAsignar }
                  );
                  setAsignarMsg("Participantes asignados correctamente.");
                  cerrarModal();
                  await refrescarParticipantes();
                } catch {
                  setAsignarMsg("Error al asignar participantes.");
                } finally {
                  setAsignando(false);
                }
              }}
            >
              {asignando ? "Asignando..." : "Asignar"}
            </Button>

            <Button variant="outlined" onClick={cerrarModal} disabled={asignando}>
              Cancelar
            </Button>
          </Box>

          {asignarMsg && (
            <Typography sx={{ mt: 2 }} color={asignarMsg.startsWith("Error") ? "error" : "success.main"}>
              {asignarMsg}
            </Typography>
          )}
        </Box>
      </Modal>
    </Box>
  );
};

export default ParticipantesSimple;
