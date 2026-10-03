import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { AuthError, User as SupabaseUser } from '@supabase/supabase-js';
import type { PlatformRole, User, UserRole } from '@/types/saas';
import { isSupabaseConfigured, requireSupabase, supabase } from '@/lib/supabase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; name: string; companyName: string }) => Promise<boolean>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function mapUser(authUser: SupabaseUser, profile?: Record<string, unknown> | null, platformRoles: PlatformRole[] = []): User {
  const metadata = authUser.user_metadata || {};
  const profileRole = profile?.role;
  const role: UserRole = profileRole === 'admin' || profileRole === 'manager' ? profileRole : 'client';
  return {
    id: authUser.id,
    email: authUser.email || '',
    name: String(profile?.full_name || metadata.full_name || ''),
    role,
    platformRoles: profileRole === 'admin' && !platformRoles.includes('admin') ? [...platformRoles, 'admin'] : platformRoles,
    avatar: String(profile?.avatar_url || metadata.avatar_url || ''),
    companyId: typeof profile?.company_id === 'string' ? profile.company_id : undefined,
    companyName: typeof profile?.company_name === 'string' ? profile.company_name : typeof metadata.company_name === 'string' ? metadata.company_name : undefined,
    companyPhone: typeof profile?.company_phone === 'string' ? profile.company_phone : undefined,
    planId: typeof profile?.plan_id === 'string' ? profile.plan_id : 'plan_pro',
    aiCreditsRemaining: typeof profile?.ai_credits_remaining === 'number' ? profile.ai_credits_remaining : 0,
    status: profile?.status === 'overdue' || profile?.status === 'canceled' || profile?.status === 'trialing' ? profile.status : 'active',
    mrr: 0,
    joinedAt: authUser.created_at,
  };
}

function throwAuthError(error: AuthError | null) {
  if (error) throw new Error(error.message);
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async (authUser: SupabaseUser | null) => {
    if (!authUser) {
      setUser(null);
      return;
    }
    const client = requireSupabase();
    const [{ data, error }, { data: platformAccess, error: accessError }] = await Promise.all([
      client.from('spartan_profiles')
      .select('full_name, company_id, company_name, company_phone, role, status, avatar_url, plan_id, ai_credits_remaining')
      .eq('id', authUser.id).maybeSingle(),
      client.from('spartan_platform_access').select('access_role').eq('user_id', authUser.id),
    ]);
    if (error) throw error;
    if (accessError) console.warn('Platform access roles could not be loaded; check that Supabase migrations are current.', accessError.message);
    const platformRoles = (platformAccess || []).map(row => row.access_role).filter((role): role is PlatformRole => role === 'admin' || role === 'developer');
    setUser(mapUser(authUser, data, platformRoles));
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) { setLoading(false); return; }
    const client = supabase;
    let active = true;
    client.auth.getSession().then(async ({ data, error }) => {
      try {
        if (error) throw error;
        await loadUser(data.session?.user ?? null);
      } catch (cause) {
        console.error('Could not load Supabase session', cause);
        if (active) setUser(null);
      } finally {
        if (active) setLoading(false);
      }
    });
    const { data: listener } = client.auth.onAuthStateChange((_event, session) => {
      queueMicrotask(() => {
        loadUser(session?.user ?? null).catch(cause => {
          console.error('Could not load user profile', cause);
          if (active) setUser(null);
        }).finally(() => { if (active) setLoading(false); });
      });
    });
    return () => { active = false; listener.subscription.unsubscribe(); };
  }, [loadUser]);

  useEffect(() => {
    if (!user || !supabase) return;
    const channel = supabase.channel(`profile-${user.id}`).on('postgres_changes', {
      event: 'UPDATE', schema: 'public', table: 'spartan_profiles', filter: `id=eq.${user.id}`,
    }, event => {
      const profile = event.new as Record<string, unknown>;
      void supabase!.from('spartan_platform_access').select('access_role').eq('user_id', user.id).then(({ data, error }) => {
        if (error) console.warn('Platform access roles could not be refreshed.', error.message);
        const platformRoles = error ? undefined : (data || []).map(row => row.access_role).filter((role): role is PlatformRole => role === 'admin' || role === 'developer');
        setUser(previous => previous ? mapUser({
          id: previous.id, email: previous.email, created_at: previous.joinedAt, user_metadata: { company_name: previous.companyName },
        } as unknown as SupabaseUser, profile, platformRoles || previous.platformRoles || []) : previous);
      });
    }).subscribe();
    return () => { void supabase!.removeChannel(channel); };
  }, [user?.id]);

  const login = async (email: string, password: string) => {
    const client = requireSupabase();
    const { data, error } = await client.auth.signInWithPassword({ email: email.trim(), password });
    throwAuthError(error);
    if (data.user) {
      try {
        await loadUser(data.user);
      } catch (profileError) {
        await client.auth.signOut();
        const detail = profileError instanceof Error ? profileError.message : '';
        throw new Error(`A senha foi aceita, mas o perfil não pôde ser carregado. Aplique a migration do Supabase (npx supabase db push) e tente novamente.${detail ? ` Detalhe: ${detail}` : ''}`);
      }
    }
  };

  const register = async ({ email, password, name, companyName }: { email: string; password: string; name: string; companyName: string }): Promise<boolean> => {
    const { data, error } = await requireSupabase().auth.signUp({
      email: email.trim(), password,
      options: { data: { full_name: name.trim(), company_name: companyName.trim() } },
    });
    throwAuthError(error);
    return Boolean(data.session);
  };

  const resetPassword = async (email: string) => {
    const { error } = await requireSupabase().auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/login`,
    });
    throwAuthError(error);
  };

  const logout = async () => {
    const { error } = await requireSupabase().auth.signOut();
    throwAuthError(error);
  };

  const updateUserProfile = async (data: Partial<User>) => {
    if (!user) return;
    const patch = {
      ...(data.name !== undefined ? { full_name: data.name } : {}),
      ...(data.companyName !== undefined ? { company_name: data.companyName } : {}),
      ...(data.companyPhone !== undefined ? { company_phone: data.companyPhone } : {}),
      ...(data.avatar !== undefined ? { avatar_url: data.avatar } : {}),
      ...(data.planId !== undefined ? { plan_id: data.planId } : {}),
    };
    if (Object.keys(patch).length) {
      const { error } = await requireSupabase().from('spartan_profiles').update(patch).eq('id', user.id);
      if (error) throw error;
    }
    setUser({ ...user, ...data, role: user.role, companyId: user.companyId });
  };

  return <AuthContext.Provider value={{ user, loading, login, register, resetPassword, logout, updateUserProfile }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
