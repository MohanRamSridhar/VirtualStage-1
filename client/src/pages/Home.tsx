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
      
      {/* Hero Section with gradient background */}
      <section className="hero-section py-16 mb-12">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6 px-4 md:px-0">
              <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                Experience <span className="text-purple-200">Live Events</span> in Virtual Reality
              </h1>
              <p className="text-xl text-purple-100">
                Join concerts, exhibitions, and cultural events from anywhere in the world with stunning VR and spatial audio.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-white text-purple-900 hover:bg-purple-100" asChild>
                  <Link to="/events">Browse Events</Link>
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/20" asChild>
                  <Link to="/how-it-works">How It Works</Link>
                </Button>
              </div>
              
              {/* Feature highlights */}
              <div className="grid grid-cols-2 gap-6 pt-4">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-3 rounded-full">
                    <Headphones className="h-6 w-6 text-white" />
                  </div>
                  <span className="font-medium text-white">3D Spatial Audio</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-3 rounded-full">
                    <Calendar className="h-6 w-6 text-white" />
                  </div>
                  <span className="font-medium text-white">Live & On-Demand</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-3 rounded-full">
                    <Music className="h-6 w-6 text-white" />
                  </div>
                  <span className="font-medium text-white">Multiple Genres</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-3 rounded-full">
                    <Ticket className="h-6 w-6 text-white" />
                  </div>
                  <span className="font-medium text-white">Premium Events</span>
                </div>
              </div>
            </div>
            
            <div className="relative hidden md:block">
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
              <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
              
              <div className="relative">
                <div className="bg-black/40 backdrop-blur-sm p-6 rounded-xl shadow-2xl border border-white/10">
                  <div className="aspect-video rounded-lg overflow-hidden bg-black/60 border border-white/10 mb-4">
                    <div className="h-full flex items-center justify-center">
                      <svg width="200" height="120" viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg">
                        <rect x="20" y="20" width="160" height="80" rx="5" fill="#1a1a1a" />
                        <path d="M100 30 C70 60, 70 60, 100 90" stroke="#8b5cf6" strokeWidth="4" />
                        <path d="M100 30 C130 60, 130 60, 100 90" stroke="#8b5cf6" strokeWidth="4" />
                        <circle cx="100" cy="60" r="10" fill="#8b5cf6" />
                        <rect x="80" y="95" width="40" height="6" rx="3" fill="#8b5cf6" />
                      </svg>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-white font-bold">Live Now</div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse mr-1"></div>
                      <span className="text-red-400 text-sm">2.4K watching</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between">
                    <div className="flex gap-2">
                      <div className="w-8 h-8 rounded-full bg-white/10"></div>
                      <div className="w-8 h-8 rounded-full bg-white/10"></div>
                      <div className="w-8 h-8 rounded-full bg-white/10"></div>
                    </div>
                    <Button size="sm" className="bg-purple-600 text-white hover:bg-purple-700">Join VR</Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <div className="container mx-auto px-4 py-8">
        
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
