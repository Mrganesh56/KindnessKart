
import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Gift, Users, Clock } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export function Home() {
  const { user } = useAuthStore();

  return (
    <div className="bg-background w-full">
      {/* Hero Section */}
      <div className="relative w-full overflow-hidden">
        <div className="absolute inset-0 w-full">
          <img
            src="https://tse2.mm.bing.net/th?id=OIP.aYO_cqjKbesKYNcQJl4biAHaE8&pid=Api&P=0&h=180"
            alt="Children playing"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/50"></div>
        </div>

        <div className="relative w-full mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 text-center text-white">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 leading-tight">
            Bringing Hearts Together,<br className="hidden sm:inline" /> Spreading Hope
          </h1>
          <p className="text-lg sm:text-xl mb-6 sm:mb-8 max-w-2xl mx-auto px-2 sm:px-0">
            Be part of a caring community of donors and orphanages working to change lives. Your support brings joy and brightens a child's world.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to={user ? "/donate" : "/pre-donate"}
              className="bg-primary text-white px-6 py-3 rounded-md hover:bg-primary/90 inline-flex items-center justify-center"
            >
              <Gift className="h-5 w-5 mr-2" />
              Start Donating
            </Link>
            {!user && (
              <Link
                to="/signup"
                className="bg-white text-primary px-6 py-3 rounded-md hover:bg-gray-100 inline-flex items-center justify-center"
              >
                Join Our Community
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Impact Stats */}
      <div className="bg-white py-12 w-full">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            {[
              { number: '0', label: 'Donations Made', icon: <Gift className="h-8 w-8 text-primary" /> },
              { number: '0', label: 'Partner Orphanages', icon: <Users className="h-8 w-8 text-primary" /> },
              { number: '0', label: 'Children Helped', icon: <Heart className="h-8 w-8 text-primary" /> },
              { number: '24/7', label: 'Support Available', icon: <Clock className="h-8 w-8 text-primary" /> }
            ].map((stat, index) => (
              <div key={index} className="text-center p-4">
                <div className="flex justify-center">{stat.icon}</div>
                <div className="mt-2 text-2xl sm:text-3xl font-bold text-secondary">{stat.number}</div>
                <div className="text-sm sm:text-base text-secondary/80">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Donations */}
      <div className="py-12 sm:py-16 bg-white w-full">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-secondary">Recent Donations</h2>
            <Link 
              to="/donate" 
              className="text-primary hover:text-primary/90 font-medium"
            >
              View All →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[
              {
                image: 'https://tse1.mm.bing.net/th?id=OIP.ivZgnLFkvsgv7cV7uqZ0XgHaGY&pid=Api&P=0&h=180',
                title: "Children's Books",
                type: "Books",
                donor: "Shreya Thakur",
                timeAgo: "2 hours ago"
              },
              {
                image: 'https://images.unsplash.com/photo-1605518216938-7c31b7b14ad0?auto=format&fit=crop&q=80',
                title: "Clothes Donated",
                type: "Clothes",
                donor: "Rohit Sharma",
                timeAgo: "5 hours ago"
              },
              {
                image: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&q=80',
                title: "Toys Set",
                type: "Toys",
                donor: "Sneha Mandal",
                timeAgo: "1 day ago"
              },
              {
                image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&q=80',
                title: "School Supplies Bundle",
                type: "Supplies",
                donor: "Naitik Donda",
                timeAgo: "2 days ago"
              }
            ].map((donation, index) => (
              <div key={index} className="bg-background rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <img
                  src={donation.image}
                  alt={donation.title}
                  className="w-full h-48 sm:h-56 object-cover"
                />
                <div className="p-4">
                  <h3 className="font-semibold text-secondary">{donation.title}</h3>
                  <div className="mt-2 text-sm text-secondary/80 space-y-1">
                    <p>Type: {donation.type}</p>
                    <p>Donor: {donation.donor}</p>
                    <p className="text-primary">{donation.timeAgo}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-primary/10 py-12 sm:py-16 w-full">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-secondary mb-4">Want to Make a Difference?</h2>
          <p className="text-secondary/80 mb-6 sm:mb-8 max-w-2xl mx-auto">
            Be a part of our giving community and help change children's lives for the better.
          </p>
          <Link
            to={user ? "/donate" : "/pre-donate"}
            className="bg-primary text-white px-6 sm:px-8 py-3 rounded-md hover:bg-primary/90 inline-flex items-center justify-center"
          >
            <Heart className="h-5 w-5 mr-2" />
            Start Donating Today
          </Link>
        </div>
      </div>
    </div>
  );
}