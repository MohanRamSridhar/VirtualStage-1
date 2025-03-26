import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, Users, Music, Tag, Info, Ticket, HeartPulse, Headphones } from "lucide-react";
import { format } from "date-fns";
import { Event } from "@/lib/stores/useEvents";
import { useAuth } from "@/lib/stores/useAuth";
import { apiRequest } from "@/lib/queryClient";

interface EventDetailsProps {
  event: Event;
  onJoin: () => void;
}

export default function EventDetails({ event, onJoin }: EventDetailsProps) {
  const { user, isAuthenticated } = useAuth();
  const eventDate = new Date(event.date);
  const formattedDate = format(eventDate, "PPP 'at' p"); // "Jan 1, 2023 at 12:00 PM"
  
  // Function to bookmark the event
  const handleBookmark = async () => {
    if (!isAuthenticated || !user) return;
    
    try {
      await apiRequest('POST', '/api/interactions', {
        userId: user.id,
        eventId: event.id,
        bookmarked: true
      });
    } catch (error) {
      console.error("Error bookmarking event:", error);
    }
  };
  
  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="mb-6">
          <div className="flex justify-between items-start">
            <h1 className="text-3xl font-bold mb-2">{event.title}</h1>
            
            <div className="flex gap-2">
              {event.isLive && (
                <Badge variant="destructive" className="animate-pulse">
                  LIVE NOW
                </Badge>
              )}
              
              {event.isPremium && (
                <Badge variant="default">
                  PREMIUM
                </Badge>
              )}
            </div>
          </div>
          
          <div className="flex gap-2 mt-4 flex-wrap">
            <Badge variant="outline" className="flex items-center gap-1">
              <Calendar className="h-3 w-3" /> 
              {formattedDate}
            </Badge>
            
            <Badge variant="outline" className="flex items-center gap-1">
              <Clock className="h-3 w-3" /> 
              {event.duration} minutes
            </Badge>
            
            <Badge variant="outline" className="flex items-center gap-1">
              <Music className="h-3 w-3" /> 
              {event.genre}
            </Badge>
            
            <Badge variant="outline" className="flex items-center gap-1">
              <Headphones className="h-3 w-3" /> 
              {event.spatialAudio ? "Spatial Audio" : "Stereo"}
            </Badge>
          </div>
        </div>
        
        <Tabs defaultValue="details">
          <TabsList className="mb-4">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="artist">Artist</TabsTrigger>
            <TabsTrigger value="venue">Venue</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="space-y-4">
            <p>{event.description}</p>
            
            <div className="bg-muted p-4 rounded-md">
              <h3 className="font-medium mb-2 flex items-center gap-2">
                <Info className="h-4 w-4" /> Event Information
              </h3>
              <ul className="space-y-2">
                <li className="flex justify-between">
                  <span>Type:</span>
                  <span className="font-medium">{event.type}</span>
                </li>
                <li className="flex justify-between">
                  <span>Duration:</span>
                  <span className="font-medium">{event.duration} minutes</span>
                </li>
                <li className="flex justify-between">
                  <span>Environment:</span>
                  <span className="font-medium">{event.environment}</span>
                </li>
                <li className="flex justify-between">
                  <span>Audio:</span>
                  <span className="font-medium">{event.spatialAudio ? "Spatial 3D Audio" : "Standard Stereo"}</span>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium mb-2 flex items-center gap-2">
                <Tag className="h-4 w-4" /> Tags
              </h3>
              <div className="flex flex-wrap gap-1">
                {event.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="artist">
            <div className="space-y-4">
              <h3 className="font-medium text-lg">{event.artist}</h3>
              <p>
                Experience the incredible performance by {event.artist}, known for their captivating 
                {event.genre} style and unforgettable stage presence.
              </p>
              <p>
                This event showcases their unique artistic vision in an immersive environment 
                designed to transport you into the heart of the performance.
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="venue">
            <div className="space-y-4">
              <h3 className="font-medium text-lg">Virtual {event.environment}</h3>
              <p>
                This event takes place in our virtual {event.environment} environment, 
                specially designed to enhance your {event.genre} experience.
              </p>
              <p>
                {event.spatialAudio && (
                  "Enhanced with spatial audio technology, you'll feel like you're right in the middle of the action."
                )}
              </p>
              <div className="bg-muted p-4 rounded-md mt-4">
                <h4 className="font-medium mb-2">Venue Features</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Immersive 3D environment</li>
                  <li>Multiple viewing angles</li>
                  <li>Real-time audience reactions</li>
                  <li>{event.spatialAudio ? "Full spatial audio" : "High-quality stereo sound"}</li>
                  <li>Live chat with other attendees</li>
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="mt-6 flex gap-3">
          <Button 
            onClick={onJoin} 
            size="lg"
            className="flex-1"
          >
            {event.isLive ? "Join Live Now" : "Enter Experience"}
          </Button>
          
          <Button 
            variant="outline" 
            size="lg"
            onClick={handleBookmark}
            disabled={!isAuthenticated}
          >
            <HeartPulse className="h-5 w-5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
