import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { AppThemeProvider } from "./context/ThemeContext";
import ProtectedRoute from "./components/ProtectedRoute";
import { Toaster } from "react-hot-toast";
import { Box, CircularProgress, Skeleton, Container } from "@mui/material";

// Layouts
const AppLayout = lazy(() => import("./layouts/AppLayout"));
const AuthLayout = lazy(() => import("./layouts/AuthLayout"));

// Pages
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const SignupPage = lazy(() => import("./pages/SignupPage"));
const NoteEditorPage = lazy(() => import("./pages/NoteEditorPage"));
const PublicNotePage = lazy(() => import("./pages/PublicNotePage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));

const LoadingFallback = () => (
  <Box 
    sx={{ 
      display: "flex", 
      justifyContent: "center", 
      alignItems: "center", 
      height: "100vh",
      bgcolor: "background.default" 
    }}
  >
    <CircularProgress />
  </Box>
);

const PageSkeleton = () => (
  <Container maxWidth="lg" sx={{ mt: 4 }}>
    <Skeleton variant="text" sx={{ fontSize: '3rem', width: '40%', mb: 2 }} />
    <Skeleton variant="rectangular" height={40} sx={{ mb: 4, borderRadius: 2 }} />
    <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
      <Skeleton variant="rectangular" width={80} height={32} sx={{ borderRadius: 1 }} />
      <Skeleton variant="rectangular" width={80} height={32} sx={{ borderRadius: 1 }} />
      <Skeleton variant="rectangular" width={80} height={32} sx={{ borderRadius: 1 }} />
    </Box>
    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 3 }}>
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Skeleton key={i} variant="rectangular" height={200} sx={{ borderRadius: 1 }} />
      ))}
    </Box>
  </Container>
);

function App() {
  return (
    <AppThemeProvider>
      <AuthProvider>
        <Router>
          <Toaster position="top-right" />
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              {/* Auth Routes */}
              <Route element={<AuthLayout />}>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
              </Route>

              {/* Public Routes */}
              <Route path="/note/:id" element={<PublicNotePage />} />

              {/* Protected Routes */}
              <Route element={<ProtectedRoute />}>
                <Route element={<AppLayout />}>
                  <Route 
                    path="/" 
                    element={
                      <Suspense fallback={<PageSkeleton />}>
                        <DashboardPage />
                      </Suspense>
                    } 
                  />
                  <Route path="/note/new" element={<NoteEditorPage />} />
                  <Route path="/note/:id/edit" element={<NoteEditorPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                </Route>
              </Route>
            </Routes>
          </Suspense>
        </Router>
      </AuthProvider>
    </AppThemeProvider>
  );
}

export default App;
