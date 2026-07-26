import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { isSuperAdmin } from "../config/adminConfig";
import UnauthorizedPage from "../pages/UnauthorizedPage";
import { Box, CircularProgress } from "@mui/material";

const AdminRoute = () => {
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

  // Not authenticated at all -> send to login
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location.pathname + location.search }} replace />;
  }

  // Authenticated user but NOT Super Admin -> render Unauthorized 403 Page
  if (!isSuperAdmin(currentUser)) {
    return <UnauthorizedPage />;
  }

  // Authorized Super Admin -> Render protected admin layout/route
  return <Outlet />;
};

export default AdminRoute;
