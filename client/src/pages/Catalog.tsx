import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useEvents } from "@/lib/stores/useEvents";
import EventCatalog from "@/components/events/EventCatalog";
import Loading from "@/components/common/Loading";

export default function Catalog() {
  const { fetchEvents, isLoading } = useEvents();
  
  // Fetch events when component mounts
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);
  
  return (
    <>
      <Helmet>
        <title>Browse Events | VREvents</title>
        <meta name="description" content="Discover and experience concerts, exhibitions, and cultural events in VR with immersive spatial audio." />
      </Helmet>
      
      <div>
        {/* Hero header */}
        <div className="bg-muted/30 py-10 mb-6">
          <div className="container mx-auto">
            <h1 className="text-3xl font-bold mb-2">Discover Events</h1>
            <p className="text-muted-foreground">
              Explore immersive VR concerts, exhibitions and cultural events
            </p>
          </div>
        </div>
        
        {isLoading ? <Loading /> : <EventCatalog />}
      </div>
    </>
  );
}
