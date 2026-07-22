import { createContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { checkIsAdmin, logoutAdmin } from '../lib/auth';

interface AuthState {
  session: Session | null;
  admin: boolean;
  loading: boolean;
}

export interface AuthContextValue extends AuthState {
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue>({
  session: null,
  admin: false,
  loading: true,
  refresh: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ session: null, admin: false, loading: true });

  const refresh = useCallback(async () => {
    if (!supabase) {
      setState({ session: null, admin: false, loading: false });
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      setState({ session: null, admin: false, loading: false });
      return;
    }

    const admin = await checkIsAdmin();

    if (!admin) {
      await supabase.auth.signOut();
      setState({ session: null, admin: false, loading: false });
      return;
    }

    setState({ session, admin, loading: false });
  }, []);

  useEffect(() => {
    refresh();

    if (!supabase) return;

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        setState({ session: null, admin: false, loading: false });
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        refresh();
      }
    });

    return () => subscription.unsubscribe();
  }, [refresh]);

  const logout = useCallback(async () => {
    await logoutAdmin();
    setState({ session: null, admin: false, loading: false });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, refresh, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
