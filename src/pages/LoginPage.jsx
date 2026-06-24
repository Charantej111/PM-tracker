import { motion } from "framer-motion";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../components/Button";
import InputField from "../components/InputField";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [form, setForm] = useState({ email: "", password: "", remember: true });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn({ email: form.email, password: form.password });

    setLoading(false);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    navigate("/app/dashboard");
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
          <h1 className="mt-5 font-display text-3xl font-semibold text-ink dark:text-white">Welcome back</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Sign in to continue building your PM career system.
          </p>
        </div>
        <form className="space-y-5" onSubmit={handleSubmit}>
          <InputField
            label="Email"
            type="email"
            value={form.email}
            onChange={(event) => setForm((previous) => ({ ...previous, email: event.target.value }))}
            placeholder="you@example.com"
            required
          />
          <InputField
            label="Password"
            type="password"
            value={form.password}
            onChange={(event) => setForm((previous) => ({ ...previous, password: event.target.value }))}
            placeholder="Enter your password"
            required
          />
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400 cursor-pointer">
              <input
                type="checkbox"
                checked={form.remember}
                onChange={(event) => setForm((previous) => ({ ...previous, remember: event.target.checked }))}
                className="h-4 w-4 rounded border-slate-300 text-accent focus:ring-accent"
              />
              Remember me
            </label>
            <Link to="/forgot-password" className="text-sm font-semibold text-accent hover:underline">
              Forgot Password?
            </Link>
          </div>
          {error ? <p className="text-sm font-medium text-rose-500">{error}</p> : null}
          <Button type="submit" className="w-full justify-center" disabled={loading}>
            {loading ? "Signing in…" : "Login"}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
          New here?{" "}
          <Link to="/register" className="font-semibold text-accent">
            Create an account
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

