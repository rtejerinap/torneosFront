import React from "react";
import {
  Box, Drawer, List, ListItem, ListItemButton, ListItemText,
  IconButton, Toolbar, Tooltip, Divider
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import LogoutIcon from "@mui/icons-material/Logout";
import EventIcon from "@mui/icons-material/Event";
import GroupIcon from "@mui/icons-material/Group";
import SchoolIcon from "@mui/icons-material/School";
import SecurityIcon from "@mui/icons-material/Security"; // Para el ícono de Roles
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const drawerWidth = 240;

const AdminLayout = () => {
  const [open, setOpen] = React.useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { cerrarSesion, rol: roles } = useAuth(); // ✅ fix: usar 'rol' y renombrar como 'roles'

  const handleLogout = async () => {
    await cerrarSesion();
    navigate("/");
  };

  const menuPorRol = {
    admin: [
      { label: "Torneos", path: "/admin/torneos", icon: <EventIcon /> },
      { label: "Participantes", path: "/admin/participantes", icon: <GroupIcon /> },
      { label: "Escuelas", path: "/admin/escuelas", icon: <SchoolIcon /> },
      { label: "Roles", path: "/admin/roles", icon: <SecurityIcon /> },
    { label: "Combates", path: "/admin/combates", icon: <EventIcon /> },
    ],
    usuario: [
     //{ label: "Participantes", path: "/admin/participantes", icon: <GroupIcon /> },
    ],
    coach: [
      { label: "Participantes", path: "/admin/participantes", icon: <GroupIcon /> },
      { label: "Escuelas", path: "/admin/escuelas", icon: <SchoolIcon /> },
    ],
    arbitro: [
      { label: "Torneos", path: "/admin/torneos", icon: <EventIcon /> },
          { label: "Combates", path: "/admin/combates", icon: <EventIcon /> },

    ],
    autoridad: [
      { label: "Participantes", path: "/admin/participantes", icon: <GroupIcon /> },
    ],
  };

  const menuItems = (roles || [])
    .flatMap((rol) => menuPorRol[rol] || [])
    .filter((item, index, self) =>
      index === self.findIndex((i) => i.path === item.path)
    );

  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
      <Drawer
        variant="permanent"
        sx={{
          width: open ? drawerWidth : 64,
          flexShrink: 0,
          whiteSpace: "nowrap",
          [`& .MuiDrawer-paper`]: {
            width: open ? drawerWidth : 64,
            transition: "width 0.3s",
            overflowX: "hidden",
          },
        }}
        open={open}
      >
        <Toolbar>
          <IconButton onClick={() => setOpen(!open)}>
            <MenuIcon />
          </IconButton>
        </Toolbar>
        <Divider />
        <List>
          {menuItems.map((item) => (
            <ListItem key={item.path} disablePadding sx={{ display: "block" }}>
              <Tooltip title={open ? "" : item.label} placement="right">
                <ListItemButton
                  component={Link}
                  to={item.path}
                  selected={location.pathname === item.path}
                  sx={{ justifyContent: open ? "initial" : "center", px: 2.5 }}
                >
                  {item.icon}
                  {open && <ListItemText primary={item.label} sx={{ ml: 2 }} />}
                </ListItemButton>
              </Tooltip>
            </ListItem>
          ))}
        </List>
        <Divider />
        <List>
          <ListItem disablePadding sx={{ display: "block" }}>
            <Tooltip title={open ? "" : "Cerrar sesión"} placement="right">
              <ListItemButton
                onClick={handleLogout}
                sx={{ justifyContent: open ? "initial" : "center", px: 2.5 }}
              >
                <LogoutIcon />
                {open && <ListItemText primary="Cerrar sesión" sx={{ ml: 2 }} />}
              </ListItemButton>
            </Tooltip>
          </ListItem>
        </List>
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
        //  ml: open ? `${drawerWidth}px` : "64px",
          transition: "margin 0.3s",
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};

export default AdminLayout;
