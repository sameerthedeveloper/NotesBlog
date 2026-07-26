import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stepper,
  Step,
  StepLabel,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  Alert,
  Stack,
  CircularProgress,
  Chip,
  useTheme,
  alpha,
} from "@mui/material";
import {
  CheckCircle as CheckCircleIcon,
  Verified as VerifiedIcon,
  ArrowForward as ArrowForwardIcon,
  ArrowBack as ArrowBackIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";
import { getAllProviders, getProviderById } from "../providers";
import { useMonetization } from "../../../context/MonetizationContext";
import toast from "react-hot-toast";

const STEPS = [
  "Select Provider",
  "Provider Requirements",
  "Publisher Details",
  "Validate Configuration",
  "Submit Verification",
  "Activation",
];

export const ProviderWizardModal = ({ open, onClose, initialProviderId = null }) => {
  const theme = useTheme();
  const { submitProviderConnection } = useMonetization();

  const [activeStep, setActiveStep] = useState(0);
  const [selectedProviderId, setSelectedProviderId] = useState(initialProviderId || "google_adsense");
  const [formData, setFormData] = useState({
    publisherId: "",
    publisherName: "",
    publisherEmail: "",
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const selectedProvider = getProviderById(selectedProviderId) || getAllProviders()[0];

  const handleNext = async () => {
    if (activeStep === 0 && !selectedProviderId) {
      toast.error("Please select a provider.");
      return;
    }

    if (activeStep === 2) {
      // Validate configuration before proceeding to step 4
      const res = selectedProvider.validateConfig(formData);
      setValidationErrors(res.errors);
      if (!res.valid) {
        toast.error("Please fix configuration errors before proceeding.");
        return;
      }
    }

    if (activeStep === 4) {
      // Submit to Firebase
      setSubmitting(true);
      try {
        await submitProviderConnection(selectedProviderId, formData);
        toast.success("Submitted for verification!");
        setActiveStep((prev) => prev + 1);
      } catch (err) {
        toast.error(err.message || "Submission failed");
      } finally {
        setSubmitting(false);
      }
      return;
    }

    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleClose = () => {
    setActiveStep(0);
    setValidationErrors({});
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          p: { xs: 1, sm: 2 },
          bgcolor: "background.paper",
        },
      }}
    >
      <DialogTitle>
        <Typography variant="h5" fontWeight={800} letterSpacing="-0.5px">
          Connect Ad Provider
        </Typography>
        <Typography variant="body2" color="text.secondary" fontWeight={500}>
          Follow the 6-step guided wizard to connect your publisher account safely.
        </Typography>
      </DialogTitle>

      <DialogContent dividers sx={{ border: "none", py: 3 }}>
        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
          {STEPS.map((label) => (
            <Step key={label}>
              <StepLabel
                StepIconProps={{
                  sx: {
                    "&.Mui-active": { color: "primary.main" },
                    "&.Mui-completed": { color: "success.main" },
                  },
                }}
              >
                <Typography variant="caption" fontWeight={600}>
                  {label}
                </Typography>
              </StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Step 1: Select Provider */}
        {activeStep === 0 && (
          <Box>
            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
              Choose your advertising provider
            </Typography>
            <Grid container spacing={2}>
              {getAllProviders().map((p) => {
                const isSelected = selectedProviderId === p.id;
                return (
                  <Grid item xs={12} sm={6} key={p.id}>
                    <Card
                      variant="outlined"
                      onClick={() => setSelectedProviderId(p.id)}
                      sx={{
                        cursor: "pointer",
                        borderRadius: 3,
                        borderColor: isSelected ? "primary.main" : "divider",
                        borderWidth: isSelected ? 2 : 1,
                        bgcolor: isSelected ? alpha(theme.palette.primary.main, 0.05) : "background.paper",
                        transition: "all 0.15s ease",
                        "&:hover": { borderColor: "primary.main" },
                      }}
                    >
                      <CardContent sx={{ p: 2.5 }}>
                        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
                          <Box
                            component="img"
                            src={p.logo}
                            alt={p.name}
                            onError={(e) => { e.target.src = "/logo.svg"; }}
                            sx={{ width: 36, height: 36, objectFit: "contain", borderRadius: 1 }}
                          />
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle2" fontWeight={800}>
                              {p.name}
                            </Typography>
                            <Chip label={p.category} size="small" sx={{ fontSize: "0.68rem", height: 20 }} />
                          </Box>
                          {isSelected && <CheckCircleIcon color="primary" />}
                        </Stack>
                        <Typography variant="caption" color="text.secondary" lineHeight={1.4} display="block">
                          {p.description}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        )}

        {/* Step 2: Read Requirements */}
        {activeStep === 1 && (
          <Stack spacing={2.5}>
            <Alert severity="info" sx={{ borderRadius: 3 }}>
              You are connecting <strong>{selectedProvider.name}</strong> to your OpenNotes creator profile.
            </Alert>
            <Typography variant="subtitle1" fontWeight={700}>
              Provider Requirements & Eligibility Checklist
            </Typography>
            <Stack spacing={1.5}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <CheckCircleIcon sx={{ color: "success.main", fontSize: 20 }} />
                <Typography variant="body2">Active approved account on {selectedProvider.name}</Typography>
              </Stack>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <CheckCircleIcon sx={{ color: "success.main", fontSize: 20 }} />
                <Typography variant="body2">Adherence to platform content policy & Terms of Service</Typography>
              </Stack>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <CheckCircleIcon sx={{ color: "success.main", fontSize: 20 }} />
                <Typography variant="body2">Valid Publisher ID / Customer ID ready to insert</Typography>
              </Stack>
            </Stack>
          </Stack>
        )}

        {/* Step 3: Enter Publisher Details */}
        {activeStep === 2 && (
          <Stack spacing={2.5}>
            <Typography variant="subtitle1" fontWeight={700}>
              Enter {selectedProvider.name} Credentials
            </Typography>
            {selectedProvider.getRequiredFields().map((field) => (
              <TextField
                key={field.name}
                label={field.label}
                required={field.required}
                placeholder={field.placeholder}
                helperText={validationErrors[field.name] || field.helpText}
                error={Boolean(validationErrors[field.name])}
                value={formData[field.name] || ""}
                onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                fullWidth
              />
            ))}
          </Stack>
        )}

        {/* Step 4: Validate Configuration */}
        {activeStep === 3 && (
          <Stack spacing={2.5}>
            <Typography variant="subtitle1" fontWeight={700}>
              Configuration Summary & Validation
            </Typography>
            <Alert severity="success" icon={<VerifiedIcon />} sx={{ borderRadius: 3 }}>
              Provider parameters formatted correctly! Ready for verification submission.
            </Alert>
            <Card variant="outlined" sx={{ borderRadius: 3, p: 2.5 }}>
              <Stack spacing={1.5}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">Provider</Typography>
                  <Typography variant="body2" fontWeight={700}>{selectedProvider.name}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">Publisher ID</Typography>
                  <Typography variant="body2" fontWeight={700}>{formData.publisherId}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">Publisher Name</Typography>
                  <Typography variant="body2" fontWeight={700}>{formData.publisherName}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">Account Email</Typography>
                  <Typography variant="body2" fontWeight={700}>{formData.publisherEmail}</Typography>
                </Stack>
              </Stack>
            </Card>
          </Stack>
        )}

        {/* Step 5: Submit Verification */}
        {activeStep === 4 && (
          <Stack spacing={2.5} alignItems="center" textAlign="center" sx={{ py: 2 }}>
            <WarningIcon sx={{ fontSize: 56, color: "warning.main" }} />
            <Typography variant="h6" fontWeight={800}>
              Submit Request for Review?
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 460 }}>
              Our platform security engine will verify your publisher configuration. Once verified, ads will automatically render on your enabled placements.
            </Typography>
          </Stack>
        )}

        {/* Step 6: Confirmation */}
        {activeStep === 5 && (
          <Stack spacing={2.5} alignItems="center" textAlign="center" sx={{ py: 3 }}>
            <CheckCircleIcon sx={{ fontSize: 64, color: "success.main" }} />
            <Typography variant="h5" fontWeight={900}>
              Verification Pending!
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 440 }}>
              Your {selectedProvider.name} connection request has been received. Status is now set to <strong>Pending</strong>.
            </Typography>
          </Stack>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        {activeStep > 0 && activeStep < 5 && (
          <Button onClick={handleBack} startIcon={<ArrowBackIcon />}>
            Back
          </Button>
        )}
        <Box sx={{ flex: 1 }} />
        {activeStep < 5 ? (
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={submitting}
            endIcon={submitting ? <CircularProgress size={18} color="inherit" /> : <ArrowForwardIcon />}
            sx={{ borderRadius: 2.5, px: 3, fontWeight: 700 }}
          >
            {activeStep === 4 ? "Submit For Review" : "Continue"}
          </Button>
        ) : (
          <Button variant="contained" onClick={handleClose} sx={{ borderRadius: 2.5, px: 3, fontWeight: 700 }}>
            Done
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ProviderWizardModal;
