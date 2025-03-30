
import { getSupabase } from './supabase';
import type { Session, User } from '@supabase/supabase-js';
import type { Database } from './database.types';

type UserProfile = Database['public']['Tables']['profiles']['Row'];
type Donation = Database['public']['Tables']['donations']['Row'];

export const authService = {

  async signIn(email: string, password: string): Promise<{ session: Session; user: UserProfile }> {
    const { data, error } = await getSupabase().auth.signInWithPassword({ email, password });
    if (error) throw error;
    if (!data.session) throw new Error('No session returned');
    
    const profile = await this.getProfile(data.session.user.id);
    return { session: data.session, user: profile };
  },

  async signUp(
    email: string,
    password: string,
    profileData: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>
  ): Promise<{ user: User; profile: UserProfile }> {
    // Create auth user
    const { data: authData, error: authError } = await getSupabase().auth.signUp({ 
      email, 
      password,
      options: {
        data: {
          name: profileData.name,
          role: profileData.role
        }
      }
    });
    if (authError) throw authError;
    if (!authData.user) throw new Error('User creation failed');

    // Create profile
    const { data: profile, error: profileError } = await getSupabase()
      .from('profiles')
      .insert({ 
        id: authData.user.id,
        email,
        ...profileData 
      })
      .select()
      .single();

    if (profileError) throw profileError;
    return { user: authData.user, profile: profile! };
  },

  async signOut(): Promise<void> {
    const { error } = await getSupabase().auth.signOut();
    if (error) throw error;
  },

  // Session Management
  async getSession(): Promise<Session | null> {
    const { data, error } = await getSupabase().auth.getSession();
    if (error) throw error;
    return data.session;
  },

  async refreshSession(): Promise<Session> {
    const { data, error } = await getSupabase().auth.refreshSession();
    if (error) throw error;
    if (!data.session) throw new Error('No session returned');
    return data.session;
  },

  // User Profile
  async getProfile(userId: string): Promise<UserProfile> {
    const { data, error } = await getSupabase()
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    if (!data) throw new Error('Profile not found');
    return data;
  },

  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    const { data, error } = await getSupabase()
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error('Profile not updated');
    return data;
  },

  // Donations
  async getDonations(userId: string, role: 'donor' | 'orphanage'): Promise<Donation[]> {
    let query = getSupabase()
      .from('donations')
      .select(`
        *,
        donor:profiles!donor_id(name, email, phone),
        orphanage:profiles!orphanage_id(name)
      `);

    if (role === 'donor') {
      query = query.eq('donor_id', userId);
    } else {
      query = query.or(`and(status.eq.pending,orphanage_id.is.null),orphanage_id.eq.${userId}`);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  // Auth State Listener
  onAuthChange(callback: (event: 'SIGNED_IN' | 'SIGNED_OUT', session: Session | null) => void) {
    return getSupabase().auth.onAuthStateChange(callback);
  }
};

export type { UserProfile, Donation };