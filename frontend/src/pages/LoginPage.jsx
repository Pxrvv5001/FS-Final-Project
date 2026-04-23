import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

const DEFAULT_ADMIN_EMAIL = "admin@inventory.com";
const DEFAULT_ADMIN_SECRET = import.meta.env.VITE_DEMO_ADMIN_SECRET || "";
const DEFAULT_USER_EMAIL = "user@inventory.com";
const DEFAULT_USER_SECRET = import.meta.env.VITE_DEMO_USER_SECRET || "";
const PASSWORD_RULE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;
const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_WINDOW_MS = 60_000;

function getStrength(password) {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z\d]/.test(password)) score += 1;

  if (score <= 1) return { label: "Weak", color: "bg-red-500", width: "w-1/3" };
  if (score <= 3) return { label: "Medium", color: "bg-amber-500", width: "w-2/3" };
  return { label: "Strong", color: "bg-emerald-500", width: "w-full" };
}

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState(DEFAULT_ADMIN_EMAIL);
  const [password, setPassword] = useState(DEFAULT_ADMIN_SECRET);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [toastText, setToastText] = useState("");
  const [attemptCount, setAttemptCount] = useState(0);
  const [lockedUntil, setLockedUntil] = useState(0);

  const strength = useMemo(() => getStrength(password), [password]);

  const lockSeconds = Math.max(0, Math.ceil((lockedUntil - Date.now()) / 1000));
  const isLocked = lockSeconds > 0;

  const showToast = (message) => {
    setToastText(message);
    setTimeout(() => setToastText(""), 3500);
  };

  const validateForm = () => {
    if (!email.trim()) {
      setErrorText("Email is required");
      return false;
    }

    const emailFormat = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailFormat.test(email.trim())) {
      setErrorText("Please enter a valid email address");
      return false;
    }

    if (!PASSWORD_RULE.test(password)) {
      setErrorText("Use a strong password to protect your account");
      return false;
    }

    return true;
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setErrorText("");

    if (isLocked) {
      showToast(`Too many attempts. Try again in ${lockSeconds}s`);
      return;
    }

    if (!validateForm()) {
      showToast("Please fix the form errors");
      return;
    }

    setIsLoading(true);
    try {
      await login(email.trim(), password);

      if (rememberMe) {
        localStorage.setItem("sip_remember_email", email.trim());
      } else {
        localStorage.removeItem("sip_remember_email");
      }

      setAttemptCount(0);
      showToast("Login successful");
      navigate("/dashboard", { replace: true });
    } catch (error) {
      const apiMessage = error?.response?.data?.message;
      const nextAttempts = attemptCount + 1;
      setAttemptCount(nextAttempts);

      if (nextAttempts >= MAX_LOGIN_ATTEMPTS) {
        const until = Date.now() + LOCK_WINDOW_MS;
        setLockedUntil(until);
        setAttemptCount(0);
        setErrorText("Too many failed attempts. Please wait before trying again.");
        showToast("Account temporarily locked for 60 seconds");
      } else {
        setErrorText(apiMessage || "Login failed. Please check your credentials.");
        showToast(apiMessage || "Login failed");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const remembered = localStorage.getItem("sip_remember_email");
    if (remembered) {
      setEmail(remembered);
      setRememberMe(true);
    }
  }, []);

  useEffect(() => {
    if (!lockedUntil) return;
    const timer = setInterval(() => {
      if (Date.now() >= lockedUntil) {
        setLockedUntil(0);
        clearInterval(timer);
      }
    }, 500);
    return () => clearInterval(timer);
  }, [lockedUntil]);

  useEffect(() => {
    const onSessionExpired = () => showToast("Session expired. Please login again.");
    globalThis.addEventListener("sip:session-expired", onSessionExpired);
    return () => globalThis.removeEventListener("sip:session-expired", onSessionExpired);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-blue-700 via-indigo-700 to-violet-700 p-4 md:p-8">
      <div className="pointer-events-none absolute -left-16 top-14 h-56 w-56 rounded-full bg-cyan-300/30 blur-3xl animate-float" />
      <div className="pointer-events-none absolute right-10 top-28 h-64 w-64 rounded-full bg-fuchsia-300/25 blur-3xl animate-float" />
      <div className="pointer-events-none absolute bottom-8 left-1/3 h-72 w-72 rounded-full bg-blue-300/25 blur-3xl animate-float" />

      {toastText && (
        <div className="animate-fade-slide-up fixed right-4 top-4 z-50 rounded-xl border border-white/20 bg-slate-900/85 px-4 py-3 text-sm font-medium text-white shadow-2xl backdrop-blur">
          {toastText}
        </div>
      )}

      <div className="mx-auto flex min-h-[calc(100vh-2rem)] w-full max-w-7xl items-center justify-center gap-8 md:gap-12">
        <section className="hidden w-1/2 animate-fade-slide-up text-white lg:block">
          <div className="mb-8 inline-flex items-center gap-3 rounded-2xl border border-white/20 bg-white/10 px-4 py-3 backdrop-blur-md">
            <span className="text-2xl">SI</span>
            <p className="text-lg font-semibold">SmartInventoryPro</p>
          </div>

          <h1 className="mb-4 text-5xl font-extrabold leading-tight">Inventory Control For Growing Businesses</h1>
          <p className="mb-8 max-w-xl text-lg text-blue-50/90">
            Run your stock operations like a modern SaaS company with secure login, analytics-driven decisions,
            and role-based control.
          </p>

          <div className="space-y-4 text-sm md:text-base">
            <div className="flex items-center gap-3 rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-md">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white/15 text-xs font-bold">RB</span>
              <span>Role-based admin and user access</span>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-md">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white/15 text-xs font-bold">AI</span>
              <span>Real-time low-stock and activity insights</span>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-md">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white/15 text-xs font-bold">SC</span>
              <span>Secure authentication with auto session expiry</span>
            </div>
          </div>
        </section>

        <section className="w-full max-w-xl animate-fade-slide-up rounded-3xl border border-white/25 bg-white/15 p-6 shadow-2xl backdrop-blur-2xl md:p-8">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-white">Welcome back</h2>
            <p className="mt-2 text-sm text-blue-100">Sign in to continue to your Smart Inventory dashboard</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <label htmlFor="login-email" className="mb-2 block text-sm font-semibold text-blue-50">Email</label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">@</span>
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-white/20 bg-white/85 py-3 pl-10 pr-4 text-slate-800 shadow-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-300/30"
                  placeholder="admin@inventory.com"
                />
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label htmlFor="login-password" className="block text-sm font-semibold text-blue-50">Password</label>
                <button
                  type="button"
                  className="text-xs font-semibold text-blue-100 hover:text-white"
                  onClick={() => showToast("Forgot password flow will be added soon")}
                >
                  Forgot Password?
                </button>
              </div>

              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">*</span>
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-white/20 bg-white/85 py-3 pl-10 pr-20 text-slate-800 shadow-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-300/30"
                  placeholder="Enter secure password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>

              <div className="mt-3">
                <div className="mb-1 flex items-center justify-between text-xs text-blue-100">
                  <span>Password Strength</span>
                  <span className="font-semibold">{strength.label}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/30">
                  <div className={`h-full ${strength.color} ${strength.width} transition-all`} />
                </div>
                <p className="mt-2 text-xs text-blue-100">Use a strong password to protect your account</p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="inline-flex items-center gap-2 text-sm text-blue-50">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-white/30 text-blue-600"
                />
                <span>Remember Me</span>
              </label>
              <span className="text-xs text-blue-100">Attempts left: {Math.max(0, MAX_LOGIN_ATTEMPTS - attemptCount)}</span>
            </div>

            <div className="rounded-xl border border-white/20 bg-white/10 p-3 text-xs text-blue-50">
              For demo, please use secure credentials provided below.
            </div>

            <div className="rounded-xl border border-white/20 bg-white/10 p-3 text-xs text-blue-50 space-y-1">
              <p>Admin: {DEFAULT_ADMIN_EMAIL} / {DEFAULT_ADMIN_SECRET || "(set VITE_DEMO_ADMIN_SECRET)"}</p>
              <p>User: {DEFAULT_USER_EMAIL} / {DEFAULT_USER_SECRET || "(set VITE_DEMO_USER_SECRET)"}</p>
            </div>

            <div className="rounded-xl border border-dashed border-white/30 bg-white/5 p-3 text-xs text-blue-100">
              CAPTCHA placeholder (Google reCAPTCHA can be integrated here)
            </div>

            {errorText && <p className="rounded-xl bg-red-500/20 px-3 py-2 text-sm text-red-100">{errorText}</p>}

            {isLocked && (
              <p className="rounded-xl bg-amber-500/20 px-3 py-2 text-sm text-amber-100">
                Too many failed attempts. Try again in {lockSeconds}s.
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading || isLocked}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-violet-500 px-4 py-3 font-semibold text-white shadow-lg transition hover:scale-[1.01] hover:from-blue-400 hover:to-violet-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />}
              {isLoading ? "Signing in..." : "Sign In"}
            </button>

            <button
              type="button"
              className="w-full rounded-xl border border-white/30 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
              onClick={() => showToast("Google login UI only. Backend OAuth can be added next.")}
            >
              Continue with Google
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-blue-100">Copyright 2026 SmartInventoryPro</p>
        </section>
      </div>
    </div>
  );
}
