import { motion } from "framer-motion";
import { useState } from "react";
import { Link } from "react-router-dom";
import Button from "../components/Button";
import InputField from "../components/InputField";
import { supabase } from "../lib/supabaseClient";
import { useAppContext } from "../context/AppContext";

export default function ForgotPasswordPage() {
  const { showToast } = useAppContext();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    try {
      const redirectUrl = `${window.location.origin}/reset-password`;
      console.log("Password reset redirect:", redirectUrl);
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: redirectUrl,
      });

      if (error) throw error;

      setSent(true);
      showToast(
        "Reset link sent",
        "Check your email inbox for a link to reset your password.",
        "success"
      );
    } catch (err) {
      showToast("Request failed", err.message || "An unexpected error occurred.", "error");
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
          <h1 className="mt-5 font-display text-3xl font-semibold text-ink dark:text-white">Reset Password</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Enter your email to receive a password reset link.
          </p>
        </div>

        {sent ? (
          <div className="space-y-5 text-center">
            <div className="rounded-2xl bg-emerald-500/10 p-4 border border-emerald-500/20 text-sm text-emerald-600 dark:text-emerald-400 leading-relaxed">
              We&apos;ve sent a password reset link to <strong className="text-ink dark:text-white">{email}</strong>. Please check your spam folder if you do not receive it in a few minutes.
            </div>
            <Link to="/login" className="block text-sm font-semibold text-accent hover:underline">
              Back to Login
            </Link>
          </div>
        ) : (
          <form className="space-y-5" onSubmit={handleSubmit}>
            <InputField
              label="Email Address"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              required
              disabled={loading}
            />

            <Button type="submit" className="w-full justify-center" disabled={loading}>
              {loading ? "Sending reset link…" : "Send Reset Link"}
            </Button>

            <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
              Remember your password?{" "}
              <Link to="/login" className="font-semibold text-accent hover:underline">
                Back to login
              </Link>
            </p>
          </form>
        )}
      </motion.div>
    </div>
  );
}
