import React from "react";
import { Link } from "react-router-dom"; // Import Link for navigation

export function Footer() {
  return (
    <footer className="bg-secondary text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2">
              <img
                src="/logo4.png"
                alt="KindnessKart Logo"
                className="h-32 w-32" 
              />
            </div>
            <p className="mt-2 text-sm text-accent">Making a difference together.</p>
          </div>
          <div>
            <h3 className="font-semibold mb-3">Quick Links</h3>
            <ul className="space-y-2 text-sm text-accent">
              <li>
                <Link to="/" className="hover:text-primary">Home</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-primary">About Us</Link>
              </li>
              <li>
                <Link to="/donate" className="hover:text-primary">Donate Now</Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-3">Contact</h3>
            <ul className="space-y-2 text-sm text-accent">
              <li>Email: tpolymegaproject@gmail.com</li>
              <li>Phone: 83293 55641</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-3">Follow Us</h3>
            <div className="flex space-x-4">
              <a href="#" className="text-accent hover:text-primary">Twitter</a>
              <a href="#" className="text-accent hover:text-primary">Facebook</a>
              <a href="#" className="text-accent hover:text-primary">Instagram</a>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-accent/20 text-center text-accent">
          <p>© 2024 KindnessKart. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}