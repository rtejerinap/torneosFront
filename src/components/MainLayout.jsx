import { Outlet } from "react-router-dom";
import { Box, CssBaseline } from "@mui/material";

const MainLayout = () => {
  return (
    <>
      <CssBaseline />
      <Box
        sx={{
          width: "100%",
          minHeight: "100vh",
          bgcolor: "#f5f5f5",
          display: "flex",
          justifyContent: "center",
          alignItems: "start",
          pt: 4,
          px: { xs: 2, sm: 4 },
        }}
      >
        <Box
          sx={{
            width: "100%",
         
            bgcolor: "white",
            boxShadow: 3,
            borderRadius: 2,
            p: { xs: 2, sm: 4 },
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </>
  );
};

export default MainLayout;
