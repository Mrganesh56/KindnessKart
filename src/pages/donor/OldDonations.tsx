import React, { useState, useEffect } from 'react';
import { Package, Filter, Search } from 'lucide-react';
import { AuthGuard } from '../../components/AuthGuard';
import { useAuthStore } from '../../store/authStore';
import { getSupabase } from '../../lib/supabase';

interface Donation {
  id: string;
  title: string;
  type: string;
  description: string;
  status: string;
  created_at: string;
  pickup_location: string;
}

export function DonorDonations() {
  const { user } = useAuthStore();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchDonations = async () => {
      try {
        const supabase = getSupabase();
        let query = supabase
          .from('donations')
          .select('*')
          .eq('donor_id', user?.id)
          .order('created_at', { ascending: false });

        if (filter !== 'all') {
          query = query.eq('status', filter);
        }

        if (search) {
          query = query.ilike('title', `%${search}%`);
        }

        const { data, error } = await query;

        if (error) throw error;
        setDonations(data || []);
      } catch (error) {
        console.error('Error fetching donations:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDonations();
    }
  }, [user, filter, search]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <AuthGuard allowedRoles={['donor']}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-secondary">Your Donations</h1>
          <p className="text-secondary/80 mt-1">Track and manage your donations</p>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-secondary" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="rounded-md border-accent shadow-sm focus:border-primary focus:ring-primary"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="matched">Matched</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
          <div className="relative">
            <Search className="h-5 w-5 text-secondary/60 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search donations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 rounded-md border-accent shadow-sm focus:border-primary focus:ring-primary w-full md:w-64"
            />
          </div>
        </div>

        {/* Donations List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-accent/20">
              <thead>
                <tr className="bg-background">
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary/80 uppercase tracking-wider">
                    Donation
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary/80 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary/80 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary/80 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary/80 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-accent/20">
                {donations.map((donation) => (
                  <tr key={donation.id} className="hover:bg-background/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Package className="h-5 w-5 text-primary mr-3" />
                        <div>
                          <div className="text-sm font-medium text-secondary">{donation.title}</div>
                          <div className="text-sm text-secondary/60">{donation.description.substring(0, 50)}...</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-secondary">{donation.type}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        donation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        donation.status === 'matched' ? 'bg-blue-100 text-blue-800' :
                        donation.status === 'completed' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {donation.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-secondary">{donation.pickup_location}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-secondary">
                        {new Date(donation.created_at).toLocaleDateString()}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}