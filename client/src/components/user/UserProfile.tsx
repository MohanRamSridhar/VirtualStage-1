import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/lib/stores/useAuth";
import { useEvents } from "@/lib/stores/useEvents";
import PreferencesForm from "./PreferencesForm";
import EventCard from "@/components/events/EventCard";
import { Badge } from "@/components/ui/badge";
import { PencilIcon, CalendarIcon, SettingsIcon } from "lucide-react";

export default function UserProfile() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const { events } = useEvents();

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Please login to view your profile</p>
        <Button className="mt-4" asChild>
          <a href="/login">Login</a>
        </Button>
      </div>
    );
  }

  // Get user's bookmarked events (this would normally come from the backend)
  const bookmarkedEvents = events.slice(0, 2); // Placeholder for demo

  return (
    <div className="container max-w-4xl mx-auto py-8">
      <Card className="mb-8">
        <CardHeader className="relative pb-0">
          <Button 
            variant="ghost" 
            size="sm" 
            className="absolute right-4 top-4"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? "Cancel" : <PencilIcon className="h-4 w-4" />}
          </Button>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user.avatar || undefined} alt={user.displayName || user.username} />
              <AvatarFallback>
                {(user.displayName || user.username || "U").charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl">{user.displayName || user.username}</CardTitle>
              <CardDescription>{user.email}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {isEditing ? (
            <PreferencesForm user={user} onDone={() => setIsEditing(false)} />
          ) : (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Favorite Genres</h3>
                <div className="flex flex-wrap gap-2">
                  {user.preferences?.genres?.map((genre) => (
                    <Badge key={genre} variant="secondary">
                      {genre}
                    </Badge>
                  )) || <span className="text-muted-foreground text-sm">No preferences set</span>}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Favorite Artists</h3>
                <div className="flex flex-wrap gap-2">
                  {user.preferences?.favoriteArtists?.map((artist) => (
                    <Badge key={artist} variant="outline">
                      {artist}
                    </Badge>
                  )) || <span className="text-muted-foreground text-sm">No favorite artists set</span>}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Audio Quality</h3>
                <Badge variant="outline" className="capitalize">
                  {user.preferences?.audioQuality || "medium"}
                </Badge>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Accessibility Settings</h3>
                <div className="flex gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className={`h-3 w-3 rounded-full ${user.preferences?.accessibility?.subtitles ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <span>Subtitles</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`h-3 w-3 rounded-full ${user.preferences?.accessibility?.highContrast ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <span>High Contrast</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="bookmarked">
        <TabsList className="mb-6">
          <TabsTrigger value="bookmarked" className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4" />
            Bookmarked Events
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <SettingsIcon className="h-4 w-4" />
            Account Settings
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="bookmarked">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {bookmarkedEvents.length > 0 ? (
              bookmarkedEvents.map(event => (
                <EventCard key={event.id} event={event} />
              ))
            ) : (
              <div className="col-span-2 text-center py-10 bg-muted/30 rounded-lg">
                <h3 className="font-medium text-lg mb-2">No bookmarked events yet</h3>
                <p className="text-muted-foreground mb-4">
                  Browse events and bookmark the ones you're interested in
                </p>
                <Button asChild>
                  <a href="/events">Browse Events</a>
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>Manage your account settings and preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <div className="font-medium">Email Notifications</div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Event reminders</span>
                  <div className={`h-5 w-10 rounded-full ${user.preferences?.notificationSettings?.email ? 'bg-primary' : 'bg-gray-300'} relative`}>
                    <div className={`absolute h-4 w-4 rounded-full bg-white top-0.5 transition-all ${user.preferences?.notificationSettings?.email ? 'right-0.5' : 'left-0.5'}`}></div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">New events from favorites</span>
                  <div className={`h-5 w-10 rounded-full ${user.preferences?.notificationSettings?.email ? 'bg-primary' : 'bg-gray-300'} relative`}>
                    <div className={`absolute h-4 w-4 rounded-full bg-white top-0.5 transition-all ${user.preferences?.notificationSettings?.email ? 'right-0.5' : 'left-0.5'}`}></div>
                  </div>
                </div>
              </div>
              
              <div className="grid gap-2">
                <div className="font-medium">In-App Notifications</div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Live event alerts</span>
                  <div className={`h-5 w-10 rounded-full ${user.preferences?.notificationSettings?.inApp ? 'bg-primary' : 'bg-gray-300'} relative`}>
                    <div className={`absolute h-4 w-4 rounded-full bg-white top-0.5 transition-all ${user.preferences?.notificationSettings?.inApp ? 'right-0.5' : 'left-0.5'}`}></div>
                  </div>
                </div>
              </div>
              
              <div className="grid gap-2">
                <div className="font-medium">Security</div>
                <Button variant="outline" className="justify-start" size="sm">
                  Change Password
                </Button>
                <Button variant="outline" className="justify-start" size="sm">
                  Two-Factor Authentication
                </Button>
              </div>
              
              <div className="pt-4 border-t">
                <Button variant="destructive" size="sm">
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
