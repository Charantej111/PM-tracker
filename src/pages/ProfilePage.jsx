import { Camera, RotateCcw } from "lucide-react";
import { useMemo, useState } from "react";
import Button from "../components/Button";
import Card from "../components/Card";
import InputField from "../components/InputField";
import PageShell from "../components/PageShell";
import { useAppContext, ACHIEVEMENTS_LIST } from "../context/AppContext";

export default function ProfilePage() {
  const { currentUser, currentUserData, dashboardMetrics, updateProfile, resetProgress, getInitials } = useAppContext();
  const [form, setForm] = useState({
    name: currentUser.name,
    careerGoal: currentUserData.profileMeta.careerGoal,
    targetRole: currentUserData.profileMeta.targetRole,
  });

  const totalStudyHours = useMemo(
    () => currentUserData.learning.items.reduce((sum, item) => sum + item.timeSpent, 0),
    [currentUserData.learning.items],
  );

  const handleAvatar = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => updateProfile({ avatar: reader.result });
    reader.readAsDataURL(file);
  };

  return (
    <PageShell
      title="Profile"
      description="Shape the personal story behind your dashboard, from goal setting to your public-facing PM narrative."
    >
      <div className="grid gap-4 xl:grid-cols-[0.85fr_1.15fr]">
        <Card hover={false}>
          <div className="flex flex-col items-center text-center">
            {currentUser.avatar ? (
              <img src={currentUser.avatar} alt={currentUser.name} className="h-28 w-28 rounded-[28px] object-cover" />
            ) : (
              <div className="flex h-28 w-28 items-center justify-center rounded-[28px] bg-accent text-3xl font-bold text-white">
                {getInitials(currentUser.name)}
              </div>
            )}
            <label className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600 dark:bg-slate-900 dark:text-slate-300">
              <Camera className="h-4 w-4" />
              Upload avatar
              <input type="file" accept="image/*" onChange={handleAvatar} className="hidden" />
            </label>
            <h3 className="mt-5 text-2xl font-semibold text-ink dark:text-white">{currentUser.name}</h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{currentUserData.profileMeta.targetRole}</p>
            <div className="mt-6 grid w-full gap-3 sm:grid-cols-2">
              {[
                { label: "Learning streak", value: `${dashboardMetrics.currentStreak} days` },
                { label: "Total study hours", value: `${totalStudyHours}h` },
                { label: "Completed skills", value: dashboardMetrics.completedSkills },
                { label: "Active projects", value: dashboardMetrics.activeProjects },
              ].map((item) => (
                <div key={item.label} className="rounded-3xl bg-slate-50 px-4 py-4 text-left dark:bg-slate-900">
                  <div className="text-sm text-slate-500 dark:text-slate-400">{item.label}</div>
                  <div className="mt-2 text-xl font-semibold text-ink dark:text-white">{item.value}</div>
                </div>
              ))}
            </div>
            {currentUserData.achievements?.length > 0 && (
              <div className="mt-6 w-full border-t border-slate-100 pt-6 dark:border-white/5">
                <h4 className="text-left text-sm font-semibold text-slate-500 dark:text-slate-400 mb-3">Unlocked Badges</h4>
                <div className="flex flex-wrap gap-2 justify-start">
                  {currentUserData.achievements.map((achId) => {
                    const ach = ACHIEVEMENTS_LIST.find((a) => a.id === achId);
                    if (!ach) return null;
                    return (
                      <div
                        key={ach.id}
                        title={ach.desc}
                        className="flex items-center gap-1.5 rounded-2xl bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:bg-slate-900 dark:text-slate-300 border border-slate-200/40 dark:border-white/5 transition hover:scale-105"
                      >
                        <span className="text-base">{ach.icon}</span>
                        <span>{ach.title}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </Card>
        <Card hover={false}>
          <div className="grid gap-5">
            <InputField
              label="Name"
              value={form.name}
              onChange={(event) => setForm((previous) => ({ ...previous, name: event.target.value }))}
            />
            <InputField
              label="Career Goal"
              as="textarea"
              rows={3}
              value={form.careerGoal}
              onChange={(event) => setForm((previous) => ({ ...previous, careerGoal: event.target.value }))}
            />
            <InputField
              label="Target Role"
              value={form.targetRole}
              onChange={(event) => setForm((previous) => ({ ...previous, targetRole: event.target.value }))}
            />
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => updateProfile(form)}>Save profile</Button>
              <Button variant="ghost" onClick={resetProgress}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset progress
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </PageShell>
  );
}
