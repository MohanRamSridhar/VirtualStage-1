import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useAuth } from "@/lib/stores/useAuth";
import { useEvents } from "@/lib/stores/useEvents";
import UserProfile from "@/components/user/UserProfile";
import AudioManager from "@/components/audio/AudioManager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VolumeIcon, UserIcon } from "lucide-react";

export default function Profile() {
  const { user, isAuthenticated } = useAuth();
  const { fetchEvents } = useEvents();
  
  // Fetch events on component mount for user's bookmarked events
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);
  
  return (
    <>
      <Helmet>
        <title>{isAuthenticated ? `${user?.displayName || user?.username} | VREvents` : "Profile | VREvents"}</title>
      </Helmet>
      
      <div className="container mx-auto py-8">
        <Tabs defaultValue="profile">
          <div className="flex justify-center mb-6">
            <TabsList>
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <UserIcon className="h-4 w-4" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="audio" className="flex items-center gap-2">
                <VolumeIcon className="h-4 w-4" />
                Audio Settings
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="profile">
            <UserProfile />
          </TabsContent>
          
          <TabsContent value="audio">
            <div className="flex justify-center">
              <AudioManager />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
