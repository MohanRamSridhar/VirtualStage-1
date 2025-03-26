import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/lib/stores/useAuth";
import { toast } from "sonner";

// Sample music genres
const musicGenres = [
  "rock", "pop", "classical", "jazz", "electronic", 
  "hip-hop", "r&b", "country", "folk", "metal", 
  "indie", "alternative", "dance", "reggae", "blues"
];

// Sample artists
const popularArtists = [
  "Digital Pulse Collective",
  "Virtual Symphony Orchestra",
  "The Rock Legends",
  "The Virtual Jazz Quartet",
  "Electronic Pioneers",
  "Classical Masters",
  "Hip-Hop Virtuosos",
  "Pop Sensation"
];

interface PreferencesFormProps {
  user: any;
  onDone: () => void;
}

export default function PreferencesForm({ user, onDone }: PreferencesFormProps) {
  const { updatePreferences } = useAuth();
  
  // Initialize form state with user's current preferences or defaults
  const [formState, setFormState] = useState({
    displayName: user.displayName || "",
    genres: user.preferences?.genres || [],
    favoriteArtists: user.preferences?.favoriteArtists || [],
    audioQuality: user.preferences?.audioQuality || "medium",
    notificationSettings: {
      email: user.preferences?.notificationSettings?.email ?? true,
      inApp: user.preferences?.notificationSettings?.inApp ?? true,
    },
    accessibility: {
      subtitles: user.preferences?.accessibility?.subtitles ?? false,
      highContrast: user.preferences?.accessibility?.highContrast ?? false,
    }
  });
  
  const handleGenreToggle = (genre: string) => {
    setFormState(prev => {
      const isSelected = prev.genres.includes(genre);
      const newGenres = isSelected
        ? prev.genres.filter(g => g !== genre)
        : [...prev.genres, genre];
      
      return {
        ...prev,
        genres: newGenres
      };
    });
  };
  
  const handleArtistToggle = (artist: string) => {
    setFormState(prev => {
      const isSelected = prev.favoriteArtists.includes(artist);
      const newArtists = isSelected
        ? prev.favoriteArtists.filter(a => a !== artist)
        : [...prev.favoriteArtists, artist];
      
      return {
        ...prev,
        favoriteArtists: newArtists
      };
    });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const preferences = {
        genres: formState.genres,
        favoriteArtists: formState.favoriteArtists,
        audioQuality: formState.audioQuality as "low" | "medium" | "high",
        notificationSettings: formState.notificationSettings,
        accessibility: formState.accessibility
      };
      
      await updatePreferences(preferences);
      toast.success("Preferences updated successfully");
      onDone();
    } catch (error) {
      console.error("Error updating preferences:", error);
      toast.error("Failed to update preferences");
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="displayName">Display Name</Label>
        <Input
          id="displayName"
          value={formState.displayName}
          onChange={(e) => setFormState(prev => ({
            ...prev,
            displayName: e.target.value
          }))}
          placeholder="How others will see you"
        />
      </div>
      
      <div className="space-y-2">
        <Label>Favorite Music Genres</Label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {musicGenres.map((genre) => (
            <div key={genre} className="flex items-center space-x-2">
              <Checkbox
                id={`genre-${genre}`}
                checked={formState.genres.includes(genre)}
                onCheckedChange={() => handleGenreToggle(genre)}
              />
              <label
                htmlFor={`genre-${genre}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 capitalize"
              >
                {genre}
              </label>
            </div>
          ))}
        </div>
      </div>
      
      <div className="space-y-2">
        <Label>Favorite Artists</Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {popularArtists.map((artist) => (
            <div key={artist} className="flex items-center space-x-2">
              <Checkbox
                id={`artist-${artist.replace(/\s+/g, '-')}`}
                checked={formState.favoriteArtists.includes(artist)}
                onCheckedChange={() => handleArtistToggle(artist)}
              />
              <label
                htmlFor={`artist-${artist.replace(/\s+/g, '-')}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {artist}
              </label>
            </div>
          ))}
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="audioQuality">Audio Quality</Label>
        <Select
          value={formState.audioQuality}
          onValueChange={(value) => setFormState(prev => ({
            ...prev,
            audioQuality: value as "low" | "medium" | "high"
          }))}
        >
          <SelectTrigger id="audioQuality">
            <SelectValue placeholder="Select quality" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Low (Save Data)</SelectItem>
            <SelectItem value="medium">Medium (Balanced)</SelectItem>
            <SelectItem value="high">High (Best Quality)</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground mt-1">
          Higher quality requires better internet connection
        </p>
      </div>
      
      <div className="space-y-2">
        <Label>Notification Settings</Label>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="email-notifications"
              checked={formState.notificationSettings.email}
              onCheckedChange={(checked) => setFormState(prev => ({
                ...prev,
                notificationSettings: {
                  ...prev.notificationSettings,
                  email: checked === true
                }
              }))}
            />
            <label
              htmlFor="email-notifications"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Email notifications
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="inapp-notifications"
              checked={formState.notificationSettings.inApp}
              onCheckedChange={(checked) => setFormState(prev => ({
                ...prev,
                notificationSettings: {
                  ...prev.notificationSettings,
                  inApp: checked === true
                }
              }))}
            />
            <label
              htmlFor="inapp-notifications"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              In-app notifications
            </label>
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label>Accessibility</Label>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="subtitles"
              checked={formState.accessibility.subtitles}
              onCheckedChange={(checked) => setFormState(prev => ({
                ...prev,
                accessibility: {
                  ...prev.accessibility,
                  subtitles: checked === true
                }
              }))}
            />
            <label
              htmlFor="subtitles"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Enable subtitles when available
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="high-contrast"
              checked={formState.accessibility.highContrast}
              onCheckedChange={(checked) => setFormState(prev => ({
                ...prev,
                accessibility: {
                  ...prev.accessibility,
                  highContrast: checked === true
                }
              }))}
            />
            <label
              htmlFor="high-contrast"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              High contrast mode
            </label>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit">
          Save Changes
        </Button>
      </div>
    </form>
  );
}
