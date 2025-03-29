import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

export function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted:', formData);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-secondary mb-4">Contact Us</h1>
        <p className="text-lg text-secondary/80 max-w-2xl mx-auto">
          Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 mb-12">
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <Phone className="h-8 w-8 text-primary mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-secondary mb-2">Phone</h3>
          <p className="text-secondary/80">+91 12345 67890</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <Mail className="h-8 w-8 text-primary mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-secondary mb-2">Email</h3>
          <p className="text-secondary/80">tpolymegaproject@gmail.com</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <MapPin className="h-8 w-8 text-primary mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-secondary mb-2">Address</h3>
          <p className="text-secondary/80">Thakur Polytechnic , Kandivali East , Mumbai 400101</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-8 max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-secondary mb-1">
              Name
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full rounded-md border-accent shadow-sm focus:border-primary focus:ring-primary"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-secondary mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full rounded-md border-accent shadow-sm focus:border-primary focus:ring-primary"
              required
            />
          </div>

          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-secondary mb-1">
              Subject
            </label>
            <input
              type="text"
              id="subject"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="w-full rounded-md border-accent shadow-sm focus:border-primary focus:ring-primary"
              required
            />
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium text-secondary mb-1">
              Message
            </label>
            <textarea
              id="message"
              rows={4}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="w-full rounded-md border-accent shadow-sm focus:border-primary focus:ring-primary"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90"
          >
            <Send className="h-4 w-4 mr-2" />
            Send Message
          </button>
        </form>
      </div>
    </div>
  );
}