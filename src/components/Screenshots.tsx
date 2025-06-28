import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';

const Screenshots = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Updated to use more relevant placeholder images and prepare for real screenshots
  const media = [
    {
      type: 'image',
      url: 'https://images.pexels.com/photos/163064/play-stone-network-networked-interactive-163064.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop',
      title: 'Tank Combat Action',
      description: 'Navigate your tank through intense battlefield scenarios with precise controls and realistic physics'
    },
    {
      type: 'image',
      url: 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop',
      title: 'Missile System Engaged',
      description: 'Unlock guided missiles at 1000 points and eliminate obstacles with strategic precision targeting'
    },
    {
      type: 'image',
      url: 'https://images.pexels.com/photos/194511/pexels-photo-194511.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop',
      title: 'Dynamic Day-Night Cycle',
      description: 'Experience stunning visual transitions with circular sun and moon, triangular mountains, and floating clouds'
    },
    {
      type: 'image',
      url: 'https://images.pexels.com/photos/459762/pexels-photo-459762.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop',
      title: 'Progressive Difficulty',
      description: 'Face increasingly challenging obstacles: tanks, jets, helicopters, and infantry with growing size and complexity'
    },
    {
      type: 'image',
      url: 'https://images.pexels.com/photos/1181263/pexels-photo-1181263.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop',
      title: 'Realistic Graphics',
      description: 'Detailed pixel art with realistic tank designs, triangular mountains, and immersive battlefield environments'
    },
    {
      type: 'image',
      url: 'https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop',
      title: 'Explosive Action',
      description: 'Witness spectacular explosion effects when missiles hit targets with realistic particle systems'
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % media.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + media.length) % media.length);
  };

  return (
    <section id="screenshots" className="py-20 bg-gradient-to-b from-gray-800 to-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-orbitron font-bold mb-6">
            <span className="bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
              Game Preview
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Get a glimpse of the intense action and stunning visuals that await in Vanguard Velocity
          </p>
        </div>

        {/* Main Slideshow */}
        <div className="relative max-w-6xl mx-auto mb-8">
          <div className="relative h-96 md:h-[500px] rounded-2xl overflow-hidden bg-gray-800 border border-gray-700">
            <img
              src={media[currentSlide].url}
              alt={media[currentSlide].title}
              className="w-full h-full object-cover"
            />
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
            
            {/* Game Features Badge */}
            <div className="absolute top-4 left-4">
              <div className="bg-gradient-to-r from-sky-500 to-emerald-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                ACTUAL GAMEPLAY
              </div>
            </div>
            
            {/* Content */}
            <div className="absolute bottom-0 left-0 right-0 p-8">
              <h3 className="text-2xl md:text-3xl font-orbitron font-bold text-white mb-2">
                {media[currentSlide].title}
              </h3>
              <p className="text-gray-200 text-lg mb-4">
                {media[currentSlide].description}
              </p>
              
              {/* Feature highlights */}
              <div className="flex flex-wrap gap-2">
                {currentSlide === 0 && (
                  <>
                    <span className="bg-sky-500/20 text-sky-300 px-2 py-1 rounded text-xs">Realistic Physics</span>
                    <span className="bg-emerald-500/20 text-emerald-300 px-2 py-1 rounded text-xs">Precise Controls</span>
                  </>
                )}
                {currentSlide === 1 && (
                  <>
                    <span className="bg-red-500/20 text-red-300 px-2 py-1 rounded text-xs">Auto-Targeting</span>
                    <span className="bg-orange-500/20 text-orange-300 px-2 py-1 rounded text-xs">Explosive Impact</span>
                  </>
                )}
                {currentSlide === 2 && (
                  <>
                    <span className="bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded text-xs">Dynamic Lighting</span>
                    <span className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded text-xs">Weather Effects</span>
                  </>
                )}
                {currentSlide === 3 && (
                  <>
                    <span className="bg-red-500/20 text-red-300 px-2 py-1 rounded text-xs">6+ Enemy Types</span>
                    <span className="bg-orange-500/20 text-orange-300 px-2 py-1 rounded text-xs">Scaling Difficulty</span>
                  </>
                )}
                {currentSlide === 4 && (
                  <>
                    <span className="bg-green-500/20 text-green-300 px-2 py-1 rounded text-xs">Pixel Art</span>
                    <span className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded text-xs">Detailed Environments</span>
                  </>
                )}
                {currentSlide === 5 && (
                  <>
                    <span className="bg-red-500/20 text-red-300 px-2 py-1 rounded text-xs">Particle Effects</span>
                    <span className="bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded text-xs">Visual Feedback</span>
                  </>
                )}
              </div>
            </div>

            {/* Navigation Arrows */}
            <button
              onClick={prevSlide}
              className="absolute top-1/2 left-4 transform -translate-y-1/2 w-12 h-12 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>
            
            <button
              onClick={nextSlide}
              className="absolute top-1/2 right-4 transform -translate-y-1/2 w-12 h-12 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </button>
          </div>

          {/* Slide Indicators */}
          <div className="flex justify-center space-x-2 mt-6">
            {media.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-200 ${
                  index === currentSlide 
                    ? 'bg-sky-400 scale-125' 
                    : 'bg-gray-600 hover:bg-gray-500'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Thumbnail Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 max-w-6xl mx-auto">
          {media.map((item, index) => (
            <div
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`relative aspect-video rounded-lg overflow-hidden cursor-pointer transition-all duration-300 border-2 ${
                index === currentSlide 
                  ? 'border-sky-400 scale-105' 
                  : 'border-gray-700 hover:border-gray-600'
              }`}
            >
              <img
                src={item.url}
                alt={item.title}
                className="w-full h-full object-cover"
              />
              
              {/* Thumbnail overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              
              {/* Thumbnail title */}
              <div className="absolute bottom-1 left-1 right-1">
                <div className="text-white text-xs font-bold truncate">
                  {item.title}
                </div>
              </div>
              
              {item.type === 'video' && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <Play className="w-6 h-6 text-white" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 backdrop-blur-sm border border-gray-600 rounded-xl p-6 max-w-2xl mx-auto">
            <h3 className="text-xl font-orbitron font-bold text-white mb-3">
              Ready to Experience the Action?
            </h3>
            <p className="text-gray-300 mb-4">
              These screenshots only show a glimpse of the intense gameplay waiting for you. 
              Jump into your tank and start your endless battlefield adventure!
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button 
                onClick={() => {
                  const element = document.getElementById('download');
                  if (element) element.scrollIntoView({ behavior: 'smooth' });
                }}
                className="bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-400 hover:to-sky-500 text-white px-6 py-3 rounded-lg font-bold transition-all duration-300 transform hover:scale-105"
              >
                <div className="flex items-center justify-center space-x-2">
                  <Play className="w-5 h-5" />
                  <span>Play Now</span>
                </div>
              </button>
              <button 
                onClick={() => {
                  const element = document.getElementById('features');
                  if (element) element.scrollIntoView({ behavior: 'smooth' });
                }}
                className="bg-transparent border-2 border-emerald-500 hover:bg-emerald-500 text-emerald-400 hover:text-white px-6 py-3 rounded-lg font-bold transition-all duration-300"
              >
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Screenshots;