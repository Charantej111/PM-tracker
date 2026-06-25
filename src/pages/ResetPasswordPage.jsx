import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import InputField from "../components/InputField";
import { supabase } from "../lib/supabaseClient";
import { useAppContext } from "../context/AppContext";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const { showToast } = useAppContext();
  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // true  → still waiting for Supabase to exchange the hash token
  // false → session resolution is complete
  const [sessionLoading, setSessionLoading] = useState(true);
  const [hasSession, setHasSession] = useState(false);
  const resolvedRef = useRef(false);

  useEffect(() => {
    // Supabase fires PASSWORD_RECOVERY when the user arrives via the magic
    // link in their email.  We listen for that event so we know the temporary
    // session is ready and the user is allowed to set a new password.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (resolvedRef.current) return; // only handle the first relevant event

        if (event === "PASSWORD_RECOVERY") {
          // Supabase has exchanged the hash for a valid session.
          resolvedRef.current = true;
          setHasSession(true);
          setSessionLoading(false);
        } else if (event === "SIGNED_IN" && session) {
          // Already signed in (e.g. user opened the link while logged in).
          resolvedRef.current = true;
          setHasSession(true);
          setSessionLoading(false);
        } else if (event === "SIGNED_OUT" || event === "INITIAL_SESSION") {
          // Only redirect if there is genuinely no session and the hash has
          // already been processed (i.e. there is no #access_token in the URL).
          const hash = window.location.hash;
          const hasToken =
            hash.includes("access_token") || hash.includes("type=recovery");

          if (!hasToken) {
            resolvedRef.current = true;
            setHasSession(false);
            setSessionLoading(false);
          }
          // If there IS a token in the hash, keep waiting for PASSWORD_RECOVERY.
        }
      }
    );

    // Safety net: if no auth event fires within 5 s, stop waiting.
    const timeout = setTimeout(() => {
      if (!resolvedRef.current) {
        resolvedRef.current = true;
        setSessionLoading(false);
      }
    }, 5000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  // Redirect to login once we know there is no valid reset session.
  useEffect(() => {
    if (!sessionLoading && !hasSession) {
      showToast(
        "Access denied",
        "No active password reset session found. Please request a new reset link.",
        "error"
      );
      navigate("/login");
    }
  }, [sessionLoading, hasSession, navigate, showToast]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const { error: resetError } = await supabase.auth.updateUser({
        password: form.password,
      });

      if (resetError) throw resetError;

      showToast(
        "Password updated",
        "Your password has been reset successfully. Please login with your new password.",
        "success"
      );
      // Sign out to force re-login with the new password.
      await supabase.auth.signOut();
      navigate("/login");
    } catch (err) {
      setError(err.message || "Failed to update password.");
      showToast(
        "Reset failed",
        err.message || "An unexpected error occurred.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  if (sessionLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent" />
      </div>
    );
  }

  if (!hasSession) {
    // Redirect is already triggered via useEffect above; render nothing.
    return null;
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel w-full max-w-md rounded-[32px] p-8"
      >
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br from-accent to-sky-400 text-lg font-bold text-white">
            PM
          </div>
          <h1 className="mt-5 font-display text-3xl font-semibold text-ink dark:text-white">Create New Password</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Set your new login password below.
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <InputField
            label="New Password"
            type="password"
            value={form.password}
            onChange={(event) => setForm((previous) => ({ ...previous, password: event.target.value }))}
            placeholder="At least 6 characters"
            required
            disabled={loading}
          />

          <InputField
            label="Confirm New Password"
            type="password"
            value={form.confirmPassword}
            onChange={(event) => setForm((previous) => ({ ...previous, confirmPassword: event.target.value }))}
            placeholder="Re-enter your password"
            required
            disabled={loading}
          />

          {error ? <p className="text-sm font-medium text-rose-500">{error}</p> : null}

          <Button type="submit" className="w-full justify-center" disabled={loading}>
            {loading ? "Updating password…" : "Reset Password"}
          </Button>
        </form>
      </motion.div>
    </div>
  );
}
