import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Users, Music, Tag } from "lucide-react";
import { Link } from "react-router-dom";
import { Event } from "@/lib/stores/useEvents";
import { formatDistanceToNow, format } from "date-fns";

interface EventCardProps {
  event: Event;
  compact?: boolean;
}

export default function EventCard({ event, compact = false }: EventCardProps) {
  const eventDate = new Date(event.date);
  const isUpcoming = eventDate > new Date();
  const formattedDate = format(eventDate, "PPP"); // "Jan 1, 2023"
  const timeUntil = isUpcoming ? formatDistanceToNow(eventDate, { addSuffix: true }) : "Ended";
  
  return (
    <Card className={`overflow-hidden transition-all duration-200 hover:shadow-lg ${compact ? 'h-full' : ''}`}>
      {!compact && (
        <div 
          className="w-full h-48 bg-cover bg-center relative"
          style={{ backgroundImage: `url(${event.thumbnail || 'https://images.unsplash.com/photo-1578945517976-7a711a2245f5'})` }}
        >
          {event.isLive && (
            <Badge variant="destructive" className="absolute top-2 right-2 animate-pulse">
              LIVE NOW
            </Badge>
          )}
        </div>
      )}
      
      <CardHeader className={compact ? "p-4" : ""}>
        <div className="flex justify-between items-start">
          <CardTitle className={`${compact ? "text-base" : "text-2xl"} font-bold`}>
            {event.title}
          </CardTitle>
          
          {compact && event.isLive && (
            <Badge variant="destructive" className="animate-pulse">
              LIVE
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className={`${compact ? "p-4 pt-0" : ""}`}>
        {!compact && (
          <p className="mb-4 text-muted-foreground line-clamp-2">
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
          )}
        </div>
      </CardContent>
      
      <CardFooter className={`${compact ? "p-4 pt-0" : ""}`}>
        <Button asChild className="w-full">
          <Link to={`/events/${event.id}`}>
            {event.isLive ? "Join Now" : isUpcoming ? "Get Ready" : "Watch Recording"}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
