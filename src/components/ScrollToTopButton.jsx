import React, { useState, useEffect } from "react";
import { Fab, Zoom, Tooltip, useTheme } from "@mui/material";
import { KeyboardArrowUp as KeyboardArrowUpIcon } from "@mui/icons-material";

export const ScrollToTopButton = () => {
  const theme = useTheme();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 200) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Initial check

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  return (
    <Zoom in={visible}>
      <Tooltip title="Go to top" placement="left">
        <Fab
          color="primary"
          size="medium"
          aria-label="scroll back to top"
          onClick={scrollToTop}
          sx={{
            position: "fixed",
            bottom: { xs: 88, sm: 32 },
            right: { xs: 20, sm: 32 },
            zIndex: 1350,
            fontWeight: 700,
            boxShadow: theme.palette.mode === "dark" 
              ? "0 8px 28px rgba(0,0,0,0.6)" 
              : "0 8px 28px rgba(11,87,208,0.35)",
            transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
            "&:hover": {
              transform: "translateY(-4px) scale(1.08)",
              boxShadow: theme.palette.mode === "dark"
                ? "0 12px 36px rgba(0,0,0,0.8)"
                : "0 12px 36px rgba(11,87,208,0.45)"
            },
            "&:active": {
              transform: "translateY(0) scale(0.95)"
            }
          }}
        >
          <KeyboardArrowUpIcon fontSize="medium" />
        </Fab>
      </Tooltip>
    </Zoom>
  );
};

export default ScrollToTopButton;
