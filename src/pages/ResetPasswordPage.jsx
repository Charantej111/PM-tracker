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
  const { loading: authLoading, isRecoverySession, clearRecoveryMode, signOut } = useAuth();
  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resetSuccess, setResetSuccess] = useState(false);

  useEffect(() => {
    console.log("RESET PAGE MOUNTED");
  }, []);

  // If auth has finished loading and there is no recovery session, the user
  // arrived here without a valid reset link — redirect to login.
  useEffect(() => {
    if (!authLoading && !isRecoverySession && !resetSuccess) {
      const hash = window.location.hash;
      const search = window.location.search;
      const hasError = hash.includes("error") || search.includes("error");

      if (hasError) {
        showToast(
          "Link Expired",
          "The password reset link is invalid or has expired. Please request a new one.",
          "error"
        );
      } else {
        showToast(
          "Access denied",
          "No active password reset session found. Please request a new reset link.",
          "error"
        );
      }
      navigate("/login", { replace: true });
    }
  }, [authLoading, isRecoverySession, resetSuccess, navigate, showToast]);

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

      console.log("Password updated");
      setResetSuccess(true);
      console.log("Signing out");
      await signOut();
      console.log("Recovery cleared");
      clearRecoveryMode();
      console.log("Navigating to login");

      showToast(
        "Password updated",
        "Your password has been reset successfully. Please login with your new password.",
        "success"
      );
      
      // Clear URL hash after processing
      window.history.replaceState({}, document.title, "/login");
      navigate("/login", { replace: true });
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

  // Show a spinner while waiting for Supabase to process the recovery token.
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent" />
      </div>
    );
  }

  // If no recovery session, render nothing (redirect already fired above).
  if (!isRecoverySession) return null;

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
          <h1 className="mt-5 font-display text-3xl font-semibold text-ink dark:text-white">
            Create New Password
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Set your new login password below.
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <InputField
            label="New Password"
            type="password"
            value={form.password}
            onChange={(event) =>
              setForm((previous) => ({ ...previous, password: event.target.value }))
            }
            placeholder="At least 6 characters"
            required
            disabled={loading}
          />

          <InputField
            label="Confirm New Password"
            type="password"
            value={form.confirmPassword}
            onChange={(event) =>
              setForm((previous) => ({ ...previous, confirmPassword: event.target.value }))
            }
            placeholder="Re-enter your password"
            required
            disabled={loading}
          />

          {error ? (
            <p className="text-sm font-medium text-rose-500">{error}</p>
          ) : null}

          <Button
            type="submit"
            className="w-full justify-center"
            disabled={loading}
          >
            {loading ? "Updating password…" : "Reset Password"}
          </Button>
        </form>
      </motion.div>
    </div>
  );
}
