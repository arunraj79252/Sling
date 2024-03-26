import { useTheme } from "@emotion/react";
import { Box } from "@mui/material";
import React from "react";
import { Outlet } from "react-router-dom";

const AuthLayout = () => {
    const theme = useTheme()
  return (
    <Box
      sx={{
        width: '100vw',
        minHeight: '100vh',
        background: theme.palette.primary.secondary
      }}
    >
      <Outlet />
    </Box>
  );
};

export default AuthLayout;
