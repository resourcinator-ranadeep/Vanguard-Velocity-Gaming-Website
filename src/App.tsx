import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Features from './components/Features';
import GameSpecs from './components/GameSpecs';
import Screenshots from './components/Screenshots';
import Download from './components/Download';
import Footer from './components/Footer';
import GameCanvas from './components/GameCanvas';

function App() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [showGame, setShowGame] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handlePlayGame = () => {
    setShowGame(true);
  };

  const handleCloseGame = () => {
    setShowGame(false);
  };

  if (showGame) {
    return <GameCanvas onClose={handleCloseGame} />;
  }

  return (
    <div className={`min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 transition-opacity duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
      {/* Animated background pattern */}
      <div className="fixed inset-0 opacity-5 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,_#0EA5E9_0%,_transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_75%,_#10B981_0%,_transparent_50%)]"></div>
      </div>
      
      <div className="relative z-10">
        <Header />
        <Hero onPlayGame={handlePlayGame} />
        <Features />
        <GameSpecs />
        <Screenshots />
        <Download onPlayGame={handlePlayGame} />
        <Footer />
      </div>
    </div>
  );
}

export default App;