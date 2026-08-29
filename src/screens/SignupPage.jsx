"use client";

import { useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  CheckCircle2,
  Circle,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { usePlatformSettings } from "@/context/PlatformSettingsContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

const validateEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

const PASSWORD_RULES = [
  { id: "length", label: "At least 8 characters", test: (p) => p.length >= 8 },
  { id: "upper", label: "One uppercase letter", test: (p) => /[A-Z]/.test(p) },
  { id: "lower", label: "One lowercase letter", test: (p) => /[a-z]/.test(p) },
  { id: "number", label: "One number", test: (p) => /\d/.test(p) },
  { id: "special", label: "One special character", test: (p) => /[!@#$%^&*(),.?":{}|<>\-_+=~`]/.test(p) },
];

const getStrength = (p) => {
  if (!p) return { score: 0, label: "", barClass: "bg-muted-foreground/30", textClass: "text-muted-foreground" };
  const n = PASSWORD_RULES.filter((r) => r.test(p)).length;
  const levels = [
    null,
    { score: 20, label: "Very weak", barClass: "bg-destructive", textClass: "text-destructive" },
    { score: 40, label: "Weak", barClass: "bg-amber-500", textClass: "text-amber-600 dark:text-amber-400" },
    { score: 60, label: "Fair", barClass: "bg-blue-500", textClass: "text-blue-600 dark:text-blue-400" },
    { score: 80, label: "Strong", barClass: "bg-emerald-400", textClass: "text-emerald-500" },
    { score: 100, label: "Very strong", barClass: "bg-emerald-600", textClass: "text-emerald-600" },
  ];
  return levels[n] || levels[1];
};

const SocialButton = ({ icon, label, onClick, disabled, loading }) => (
  <Button type="button" variant="outline" className="w-full" onClick={onClick} disabled={disabled}>
    {loading ? <Loader2 className="animate-spin" /> : icon}
    {label}
  </Button>
);

const SignupPage = () => {
  const { signup, loginWithGoogle } = useAuth();
  const { settings } = usePlatformSettings();
  const isRegistrationDisabled = settings?.general?.registrationEnabled === false;
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/dashboard";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(null);
  const [error, setError] = useState("");
  const [touched, setTouched] = useState({
    name: false, email: false, password: false, confirmPassword: false,
  });

  const handleBlur = (f) => setTouched((p) => ({ ...p, [f]: true }));

  const nameError = touched.name && name.trim().length < 2 ? "Name must be at least 2 characters" : "";
  const emailError = touched.email && email && !validateEmail(email) ? "Enter a valid email address" : "";
  const rules = useMemo(() => PASSWORD_RULES.map((r) => ({ ...r, passed: r.test(password) })), [password]);
  const passwordOk = rules.every((r) => r.passed);
  const passwordError = touched.password && password && !passwordOk ? " " : "";
  const confirmError = touched.confirmPassword && confirmPassword && confirmPassword !== password
    ? "Passwords do not match" : "";
  const strength = getStrength(password);
  const canSubmit = !isRegistrationDisabled && name.trim() && validateEmail(email) && passwordOk && confirmPassword === password && acceptTerms;

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (isRegistrationDisabled) {
        toast.error("User registrations are currently paused by the platform administrator.");
        return;
      }
      setTouched({ name: true, email: true, password: true, confirmPassword: true });
      if (!canSubmit) return;
      setError("");
      setLoading(true);
      try {
        await signup(email.trim(), password, name.trim());
        toast.success("Account created. Welcome to OpenNotes");
        router.replace(from);
      } catch (err) {
        const msg =
          err?.code === "auth/email-already-in-use"
            ? "An account with this email already exists."
            : err?.message || "Account creation failed.";
        setError(msg);
      } finally {
        setLoading(false);
      }
    },
    [canSubmit, email, password, name, signup, router, from, isRegistrationDisabled]
  );

  const handleGoogleSignIn = async () => {
    if (isRegistrationDisabled) {
      toast.error("User registrations are currently paused by the platform administrator.");
      return;
    }
    setError("");
    setSocialLoading("google");
    try {
      await loginWithGoogle();
      toast.success("Welcome to OpenNotes");
      router.replace(from);
    } catch (err) {
      setError(err?.message || "Google sign-in failed.");
    } finally {
      setSocialLoading(null);
    }
  };

  const disableAll = loading || Boolean(socialLoading) || isRegistrationDisabled;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-extrabold tracking-tight text-foreground">
          Create your account
        </h1>
        <p className="text-sm font-medium text-muted-foreground">
          Free forever · No credit card required
        </p>
      </div>

      {isRegistrationDisabled && (
        <Alert>
          <AlertDescription>
            User registrations are currently paused by the platform administrator.
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-2 gap-3">
        <SocialButton
          icon={<GoogleGlyph />}
          label="Google"
          onClick={handleGoogleSignIn}
          disabled={disableAll}
          loading={socialLoading === "google"}
        />
        <SocialButton icon={<GithubGlyph />} label="GitHub" disabled={disableAll} />
      </div>

      <div className="relative flex items-center">
        <div className="h-px flex-1 bg-border" />
        <span className="px-3 text-[11px] font-semibold tracking-wide text-muted-foreground">
          or continue with email
        </span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <form onSubmit={handleSubmit} autoComplete="on" noValidate className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="signup-name">Full name</Label>
          <div className="relative">
            <User className={cn("pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2", nameError ? "text-destructive" : "text-muted-foreground")} />
            <Input
              id="signup-name"
              autoComplete="name"
              autoFocus
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => handleBlur("name")}
              disabled={disableAll}
              aria-invalid={Boolean(nameError)}
              className="pl-9"
            />
          </div>
          {nameError && <p className="text-xs text-destructive">{nameError}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="signup-email">Email address</Label>
          <div className="relative">
            <Mail className={cn("pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2", emailError ? "text-destructive" : "text-muted-foreground")} />
            <Input
              id="signup-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => handleBlur("email")}
              disabled={disableAll}
              aria-invalid={Boolean(emailError)}
              className="pl-9"
            />
          </div>
          {emailError && <p className="text-xs text-destructive">{emailError}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="signup-password">Create password</Label>
          <div className="relative">
            <Lock className={cn("pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2", passwordError ? "text-destructive" : "text-muted-foreground")} />
            <Input
              id="signup-password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => handleBlur("password")}
              disabled={disableAll}
              aria-invalid={Boolean(passwordError)}
              className="px-9"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
              className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>

          {password.length > 0 && (
            <div className="mt-1">
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground">Password strength</span>
                <span className={cn("text-xs font-bold", strength.textClass)}>{strength.label}</span>
              </div>
              <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={cn("h-full rounded-full transition-all duration-300", strength.barClass)}
                  style={{ width: `${strength.score}%` }}
                />
              </div>
              <div className="mt-3 grid grid-cols-2 gap-1">
                {rules.map((r) => (
                  <div key={r.id} className="flex items-center gap-1.5">
                    {r.passed ? (
                      <CheckCircle2 className="size-3 text-emerald-500" />
                    ) : (
                      <Circle className="size-3 text-muted-foreground/50" />
                    )}
                    <span className={cn("text-[11px]", r.passed ? "font-bold text-emerald-500" : "font-medium text-muted-foreground/70")}>
                      {r.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="signup-confirm">Confirm password</Label>
          <div className="relative">
            <Lock className={cn("pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2", confirmError ? "text-destructive" : "text-muted-foreground")} />
            <Input
              id="signup-confirm"
              type={showConfirm ? "text" : "password"}
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onBlur={() => handleBlur("confirmPassword")}
              disabled={disableAll}
              aria-invalid={Boolean(confirmError)}
              className="px-9"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              tabIndex={-1}
              className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
          {confirmError && <p className="text-xs text-destructive">{confirmError}</p>}
        </div>

        <label className="-mt-0.5 flex items-start gap-2">
          <Checkbox
            className="mt-0.5"
            checked={acceptTerms}
            onCheckedChange={(checked) => setAcceptTerms(Boolean(checked))}
          />
          <span className="text-xs leading-relaxed font-medium text-muted-foreground">
            I agree to the{" "}
            <span className="font-bold text-primary">Terms of Service</span>{" "}
            and <span className="font-bold text-primary">Privacy Policy</span>
          </span>
        </label>

        <Button id="signup-submit" type="submit" size="lg" disabled={disableAll}>
          {loading ? <Loader2 className="animate-spin" /> : (
            <>
              Create account
              <ArrowRight />
            </>
          )}
        </Button>
      </form>

      <p className="text-center text-sm font-medium text-muted-foreground">
        Already have an account?{" "}
        <Link
          href={`/login?from=${encodeURIComponent(from)}`}
          className="font-extrabold text-primary hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
};

function GoogleGlyph() {
  return (
    <svg viewBox="0 0 18 18" className="size-[18px]" aria-hidden="true">
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.56 2.7-3.86 2.7-6.62z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.98v2.33A9 9 0 0 0 9 18z" />
      <path fill="#FBBC05" d="M3.95 10.7A5.4 5.4 0 0 1 3.66 9c0-.59.1-1.16.29-1.7V4.97H.98A9 9 0 0 0 0 9c0 1.45.35 2.83.98 4.03z" />
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .98 4.97l2.97 2.33C4.66 5.17 6.65 3.58 9 3.58z" />
    </svg>
  );
}

function GithubGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="size-[18px] fill-current" aria-hidden="true">
      <path d="M12 .5C5.73.5.98 5.24.98 11.5c0 4.99 3.24 9.22 7.73 10.72.56.1.77-.24.77-.54v-1.9c-3.15.69-3.81-1.5-3.81-1.5-.51-1.3-1.26-1.65-1.26-1.65-1.03-.7.08-.69.08-.69 1.14.08 1.74 1.17 1.74 1.17 1.01 1.74 2.66 1.23 3.31.94.1-.74.4-1.24.72-1.52-2.51-.29-5.15-1.26-5.15-5.6 0-1.24.44-2.25 1.17-3.04-.12-.29-.51-1.45.11-3.02 0 0 .96-.31 3.15 1.16a10.9 10.9 0 0 1 5.74 0c2.18-1.47 3.14-1.16 3.14-1.16.62 1.57.23 2.73.11 3.02.73.79 1.17 1.8 1.17 3.04 0 4.36-2.64 5.31-5.16 5.59.41.35.77 1.04.77 2.1v3.11c0 .3.2.65.78.54A11.51 11.51 0 0 0 23 11.5C23 5.24 18.27.5 12 .5z" />
    </svg>
  );
}

export default SignupPage;
