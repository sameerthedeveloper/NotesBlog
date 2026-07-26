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
  Paper
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
  MonetizationOnOutlined as MonetizationIcon
} from "@mui/icons-material";
import PromptBuilderModal from "../components/PromptBuilderModal";
import { useAuth } from "../context/AuthContext";
import { useAppTheme } from "../context/ThemeContext";

import { isSuperAdmin } from "../config/adminConfig";

const drawerWidth = 260;

const AppLayout = () => {
  const { currentUser, logout } = useAuth();
  const { mode, toggleColorMode } = useAppTheme();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [promptModalOpen, setPromptModalOpen] = useState(false);
  
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
      {/* Google Style Extended FAB */}
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
                backgroundColor: theme.palette.mode === 'light' ? theme.palette.primary.main : theme.palette.primary.main,
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
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
      <CssBaseline />
      
      <AppBar position="fixed" sx={{ zIndex: theme.zIndex.drawer + 1, borderBottom: "1px solid", borderColor: "divider" }}>
        <Toolbar sx={{ px: [1, 3], display: "flex", gap: 2 }}>
          {isMobile && mobileSearchOpen ? (
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 1 }}>
              <IconButton edge="start" color="inherit" onClick={() => setMobileSearchOpen(false)}>
                <ArrowBackIcon />
              </IconButton>
              <InputBase
                 placeholder="Search notes HTML content..."
                 fullWidth
                 autoFocus
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 onKeyDown={handleSearchSubmit}
                 sx={{ fontSize: "1rem", color: "text.primary" }}
              />
              {searchQuery && (
                 <IconButton size="small" onClick={() => setSearchQuery("")}>
                     <ClearIcon fontSize="small" />
                 </IconButton>
              )}
            </Box>
          ) : (
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
                {isMobile ? (
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    onClick={() => navigate("/")}
                    sx={{ cursor: "pointer", flexShrink: 0 }}
                  >
                    <Box component="img" src="/logo.svg" alt="OpenNotes" sx={{ height: 30, width: 30, borderRadius: 1.5, flexShrink: 0 }} />
                    <Typography
                      fontWeight={800}
                      letterSpacing="-0.5px"
                      color="text.primary"
                      sx={{ fontSize: "1rem", whiteSpace: "nowrap", overflow: "visible" }}
                    >
                      OpenNotes
                    </Typography>
                  </Stack>
                ) : (
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
                )}
              </Stack>
              
              {!isMobile && (
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
              )}

              <Box sx={{ flexGrow: 1 }} />

              <Stack direction="row" spacing={0.5} alignItems="center">
                {isMobile && (
                  <IconButton
                    color="inherit"
                    size="medium"
                    onClick={() => setMobileSearchOpen(true)}
                    sx={{ minWidth: 44, minHeight: 44 }}
                  >
                    <SearchIcon />
                  </IconButton>
                )}
                
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

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleProfileMenuClose}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            PaperProps={{
              sx: { mt: 1.5, minWidth: 260, borderRadius: 3, boxShadow: "0px 8px 24px rgba(0,0,0,0.12)", p: 1 }
            }}
          >
            <Box sx={{ textAlign: "center", p: 2 }}>
                <Avatar sx={{ width: 56, height: 56, mx: "auto", mb: 1, bgcolor: "primary.main" }}>
                  {currentUser?.displayName?.charAt(0) || "U"}
                </Avatar>
                <Typography variant="subtitle1" fontWeight={700}>{currentUser?.displayName || "User"}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ wordBreak: "break-all" }}>{currentUser?.email}</Typography>
                <Button 
                  variant="outlined" 
                  size="small" 
                  fullWidth 
                  sx={{ mt: 2, borderRadius: 2 }} 
                  onClick={() => { navigate("/profile"); handleProfileMenuClose(); }}
                >
                  View Profile
                </Button>
            </Box>
            <Divider />
            <MenuItem onClick={() => { navigate("/settings"); handleProfileMenuClose(); }} sx={{ py: 1.2, borderRadius: 2 }}>
              <ListItemIcon><SettingsIcon fontSize="small" /></ListItemIcon>
              <Typography fontWeight={500}>Settings</Typography>
            </MenuItem>
            <MenuItem onClick={handleLogout} sx={{ py: 1.2, borderRadius: 2, color: "error.main" }}>
              <ListItemIcon><LogoutIcon fontSize="small" color="error" /></ListItemIcon>
              <Typography fontWeight={600}>Sign Out</Typography>
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
          pt: { xs: 8, sm: 9 },
          pb: 4,
          px: { xs: 1.5, sm: 3, md: 4 },
          width: "100%",
          overflowX: "hidden"
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

      {/* Mobile Bottom Navigation Bar */}
      {isMobile && (
        <Paper
          sx={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 1200,
            borderTop: "1px solid",
            borderColor: "divider",
            borderRadius: 0,
          }}
          elevation={4}
        >
          <BottomNavigation
            showLabels
            value={
              location.pathname === "/" ? 0 :
              location.pathname === "/discover" ? 1 :
              location.pathname === "/note/new" ? 2 :
              location.pathname === "/bookmarks" ? 3 :
              location.pathname === "/profile" ? 4 : 0
            }
            onChange={(event, newValue) => {
              if (newValue === 0) navigate("/");
              else if (newValue === 1) navigate("/discover");
              else if (newValue === 2) navigate("/note/new");
              else if (newValue === 3) navigate("/bookmarks");
              else if (newValue === 4) navigate("/profile");
            }}
            sx={{
              height: 64,
              bgcolor: "background.paper",
              paddingBottom: "env(safe-area-inset-bottom)",
              "& .MuiBottomNavigationAction-root": {
                minWidth: 0,
                flex: 1,
                px: 0.5,
                py: 0.75,
                gap: 0.25,
              },
              "& .MuiBottomNavigationAction-label": {
                fontSize: "0.65rem",
                fontWeight: 600,
                opacity: 0.7,
                "&.Mui-selected": { fontSize: "0.65rem", opacity: 1 },
              },
            }}
          >
            <BottomNavigationAction label="Home" icon={<DashboardIcon sx={{ fontSize: 22 }} />} />
            <BottomNavigationAction label="Discover" icon={<ExploreIcon sx={{ fontSize: 22 }} />} />
            <BottomNavigationAction
              label="Create"
              icon={
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    bgcolor: "primary.main",
                    color: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.4)}`,
                    mt: -1.5,
                    transition: "transform 0.15s ease",
                    "&:active": { transform: "scale(0.93)" }
                  }}
                >
                  <AddIcon sx={{ fontSize: 22 }} />
                </Box>
              }
            />
            <BottomNavigationAction label="Bookmarks" icon={<BookmarkIcon sx={{ fontSize: 22 }} />} />
            <BottomNavigationAction label="Profile" icon={<PersonIcon sx={{ fontSize: 22 }} />} />
          </BottomNavigation>
        </Paper>
      )}

      {/* Global AI Prompt Builder Modal */}
      <PromptBuilderModal
        open={promptModalOpen}
        onClose={() => setPromptModalOpen(false)}
      />
    </Box>
  );
};

export default AppLayout;
