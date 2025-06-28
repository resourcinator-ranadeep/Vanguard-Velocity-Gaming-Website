import React from 'react';
import { X, Zap, Loader2, Rocket } from 'lucide-react';

interface DownloadDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const DownloadDialog: React.FC<DownloadDialogProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Dialog */}
      <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-sky-500/50 rounded-2xl p-8 max-w-md mx-4 shadow-2xl">
        {/* Animated border glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-sky-500/20 via-emerald-500/20 to-orange-500/20 rounded-2xl blur-xl animate-pulse"></div>
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 bg-gray-700/50 hover:bg-gray-600/50 rounded-lg flex items-center justify-center transition-colors group"
        >
          <X className="w-4 h-4 text-gray-400 group-hover:text-white" />
        </button>

        {/* Content */}
        <div className="relative z-10 text-center">
          {/* Icon */}
          <div className="relative mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-sky-400 to-emerald-400 rounded-full flex items-center justify-center mx-auto">
              <Rocket className="w-10 h-10 text-white" />
            </div>
            
            {/* Orbiting elements */}
            <div className="absolute inset-0 animate-spin">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2">
                <Zap className="w-4 h-4 text-sky-400" />
              </div>
            </div>
            <div className="absolute inset-0 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '3s' }}>
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-2">
                <Loader2 className="w-4 h-4 text-emerald-400" />
              </div>
            </div>
          </div>

          {/* Title */}
          <h3 className="text-2xl font-orbitron font-bold mb-4">
            <span className="bg-gradient-to-r from-sky-400 to-emerald-400 bg-clip-text text-transparent">
              System Status
            </span>
          </h3>

          {/* Message */}
          <div className="space-y-3 mb-6">
            <p className="text-lg text-white font-medium">
              Optimizing for deployment.
            </p>
            <p className="text-lg text-white font-medium">
              Unveiling soon.
            </p>
            <p className="text-sky-400 font-bold">
              Stay tuned.
            </p>
          </div>

          {/* Progress bar */}
          <div className="mb-6">
            <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-sky-500 to-emerald-500 rounded-full animate-pulse"></div>
            </div>
            <p className="text-xs text-gray-400 mt-2 font-mono">
              DEPLOYMENT_PROTOCOL.EXE
            </p>
          </div>

          {/* Action button */}
          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-sky-500 to-emerald-500 hover:from-sky-400 hover:to-emerald-400 text-white py-3 px-6 rounded-lg font-bold transition-all duration-300 transform hover:scale-105"
          >
            <div className="flex items-center justify-center space-x-2">
              <span>Acknowledged</span>
              <Zap className="w-4 h-4" />
            </div>
          </button>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-2 left-2 w-2 h-2 bg-sky-400 rounded-full animate-ping"></div>
        <div className="absolute top-2 right-12 w-1 h-1 bg-emerald-400 rounded-full animate-pulse"></div>
        <div className="absolute bottom-2 left-4 w-1 h-1 bg-orange-400 rounded-full animate-ping"></div>
        <div className="absolute bottom-2 right-2 w-2 h-2 bg-sky-400 rounded-full animate-pulse"></div>
      </div>
    </div>
  );
};

export default DownloadDialog;