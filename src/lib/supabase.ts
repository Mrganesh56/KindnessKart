import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase credentials are missing. Please click the "Connect to Supabase" button in the top right corner to set up your project.'
  );
}

// Create a single supabase instance
const supabaseInstance = supabaseUrl && supabaseAnonKey
  ? createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      },
      db: {
        schema: 'public'
      },
      global: {
        headers: {
          'x-my-custom-header': 'my-app-name'
        }
      }
    })
  : null;

// Helper function to ensure supabase client exists
export function getSupabase() {
  if (!supabaseInstance) {
    throw new Error(
      'Supabase client is not initialized. Please connect to Supabase using the "Connect to Supabase" button.'
    );
  }
  return supabaseInstance;
}

// Utility function to handle Supabase errors
export function handleSupabaseError(error: any): never {
  console.error('Supabase error:', error);
  throw new Error(error.message || 'An unexpected error occurred');
}

// Helper function to safely execute Supabase queries
export async function executeQuery<T>(
  queryFn: () => Promise<{ data: T | null; error: any }>
): Promise<T> {
  try {
    const { data, error } = await queryFn();
    if (error) {
      handleSupabaseError(error);
    }
    if (!data) {
      throw new Error('No data returned from query');
    }
    return data;
  } catch (error) {
    handleSupabaseError(error);
  }
}

/**
 * Updates the status of a donation and optionally assigns it to an orphanage
 * @param donationId The ID of the donation to update
 * @param status The new status ('pending' | 'matched' | 'completed' | 'cancelled')
 * @param orphanageId Optional orphanage ID to assign the donation to
 * @returns The updated donation record
 */
export async function updateDonationStatus(
  donationId: string,
  status: 'pending' | 'matched' | 'completed' | 'cancelled',
  orphanageId?: string
) {
  const supabase = getSupabase();
  const updates = {
    status,
    updated_at: new Date().toISOString(),
    ...(orphanageId && { orphanage_id: orphanageId })
  };

  const { data, error } = await supabase
    .from('donations')
    .update(updates)
    .eq('id', donationId)
    .select();

  if (error) {
    handleSupabaseError(error);
  }

  if (!data) {
    throw new Error('No data returned after donation status update');
  }

  return data[0];
}

/**
 * Gets a donation by ID with related donor and orphanage information
 * @param donationId The ID of the donation to fetch
 * @returns The donation record with expanded donor and orphanage profiles
 */
export async function getDonationWithDetails(donationId: string) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('donations')
    .select(`
      *,
      donor:profiles(name, email, phone),
      orphanage:profiles(name)
    `)
    .eq('id', donationId)
    .single();

  if (error) {
    handleSupabaseError(error);
  }

  return data;
}

/**
 * Creates a new notification
 * @param recipientId The user ID who should receive the notification
 * @param type The type of notification
 * @param title The notification title
 * @param message The notification message
 * @param data Additional data to store with the notification
 * @returns The created notification record
 */
export async function createNotification(
  recipientId: string,
  type: 'donation_created' | 'donation_matched' | 'donation_completed',
  title: string,
  message: string,
  data?: Record<string, unknown>
) {
  const supabase = getSupabase();
  const { data: notification, error } = await supabase
    .from('notifications')
    .insert({
      recipient_id: recipientId,
      type,
      title,
      message,
      data,
      read: false
    })
    .select()
    .single();

  if (error) {
    handleSupabaseError(error);
  }

  return notification;
}