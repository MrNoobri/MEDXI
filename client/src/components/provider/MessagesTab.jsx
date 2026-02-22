import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MessageSquareText } from "lucide-react";
import ConversationList from "../messages/ConversationList";
import MessageThread from "../messages/MessageThread";
import { messagesAPI } from "../../api";

const MessagesTab = () => {
  const queryClient = useQueryClient();
  const [selectedConversation, setSelectedConversation] = useState(null);

  const { data: conversationsData } = useQuery({
    queryKey: ["conversations"],
    queryFn: async () => {
      const response = await messagesAPI.getConversations();
      return response.data.data;
    },
    refetchInterval: 30000,
  });

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
    refetchInterval: 5000,
  });

  const sendMessageMutation = useMutation({
    mutationFn: (content) =>
      messagesAPI.send({
        recipient: selectedConversation.participant._id,
        content,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["messages", selectedConversation?.participant?._id],
      });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      queryClient.invalidateQueries({ queryKey: ["unreadMessages"] });
    },
  });

  const handleSendMessage = (content) => {
    if (selectedConversation) {
      sendMessageMutation.mutate(content);
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg shadow-md h-[calc(100vh-16rem)] flex overflow-hidden theme-surface">
      {/* Conversations Sidebar */}
      <div className="w-1/3 border-r border-border">
        <div className="p-4 border-b border-border">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <MessageSquareText className="h-4 w-4 text-primary" />
            Conversations
          </h3>
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
            <div className="p-4 border-b border-border bg-card">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold mr-3">
                  {selectedConversation.participant?.profile?.firstName?.[0]}
                  {selectedConversation.participant?.profile?.lastName?.[0]}
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">
                    {selectedConversation.participant?.profile?.firstName}{" "}
                    {selectedConversation.participant?.profile?.lastName}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedConversation.participant?.role === "provider"
                      ? selectedConversation.participant?.providerInfo
                          ?.specialization || "Healthcare Provider"
                      : "Patient"}
                  </p>
                </div>
              </div>
            </div>
            <MessageThread
              messages={messagesData}
              onSendMessage={handleSendMessage}
            />
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <div className="text-center">
              <MessageSquareText className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg">
                Select a conversation to start messaging
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesTab;
