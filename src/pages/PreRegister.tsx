import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Building2, Shield, ArrowRight, CheckCircle } from 'lucide-react';

export function PreRegister() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <Heart className="h-16 w-16 text-primary mx-auto mb-4" />
        <h1 className="text-4xl font-bold text-secondary mb-4">
          Register Your Orphanage
        </h1>
        <p className="text-xl text-secondary/80 max-w-2xl mx-auto">
          Join our platform to connect with donors and receive support for your children
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-12 mb-16">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-secondary mb-6">Why Register with Us?</h2>
          <div className="space-y-4">
            {[
              'Connect with verified donors across India',
              'Receive regular donations and support',
              'Track and manage donations efficiently',
              'Build long-term relationships with donors',
              'Showcase your impact and needs',
              'Access a supportive community'
            ].map((point, index) => (
              <div key={index} className="flex items-start">
                <CheckCircle className="h-5 w-5 text-primary mt-1 mr-3 flex-shrink-0" />
                <p className="text-secondary/80">{point}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 space-y-4">
            <Link
              to="/signup"
              className="w-full flex items-center justify-center px-6 py-3 border border-transparent text-lg font-medium rounded-md text-white bg-primary hover:bg-primary/90 transition-colors"
            >
              <Building2 className="h-5 w-5 mr-2" />
              Register Your Orphanage
            </Link>
            <Link
              to="/signin"
              className="w-full flex items-center justify-center px-6 py-3 border border-secondary/20 text-lg font-medium rounded-md text-secondary hover:bg-background transition-colors"
            >
              Already registered? Sign in
            </Link>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-secondary mb-4">Registration Requirements</h3>
            <div className="space-y-4">
              {[
                'Valid registration certificate',
                'Government approved license',
                'Tax exemption documents',
                'Bank account details',
                'Organization details',
                'Contact information'
              ].map((item, index) => (
                <div key={index} className="flex items-center space-x-2 text-secondary/80">
                  <Shield className="h-4 w-4 text-primary" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-secondary mb-4">Platform Benefits</h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">24/7</div>
                <div className="text-secondary/80">Support Available</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">100%</div>
                <div className="text-secondary/80">Secure Platform</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">1000+</div>
                <div className="text-secondary/80">Active Donors</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">50+</div>
                <div className="text-secondary/80">Partner NGOs</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-secondary mb-4">How It Works</h3>
            <div className="space-y-4">
              {[
                'Complete the registration form',
                'Submit required documents',
                'Verification process (24-48 hours)',
                'Profile activation',
                'Start receiving donations'
              ].map((step, index) => (
                <div key={index} className="flex items-center space-x-2 text-secondary/80">
                  <ArrowRight className="h-4 w-4 text-primary" />
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}