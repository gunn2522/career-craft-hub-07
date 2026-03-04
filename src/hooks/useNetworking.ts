import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

// Public profile interface for discovery (limited fields from public_profiles view)
export interface PublicProfileDiscovery {
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  user_type: string | null;
  institution: string | null;
  skills: string[] | null;
  is_public: boolean;
}

// Full public profile interface (for connected users only)
export interface PublicProfile {
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  job_title: string | null;
  current_company: string | null;
  skills: string[];
  is_mentor: boolean;
  is_recruiter: boolean;
  years_experience: number;
}

export interface Connection {
  id: string;
  connected_user_id: string;
  connected_at: string;
  profile?: PublicProfile;
}

export interface ConnectionRequest {
  id: string;
  from_user_id: string;
  to_user_id: string;
  purpose: string | null;
  message: string | null;
  status: string;
  created_at: string;
  from_profile?: PublicProfile;
  to_profile?: PublicProfile;
}

export interface ChatRoom {
  id: string;
  room_type: string;
  name: string | null;
  purpose: string | null;
  created_at: string;
  participants?: ChatParticipant[];
  last_message?: Message;
}

export interface ChatParticipant {
  id: string;
  room_id: string;
  user_id: string;
  joined_at: string;
  last_read_at: string | null;
  profile?: PublicProfile;
}

export interface Message {
  id: string;
  room_id: string;
  sender_id: string;
  content: string;
  message_type: string;
  file_url: string | null;
  is_edited: boolean;
  created_at: string;
  sender_profile?: PublicProfile;
}

export const useNetworking = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [connectionRequests, setConnectionRequests] = useState<ConnectionRequest[]>([]);
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [discoverPeople, setDiscoverPeople] = useState<PublicProfileDiscovery[]>([]);
  const [activeRoom, setActiveRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    if (user) {
      fetchNetworkingData();
    }
  }, [user]);

  // Real-time message subscription
  useEffect(() => {
    if (!activeRoom) return;

    const channel = supabase
      .channel(`room-${activeRoom.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `room_id=eq.${activeRoom.id}`,
        },
        async (payload) => {
          const newMessage = payload.new as Message;
          // Fetch sender profile using secure RPC function
          const { data: profiles } = await supabase
            .rpc("get_public_profiles", { user_ids: [newMessage.sender_id] });
          const profile = profiles?.[0] || null;
          
          setMessages((prev) => [...prev, { ...newMessage, sender_profile: profile as PublicProfile }]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeRoom?.id]);

  const fetchNetworkingData = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      await Promise.all([
        fetchConnections(),
        fetchConnectionRequests(),
        fetchChatRooms(),
        fetchDiscoverPeople(),
      ]);
    } catch (error) {
      console.error("Error fetching networking data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchConnections = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from("connections")
      .select("*")
      .or(`user_id.eq.${user.id},connected_user_id.eq.${user.id}`);

    if (data) {
      // Fetch profiles for connected users
      const connectedUserIds = data.map((c) =>
        c.user_id === user.id ? c.connected_user_id : c.user_id
      );
      
      const { data: profiles } = await supabase
        .rpc("get_public_profiles", { user_ids: connectedUserIds });

      const connectionsWithProfiles = data.map((c) => ({
        ...c,
        connected_user_id: c.user_id === user.id ? c.connected_user_id : c.user_id,
        profile: profiles?.find(
          (p) => p.user_id === (c.user_id === user.id ? c.connected_user_id : c.user_id)
        ) as PublicProfile,
      }));

      setConnections(connectionsWithProfiles);
    }
  };

  const fetchConnectionRequests = async () => {
    if (!user) return;

    const { data } = await supabase
      .from("connection_requests")
      .select("*")
      .or(`from_user_id.eq.${user.id},to_user_id.eq.${user.id}`)
      .eq("status", "pending");

    if (data) {
      const userIds = [...new Set([...data.map((r) => r.from_user_id), ...data.map((r) => r.to_user_id)])];
      
      const { data: profiles } = await supabase
        .rpc("get_public_profiles", { user_ids: userIds });

      const requestsWithProfiles = data.map((r) => ({
        ...r,
        from_profile: profiles?.find((p) => p.user_id === r.from_user_id) as PublicProfile,
        to_profile: profiles?.find((p) => p.user_id === r.to_user_id) as PublicProfile,
      }));

      setConnectionRequests(requestsWithProfiles);
    }
  };

  const fetchChatRooms = async () => {
    if (!user) return;

    const { data: participantData } = await supabase
      .from("chat_participants")
      .select("room_id")
      .eq("user_id", user.id);

    if (!participantData || participantData.length === 0) {
      setChatRooms([]);
      return;
    }

    const roomIds = participantData.map((p) => p.room_id);

    const { data: rooms } = await supabase
      .from("chat_rooms")
      .select("*")
      .in("id", roomIds);

    if (rooms) {
      // Fetch participants for each room
      const { data: allParticipants } = await supabase
        .from("chat_participants")
        .select("*")
        .in("room_id", roomIds);

      const participantUserIds = [...new Set(allParticipants?.map((p) => p.user_id) || [])];
      
      const { data: profiles } = await supabase
        .rpc("get_public_profiles", { user_ids: participantUserIds });

      const roomsWithDetails = rooms.map((room) => ({
        ...room,
        participants: allParticipants
          ?.filter((p) => p.room_id === room.id)
          .map((p) => ({
            ...p,
            profile: profiles?.find((pr) => pr.user_id === p.user_id) as PublicProfile,
          })),
      }));

      setChatRooms(roomsWithDetails);
    }
  };

  const fetchDiscoverPeople = async () => {
    if (!user) return;

    // Use the secure public_profiles view which only exposes non-sensitive data
    const { data } = await supabase
      .from("public_profiles")
      .select("user_id, full_name, avatar_url, bio, user_type, institution, skills, is_public")
      .neq("user_id", user.id)
      .limit(20);

    if (data) {
      setDiscoverPeople(data as PublicProfileDiscovery[]);
    }
  };

  const sendConnectionRequest = async (toUserId: string, purpose: string, message: string) => {
    if (!user) return;

    try {
      const { error } = await supabase.from("connection_requests").insert({
        from_user_id: user.id,
        to_user_id: toUserId,
        purpose,
        message,
      });

      if (error) throw error;

      toast({
        title: "Request Sent!",
        description: "Your connection request has been sent.",
      });

      await fetchConnectionRequests();
    } catch (error) {
      console.error("Error sending connection request:", error);
      toast({
        title: "Error",
        description: "Failed to send request. Please try again.",
        variant: "destructive",
      });
    }
  };

  const respondToRequest = async (requestId: string, accept: boolean) => {
    if (!user) return;

    try {
      const request = connectionRequests.find((r) => r.id === requestId);
      if (!request) return;

      await supabase
        .from("connection_requests")
        .update({ status: accept ? "accepted" : "rejected" })
        .eq("id", requestId);

      if (accept) {
        // Create connection
        await supabase.from("connections").insert({
          user_id: request.from_user_id,
          connected_user_id: request.to_user_id,
        });

        // Create a chat room for the new connection
        const { data: room } = await supabase
          .from("chat_rooms")
          .insert({
            room_type: "direct",
            purpose: request.purpose,
            created_by: user.id,
          })
          .select()
          .single();

        if (room) {
          await supabase.from("chat_participants").insert([
            { room_id: room.id, user_id: request.from_user_id },
            { room_id: room.id, user_id: request.to_user_id },
          ]);
        }

        toast({
          title: "Connection Accepted!",
          description: "You're now connected. Start chatting!",
        });
      } else {
        toast({
          title: "Request Declined",
          description: "The connection request has been declined.",
        });
      }

      await fetchNetworkingData();
    } catch (error) {
      console.error("Error responding to request:", error);
      toast({
        title: "Error",
        description: "Failed to respond. Please try again.",
        variant: "destructive",
      });
    }
  };

  const openChat = async (roomId: string) => {
    const room = chatRooms.find((r) => r.id === roomId);
    if (!room) return;

    setActiveRoom(room);

    // Fetch messages
    const { data: messagesData } = await supabase
      .from("messages")
      .select("*")
      .eq("room_id", roomId)
      .order("created_at", { ascending: true });

    if (messagesData) {
      const senderIds = [...new Set(messagesData.map((m) => m.sender_id))];
      
      const { data: profiles } = await supabase
        .rpc("get_public_profiles", { user_ids: senderIds });

      const messagesWithProfiles = messagesData.map((m) => ({
        ...m,
        sender_profile: profiles?.find((p) => p.user_id === m.sender_id) as PublicProfile,
      }));

      setMessages(messagesWithProfiles);
    }

    // Update last_read_at
    if (user) {
      await supabase
        .from("chat_participants")
        .update({ last_read_at: new Date().toISOString() })
        .eq("room_id", roomId)
        .eq("user_id", user.id);
    }
  };

  const sendMessage = async (content: string, messageType: string = "text", fileUrl?: string) => {
    if (!user || !activeRoom) return;

    try {
      const { error } = await supabase.from("messages").insert({
        room_id: activeRoom.id,
        sender_id: user.id,
        content,
        message_type: messageType,
        file_url: fileUrl,
      });

      if (error) throw error;
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  };

  const closeChat = () => {
    setActiveRoom(null);
    setMessages([]);
  };

  const startDirectChat = async (targetUserId: string, purpose: string) => {
    if (!user) return;

    try {
      // Check if a direct chat already exists
      const existingRoom = chatRooms.find(
        (room) =>
          room.room_type === "direct" &&
          room.participants?.some((p) => p.user_id === targetUserId)
      );

      if (existingRoom) {
        await openChat(existingRoom.id);
        return;
      }

      // Create new chat room
      const { data: room, error: roomError } = await supabase
        .from("chat_rooms")
        .insert({
          room_type: "direct",
          purpose,
          created_by: user.id,
        })
        .select()
        .single();

      if (roomError) throw roomError;

      // Add participants
      await supabase.from("chat_participants").insert([
        { room_id: room.id, user_id: user.id },
        { room_id: room.id, user_id: targetUserId },
      ]);

      await fetchChatRooms();
      await openChat(room.id);

      toast({
        title: "Chat Started!",
        description: "You can now start messaging.",
      });
    } catch (error) {
      console.error("Error starting chat:", error);
      toast({
        title: "Error",
        description: "Failed to start chat. Please try again.",
        variant: "destructive",
      });
    }
  };

  return {
    isLoading,
    connections,
    connectionRequests,
    chatRooms,
    discoverPeople,
    activeRoom,
    messages,
    sendConnectionRequest,
    respondToRequest,
    openChat,
    sendMessage,
    closeChat,
    startDirectChat,
    refreshData: fetchNetworkingData,
  };
};
