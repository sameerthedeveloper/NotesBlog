"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

const validateEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

const SocialButton = ({ icon, label, onClick, disabled, loading }) => (
  <Button
    type="button"
    variant="outline"
    className="w-full"
    onClick={onClick}
    disabled={disabled}
  >
    {loading ? <Loader2 className="animate-spin" /> : icon}
    {label}
  </Button>
);

const LoginPage = () => {
  const { login, loginWithGoogle } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(null);
  const [error, setError] = useState("");
  const [touched, setTouched] = useState({ email: false, password: false });

  const emailError = touched.email && email && !validateEmail(email) ? "Please enter a valid email" : "";
  const passwordError = touched.password && password.length > 0 && password.length < 6 ? "Password must be at least 6 characters" : "";
  const handleBlur = (field) => setTouched((p) => ({ ...p, [field]: true }));

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setTouched({ email: true, password: true });
      if (!validateEmail(email)) return;
      setError("");
      setLoading(true);
      try {
        await login(email.trim(), password);
        toast.success("Welcome back");
        router.replace(from);
      } catch (err) {
        const code = err?.code;
        const msg =
          code === "auth/invalid-credential" || code === "auth/wrong-password"
            ? "Incorrect email or password."
            : code === "auth/user-not-found"
            ? "No account found with this email."
            : code === "auth/too-many-requests"
            ? "Too many attempts. Please try again later."
            : err?.message || "Sign in failed. Please try again.";
        setError(msg);
      } finally {
        setLoading(false);
      }
    },
    [email, password, login, router, from]
  );

  const handleGoogleSignIn = async () => {
    setError("");
    setSocialLoading("google");
    try {
      await loginWithGoogle();
      toast.success("Welcome");
      router.replace(from);
    } catch (err) {
      setError(err?.message || "Google sign-in failed.");
    } finally {
      setSocialLoading(null);
    }
  };

  const disableAll = loading || Boolean(socialLoading);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-extrabold tracking-tight text-foreground">
          Welcome back
        </h1>
        <p className="text-sm font-medium text-muted-foreground">
          Sign in to continue to OpenNotes
        </p>
      </div>

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
          <Label htmlFor="login-email">Email address</Label>
          <div className="relative">
            <Mail
              className={cn(
                "pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2",
                emailError ? "text-destructive" : "text-muted-foreground"
              )}
            />
            <Input
              id="login-email"
              type="email"
              autoComplete="email"
              autoFocus
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
          <Label htmlFor="login-password">Password</Label>
          <div className="relative">
            <Lock
              className={cn(
                "pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2",
                passwordError ? "text-destructive" : "text-muted-foreground"
              )}
            />
            <Input
              id="login-password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
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
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
          {passwordError && <p className="text-xs text-destructive">{passwordError}</p>}
        </div>

        <div className="-mt-1 flex items-center justify-between">
          <label className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
            <Checkbox
              checked={rememberMe}
              onCheckedChange={(checked) => setRememberMe(Boolean(checked))}
            />
            Remember me
          </label>
          <Link
            href="/forgot-password"
            className="text-xs font-bold text-primary hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        <Button
          id="login-submit"
          type="submit"
          size="lg"
          className="mt-1"
          disabled={disableAll}
        >
          {loading ? <Loader2 className="animate-spin" /> : (
            <>
              Sign in
              <ArrowRight />
            </>
          )}
        </Button>
      </form>

      <p className="text-center text-sm font-medium text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link
          href={`/signup?from=${encodeURIComponent(from)}`}
          className="font-extrabold text-primary hover:underline"
        >
          Create account
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

export default LoginPage;
