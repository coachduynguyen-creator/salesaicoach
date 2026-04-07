import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabaseClient';
import { Profile, Team } from '../types/database';
import { getProfile, getTeam } from '../services/authService';

interface AuthState {
  isLoading: boolean;
  isAuthenticated: boolean;
  user: any | null;
  profile: Profile | null;
  team: Team | null;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthState>({
  isLoading: true,
  isAuthenticated: false,
  user: null,
  profile: null,
  team: null,
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [team, setTeam] = useState<Team | null>(null);

  const loadProfile = useCallback(async () => {
    try {
      const p = await getProfile();
      setProfile(p);
      if (p?.team_id) {
        const t = await getTeam(p.team_id);
        setTeam(t);
      } else {
        setTeam(null);
      }
    } catch {
      setProfile(null);
      setTeam(null);
    }
  }, []);

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile().finally(() => setIsLoading(false));
      } else {
        setIsLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const newUser = session?.user ?? null;
      setUser(newUser);
      if (newUser) {
        loadProfile();
      } else {
        setProfile(null);
        setTeam(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [loadProfile]);

  const refreshProfile = useCallback(async () => {
    await loadProfile();
  }, [loadProfile]);

  return (
    <AuthContext.Provider value={{
      isLoading,
      isAuthenticated: !!user,
      user,
      profile,
      team,
      refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
