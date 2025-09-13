import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import EditParticipanteModal from "./EditParticipanteModal";
import ParticipanteDetalleModal from "./ParticipanteDetalleModal";
import ParticipantesSimple from "./ParticipantesSimple";
import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import { useAuth } from "../context/AuthContext";
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  Grid,
  Button,
  Modal,
  Paper,
  Tooltip,
  Tabs,
  Tab
} from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { DataGrid } from "@mui/x-data-grid";
import VisibilityIcon from "@mui/icons-material/Visibility";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import LoadingSvg from "/src/components/loader/LoadingSvg";

const API_BASE = import.meta.env.VITE_API_URL;

const AdminParticipantes = () => {
  const [mostrarOtros, setMostrarOtros] = useState(true);
  const [selectedRows, setSelectedRows] = useState([]);
  const [modalAsignar, setModalAsignar] = useState(false);
  const [instructorAsignar, setInstructorAsignar] = useState("");
  const [asignando, setAsignando] = useState(false);
  const [asignarMsg, setAsignarMsg] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [editParticipante, setEditParticipante] = useState(null);
  const [torneos, setTorneos] = useState([]);
  const [escuelas, setEscuelas] = useState([]);
  const [instructores, setInstructores] = useState([]);
  const [maestros, setMaestros] = useState([]);
  const [participantes, setParticipantes] = useState([]);
  const [participantesRaw, setParticipantesRaw] = useState([]);
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
    juez: "",
    arbitro: "",
    autoridad_mesa: "",
    soloMaestros: "",
    rangoEdad: ""
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [detalle, setDetalle] = useState(null);
  const [loading, setLoading] = useState(false);
  const [paises, setPaises] = useState([]);
  const [provincias, setProvincias] = useState([]);
  const [provinciaId, setProvinciaId] = useState("");
  const { rol } = useAuth();
  const esAdmin = rol && (Array.isArray(rol) ? rol.includes("admin") : rol === "admin");

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [participanteAEliminar, setParticipanteAEliminar] = useState(null);
  const [tab, setTab] = useState(0);

  // ✅ paginación controlada (MUI v5)
  const [pageSize, setPageSize] = useState(100);

  // IDs estables (todo string) para el DataGrid
  const normalizeId = (r, idx) => {
    if (r?.id) return String(r.id);
    if (r?._id) return String(r._id);
    const composite = [
      r?.apellido ?? "",
      r?.nombre ?? "",
      r?.documento ?? "",
      r?.escuelaId ?? "",
      r?.instructorId ?? "",
      r?.maestroId ?? "",
    ].join("|");
    return composite || String(idx);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [torneosRes, escuelasRes, instructoresRes, maestrosRes, paisesRes] = await Promise.all([
          axios.get(`${API_BASE}/torneos/activos`),
          axios.get(`${API_BASE}/escuelas`),
          axios.get(`${API_BASE}/instructores`),
          axios.get(`${API_BASE}/maestros`),
          axios.get(`${API_BASE}/paises`),
        ]);
        setTorneos(torneosRes.data || []);
        setEscuelas(escuelasRes.data || []);
        setInstructores(instructoresRes.data || []);
        setMaestros(maestrosRes.data || []);
        setPaises(paisesRes.data || []);
      } catch (err) {
        console.error("Error al cargar datos", err);
        setTorneos([]); setEscuelas([]); setInstructores([]); setMaestros([]); setPaises([]);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    axios.get(`${API_BASE}/provincias`).then((res) => setProvincias(res.data || [])).catch(() => setProvincias([]));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFiltros((f) => {
      const nuevos = { ...f, [name]: value };
      if (["tul","lucha","equipos","coach","juez","arbitro","autoridad_mesa","soloMaestros","rangoEdad"].includes(name)) {
        aplicarFiltrosBooleanos(nuevos);
      }
      return nuevos;
    });
  };

  const calcularEdad = (fechaNacimiento) => {
    if (!fechaNacimiento) return null;
    const hoy = dayjs();
    const nacimiento = dayjs(fechaNacimiento);
    return hoy.diff(nacimiento, "year");
  };

  const aplicarFiltrosBooleanos = (filtrosActuales) => {
    let filtrados = participantesRaw;
    const { tul, lucha, equipos, coach, juez, arbitro, autoridad_mesa, soloMaestros, rangoEdad } = filtrosActuales;
    const boolFields = { tul, lucha, equipos, coach, juez, arbitro, autoridad_mesa };
    Object.entries(boolFields).forEach(([key, value]) => {
      if (value !== "") {
        filtrados = filtrados.filter(p => Boolean(p[key]) === (value === "true"));
      }
    });
    if (rangoEdad && rangoEdad !== "") {
      filtrados = filtrados.filter(p => {
        const edad = calcularEdad(p.fechaNacimiento);
        switch (rangoEdad) {
          case "5-13": return edad >= 5 && edad <= 13;
          case "14-15": return edad >= 14 && edad <= 15;
          case "16-17": return edad >= 16 && edad <= 17;
          case "18-34": return edad >= 18 && edad <= 34;
          case "35-44": return edad >= 35 && edad <= 44;
          case "45-59": return edad >= 45 && edad <= 59;
          default: return true;
        }
      });
    }
    if (soloMaestros === "true") {
      const maestrosValidos = ["7º Dan - Negro", "8º Dan - Negro", "9º Dan - Negro"];
      filtrados = filtrados.filter(p => typeof p.cinturon === "string" && maestrosValidos.includes(p.cinturon.trim()));
    }
    setParticipantes(filtrados);
    setPagados(filtrados.reduce((acc, p) => { acc[p.id] = p.pagado || false; return acc; }, {}));
  };

  const buscarParticipantes = async () => {
  const { torneoId, escuelaId, instructorId, maestroId, tul, lucha, equipos, coach, juez, arbitro, autoridad_mesa, rangoEdad } = filtros;
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
    if (provinciaId) {
      url += `?provinciaId=${provinciaId}`;
    }

    try {
      setLoading(true);
      const res = await axios.get(url);
      const rows = (res.data || []).filter(Boolean).map((p, idx) => ({ ...p, id: normalizeId(p, idx) }));

      setParticipantesRaw(rows);

      // Aplica filtros booleanos y de rango de edad
      let filtrados = rows;
      const boolFields = { tul, lucha, equipos, coach, juez, arbitro, autoridad_mesa };
      Object.entries(boolFields).forEach(([key, value]) => {
        if (value !== "") {
          filtrados = filtrados.filter(p => Boolean(p[key]) === (value === "true"));
        }
      });
      if (rangoEdad) {
        filtrados = filtrados.filter(p => {
          const edad = calcularEdad(p.fechaNacimiento);
          switch (rangoEdad) {
            case "5-13": return edad >= 5 && edad <= 13;
            case "14-15": return edad >= 14 && edad <= 15;
            case "16-17": return edad >= 16 && edad <= 17;
            case "18-34": return edad >= 18 && edad <= 34;
            case "35-44": return edad >= 35 && edad <= 44;
            case "45-59": return edad >= 45 && edad <= 59;
            default: return true;
          }
        });
      }
      setParticipantes(filtrados);
      setPagados(filtrados.reduce((acc, p) => { acc[p.id] = p.pagado || false; return acc; }, {}));
    } catch (err) {
      console.error("Error al buscar participantes", err);
      setParticipantes([]); setParticipantesRaw([]); setPagados({});
    } finally {
      setLoading(false);
    }
  };

  const exportarPDF = () => {
    const torneo = torneos.find(t => t.id === filtros.torneoId)?.nombre || "Torneo";
    const total = participantes.length;
    const precio = torneos.find(t => t.id === filtros.torneoId)?.precio || 0;
    const totalPagado = participantes.filter(p => pagados[p.id]).length;
    const totalCobrado = totalPagado * precio;
    const totalACobrar = total * precio;
    const deuda = totalACobrar - totalCobrado;

    const filtrosAplicados = [];
    if (filtros.torneoId) filtrosAplicados.push(`Torneo: ${torneo}`);
    if (filtros.escuelaId) {
      const esc = escuelas.find(e => e.id === filtros.escuelaId);
      filtrosAplicados.push(`Escuela: ${esc ? esc.nombre + ', ' + esc.ciudad : filtros.escuelaId}`);
    }
    if (filtros.instructorId) {
      const inst = instructores.find(i => i.id === filtros.instructorId);
      filtrosAplicados.push(`Instructor: ${inst ? inst.nombre + ' ' + inst.apellido : filtros.instructorId}`);
    }
    if (filtros.maestroId) {
      const ma = maestros.find(m => m.id === filtros.maestroId);
      filtrosAplicados.push(`Maestro: ${ma ? ma.nombre + ' ' + ma.apellido : filtros.maestroId}`);
    }
    if (provinciaId) {
      const prov = provincias.find(p => p.id === provinciaId);
      filtrosAplicados.push(`Provincia: ${prov ? prov.nombre : provinciaId}`);
    }
    ["tul","lucha","equipos","coach","juez","arbitro","autoridad_mesa"].forEach(campo => {
      if (filtros[campo] === "true") filtrosAplicados.push(`${campo.charAt(0).toUpperCase() + campo.slice(1)}: Sí`);
      if (filtros[campo] === "false") filtrosAplicados.push(`${campo.charAt(0).toUpperCase() + campo.slice(1)}: No`);
    });
    if (filtros.soloMaestros === "true") filtrosAplicados.push("Solo Maestros: Sí");

    // Columnas PDF: base + Maestro + Instructor + otros si están visibles
    const columnasPDF = [
      "Apellido, Nombre", "Documento", "Edad", "Peso (kg)", "Grado", "Maestro", "Instructor"
    ];
    if (mostrarOtros) {
      columnasPDF.push("Otro Instructor", "Otro Maestro");
    }
    columnasPDF.push(
      "Tul", "Lucha", "Equipos", "Coach", "Árbitro", "Mesa", "Pagado"
    );

    const bodyPDF = participantes.map((p) => {
      const apellidoNombre = `${p.apellido || ""}, ${p.nombre || ""}`.toUpperCase();
      const grado = (p.cinturon || "").toUpperCase();
      const edad = calcularEdad(p.fechaNacimiento);
      const fila = [
        apellidoNombre,
        p.documento,
        edad,
        p.peso,
        grado,
        // Maestro e Instructor: mostrar nombre completo si existe en maestros/instructores
        (() => {
          const ma = maestros.find(m => m.id === p.maestroId);
          return ma ? `${ma.nombre} ${ma.apellido}` : (p.maestroId || "");
        })(),
        (() => {
          const inst = instructores.find(i => i.id === p.instructorId);
          return inst ? `${inst.nombre} ${inst.apellido}` : (p.instructorId || "");
        })()
      ];
      if (mostrarOtros) {
        fila.push(p.otroInstructor || "", p.otroMaestro || "");
      }
      fila.push(
        p.tul ? "Sí" : "No",
        p.lucha ? "Sí" : "No",
        p.equipos ? "Sí" : "No",
        p.coach ? "Sí" : "No",
        p.arbitro ? "Sí" : "No",
        p.autoridad_mesa ? "Sí" : "No",
        pagados[p.id] ? "Sí" : "No"
      );
      return fila;
    });

    const doc = new jsPDF({ orientation: "landscape" });
    const logo = new Image();
    logo.src = "/logo.png";

    logo.onload = () => {
      const totalPagesExp = "{total_pages_count_string}";
      const pageContent = function (data) {
        doc.addImage(logo, 'PNG', 10, 8, 20, 20);
        doc.setFontSize(12);
        doc.text(`Participantes - ${torneo}`, 35, 15);
        if (filtrosAplicados.length > 0) {
          doc.setFontSize(10);
          let y = 23;
          filtrosAplicados.forEach(f => { doc.text(f, 35, y); y += 6; });
        }
        const str = `Página ${doc.internal.getNumberOfPages()}` + (typeof doc.putTotalPages === 'function' ? ` de ${totalPagesExp}` : '');
        doc.setFontSize(10);
        const pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
        doc.text(str, data.settings.margin.left, pageHeight - 10);
      };

      autoTable(doc, {
        margin: { top: 40 },
        head: [columnasPDF],
        body: bodyPDF,
        styles: { fontSize: 9 },
        headStyles: { fillColor: [22, 160, 133] },
        didDrawPage: pageContent,
      });

      const finalY = doc.lastAutoTable.finalY || 40;
      const total = participantes.length;
      const precio = torneos.find(t => t.id === filtros.torneoId)?.precio || 0;
      const totalPagado = participantes.filter(p => pagados[p.id]).length;
      const totalCobrado = totalPagado * precio;
      const totalACobrar = total * precio;
      const deuda = totalACobrar - totalCobrado;

      doc.setFontSize(11);
      doc.text(
        `Total participantes: ${total}   |   Total a cobrar: $${totalACobrar}   |   Total cobrado: $${totalCobrado}   |   Deuda: $${deuda}`,
        14, finalY + 12
      );

      if (typeof doc.putTotalPages === 'function') doc.putTotalPages(totalPagesExp);
      doc.save("participantes.pdf");
    };
  };

  const togglePagado = (id) => setPagados((prev) => ({ ...prev, [id]: !prev[id] }));

  const toggleSeleccionarTodos = () => {
    const allSelected = participantes.length > 0 && participantes.every((p) => pagados[p.id]);
    const nuevosEstados = {};
    participantes.forEach((p) => { nuevosEstados[p.id] = !allSelected; });
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

  const [busquedaApellido, setBusquedaApellido] = useState("");

  // Filtra participantes por apellido
  const participantesFiltrados = busquedaApellido.trim() === ""
    ? participantes
    : participantes.filter(p => (p.apellido || "").toLowerCase().includes(busquedaApellido.trim().toLowerCase()));

  const columnas = [
    {
      field: "nombre_apellido",
      headerName: "Apellido, Nombre",
      width: 180,
      valueGetter: (params) => {
        const apellido = params.row.apellido || "";
        const nombre = params.row.nombre || "";
        return `${apellido}, ${nombre}`.toUpperCase();
      },
    },
    { field: "documento", headerName: "Documento", width: 120 },
    { field: "peso", headerName: "Peso (kg)", width: 90, editable: true, type: "number" }, // editable
    {
      field: "edad",
      headerName: "Edad",
      width: 80,
      valueGetter: (params) => calcularEdad(params.row.fechaNacimiento),
    },
    {
      field: "cinturon",
      headerName: "Grado",
      width: 120,
      valueGetter: (params) => (params.row.cinturon || "").toUpperCase(),
    },
    {
      field: "maestroId",
      headerName: "Maestro",
      width: 140,
      valueGetter: (params) => params.row.maestroId || "",
    },
    {
      field: "instructorId",
      headerName: "Instructor",
      width: 140,
      valueGetter: (params) => params.row.instructorId || "",
    },
    ...(mostrarOtros ? [
      { field: "otroInstructor", headerName: "Otro Instructor", width: 140 },
      { field: "otroMaestro", headerName: "Otro Maestro", width: 140 },
    ] : []),
    {
      field: "tul", headerName: "Tul", width: 70,
      renderCell: (params) => params.row.tul ? <span style={{color: 'green'}}>✔️</span> : <span style={{color: 'red'}}>❌</span>
    },
    {
      field: "lucha", headerName: "Lucha", width: 70,
      renderCell: (params) => params.row.lucha ? <span style={{color: 'green'}}>✔️</span> : <span style={{color: 'red'}}>❌</span>
    },
    {
      field: "equipos", headerName: "Equipos", width: 70,
      renderCell: (params) => params.row.equipos ? <span style={{color: 'green'}}>✔️</span> : <span style={{color: 'red'}}>❌</span>
    },
    {
      field: "coach", headerName: "Coach", width: 70,
      renderCell: (params) => params.row.coach ? <span style={{color: 'green'}}>✔️</span> : <span style={{color: 'red'}}>❌</span>
    },
    {
      field: "juez", headerName: "Juez", width: 70,
      renderCell: (params) => params.row.juez ? <span style={{color: 'green'}}>✔️</span> : <span style={{color: 'red'}}>❌</span>
    },
    {
      field: "arbitro", headerName: "Árbitro", width: 70,
      renderCell: (params) => params.row.arbitro ? <span style={{color: 'green'}}>✔️</span> : <span style={{color: 'red'}}>❌</span>
    },
    {
      field: "autoridad_mesa", headerName: "Mesa", width: 70,
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
      width: 90,
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
      width: esAdmin ? 150 : 80,
      renderCell: (params) => (
        <Box display="flex" gap={1}>
          <Button
            variant="outlined"
            size="small"
            onClick={() => abrirModal(params.row)}
            sx={{ minWidth: 0, p: 1 }}
          >
            <VisibilityIcon fontSize="medium" />
          </Button>
          {esAdmin && (
            <>
              <Button
                variant="outlined"
                size="small"
                color="secondary"
                onClick={() => { setEditParticipante(params.row); setEditOpen(true); }}
                sx={{ minWidth: 0, p: 1 }}
                aria-label="Editar participante"
              >
                <EditIcon fontSize="medium" sx={{ color: '#1976d2' }} />
              </Button>
              <Button
                variant="outlined"
                size="small"
                color="error"
                onClick={() => { setParticipanteAEliminar(params.row); setDeleteOpen(true); }}
                sx={{ minWidth: 0, p: 1 }}
                aria-label="Eliminar participante"
              >
                <DeleteIcon fontSize="medium" />
              </Button>
            </>
          )}
        </Box>
      ),
    },
  ];

  // Handler para actualizar solo el peso
  const handlePesoUpdate = async (newRow, oldRow) => {
    console.log('handlePesoUpdate', { newRow, oldRow });
    if (newRow.peso !== oldRow.peso) {
      try {
        const response = await axios.put(`${API_BASE}/participantes/${newRow.id}`, { peso: newRow.peso });
        console.log('PUT response', response);
        buscarParticipantes(); // refresca la tabla
        return newRow;
      } catch (err) {
        console.error('PUT error', err);
        alert("Error al actualizar el peso");
        return oldRow;
      }
    }
    return newRow;
  };

  const handleEliminarParticipante = async () => {
    if (!participanteAEliminar) return;
    try {
      await axios.delete(`${API_BASE}/participantes/${participanteAEliminar.id}`);
      setDeleteOpen(false);
      setParticipanteAEliminar(null);
      buscarParticipantes();
    } catch (err) {
      alert("Error al eliminar participante");
      setDeleteOpen(false);
      setParticipanteAEliminar(null);
    }
  };

  const abrirModal = (datos) => { setDetalle(datos); setModalOpen(true); };
  const cerrarModal = () => setModalOpen(false);

  const exportarDetallePDF = (participante) => {
    if (!participante) return;
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const logo = new Image(); logo.src = "/logo.png";

    logo.onload = () => {
      const maxLogoWidth = 80;
      const logoRatio = logo.height / logo.width;
      const logoWidth = maxLogoWidth;
      const logoHeight = logoWidth * logoRatio;

      doc.setFillColor(0, 0, 0);
      doc.rect(0, 0, pageWidth, logoHeight + 10, "F");
      doc.addImage(logo, "PNG", (pageWidth - logoWidth) / 2, 5, logoWidth, logoHeight);

      const contentStartY = logoHeight + 20;
      doc.setFillColor(255, 255, 255);
      doc.rect(10, contentStartY, pageWidth - 20, pageHeight - contentStartY - 10, "F");

      const torneoNombre = torneos.find(t => t.id === filtros.torneoId)?.nombre || "Torneo";
      doc.setFontSize(30); doc.setFont("helvetica", "bold");
      doc.text(torneoNombre, pageWidth / 2, contentStartY + 15, { align: "center" });

      doc.setFontSize(35); doc.setFont("helvetica", "bold");
      doc.text("Participante", pageWidth / 2, contentStartY + 30, { align: "center" });

      const edad = calcularEdad(participante.fechaNacimiento);
      const data = [
        `Nombre: ${participante.nombre}`,
        `Apellido: ${participante.apellido}`,
        `Documento: ${participante.documento}`,
        `Edad: ${edad}`,
        `Peso: ${participante.peso} kg`,
        `Grado: ${(participante.cinturon || "").toUpperCase()}`
      ];

      doc.setFontSize(16);
      data.forEach((line, i) => { doc.text(line, pageWidth / 2, contentStartY + 55 + i * 12, { align: "center" }); });

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
      reader.onloadend = function () { callback(reader.result); };
      reader.readAsDataURL(xhr.response);
    };
    xhr.onerror = function () { alert("No se pudo cargar el QR para el PDF."); };
    xhr.open("GET", url); xhr.responseType = "blob"; xhr.send();
  };

  return (
    <Box>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="Gestión completa" />
        <Tab label="Asignar instructor (simple)" />
      </Tabs>

      {tab === 0 && (
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
          {loading && <LoadingSvg />}
          <Typography variant="h5" gutterBottom>Gestión de Participantes</Typography>

          {/* Filtros */}
          <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
            <Grid item xs={12} sm={3}>
              <TextField select fullWidth name="torneoId" label="Torneo" value={filtros.torneoId} onChange={handleChange}>
                {torneos.map((t) => (
                  <MenuItem key={t.id} value={t.id}>{`${t.nombre} - ${t.fecha}`}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField select fullWidth label="Provincia" value={provinciaId} onChange={e => setProvinciaId(e.target.value)}>
                <MenuItem value="">Todas</MenuItem>
                {provincias.map((prov) => (<MenuItem key={prov.id} value={prov.id}>{prov.nombre}</MenuItem>))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField select fullWidth name="escuelaId" label="Escuela" value={filtros.escuelaId} onChange={handleChange} disabled={filtros.instructorId || filtros.maestroId}>
                <MenuItem value="">Ninguna</MenuItem>
                {escuelas.map((e) => (<MenuItem key={e.id} value={e.id}>{`${e.nombre}, ${e.ciudad}`}</MenuItem>))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField select fullWidth name="instructorId" label="Instructor" value={filtros.instructorId} onChange={handleChange} disabled={filtros.escuelaId || filtros.maestroId}>
                <MenuItem value="">Ninguno</MenuItem>
                {instructores.map((i) => (<MenuItem key={i.id} value={i.id}>{`${i.nombre} ${i.apellido}`}</MenuItem>))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField select fullWidth name="maestroId" label="Maestro" value={filtros.maestroId} onChange={handleChange} disabled={filtros.escuelaId || filtros.instructorId}>
                <MenuItem value="">Ninguno</MenuItem>
                {maestros.map((m) => (<MenuItem key={m.id} value={m.id}>{`${m.nombre} ${m.apellido}`}</MenuItem>))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={2}>
              <Button variant="contained" color="primary" fullWidth onClick={buscarParticipantes}>Buscar</Button>
            </Grid>
            <Grid item xs={12} sm={2}>
              <Button variant="outlined" color="secondary" fullWidth onClick={exportarPDF} disabled={participantes.length === 0}>Exportar PDF</Button>
            </Grid>
            <Grid item xs={12} sm={2}>
              <Button variant="contained" color="success" fullWidth onClick={actualizarPagados} disabled={participantes.length === 0}>Actualizar cobro</Button>
            </Grid>
          </Grid>

          {/* Resumen */}
          <Box sx={{ mb: 2 }}>
            <Typography>Total a cobrar: ${totalACobrar}</Typography>
            <Typography>Total cobrado: ${totalCobrado}</Typography>
            <Typography>Deuda: ${deuda}</Typography>
          </Box>

          {/* Filtros booleanos y de edad */}
          <Box sx={{ mb: 2, mt: 1 }}>
            <Grid container spacing={2} alignItems="center">
              {[
                "tul","lucha","equipos","coach","juez","arbitro","autoridad_mesa"
              ].map((campo) => (
                <Grid item xs={12} sm={2} key={campo}>
                  <TextField select fullWidth name={campo} label={campo.charAt(0).toUpperCase() + campo.slice(1)} value={filtros[campo]} onChange={handleChange}>
                    <MenuItem value="">Todos</MenuItem>
                    <MenuItem value="true">✔️</MenuItem>
                    <MenuItem value="false">❌</MenuItem>
                  </TextField>
                </Grid>
              ))}
              <Grid item xs={12} sm={2} key="rangoEdad">
                <TextField select fullWidth name="rangoEdad" label="Rango Edad" value={filtros.rangoEdad} onChange={handleChange}>
                  <MenuItem value="">Todas</MenuItem>
                  <MenuItem value="5-13">5 a 13</MenuItem>
                  <MenuItem value="14-15">14 y 15</MenuItem>
                  <MenuItem value="16-17">16 y 17</MenuItem>
                  <MenuItem value="18-34">18 a 34</MenuItem>
                  <MenuItem value="35-44">35 a 44</MenuItem>
                  <MenuItem value="45-59">45 a 59</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={2} key="soloMaestros">
                <TextField select fullWidth name="soloMaestros" label="Solo Maestros" value={filtros.soloMaestros} onChange={handleChange}>
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value="true">Solo Maestros</MenuItem>
                </TextField>
              </Grid>
            </Grid>
          </Box>

          {/* Búsqueda por apellido */}
          <Box sx={{ mb: 2 }}>
            <TextField
              label="Buscar por apellido"
              variant="outlined"
              size="small"
              value={busquedaApellido}
              onChange={e => setBusquedaApellido(e.target.value)}
              sx={{ mb: 2, width: 250 }}
            />
            <Button
              variant="outlined"
              size="small"
              onClick={() => setBusquedaApellido("")}
              sx={{ ml: 1 }}
            >
              Limpiar
            </Button>
          </Box>

          {/* Grid */}
          <Box sx={{ width: '100%', overflowX: 'auto' }}>
            <Paper sx={{ minWidth: 1200, mb: 2, overflowX: 'auto' }}>
              <div style={{ width: '1200px', minWidth: '100%', overflowX: 'auto' }}>
                <DataGrid
                  autoHeight
                  rows={participantesFiltrados}
                  columns={columnas}
                  getRowId={(row) => row.id}
                  pageSize={pageSize}
                  rowsPerPageOptions={[10, 20, 50]}
                  onPageSizeChange={(newSize) => setPageSize(Number(newSize))}
                  pagination
                  hideFooterSelectedRowCount
                  processRowUpdate={handlePesoUpdate}
                  experimentalFeatures={{ newEditingApi: true }}
                />
              </div>
            </Paper>
          </Box>

          {/* Modal detalle como componente separado */}
          <ParticipanteDetalleModal
            open={modalOpen}
            onClose={cerrarModal}
            participanteId={detalle?.id}
            torneoNombre={torneos.find(t => t.id === filtros.torneoId)?.nombre || "No seleccionado"}
            exportarDetallePDF={exportarDetallePDF}
          />

          {/* Modal edición */}
          <EditParticipanteModal
            open={editOpen}
            onClose={() => setEditOpen(false)}
            participante={editParticipante}
            onUpdated={buscarParticipantes}
            torneos={torneos}
            paises={paises}
            provincias={provincias}
            escuelas={escuelas}
            instructores={instructores}
            maestros={maestros}
          />

          {/* Modal elimina */}
          <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)}>
            <Box sx={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", bgcolor: "#fff", color: "#000", boxShadow: 24, borderRadius: 2, minWidth: 350, maxWidth: 400, p: 3, textAlign: "center" }}>
              <Typography variant="h6" gutterBottom>¿Seguro que deseas eliminar este participante?</Typography>
              <Typography fontSize={18} sx={{ mb: 2 }}>{participanteAEliminar?.nombre} {participanteAEliminar?.apellido}</Typography>
              <Box display="flex" justifyContent="center" gap={2}>
                <Button variant="contained" color="error" onClick={handleEliminarParticipante}>Eliminar</Button>
                <Button variant="outlined" onClick={() => setDeleteOpen(false)}>Cancelar</Button>
              </Box>
            </Box>
          </Modal>
        </Box>
      )}

      {tab === 1 && (
        <Box>
          <ParticipantesSimple torneoId={filtros.torneoId} />
        </Box>
      )}
    </Box>
  );
};

export default AdminParticipantes;
