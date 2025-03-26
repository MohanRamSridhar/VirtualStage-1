import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useEvents } from "@/lib/stores/useEvents";
import { useAuth } from "@/lib/stores/useAuth";
import EventCard from "@/components/events/EventCard";
import { ArrowRight, Music, Calendar, Ticket, Headphones } from "lucide-react";
import { Helmet } from "react-helmet-async";

export default function Home() {
  const { events, recommendations, fetchEvents, fetchRecommendations, isLoading } = useEvents();
  const { user, isAuthenticated } = useAuth();
  
  // Fetch events when component mounts
  useEffect(() => {
    fetchEvents();
    
    // Get recommendations if the user is logged in
    if (isAuthenticated && user) {
      fetchRecommendations(user.id);
    }
  }, [fetchEvents, fetchRecommendations, isAuthenticated, user]);
  
  // Get live events for hero section
  const liveEvents = events.filter(event => event.isLive);
  
  // Featured event for hero (first live event or first upcoming)
  const featuredEvent = liveEvents.length > 0
    ? liveEvents[0]
    : events.length > 0
      ? events.filter(e => new Date(e.date) > new Date()).sort((a, b) => 
          new Date(a.date).getTime() - new Date(b.date).getTime()
        )[0] || events[0]
      : null;
  
  // Get upcoming events for secondary section
  const upcomingEvents = events
    .filter(e => new Date(e.date) > new Date() && !e.isLive)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);
  
  return (
    <>
      <Helmet>
        <title>VREvents - Immersive Virtual Concerts & Cultural Events</title>
        <meta name="description" content="Experience incredible concerts and cultural events in virtual reality with immersive spatial audio and interactive features." />
      </Helmet>
      
      <div className="container mx-auto py-8">
        {/* Hero Section */}
        <section className="mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                Immersive <span className="text-primary">VR Events</span> From Anywhere
              </h1>
              <p className="text-lg text-muted-foreground">
                Experience concerts, exhibitions, and cultural events in stunning virtual reality with spatial audio and real-time interactions.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" asChild>
                  <Link to="/events">Browse Events</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/how-it-works">How It Works</Link>
                </Button>
              </div>
              
              {/* Feature highlights */}
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="flex items-center gap-2">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <Headphones className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-sm font-medium">Spatial Audio</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-sm font-medium">Live & On-Demand</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <Music className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-sm font-medium">Multiple Genres</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <Ticket className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-sm font-medium">Premium Events</span>
                </div>
              </div>
            </div>
            
            <div className="flex justify-center">
              <svg
                width="500"
                height="400"
                viewBox="0 0 500 400"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full max-w-md"
              >
                <rect x="100" y="50" width="300" height="200" rx="10" fill="#1a1a1a" />
                <circle cx="250" cy="150" r="60" fill="#3a3a3a" />
                <path d="M250 90 C190 150, 190 150, 250 210" stroke="#4a4a4a" strokeWidth="4" />
                <path d="M250 90 C310 150, 310 150, 250 210" stroke="#4a4a4a" strokeWidth="4" />
                <rect x="130" y="250" width="240" height="20" rx="5" fill="#2a2a2a" />
                <circle cx="160" cy="260" r="8" fill="#4a4a4a" />
                <rect x="180" y="255" width="170" height="10" rx="5" fill="#3a3a3a" />
                <rect x="80" y="290" width="340" height="60" rx="10" fill="#1a1a1a" />
                <text x="250" y="325" textAnchor="middle" fontSize="18" fontWeight="bold" fill="#ffffff">VR CONCERT EXPERIENCE</text>
                <circle cx="100" cy="320" r="8" fill="#4a4a4a" />
                <circle cx="120" cy="320" r="8" fill="#4a4a4a" />
                <circle cx="140" cy="320" r="8" fill="#4a4a4a" />
                <rect x="370" y="310" width="30" height="20" rx="5" fill="#3a3a3a" />
              </svg>
            </div>
          </div>
        </section>
        
        {/* Featured Event Section */}
        {featuredEvent && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Featured Event</h2>
              <Button variant="ghost" size="sm" className="gap-1" asChild>
                <Link to="/events">
                  View All <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
            
            <Card className="overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-3 min-h-[300px]">
                <div 
                  className="col-span-1 md:col-span-2 bg-cover bg-center min-h-[200px]"
                  style={{ backgroundImage: `url(${featuredEvent.thumbnail || 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3'})` }}
                >
                  {featuredEvent.isLive && (
                    <div className="bg-destructive text-destructive-foreground px-3 py-1 rounded-br-md inline-block animate-pulse">
                      LIVE NOW
                    </div>
                  )}
                </div>
                
                <CardContent className="flex flex-col justify-between p-6">
                  <div>
                    <h3 className="text-xl font-bold mb-2">{featuredEvent.title}</h3>
                    <p className="text-muted-foreground line-clamp-3 mb-4">{featuredEvent.description}</p>
                    <div className="space-y-2 mb-6">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{new Date(featuredEvent.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Music className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{featuredEvent.artist}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Ticket className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{featuredEvent.type} • {featuredEvent.genre}</span>
                      </div>
                    </div>
                  </div>
                  
                  <Button className="w-full" asChild>
                    <Link to={`/events/${featuredEvent.id}`}>
                      {featuredEvent.isLive ? "Join Now" : "View Details"}
                    </Link>
                  </Button>
                </CardContent>
              </div>
            </Card>
          </section>
        )}
        
        {/* Upcoming Events Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Upcoming Events</h2>
            <Button variant="ghost" size="sm" className="gap-1" asChild>
              <Link to="/events">
                View All <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <Card key={i} className="overflow-hidden">
                  <div className="h-48 bg-muted animate-pulse" />
                  <CardContent className="p-4">
                    <div className="h-6 bg-muted animate-pulse rounded-md mb-4" />
                    <div className="space-y-2">
                      <div className="h-4 bg-muted animate-pulse rounded-md w-3/4" />
                      <div className="h-4 bg-muted animate-pulse rounded-md w-1/2" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : upcomingEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {upcomingEvents.map(event => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">No upcoming events at the moment. Check back soon!</p>
            </Card>
          )}
        </section>
        
        {/* Personalized Recommendations Section */}
        {isAuthenticated && recommendations.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Recommended For You</h2>
              <Button variant="ghost" size="sm" className="gap-1" asChild>
                <Link to="/events">
                  View All <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recommendations.slice(0, 3).map(event => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
