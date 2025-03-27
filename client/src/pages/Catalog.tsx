import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useEvents } from "@/lib/stores/useEvents";
import { useAuth } from "@/lib/stores/useAuth";
import { Sparkles, Calendar, Zap, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import EventCard from "@/components/events/EventCard";
import EventFilter from "@/components/events/EventFilter";
import EventCardSkeleton from "@/components/events/EventCardSkeleton";

const ITEMS_PER_PAGE = 9;

export default function Catalog() {
  const { events, recommendations, fetchEvents, fetchRecommendations, isLoading } = useEvents();
  const { user, isAuthenticated } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState("all");
  
  // Fetch events and recommendations on mount
  useEffect(() => {
    fetchEvents();
    if (isAuthenticated && user) {
      fetchRecommendations(user.id);
    }
  }, [fetchEvents, fetchRecommendations, isAuthenticated, user]);
  
  // Filter and sort events
  const liveEvents = events.filter(event => event.isLive);
  const upcomingEvents = events
    .filter(event => new Date(event.date) > new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const featuredEvents = upcomingEvents.slice(0, 3);
  
  // Calculate pagination
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentEvents = activeTab === "all" 
    ? events.slice(startIndex, endIndex)
    : activeTab === "live"
    ? liveEvents
    : activeTab === "recommended" && recommendations
    ? recommendations
    : [];
  const totalPages = Math.ceil(events.length / ITEMS_PER_PAGE);
  
  return (
    <>
      <Helmet>
        <title>Browse Events | VirtualStage</title>
        <meta 
          name="description" 
          content="Discover and experience concerts, exhibitions, and cultural events in VR with immersive spatial audio." 
        />
      </Helmet>
      
      <div className="min-h-screen bg-background">
        {/* Hero section */}
        <div className="relative bg-muted/30 overflow-hidden">
          <div className="absolute inset-0 bg-grid-white/10" />
          <div className="container mx-auto py-16 relative">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">
              Discover Amazing Events
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl">
              Experience immersive virtual events with stunning visuals and spatial audio. 
              From concerts to exhibitions, find your next unforgettable experience.
            </p>
            
            {/* Quick stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-12">
              <div className="bg-background/50 backdrop-blur-sm p-4 rounded-lg">
                <Sparkles className="h-6 w-6 mb-2 text-primary" />
                <div className="text-2xl font-bold">{events.length}</div>
                <div className="text-sm text-muted-foreground">Total Events</div>
              </div>
              <div className="bg-background/50 backdrop-blur-sm p-4 rounded-lg">
                <Calendar className="h-6 w-6 mb-2 text-primary" />
                <div className="text-2xl font-bold">{upcomingEvents.length}</div>
                <div className="text-sm text-muted-foreground">Upcoming</div>
              </div>
              <div className="bg-background/50 backdrop-blur-sm p-4 rounded-lg">
                <Zap className="h-6 w-6 mb-2 text-primary" />
                <div className="text-2xl font-bold">{liveEvents.length}</div>
                <div className="text-sm text-muted-foreground">Live Now</div>
              </div>
              <div className="bg-background/50 backdrop-blur-sm p-4 rounded-lg">
                <Users className="h-6 w-6 mb-2 text-primary" />
                <div className="text-2xl font-bold">1000+</div>
                <div className="text-sm text-muted-foreground">Active Users</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Main content */}
        <div className="container mx-auto py-12">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <div className="lg:w-1/4">
              <div className="sticky top-4">
                <EventFilter />
              </div>
            </div>
            
            {/* Events grid */}
            <div className="flex-1">
              {/* Featured events */}
              {featuredEvents.length > 0 && activeTab === "all" && (
                <div className="mb-12">
                  <h2 className="text-2xl font-bold mb-6">Featured Events</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {featuredEvents.map(event => (
                      <EventCard 
                        key={event.id} 
                        event={event}
                        featured
                      />
                    ))}
                  </div>
                </div>
              )}
              
              {/* Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <div className="flex justify-between items-center mb-6">
                  <TabsList>
                    <TabsTrigger value="all">All Events</TabsTrigger>
                    <TabsTrigger value="live" className="relative">
                      Live Now
                      {liveEvents.length > 0 && (
                        <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground w-4 h-4 rounded-full text-xs flex items-center justify-center">
                          {liveEvents.length}
                        </span>
                      )}
                    </TabsTrigger>
                    {isAuthenticated && (
                      <TabsTrigger value="recommended">For You</TabsTrigger>
                    )}
                  </TabsList>
                </div>
                
                {/* Tab content */}
                <ScrollArea className="h-[800px] pr-4">
                  {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <EventCardSkeleton key={i} />
                      ))}
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {currentEvents.map(event => (
                          <EventCard 
                            key={event.id} 
                            event={event}
                          />
                        ))}
                      </div>
                      
                      {/* Pagination */}
                      {activeTab === "all" && totalPages > 1 && (
                        <div className="flex justify-center gap-2 mt-8">
                          <Button
                            variant="outline"
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(p => p - 1)}
                          >
                            Previous
                          </Button>
                          <div className="flex items-center gap-2">
                            {Array.from({ length: totalPages }).map((_, i) => (
                              <Button
                                key={i}
                                variant={currentPage === i + 1 ? "default" : "outline"}
                                onClick={() => setCurrentPage(i + 1)}
                              >
                                {i + 1}
                              </Button>
                            ))}
                          </div>
                          <Button
                            variant="outline"
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(p => p + 1)}
                          >
                            Next
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </ScrollArea>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
