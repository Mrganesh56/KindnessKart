
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Clock, CheckCircle, XCircle, MapPin, Calendar, User, Box } from 'lucide-react';
import { AuthGuard } from '../components/AuthGuard';
import { authService } from '../lib/auth';
import { getSupabase } from '../lib/supabase';
import { toast } from 'react-toastify';
import type { Donation, UserProfile, Session } from '../lib/auth';

interface DashboardStats {
  total: number;
  pending: number;
  matched: number;
  completed: number;
}

export function Dashboard() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    total: 0,
    pending: 0,
    matched: 0,
    completed: 0
  });
  const navigate = useNavigate();

  const isDonor = user?.role === 'donor';

  const fetchData = async () => {
    try {
      setLoading(true);
      const session = await authService.getSession();
      setSession(session);

      if (!session?.user?.id) {
        throw new Error('No session found');
      }

      const profile = await authService.getProfile(session.user.id);
      if (!profile) {
        throw new Error('Profile not found');
      }
      setUser(profile);

      const donations = await authService.getDonations(session.user.id, profile.role);
      setDonations(donations || []);

      setStats({
        total: donations.length,
        pending: donations.filter(d => d.status === 'pending').length,
        matched: donations.filter(d => d.status === 'matched').length,
        completed: donations.filter(d => d.status === 'completed').length
      });

    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load donations');
      setDonations([]);
      setStats({ total: 0, pending: 0, matched: 0, completed: 0 });
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptDonation = async (donationId: string) => {
    if (!user?.id) {
      toast.error('You must be logged in to accept donations');
      return;
    }

    try {
      setLoading(true);
      
      // Verify donation exists first
      const { data: donation, error: fetchError } = await getSupabase()
        .from('donations')
        .select('*')
        .eq('id', donationId)
        .single();

      if (fetchError || !donation) {
        throw new Error('Donation not found in database');
      }

      // Update donation status
      const { error } = await getSupabase()
        .from('donations')
        .update({ 
          status: 'matched',
          orphanage_id: user.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', donationId);

      if (error) throw error;
      
      toast.success('Donation accepted successfully!');
      navigate(`/donations/${donationId}`);
      
    } catch (error) {
      console.error('Error accepting donation:', error);
      toast.error(error.message || 'Failed to accept donation');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let subscription: any;
    
    const setupRealtimeUpdates = async () => {
      const session = await authService.getSession();
      if (!session?.user?.id) return;

      const supabase = getSupabase();
      subscription = supabase
        .channel('donations-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'donations',
            filter: isDonor 
              ? `donor_id=eq.${session.user.id}`
              : `orphanage_id=eq.${session.user.id}`
          },
          () => fetchData()
        )
        .subscribe();
    };

    fetchData();
    setupRealtimeUpdates();

    return () => {
      if (subscription) {
        getSupabase().removeChannel(subscription);
      }
    };
  }, [user?.id, isDonor]);

  if (loading && donations.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'matched': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'clothes': return '👕';
      case 'books': return '📚';
      case 'toys': return '🧸';
      case 'furniture': return '🪑';
      case 'electronics': return '📱';
      default: return '🎁';
    }
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold">
              Welcome, <span className="text-primary">{user?.name || 'User'}</span>
            </h1>
            <p className="text-gray-600">Manage your donations and requests</p>
          </div>
          <div className="badge badge-primary badge-lg">
            {isDonor ? 'Donor' : 'Orphanage'}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Donations', value: stats.total, icon: <Package className="w-5 h-5" /> },
            { label: 'Pending', value: stats.pending, icon: <Clock className="w-5 h-5" /> },
            { label: 'Matched', value: stats.matched, icon: <CheckCircle className="w-5 h-5" /> },
            { label: 'Completed', value: stats.completed, icon: <XCircle className="w-5 h-5" /> },
          ].map((stat, i) => (
            <div key={i} className="card bg-white shadow-sm hover:shadow-md transition-shadow">
              <div className="card-body p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <div className="text-primary p-3 rounded-full bg-primary/10">
                    {stat.icon}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {isDonor ? 'Your Donations' : 'Available Donations'}
          </h2>
          
          {donations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {donations.map((donation) => (
                <div key={donation.id} className="card bg-white shadow-sm hover:shadow-md transition-shadow">
                  <div className="card-body p-5">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">{getTypeIcon(donation.type || '')}</span>
                        <div>
                          <h3 className="font-bold text-lg line-clamp-1">
                            {donation.title || 'Untitled Donation'}
                          </h3>
                          <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(donation.status)}`}>
                            {donation.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 mt-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Box className="w-4 h-4 mr-2" />
                        <span>Type: {donation.type || 'Unknown'}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>
                          {donation.created_at ? 
                            new Date(donation.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            }) : 
                            'Unknown date'}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span className="line-clamp-1">{donation.pickup_location || 'Unknown location'}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <User className="w-4 h-4 mr-2" />
                        <span>
                          {isDonor
                            ? (donation.orphanage?.name || 'Not matched yet')
                            : (donation.donor?.name || 'Anonymous donor')}
                        </span>
                      </div>
                    </div>

                    {!isDonor && donation.status === 'pending' && (
                      <div className="mt-4 pt-3 border-t border-gray-100">
                        <button 
                          onClick={() => handleAcceptDonation(donation.id)}
                          className="btn btn-primary btn-sm w-full"
                          disabled={loading}
                        >
                          {loading ? 'Processing...' : 'Accept Donation'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card bg-white shadow-sm">
              <div className="card-body">
                <div className="text-center p-8">
                  <Package className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                  <h3 className="text-lg font-medium text-gray-700 mb-1">
                    No donations found
                  </h3>
                  <p className="text-gray-500">
                    {isDonor 
                      ? "You haven't made any donations yet."
                      : "There are no available donations right now."}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}