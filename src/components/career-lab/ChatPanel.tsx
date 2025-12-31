import { useState, useRef, useEffect } from "react";
import { MessageCircle, Send, X, ArrowLeft, Link, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNetworking } from "@/hooks/useNetworking";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";

export const ChatPanel = () => {
  const { user } = useAuth();
  const {
    chatRooms,
    activeRoom,
    messages,
    openChat,
    sendMessage,
    closeChat,
  } = useNetworking();

  const [messageInput, setMessageInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!messageInput.trim()) return;
    await sendMessage(messageInput.trim());
    setMessageInput("");
  };

  const getOtherParticipant = () => {
    if (!activeRoom || !user) return null;
    return activeRoom.participants?.find((p) => p.user_id !== user.id)?.profile;
  };

  if (activeRoom) {
    const otherPerson = getOtherParticipant();

    return (
      <Card className="glass-card flex flex-col h-[500px]">
        <CardHeader className="flex-shrink-0 border-b border-border/50">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={closeChat}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <Avatar className="w-10 h-10">
              <AvatarImage src={otherPerson?.avatar_url || undefined} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {otherPerson?.full_name?.[0] || "?"}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{otherPerson?.full_name || "Chat"}</p>
              {otherPerson?.job_title && (
                <p className="text-sm text-muted-foreground">{otherPerson.job_title}</p>
              )}
            </div>
            {activeRoom.purpose && (
              <span className="ml-auto text-xs text-muted-foreground capitalize px-2 py-1 bg-secondary rounded-full">
                {activeRoom.purpose}
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            <div className="space-y-4">
              {messages.length > 0 ? (
                messages.map((message) => {
                  const isOwn = message.sender_id === user?.id;
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`flex gap-2 max-w-[80%] ${
                          isOwn ? "flex-row-reverse" : "flex-row"
                        }`}
                      >
                        {!isOwn && (
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={message.sender_profile?.avatar_url || undefined} />
                            <AvatarFallback className="bg-primary/10 text-primary text-xs">
                              {message.sender_profile?.full_name?.[0] || "?"}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div
                          className={`rounded-2xl px-4 py-2 ${
                            isOwn
                              ? "bg-primary text-primary-foreground"
                              : "bg-secondary"
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          {message.file_url && (
                            <a
                              href={message.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-xs underline mt-1"
                            >
                              <Link className="w-3 h-3" />
                              Attachment
                            </a>
                          )}
                          <p
                            className={`text-xs mt-1 ${
                              isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
                            }`}
                          >
                            {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Start the conversation!
                </p>
              )}
            </div>
          </ScrollArea>
          <div className="flex-shrink-0 p-4 border-t border-border/50">
            <div className="flex gap-2">
              <Input
                placeholder="Type a message..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              />
              <Button onClick={handleSendMessage} disabled={!messageInput.trim()}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-primary" />
          Messages
        </CardTitle>
      </CardHeader>
      <CardContent>
        {chatRooms.length > 0 ? (
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {chatRooms.map((room) => {
              const otherPerson = room.participants?.find(
                (p) => p.user_id !== user?.id
              )?.profile;

              return (
                <button
                  key={room.id}
                  onClick={() => openChat(room.id)}
                  className="w-full flex items-center gap-4 p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors text-left"
                >
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={otherPerson?.avatar_url || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {otherPerson?.full_name?.[0] || room.name?.[0] || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {room.room_type === "direct"
                        ? otherPerson?.full_name || "Unknown"
                        : room.name || "Group Chat"}
                    </p>
                    <p className="text-sm text-muted-foreground capitalize">
                      {room.purpose || "General"}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">
            No conversations yet. Connect with people to start chatting!
          </p>
        )}
      </CardContent>
    </Card>
  );
};
