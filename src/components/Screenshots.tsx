import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';

const Screenshots = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const media = [
    {
      type: 'image',
      url: 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop',
      title: 'Tank Combat in Action',
      description: 'Navigate through intense battlefield scenarios with precise tank controls'
    },
    {
      type: 'image',
      url: 'https://images.pexels.com/photos/163064/play-stone-network-networked-interactive-163064.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop',
      title: 'Missile System Activated',
      description: 'Unlock guided missiles and eliminate obstacles with strategic precision'
    },
    {
      type: 'image',
      url: 'https://images.pexels.com/photos/194511/pexels-photo-194511.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop',
      title: 'Dynamic Day-Night Cycle',
      description: 'Experience stunning visual transitions as environments change over time'
    },
    {
      type: 'image',
      url: 'https://images.pexels.com/photos/459762/pexels-photo-459762.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop',
      title: 'Obstacle Variety',
      description: 'Face diverse enemies including tanks, jets, helicopters, and infantry'
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
            Get a glimpse of the intense action and stunning visuals that await
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
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
            
            {/* Content */}
            <div className="absolute bottom-0 left-0 right-0 p-8">
              <h3 className="text-2xl md:text-3xl font-orbitron font-bold text-white mb-2">
                {media[currentSlide].title}
              </h3>
              <p className="text-gray-200 text-lg">
                {media[currentSlide].description}
              </p>
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
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
              {item.type === 'video' && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <Play className="w-8 h-8 text-white" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Screenshots;