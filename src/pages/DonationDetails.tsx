import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Package, Calendar, MapPin, User, Clock, Tag, Phone, Mail, CheckCircle } from 'lucide-react';
import { AuthGuard } from '../components/AuthGuard';
import { getSupabase } from '../lib/supabase';
import { authService } from '../lib/auth';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface DonationDetails {
  id: string;
  title: string;
  type: string;
  description: string;
  pickup_location: string;
  status: string;
  created_at: string;
  images: string[];
  donor: {
    name: string;
    email: string;
    phone: string | null;
  };
  orphanage_id: string | null;
}

export function DonationDetails() {
  const { id } = useParams<{ id: string }>();
  const [donation, setDonation] = useState<DonationDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const session = await authService.getSession();
      if (session?.user?.id) {
        const profile = await authService.getProfile(session.user.id);
        setCurrentUser(profile);
      }
    };
    fetchData();
  }, []);

  const fetchDonationDetails = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const supabase = getSupabase();
      const { data, error } = await supabase
      .from('donations')
      .select(`
        *,
        donor:donor_id (
          name,
          email,
          phone
        )
      `)
      .eq('id', id)
      .single();
    

      if (error || !data) {
        throw new Error('Donation not found');
      }

      setDonation(data);

      if (data?.images?.length > 0) {
        const urls = await Promise.all(
          data.images.map(async (imagePath) => {
            const { data: imageUrl } = await supabase
              .storage
              .from('donation-images')
              .createSignedUrl(imagePath, 3600);
            return imageUrl?.signedUrl || '';
          })
        );
        setImageUrls(urls.filter(url => url));
      }
    } catch (error) {
      console.error('Error fetching donation details:', error);
      if (error instanceof Error) {
        toast.error(error.message || 'Failed to load donation details');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonationDetails();

    const subscription = getSupabase()
      .channel('donation-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'donations',
          filter: `id=eq.${id}`
        },
        () => fetchDonationDetails()
      )
      .subscribe();

    return () => {
      getSupabase().removeChannel(subscription);
    };
  }, [id]);

  const handleAcceptDonation = async () => {
    if (!currentUser?.id || !id) {
      toast.error('You must be logged in to accept donations');
      return;
    }

    try {
      setLoading(true);
      
      const { data: existingDonation, error: fetchError } = await getSupabase()
        .from('donations')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError || !existingDonation) {
        throw new Error('Donation not found in database');
      }

      const { error } = await getSupabase()
        .from('donations')
        .update({ 
          status: 'matched',
          orphanage_id: currentUser.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Donation accepted successfully!');
      fetchDonationDetails();
      
    } catch (error) {
      console.error('Error accepting donation:', error);
      if (error instanceof Error) {
        toast.error(error.message || 'Failed to accept donation');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!donation) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-secondary">Donation not found</h1>
          <button 
            onClick={() => navigate(-1)} 
            className="mt-4 px-4 py-2 bg-primary text-white rounded-md"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const isOrphanage = currentUser?.role === 'orphanage';
  const isDonationOwner = donation.orphanage_id === currentUser?.id;

  return (
    <AuthGuard>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {imageUrls.length > 0 && (
            <div className="relative h-96 bg-gray-100">
              <div className="grid grid-cols-4 gap-4 h-full p-4">
                {imageUrls.map((url, index) => (
                  <div key={index} className="relative rounded-lg overflow-hidden">
                    <img
                      src={url}
                      alt={`Donation ${index + 1}`}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="p-8">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h1 className="text-3xl font-bold text-secondary mb-2">{donation.title}</h1>
                <div className="flex items-center space-x-4 text-secondary/80">
                  <span className="flex items-center">
                    <Tag className="h-4 w-4 mr-1" />
                    {donation.type}
                  </span>
                  <span className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {new Date(donation.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                donation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                donation.status === 'matched' ? 'bg-blue-100 text-blue-800' :
                'bg-green-100 text-green-800'
              }`}>
                {donation.status}
              </span>
            </div>

            {donation.status === 'matched' && isDonationOwner && (
              <div className="mb-6 p-4 bg-green-50 text-green-800 rounded-lg flex items-center">
                <CheckCircle className="h-5 w-5 mr-2" />
                <span>You have accepted this donation</span>
              </div>
            )}

            <div className="mb-8">
              <h2 className="text-xl font-semibold text-secondary mb-4">Description</h2>
              <p className="text-secondary/80 whitespace-pre-wrap">{donation.description}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-secondary">Pickup Details</h2>
                <div className="bg-background rounded-lg p-4 space-y-3">
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 text-primary mt-1 mr-3" />
                    <div>
                      <p className="font-medium text-secondary">Location</p>
                      <p className="text-secondary/80">{donation.pickup_location}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Calendar className="h-5 w-5 text-primary mt-1 mr-3" />
                    <div>
                      <p className="font-medium text-secondary">Posted Date</p>
                      <p className="text-secondary/80">
                        {new Date(donation.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-secondary">Donor Information</h2>
                <div className="bg-background rounded-lg p-4 space-y-3">
                  <div className="flex items-start">
                    <User className="h-5 w-5 text-primary mt-1 mr-3" />
                    <div>
                      <p className="font-medium text-secondary">Name</p>
                      <p className="text-secondary/80">{donation.donor.name}</p>
                    </div>
                  </div>
                  {donation.donor.phone && (
                    <div className="flex items-start">
                      <Phone className="h-5 w-5 text-primary mt-1 mr-3" />
                      <div>
                        <p className="font-medium text-secondary">Phone</p>
                        <p className="text-secondary/80">{donation.donor.phone}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-start">
                    <Mail className="h-5 w-5 text-primary mt-1 mr-3" />
                    <div>
                      <p className="font-medium text-secondary">Email</p>
                      <p className="text-secondary/80">{donation.donor.email}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              {isOrphanage && donation.status === 'pending' && (
                <button 
                  onClick={handleAcceptDonation}
                  disabled={loading}
                  className="px-4 py-2 bg-primary text-white hover:bg-primary/90 rounded-md transition-colors"
                >
                  {loading ? 'Processing...' : 'Accept Donation'}
                </button>
              )}
              
              <button 
                onClick={() => navigate(-1)}
                className="px-4 py-2 border border-primary text-primary hover:bg-primary/10 rounded-md transition-colors"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}