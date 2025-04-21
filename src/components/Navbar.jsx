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

const pages = [
  { label: "Inicio", path: "/" },
  { label: "Inscribirse", path: "/inscribirse" },
];

const Navbar = () => {
  const [anchorElNav, setAnchorElNav] = React.useState(null);
  const { usuario, loginConGoogle } = useAuth();

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
            ml: "15%", // margen izquierdo del 10%
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

        {/* Espaciador para empujar a la derecha */}
        <Box sx={{ flexGrow: 1 }} />

        {/* Menú grande (desktop) */}
        <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: "center", gap: "2vmin" }}>
          {fullMenu.map((page) => (
            <Button
              key={page.path}
              component={Link}
              to={page.path}
              sx={{ color: "white" }}
            >
              {page.label}
            </Button>
          ))}
          {usuario ? (
            <Typography variant="body2" sx={{ color: "white" }}>
              {usuario.displayName || usuario.email}
            </Typography>
          ) : (
            <Button color="inherit" onClick={loginConGoogle}>
              Iniciar sesión con Google
            </Button>
          )}
        </Box>

        {/* Menú hamburguesa (mobile) */}
        <Box sx={{ display: { xs: "flex", md: "none" }, ml: "auto" }}>
          <IconButton size="large" color="inherit" onClick={handleOpenNavMenu}>
            <MenuIcon />
          </IconButton>
          <Menu
            anchorEl={anchorElNav}
            open={Boolean(anchorElNav)}
            onClose={handleCloseNavMenu}
          >
            {fullMenu.map((page) => (
              <MenuItem
                key={page.path}
                component={Link}
                to={page.path}
                onClick={handleCloseNavMenu}
              >
                {page.label}
              </MenuItem>
            ))}
            {!usuario && (
              <MenuItem onClick={loginConGoogle}>Iniciar sesión con Google</MenuItem>
            )}
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
