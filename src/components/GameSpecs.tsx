import React from 'react';
import { Monitor, Cpu, HardDrive, Wifi } from 'lucide-react';

const GameSpecs = () => {
  const specifications = [
    {
      category: 'Gameplay',
      specs: [
        { label: 'Genre', value: 'Endless Runner / Action' },
        { label: 'Platform', value: 'Web Browser' },
        { label: 'Controls', value: 'Keyboard, Mouse, Touch' },
        { label: 'Game Modes', value: 'Single Player' }
      ]
    },
    {
      category: 'Technical',
      specs: [
        { label: 'Graphics', value: 'Pixel Art / 2D Canvas' },
        { label: 'Physics', value: 'Custom Gravity System' },
        { label: 'Audio', value: 'Dynamic Sound Effects' },
        { label: 'Save System', value: 'Local Storage' }
      ]
    },
    {
      category: 'Features',
      specs: [
        { label: 'Obstacles', value: '6+ Unique Types' },
        { label: 'Missile System', value: 'Auto-targeting' },
        { label: 'Visual Cycle', value: 'Dynamic Day/Night' },
        { label: 'Difficulty', value: 'Progressive Scaling' }
      ]
    }
  ];

  const systemRequirements = [
    {
      icon: <Monitor className="w-6 h-6" />,
      title: 'Display',
      requirement: 'Modern Web Browser'
    },
    {
      icon: <Cpu className="w-6 h-6" />,
      title: 'Processor',
      requirement: 'Any modern CPU'
    },
    {
      icon: <HardDrive className="w-6 h-6" />,
      title: 'Storage',
      requirement: 'No installation required'
    },
    {
      icon: <Wifi className="w-6 h-6" />,
      title: 'Internet',
      requirement: 'Required for initial load'
    }
  ];

  return (
    <section id="specs" className="py-20 bg-gradient-to-b from-gray-900 to-gray-800">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-orbitron font-bold mb-6">
            <span className="bg-gradient-to-r from-emerald-400 to-sky-400 bg-clip-text text-transparent">
              Game Specifications
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Technical details and system requirements for optimal gameplay
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Game Specifications */}
          <div className="space-y-8">
            <h3 className="text-2xl font-orbitron font-bold text-white mb-6">Game Details</h3>
            
            {specifications.map((section, sectionIndex) => (
              <div key={sectionIndex} className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
                <h4 className="text-lg font-bold text-sky-400 mb-4">{section.category}</h4>
                <div className="space-y-3">
                  {section.specs.map((spec, specIndex) => (
                    <div key={specIndex} className="flex justify-between items-center">
                      <span className="text-gray-300">{spec.label}</span>
                      <span className="text-white font-medium">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* System Requirements */}
          <div>
            <h3 className="text-2xl font-orbitron font-bold text-white mb-6">System Requirements</h3>
            
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6 mb-8">
              <div className="space-y-4">
                {systemRequirements.map((req, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-sky-500 to-emerald-500 rounded-lg flex items-center justify-center">
                      {req.icon}
                    </div>
                    <div>
                      <div className="text-white font-medium">{req.title}</div>
                      <div className="text-gray-300 text-sm">{req.requirement}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Performance Stats */}
            <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 backdrop-blur-sm border border-gray-600 rounded-lg p-6">
              <h4 className="text-lg font-bold text-emerald-400 mb-4">Performance</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-orbitron font-bold text-white">60</div>
                  <div className="text-gray-300 text-sm">FPS Target</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-orbitron font-bold text-white">&lt;5MB</div>
                  <div className="text-gray-300 text-sm">File Size</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-orbitron font-bold text-white">0s</div>
                  <div className="text-gray-300 text-sm">Install Time</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-orbitron font-bold text-white">∞</div>
                  <div className="text-gray-300 text-sm">Replayability</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GameSpecs;