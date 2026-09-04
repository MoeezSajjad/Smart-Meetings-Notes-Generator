import React from 'react';
import { Mail, Linkedin, Twitter, Github } from 'lucide-react';

const Footer = () => {
  const handleLinkClick = (e) => {
    e.preventDefault();
    // In a real app, this would navigate to the respective page
    console.log("Navigation placeholder");
  };

  return (
    <footer className="bg-slate-900 dark:bg-slate-950 border-t border-slate-800 transition-colors duration-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
                <span className="text-white font-bold text-lg">M</span>
              </div>
              <span className="text-xl font-bold text-white">Smart Meeting Notes</span>
            </div>
            <p className="text-slate-400 text-sm">
              Transform your meetings into actionable insights with AI-powered documentation.
            </p>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Product</h3>
            <ul className="space-y-2">
              <li><button onClick={handleLinkClick} className="text-slate-400 hover:text-blue-400 transition-colors text-sm">Features</button></li>
              <li><button onClick={handleLinkClick} className="text-slate-400 hover:text-blue-400 transition-colors text-sm">Pricing</button></li>
              <li><button onClick={handleLinkClick} className="text-slate-400 hover:text-blue-400 transition-colors text-sm">Integrations</button></li>
              <li><button onClick={handleLinkClick} className="text-slate-400 hover:text-blue-400 transition-colors text-sm">API</button></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li><button onClick={handleLinkClick} className="text-slate-400 hover:text-blue-400 transition-colors text-sm">About Us</button></li>
              <li><button onClick={handleLinkClick} className="text-slate-400 hover:text-blue-400 transition-colors text-sm">Careers</button></li>
              <li><button onClick={handleLinkClick} className="text-slate-400 hover:text-blue-400 transition-colors text-sm">Blog</button></li>
              <li><button onClick={handleLinkClick} className="text-slate-400 hover:text-blue-400 transition-colors text-sm">Contact</button></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><button onClick={handleLinkClick} className="text-slate-400 hover:text-blue-400 transition-colors text-sm">Privacy Policy</button></li>
              <li><button onClick={handleLinkClick} className="text-slate-400 hover:text-blue-400 transition-colors text-sm">Terms of Service</button></li>
              <li><button onClick={handleLinkClick} className="text-slate-400 hover:text-blue-400 transition-colors text-sm">Security</button></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          <p className="text-slate-400 text-sm">
            © 2026 Smart Meeting Notes Generator. All rights reserved.
          </p>
          
          <div className="flex items-center space-x-4">
            <button className="h-10 w-10 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-colors">
              <Twitter className="h-5 w-5 text-slate-400 hover:text-blue-400" />
            </button>
            <button className="h-10 w-10 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-colors">
              <Linkedin className="h-5 w-5 text-slate-400 hover:text-blue-400" />
            </button>
            <button className="h-10 w-10 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-colors">
              <Github className="h-5 w-5 text-slate-400 hover:text-blue-400" />
            </button>
            <button className="h-10 w-10 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-colors">
              <Mail className="h-5 w-5 text-slate-400 hover:text-blue-400" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;