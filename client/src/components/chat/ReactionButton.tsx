import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Heart, Smile, Hand } from "lucide-react";
import { useEvents } from "@/lib/stores/useEvents";
import { useAuth } from "@/lib/stores/useAuth";
import { useAudio } from "@/lib/stores/useAudio";

// Icons for each reaction type
const reactionIcons: Record<string, React.ReactNode> = {
  heart: <Heart className="h-4 w-4" />,
  wow: <Smile className="h-4 w-4" />,
  clap: <Hand className="h-4 w-4" />,
};

// Human-readable labels for each reaction type
const reactionLabels: Record<string, string> = {
  heart: "Love it",
  wow: "Wow",
  clap: "Applause",
};

interface ReactionButtonProps {
  type: "heart" | "wow" | "clap";
  eventId: number;
}

export default function ReactionButton({ type, eventId }: ReactionButtonProps) {
  const { reactions, fetchEventReactions, sendReaction } = useEvents();
  const { user, isAuthenticated } = useAuth();
  const { playHit } = useAudio();
  
  // Count reactions of this type
  const reactionCount = reactions.filter(r => r.type === type).length;
  
  // Check if current user has reacted with this type
  const hasReacted = isAuthenticated && user
    ? reactions.some(r => r.type === type && r.userId === user.id)
    : false;
  
  // Animation state
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Fetch reactions for this event
  useEffect(() => {
    fetchEventReactions(eventId);
  }, [eventId, fetchEventReactions]);
  
  // Handle reaction
  const handleReact = () => {
    if (!isAuthenticated || !user) return;
    
    // Send reaction to server
    sendReaction(user.id, eventId, type);
    
    // Play sound
    playHit();
    
    // Trigger animation
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 1000);
  };
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={hasReacted ? "default" : "ghost"}
            size="icon"
            className={`h-8 w-8 transition-all ${isAnimating ? 'scale-150' : ''} ${hasReacted ? 'bg-primary/90 text-primary-foreground' : ''}`}
            onClick={handleReact}
            disabled={!isAuthenticated}
          >
            {reactionIcons[type]}
            {reactionCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-secondary text-secondary-foreground text-xs w-4 h-4 rounded-full flex items-center justify-center">
                {reactionCount > 99 ? "99+" : reactionCount}
              </span>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{reactionLabels[type]}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
