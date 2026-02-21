import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Navbar from "../components/common/Navbar";
import ConversationList from "../components/messages/ConversationList";
import MessageThread from "../components/messages/MessageThread";
import { messagesAPI } from "../api";

const Messages = () => {
  const queryClient = useQueryClient();
  const [selectedConversation, setSelectedConversation] = useState(null);

  // Fetch conversations
  const { data: conversationsData } = useQuery({
    queryKey: ["conversations"],
    queryFn: async () => {
      const response = await messagesAPI.getConversations();
      return response.data.data;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Fetch messages for selected conversation
  const { data: messagesData } = useQuery({
    queryKey: ["messages", selectedConversation?.participant?._id],
    queryFn: async () => {
      if (!selectedConversation) return [];
      const response = await messagesAPI.getAll({
        otherUserId: selectedConversation.participant._id,
      });
      return response.data.data;
    },
    enabled: !!selectedConversation,
    refetchInterval: 5000, // Refetch messages every 5 seconds
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: (content) =>
      messagesAPI.send({
        recipient: selectedConversation.participant._id,
        content,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries([
        "messages",
        selectedConversation?.participant?._id,
      ]);
      queryClient.invalidateQueries(["conversations"]);
    },
    onError: (error) => {
      alert(error.response?.data?.message || "Failed to send message");
    },
  });

  const handleSendMessage = (content) => {
    if (selectedConversation) {
      sendMessageMutation.mutate(content);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />

      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-card border border-border rounded-lg shadow-md h-[calc(100vh-12rem)] flex overflow-hidden theme-surface">
          {/* Conversations Sidebar */}
          <div className="w-1/3 border-r border-border">
            <div className="p-4 border-b border-border">
              <h2 className="text-xl font-bold text-foreground">Messages</h2>
            </div>
            <ConversationList
              conversations={conversationsData}
              selectedConversation={selectedConversation}
              onSelectConversation={setSelectedConversation}
            />
          </div>

          {/* Message Thread */}
          <div className="flex-1 flex flex-col">
            {selectedConversation ? (
              <>
                {/* Thread Header */}
                <div className="p-4 border-b border-border bg-card">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold mr-3">
                      {
                        selectedConversation.participant?.profile
                          ?.firstName?.[0]
                      }
                      {selectedConversation.participant?.profile?.lastName?.[0]}
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {selectedConversation.participant?.profile?.firstName}{" "}
                        {selectedConversation.participant?.profile?.lastName}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {selectedConversation.participant?.role === "provider"
                          ? selectedConversation.participant?.profile
                              ?.specialization || "Healthcare Provider"
                          : "Patient"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <MessageThread
                  messages={messagesData}
                  onSendMessage={handleSendMessage}
                />
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <div className="text-6xl mb-4">💬</div>
                  <p className="text-lg">
                    Select a conversation to start messaging
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;
