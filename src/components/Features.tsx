import React from 'react';
import { Shield, Zap, Target, Gauge, Sun, Gamepad2 } from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Tank Combat System',
      description: 'Control a fully-featured tank with realistic physics, gravity mechanics, and precise jumping controls.',
      color: 'from-sky-400 to-sky-600'
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: 'Smart Missile System',
      description: 'Unlock guided missiles at 1000 points. Auto-targeting system with explosive impacts and strategic gameplay.',
      color: 'from-emerald-400 to-emerald-600'
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: 'Dynamic Obstacles',
      description: 'Face varied enemies: light & heavy tanks, fighter jets, helicopters, and infantry groups with unique behaviors.',
      color: 'from-orange-400 to-orange-600'
    },
    {
      icon: <Sun className="w-8 h-8" />,
      title: 'Day-Night Cycle',
      description: 'Experience stunning visual transitions with dynamic lighting, sun/moon positioning, and color palettes.',
      color: 'from-purple-400 to-purple-600'
    },
    {
      icon: <Gauge className="w-8 h-8" />,
      title: 'Progressive Difficulty',
      description: 'Game speed and obstacle spawn rates increase as you progress, creating endless challenge scaling.',
      color: 'from-red-400 to-red-600'
    },
    {
      icon: <Gamepad2 className="w-8 h-8" />,
      title: 'Pixel Art Graphics',
      description: 'Retro-inspired pixel art with parallax scrolling backgrounds and smooth animations.',
      color: 'from-teal-400 to-teal-600'
    }
  ];

  return (
    <section id="features" className="py-20 relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-orbitron font-bold mb-6">
            <span className="bg-gradient-to-r from-sky-400 to-emerald-400 bg-clip-text text-transparent">
              Game Features
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Experience intense tank warfare with cutting-edge mechanics and stunning visuals
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative bg-gradient-to-b from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:border-gray-600 transition-all duration-300 hover:transform hover:scale-105"
            >
              {/* Gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-transparent to-gray-800/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <div className="relative z-10">
                {/* Icon */}
                <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>

                {/* Title */}
                <h3 className="text-xl font-orbitron font-bold mb-3 text-white group-hover:text-sky-400 transition-colors duration-300">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-gray-300 leading-relaxed">
                  {feature.description}
                </p>
              </div>

              {/* Hover glow effect */}
              <div className={`absolute inset-0 bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-5 rounded-xl transition-opacity duration-300`}></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;