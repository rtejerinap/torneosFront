import React, { useEffect, useState } from "react";
import { Modal, Box, Typography, Button } from "@mui/material";
import axios from "axios";
import LoadingSvg from "/src/components/loader/LoadingSvg";
import jsPDF from "jspdf";

const API_BASE = import.meta.env.VITE_API_URL;

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

const ParticipanteDetalleModal = ({ open, onClose, participanteId, torneoNombre }) => {
  const [detalle, setDetalle] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !participanteId) {
      setDetalle(null); // Limpia el detalle cuando se cierra o no hay ID
      return;
    }
    setLoading(true);
    axios.get(`${API_BASE}/participantes/${participanteId}`)
      .then(res => setDetalle(res.data))
      .catch(() => setDetalle(null))
      .finally(() => setLoading(false));
  }, [open, participanteId]);

  const exportarDetallePDF = (participante) => {
    if (!participante) return;
    
    // Crear PDF en formato A6 (105mm x 148mm)
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a6'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const logo = new Image(); 
    logo.src = "/logo.png";

    logo.onload = () => {
      // Header con logo (más pequeño)
      const maxLogoWidth = 25;
      const logoRatio = logo.height / logo.width;
      const logoWidth = maxLogoWidth;
      const logoHeight = logoWidth * logoRatio;
      
      const headerHeight = logoHeight + 4; // Altura del encabezado reducida
      doc.setFillColor(0, 0, 0);
      doc.rect(0, 0, pageWidth, headerHeight, "F");
      doc.addImage(logo, "PNG", (pageWidth - logoWidth) / 2, 2, logoWidth, logoHeight);

      let contentStartY = headerHeight + 10;

      // Nombre del Torneo
      doc.setFontSize(16); 
      doc.setFont("helvetica", "bold");
      doc.text(torneoNombre || "Torneo", pageWidth / 2, contentStartY, { align: "center" });
      
      contentStartY += 10;

      // --- INICIO DE LA LÓGICA DE ROLES ---
      // Construir la lista de roles
      const roles = ["Participante"];
      if (participante.coach) roles.push("Coach");
      if (participante.arbitro) roles.push("Juez");
      if (participante.autoridad_mesa) roles.push("Autoridad de Mesa");
      
      // Unir los roles con un guion
      const tituloCompleto = roles.join(" - ");

      // Ajustar el tamaño de la fuente si el texto es muy largo
      let fontSize = 18;
      const maxWidth = pageWidth - 20; // Margen de 10mm a cada lado
      const textWidth = doc.getStringUnitWidth(tituloCompleto) * fontSize / doc.internal.scaleFactor;
      
      if (textWidth > maxWidth) {
        fontSize = (maxWidth / textWidth) * fontSize * 0.95; // Reducir y dar un pequeño margen
      }

      // Título dinámico (Participante y/o Roles)
      doc.setFontSize(fontSize);
      doc.setFont("helvetica", "bold");
      doc.text(tituloCompleto, pageWidth / 2, contentStartY, { align: "center" });
      // --- FIN DE LA LÓGICA DE ROLES ---
      
      contentStartY += 10;

      // Datos del participante
      const calcularEdad = (fechaNac) => {
        if (!fechaNac) return '';
        const hoy = new Date();
        const cumple = new Date(fechaNac);
        let edad = hoy.getFullYear() - cumple.getFullYear();
        const m = hoy.getMonth() - cumple.getMonth();
        if (m < 0 || (m === 0 && hoy.getDate() < cumple.getDate())) {
          edad--;
        }
        return `Edad: ${edad} años`;
      };

      const data = [
        `${participante.apellido}, ${participante.nombre}`, // Nombre completo
        `Documento: ${participante.documento}`,
        `Cinturón: ${participante.cinturon}`,
        calcularEdad(participante.fechaNacimiento)
      ];

      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      data.forEach((line, i) => { 
        doc.text(line, pageWidth / 2, contentStartY + i * 8, { align: "center" }); 
      });

      contentStartY += data.length * 8 + 10; // Más espacio antes del QR

      // Código QR
      if (participante.qr) {
        toDataURL(participante.qr, (base64Img) => {
          const qrSize = 40; // QR un poco más grande
          doc.addImage(base64Img, "PNG", (pageWidth - qrSize) / 2, contentStartY, qrSize, qrSize);
          doc.save(`credencial-${participante.documento}.pdf`);
        });
      } else {
        doc.save(`credencial-${participante.documento}.pdf`);
      }
    };
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", bgcolor: "#2c2c2c", color: "white", boxShadow: 24, borderRadius: 2, minWidth: 350, maxWidth: 500, overflow: "hidden", fontFamily: "Arial, sans-serif" }}>
        <Box sx={{ bgcolor: "#000", textAlign: "center", p: 2 }}>
          <img src="/logo.png" alt="Logo" style={{ maxWidth: "100%", height: "auto", maxHeight: 80, objectFit: "contain" }}/>
        </Box>
        <Box sx={{ bgcolor: "#fff", color: "#000", textAlign: "center", p: 3 }}>
          {loading ? <LoadingSvg /> : detalle ? (
            <>
              <Typography variant="h4" gutterBottom>{torneoNombre}</Typography>
              <Typography variant="h3" gutterBottom>Participante</Typography>
              <Typography fontSize={18}>Nombre: {detalle.nombre}</Typography>
              <Typography fontSize={18}>Apellido: {detalle.apellido}</Typography>
              <Typography fontSize={18}>Documento: {detalle.documento}</Typography>
              <Typography fontSize={18}>Fecha Nac: {detalle.fechaNacimiento} ({(() => {
                if (!detalle.fechaNacimiento) return "";
                const hoy = new Date();
                const cumple = new Date(detalle.fechaNacimiento);
                let edad = hoy.getFullYear() - cumple.getFullYear();
                const m = hoy.getMonth() - cumple.getMonth();
                if (m < 0 || (m === 0 && hoy.getDate() < cumple.getDate())) {
                  edad--;
                }
                return `${edad} años`;
              })()})</Typography>
              <Typography fontSize={18}>Peso: {detalle.peso} kg</Typography>
              <Typography fontSize={18}>Cinturón: {detalle.cinturon}</Typography>
              {detalle.qr && (
                <Box mt={2}>
                  <Typography variant="h6">Código QR</Typography>
                  <img src={detalle.qr} alt="QR Participante" style={{ width: 150, marginTop: 10 }}/>
                </Box>
              )}
              <Button variant="contained" fullWidth sx={{ mt: 3 }} onClick={() => exportarDetallePDF(detalle)}>
                Exportar a PDF
              </Button>
            </>
          ) : (
            <Typography>No se encontró el participante.</Typography>
          )}
        </Box>
      </Box>
    </Modal>
  );
};

export default ParticipanteDetalleModal;
