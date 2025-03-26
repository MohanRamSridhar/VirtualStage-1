import { useEffect, useState } from "react";
import { Grid, List, LayoutGrid, Filter, ChevronDown } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EventCard from "./EventCard";
import EventFilter from "./EventFilter";
import { useEvents } from "@/lib/stores/useEvents";
import { useAuth } from "@/lib/stores/useAuth";

export default function EventCatalog() {
  const { events, fetchEvents, recommendations, fetchRecommendations, isLoading, error } = useEvents();
  const { user, isAuthenticated } = useAuth();
  
  // View modes: grid or list
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  
  // State for filter visibility on mobile
  const [showFilters, setShowFilters] = useState(false);
  
  // Fetch events on component mount (only once)
  useEffect(() => {
    // Using an IIFE to avoid dependency on fetchEvents function reference
    (async () => {
      await fetchEvents();
      
      // Fetch recommendations if user is authenticated
      if (isAuthenticated && user) {
        await fetchRecommendations(user.id);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user?.id]);
  
  // Get upcoming events for the featured section
  const upcomingEvents = events.filter(
    event => new Date(event.date) > new Date()
  ).sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  ).slice(0, 3);
  
  // Get live events
  const liveEvents = events.filter(event => event.isLive);
  
  // Group events by type
  const eventsByType = events.reduce((acc, event) => {
    if (!acc[event.type]) {
      acc[event.type] = [];
    }
    acc[event.type].push(event);
    return acc;
  }, {} as Record<string, typeof events>);
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Filter sidebar - hidden on mobile */}
        <div className={`lg:block lg:w-1/4 ${showFilters ? "block" : "hidden"}`}>
          <EventFilter />
        </div>
        
        {/* Main content */}
        <div className="flex-1">
          {/* Mobile controls */}
          <div className="lg:hidden flex justify-between mb-4">
            <Button 
              variant="outline" 
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              <ChevronDown className="h-4 w-4 ml-2" />
            </Button>
            
            <div className="flex">
              <Toggle
                pressed={viewMode === "grid"}
                onPressedChange={() => setViewMode("grid")}
                aria-label="Grid view"
              >
                <LayoutGrid className="h-4 w-4" />
              </Toggle>
              <Toggle
                pressed={viewMode === "list"}
                onPressedChange={() => setViewMode("list")}
                aria-label="List view"
              >
                <List className="h-4 w-4" />
              </Toggle>
            </div>
          </div>
          
          {/* Event tabs */}
          <Tabs defaultValue="all">
            <div className="flex justify-between items-center mb-6">
              <TabsList>
                <TabsTrigger value="all">All Events</TabsTrigger>
                <TabsTrigger value="live" className="relative">
                  Live Now
                  {liveEvents.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground w-4 h-4 rounded-full text-xs flex items-center justify-center">
                      {liveEvents.length}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="categories">Categories</TabsTrigger>
                {isAuthenticated && (
                  <TabsTrigger value="recommended">For You</TabsTrigger>
                )}
              </TabsList>
              
              {/* Desktop view mode toggles */}
              <div className="hidden lg:flex border rounded-md">
                <Toggle
                  pressed={viewMode === "grid"}
                  onPressedChange={() => setViewMode("grid")}
                  className="rounded-none border-0"
                  aria-label="Grid view"
                >
                  <LayoutGrid className="h-4 w-4" />
                </Toggle>
                <Toggle
                  pressed={viewMode === "list"}
                  onPressedChange={() => setViewMode("list")}
                  className="rounded-none border-0"
                  aria-label="List view"
                >
                  <List className="h-4 w-4" />
                </Toggle>
              </div>
            </div>
            
            {/* Loading and error states */}
            {isLoading && (
              <div className="flex justify-center py-10">
                <div className="animate-spin h-8 w-8 border-t-2 border-primary rounded-full" />
              </div>
            )}
            
            {error && (
              <div className="bg-destructive/10 text-destructive p-4 rounded-md">
                {error}
              </div>
            )}
            
            {/* All events tab */}
            <TabsContent value="all">
              {upcomingEvents.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-2xl font-bold mb-4">Featured Events</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {upcomingEvents.map(event => (
                      <EventCard key={event.id} event={event} />
                    ))}
                  </div>
                </div>
              )}
              
              <h2 className="text-2xl font-bold mb-4">All Events</h2>
              {events.length === 0 ? (
                <p className="text-muted-foreground py-10 text-center">No events found matching your criteria.</p>
              ) : (
                <div className={viewMode === "grid" 
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" 
                  : "space-y-4"
                }>
                  {events.map(event => (
                    <EventCard 
                      key={event.id} 
                      event={event}
                      compact={viewMode === "list"} 
                    />
                  ))}
                </div>
              )}
            </TabsContent>
            
            {/* Live events tab */}
            <TabsContent value="live">
              <h2 className="text-2xl font-bold mb-4">Live Now</h2>
              {liveEvents.length === 0 ? (
                <div className="bg-muted p-10 rounded-lg text-center">
                  <p className="text-lg mb-2">No live events at the moment</p>
                  <p className="text-muted-foreground">Check back soon for upcoming live events!</p>
                </div>
              ) : (
                <div className={viewMode === "grid" 
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" 
                  : "space-y-4"
                }>
                  {liveEvents.map(event => (
                    <EventCard 
                      key={event.id} 
                      event={event} 
                      compact={viewMode === "list"}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
            
            {/* Categories tab */}
            <TabsContent value="categories">
              {Object.entries(eventsByType).map(([type, events]) => (
                <div key={type} className="mb-8">
                  <h2 className="text-2xl font-bold mb-4 capitalize">{type}s</h2>
                  <div className={viewMode === "grid" 
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" 
                    : "space-y-4"
                  }>
                    {events.map(event => (
                      <EventCard 
                        key={event.id} 
                        event={event} 
                        compact={viewMode === "list"}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </TabsContent>
            
            {/* Recommended events tab */}
            {isAuthenticated && (
              <TabsContent value="recommended">
                <h2 className="text-2xl font-bold mb-4">Recommended For You</h2>
                {recommendations.length === 0 ? (
                  <div className="bg-muted p-10 rounded-lg text-center">
                    <p className="text-lg mb-2">No recommendations yet</p>
                    <p className="text-muted-foreground">Interact with more events to get personalized recommendations!</p>
                  </div>
                ) : (
                  <div className={viewMode === "grid" 
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" 
                    : "space-y-4"
                  }>
                    {recommendations.map(event => (
                      <EventCard 
                        key={event.id} 
                        event={event} 
                        compact={viewMode === "list"}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>
    </div>
  );
}
