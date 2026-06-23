import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../components/Button";
import InputField from "../components/InputField";
import { useAppContext } from "../context/AppContext";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAppContext();
  const [form, setForm] = useState({
    name: "",
    email: "",
    careerGoal: "",
    targetRole: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const validation = useMemo(() => {
    if (!form.name || !form.email || !form.careerGoal || !form.targetRole || !form.password) {
      return "All fields are required.";
    }
    if (form.password.length < 6) return "Password should be at least 6 characters.";
    return "";
  }, [form]);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (validation) {
      setError(validation);
      return;
    }

    const result = register(form);
    if (!result.ok) {
      setError(result.message);
      return;
    }

    setError("");
    setSuccess(true);
    window.setTimeout(() => navigate("/app/dashboard"), 1000);
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel w-full max-w-lg rounded-[36px] p-8"
      >
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br from-accent to-sky-400 text-lg font-bold text-white">
            PM
          </div>
          <h1 className="mt-5 font-display text-3xl font-semibold text-ink dark:text-white">Create your workspace</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Launch a calm dashboard for learning, projects, and PM career growth.
          </p>
        </div>
        <form className="grid gap-5 md:grid-cols-2" onSubmit={handleSubmit}>
          <div className="md:col-span-2">
            <InputField
              label="Name"
              value={form.name}
              onChange={(event) => setForm((previous) => ({ ...previous, name: event.target.value }))}
              placeholder="Your full name"
            />
          </div>
          <div className="md:col-span-2">
            <InputField
              label="Email"
              type="email"
              value={form.email}
              onChange={(event) => setForm((previous) => ({ ...previous, email: event.target.value }))}
              placeholder="you@example.com"
            />
          </div>
          <InputField
            label="Career Goal"
            value={form.careerGoal}
            onChange={(event) => setForm((previous) => ({ ...previous, careerGoal: event.target.value }))}
            placeholder="Land a PM internship"
          />
          <InputField
            label="Target Role"
            value={form.targetRole}
            onChange={(event) => setForm((previous) => ({ ...previous, targetRole: event.target.value }))}
            placeholder="Associate Product Manager"
          />
          <div className="md:col-span-2">
            <InputField
              label="Password"
              type="password"
              value={form.password}
              onChange={(event) => setForm((previous) => ({ ...previous, password: event.target.value }))}
              placeholder="Create a secure password"
            />
          </div>

          {error ? <p className="md:col-span-2 text-sm font-medium text-rose-500">{error}</p> : null}
          {success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="md:col-span-2 flex items-center gap-3 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
            >
              <CheckCircle2 className="h-5 w-5" />
              Account created successfully. Preparing your dashboard...
            </motion.div>
          ) : null}
          <div className="md:col-span-2">
            <Button type="submit" className="w-full justify-center">
              Create account
            </Button>
          </div>
        </form>
        <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-accent">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
