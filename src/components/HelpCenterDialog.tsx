import React, { useState } from 'react';
import { X, ChevronDown, ChevronRight, HelpCircle, Zap, Shield, Target, Gamepad2, Monitor, Download } from 'lucide-react';

interface HelpCenterDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  icon: React.ReactNode;
}

const HelpCenterDialog: React.FC<HelpCenterDialogProps> = ({ isOpen, onClose }) => {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const faqData: FAQItem[] = [
    {
      id: 'gameplay-1',
      category: 'Gameplay',
      icon: <Gamepad2 className="w-4 h-4" />,
      question: 'How do I control my tank in Vanguard Velocity?',
      answer: 'Use WASD or arrow keys to move your tank. Press SPACE to jump over obstacles, and use your mouse to aim and fire missiles (unlocked at 1000 points). The tank features realistic physics with gravity mechanics for precise control.'
    },
    {
      id: 'gameplay-2',
      category: 'Gameplay',
      icon: <Target className="w-4 h-4" />,
      question: 'When do I unlock the missile system?',
      answer: 'The guided missile system unlocks automatically when you reach 1000 points. Once unlocked, missiles will auto-target the nearest obstacle and provide explosive impact effects. This adds a strategic layer to your survival gameplay.'
    },
    {
      id: 'gameplay-3',
      category: 'Gameplay',
      icon: <Shield className="w-4 h-4" />,
      question: 'What types of obstacles will I encounter?',
      answer: 'You\'ll face 6+ unique obstacle types: light tanks, heavy tanks, fighter jets, helicopters, infantry groups, and various buildings. Each has different behaviors, sizes, and movement patterns that become more challenging as you progress.'
    },
    {
      id: 'technical-1',
      category: 'Technical',
      icon: <Monitor className="w-4 h-4" />,
      question: 'What are the system requirements?',
      answer: 'Vanguard Velocity runs in any modern web browser with no installation required. You need an internet connection for the initial load, but the game runs smoothly on any device with basic processing power. Target performance is 60 FPS.'
    },
    {
      id: 'technical-2',
      category: 'Technical',
      icon: <Download className="w-4 h-4" />,
      question: 'Do I need to download anything to play?',
      answer: 'No downloads required! Vanguard Velocity is a web-based game that loads instantly in your browser. The entire game is under 5MB and uses local storage to save your progress automatically.'
    },
    {
      id: 'technical-3',
      category: 'Technical',
      icon: <Zap className="w-4 h-4" />,
      question: 'Why does the game speed increase over time?',
      answer: 'The progressive difficulty system automatically increases game speed and obstacle spawn rates as you advance. This creates an endless challenge that scales with your skill level, ensuring the game remains engaging and competitive.'
    },
    {
      id: 'features-1',
      category: 'Features',
      icon: <HelpCircle className="w-4 h-4" />,
      question: 'What is the day-night cycle feature?',
      answer: 'The dynamic day-night cycle provides stunning visual transitions with realistic sun/moon positioning, changing color palettes, and atmospheric lighting effects. This creates an immersive battlefield environment that evolves as you play.'
    },
    {
      id: 'features-2',
      category: 'Features',
      icon: <Target className="w-4 h-4" />,
      question: 'How does the scoring system work?',
      answer: 'You earn points by surviving longer, destroying obstacles with missiles, and maintaining momentum. Your high score is automatically saved locally. The missile system unlocks at 1000 points, adding strategic gameplay elements.'
    },
    {
      id: 'general-1',
      category: 'General',
      icon: <Shield className="w-4 h-4" />,
      question: 'Is Vanguard Velocity really free to play?',
      answer: 'Yes! Vanguard Velocity is completely free with no hidden costs, in-app purchases, or premium features. We believe in providing the full gaming experience to everyone without barriers.'
    },
    {
      id: 'general-2',
      category: 'General',
      icon: <Monitor className="w-4 h-4" />,
      question: 'Can I play on mobile devices?',
      answer: 'Absolutely! The game is optimized for touch devices with responsive controls. Whether you\'re on desktop, tablet, or smartphone, you\'ll get the same high-quality gaming experience with intuitive touch controls.'
    }
  ];

  const categories = [
    { id: 'all', name: 'All Topics', icon: <HelpCircle className="w-4 h-4" /> },
    { id: 'Gameplay', name: 'Gameplay', icon: <Gamepad2 className="w-4 h-4" /> },
    { id: 'Technical', name: 'Technical', icon: <Monitor className="w-4 h-4" /> },
    { id: 'Features', name: 'Features', icon: <Zap className="w-4 h-4" /> },
    { id: 'General', name: 'General', icon: <Shield className="w-4 h-4" /> }
  ];

  const toggleExpanded = (id: string) => {
    setExpandedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const filteredFAQ = selectedCategory === 'all' 
    ? faqData 
    : faqData.filter(item => item.category === selectedCategory);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Dialog */}
      <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-sky-500/50 rounded-2xl max-w-4xl w-full max-h-[90vh] shadow-2xl overflow-hidden">
        {/* Animated border glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-sky-500/20 via-emerald-500/20 to-purple-500/20 rounded-2xl blur-xl animate-pulse"></div>
        
        {/* Header */}
        <div className="relative z-10 border-b border-gray-700/50 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-sky-400 to-emerald-400 rounded-lg flex items-center justify-center">
                <HelpCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-orbitron font-bold">
                  <span className="bg-gradient-to-r from-sky-400 to-emerald-400 bg-clip-text text-transparent">
                    Help Center
                  </span>
                </h2>
                <p className="text-gray-400 text-sm font-mono">KNOWLEDGE_DATABASE.EXE</p>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="w-10 h-10 bg-gray-700/50 hover:bg-gray-600/50 rounded-lg flex items-center justify-center transition-colors group"
            >
              <X className="w-5 h-5 text-gray-400 group-hover:text-white" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex h-[calc(90vh-120px)]">
          {/* Sidebar - Categories */}
          <div className="w-64 border-r border-gray-700/50 p-4 overflow-y-auto">
            <h3 className="text-sm font-orbitron font-bold text-gray-300 mb-4 uppercase tracking-wider">
              Categories
            </h3>
            <div className="space-y-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 text-left ${
                    selectedCategory === category.id
                      ? 'bg-gradient-to-r from-sky-500/20 to-emerald-500/20 border border-sky-500/30 text-sky-400'
                      : 'hover:bg-gray-700/30 text-gray-300 hover:text-white'
                  }`}
                >
                  {category.icon}
                  <span className="font-medium">{category.name}</span>
                  {selectedCategory === category.id && (
                    <div className="ml-auto w-2 h-2 bg-sky-400 rounded-full animate-pulse"></div>
                  )}
                </button>
              ))}
            </div>

            {/* Stats */}
            <div className="mt-8 p-3 bg-gray-800/50 rounded-lg border border-gray-700/50">
              <h4 className="text-xs font-orbitron font-bold text-gray-400 mb-2 uppercase">Database Stats</h4>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Entries:</span>
                  <span className="text-emerald-400 font-mono">{faqData.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Categories:</span>
                  <span className="text-sky-400 font-mono">{categories.length - 1}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Status:</span>
                  <span className="text-green-400 font-mono">ONLINE</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content - FAQ Items */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="mb-4">
              <h3 className="text-lg font-orbitron font-bold text-white mb-2">
                {selectedCategory === 'all' ? 'All Topics' : selectedCategory} 
                <span className="text-gray-400 text-sm ml-2 font-mono">
                  ({filteredFAQ.length} entries)
                </span>
              </h3>
              <div className="w-full h-px bg-gradient-to-r from-sky-500/50 to-emerald-500/50"></div>
            </div>

            <div className="space-y-3">
              {filteredFAQ.map((item) => (
                <div
                  key={item.id}
                  className="bg-gray-800/30 border border-gray-700/50 rounded-lg overflow-hidden hover:border-gray-600/50 transition-all duration-200"
                >
                  <button
                    onClick={() => toggleExpanded(item.id)}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-700/20 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-sky-500/20 to-emerald-500/20 rounded-lg flex items-center justify-center border border-sky-500/30">
                        {item.icon}
                      </div>
                      <div>
                        <h4 className="font-medium text-white">{item.question}</h4>
                        <span className="text-xs text-gray-400 font-mono uppercase">{item.category}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {expandedItems.includes(item.id) ? (
                        <ChevronDown className="w-5 h-5 text-sky-400" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </button>
                  
                  {expandedItems.includes(item.id) && (
                    <div className="px-4 pb-4">
                      <div className="pl-11 border-l-2 border-sky-500/30 ml-4">
                        <p className="text-gray-300 leading-relaxed">{item.answer}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Bottom CTA */}
            <div className="mt-8 p-4 bg-gradient-to-r from-gray-800/50 to-gray-700/50 rounded-lg border border-gray-600/50">
              <h4 className="font-orbitron font-bold text-white mb-2">Still need help?</h4>
              <p className="text-gray-300 text-sm mb-3">
                Can't find what you're looking for? Submit a support request and our team will assist you.
              </p>
              <a
                href="https://forms.gle/CDUTcSE6ZSeZKBmb9"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-sky-500 to-emerald-500 hover:from-sky-400 hover:to-emerald-400 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105"
              >
                <HelpCircle className="w-4 h-4" />
                <span>Contact Support</span>
              </a>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-4 left-4 w-2 h-2 bg-sky-400 rounded-full animate-ping"></div>
        <div className="absolute top-4 right-20 w-1 h-1 bg-emerald-400 rounded-full animate-pulse"></div>
        <div className="absolute bottom-4 left-6 w-1 h-1 bg-purple-400 rounded-full animate-ping"></div>
        <div className="absolute bottom-4 right-4 w-2 h-2 bg-sky-400 rounded-full animate-pulse"></div>
      </div>
    </div>
  );
};

export default HelpCenterDialog;