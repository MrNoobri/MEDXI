import React from "react";
import { format } from "date-fns";

const ConversationList = ({
  conversations,
  selectedConversation,
  onSelectConversation,
}) => {
  const formatLastMessageTime = (date) => {
    try {
      const messageDate = new Date(date);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      if (messageDate.toDateString() === today.toDateString()) {
        return format(messageDate, "hh:mm a");
      } else if (messageDate.toDateString() === yesterday.toDateString()) {
        return "Yesterday";
      } else {
        return format(messageDate, "MMM dd");
      }
    } catch {
      return "";
    }
  };

  return (
    <div className="h-full overflow-y-auto">
      {conversations && conversations.length > 0 ? (
        conversations.map((conversation) => {
          const otherUser = conversation.participant;
          const isSelected = selectedConversation?._id === conversation._id;

          return (
            <div
              key={conversation._id}
              onClick={() => onSelectConversation(conversation)}
              className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors ${
                isSelected ? "bg-primary-50" : ""
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center mb-1">
                    <div className="w-10 h-10 rounded-full bg-primary-600 text-white flex items-center justify-center font-semibold mr-3">
                      {otherUser?.profile?.firstName?.[0]}
                      {otherUser?.profile?.lastName?.[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-gray-900 truncate">
                        {otherUser?.profile?.firstName}{" "}
                        {otherUser?.profile?.lastName}
                      </h3>
                      <p className="text-xs text-gray-600">
                        {otherUser?.role === "provider"
                          ? otherUser?.profile?.specialization ||
                            "Healthcare Provider"
                          : "Patient"}
                      </p>
                    </div>
                  </div>
                  {conversation.lastMessage && (
                    <p className="text-sm text-gray-600 truncate ml-13">
                      {conversation.lastMessage.content}
                    </p>
                  )}
                </div>
                {conversation.lastMessage && (
                  <div className="ml-2 flex flex-col items-end">
                    <span className="text-xs text-gray-500">
                      {formatLastMessageTime(
                        conversation.lastMessage.createdAt,
                      )}
                    </span>
                    {conversation.unreadCount > 0 && (
                      <span className="mt-1 bg-primary-600 text-white text-xs rounded-full px-2 py-0.5">
                        {conversation.unreadCount}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })
      ) : (
        <div className="flex items-center justify-center h-full text-gray-500 p-4 text-center">
          No conversations yet. Start by booking an appointment with a
          healthcare provider.
        </div>
      )}
    </div>
  );
};

export default ConversationList;
