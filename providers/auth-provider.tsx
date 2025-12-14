import { AuthContext } from "@/hooks/use-auth-context";
import { supabase } from "@/lib/supabase";
import type { Session } from "@supabase/supabase-js";
import { PropsWithChildren, useCallback, useEffect, useState } from "react";

export default function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | undefined | null>();
  const [profile, setProfile] = useState<any>();
  // isLoading is ONLY for initial auth check, not for profile loading
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch the session once, and subscribe to auth state changes
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error("Error fetching session:", error);
          // If refresh token is invalid, sign out and clear session
          if (
            error.message?.includes("Refresh Token") ||
            error.name === "AuthApiError"
          ) {
            await supabase.auth.signOut();
            setSession(null);
          }
        } else {
          setSession(session);
        }
      } catch (err) {
        console.error("Session fetch error:", err);
        setSession(null);
      }

      // Only set isLoading to false after initial auth check
      setIsLoading(false);
    };

    fetchSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log("Auth state changed:", { event: _event, session });

      // Handle token refresh errors
      if (_event === "TOKEN_REFRESHED" && !session) {
        await supabase.auth.signOut();
      }

      setSession(session);
    });

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Fetch profile without affecting isLoading state
  const fetchProfile = useCallback(async () => {
    if (session) {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      setProfile(data);
    } else {
      setProfile(null);
    }
  }, [session]);

  // Fetch the profile when the session changes
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return (
    <AuthContext.Provider
      value={{
        session,
        isLoading,
        profile,
        isLoggedIn: !!session,
        refreshProfile: fetchProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
