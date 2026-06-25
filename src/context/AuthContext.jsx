import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  /**
   * true while the current session was established via a PASSWORD_RECOVERY
   * email link.  Guards (ProtectedRoute / PublicOnlyRoute) must NOT treat this
   * as a normal authenticated session.  Cleared once the user successfully
   * calls updateUser() with a new password.
   */
  const [isRecoverySession, setIsRecoverySession] = useState(false);

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
    // If the URL contains a recovery hash, Supabase will have already
    // exchanged it — onAuthStateChange will fire PASSWORD_RECOVERY shortly.
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      // Don't set user/session here if this looks like a recovery link;
      // onAuthStateChange will handle it with the correct event type.
      const hash = window.location.hash;
      const isRecoveryLink =
        hash.includes("type=recovery") || hash.includes("access_token");

      if (!isRecoveryLink) {
        setSession(initialSession);
        setUser(initialSession?.user ?? null);
        if (initialSession?.user) {
          fetchProfile(initialSession.user.id).finally(() => setLoading(false));
        } else {
          setLoading(false);
        }
      }
      // If it IS a recovery link, keep loading=true until the
      // PASSWORD_RECOVERY event fires so guards don't redirect prematurely.
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, newSession) => {
      if (event === "PASSWORD_RECOVERY") {
        // Recovery session — mark it as such and DO NOT treat it as a normal
        // login.  Guards will check isRecoverySession before redirecting.
        setIsRecoverySession(true);
        setSession(newSession);
        setUser(newSession?.user ?? null);
        setLoading(false);
        // Deliberately skip fetchProfile — the user hasn't logged in normally.
        return;
      }

      // For all other events, behave normally.
      setIsRecoverySession(false);
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

  /**
   * Sign out — clears session and profile state.
   */
  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setIsRecoverySession(false);
  };

  /**
   * Clear the recovery mode flag after a successful password update.
   * Called by ResetPasswordPage once updateUser() succeeds.
   */
  const clearRecoveryMode = () => setIsRecoverySession(false);

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
