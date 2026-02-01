import React, { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { chatbotAPI } from "../../api";

const ChatbotWidget = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hello! I'm your AI health assistant. How can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessageMutation = useMutation({
    mutationFn: (message) => chatbotAPI.sendMessage({ message }),
    onSuccess: (response) => {
      const assistantMessage = {
        role: "assistant",
        content: response.data.data.response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    },
    onError: (error) => {
      console.error("Chatbot error:", error);
      console.error("Error response:", error.response?.data);

      let errorContent =
        "I'm having trouble connecting right now. Please try again later.";

      // Check if authentication error
      if (error.response?.status === 401) {
        errorContent = "Please log in to use the AI health assistant.";
      } else if (error.response?.data?.message) {
        errorContent = error.response.data.message;
      }

      const errorMessage = {
        role: "assistant",
        content: errorContent,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    },
  });

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = {
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    sendMessageMutation.mutate(input);
    setInput("");
  };

  const quickQuestions = [
    "What should my blood pressure be?",
    "Tips for better sleep",
    "How to manage diabetes",
    "Healthy meal ideas",
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 w-96 h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 border border-gray-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white p-4 rounded-t-2xl flex justify-between items-center">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mr-3">
            <span className="text-2xl">🤖</span>
          </div>
          <div>
            <h3 className="font-semibold">AI Health Assistant</h3>
            <p className="text-xs text-primary-100">Always here to help</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-white hover:text-gray-200 text-2xl"
        >
          ×
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                message.role === "user"
                  ? "bg-primary-600 text-white"
                  : "bg-white text-gray-900 shadow-md border border-gray-100"
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              <p
                className={`text-xs mt-1 ${
                  message.role === "user" ? "text-primary-100" : "text-gray-500"
                }`}
              >
                {new Date(message.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        ))}
        {sendMessageMutation.isPending && (
          <div className="flex justify-start">
            <div className="bg-white text-gray-900 shadow-md border border-gray-100 rounded-2xl px-4 py-2">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Questions */}
      {messages.length === 1 && (
        <div className="px-4 pb-2">
          <p className="text-xs text-gray-600 mb-2">Quick questions:</p>
          <div className="flex flex-wrap gap-2">
            {quickQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => {
                  setInput(question);
                }}
                className="text-xs bg-primary-50 text-primary-700 px-3 py-1 rounded-full hover:bg-primary-100 transition-colors"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-gray-200 bg-white rounded-b-2xl">
        <form onSubmit={handleSend} className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything about health..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
            disabled={sendMessageMutation.isPending}
          />
          <button
            type="submit"
            disabled={!input.trim() || sendMessageMutation.isPending}
            className="bg-primary-600 text-white p-2 rounded-full hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatbotWidget;
