import { useState, useEffect } from "react";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Volume2, VolumeX, Music, Zap } from "lucide-react";
import { useAudioControl } from "@/lib/stores/useAudioControl";
import { useAudio } from "@/lib/stores/useAudio";

export default function AudioManager() {
  const { 
    masterVolume, 
    musicVolume, 
    sfxVolume, 
    spatialAudioEnabled,
    setMasterVolume, 
    setMusicVolume, 
    setSfxVolume,
    toggleSpatialAudio 
  } = useAudioControl();
  
  // Access the base audio store for background music
  const { isMuted, toggleMute, backgroundMusic } = useAudio();
  
  // Local state to track mute state
  const [muted, setMuted] = useState(isMuted);
  
  // Sync local state with store
  useEffect(() => {
    setMuted(isMuted);
  }, [isMuted]);
  
  // Handle master volume change
  const handleMasterVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setMasterVolume(newVolume);
    
    // Also update background music volume if it exists
    if (backgroundMusic) {
      backgroundMusic.volume = newVolume * musicVolume;
    }
  };
  
  // Handle music volume change
  const handleMusicVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setMusicVolume(newVolume);
    
    // Also update background music volume if it exists
    if (backgroundMusic) {
      backgroundMusic.volume = masterVolume * newVolume;
    }
  };
  
  // Handle SFX volume change
  const handleSfxVolumeChange = (value: number[]) => {
    setSfxVolume(value[0]);
  };
  
  // Handle mute toggle
  const handleMuteToggle = () => {
    toggleMute();
    
    // If we're unmuting, make sure volume is not zero
    if (isMuted && masterVolume === 0) {
      setMasterVolume(0.5);
    }
  };
  
  // Toggle spatial audio
  const handleSpatialAudioToggle = () => {
    toggleSpatialAudio();
  };
  
  // Play test sound for settings verification
  const playTestSound = () => {
    const audio = new Audio("/sounds/hit.mp3");
    audio.volume = masterVolume * sfxVolume;
    audio.play();
  };
  
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Volume2 className="h-5 w-5" />
          Audio Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Master Volume */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="master-volume" className="flex items-center gap-2">
              {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              Master Volume
            </Label>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleMuteToggle}
              className="h-8 px-2"
            >
              {muted ? "Unmute" : "Mute"}
            </Button>
          </div>
          <Slider
            id="master-volume"
            min={0}
            max={1}
            step={0.01}
            value={[masterVolume]}
            onValueChange={handleMasterVolumeChange}
            disabled={muted}
          />
        </div>
        
        {/* Music Volume */}
        <div className="space-y-2">
          <Label htmlFor="music-volume" className="flex items-center gap-2">
            <Music className="h-4 w-4" />
            Music Volume
          </Label>
          <Slider
            id="music-volume"
            min={0}
            max={1}
            step={0.01}
            value={[musicVolume]}
            onValueChange={handleMusicVolumeChange}
            disabled={muted}
          />
        </div>
        
        {/* SFX Volume */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="sfx-volume" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Effects Volume
            </Label>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={playTestSound}
              className="h-8"
              disabled={muted}
            >
              Test
            </Button>
          </div>
          <Slider
            id="sfx-volume"
            min={0}
            max={1}
            step={0.01}
            value={[sfxVolume]}
            onValueChange={handleSfxVolumeChange}
            disabled={muted}
          />
        </div>
        
        {/* Spatial Audio Toggle */}
        <div className="flex items-center justify-between">
          <Label htmlFor="spatial-audio" className="cursor-pointer">
            3D Spatial Audio
          </Label>
          <Switch
            id="spatial-audio"
            checked={spatialAudioEnabled}
            onCheckedChange={handleSpatialAudioToggle}
            disabled={muted}
          />
        </div>
        
        <div className="bg-muted p-3 rounded-md text-sm text-muted-foreground">
          <p>
            Spatial audio creates a 3D sound experience, making sounds feel like they're coming from specific locations in the virtual environment.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
