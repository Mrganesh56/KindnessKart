import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Gift, Camera, MapPin, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { AuthGuard } from '../../components/AuthGuard';
import { useAuthStore } from '../../store/authStore';
import { getSupabase } from '../../lib/supabase';

interface DonationForm {
  type: string;
  title: string;
  description: string;
  pickup_location: string;
  pickup_date: string;
  pickup_time: string;
  images: FileList | null;
}

interface ValidationErrors {
  [key: string]: string;
}

export function NewDonation() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const [formData, setFormData] = useState<DonationForm>({
    type: 'Clothes',
    title: '',
    description: '',
    pickup_location: '',
    pickup_date: '',
    pickup_time: '',
    images: null
  });

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};

    if (formData.title.length < 3) {
      errors.title = 'Title must be at least 3 characters long';
    }
    if (formData.title.length > 255) {
      errors.title = 'Title must not exceed 255 characters';
    }
    if (formData.description.length < 10) {
      errors.description = 'Description must be at least 10 characters long';
    }
    if (!formData.pickup_location) {
      errors.pickup_location = 'Pickup location is required';
    }
    if (!formData.pickup_date) {
      errors.pickup_date = 'Pickup date is required';
    }
    if (!formData.pickup_time) {
      errors.pickup_time = 'Pickup time is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setFormData({ ...formData, images: files });
      
      // Create preview URLs
      const urls = Array.from(files).map(file => URL.createObjectURL(file));
      setPreviewUrls(urls);
    }
  };

  const createNotifications = async (donationId: string) => {
    try {
      const supabase = getSupabase();
      
      // Get all orphanages
      const { data: orphanages } = await supabase
        .from('profiles')
        .select('id, name')
        .eq('role', 'orphanage');

      if (!orphanages || !user) return;

      // Create a notification for each orphanage
      const notifications = orphanages.map(orphanage => ({
        recipient_id: orphanage.id,
        type: 'donation_created',
        title: 'New Donation Available',
        message: `${user.name} has donated ${formData.type}: ${formData.title}`,
        data: {
          donation_id: donationId,
          donor_name: user.name,
          donation_type: formData.type,
          donation_title: formData.title,
          pickup_location: formData.pickup_location,
          pickup_date: formData.pickup_date,
          pickup_time: formData.pickup_time
        },
        read: false
      }));

      const { error } = await supabase.from('notifications').insert(notifications);
      if (error) throw error;
    } catch (error) {
      console.error('Error creating notifications:', error);
      // Don't throw here - we want the donation to succeed even if notifications fail
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const supabase = getSupabase();

      // Create donation record first
      const { data: donation, error: donationError } = await supabase
        .from('donations')
        .insert({
          donor_id: user.id,
          type: formData.type,
          title: formData.title,
          description: formData.description,
          pickup_location: formData.pickup_location,
          status: 'pending'
        })
        .select()
        .single();

      if (donationError) throw donationError;

      // Create notifications for orphanages
      await createNotifications(donation.id);

      // Handle image uploads if present
      if (formData.images && formData.images.length > 0) {
        try {
          // Create storage bucket if it doesn't exist
          const { error: bucketError } = await supabase
            .storage
            .createBucket('donation-images', {
              public: false,
              fileSizeLimit: 10485760, // 10MB
              allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif']
            });

          // Ignore bucket already exists error
          if (bucketError && !bucketError.message.includes('already exists')) {
            throw bucketError;
          }

          const imageUrls = [];
          for (const image of Array.from(formData.images)) {
            const fileName = `${donation.id}/${Date.now()}-${image.name}`;
            const { error: uploadError } = await supabase.storage
              .from('donation-images')
              .upload(fileName, image);

            if (uploadError) throw uploadError;
            imageUrls.push(fileName);
          }

          // Update donation with image URLs
          const { error: updateError } = await supabase
            .from('donations')
            .update({ images: imageUrls })
            .eq('id', donation.id);

          if (updateError) throw updateError;
        } catch (imageError) {
          console.error('Image upload error:', imageError);
          // Don't throw - we want the donation to succeed even if image upload fails
        }
      }

      setSuccess(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      console.error('Donation submission error:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit donation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthGuard allowedRoles={['donor']}>
      <div className="min-h-screen bg-background py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-center mb-8">
                <Gift className="h-12 w-12 text-primary" />
              </div>
              <h1 className="text-3xl font-bold text-center text-secondary mb-8">
                Create New Donation
              </h1>

              {success && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md flex items-center text-green-700">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Donation submitted successfully! Redirecting...
                </div>
              )}

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md flex items-center text-red-700">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-secondary mb-1">
                    Donation Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full rounded-md border-accent shadow-sm focus:border-primary focus:ring-primary"
                  >
                    <option>Clothes</option>
                    <option>Books</option>
                    <option>Toys</option>
                    <option>Electronics</option>
                    <option>Furniture</option>
                    <option>Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className={`w-full rounded-md shadow-sm focus:border-primary focus:ring-primary ${
                      validationErrors.title ? 'border-red-300' : 'border-accent'
                    }`}
                    placeholder="e.g., Winter Clothes Collection"
                  />
                  {validationErrors.title && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.title}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary mb-1">
                    Description
                  </label>
                  <textarea
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className={`w-full rounded-md shadow-sm focus:border-primary focus:ring-primary ${
                      validationErrors.description ? 'border-red-300' : 'border-accent'
                    }`}
                    placeholder="Describe your donation in detail..."
                  />
                  {validationErrors.description && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.description}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary mb-1">
                    Pickup Location
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-accent" />
                    <input
                      type="text"
                      value={formData.pickup_location}
                      onChange={(e) => setFormData({ ...formData, pickup_location: e.target.value })}
                      className={`w-full pl-10 rounded-md shadow-sm focus:border-primary focus:ring-primary ${
                        validationErrors.pickup_location ? 'border-red-300' : 'border-accent'
                      }`}
                      placeholder="Enter pickup address"
                    />
                  </div>
                  {validationErrors.pickup_location && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.pickup_location}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary mb-1">
                      Pickup Date
                    </label>
                    <input
                      type="date"
                      value={formData.pickup_date}
                      onChange={(e) => setFormData({ ...formData, pickup_date: e.target.value })}
                      className={`w-full rounded-md shadow-sm focus:border-primary focus:ring-primary ${
                        validationErrors.pickup_date ? 'border-red-300' : 'border-accent'
                      }`}
                      min={new Date().toISOString().split('T')[0]}
                    />
                    {validationErrors.pickup_date && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.pickup_date}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary mb-1">
                      Pickup Time
                    </label>
                    <input
                      type="time"
                      value={formData.pickup_time}
                      onChange={(e) => setFormData({ ...formData, pickup_time: e.target.value })}
                      className={`w-full rounded-md shadow-sm focus:border-primary focus:ring-primary ${
                        validationErrors.pickup_time ? 'border-red-300' : 'border-accent'
                      }`}
                    />
                    {validationErrors.pickup_time && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.pickup_time}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary mb-1">
                    Images
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-accent border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                      <Camera className="mx-auto h-12 w-12 text-accent" />
                      <div className="flex text-sm text-secondary">
                        <label className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-primary/90">
                          <span>Upload images</span>
                          <input
                            type="file"
                            className="sr-only"
                            multiple
                            accept="image/*"
                            onChange={handleImageChange}
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-accent">PNG, JPG up to 10MB</p>
                    </div>
                  </div>
                  {previewUrls.length > 0 && (
                    <div className="mt-4 grid grid-cols-3 gap-4">
                      {previewUrls.map((url, index) => (
                        <img
                          key={index}
                          src={url}
                          alt={`Preview ${index + 1}`}
                          className="h-24 w-full object-cover rounded-md"
                        />
                      ))}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 disabled:opacity-50"
                >
                  {loading ? (
                    <Loader className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <Gift className="h-5 w-5 mr-2" />
                      Submit Donation
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}