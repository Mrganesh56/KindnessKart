import React, { useState, useEffect } from 'react';
import { User, Save } from 'lucide-react';
import { AuthGuard } from '../components/AuthGuard';
import { authService } from '../lib/auth'; // Changed from useAuthStore
import { getSupabase } from '../lib/supabase';

export function Profile() {
  const [user, setUser] = useState<any>(null); // Local user state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Load user data on component mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const session = await authService.getSession();
        if (session?.user) {
          const profile = await authService.getProfile(session.user.id);
          setUser(profile);
          
          // Initialize form data
          setFormData({
            name: profile?.name || '',
            email: profile?.email || session.user.email || '',
            phone: profile?.phone || '',
            address: profile?.address || '',
            description: profile?.description || ''
          });
        }
      } catch (err) {
        console.error('Error loading user:', err);
        setError('Failed to load user data');
      }
    };

    loadUser();

    // Set up auth state listener
    const { data: { subscription } } = authService.onAuthChange((event) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);
      } else {
        loadUser();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const supabase = getSupabase();
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          name: formData.name,
          phone: formData.phone,
          address: formData.address,
          description: formData.description,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (updateError) throw updateError;
      setSuccess('Profile updated successfully!');
    } catch (err) {
      console.error('Update error:', err);
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthGuard>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Profile Settings</h1>
            <div className="flex items-center space-x-2 text-gray-500">
              <User className="h-5 w-5" />
              <span className="text-sm font-medium capitalize">{user?.role}</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-group">
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full p-2 border rounded"
                required
              />
            </div>

            <div className="form-group">
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                disabled
                className="w-full p-2 border rounded bg-gray-100"
              />
            </div>

            <div className="form-group">
              <label className="block text-sm font-medium mb-1">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full p-2 border rounded"
              />
            </div>

            <div className="form-group">
              <label className="block text-sm font-medium mb-1">Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                className="w-full p-2 border rounded"
              />
            </div>

            <div className="form-group">
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full p-2 border rounded"
                placeholder={user?.role === 'orphanage' 
                  ? 'Tell us about your orphanage...' 
                  : 'Tell us about yourself...'}
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-600 rounded text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="p-3 bg-green-50 text-green-600 rounded text-sm">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? (
                <span className="animate-spin">↻</span>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </AuthGuard>
  );
}