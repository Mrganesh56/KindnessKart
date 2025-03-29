import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, LogIn, Info, Gift, LogOut, Phone, User, Package, Building2, ChevronDown, Calendar, Menu, X } from 'lucide-react';
import { authService } from '../lib/auth'; 
import { getSupabase } from '../lib/supabase';

interface Donor {
  name: string;
}

interface RecentDonation {
  id: string;
  title: string;
  type: string;
  status: string;
  created_at: string;
  donor: Donor[];
}

export function Navigation() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null); // Changed to local state
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [recentDropdownOpen, setRecentDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const recentDropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const isOrphanage = user?.role === 'orphanage';
  const isDonor = user?.role === 'donor';
  const [recentDonations, setRecentDonations] = useState<RecentDonation[]>([]);
  const [loading, setLoading] = useState(false);

  // Navigation links configuration
  const commonLinks = [
    { to: '/about', icon: <Info className="h-5 w-5" />, label: 'About' },
    { to: '/contact', icon: <Phone className="h-5 w-5" />, label: 'Contact' }
  ];

  const donorLinks = [
    { to: '/', icon: <Home className="h-5 w-5" />, label: 'Home' },
    { to: '/dashboard', icon: <Package className="h-5 w-5" />, label: 'Dashboard' },
    { to: '/donate/new', icon: <Gift className="h-5 w-5" />, label: 'Donate Now' },
    ...commonLinks
  ];

  const orphanageLinks = [
    { to: '/dashboard', icon: <Package className="h-5 w-5" />, label: 'Dashboard' },
    ...commonLinks
  ];

  const unauthorizedLinks = [
    { to: '/', icon: <Home className="h-5 w-5" />, label: 'Home' },
    { to: '/donate', icon: <Gift className="h-5 w-5" />, label: 'Why Donate' }, 
    { to: '/about', icon: <Info className="h-5 w-5" />, label: 'About' },
    { to: '/contact', icon: <Phone className="h-5 w-5" />, label: 'Contact' }
  ];

  const links = user ? (isOrphanage ? orphanageLinks : donorLinks) : unauthorizedLinks;

  // Fetch user data on mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const session = await authService.getSession();
        if (session?.user?.id) {
          const profile = await authService.getProfile(session.user.id);
          setUser(profile);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };

    fetchUser();

    // Set up auth state listener
    const { data: { subscription } } = authService.onAuthChange((event) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);
      } else {
        fetchUser();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Rest of your existing useEffect hooks remain the same
  useEffect(() => {
    const fetchRecentDonations = async () => {
      if (!isOrphanage) return;
      
      try {
        setLoading(true);
        const supabase = getSupabase();
        const { data, error } = await supabase
          .from('donations')
          .select(`
            id,
            title,
            type,
            status,
            created_at,
            donor:profiles(name)
          `)
          .order('created_at', { ascending: false })
          .limit(5);

        if (error) throw error;

        const formattedData = (data || []).map((item: any) => ({
          ...item,
          donor: item.donor?.map((donorItem: any) => ({
            name: String(donorItem.name),
          })) || [],
        }));

        setRecentDonations(formattedData);
      } catch (error) {
        console.error('Error fetching donations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentDonations();

    if (isOrphanage) {
      const supabase = getSupabase();
      const subscription = supabase
        .channel('donations')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'donations'
          },
          fetchRecentDonations
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [user, isOrphanage]);

  // Your existing click outside handler remains the same
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
      if (recentDropdownRef.current && !recentDropdownRef.current.contains(event.target as Node)) {
        setRecentDropdownOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Modified handleLogout to use authService directly
  const handleLogout = async () => {
    try {
      await authService.signOut();
      setUser(null);
      navigate('/signin');
      setMobileMenuOpen(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Rest of your component remains the same
  const handleDonationClick = (donationId: string) => {
    setRecentDropdownOpen(false);
    setMobileMenuOpen(false);
    navigate(`/donations/${donationId}`);
  };


  return (
    <nav className="bg-white shadow-sm relative z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to={user ? (isOrphanage ? '/dashboard' : '/') : '/'} className="flex items-center">
              <img
                src="/logo3.png"
                alt="KindnessKart Logo"
                className="h-32 w-auto sm:h-40"
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4 lg:space-x-6">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="flex items-center space-x-1 text-secondary hover:text-primary transition-colors"
              >
                {link.icon}
                <span className="text-sm lg:text-base">{link.label}</span>
              </Link>
            ))}

            {isOrphanage && (
              <div className="relative" ref={recentDropdownRef}>
                <button
                  onClick={() => setRecentDropdownOpen(!recentDropdownOpen)}
                  className="flex items-center space-x-1 text-secondary hover:text-primary transition-colors"
                >
                  <Package className="h-5 w-5" />
                  <span className="text-sm lg:text-base">Recent Activity</span>
                  <ChevronDown className={`h-4 w-4 transform transition-transform ${recentDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {recentDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-72 lg:w-96 bg-white rounded-lg shadow-lg z-50 border border-gray-200">
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-secondary mb-4">Recent Donations</h3>
                      {loading ? (
                        <div className="flex justify-center py-4">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                        </div>
                      ) : recentDonations.length > 0 ? (
                        <div className="space-y-3">
                          {recentDonations.map((donation) => (
                            <button
                              key={donation.id}
                              onClick={() => handleDonationClick(donation.id)}
                              className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg text-left transition-colors"
                            >
                              <div>
                                <p className="text-sm font-medium text-secondary">{donation.title}</p>
                                <div className="flex items-center space-x-2 text-xs text-gray-500">
                                  <span>{donation.type}</span>
                                  <span>•</span>
                                  <span>by {donation.donor[0]?.name || 'Unknown'}</span>
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  <Calendar className="h-3 w-3 inline mr-1" />
                                  {new Date(donation.created_at).toLocaleDateString()}
                                </div>
                              </div>
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                donation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                donation.status === 'matched' ? 'bg-blue-100 text-blue-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {donation.status}
                              </span>
                            </button>
                          ))}
                          <Link
                            to="/dashboard"
                            className="block text-center text-sm text-primary hover:text-primary/90 font-medium pt-3 border-t border-gray-200"
                            onClick={() => setRecentDropdownOpen(false)}
                          >
                            View All Donations
                          </Link>
                        </div>
                      ) : (
                        <div className="text-center py-6 text-gray-500">
                          No recent donations
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {user ? (
              <>
                <Link 
                  to="/profile" 
                  className="flex items-center space-x-1 text-secondary hover:text-primary transition-colors"
                >
                  <User className="h-5 w-5" />
                  <span className="text-sm lg:text-base">Profile</span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="inline-flex items-center px-3 py-1.5 lg:px-4 lg:py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 transition-colors"
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  Sign Out
                </button>
              </>
            ) : (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="inline-flex items-center px-3 py-1.5 lg:px-4 lg:py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 transition-colors"
                >
                  Get Started
                  <ChevronDown className="h-4 w-4 ml-1" />
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                    <div className="py-1">
                      <Link
                        to="/signin"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <LogIn className="h-4 w-4 mr-2" />
                        Login
                      </Link>
                      <Link
                        to="/signup"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <User className="h-4 w-4 mr-2" />
                        Sign Up
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div ref={mobileMenuRef} className="md:hidden bg-white shadow-lg">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.icon}
                <span className="ml-2">{link.label}</span>
              </Link>
            ))}

            {isOrphanage && (
              <>
                <button
                  onClick={() => setRecentDropdownOpen(!recentDropdownOpen)}
                  className="w-full flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50 transition-colors"
                >
                  <Package className="h-5 w-5" />
                  <span className="ml-2">Recent Activity</span>
                  <ChevronDown className={`h-4 w-4 ml-auto transform transition-transform ${recentDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {recentDropdownOpen && (
                  <div className="px-4 py-2 bg-gray-50 rounded-md">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Recent Donations</h3>
                    {loading ? (
                      <div className="flex justify-center py-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                      </div>
                    ) : recentDonations.length > 0 ? (
                      <div className="space-y-2">
                        {recentDonations.map((donation) => (
                          <button
                            key={donation.id}
                            onClick={() => handleDonationClick(donation.id)}
                            className="w-full flex flex-col p-2 hover:bg-gray-100 rounded-md transition-colors"
                          >
                            <p className="text-sm font-medium text-gray-900">{donation.title}</p>
                            <div className="flex items-center text-xs text-gray-500 mt-1">
                              <span>{donation.type}</span>
                              <span className="mx-1">•</span>
                              <span>by {donation.donor[0]?.name || 'Unknown'}</span>
                            </div>
                            <div className="flex items-center text-xs text-gray-500 mt-1">
                              <Calendar className="h-3 w-3 mr-1" />
                              {new Date(donation.created_at).toLocaleDateString()}
                            </div>
                            <div className="mt-1">
                              <span className={`px-2 py-0.5 text-xs rounded-full ${
                                donation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                donation.status === 'matched' ? 'bg-blue-100 text-blue-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {donation.status}
                              </span>
                            </div>
                          </button>
                        ))}
                        <Link
                          to="/dashboard"
                          className="block text-center text-sm text-primary hover:text-primary/90 font-medium pt-2 border-t border-gray-200"
                          onClick={() => {
                            setRecentDropdownOpen(false);
                            setMobileMenuOpen(false);
                          }}
                        >
                          View All Donations
                        </Link>
                      </div>
                    ) : (
                      <div className="text-center py-2 text-sm text-gray-500">
                        No recent donations
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {user && (
              <>
                <Link
                  to="/profile"
                  className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <User className="h-5 w-5" />
                  <span className="ml-2">Profile</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center px-3 py-2 rounded-md text-base font-medium text-white bg-primary hover:bg-primary/90 transition-colors"
                >
                  <LogOut className="h-5 w-5 mr-2" />
                  Sign Out
                </button>
              </>
            )}

            {!user && (
              <div className="pt-2 space-y-1">
                <Link
                  to="/signin"
                  className="block w-full text-center px-3 py-2 rounded-md text-base font-medium text-white bg-primary hover:bg-primary/90 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="block w-full text-center px-3 py-2 rounded-md text-base font-medium text-primary bg-white border border-primary hover:bg-gray-50 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}