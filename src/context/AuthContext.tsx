import { createContext, useContext, useEffect, useState } from 'react';
import React from 'react';
import { supabase } from '../lib/supabase';
import { dbService } from '../services/dbService';

export interface CustomUser {
  id: string;
  email: string;
  name: string;
  full_name?: string;
  age?: number;
  whatsapp_number?: string;
  role: 'buyer' | 'admin';
  auth_provider: 'email' | 'google';
  avatar_url?: string;
}

interface AuthContextType {
  user: CustomUser | null;
  session: any;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateProfileLocally: (data: Partial<CustomUser>) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
  refreshUser: async () => {},
  updateProfileLocally: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<CustomUser | null>(null);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const resolveUserSession = async (supabaseSession: any) => {
    if (!supabaseSession) {
      // Check for local Admin Session
      const localAdmin = localStorage.getItem("bethebest_admin_session");
      if (localAdmin) {
        try {
          const parsedAdmin = JSON.parse(localAdmin);
          setUser(parsedAdmin);
          setSession({ access_token: 'admin-token', user: parsedAdmin });
          setLoading(false);
          return;
        } catch (e) {
          localStorage.removeItem("bethebest_admin_session");
        }
      }
      setUser(null);
      setSession(null);
      setLoading(false);
      return;
    }

    const sbUser = supabaseSession.user;
    setSession(supabaseSession);

    // Fetch details from profile
    try {
      const profile = await dbService.getUserProfile(sbUser.id);
      if (profile) {
        setUser({
          id: sbUser.id,
          email: sbUser.email || '',
          name: profile.full_name || profile.name || sbUser.user_metadata?.full_name || sbUser.user_metadata?.name || 'User',
          full_name: profile.full_name || sbUser.user_metadata?.full_name || '',
          age: profile.age || sbUser.user_metadata?.age || undefined,
          whatsapp_number: profile.whatsapp_number || sbUser.user_metadata?.whatsapp_number || '',
          role: profile.role || sbUser.user_metadata?.role || 'buyer',
          auth_provider: profile.auth_provider || sbUser.app_metadata?.provider || 'email',
          avatar_url: profile.avatar_url || sbUser.user_metadata?.avatar_url || ''
        });
      } else {
        // No DB record yet, fallback to auth metadata
        const meta = sbUser.user_metadata || {};
        setUser({
          id: sbUser.id,
          email: sbUser.email || '',
          name: meta.full_name || meta.name || 'User',
          full_name: meta.full_name || '',
          age: meta.age || undefined,
          whatsapp_number: meta.whatsapp_number || '',
          role: meta.role || 'buyer',
          auth_provider: sbUser.app_metadata?.provider || 'email',
          avatar_url: meta.avatar_url || ''
        });
      }
    } catch (err) {
      console.error("Error resolving user session profile:", err);
      // Absolute raw fallback
      setUser({
        id: sbUser.id,
        email: sbUser.email || '',
        name: sbUser.user_metadata?.full_name || sbUser.user_metadata?.name || 'User',
        role: 'buyer',
        auth_provider: 'email'
      });
    }

    setLoading(false);
  };

  const refreshUser = async () => {
    const { data: { session: currentSession } } = await supabase.auth.getSession();
    await resolveUserSession(currentSession);
  };

  const updateProfileLocally = (data: Partial<CustomUser>) => {
    if (user) {
      setUser(prev => prev ? { ...prev, ...data } : null);
    }
  };

  const signOut = async () => {
    localStorage.removeItem("bethebest_admin_session");
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.error("Supabase signOut exception:", e);
    }
    setUser(null);
    setSession(null);
    // Force soft refresh of app state
    window.dispatchEvent(new Event("storage"));
  };

  useEffect(() => {
    // Listen for storage events to synchronize admin/signout state across tabs
    const handleStorageChange = () => {
      refreshUser();
    };
    window.addEventListener("storage", handleStorageChange);

    // Initial load
    supabase.auth.getSession().then(({ data: { session } }) => {
      resolveUserSession(session);
    });

    // Sub to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      resolveUserSession(session);
    });

    return () => {
      subscription.unsubscribe();
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut, refreshUser, updateProfileLocally }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
