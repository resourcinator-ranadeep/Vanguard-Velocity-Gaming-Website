import React, { useEffect, useState } from 'react';
import { Play, Download, Zap } from 'lucide-react';
import DownloadDialog from './DownloadDialog';

interface HeroProps {
  onPlayGame: () => void;
}

const Hero: React.FC<HeroProps> = ({ onPlayGame }) => {
  const [animationPhase, setAnimationPhase] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationPhase(1);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const scrollToDownload = () => {
    const element = document.getElementById('download');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleDownloadClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDialogOpen(true);
  };

  return (
    <>
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <div className={`transition-all duration-1000 transform ${
            animationPhase >= 1 ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`}>
            {/* Game Title */}
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-orbitron font-black mb-6">
              <span className="bg-gradient-to-r from-sky-400 via-emerald-400 to-orange-400 bg-clip-text text-transparent animate-gradient">
                VANGUARD
              </span>
              <br />
              <span className="bg-gradient-to-r from-orange-400 via-red-400 to-sky-400 bg-clip-text text-transparent animate-gradient">
                VELOCITY
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Command your tank through endless battlefields. Dodge obstacles, fire missiles, and survive the ultimate endless runner experience.
            </p>

            {/* Key Features Pills */}
            <div className="flex flex-wrap justify-center gap-3 mb-12">
              {[
                { icon: <Zap className="w-4 h-4" />, text: 'Dynamic Environments' },
                { icon: <Play className="w-4 h-4" />, text: 'Endless Action' },
                { icon: <Download className="w-4 h-4" />, text: 'Free to Play' }
              ].map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-2 bg-gradient-to-r from-gray-800/50 to-gray-700/50 backdrop-blur-sm border border-gray-600 rounded-full px-4 py-2 hover:border-sky-400 transition-all duration-300"
                >
                  {feature.icon}
                  <span className="text-sm font-medium">{feature.text}</span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={onPlayGame}
                className="group relative overflow-hidden bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-400 hover:to-sky-500 text-white px-8 py-4 rounded-lg font-bold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-sky-500/25"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                <div className="relative flex items-center space-x-2">
                  <Play className="w-5 h-5" />
                  <span>Play Now</span>
                </div>
              </button>
              
              <button
                onClick={handleDownloadClick}
                className="group bg-transparent border-2 border-emerald-500 hover:bg-emerald-500 text-emerald-400 hover:text-white px-8 py-4 rounded-lg font-bold text-lg transition-all duration-300 transform hover:scale-105"
              >
                <div className="flex items-center space-x-2">
                  <Download className="w-5 h-5" />
                  <span>Download Free</span>
                </div>
              </button>
            </div>

            {/* Game Stats */}
            <div className="grid grid-cols-3 gap-8 mt-16 max-w-lg mx-auto">
              {[
                { number: '10K+', label: 'Players' },
                { number: '50+', label: 'Obstacle Types' },
                { number: '∞', label: 'Levels' }
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl md:text-4xl font-orbitron font-bold text-sky-400 mb-1">
                    {stat.number}
                  </div>
                  <div className="text-gray-400 text-sm font-medium">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-gray-400 rounded-full mt-2 animate-pulse"></div>
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

export default Hero;