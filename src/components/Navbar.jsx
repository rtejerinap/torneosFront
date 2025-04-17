// src/components/Navbar.jsx
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

const pages = [
    { label: "Inicio", path: "/" },
    { label: "Inscribirse", path: "/inscribirse" },
];

const Navbar = () => {
    const [anchorElNav, setAnchorElNav] = React.useState(null);

    const handleOpenNavMenu = (event) => setAnchorElNav(event.currentTarget);
    const handleCloseNavMenu = () => setAnchorElNav(null);

    return (
<AppBar position="static" color="primary" sx={{ width: "100%" }}>
<Toolbar disableGutters sx={{ px: { xs: 2, sm: 4 } }}>
                <Typography variant="h6" sx={{ flexGrow: 1 }}>
                    🥋 Taekwondo
                </Typography>

                <Box sx={{ display: { xs: "none", md: "flex" } }}>
                    {pages.map((page) => (
                        <Button
                            key={page.path}
                            component={Link}
                            to={page.path}
                            sx={{ color: "white" }}
                        >
                            {page.label}
                        </Button>
                    ))}
                </Box>

                <Box sx={{ display: { xs: "flex", md: "none" } }}>
                    <IconButton size="large" color="inherit" onClick={handleOpenNavMenu}>
                        <MenuIcon />
                    </IconButton>
                    <Menu
                        anchorEl={anchorElNav}
                        open={Boolean(anchorElNav)}
                        onClose={handleCloseNavMenu}
                    >
                        {pages.map((page) => (
                            <MenuItem
                                key={page.path}
                                component={Link}
                                to={page.path}
                                onClick={handleCloseNavMenu}
                            >
                                {page.label}
                            </MenuItem>
                        ))}
                    </Menu>
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Navbar;
