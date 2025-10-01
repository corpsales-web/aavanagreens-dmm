import React, { useState } from 'react';
import { MessageCircle, X, Sparkles } from 'lucide-react';
import Aavana2Assistant from './Aavana2Assistant';

const FloatingChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Chatbot Button - Highest z-index for global visibility */}
      <div className="fixed bottom-6 left-6 z-[9999]">
        <button
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 group"
          title="Aavana 2.0 AI Assistant"
        >
          <div className="relative">
            <MessageCircle className="h-6 w-6" />
            <div className="absolute -top-1 -right-1 bg-green-500 rounded-full w-3 h-3 animate-pulse"></div>
          </div>
        </button>
        
        {/* Tooltip */}
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-black text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
          Aavana 2.0 AI Assistant
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-black"></div>
        </div>
      </div>

      {/* Aavana 2.0 Modal */}
      <Aavana2Assistant 
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
};

export default FloatingChatbot;