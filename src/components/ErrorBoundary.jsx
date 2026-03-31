import React from "react";
import { 
  Box, 
  Typography, 
  Button, 
  Container, 
  Paper, 
  Stack 
} from "@mui/material";
import { ErrorOutline as ErrorIcon, Home as HomeIcon } from "@mui/icons-material";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Container maxWidth="sm">
          <Box 
            sx={{ 
              display: "flex", 
              flexDirection: "column", 
              alignItems: "center", 
              justifyContent: "center", 
              minHeight: "100vh",
              textAlign: "center"
            }}
          >
           <Paper 
                elevation={0}
                sx={{ 
                  p: 6, 
                  borderRadius: 1, 
                  border: '1.5px solid',
                  borderColor: 'divider',
                  bgcolor: 'background.paper' 
                }}
            >
                <ErrorIcon sx={{ fontSize: 80, color: 'error.main', mb: 3 }} />
                <Typography variant="h4" fontWeight={800} gutterBottom>
                    Something went wrong
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                    An unexpected error occurred. Don't worry, your data is safe.
                </Typography>
                <Stack direction="row" spacing={2} justifyContent="center">
                    <Button 
                        variant="contained" 
                        size="large" 
                        onClick={() => window.location.reload()}
                        sx={{ borderRadius: 2 }}
                    >
                        Try Again
                    </Button>
                    <Button 
                        variant="outlined" 
                        size="large" 
                        href="/"
                        startIcon={<HomeIcon />}
                        sx={{ borderRadius: 2 }}
                    >
                        Go Home
                    </Button>
                </Stack>
            </Paper>
          </Box>
        </Container>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
