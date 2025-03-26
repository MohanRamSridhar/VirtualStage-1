import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, X, ChevronDown, ChevronUp, Send } from "lucide-react";
import { useAuth } from "@/lib/stores/useAuth";
import { useEvents, ChatMessage } from "@/lib/stores/useEvents";
import { formatDistanceToNow } from "date-fns";
import ReactionButton from "./ReactionButton";

interface ChatOverlayProps {
  eventId: number;
}

export default function ChatOverlay({ eventId }: ChatOverlayProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const { user, isAuthenticated } = useAuth();
  const { chatMessages, fetchEventChat, sendChatMessage } = useEvents();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  // Fetch chat messages when component mounts
  useEffect(() => {
    fetchEventChat(eventId);
    
    // Set up polling for new messages every 5 seconds
    const interval = setInterval(() => {
      fetchEventChat(eventId);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [eventId, fetchEventChat]);
  
  // Scroll to bottom when new messages come in
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [chatMessages]);
  
  // Handle sending a new message
  const handleSendMessage = () => {
    if (!isAuthenticated || !user || !message.trim()) return;
    
    sendChatMessage(user.id, eventId, message);
    setMessage("");
  };
  
  // Handle enter key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  return (
    <div className={`fixed ${isOpen ? "bottom-0 right-0 md:right-6" : "bottom-6 right-6"} z-10 transition-all duration-300`}>
      {/* Chat button when collapsed */}
      {!isOpen && (
        <Button 
          onClick={() => setIsOpen(true)}
          className="rounded-full shadow-lg w-14 h-14 flex items-center justify-center"
        >
          <MessageSquare className="h-6 w-6" />
        </Button>
      )}
      
      {/* Chat container when open */}
      {isOpen && (
        <div className="bg-card border rounded-t-lg md:rounded-lg shadow-lg overflow-hidden flex flex-col w-full md:w-96 h-96">
          {/* Header */}
          <div className="px-4 py-3 border-b flex items-center justify-between">
            <h3 className="font-medium flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Event Chat
            </h3>
            <div className="flex items-center gap-1">
              {/* Reaction buttons */}
              <ReactionButton type="clap" eventId={eventId} />
              <ReactionButton type="heart" eventId={eventId} />
              <ReactionButton type="wow" eventId={eventId} />
              
              {/* Close/minimize button */}
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsOpen(false)}
                className="h-8 w-8"
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Chat messages */}
          <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
            {chatMessages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                <MessageSquare className="h-8 w-8 mb-2 opacity-30" />
                <p className="text-sm">No messages yet</p>
                <p className="text-xs">Be the first to say something!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {chatMessages.map((msg) => (
                  <ChatMessageItem key={msg.id} message={msg} isOwnMessage={user?.id === msg.userId} />
                ))}
              </div>
            )}
          </ScrollArea>
          
          {/* Input area */}
          <div className="p-3 border-t bg-background">
            {isAuthenticated ? (
              <div className="flex gap-2">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message..."
                  className="flex-1"
                />
                <Button 
                  onClick={handleSendMessage}
                  disabled={!message.trim()}
                  size="icon"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <p className="text-center text-sm text-muted-foreground">
                <a href="/login" className="underline text-primary">Sign in</a> to join the conversation
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Individual chat message component
interface ChatMessageItemProps {
  message: ChatMessage;
  isOwnMessage: boolean;
}

function ChatMessageItem({ message, isOwnMessage }: ChatMessageItemProps) {
  // This would normally fetch user data from a cache or API
  // For now, we'll just use placeholder data
  const username = isOwnMessage ? "You" : `User ${message.userId}`;
  const avatar = undefined; // Placeholder for user avatar
  
  const timestamp = new Date(message.timestamp);
  const timeAgo = formatDistanceToNow(timestamp, { addSuffix: true });
  
  return (
    <div className={`flex gap-3 ${isOwnMessage ? "justify-end" : ""}`}>
      {!isOwnMessage && (
        <Avatar className="h-8 w-8">
          <AvatarImage src={avatar} />
          <AvatarFallback>{username.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
      )}
      
      <div className={`max-w-[75%] ${isOwnMessage ? "bg-primary text-primary-foreground" : "bg-secondary"} rounded-lg px-3 py-2`}>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium">{username}</span>
          <span className="text-xs opacity-70">{timeAgo}</span>
        </div>
        <p className="mt-1 break-words text-sm">{message.message}</p>
      </div>
      
      {isOwnMessage && (
        <Avatar className="h-8 w-8">
          <AvatarImage src={avatar} />
          <AvatarFallback>{username.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
