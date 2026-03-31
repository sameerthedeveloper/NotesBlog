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
  alpha,
  Container,
  Fab,
  InputBase,
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
  HelpOutline as HelpIcon,
  SettingsOutlined as SettingsIcon,
  AppsOutlined as AppsIcon,
  Clear as ClearIcon,
  ArrowBack as ArrowBackIcon,
  Close as CloseIcon
} from "@mui/icons-material";
import { useAuth } from "../context/AuthContext";
import { useAppTheme } from "../context/ThemeContext";
import AdBlock from "../components/AdBlock";

const drawerWidth = 256;

const AppLayout = () => {
  const { currentUser, logout } = useAuth();
  const { mode, toggleColorMode } = useAppTheme();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const [showAnchorAd, setShowAnchorAd] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  
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
    { text: "Notes", icon: <NotesIcon />, path: "/" },
    { text: "Favorites", icon: <FavoriteIcon />, path: "/?filter=favorite" },
    { text: "Pinned", icon: <PinnedIcon />, path: "/?filter=pinned" },
  ];

  const drawerContent = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column", pt: 1 }}>
      {/* Google Style Extended FAB (Compose) - Standardized radius */}
      <Box sx={{ px: 2, mb: 3, mt: 1 }}>
         <Button
            variant="contained"
            startIcon={<AddIcon sx={{ fontSize: 28, mr: 0.5 }} />}
            onClick={() => navigate("/note/new")}
            sx={{ 
                minWidth: 140,
                py: 2.2, 
                px: 3,
                borderRadius: 2, // 8px Radius
                fontWeight: 600, 
                fontSize: '0.875rem',
                backgroundColor: theme.palette.mode === 'light' ? '#FFFFFF' : '#333333',
                color: theme.palette.mode === 'light' ? theme.palette.primary.main : '#FFFFFF',
                boxShadow: '0px 1px 3px rgba(0,0,0,0.12), 0px 1px 2px rgba(0,0,0,0.24)',
                "&:hover": {
                    backgroundColor: theme.palette.mode === 'light' ? '#f8f9fa' : '#444444',
                    boxShadow: '0px 4px 8px rgba(0,0,0,0.18)'
                }
            }}
         >
            New Note
         </Button>
      </Box>

      <Box sx={{ overflow: "auto", flexGrow: 1 }}>
        <List sx={{ px: 0 }}>
          {menuItems.map((item) => {
            const isSelected = location.pathname === item.path || (item.path.includes('?') && location.search === item.path.split('?')[1]);
            return (
              <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton 
                  selected={isSelected}
                  onClick={() => {
                    navigate(item.path);
                    if (isMobile) setMobileOpen(false);
                  }}
                  sx={{
                      "&.Mui-selected": {
                          backgroundColor: theme.palette.primary.container,
                          color: theme.palette.primary.onContainer,
                          "& .MuiListItemIcon-root": { color: theme.palette.primary.onContainer },
                          "& .MuiTypography-root": { fontWeight: 800 }
                      }
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 48, ml: 1 }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.text} primaryTypographyProps={{ fontWeight: 600, fontSize: '0.875rem' }} />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
      <CssBaseline />
      
      <AppBar position="fixed" sx={{ zIndex: theme.zIndex.drawer + 1 }}>
        <Toolbar sx={{ px: [1, 3], display: "flex", gap: 2 }}>
          {isMobile && mobileSearchOpen ? (
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 1, py: 0.5 }}>
              <IconButton edge="start" color="inherit" onClick={() => { setMobileSearchOpen(false); setSearchQuery(""); window.dispatchEvent(new CustomEvent('global-search', { detail: "" })); }} sx={{ borderRadius: 2 }}>
                <ArrowBackIcon />
              </IconButton>
              <InputBase
                 placeholder="Search your notes..."
                 fullWidth
                 autoFocus
                 value={searchQuery}
                 onChange={(e) => {
                     setSearchQuery(e.target.value);
                     window.dispatchEvent(new CustomEvent('global-search', { detail: e.target.value }));
                 }}
                 sx={{ fontSize: "1rem", color: "text.primary", fontWeight: 500 }}
              />
              {searchQuery && (
                 <IconButton size="small" onClick={() => {
                     setSearchQuery("");
                     window.dispatchEvent(new CustomEvent('global-search', { detail: "" }));
                 }} sx={{ borderRadius: 2 }}>
                     <ClearIcon fontSize="small" />
                 </IconButton>
              )}
            </Box>
          ) : (
            <>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: isMobile ? 'auto' : drawerWidth - 50 }}>
                <IconButton color="inherit" onClick={handleDrawerToggle} edge="start" sx={{ borderRadius: 2 }}>
                  <MenuIcon />
                </IconButton>
                <Typography variant="h6" noWrap sx={{ fontWeight: 700, letterSpacing: "-0.5px", color: "text.primary", ml: 1, display: { xs: 'none', sm: 'block' } }}>
                  NotesBlog
                </Typography>
              </Stack>
              
              {!isMobile && (
                  <Box sx={{ 
                      flexGrow: 1, 
                      display: "flex", 
                      justifyContent: "center",
                      maxWidth: 720,
                      mx: "auto"
                  }}>
                    <Box sx={{ 
                        display: "flex", 
                        alignItems: "center", 
                        width: "100%",
                        bgcolor: theme.palette.mode === 'light' ? '#EAF1FB' : '#2B2930',
                        borderRadius: 6, // Restored pill
                        px: 2,
                        height: 48,
                        transition: 'all 0.2s',
                        "&:focus-within": {
                            bgcolor: theme.palette.mode === 'light' ? '#FFFFFF' : '#1D1B20',
                            boxShadow: '0px 1px 1px rgba(0,0,0,0.1), 0px 1px 3px rgba(0,0,0,0.2)'
                        }
                    }}>
                      <SearchIcon sx={{ color: "text.secondary", mr: 1.5 }} />
                      <InputBase
                        placeholder="Search in your notes"
                        fullWidth
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            window.dispatchEvent(new CustomEvent('global-search', { detail: e.target.value }));
                        }}
                        sx={{ fontSize: "1rem", color: "text.primary", fontWeight: 500 }}
                      />
                      {searchQuery && (
                          <IconButton size="small" onClick={() => {
                              setSearchQuery("");
                              window.dispatchEvent(new CustomEvent('global-search', { detail: "" }));
                          }} sx={{ borderRadius: 2 }}>
                              <ClearIcon fontSize="small" />
                          </IconButton>
                      )}
                    </Box>
                  </Box>
              )}

              {isMobile && <Box sx={{ flexGrow: 1 }} />}

              <Stack direction="row" spacing={0.5} alignItems="center">
                {isMobile && (
                   <IconButton color="inherit" size="small" onClick={() => setMobileSearchOpen(true)} sx={{ borderRadius: 2 }}>
                     <SearchIcon />
                   </IconButton>
                )}
                <IconButton onClick={toggleColorMode} color="inherit" size="small" sx={{ borderRadius: 2 }}>
                  {mode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
                </IconButton>
                <IconButton color="inherit" size="small" sx={{ borderRadius: 2, display: { xs: 'none', sm: 'inline-flex' } }}><HelpIcon /></IconButton>
                <IconButton color="inherit" size="small" onClick={() => navigate("/profile")} sx={{ borderRadius: 2, display: { xs: 'none', sm: 'inline-flex' } }}><SettingsIcon /></IconButton>
                <IconButton color="inherit" size="small" sx={{ ml: 1, mr: 1, borderRadius: 2, display: { xs: 'none', sm: 'inline-flex' } }}><AppsIcon /></IconButton>
                
                <Tooltip title="Account">
                  <IconButton onClick={handleProfileMenuOpen} sx={{ p: 0.5, ml: { xs: 0.5, sm: 0 } }}>
                    <Avatar 
                      alt={currentUser?.displayName || "User"} 
                      src={currentUser?.photoURL || ""} 
                      sx={{ width: 32, height: 32, bgcolor: theme.palette.primary.main, color: '#fff', fontSize: '0.9rem', fontWeight: 700 }}
                    />
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
              sx: { mt: 1.5, minWidth: 280, borderRadius: 4, boxShadow: "0px 12px 32px rgba(0,0,0,0.12)", p: 1 }
            }}
          >
            <Box sx={{ textAlign: "center", p: 3 }}>
                <Avatar sx={{ width: 64, height: 64, mx: "auto", mb: 1.5, bgcolor: "primary.main" }}>{currentUser?.displayName?.charAt(0)}</Avatar>
                <Typography variant="subtitle1" fontWeight={700}>{currentUser?.displayName}</Typography>
                <Typography variant="body2" color="text.secondary">{currentUser?.email}</Typography>
                <Button variant="outlined" sx={{ mt: 2, px: 3 }} onClick={() => { navigate("/profile"); handleProfileMenuClose(); }}>Manage Account</Button>
            </Box>
            <Divider />
            <MenuItem onClick={handleLogout} sx={{ py: 1.5, borderRadius: 2, mt: 1, color: "error.main" }}>
              <ListItemIcon><LogoutIcon fontSize="small" color="error" /></ListItemIcon>
              <Typography fontWeight={600}>Sign Out</Typography>
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { sm: drawerOpen ? drawerWidth : 0 }, flexShrink: { sm: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          sx={{ display: { xs: "block", sm: "none" }, "& .MuiDrawer-paper": { borderRadius: '0 16px 16px 0' } }}
        >
          {drawerContent}
        </Drawer>
        <Drawer
          variant="persistent"
          open={drawerOpen}
          sx={{ display: { xs: "none", sm: "block" } }}
        >
          <Toolbar />
          {drawerContent}
        </Drawer>
      </Box>

      {/* Standardized Inner Rounded Content Container radius (24px) */}
      <Box
        component="main"
        sx={{ 
          flexGrow: 1, 
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          pt: { xs: 8.5, sm: 10.5 }, // Flusher to top on mobile, floating gap on desktop
          pb: { xs: 0, sm: 1.5 },
          pr: { xs: 0, sm: 1.5 },
          pl: { xs: 0, sm: drawerOpen ? 0 : 1.5 },
          transition: theme.transitions.create("padding", {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Box sx={{ 
            flexGrow: 1, 
            bgcolor: "background.paper", 
            borderRadius: isMobile ? 0 : 4, // 16px soft radius
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            boxShadow: theme.palette.mode === 'light' ? '0px 8px 32px rgba(0,0,0,0.06)' : '0px 8px 32px rgba(0,0,0,0.4)',
            border: theme.palette.mode === 'light' ? 'none' : `1px solid ${theme.palette.divider}`,
        }}>
          <Container maxWidth={false} sx={{ flexGrow: 1, py: { xs: 1, sm: 4 }, px: { xs: 1.5, sm: 4, lg: 6 }, overflowY: "auto", height: "100%" }}>
            <Outlet />
          </Container>
        </Box>
      </Box>

      {isMobile && (
          <Fab 
            color="primary" 
            sx={{ position: "fixed", bottom: showAnchorAd ? 120 : 24, right: 24, borderRadius: 4, boxShadow: '0px 4px 20px rgba(0,0,0,0.15)', transition: 'bottom 0.3s' }}
            onClick={() => navigate("/note/new")}
          >
            <AddIcon />
          </Fab>
      )}

      {/* Modern AdMob-style Sticky Anchor Ad (Mobile Only) */}
      {isMobile && showAnchorAd && (
        <Box sx={{ 
            position: "fixed", 
            bottom: 0, 
            left: 0, 
            right: 0, 
            zIndex: 1000, 
            bgcolor: "background.paper", 
            borderTop: `1px solid ${theme.palette.divider}`,
            boxShadow: "0px -4px 12px rgba(0,0,0,0.05)",
            animation: 'slideUp 0.4s ease-out'
        }}>
           <Box sx={{ position: 'relative', pt: 1, pb: 0.5 }}>
             <IconButton 
                size="small" 
                onClick={() => setShowAnchorAd(false)}
                sx={{ 
                    position: 'absolute', 
                    top: -16, 
                    right: 8, 
                    bgcolor: 'background.paper', 
                    border: `1px solid ${theme.palette.divider}`,
                    boxShadow: '0px 2px 4px rgba(0,0,0,0.1)',
                    '&:hover': { bgcolor: 'action.hover' }
                }}
             >
                <CloseIcon fontSize="inherit" />
             </IconButton>
             <AdBlock format="horizontal" sx={{ minHeight: 60, borderRadius: 0, border: 'none' }} />
           </Box>
        </Box>
      )}
    </Box>
  );
};

export default AppLayout;
