import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRecoverySession, setIsRecoverySession] = useState(() => {
    const hash = window.location.hash;
    const search = window.location.search;
    const isRecoveryLink =
      hash.includes("type=recovery") ||
      hash.includes("access_token") ||
      search.includes("type=recovery") ||
      search.includes("access_token");

    const isInRecoveryMode = sessionStorage.getItem("supabase_recovery_mode") === "true";
    const isResetPath = window.location.pathname === "/reset-password";

    if (isRecoveryLink || (isInRecoveryMode && isResetPath)) {
      if (isRecoveryLink) {
        sessionStorage.setItem("supabase_recovery_mode", "true");
      }
      return true;
    }
    return false;
  });

  // Redirect to /reset-password if recovery parameters are present on another route
  useEffect(() => {
    const hash = window.location.hash;
    const search = window.location.search;
    const isRecoveryLink =
      hash.includes("type=recovery") ||
      hash.includes("access_token") ||
      search.includes("type=recovery") ||
      search.includes("access_token");

    const isResetPath = window.location.pathname === "/reset-password";

    if (isRecoveryLink && !isResetPath) {
      console.log("Redirecting recovery link to /reset-password");
      window.location.href = window.location.origin + "/reset-password" + window.location.search + window.location.hash;
    }
  }, []);

  // Fetch the profile row for the currently authenticated user
  const fetchProfile = useCallback(async (userId) => {
    if (!userId) {
      setProfile(null);
      return null;
    }
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching profile:", error.message);
      return null;
    }
    setProfile(data);
    return data;
  }, []);

  // Listen for auth state changes (login, logout, token refresh, recovery)
  useEffect(() => {
    // Get the initial session on mount.
    // If the URL contains a recovery hash or we've previously set recovery mode,
    // we keep isRecoverySession true and don't load the normal authenticated user profile.
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      const hash = window.location.hash;
      const search = window.location.search;
      const isRecoveryLink =
        hash.includes("type=recovery") ||
        hash.includes("access_token") ||
        search.includes("type=recovery") ||
        search.includes("access_token");
      const isResetPath = window.location.pathname === "/reset-password";
      const isInRecoveryMode = sessionStorage.getItem("supabase_recovery_mode") === "true";

      if (isResetPath && (isRecoveryLink || isInRecoveryMode)) {
        setIsRecoverySession(true);
        if (isRecoveryLink || isInRecoveryMode) {
          sessionStorage.setItem("supabase_recovery_mode", "true");
        }
        setSession(initialSession);
        setUser(initialSession?.user ?? null);
        setLoading(false);
      } else {
        setSession(initialSession);
        setUser(initialSession?.user ?? null);
        if (initialSession?.user) {
          fetchProfile(initialSession.user.id).finally(() => setLoading(false));
        } else {
          setLoading(false);
        }
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, newSession) => {
      console.log("PATH:", window.location.pathname);
      console.log("HASH:", window.location.hash);
      console.log("AUTH EVENT:", event);
      console.log("isRecoverySession:", sessionStorage.getItem("supabase_recovery_mode") === "true");
      console.log("SESSION:", newSession);

      if (event === "PASSWORD_RECOVERY") {
        console.log("RECOVERY: true (PASSWORD_RECOVERY triggered)");
        setIsRecoverySession(true);
        sessionStorage.setItem("supabase_recovery_mode", "true");
        setSession(newSession);
        setUser(newSession?.user ?? null);
        setLoading(false);
        return;
      }

      // For other events (like SIGNED_IN, TOKEN_REFRESHED, INITIAL_SESSION),
      // do NOT clear recovery mode if the user is on the /reset-password page
      // and we have a recovery mode flag active in sessionStorage.
      const isResetPath = window.location.pathname === "/reset-password";
      const isInRecoveryMode = sessionStorage.getItem("supabase_recovery_mode") === "true";

      if (isResetPath && isInRecoveryMode) {
        console.log("RECOVERY: true (preserving recovery state during event", event, ")");
        setIsRecoverySession(true);
        setSession(newSession);
        setUser(newSession?.user ?? null);
        setLoading(false);
        return;
      }

      // For all other events, behave normally.
      console.log("RECOVERY: false (event", event, ")");
      setIsRecoverySession(false);
      sessionStorage.removeItem("supabase_recovery_mode");
      setSession(newSession);
      setUser(newSession?.user ?? null);

      if (newSession?.user) {
        fetchProfile(newSession.user.id).finally(() => setLoading(false));
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  /**
   * Sign up with email + password.
   */
  const signUp = async ({ name, email, password, careerGoal, targetRole }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    });

    if (error) return { ok: false, message: error.message };

    const userId = data.user?.id;
    if (userId) {
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ name, email, career_goal: careerGoal, target_role: targetRole })
        .eq("id", userId);

      if (profileError) {
        console.error("Profile update after signup failed:", profileError.message);
      }
      await fetchProfile(userId);
    }

    return { ok: true, user: data.user };
  };

  /**
   * Sign in with email + password.
   */
  const signIn = async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) return { ok: false, message: error.message };

    await fetchProfile(data.user.id);
    return { ok: true, user: data.user };
  };

  const signOut = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setIsRecoverySession(false);
    sessionStorage.removeItem("supabase_recovery_mode");
    setLoading(false);
  };

  /**
   * Clear the recovery mode flag after a successful password update.
   * Called by ResetPasswordPage once updateUser() succeeds.
   */
  const clearRecoveryMode = () => {
    setIsRecoverySession(false);
    sessionStorage.removeItem("supabase_recovery_mode");
    setLoading(false);
  };

  /**
   * Update the profile row in Supabase and refresh local state.
   */
  const updateProfile = async (updates) => {
    if (!user) return { ok: false, message: "Not authenticated" };

    const { error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", user.id);

    if (error) return { ok: false, message: error.message };

    await fetchProfile(user.id);
    return { ok: true };
  };

  const value = {
    user,
    session,
    profile,
    loading,
    isRecoverySession,
    clearRecoveryMode,
    signUp,
    signIn,
    signOut,
    updateProfile,
    fetchProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
