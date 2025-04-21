
import { Link } from 'react-router-dom';
import { Heart, Gift, ArrowRight, CheckCircle } from 'lucide-react';

export function DonateNowPage() {  // Changed from PreDonate to DonateNowPage
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <Heart className="h-16 w-16 text-primary mx-auto mb-4" />
        <h1 className="text-4xl font-bold text-secondary mb-4">
          Join Our Community of Donors
        </h1>
        <p className="text-xl text-secondary/80 max-w-2xl mx-auto">
          Your contribution, big or small, helps bring real change to children's lives.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-12 mb-16">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-secondary mb-6">Why Donate Through Us?</h2>
          <div className="space-y-4">
            {[
              'Your support directly changes children\'s lives across India',
              'We ensure complete transparency, so you can track your donations',
              'Connect with trusted orphanages and see where your help goes',
              'Strengthen local communities by supporting meaningful initiatives',
              'Get tax benefits under Section 80G',
              'Stay updated on the impact your generosity is making'
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
              <Gift className="h-5 w-5 mr-2" />
              Create Donor Account
            </Link>
            <Link
              to="/signin"
              className="w-full flex items-center justify-center px-6 py-3 border border-secondary/20 text-lg font-medium rounded-md text-secondary hover:bg-gray-50 transition-colors"
            >
              Already have an account? Sign in
            </Link>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-secondary mb-4">What Can You Donate?</h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                'School supplies and uniforms',
                'Books and stationery',
                'Sports gear and equipment',
                'Educational toys and games',
                'Food and nutritional support',
                'Hygiene essentials',
                'Furniture to orphanages',
                'Medical supplies'
              ].map((item, index) => (
                <div key={index} className="flex items-center space-x-2 text-secondary/80">
                  <ArrowRight className="h-4 w-4 text-primary" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-secondary mb-4">Impact Statistics</h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">0</div>
                <div className="text-secondary/80">Children Supported</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">0</div>
                <div className="text-secondary/80">Partner Orphanages</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">0</div>
                <div className="text-secondary/80">Indian States</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">0</div>
                <div className="text-secondary/80">Donations Made</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}