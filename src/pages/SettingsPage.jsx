import { useState } from "react";
import Button from "../components/Button";
import Card from "../components/Card";
import PageShell from "../components/PageShell";
import { accentPalette } from "../data/defaultData";
import { useAppContext } from "../context/AppContext";

export default function SettingsPage() {
  const { currentUserData, updateSettings, exportData, importData, resetProgress } = useAppContext();
  const [importError, setImportError] = useState("");

  if (!currentUserData) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent" />
      </div>
    );
  }

  return (
    <PageShell
      title="Settings"
      description="Tune theme preferences, accent colors, notifications, and data portability for your personal career OS."
    >
      <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <Card hover={false}>
          <h3 className="text-xl font-semibold text-ink dark:text-white">Appearance</h3>
          <div className="mt-5 space-y-5">
            <label className="flex items-center justify-between rounded-3xl border border-slate-200/80 px-4 py-4 dark:border-white/10">
              <div>
                <div className="font-semibold text-ink dark:text-white">Dark mode</div>
                <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">Optional dark theme for late-night focus.</div>
              </div>
              <input
                type="checkbox"
                checked={currentUserData.settings.darkMode}
                onChange={(event) => updateSettings({ darkMode: event.target.checked })}
                className="h-5 w-5 rounded border-slate-300 text-accent focus:ring-accent"
              />
            </label>
            <div>
              <div className="font-semibold text-ink dark:text-white">Accent color</div>
              <div className="mt-3 flex flex-wrap gap-3">
                {Object.keys(accentPalette).map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => updateSettings({ accentColor: key })}
                    className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                      currentUserData.settings.accentColor === key
                        ? "border-accent bg-accent text-white"
                        : "border-slate-200 bg-white text-slate-600 dark:border-white/10 dark:bg-slate-950 dark:text-slate-300"
                    }`}
                  >
                    {key}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>

        <Card hover={false}>
          <h3 className="text-xl font-semibold text-ink dark:text-white">Notifications</h3>
          <div className="mt-5 space-y-4">
            {Object.entries(currentUserData.settings.notifications).map(([key, value]) => (
              <label
                key={key}
                className="flex items-center justify-between rounded-3xl border border-slate-200/80 px-4 py-4 dark:border-white/10"
              >
                <div>
                  <div className="font-semibold capitalize text-ink dark:text-white">{key.replace(/([A-Z])/g, " $1")}</div>
                  <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">Control lightweight reminders and milestone notices.</div>
                </div>
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(event) =>
                    updateSettings({
                      notifications: {
                        [key]: event.target.checked,
                      },
                    })
                  }
                  className="h-5 w-5 rounded border-slate-300 text-accent focus:ring-accent"
                />
              </label>
            ))}
          </div>
        </Card>

        <Card hover={false}>
          <h3 className="text-xl font-semibold text-ink dark:text-white">Data controls</h3>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button onClick={exportData}>Export data as JSON</Button>
            <label className="inline-flex cursor-pointer items-center rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 dark:border-white/10 dark:text-slate-300">
              Import data
              <input
                type="file"
                accept="application/json"
                className="hidden"
                onChange={async (event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  const text = await file.text();
                  const result = importData(text);
                  setImportError(result.ok ? "" : result.message);
                }}
              />
            </label>
            <Button variant="ghost" onClick={resetProgress}>Reset progress</Button>
          </div>
          {importError ? <p className="mt-4 text-sm font-medium text-rose-500">{importError}</p> : null}
        </Card>

        <Card hover={false}>
          <h3 className="text-xl font-semibold text-ink dark:text-white">Workspace health</h3>
          <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
            PM Career OS stores your data locally in the browser. That makes the app fast and personal, while export and import keep you portable.
          </p>
        </Card>
      </div>
    </PageShell>
  );
}
