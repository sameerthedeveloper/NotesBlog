import React, { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { 
  AppBar, 
  Box, 
  CssBaseline, 
  Divider, 
  Drawer, 
  IconButton, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Toolbar, 
  Typography, 
  Avatar, 
  Menu, 
  MenuItem, 
  Tooltip,
  useTheme,
  useMediaQuery,
  Button,
  Stack,
  Container,
  Fab,
  InputBase,
  Badge,
  Breadcrumbs,
  Link as MuiLink,
  alpha,
  BottomNavigation,
  BottomNavigationAction,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from "@mui/material";
import { 
  Menu as MenuIcon, 
  Add as AddIcon, 
  Notes as NotesIcon,
  Person as PersonIcon, 
  Logout as LogoutIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  Search as SearchIcon,
  PushPin as PinnedIcon,
  Favorite as FavoriteIcon,
  SettingsOutlined as SettingsIcon,
  Clear as ClearIcon,
  ArrowBack as ArrowBackIcon,
  Close as CloseIcon,
  Explore as ExploreIcon,
  Dashboard as DashboardIcon,
  NotificationsOutlined as NotificationsIcon,
  ShareOutlined as ShareIcon,
  AdminPanelSettingsOutlined as AdminIcon,
  BookmarkOutlined as BookmarkIcon,
  AutoAwesome as SparklesIcon,
  MonetizationOnOutlined as MonetizationIcon,
  HelpOutlineOutlined as HelpIcon
} from "@mui/icons-material";
import PromptBuilderModal from "../components/PromptBuilderModal";
import OnboardingWizardModal from "../components/OnboardingWizardModal";
import { useAuth } from "../context/AuthContext";
import { useAppTheme } from "../context/ThemeContext";

import { isSuperAdmin } from "../config/adminConfig";

const drawerWidth = 260;

const AppLayout = () => {
  const { currentUser, logout } = useAuth();
  const { mode, toggleColorMode } = useAppTheme();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [promptModalOpen, setPromptModalOpen] = useState(false);
  const [helpDialogOpen, setHelpDialogOpen] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();

  const handleDrawerToggle = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen);
    } else {
      setDrawerOpen(!drawerOpen);
    }
  };

  const handleProfileMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleProfileMenuClose = () => setAnchorEl(null);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout error", error);
    }
  };

  const menuItems = [
    { text: "Dashboard", icon: <DashboardIcon />, path: "/" },
    { text: "My Notes", icon: <NotesIcon />, path: "/notes" },
    { text: "Discover", icon: <ExploreIcon />, path: "/discover" },
    { text: "Shared Notes", icon: <ShareIcon />, path: "/shared" },
    { text: "Bookmarks", icon: <BookmarkIcon />, path: "/bookmarks" },
    { text: "Monetization", icon: <MonetizationIcon />, path: "/monetization" },
    { text: "Search", icon: <SearchIcon />, path: "/search" },
    { text: "Notifications", icon: <NotificationsIcon />, path: "/notifications" },
    { text: "Profile", icon: <PersonIcon />, path: "/profile" },
    { text: "Settings", icon: <SettingsIcon />, path: "/settings" },
    ...(isSuperAdmin(currentUser) ? [{ text: "Admin Panel", icon: <AdminIcon />, path: "/admin" }] : []),
  ];

  const handleSearchSubmit = (e) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const drawerContent = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column", pt: 1 }}>
      {/* Create Note Button (Desktop / Larger screens) */}
      {!isMobile && (
        <Box sx={{ px: 2, mb: 2, mt: 1 }}>
           <Button
              variant="contained"
              fullWidth
              startIcon={<AddIcon sx={{ fontSize: 24 }} />}
              onClick={() => navigate("/note/new")}
              sx={{ 
                  py: 1.5, 
                  px: 3,
                  borderRadius: 3,
                  fontWeight: 700, 
                  fontSize: '0.9rem',
                  backgroundColor: theme.palette.primary.main,
                  color: '#FFFFFF',
                  boxShadow: '0px 4px 12px rgba(11, 87, 208, 0.25)',
                  "&:hover": {
                      backgroundColor: theme.palette.primary.dark,
                  }
              }}
           >
              Create Note
           </Button>
        </Box>
      )}

      <Box sx={{ overflow: "auto", flexGrow: 1, px: 1 }}>
        <List>
          {menuItems.map((item) => {
            const isSelected = location.pathname === item.path;
            return (
              <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton 
                  selected={isSelected}
                  onClick={() => {
                    navigate(item.path);
                    if (isMobile) setMobileOpen(false);
                  }}
                  sx={{
                      borderRadius: 3,
                      py: 1,
                      "&.Mui-selected": {
                          backgroundColor: theme.palette.primary.container || alpha(theme.palette.primary.main, 0.12),
                          color: theme.palette.primary.main,
                          "& .MuiListItemIcon-root": { color: theme.palette.primary.main },
                          "& .MuiTypography-root": { fontWeight: 700 }
                      }
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40, color: isSelected ? "primary.main" : "text.secondary" }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.text} 
                    primaryTypographyProps={{ fontWeight: isSelected ? 700 : 500, fontSize: '0.9rem' }} 
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>
    </Box>
  );

  // Generate breadcrumb links based on current path
  const pathnames = location.pathname.split("/").filter((x) => x);

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", width: "100%", bgcolor: "background.default", overflowX: "hidden" }}>
      <CssBaseline />
      
      <AppBar 
        position="fixed" 
        elevation={0}
        sx={{ 
          top: 0,
          left: 0,
          right: 0,
          width: "100%",
          zIndex: (theme) => theme.zIndex.drawer + 20,
          borderBottom: "1px solid", 
          borderColor: "divider",
          backgroundColor: mode === "dark" ? "#131314" : "#F0F4F9",
          backgroundImage: "none",
          pt: "env(safe-area-inset-top, 0px)",
          transform: "none",
          WebkitTransform: "none",
          boxSizing: "border-box",
        }}
      >
        <Toolbar sx={{ px: { xs: 2, md: 3 }, display: "flex", alignItems: "center", justifyContent: "space-between", minHeight: 64, height: 64 }}>
          {isMobile ? (
            /* ─── MOBILE HEADER (< 900px): Drawer button left, Logo center, Avatar right ─── */
            <>
              <IconButton
                color="inherit"
                onClick={handleDrawerToggle}
                edge="start"
                aria-label="open navigation drawer"
                sx={{ borderRadius: 2, minWidth: 44, minHeight: 44 }}
              >
                <MenuIcon />
              </IconButton>

              <Box sx={{ flexGrow: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  onClick={() => navigate("/")}
                  sx={{ cursor: "pointer", userSelect: "none" }}
                >
                  <Box component="img" src="/logo.svg" alt="OpenNotes Logo" sx={{ height: 32, width: 32, borderRadius: 1.5 }} />
                  <Typography
                    fontWeight={800}
                    letterSpacing="-0.5px"
                    color="text.primary"
                    sx={{ fontSize: "1.1rem", whiteSpace: "nowrap" }}
                  >
                    OpenNotes
                  </Typography>
                </Stack>
              </Box>

              <IconButton onClick={handleProfileMenuOpen} sx={{ p: 0.5 }} aria-label="user profile menu">
                <Avatar 
                  alt={currentUser?.displayName || "User"} 
                  src={currentUser?.photoURL || ""} 
                  sx={{ width: 36, height: 36, bgcolor: theme.palette.primary.main, color: '#fff', fontWeight: 700 }}
                >
                  {currentUser?.displayName?.charAt(0) || "U"}
                </Avatar>
              </IconButton>
            </>
          ) : (
            /* ─── DESKTOP HEADER (>= 900px): Preserved Exactly As-Is ─── */
            <>
              <Stack direction="row" spacing={1} alignItems="center">
                <IconButton
                  color="inherit"
                  onClick={handleDrawerToggle}
                  edge="start"
                  sx={{ mr: 0, borderRadius: 2, minWidth: 44, minHeight: 44 }}
                >
                  <MenuIcon />
                </IconButton>
                <Box 
                  component="img" 
                  src={mode === "dark" ? "/header-logo-dark.svg" : "/header-logo.svg"} 
                  alt="OpenNotes" 
                  onClick={() => navigate("/")}
                  sx={{ 
                    height: 42,
                    width: "auto", 
                    cursor: "pointer",
                    display: "block",
                    objectFit: "contain"
                  }} 
                />
              </Stack>

              <Box sx={{ 
                  flexGrow: 1, 
                  display: "flex", 
                  justifyContent: "center",
                  maxWidth: 580,
                  ml: { sm: 3, md: 5 },
                  mr: 2
              }}>
                <Box sx={{ 
                    display: "flex", 
                    alignItems: "center", 
                    width: "100%",
                    bgcolor: theme.palette.mode === 'light' ? '#EAF1FB' : 'rgba(255,255,255,0.06)',
                    borderRadius: 6,
                    px: 2,
                    height: 44,
                    transition: 'all 0.2s',
                    "&:focus-within": {
                        bgcolor: theme.palette.mode === 'light' ? '#FFFFFF' : '#1E1E1E',
                        boxShadow: '0px 2px 8px rgba(0,0,0,0.1)'
                    }
                }}>
                  <SearchIcon sx={{ color: "text.secondary", mr: 1.5 }} />
                  <InputBase
                    placeholder="Search in notes (press Enter to search HTML)..."
                    fullWidth
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleSearchSubmit}
                    sx={{ fontSize: "0.95rem", color: "text.primary" }}
                  />
                  {searchQuery && (
                      <IconButton size="small" onClick={() => setSearchQuery("")}>
                          <ClearIcon fontSize="small" />
                      </IconButton>
                  )}
                </Box>
              </Box>

              <Stack direction="row" spacing={0.5} alignItems="center">
                <Tooltip title="AI Prompt Builder">
                  <IconButton
                    color="primary"
                    onClick={() => setPromptModalOpen(true)}
                    sx={{ minWidth: 44, minHeight: 44 }}
                  >
                    <SparklesIcon />
                  </IconButton>
                </Tooltip>

                <Tooltip title="Notifications">
                  <IconButton
                    color="inherit"
                    onClick={() => navigate("/notifications")}
                    sx={{ minWidth: 44, minHeight: 44 }}
                  >
                    <Badge badgeContent={2} color="error">
                      <NotificationsIcon />
                    </Badge>
                  </IconButton>
                </Tooltip>

                <Tooltip title="Toggle Light / Dark Mode">
                  <IconButton onClick={toggleColorMode} color="inherit">
                    {mode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
                  </IconButton>
                </Tooltip>
                
                <Tooltip title="Account Settings">
                  <IconButton onClick={handleProfileMenuOpen} sx={{ p: 0.5 }}>
                    <Avatar 
                      alt={currentUser?.displayName || "User"} 
                      src={currentUser?.photoURL || ""} 
                      sx={{ width: 34, height: 34, bgcolor: theme.palette.primary.main, color: '#fff', fontWeight: 700 }}
                    >
                      {currentUser?.displayName?.charAt(0) || "U"}
                    </Avatar>
                  </IconButton>
                </Tooltip>
              </Stack>
            </>
          )}

          {/* ─── GOOGLE ACCOUNT STYLE PROFILE MENU (Mobile & Desktop) ─── */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleProfileMenuClose}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            transitionDuration={180}
            PaperProps={{
              sx: { 
                mt: 1.5, 
                width: 320, 
                borderRadius: 4, 
                boxShadow: "0px 12px 36px rgba(0,0,0,0.18)", 
                p: 1.5,
                bgcolor: mode === "dark" ? "#1E1F22" : "#FFFFFF",
                border: "1px solid",
                borderColor: "divider",
              }
            }}
          >
            <Box sx={{ textAlign: "center", p: 2, bgcolor: mode === "dark" ? "rgba(255,255,255,0.03)" : "#F8FAFD", borderRadius: 3, mb: 1 }}>
                <Avatar sx={{ width: 64, height: 64, mx: "auto", mb: 1.5, bgcolor: "primary.main", fontSize: "1.75rem", fontWeight: 700 }}>
                  {currentUser?.displayName?.charAt(0) || "U"}
                </Avatar>
                <Typography variant="subtitle1" fontWeight={700}>{currentUser?.displayName || "User"}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ wordBreak: "break-all", fontSize: "0.85rem" }}>{currentUser?.email}</Typography>
            </Box>

            <List disablePadding>
              <ListItem disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton 
                  onClick={() => { navigate("/notifications"); handleProfileMenuClose(); }}
                  sx={{ borderRadius: 2.5, py: 1 }}
                >
                  <ListItemIcon sx={{ minWidth: 38 }}><NotificationsIcon fontSize="small" color="primary" /></ListItemIcon>
                  <ListItemText primary="Notifications" primaryTypographyProps={{ fontWeight: 600, fontSize: "0.9rem" }} />
                  <Badge badgeContent={2} color="error" sx={{ mr: 1 }} />
                </ListItemButton>
              </ListItem>

              <ListItem disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton 
                  onClick={toggleColorMode}
                  sx={{ borderRadius: 2.5, py: 1 }}
                >
                  <ListItemIcon sx={{ minWidth: 38 }}>
                    {mode === "dark" ? <LightModeIcon fontSize="small" sx={{ color: "#F59E0B" }} /> : <DarkModeIcon fontSize="small" color="action" />}
                  </ListItemIcon>
                  <ListItemText 
                    primary="Appearance" 
                    secondary={mode === "dark" ? "Dark Mode" : "Light Mode"}
                    primaryTypographyProps={{ fontWeight: 600, fontSize: "0.9rem" }}
                    secondaryTypographyProps={{ fontSize: "0.75rem" }}
                  />
                </ListItemButton>
              </ListItem>
            </List>

            <Divider sx={{ my: 1 }} />

            <List disablePadding>
              <ListItem disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton 
                  onClick={() => { navigate("/profile"); handleProfileMenuClose(); }}
                  sx={{ borderRadius: 2.5, py: 1 }}
                >
                  <ListItemIcon sx={{ minWidth: 38 }}><PersonIcon fontSize="small" /></ListItemIcon>
                  <ListItemText primary="Profile" primaryTypographyProps={{ fontWeight: 500, fontSize: "0.9rem" }} />
                </ListItemButton>
              </ListItem>

              <ListItem disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton 
                  onClick={() => { navigate("/settings"); handleProfileMenuClose(); }}
                  sx={{ borderRadius: 2.5, py: 1 }}
                >
                  <ListItemIcon sx={{ minWidth: 38 }}><SettingsIcon fontSize="small" /></ListItemIcon>
                  <ListItemText primary="Settings" primaryTypographyProps={{ fontWeight: 500, fontSize: "0.9rem" }} />
                </ListItemButton>
              </ListItem>

              <ListItem disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton 
                  onClick={() => { setHelpDialogOpen(true); handleProfileMenuClose(); }}
                  sx={{ borderRadius: 2.5, py: 1 }}
                >
                  <ListItemIcon sx={{ minWidth: 38 }}><HelpIcon fontSize="small" /></ListItemIcon>
                  <ListItemText primary="Help & Feedback" primaryTypographyProps={{ fontWeight: 500, fontSize: "0.9rem" }} />
                </ListItemButton>
              </ListItem>
            </List>

            <Divider sx={{ my: 1 }} />

            <MenuItem 
              onClick={handleLogout} 
              sx={{ py: 1.2, borderRadius: 2.5, color: "error.main", "&:hover": { bgcolor: alpha(theme.palette.error.main, 0.08) } }}
            >
              <ListItemIcon><LogoutIcon fontSize="small" color="error" /></ListItemIcon>
              <Typography fontWeight={700} fontSize="0.9rem">Sign Out</Typography>
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Navigation Drawer */}
      <Box component="nav" sx={{ width: { sm: drawerOpen ? drawerWidth : 0 }, flexShrink: { sm: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          sx={{ display: { xs: "block", sm: "none" }, "& .MuiDrawer-paper": { width: drawerWidth } }}
        >
          <Toolbar />
          {drawerContent}
        </Drawer>
        <Drawer
          variant="persistent"
          open={drawerOpen}
          sx={{ display: { xs: "none", sm: "block" }, "& .MuiDrawer-paper": { width: drawerWidth } }}
        >
          <Toolbar />
          {drawerContent}
        </Drawer>
      </Box>

      {/* Main App Content Container */}
      <Box
        component="main"
        sx={{ 
          flexGrow: 1, 
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          pt: { xs: "calc(56px + env(safe-area-inset-top, 0px) + 8px)", sm: "calc(64px + env(safe-area-inset-top, 0px) + 12px)" },
          pb: { xs: "calc(112px + env(safe-area-inset-bottom, 0px))", md: 4 },
          px: { xs: 1.5, sm: 3, md: 4 },
          width: "100%",
          maxWidth: "100vw",
          overflowX: "hidden",
          boxSizing: "border-box"
        }}
      >
        <Container maxWidth="xl" disableGutters sx={{ maxWidth: 1440, mx: "auto", width: "100%", px: { xs: 0, sm: 0 } }}>
          {/* Breadcrumb Navigation (Hidden on Home Page & Mobile View) */}
        {!isMobile && location.pathname !== "/" && (
          <Box sx={{ mb: 2 }}>
            <Breadcrumbs aria-label="breadcrumb">
              <MuiLink color="inherit" href="#" onClick={(e) => { e.preventDefault(); navigate("/"); }} sx={{ textDecoration: "none", fontWeight: 500 }}>
                Home
              </MuiLink>
              {pathnames.map((value, index) => {
                const last = index === pathnames.length - 1;
                const to = `/${pathnames.slice(0, index + 1).join("/")}`;

                return last ? (
                  <Typography color="text.primary" key={to} sx={{ fontWeight: 700, textTransform: "capitalize" }}>
                    {value}
                  </Typography>
                ) : (
                  <MuiLink color="inherit" href="#" onClick={(e) => { e.preventDefault(); navigate(to); }} key={to} sx={{ textDecoration: "none", textTransform: "capitalize" }}>
                    {value}
                  </MuiLink>
                );
              })}
            </Breadcrumbs>
          </Box>
        )}

        <Outlet />
        </Container>
      </Box>

      {/* ─── iOS 18 / HIG INSPIRED FLOATING GLASS BOTTOM NAVIGATION CAPSULE (MOBILE ONLY) ─── */}
      {isMobile && (
        <Paper
          elevation={0}
          sx={{
            position: "fixed",
            bottom: "calc(16px + env(safe-area-inset-bottom, 0px))",
            left: "50%",
            transform: "translateX(-50%)",
            width: "calc(100% - 32px)",
            maxWidth: 420,
            zIndex: 1300,
            borderRadius: "28px",
            p: "6px 8px",
            bgcolor: mode === "dark" ? "rgba(26, 27, 30, 0.85)" : "rgba(255, 255, 255, 0.85)",
            backdropFilter: "blur(24px) saturate(180%)",
            WebkitBackdropFilter: "blur(24px) saturate(180%)",
            border: "1px solid",
            borderColor: mode === "dark" ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.08)",
            boxShadow: mode === "dark" 
              ? "0 12px 36px rgba(0,0,0,0.5), 0 2px 10px rgba(0,0,0,0.3)" 
              : "0 12px 36px rgba(0,0,0,0.08), 0 2px 10px rgba(0,0,0,0.04)",
            transition: "all 0.2s cubic-bezier(0.2, 0, 0, 1)",
          }}
        >
          <Stack direction="row" alignItems="center" justifyContent="space-around" sx={{ width: "100%" }}>
            {[
              { label: "Home", icon: <DashboardIcon sx={{ fontSize: 22 }} />, path: "/" },
              { label: "Notes", icon: <NotesIcon sx={{ fontSize: 22 }} />, path: "/notes" },
              { label: "Discover", icon: <ExploreIcon sx={{ fontSize: 22 }} />, path: "/discover" },
              { label: "Bookmarks", icon: <BookmarkIcon sx={{ fontSize: 22 }} />, path: "/bookmarks" },
              { label: "Search", icon: <SearchIcon sx={{ fontSize: 22 }} />, path: "/search" },
            ].map((tab) => {
              const isSelected = location.pathname === tab.path;
              return (
                <Box
                  key={tab.label}
                  onClick={() => navigate(tab.path)}
                  sx={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    py: 0.75,
                    px: 0.5,
                    minHeight: 48,
                    borderRadius: "20px",
                    cursor: "pointer",
                    userSelect: "none",
                    bgcolor: isSelected 
                      ? (mode === "dark" ? alpha(theme.palette.primary.main, 0.22) : alpha(theme.palette.primary.main, 0.12))
                      : "transparent",
                    color: isSelected ? "primary.main" : "text.secondary",
                    transition: "all 180ms cubic-bezier(0.2, 0, 0, 1)",
                    "&:active": { transform: "scale(0.94)" },
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "transform 180ms ease-out",
                      transform: isSelected ? "scale(1.08)" : "scale(1)",
                    }}
                  >
                    {tab.icon}
                  </Box>
                  <Typography
                    variant="caption"
                    sx={{
                      fontSize: "0.68rem",
                      fontWeight: isSelected ? 700 : 500,
                      letterSpacing: "-0.01em",
                      mt: 0.25,
                      opacity: isSelected ? 1 : 0.75,
                      transition: "opacity 180ms ease-out",
                    }}
                  >
                    {tab.label}
                  </Typography>
                </Box>
              );
            })}
          </Stack>
        </Paper>
      )}

      {/* Global AI Prompt Builder Modal */}
      <PromptBuilderModal
        open={promptModalOpen}
        onClose={() => setPromptModalOpen(false)}
      />

      {/* Help & Feedback Dialog */}
      <Dialog 
        open={helpDialogOpen} 
        onClose={() => setHelpDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 4, p: 1 } }}
      >
        <DialogTitle fontWeight={700}>Help & Feedback</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" paragraph>
            Need assistance or have feedback about OpenNotes? We are here to help!
          </Typography>
          <Stack spacing={1.5} sx={{ mt: 1 }}>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
              <Typography variant="subtitle2" fontWeight={700}>Documentation & Guides</Typography>
              <Typography variant="caption" color="text.secondary">Learn how to make the most of rich text HTML note taking.</Typography>
            </Paper>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
              <Typography variant="subtitle2" fontWeight={700}>Contact Support</Typography>
              <Typography variant="caption" color="text.secondary">Send us an email at support@opennotes.app</Typography>
            </Paper>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setHelpDialogOpen(false)} variant="contained" fullWidth sx={{ borderRadius: 3 }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* First-Time User Onboarding Wizard */}
      <OnboardingWizardModal />
    </Box>
  );
};

export default AppLayout;
