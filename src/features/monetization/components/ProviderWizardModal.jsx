"use client";

import { useState } from "react";
import {
  CheckCircle2,
  BadgeCheck,
  ArrowRight,
  ArrowLeft,
  TriangleAlert,
  Loader2,
} from "lucide-react";
import { getAllProviders, getProviderById } from "@/features/monetization/providers";
import { useMonetization } from "@/context/MonetizationContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const STEPS = [
  "Select Provider",
  "Provider Requirements",
  "Publisher Details",
  "Validate Configuration",
  "Submit Verification",
  "Activation",
];

export const ProviderWizardModal = ({ open, onClose, initialProviderId = null }) => {
  const { submitProviderConnection } = useMonetization();

  const [activeStep, setActiveStep] = useState(0);
  const [selectedProviderId, setSelectedProviderId] = useState(initialProviderId || null);
  const [formData, setFormData] = useState({
    publisherId: "",
    publisherName: "",
    publisherEmail: "",
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const selectedProvider = getProviderById(selectedProviderId) || null;

  const handleNext = async () => {
    if (activeStep === 0 && !selectedProviderId) {
      toast.error("Please select a provider.");
      return;
    }

    if (activeStep === 2) {
      const res = selectedProvider.validateConfig(formData);
      setValidationErrors(res.errors);
      if (!res.valid) {
        toast.error("Please fix configuration errors before proceeding.");
        return;
      }
    }

    if (activeStep === 4) {
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

  const handleBack = () => setActiveStep((prev) => prev - 1);

  const handleClose = () => {
    setActiveStep(0);
    setValidationErrors({});
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !next && handleClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Connect Ad Provider</DialogTitle>
          <DialogDescription>
            Follow the 6-step guided wizard to connect your publisher account safely.
          </DialogDescription>
        </DialogHeader>

        {/* Step indicator */}
        <div className="mb-2 flex items-center gap-1 overflow-x-auto pb-1">
          {STEPS.map((label, idx) => (
            <div key={label} className="flex flex-1 items-center gap-1">
              <div
                className={cn(
                  "flex size-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold",
                  idx < activeStep
                    ? "bg-success text-success-foreground"
                    : idx === activeStep
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {idx + 1}
              </div>
              {idx < STEPS.length - 1 && <div className="h-px flex-1 bg-border" />}
            </div>
          ))}
        </div>
        <p className="mb-4 text-xs font-semibold text-muted-foreground">{STEPS[activeStep]}</p>

        <div className="max-h-[50vh] overflow-y-auto">
          {activeStep === 0 && (
            <div>
              <h3 className="mb-3 text-sm font-bold">Choose your advertising provider</h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {getAllProviders().map((p) => {
                  const isSelected = selectedProviderId === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => setSelectedProviderId(p.id)}
                      className={cn(
                        "rounded-2xl border p-4 text-left transition-colors hover:border-primary",
                        isSelected ? "border-2 border-primary bg-primary/5" : "border-border"
                      )}
                    >
                      <div className="mb-1.5 flex items-center gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element -- external provider logo URLs, not static assets */}
                        <img
                          src={p.logo}
                          alt={p.name}
                          width={36}
                          height={36}
                          className="object-contain"
                          onError={(e) => { e.currentTarget.src = "/logo.svg"; }}
                        />
                        <div className="flex-1">
                          <p className="text-sm font-extrabold">{p.name}</p>
                          <Badge variant="secondary" className="h-5 text-[11px]">{p.category}</Badge>
                        </div>
                        {isSelected && <CheckCircle2 className="text-primary" />}
                      </div>
                      <p className="text-xs leading-relaxed text-muted-foreground">{p.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {activeStep === 1 && selectedProvider && (
            <div className="flex flex-col gap-3">
              <Alert>
                <AlertDescription>
                  You are connecting <strong>{selectedProvider.name}</strong> to your OpenNotes creator profile.
                </AlertDescription>
              </Alert>
              <h3 className="text-sm font-bold">Provider Requirements &amp; Eligibility Checklist</h3>
              <div className="flex flex-col gap-2">
                {[
                  `Active approved account on ${selectedProvider.name}`,
                  "Adherence to platform content policy & Terms of Service",
                  "Valid Publisher ID / Customer ID ready to insert",
                ].map((line) => (
                  <div key={line} className="flex items-center gap-2.5">
                    <CheckCircle2 className="size-4 text-emerald-500" />
                    <span className="text-sm">{line}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeStep === 2 && selectedProvider && (
            <div className="flex flex-col gap-4">
              <h3 className="text-sm font-bold">Enter {selectedProvider.name} Credentials</h3>
              {selectedProvider.getRequiredFields().map((field) => (
                <div key={field.name} className="flex flex-col gap-1.5">
                  <Label htmlFor={field.name}>{field.label}</Label>
                  <Input
                    id={field.name}
                    required={field.required}
                    placeholder={field.placeholder}
                    value={formData[field.name] || ""}
                    onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                    aria-invalid={Boolean(validationErrors[field.name])}
                  />
                  <p className={cn("text-xs", validationErrors[field.name] ? "text-destructive" : "text-muted-foreground")}>
                    {validationErrors[field.name] || field.helpText}
                  </p>
                </div>
              ))}
            </div>
          )}

          {activeStep === 3 && (
            <div className="flex flex-col gap-4">
              <h3 className="text-sm font-bold">Configuration Summary &amp; Validation</h3>
              <Alert className="border-emerald-500/40 text-emerald-600 dark:text-emerald-400">
                <BadgeCheck className="size-4" />
                <AlertDescription className="text-emerald-600 dark:text-emerald-400">
                  Provider parameters formatted correctly! Ready for verification submission.
                </AlertDescription>
              </Alert>
              <div className="flex flex-col gap-2 rounded-2xl border border-border p-4">
                {[
                  ["Provider", selectedProvider?.name],
                  ["Publisher ID", formData.publisherId],
                  ["Publisher Name", formData.publisherName],
                  ["Account Email", formData.publisherEmail],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-bold">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeStep === 4 && (
            <div className="flex flex-col items-center gap-3 py-2 text-center">
              <TriangleAlert className="size-14 text-amber-500" />
              <h3 className="text-lg font-extrabold">Submit Request for Review?</h3>
              <p className="max-w-md text-sm text-muted-foreground">
                Our platform security engine will verify your publisher configuration. Once verified, ads will automatically render on your enabled placements.
              </p>
            </div>
          )}

          {activeStep === 5 && (
            <div className="flex flex-col items-center gap-3 py-4 text-center">
              <CheckCircle2 className="size-16 text-emerald-500" />
              <h3 className="text-xl font-black">Verification Pending!</h3>
              <p className="max-w-md text-sm text-muted-foreground">
                Your {selectedProvider?.name} connection request has been received. Status is now set to <strong>Pending</strong>.
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="flex-row items-center justify-between sm:justify-between">
          {activeStep > 0 && activeStep < 5 ? (
            <Button variant="ghost" onClick={handleBack}>
              <ArrowLeft />
              Back
            </Button>
          ) : (
            <span />
          )}
          {activeStep < 5 ? (
            <Button onClick={handleNext} disabled={submitting}>
              {submitting ? <Loader2 className="animate-spin" /> : null}
              {activeStep === 4 ? "Submit For Review" : "Continue"}
              {!submitting && <ArrowRight />}
            </Button>
          ) : (
            <Button onClick={handleClose}>Done</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProviderWizardModal;
