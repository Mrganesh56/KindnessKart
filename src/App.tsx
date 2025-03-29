import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { About } from './pages/About';
import { Contact } from './pages/Contact';
import { Profile } from './pages/Profile';
import { SignIn } from './pages/SignIn';
import { SignUp } from './pages/SignUp';
import { NewDonation } from './pages/donor/NewDonation';
import { DonorDonations } from './pages/donor/OldDonations';
import { DonationDetails } from './pages/DonationDetails';
import { PreRegister } from './pages/PreRegister';
import { DonateNowPage } from './pages/donor/DonateNowPage'; 
import { Dashboard } from './pages/Dashboard';
import { AuthGuard } from './components/AuthGuard';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col w-full bg-gray-50">
        <Navigation />
        <main className="flex-grow w-full">
          <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/signin" element={<SignIn />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/pre-register" element={<PreRegister />} />
              
              {/* Donation Routes */}
              <Route path="/donate" element={<DonateNowPage />} /> {/* For unauthenticated users */}
              <Route path="/donations/:id" element={<DonationDetails />} />

              {/* Protected Routes */}
              <Route
                path="/profile"
                element={
                  <AuthGuard>
                    <Profile />
                  </AuthGuard>
                }
              />
              
              <Route
                path="/donate/new"
                element={
                  <AuthGuard allowedRoles={['donor']}>
                    <NewDonation />
                  </AuthGuard>
                }
              />
              
              <Route
                path="/donor/donations"
                element={
                  <AuthGuard allowedRoles={['donor']}>
                    <DonorDonations />
                  </AuthGuard>
                }
              />
              
              <Route
                path="/orphanage/donations"
                element={
                  <AuthGuard allowedRoles={['orphanage']}>
                    <DonorDonations />
                  </AuthGuard>
                }
              />
          
              <Route
                path="/dashboard"
                element={
                  <AuthGuard>
                    <Dashboard />
                  </AuthGuard>
                }
              />
            </Routes>
          </div>
        </main>
        <Footer />
      </div>
    </Router>
  );
}