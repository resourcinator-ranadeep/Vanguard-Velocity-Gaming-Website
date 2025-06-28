import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-gray-900/95 backdrop-blur-md border-b border-gray-700' 
        : 'bg-transparent'
    }`}>
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="tank-logo-container">
              <div className="tank-3d">
                {/* Tank Body */}
                <div className="tank-body">
                  <div className="tank-body-main"></div>
                  <div className="tank-body-side"></div>
                  <div className="tank-body-top"></div>
                </div>
                
                {/* Tank Turret */}
                <div className="tank-turret">
                  <div className="turret-main"></div>
                  <div className="turret-side"></div>
                  <div className="turret-top"></div>
                </div>
                
                {/* Tank Cannon */}
                <div className="tank-cannon"></div>
                
                {/* Tank Tracks */}
                <div className="tank-tracks">
                  <div className="track track-left"></div>
                  <div className="track track-right"></div>
                </div>
                
                {/* Neon Accents */}
                <div className="neon-accent accent-1"></div>
                <div className="neon-accent accent-2"></div>
                <div className="neon-accent accent-3"></div>
              </div>
            </div>
            <span className="text-xl md:text-2xl font-orbitron font-bold bg-gradient-to-r from-sky-400 to-emerald-400 bg-clip-text text-transparent">
              Vanguard Velocity
            </span>
          </div>

          {/* Center Navigation - Desktop */}
          <nav className="hidden md:flex items-center space-x-8">
            {['features', 'specs', 'screenshots', 'download'].map((item) => (
              <button
                key={item}
                onClick={() => scrollToSection(item)}
                className="text-gray-300 hover:text-sky-400 transition-colors duration-200 capitalize font-medium"
              >
                {item}
              </button>
            ))}
          </nav>

          {/* Right side - Bolt Badge + Mobile Menu */}
          <div className="flex items-center space-x-2 md:space-x-4">
            {/* Bolt Badge - Responsive sizing */}
            <a 
              href="https://bolt.new/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="block"
            >
              <img 
                src="/black_circle_360x360.png" 
                alt="Powered by Bolt" 
                className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 hover:scale-110 transition-transform duration-300 cursor-pointer opacity-90 hover:opacity-100"
                title="Powered by Bolt - Click to visit bolt.new"
              />
            </a>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 p-4 bg-gray-800/95 backdrop-blur-md rounded-lg border border-gray-700">
            <nav className="flex flex-col space-y-3">
              {['features', 'specs', 'screenshots', 'download'].map((item) => (
                <button
                  key={item}
                  onClick={() => scrollToSection(item)}
                  className="text-left text-gray-300 hover:text-sky-400 transition-colors duration-200 capitalize font-medium py-2"
                >
                  {item}
                </button>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;