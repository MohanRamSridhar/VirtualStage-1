import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Headphones } from "lucide-react";
import { useEvents } from "@/lib/stores/useEvents";
import { useVRMode } from "@/lib/stores/useVRMode";
import VRScene from "@/components/core/VRScene";
import EventDetails from "@/components/events/EventDetails";
import VideoPlayer from "@/components/video/VideoPlayer";
import ChatOverlay from "@/components/chat/ChatOverlay";
import Loading from "@/components/common/Loading";

export default function EventPage() {
  const { id } = useParams<{ id: string }>();
  const eventId = parseInt(id || "0");
  const navigate = useNavigate();
  
  const { selectedEvent, fetchEventById, isLoading, error } = useEvents();
  const { mode, setMode } = useVRMode();
  
  // State to track whether to show the VR experience or video
  const [showVR, setShowVR] = useState(false);
  
  // Fetch event data on mount
  useEffect(() => {
    if (eventId) {
      fetchEventById(eventId);
    }
  }, [eventId, fetchEventById]);
  
  // Handle entering VR mode
  const handleEnterVR = () => {
    setShowVR(true);
    setMode("vr");
  };
  
  // Handle exiting VR mode
  const handleExitVR = () => {
    setShowVR(false);
    setMode("desktop");
  };
  
  // Navigation back to events
  const handleBack = () => {
    if (showVR) {
      handleExitVR();
    } else {
      navigate("/events");
    }
  };
  
  if (isLoading) {
    return <Loading />;
  }
  
  if (error || !selectedEvent) {
    return (
      <div className="container mx-auto py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Event Not Found</h1>
        <p className="text-muted-foreground mb-8">
          {error || "We couldn't find the event you're looking for."}
        </p>
        <Button onClick={() => navigate("/events")}>Back to Events</Button>
      </div>
    );
  }
  
  return (
    <>
      <Helmet>
        <title>{selectedEvent.title} | VREvents</title>
        <meta name="description" content={selectedEvent.description} />
      </Helmet>
      
      <div className="container mx-auto py-6">
        {/* Back button */}
        <Button 
          variant="ghost" 
          className="mb-4" 
          onClick={handleBack}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {showVR ? "Exit VR Experience" : "Back to Events"}
        </Button>
        
        {showVR ? (
          // VR Experience
          <div className="w-full h-[80vh] bg-black rounded-lg overflow-hidden relative">
            <VRScene 
              environment={selectedEvent.environment}
              eventId={selectedEvent.id}
            />
            
            {/* Spatial audio indicator */}
            {selectedEvent.spatialAudio && (
              <div className="absolute top-4 right-4 bg-background/80 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-2">
                <Headphones className="h-4 w-4" />
                <span className="text-xs font-medium">Spatial Audio</span>
              </div>
            )}
            
            {/* Chat overlay */}
            <ChatOverlay eventId={selectedEvent.id} />
          </div>
        ) : (
          // Event details and video view
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="col-span-1 lg:col-span-2">
              {selectedEvent.videoUrl ? (
                <VideoPlayer 
                  src={selectedEvent.videoUrl} 
                  title={selectedEvent.title}
                  thumbnail={selectedEvent.thumbnail}
                />
              ) : (
                <div 
                  className="w-full aspect-video bg-cover bg-center rounded-lg flex items-center justify-center"
                  style={{ backgroundImage: `url(${selectedEvent.thumbnail || 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3'})` }}
                >
                  <Button size="lg" onClick={handleEnterVR}>
                    Enter VR Experience
                  </Button>
                </div>
              )}
              
              {/* Enter VR button if video is shown */}
              {selectedEvent.videoUrl && (
                <div className="mt-4 flex justify-center">
                  <Button size="lg" onClick={handleEnterVR} className="gap-2">
                    <Headphones className="h-5 w-5" />
                    Enter Immersive VR Experience
                  </Button>
                </div>
              )}
            </div>
            
            <div className="col-span-1">
              <EventDetails event={selectedEvent} onJoin={handleEnterVR} />
            </div>
          </div>
        )}
      </div>
      
      {/* Chat for non-VR mode */}
      {!showVR && <ChatOverlay eventId={selectedEvent.id} />}
    </>
  );
}
