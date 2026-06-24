import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import InputField from "../components/InputField";
import { supabase } from "../lib/supabaseClient";
import { useAppContext } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const { showToast } = useAppContext();
  const { user, loading: authLoading } = useAuth();
  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      showToast("Access denied", "No active password reset session found. Please request a new reset link.", "error");
      navigate("/login");
    }
  }, [user, authLoading, navigate, showToast]);

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent" />
      </div>
    );
  }

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

      showToast("Password updated", "Your password has been reset successfully. Please login with your new password.", "success");
      // Sign out to force re-login with the new password
      await supabase.auth.signOut();
      navigate("/login");
    } catch (err) {
      setError(err.message || "Failed to update password.");
      showToast("Reset failed", err.message || "An unexpected error occurred.", "error");
    } finally {
      setLoading(false);
    }
  };

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
