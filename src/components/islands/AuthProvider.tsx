import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { supabase } from '@/lib/supabase';

interface UserData {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  is_admin: boolean;
}

interface AuthContextType {
  user: UserData | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
  initialUser?: UserData | null;
}

export default function AuthProvider({ children, initialUser = null }: AuthProviderProps) {
  const [user, setUser] = useState<UserData | null>(initialUser);
  const [isLoading, setIsLoading] = useState(!initialUser);

  // Fetch user from server (reads httpOnly cookies)
  const fetchUserFromServer = async (): Promise<UserData | null> => {
    try {
      const response = await fetch('/api/auth/get-session');
      const { user: serverUser } = await response.json();
      
      if (!serverUser) {
        return null;
      }

      // Fetch additional profile data
      const { data: profile } = await supabase
        .from('customer_profiles')
        .select('full_name')
        .eq('id', serverUser.id)
        .single();

      return {
        id: serverUser.id,
        email: serverUser.email || '',
        full_name: profile?.full_name || serverUser.user_metadata?.full_name,
        is_admin: serverUser.user_metadata?.is_admin === true || 
                  serverUser.user_metadata?.role === 'admin',
      };
    } catch (error) {
      console.error('Error fetching user from server:', error);
      return null;
    }
  };

  // Refresh user data from server
  const refreshUser = async () => {
    setIsLoading(true);
    const userData = await fetchUserFromServer();
    setUser(userData);
    setIsLoading(false);
  };

  // Sign out - clears cookies via API
  const signOut = async () => {
    // Immediately clear local state for instant UI feedback
    setUser(null);
    
    // Also call SDK signOut to clear any in-memory state
    try {
      await supabase.auth.signOut();
    } catch {
      // Ignore errors - the important part is clearing cookies
    }
    
    // Redirect to logout endpoint to clear httpOnly cookies
    window.location.href = '/api/auth/logout';
  };

  useEffect(() => {
    // If no initial user, fetch from server
    if (!initialUser) {
      fetchUserFromServer().then((userData) => {
        setUser(userData);
        setIsLoading(false);
      });
    }

    // Listen for auth state changes (mainly for password recovery flow)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: string, session: { access_token: string; refresh_token: string } | null) => {
        console.log('Auth event:', event);

        if (event === 'PASSWORD_RECOVERY' && session) {
          // User came from password recovery link
          // Only sync session to cookies (needed for password change to work)
          // BUT don't update the UI - user should complete password change first
          try {
            await fetch('/api/auth/set-session', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                access_token: session.access_token,
                refresh_token: session.refresh_token,
              }),
            });
            // Don't call refreshUser() here - wait until password is changed
          } catch (error) {
            console.error('Error syncing recovery session:', error);
          }
        }

        if (event === 'SIGNED_IN' && session) {
          // Sync new session to server (for client-side login flows)
          try {
            await fetch('/api/auth/set-session', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                access_token: session.access_token,
                refresh_token: session.refresh_token,
              }),
            });
            await refreshUser();
          } catch (error) {
            console.error('Error syncing session:', error);
          }
        }

        if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, signOut, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}
