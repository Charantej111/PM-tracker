import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

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

  // Listen for auth state changes (login, logout, token refresh)
  useEffect(() => {
    // Get the initial session on mount
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      setSession(initialSession);
      setUser(initialSession?.user ?? null);
      if (initialSession?.user) {
        fetchProfile(initialSession.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      if (newSession?.user) {
        fetchProfile(newSession.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  /**
   * Sign up with email + password.
   * Inserts the profile row with name/career_goal/target_role via the
   * handle_new_user trigger (name from metadata) + a follow-up update.
   */
  const signUp = async ({ name, email, password, careerGoal, targetRole }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name }, // stored in raw_user_meta_data, trigger reads it
      },
    });

    if (error) return { ok: false, message: error.message };

    const userId = data.user?.id;
    if (userId) {
      // Update the profile row that the trigger auto-created with the extra fields
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
