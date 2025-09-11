import React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoginForm from "./LoginForm";
import Modal from "@mui/material/Modal";

const pages = [
  { label: "Inicio", path: "/" },
  { label: "Inscribirse", path: "/inscribirse" },
];

const Navbar = () => {
  const [anchorElNav, setAnchorElNav] = React.useState(null);
  const { usuario } = useAuth();
  const [openLogin, setOpenLogin] = React.useState(false);

  const handleOpenNavMenu = (event) => setAnchorElNav(event.currentTarget);
  const handleCloseNavMenu = () => setAnchorElNav(null);

  const fullMenu = [...pages, ...(usuario ? [{ label: "Administración", path: "/admin" }] : [])];

  return (
    <AppBar position="static" sx={{ bgcolor: "#000", width: "100%" }}>
      <Toolbar sx={{ width: "100%", px: { xs: 2, sm: 4 }, justifyContent: "space-between" }}>
        {/* Logo a la izquierda */}
        <Box
          component={Link}
          to="/"
          sx={{
            display: "flex",
            alignItems: "center",
            textDecoration: "none",
            ml: "15%", // margen izquierdo del 15%
          }}
        >
          <Box
            component="img"
            src="/logo.png"
            alt="Logo"
            sx={{ height: 80, width: 80, mr: 2 }}
          />

          <Typography variant="h6" noWrap sx={{ color: "#fff" }}>
          </Typography>
        </Box>
        {/* Menú de navegación */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
          {fullMenu.map((page) => (
            <Button
              key={page.label}
              component={Link}
              to={page.path}
              sx={{ color: "#fff", fontWeight: "bold" }}
            >
              {page.label}
            </Button>
          ))}
          {/* Opción de ingreso si no está logueado */}
          {!usuario && (
            <Button color="inherit" onClick={() => setOpenLogin(true)} sx={{ fontWeight: "bold" }}>
              INICIAR SESIÓN
            </Button>
          )}
        </Box>
      </Toolbar>
      {/* Modal de login */}
      <Modal open={openLogin} onClose={() => setOpenLogin(false)}>
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: '#fff', boxShadow: 24, borderRadius: 2, p: 3, minWidth: 350 }}>
          <LoginForm onLoginSuccess={() => setOpenLogin(false)} />
        </Box>
      </Modal>
    </AppBar>
  );
};

export default Navbar;
