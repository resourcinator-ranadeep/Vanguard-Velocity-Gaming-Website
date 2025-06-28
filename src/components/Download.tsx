import React, { useState } from 'react';
import { Download, Play, Globe, Smartphone, Monitor } from 'lucide-react';
import DownloadDialog from './DownloadDialog';

interface DownloadSectionProps {
  onPlayGame?: () => void;
}

const DownloadSection: React.FC<DownloadSectionProps> = ({ onPlayGame }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleDownloadClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDialogOpen(true);
  };

  const handlePlayNowClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onPlayGame) {
      onPlayGame();
    }
  };

  const platforms = [
    {
      icon: <Globe className="w-8 h-8" />,
      name: 'Web Browser',
      description: 'Play instantly in any modern browser',
      action: 'Play Now',
      primary: true,
      color: 'from-sky-500 to-sky-600 hover:from-sky-400 hover:to-sky-500',
      isDownload: false
    },
    {
      icon: <Monitor className="w-8 h-8" />,
      name: 'Desktop',
      description: 'Download for Windows, Mac, Linux',
      action: 'Download',
      primary: false,
      color: 'from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500',
      isDownload: true
    },
    {
      icon: <Smartphone className="w-8 h-8" />,
      name: 'Mobile',
      description: 'Optimized for touch devices',
      action: 'Get App',
      primary: false,
      color: 'from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500',
      isDownload: true
    }
  ];

  const stats = [
    { number: '10,000+', label: 'Active Players' },
    { number: '4.8/5', label: 'User Rating' },
    { number: '99.9%', label: 'Uptime' },
    { number: 'FREE', label: 'Cost' }
  ];

  return (
    <>
      <section id="download" className="py-20 bg-gradient-to-b from-gray-900 to-black">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-orbitron font-bold mb-6">
              <span className="bg-gradient-to-r from-sky-400 to-emerald-400 bg-clip-text text-transparent">
                Start Playing Today
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Join thousands of players in the ultimate tank endless runner experience. Free to play, easy to start!
            </p>
          </div>

          {/* Platform Cards */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {platforms.map((platform, index) => (
              <div
                key={index}
                className={`relative group bg-gradient-to-b from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 text-center hover:border-gray-600 transition-all duration-300 ${
                  platform.primary ? 'scale-105 border-sky-500' : 'hover:scale-105'
                }`}
              >
                {platform.primary && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-sky-500 to-emerald-500 text-white px-4 py-1 rounded-full text-sm font-bold">
                      RECOMMENDED
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <div className={`w-16 h-16 bg-gradient-to-r ${platform.color} rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    {platform.icon}
                  </div>
                  <h3 className="text-xl font-orbitron font-bold text-white mb-2">
                    {platform.name}
                  </h3>
                  <p className="text-gray-300">
                    {platform.description}
                  </p>
                </div>

                <button 
                  onClick={platform.isDownload ? handleDownloadClick : handlePlayNowClick}
                  className={`w-full bg-gradient-to-r ${platform.color} text-white py-3 px-6 rounded-lg font-bold transition-all duration-300 transform hover:scale-105 hover:shadow-xl`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    {platform.action === 'Play Now' ? <Play className="w-5 h-5" /> : <Download className="w-5 h-5" />}
                    <span>{platform.action}</span>
                  </div>
                </button>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-orbitron font-bold text-sky-400 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-300 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <DownloadDialog 
        isOpen={isDialogOpen} 
        onClose={() => setIsDialogOpen(false)} 
      />
    </>
  );
};

export default DownloadSection;