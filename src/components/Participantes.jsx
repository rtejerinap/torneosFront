import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  Grid,
  Button,
  Modal,
  Paper,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import VisibilityIcon from "@mui/icons-material/Visibility";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import LoadingSvg from "/src/components/loader/LoadingSvg";

const API_BASE = import.meta.env.VITE_API_URL;

const AdminParticipantes = () => {
  const [torneos, setTorneos] = useState([]);
  const [escuelas, setEscuelas] = useState([]);
  const [instructores, setInstructores] = useState([]);
  const [maestros, setMaestros] = useState([]);
  const [participantes, setParticipantes] = useState([]);
  const [participantesRaw, setParticipantesRaw] = useState([]); // para filtrar en frontend
  const [pagados, setPagados] = useState({});
  const [filtros, setFiltros] = useState({
    torneoId: "",
    escuelaId: "",
    instructorId: "",
    maestroId: "",
    tul: "",
    lucha: "",
    equipos: "",
    coach: "",
    arbitro: "",
    autoridad_mesa: "",
    soloMaestros: ""
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [detalle, setDetalle] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [torneosRes, escuelasRes, instructoresRes, maestrosRes] = await Promise.all([
          axios.get(`${API_BASE}/torneos/activos`),
          axios.get(`${API_BASE}/escuelas`),
          axios.get(`${API_BASE}/instructores`),
          axios.get(`${API_BASE}/maestros`),
        ]);
        setTorneos(torneosRes.data);
        setEscuelas(escuelasRes.data);
        setInstructores(instructoresRes.data);
        setMaestros(maestrosRes.data);
      } catch (err) {
        console.error("Error al cargar datos", err);
      }
    };
    fetchData();
  }, []);

  // Filtros booleanos se aplican en tiempo real
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFiltros((f) => {
      const nuevos = { ...f, [name]: value };
      // Si es filtro booleano o soloMaestros, filtrar en frontend
      if (["tul","lucha","equipos","coach","arbitro","autoridad_mesa","soloMaestros"].includes(name)) {
        aplicarFiltrosBooleanos(nuevos);
      }
      return nuevos;
    });
  };

  // Aplica los filtros booleanos sobre participantesRaw
  const aplicarFiltrosBooleanos = (filtrosActuales) => {
    let filtrados = participantesRaw;
    const { tul, lucha, equipos, coach, arbitro, autoridad_mesa, soloMaestros } = filtrosActuales;
    const boolFields = { tul, lucha, equipos, coach, arbitro, autoridad_mesa };
    Object.entries(boolFields).forEach(([key, value]) => {
      if (value !== "") {
        filtrados = filtrados.filter(p => Boolean(p[key]) === (value === "true"));
      }
    });
    // Filtro de solo maestros: solo los que tienen cinturón exactamente igual a 7º Dan - Negro, 8º Dan - Negro o 9º Dan - Negro
    if (soloMaestros === "true") {
      const maestrosValidos = [
        "7º Dan - Negro",
        "8º Dan - Negro",
        "9º Dan - Negro"
      ];
      filtrados = filtrados.filter(p =>
        typeof p.cinturon === "string" && maestrosValidos.includes(p.cinturon.trim())
      );
    }
    setParticipantes(filtrados);
    setPagados(filtrados.reduce((acc, p) => {
      acc[p.id] = p.pagado || false;
      return acc;
    }, {}));
  };

  const buscarParticipantes = async () => {
    const { torneoId, escuelaId, instructorId, maestroId, tul, lucha, equipos, coach, arbitro, autoridad_mesa } = filtros;
    if (!torneoId) return;

    let url = '';
    if (escuelaId) {
      url = `${API_BASE}/participantes/torneo/${torneoId}/escuela/${escuelaId}`;
    } else if (instructorId) {
      url = `${API_BASE}/participantes/torneo/${torneoId}/instructor/${instructorId}`;
    } else if (maestroId) {
      url = `${API_BASE}/participantes/torneo/${torneoId}/maestro/${maestroId}`;
    } else {
      url = `${API_BASE}/participantes/torneo/${torneoId}`;
    }

    try {
      setLoading(true);
      const res = await axios.get(url);
      setParticipantesRaw(res.data);
      // Aplica los filtros booleanos actuales
      let filtrados = res.data;
      const boolFields = { tul, lucha, equipos, coach, arbitro, autoridad_mesa };
      Object.entries(boolFields).forEach(([key, value]) => {
        if (value !== "") {
          filtrados = filtrados.filter(p => Boolean(p[key]) === (value === "true"));
        }
      });
      setParticipantes(filtrados);
      setPagados(filtrados.reduce((acc, p) => {
        acc[p.id] = p.pagado || false;
        return acc;
      }, {}));
    } catch (err) {
      console.error("Error al buscar participantes", err);
    } finally {
      setLoading(false);
    }
  };

  const exportarPDF = () => {
    const torneo = torneos.find(t => t.id === filtros.torneoId)?.nombre || "Torneo";
    const filtroTexto = filtros.escuelaId
      ? `Escuela: ${escuelas.find(e => e.id === filtros.escuelaId)?.nombre || filtros.escuelaId}`
      : filtros.instructorId
        ? `Instructor: ${instructores.find(i => i.id === filtros.instructorId)?.nombre || filtros.instructorId}`
        : filtros.maestroId
          ? `Maestro: ${maestros.find(m => m.id === filtros.maestroId)?.nombre || filtros.maestroId}`
          : "";

    const total = participantes.length;
    const precio = torneos.find(t => t.id === filtros.torneoId)?.precio || 0;
    const totalPagado = participantes.filter(p => pagados[p.id]).length;
    const totalCobrado = totalPagado * precio;
    const totalACobrar = total * precio;
    const deuda = totalACobrar - totalCobrado;

    const doc = new jsPDF();

    const logo = new Image();
    logo.src = "/logo.png"; // logo en public/

    logo.onload = () => {
      const totalPagesExp = "{total_pages_count_string}";

      const pageContent = function (data) {
        doc.addImage(logo, 'PNG', 10, 8, 20, 20);
        doc.setFontSize(10);
        doc.text(`Participantes - ${torneo}`, 35, 15);
        if (filtroTexto) doc.text(filtroTexto, 35, 23);

        const str = `Página ${doc.internal.getNumberOfPages()}` + (typeof doc.putTotalPages === 'function' ? ` de ${totalPagesExp}` : '');
        doc.setFontSize(10);
        const pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
        doc.text(str, data.settings.margin.left, pageHeight - 10);
      };

      autoTable(doc, {
        margin: { top: 40 },
        head: [["Nombre", "Apellido", "Documento", "Peso", "Cinturón", "Pagado"]],
        body: participantes.map((p) => [
          p.nombre,
          p.apellido,
          p.documento,
          `${p.peso} kg`,
          p.cinturon,
          pagados[p.id] ? "Sí" : "No",
        ]),
        styles: { fontSize: 10 },
        headStyles: { fillColor: [22, 160, 133] },
        didDrawPage: pageContent,
      });

      const finalY = doc.lastAutoTable.finalY || 40;
      doc.setFontSize(12);
      doc.text(`Total participantes: ${total}`, 14, finalY + 10);
      doc.text(`Total a cobrar: $${totalACobrar}`, 14, finalY + 20);
      doc.text(`Total cobrado: $${totalCobrado}`, 14, finalY + 30);
      doc.text(`Deuda: $${deuda}`, 14, finalY + 40);

      if (typeof doc.putTotalPages === 'function') {
        doc.putTotalPages(totalPagesExp);
      }

      doc.save("participantes.pdf");
    };
  };


  const togglePagado = (id) => {
    setPagados((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleSeleccionarTodos = () => {
    const allSelected = Object.values(pagados).every(Boolean);
    const nuevosEstados = {};
    participantes.forEach((p) => {
      nuevosEstados[p.id] = !allSelected;
    });
    setPagados(nuevosEstados);
  };

  const actualizarPagados = async () => {
    try {
      const updates = Object.entries(pagados).map(([id, pagado]) => ({ id, pagado }));
      await axios.post(`${API_BASE}/participantes/actualizar-pagos`, { updates });
      alert("Pagos actualizados correctamente");
      buscarParticipantes();
    } catch (err) {
      console.error("Error al actualizar pagos", err);
      alert("Ocurrió un error al actualizar pagos");
    }
  };

  const total = participantes.length;
  const precio = torneos.find(t => t.id === filtros.torneoId)?.precio || 0;
  const totalPagado = participantes.filter(p => pagados[p.id]).length;
  const totalCobrado = totalPagado * precio;
  const totalACobrar = total * precio;
  const deuda = totalACobrar - totalCobrado;

  const columnas = [
    { field: "nombre", headerName: "Nombre", flex: 1 },
    { field: "apellido", headerName: "Apellido", flex: 1 },
    { field: "documento", headerName: "Documento", flex: 1 },
    { field: "peso", headerName: "Peso (kg)", flex: 1 },
    { field: "cinturon", headerName: "Cinturón", flex: 1 },
    { field: "otroInstructor", headerName: "Otro Instructor", flex: 1 },
    { field: "otroMaestro", headerName: "Otro Maestro", flex: 1 },
    {
      field: "tul",
      headerName: "Tul",
      flex: 0.5,
      renderCell: (params) => params.row.tul ? <span style={{color: 'green'}}>✔️</span> : <span style={{color: 'red'}}>❌</span>
    },
    {
      field: "lucha",
      headerName: "Lucha",
      flex: 0.5,
      renderCell: (params) => params.row.lucha ? <span style={{color: 'green'}}>✔️</span> : <span style={{color: 'red'}}>❌</span>
    },
    {
      field: "equipos",
      headerName: "Equipos",
      flex: 0.5,
      renderCell: (params) => params.row.equipos ? <span style={{color: 'green'}}>✔️</span> : <span style={{color: 'red'}}>❌</span>
    },
    {
      field: "coach",
      headerName: "Coach",
      flex: 0.5,
      renderCell: (params) => params.row.coach ? <span style={{color: 'green'}}>✔️</span> : <span style={{color: 'red'}}>❌</span>
    },
    {
      field: "arbitro",
      headerName: "Árbitro",
      flex: 0.5,
      renderCell: (params) => params.row.arbitro ? <span style={{color: 'green'}}>✔️</span> : <span style={{color: 'red'}}>❌</span>
    },
    {
      field: "autoridad_mesa",
      headerName: "Mesa",
      flex: 0.5,
      renderCell: (params) => params.row.autoridad_mesa ? <span style={{color: 'green'}}>✔️</span> : <span style={{color: 'red'}}>❌</span>
    },
    {
      field: "pagado",
      headerName: (
        <Box display="flex" alignItems="center">
          <input
            type="checkbox"
            checked={participantes.length > 0 && participantes.every((p) => pagados[p.id])}
            onChange={toggleSeleccionarTodos}
            style={{ marginRight: 6 }}
          />
          Pagado
        </Box>
      ),
      flex: 1,
      renderCell: (params) => (
        <input
          type="checkbox"
          checked={pagados[params.row.id] || false}
          onChange={() => togglePagado(params.row.id)}
        />
      ),
    },
    {
      field: "ver",
      headerName: "Acciones",
      flex: 1,
      renderCell: (params) => (
        <Button
          variant="outlined"
          size="small"
          onClick={() => abrirModal(params.row)}
          sx={{ minWidth: 0, p: 1 }}
        >
          <VisibilityIcon fontSize="medium" />
        </Button>
      ),
    },
  ];

  const abrirModal = (datos) => {
    setDetalle(datos);
    setModalOpen(true);
  };

  const cerrarModal = () => setModalOpen(false);
  // ......................Exportarpdf.................

  const exportarDetallePDF = (participante) => {
    if (!participante) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const logo = new Image();
    logo.src = "/logo.png";

    logo.onload = () => {
      // Calcular proporción del logo
      const maxLogoWidth = 80;
      const logoRatio = logo.height / logo.width;
      const logoWidth = maxLogoWidth;
      const logoHeight = logoWidth * logoRatio;

      // Franja negra de fondo para el logo
      doc.setFillColor(0, 0, 0);
      doc.rect(0, 0, pageWidth, logoHeight + 10, "F");

      // Logo centrado y proporcional
      doc.addImage(
        logo,
        "PNG",
        (pageWidth - logoWidth) / 2,
        5,
        logoWidth,
        logoHeight
      );

      // Fondo blanco para datos
      const contentStartY = logoHeight + 20;
      doc.setFillColor(255, 255, 255);
      doc.rect(10, contentStartY, pageWidth - 20, pageHeight - contentStartY - 10, "F");

      // Título principal: Torneo
      const torneoNombre = torneos.find(t => t.id === filtros.torneoId)?.nombre || "Torneo";
      doc.setFontSize(30);
      doc.setFont("helvetica", "bold");
      doc.text(torneoNombre, pageWidth / 2, contentStartY + 15, { align: "center" });

      // Subtítulo: Participante
      doc.setFontSize(35);
      doc.setFont("helvetica", "bold");
      doc.text("Participante", pageWidth / 2, contentStartY + 30, { align: "center" });

      const data = [
        `Nombre: ${participante.nombre}`,
        `Apellido: ${participante.apellido}`,
        `Documento: ${participante.documento}`,
        `Fecha Nacimiento: ${participante.fechaNacimiento}`,
        `Peso: ${participante.peso} kg`,
        `Cinturón: ${participante.cinturon}`
      ];

      doc.setFontSize(16);
      data.forEach((line, i) => {
        doc.text(line, pageWidth / 2, contentStartY + 55 + i * 12, { align: "center" });
      });

      if (participante.qr) {
        toDataURL(participante.qr, (base64Img) => {
          doc.addImage(base64Img, "PNG", (pageWidth - 60) / 2, contentStartY + 120, 60, 60);
          doc.save(`participante-${participante.documento}.pdf`);
        });
      } else {
        doc.save(`participante-${participante.documento}.pdf`);
      }
    };
  };


  const toDataURL = (url, callback) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = function () {
      const reader = new FileReader();
      reader.onloadend = function () {
        callback(reader.result);
      };
      reader.readAsDataURL(xhr.response);
    };
    xhr.onerror = function () {
      alert("No se pudo cargar el QR para el PDF.");
    };
    xhr.open("GET", url);
    xhr.responseType = "blob";
    xhr.send();
  };

  return (
    <Box>
      {loading && <LoadingSvg />}
      <Typography variant="h5" gutterBottom>
        Gestión de Participantes
      </Typography>
      {/* Filtros principales */}
      <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <Grid item xs={12} sm={4}>
          <TextField
            select
            fullWidth
            sx={{ minWidth: 100 }}
            name="torneoId"
            label="Torneo"
            value={filtros.torneoId}
            onChange={handleChange}
          >
            {torneos.map((t) => (
              <MenuItem key={t.id} value={t.id}>
                {`${t.nombre} - ${t.fecha}`}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            select
            fullWidth
            sx={{ minWidth: 100 }}
            name="escuelaId"
            label="Escuela"
            value={filtros.escuelaId}
            onChange={handleChange}
            disabled={filtros.instructorId || filtros.maestroId}
          >
            <MenuItem value="">Ninguna</MenuItem>
            {escuelas.map((e) => (
              <MenuItem key={e.id} value={e.id}>
                {`${e.nombre}, ${e.ciudad}`}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            select
            fullWidth
            sx={{ minWidth: 100 }}
            name="instructorId"
            label="Instructor"
            value={filtros.instructorId}
            onChange={handleChange}
            disabled={filtros.escuelaId || filtros.maestroId}
          >
            <MenuItem value="">Ninguno</MenuItem>
            {instructores.map((i) => (
              <MenuItem key={i.id} value={i.id}>
                {`${i.nombre} ${i.apellido}`}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            select
            fullWidth
            sx={{ minWidth: 100 }}
            name="maestroId"
            label="Maestro"
            value={filtros.maestroId}
            onChange={handleChange}
            disabled={filtros.escuelaId || filtros.instructorId}
          >
            <MenuItem value="">Ninguno</MenuItem>
            {maestros.map((m) => (
              <MenuItem key={m.id} value={m.id}>
                {`${m.nombre} ${m.apellido}`}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12} sm={2}>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={buscarParticipantes}
          >
            Buscar
          </Button>
        </Grid>
        <Grid item xs={12} sm={2}>
          <Button
            variant="outlined"
            color="secondary"
            fullWidth
            onClick={exportarPDF}
            disabled={participantes.length === 0}
          >
            Exportar PDF
          </Button>
        </Grid>
        <Grid item xs={12} sm={2}>
          <Button
            variant="contained"
            color="success"
            fullWidth
            onClick={actualizarPagados}
            disabled={participantes.length === 0}
          >
            Actualizar cobro
          </Button>
        </Grid>
      </Grid>
      {/* Sección de deuda */}
      <Box sx={{ mb: 2 }}>
        <Typography>Total a cobrar: ${totalACobrar}</Typography>
        <Typography>Total cobrado: ${totalCobrado}</Typography>
        <Typography>Deuda: ${deuda}</Typography>
      </Box>
      {/* Filtros booleanos en un renglón aparte debajo de la deuda */}
      <Box sx={{ mb: 2, mt: 1 }}>
        <Grid container spacing={2} alignItems="center">
          {["tul", "lucha", "equipos", "coach", "arbitro", "autoridad_mesa"].map((campo) => (
            <Grid item xs={12} sm={2} key={campo}>
              <TextField
                select
                fullWidth
                sx={{ minWidth: 150 }}
                name={campo}
                label={campo.charAt(0).toUpperCase() + campo.slice(1)}
                value={filtros[campo]}
                onChange={handleChange}
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="true">✔️</MenuItem>
                <MenuItem value="false">❌</MenuItem>
              </TextField>
            </Grid>
          ))}
          {/* Filtro solo maestros */}
          <Grid item xs={12} sm={2} key="soloMaestros">
            <TextField
              select
              fullWidth
              sx={{ minWidth: 120 }}
              name="soloMaestros"
              label="Solo Maestros"
              value={filtros.soloMaestros}
              onChange={handleChange}
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="true">Solo Maestros</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Box>
      <Paper sx={{ height: 500 }}>
        <DataGrid
          rows={participantes.map((p) => ({ id: p.id, ...p }))}
          columns={columnas}
          pageSize={10}
          rowsPerPageOptions={[10, 20, 50]}
        />
      </Paper>
      <Modal open={modalOpen} onClose={cerrarModal}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "#2c2c2c", // gris oscuro
            color: "white",
            boxShadow: 24,
            borderRadius: 2,
            minWidth: 350,
            maxWidth: 500,
            overflow: "hidden",
            fontFamily: "Arial, sans-serif",
          }}
        >
          {/* Zona del logo con fondo negro */}
          <Box sx={{ bgcolor: "#000", textAlign: "center", p: 2 }}>
            <img
              src="/logo.png"
              alt="Logo"
              style={{
                maxWidth: "100%",
                height: "auto",
                maxHeight: 80,
                objectFit: "contain"
              }}
            />
          </Box>

          {/* Zona de datos con fondo blanco */}
          <Box sx={{ bgcolor: "#fff", color: "#000", textAlign: "center", p: 3 }}>
            {detalle && (
              <>
              <Typography variant="h4" gutterBottom>
   {torneos.find(t => t.id === filtros.torneoId)?.nombre || "No seleccionado"}
</Typography>

                <Typography variant="h3" gutterBottom>
                  Participante
                </Typography>
                <Typography fontSize={18}>Nombre: {detalle.nombre}</Typography>
                <Typography fontSize={18}>Apellido: {detalle.apellido}</Typography>
                <Typography fontSize={18}>Documento: {detalle.documento}</Typography>
                <Typography fontSize={18}>Fecha Nac: {detalle.fechaNacimiento}</Typography>
                <Typography fontSize={18}>Peso: {detalle.peso} kg</Typography>
                <Typography fontSize={18}>Cinturón: {detalle.cinturon}</Typography>

                {detalle.qr && (
                  <Box mt={2}>
                    <Typography variant="h6">Código QR</Typography>
                    <img
                      src={detalle.qr}
                      alt="QR Participante"
                      style={{ width: 150, marginTop: 10 }}
                    />
                  </Box>
                )}
                <Button
                  variant="contained"
                  fullWidth
                  sx={{ mt: 3 }}
                  onClick={() => exportarDetallePDF(detalle)}
                >
                  Exportar a PDF
                </Button>
              </>
            )}
          </Box>
        </Box>
      </Modal>



    </Box>
  );
};

export default AdminParticipantes;
