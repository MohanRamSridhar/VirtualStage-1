import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Users, Music, Tag, Sparkles, ThumbsUp, Star, Clock3, Video, Play, Pause } from "lucide-react";
import { Link } from "react-router-dom";
import { Event } from "@/lib/stores/useEvents";
import { formatDistanceToNow, format } from "date-fns";
import { useState } from "react";
import EventAudio from "./EventAudio";

interface EventCardProps {
  event: Event;
  compact?: boolean;
  featured?: boolean;
}

export default function EventCard({ event, compact = false, featured = false }: EventCardProps) {
  const eventDate = new Date(event.date);
  const isUpcoming = eventDate > new Date();
  const formattedDate = format(eventDate, "PPP"); // "Jan 1, 2023"
  const timeUntil = isUpcoming ? formatDistanceToNow(eventDate, { addSuffix: true }) : "Ended";
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Get recommendation reasons
  const matchReasons = (event as any).matchReasons;
  const recommendationReasons = matchReasons ? [
    matchReasons.genre && { icon: Music, text: "Matches your favorite genre" },
    matchReasons.type && { icon: Star, text: "Similar to events you like" },
    matchReasons.artist && { icon: ThumbsUp, text: "From artists you follow" },
    matchReasons.environment && { icon: Video, text: "In your preferred environment" },
    matchReasons.duration && { icon: Clock3, text: "Matches your preferred duration" },
    matchReasons.timeOfDay && { icon: Clock, text: "At your preferred time" },
    matchReasons.live && { icon: Users, text: "You enjoy live events" }
  ].filter(Boolean) : [];
  
  return (
    <Card className={`
      overflow-hidden transition-all duration-200 hover:shadow-lg 
      ${compact ? 'h-full' : ''} 
      ${featured ? 'border-primary' : ''}
    `}>
      {!compact && (
        <div 
          className={`
            w-full bg-cover bg-center relative
            ${featured ? 'h-64' : 'h-48'}
          `}
          style={{ backgroundImage: `url(${event.thumbnail || 'https://images.unsplash.com/photo-1578945517976-7a711a2245f5'})` }}
        >
          {event.isLive && (
            <Badge variant="destructive" className="absolute top-2 right-2 animate-pulse">
              LIVE NOW
            </Badge>
          )}
          {featured && (
            <Badge variant="secondary" className="absolute top-2 left-2">
              <Sparkles className="h-4 w-4 mr-1" />
              Featured
            </Badge>
          )}
        </div>
      )}
      
      <CardHeader className={`${compact ? "p-4" : ""}`}>
        <div className="flex justify-between items-start">
          <CardTitle className={`
            ${compact ? "text-base" : featured ? "text-3xl" : "text-2xl"} 
            font-bold
          `}>
            {event.title}
          </CardTitle>
          
          <div className="flex items-center gap-2">
            {!compact && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsPlaying(!isPlaying)}
                className="h-8 w-8"
              >
                {isPlaying ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </Button>
            )}
            
            {compact && event.isLive && (
              <Badge variant="destructive" className="animate-pulse">
                LIVE
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className={`${compact ? "p-4 pt-0" : ""}`}>
        {!compact && (
          <p className={`
            mb-4 text-muted-foreground 
            ${featured ? 'text-lg line-clamp-3' : 'line-clamp-2'}
          `}>
            {event.description}
          </p>
        )}
        
        <div className={`grid ${compact ? "gap-1" : "gap-2"}`}>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{formattedDate}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{timeUntil} • {event.duration} mins</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Music className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{event.artist} • {event.genre}</span>
          </div>
          
          {!compact && (
            <>
              <div className="flex items-center gap-2 mt-1">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <div className="flex flex-wrap gap-1">
                  {event.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
              
              {/* AI Recommendation Reasons */}
              {recommendationReasons.length > 0 && (
                <div className="mt-4 space-y-2">
                  <div className="text-sm font-medium text-primary">Recommended for you</div>
                  <div className="grid grid-cols-2 gap-2">
                    {recommendationReasons.map((reason, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <reason.icon className="h-4 w-4" />
                        <span>{reason.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Audio Player */}
              <div className="mt-4">
                <EventAudio
                  eventId={event.id}
                  genre={event.genre}
                  isPlaying={isPlaying}
                  onPlayChange={setIsPlaying}
                />
              </div>
            </>
          )}
        </div>
      </CardContent>
      
      <CardFooter className={`${compact ? "p-4 pt-0" : ""}`}>
        <Button 
          asChild 
          className="w-full" 
          size={featured ? "lg" : "default"}
          variant={featured ? "default" : "secondary"}
        >
          <Link to={`/events/${event.id}`}>
            {event.isLive ? "Join Now" : isUpcoming ? "Get Ready" : "Watch Recording"}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
