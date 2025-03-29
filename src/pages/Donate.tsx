import React, { useState } from 'react';
import { Camera, Upload } from 'lucide-react';
import { AuthGuard } from '../components/AuthGuard';
import { useAuthStore } from '../store/authStore';
import { getSupabase } from '../lib/supabase';

export function Donate() {
  const { user } = useAuthStore();
  const [formData, setFormData] = useState({
    type: 'Clothes',
    title: '',
    description: '',
    pickup_location: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const supabase = getSupabase();
      
      // Validate input lengths before submission
      if (formData.title.length < 3 || formData.title.length > 255) {
        throw new Error('Title must be between 3 and 255 characters');
      }

      if (formData.description.length < 10) {
        throw new Error('Description must be at least 10 characters');
      }

      const { error: donationError } = await supabase
        .from('donations')
        .insert({
          donor_id: user.id,
          type: formData.type,
          title: formData.title,
          description: formData.description,
          pickup_location: formData.pickup_location,
          status: 'pending'
        });

      if (donationError) {
        console.error('Donation error:', donationError);
        throw new Error(donationError.message || 'Failed to submit donation');
      }

      // Reset form on success
      setFormData({
        type: 'Clothes',
        title: '',
        description: '',
        pickup_location: ''
      });
      setSuccess(true);
    } catch (err) {
      console.error('Submit error:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit donation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthGuard allowedRoles={['donor']}>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Make a Donation</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md text-green-600">
              Donation submitted successfully!
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Donation Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500"
              >
                <option>Clothes</option>
                <option>Books</option>
                <option>Toys</option>
                <option>Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500"
                placeholder="e.g., Winter Clothes Collection"
                required
                minLength={3}
                maxLength={255}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500"
                placeholder="Describe your donation in detail..."
                required
                minLength={10}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pickup Location
              </label>
              <input
                type="text"
                value={formData.pickup_location}
                onChange={(e) => setFormData({ ...formData, pickup_location: e.target.value })}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500"
                placeholder="Enter pickup address"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Images
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <Camera className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label className="relative cursor-pointer bg-white rounded-md font-medium text-rose-600 hover:text-rose-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-rose-500">
                      <span>Upload images</span>
                      <input type="file" className="sr-only" multiple accept="image/*" />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
                </div>
              </div>
            </div>

            {error && (
              <div className="text-red-600 text-sm p-4 bg-red-50 border border-red-200 rounded-md">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-rose-500 hover:bg-rose-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 disabled:opacity-50"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <Upload className="h-5 w-5 mr-2" />
                  Submit Donation
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </AuthGuard>
  );
}