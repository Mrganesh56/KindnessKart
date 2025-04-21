
import { Heart, Users, Target, Award } from 'lucide-react';

export function About() {
  return (
    <div className="space-y-16">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">About KindnessKart</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
        Our goal is to connect generous donors with orphanages, making it simple to bring positive change to children's lives.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          {
            icon: <Heart className="h-8 w-8 text-rose-500" />,
            title: 'Our Mission',
            description: 'Bringing donors and orphanages together to provide support where it’s needed most. '
          },
          {
            icon: <Users className="h-8 w-8 text-rose-500" />,
            title: 'Community',
            description: 'Building a strong, caring network of people and organizations working together for a better future.'
          },
          {
            icon: <Target className="h-8 w-8 text-rose-500" />,
            title: 'Impact',
            description: 'Making a real difference in childrens lives by ensuring help reaches them in the best way possible. '
          },
          {
            icon: <Award className="h-8 w-8 text-rose-500" />,
            title: 'Trust',
            description: 'Keeping every donation transparent and accountable, so you know your support is making a real impact.'
          }
        ].map((item, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="flex justify-center mb-4">{item.icon}</div>
            <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
            <p className="text-gray-600">{item.description}</p>
          </div>
        ))}
      </div>

      <div className="bg-rose-50 rounded-lg p-8">
        <h2 className="text-3xl font-bold text-center mb-8">Our Impact</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="text-4xl font-bold text-rose-500 mb-2">0</div>
            <div className="text-gray-600">Successful Donations</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-rose-500 mb-2">0</div>
            <div className="text-gray-600">Partner Orphanages</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-rose-500 mb-2">0</div>
            <div className="text-gray-600">Children Helped</div>
          </div>
        </div>
      </div>
    </div>
  );
}