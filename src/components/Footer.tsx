import React from 'react';
import { Target, Twitter, Mail, Heart } from 'lucide-react';

const Footer = () => {
  const socialLinks = [
    { icon: <Twitter className="w-5 h-5" />, href: '#', label: 'Twitter' },
    { icon: <Mail className="w-5 h-5" />, href: '#', label: 'Contact' }
  ];

  const footerLinks = [
    {
      title: 'Game',
      links: [
        { text: 'Play Now', href: '#' },
        { text: 'Download', href: '#' },
        { text: 'System Requirements', href: '#specs' },
        { text: 'Screenshots', href: '#screenshots' }
      ]
    },
    {
      title: 'Support',
      links: [
        { text: 'Help Center', href: '#' },
        { text: 'Bug Reports', href: '#' },
        { text: 'Feature Requests', href: '#' },
        { text: 'Community', href: '#' }
      ]
    },
    {
      title: 'Legal',
      links: [
        { text: 'Privacy Policy', href: '#' },
        { text: 'Terms of Service', href: '#' },
        { text: 'Cookie Policy', href: '#' },
        { text: 'DMCA', href: '#' }
      ]
    }
  ];

  return (
    <footer className="bg-black border-t border-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-sky-400 to-sky-600 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-orbitron font-bold bg-gradient-to-r from-sky-400 to-emerald-400 bg-clip-text text-transparent">
                Vanguard Velocity
              </span>
            </div>
            <p className="text-gray-400 leading-relaxed max-w-md">
              The ultimate tank endless runner experience. Command your tank through endless battlefields and become the ultimate survivor.
            </p>
            
            {/* Social Links */}
            <div className="flex space-x-4 mt-6">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  aria-label={social.label}
                  className="w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center justify-center transition-colors duration-200 hover:text-sky-400"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Footer Links */}
          {footerLinks.map((section, index) => (
            <div key={index}>
              <h4 className="text-lg font-orbitron font-bold text-white mb-4">
                {section.title}
              </h4>
              <ul className="space-y-3">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <a
                      href={link.href}
                      className="text-gray-400 hover:text-sky-400 transition-colors duration-200"
                    >
                      {link.text}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
            {/* Left side - Bolt Logo + Copyright */}
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <a 
                href="https://bolt.new/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block"
              >
                <img 
                  src="/logotext_poweredby_360w.png" 
                  alt="Powered by Bolt" 
                  className="h-6 sm:h-7 md:h-8 hover:scale-105 transition-transform duration-300 cursor-pointer opacity-80 hover:opacity-100"
                  title="Powered by Bolt - Click to visit bolt.new"
                />
              </a>
              <div className="text-gray-400 text-sm text-center sm:text-left">
                © 2024 Vanguard Velocity. All rights reserved.
              </div>
            </div>
            
            {/* Right side - Made with love */}
            <div className="flex items-center space-x-1 text-gray-400 text-sm">
              <span>Made with</span>
              <Heart className="w-4 h-4 text-red-500" />
              <span>for gamers worldwide</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;