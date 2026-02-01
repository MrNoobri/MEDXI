import React from "react";

const ChatbotButton = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-full shadow-2xl hover:scale-110 transition-transform duration-200 flex items-center justify-center z-40 group"
      aria-label="Open AI Assistant"
    >
      <span className="text-3xl group-hover:scale-110 transition-transform">
        🤖
      </span>
      <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></span>
    </button>
  );
};

export default ChatbotButton;
