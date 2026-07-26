import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { AppThemeProvider } from "./context/ThemeContext";
import { MonetizationProvider } from "./context/MonetizationContext";
import ProtectedRoute from "./components/ProtectedRoute";
import { Toaster } from "react-hot-toast";
import { Box, CircularProgress, Skeleton, Container } from "@mui/material";

// Layouts
const AppLayout = lazy(() => import("./layouts/AppLayout"));
const AuthLayout = lazy(() => import("./layouts/AuthLayout"));

// Pages
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const NotesPage = lazy(() => import("./pages/NotesPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const SignupPage = lazy(() => import("./pages/SignupPage"));
const NoteEditorPage = lazy(() => import("./pages/NoteEditorPage"));
const PublicNotePage = lazy(() => import("./pages/PublicNotePage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const DiscoverPage = lazy(() => import("./pages/DiscoverPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const SearchPage = lazy(() => import("./pages/SearchPage"));
const NotificationsPage = lazy(() => import("./pages/NotificationsPage"));
const SharedNotesPage = lazy(() => import("./pages/SharedNotesPage"));
const BookmarksPage = lazy(() => import("./pages/BookmarksPage"));
const AdminPanelPage = lazy(() => import("./pages/AdminPanelPage"));
const MonetizationPage = lazy(() => import("./pages/MonetizationPage"));

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
    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 3 }}>
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Skeleton key={i} variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
      ))}
    </Box>
  </Container>
);

function App() {
  return (
    <AppThemeProvider>
      <AuthProvider>
        <MonetizationProvider>
          <Router>
            <Toaster position="top-right" />
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                {/* Auth Routes */}
                <Route element={<AuthLayout />}>
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/signup" element={<SignupPage />} />
                </Route>

                {/* Public Note Viewer Route */}
                <Route path="/note/:id" element={<PublicNotePage />} />

                {/* Protected Workspace Routes */}
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
                    <Route path="/dashboard" element={
                      <Suspense fallback={<PageSkeleton />}>
                        <DashboardPage />
                      </Suspense>
                    } />
                    <Route path="/notes" element={
                      <Suspense fallback={<PageSkeleton />}>
                        <NotesPage />
                      </Suspense>
                    } />
                    <Route path="/discover" element={
                      <Suspense fallback={<PageSkeleton />}>
                        <DiscoverPage />
                      </Suspense>
                    } />
                    <Route path="/shared" element={
                      <Suspense fallback={<PageSkeleton />}>
                        <SharedNotesPage />
                      </Suspense>
                    } />
                    <Route path="/bookmarks" element={
                      <Suspense fallback={<PageSkeleton />}>
                        <BookmarksPage />
                      </Suspense>
                    } />
                    <Route path="/monetization" element={
                      <Suspense fallback={<PageSkeleton />}>
                        <MonetizationPage />
                      </Suspense>
                    } />
                    <Route path="/search" element={
                      <Suspense fallback={<PageSkeleton />}>
                        <SearchPage />
                      </Suspense>
                    } />
                    <Route path="/notifications" element={
                      <Suspense fallback={<PageSkeleton />}>
                        <NotificationsPage />
                      </Suspense>
                    } />
                    <Route path="/settings" element={
                      <Suspense fallback={<PageSkeleton />}>
                        <SettingsPage />
                      </Suspense>
                    } />
                    <Route path="/admin" element={
                      <Suspense fallback={<PageSkeleton />}>
                        <AdminPanelPage />
                      </Suspense>
                    } />
                    <Route path="/note/new" element={<NoteEditorPage />} />
                    <Route path="/note/:id/edit" element={<NoteEditorPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                  </Route>
                </Route>
              </Routes>
            </Suspense>
          </Router>
        </MonetizationProvider>
      </AuthProvider>
    </AppThemeProvider>
  );
}

export default App;
