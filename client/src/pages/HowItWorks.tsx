import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Headphones, Laptop, Users, Headset, Settings, Globe } from "lucide-react";

export default function HowItWorks() {
  return (
    <>
      <Helmet>
        <title>How It Works - VREvents</title>
      </Helmet>
      
      <div className="container mx-auto py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold mb-4">How VREvents Works</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Experience concerts and cultural events in an immersive virtual reality environment with cutting-edge technology.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Headset className="h-6 w-6 text-primary" />
                  <span>Immersive VR Experience</span>
                </CardTitle>
                <CardDescription>
                  Full 3D environment with realistic visuals
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>
                  Our platform creates fully immersive 3D environments tailored to each event type. 
                  Whether you're attending a concert, art exhibition, or theater performance, the
                  environment is designed to enhance your experience with realistic visuals and
                  interactive elements.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Headphones className="h-6 w-6 text-primary" />
                  <span>Spatial Audio Technology</span>
                </CardTitle>
                <CardDescription>
                  Experience sound from all directions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>
                  Our advanced spatial audio technology creates a three-dimensional sound field,
                  allowing you to hear music and sounds exactly as you would in a real venue.
                  As you move through the virtual space, the audio dynamically adjusts, creating
                  a truly immersive auditory experience.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-6 w-6 text-primary" />
                  <span>Real-time Interaction</span>
                </CardTitle>
                <CardDescription>
                  Engage with performers and other attendees
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>
                  VREvents isn't just about watching - it's about participating. Chat with other
                  attendees, send reactions in real-time, and even interact with performers
                  during live events. Our platform breaks down the barriers between audience
                  and artists.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Laptop className="h-6 w-6 text-primary" />
                  <span>Multi-Platform Support</span>
                </CardTitle>
                <CardDescription>
                  Access on VR headsets, desktop, or mobile
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>
                  While VR headsets provide the most immersive experience, you can join events
                  from any device. Our platform is optimized for desktop browsers and mobile
                  devices, ensuring you never miss an event, regardless of the technology
                  you have available.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-6 w-6 text-primary" />
                  <span>Live & On-Demand Events</span>
                </CardTitle>
                <CardDescription>
                  Never miss a moment with flexible viewing options
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>
                  Join events as they happen with our live streaming technology, or watch
                  on-demand at your convenience. Our platform preserves the full interactive
                  experience for on-demand viewing, allowing you to enjoy events on your
                  own schedule.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-6 w-6 text-primary" />
                  <span>Personalized Recommendations</span>
                </CardTitle>
                <CardDescription>
                  Discover events tailored to your preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>
                  Our recommendation system learns your preferences over time, suggesting
                  events that match your interests. Select your favorite genres, artists,
                  and event types in your profile settings to receive personalized
                  recommendations right from the start.
                </p>
              </CardContent>
            </Card>
          </div>
          
          <div className="bg-muted rounded-lg p-8 mb-16">
            <h2 className="text-2xl font-bold mb-4">Getting Started</h2>
            <ol className="space-y-4 list-decimal list-inside">
              <li className="text-lg">
                <span className="font-medium">Create an account</span> - Sign up to access all features and save your preferences
              </li>
              <li className="text-lg">
                <span className="font-medium">Browse upcoming events</span> - Explore our catalog of virtual concerts and cultural events
              </li>
              <li className="text-lg">
                <span className="font-medium">Select your device</span> - Choose whether to join via VR headset, desktop, or mobile
              </li>
              <li className="text-lg">
                <span className="font-medium">Join an event</span> - Enter the virtual environment and enjoy the immersive experience
              </li>
              <li className="text-lg">
                <span className="font-medium">Interact and enjoy</span> - Chat with others, send reactions, and fully immerse yourself
              </li>
            </ol>
          </div>
          
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Ready to Experience VREvents?</h2>
            <p className="text-lg text-muted-foreground mb-6">
              Join our community and discover a new way to experience live events
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <Link to="/events">Browse Events</Link>
              </Button>
              <Button variant="outline" asChild size="lg">
                <Link to="/register">Create Account</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}