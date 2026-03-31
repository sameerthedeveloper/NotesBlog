import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Box, CircularProgress } from "@mui/material";

const ProtectedRoute = () => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <Box 
        sx={{ 
          display: "flex", 
          justifyContent: "center", 
          alignItems: "center", 
          height: "100vh" 
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location.pathname + location.search }} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
