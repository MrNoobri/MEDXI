import React, { useRef, useEffect } from "react";
import { format } from "date-fns";
import { useAuth } from "../../context/AuthContext";

const MessageThread = ({ messages, onSendMessage }) => {
  const { user } = useAuth();
  const messagesEndRef = useRef(null);
  const [newMessage, setNewMessage] = React.useState("");

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      onSendMessage(newMessage);
      setNewMessage("");
    }
  };

  const formatMessageTime = (date) => {
    try {
      return format(new Date(date), "MMM dd, hh:mm a");
    } catch {
      return "Invalid date";
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages && messages.length > 0 ? (
          messages.map((message) => {
            const isOwn = message.sender?._id === user?._id;
            return (
              <div
                key={message._id}
                className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[70%] rounded-lg px-4 py-2 ${
                    isOwn
                      ? "bg-primary-600 text-white"
                      : "bg-gray-200 text-gray-900"
                  }`}
                >
                  {!isOwn && (
                    <p className="text-xs font-semibold mb-1">
                      {message.sender?.profile?.firstName}{" "}
                      {message.sender?.profile?.lastName}
                    </p>
                  )}
                  <p className="text-sm">{message.content}</p>
                  <p
                    className={`text-xs mt-1 ${
                      isOwn ? "text-primary-100" : "text-gray-600"
                    }`}
                  >
                    {formatMessageTime(message.createdAt)}
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            No messages yet. Start the conversation!
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t border-gray-200 p-4">
        <form onSubmit={handleSend} className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="btn btn-primary"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default MessageThread;
