import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  SkipBack,
  SkipForward,
} from "lucide-react";
import { useAudioControl } from "@/lib/stores/useAudioControl";

interface VideoPlayerProps {
  src: string;
  title?: string;
  thumbnail?: string;
  onEnded?: () => void;
}

export default function VideoPlayer({ src, title, thumbnail, onEnded }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  
  // Get audio settings from the global store
  const { masterVolume } = useAudioControl();
  
  // Effect to set volume based on master volume
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume * masterVolume;
    }
  }, [volume, masterVolume]);
  
  // Hide controls after inactivity
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const handleMouseMove = () => {
      setShowControls(true);
      clearTimeout(timeoutId);
      
      if (isPlaying) {
        timeoutId = setTimeout(() => {
          setShowControls(false);
        }, 3000);
      }
    };
    
    const playerElement = playerRef.current;
    if (playerElement) {
      playerElement.addEventListener("mousemove", handleMouseMove);
      
      return () => {
        playerElement.removeEventListener("mousemove", handleMouseMove);
        clearTimeout(timeoutId);
      };
    }
  }, [isPlaying]);
  
  // Handle video metadata loaded
  const handleMetadataLoaded = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };
  
  // Update current time during playback
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };
  
  // Toggle play/pause
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
      setShowControls(true);
    }
  };
  
  // Toggle mute
  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };
  
  // Change volume
  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    if (videoRef.current) {
      videoRef.current.volume = newVolume * masterVolume;
      
      // If we're adjusting volume upward from zero, unmute
      if (newVolume > 0 && isMuted) {
        videoRef.current.muted = false;
        setIsMuted(false);
      }
      
      // If we set volume to zero, mute
      if (newVolume === 0 && !isMuted) {
        videoRef.current.muted = true;
        setIsMuted(true);
      }
      
      setVolume(newVolume);
    }
  };
  
  // Seek in video
  const handleSeek = (value: number[]) => {
    const seekTime = value[0];
    if (videoRef.current) {
      videoRef.current.currentTime = seekTime;
      setCurrentTime(seekTime);
    }
  };
  
  // Skip forward or backward
  const handleSkip = (seconds: number) => {
    if (videoRef.current) {
      const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };
  
  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!playerRef.current) return;
    
    if (!isFullscreen) {
      if (playerRef.current.requestFullscreen) {
        playerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };
  
  // Update fullscreen state when it changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === playerRef.current);
    };
    
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);
  
  // Format time in MM:SS format
  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };
  
  return (
    <div 
      ref={playerRef}
      className="relative w-full aspect-video bg-black rounded-lg overflow-hidden group"
      onClick={togglePlay}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        src={src}
        poster={thumbnail}
        className="w-full h-full object-contain"
        onLoadedMetadata={handleMetadataLoaded}
        onTimeUpdate={handleTimeUpdate}
        onEnded={onEnded}
        onClick={(e) => e.stopPropagation()}
      />
      
      {/* Title Overlay */}
      {title && showControls && (
        <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/60 to-transparent">
          <h3 className="text-white font-medium">{title}</h3>
        </div>
      )}
      
      {/* Controls Overlay */}
      {showControls && (
        <div 
          className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Progress bar */}
          <Slider
            value={[currentTime]}
            min={0}
            max={duration}
            step={0.1}
            onValueChange={handleSeek}
            className="w-full h-1.5 mb-4"
          />
          
          <div className="flex items-center justify-between">
            {/* Left controls: play/pause and time */}
            <div className="flex items-center gap-3">
              <Button
                size="icon"
                variant="ghost"
                className="text-white hover:bg-white/20 h-8 w-8"
                onClick={togglePlay}
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              
              <Button
                size="icon"
                variant="ghost"
                className="text-white hover:bg-white/20 h-8 w-8"
                onClick={() => handleSkip(-10)}
              >
                <SkipBack className="h-4 w-4" />
              </Button>
              
              <Button
                size="icon"
                variant="ghost"
                className="text-white hover:bg-white/20 h-8 w-8"
                onClick={() => handleSkip(10)}
              >
                <SkipForward className="h-4 w-4" />
              </Button>
              
              <span className="text-white text-sm">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>
            
            {/* Right controls: volume and fullscreen */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Button
                  size="icon"
                  variant="ghost"
                  className="text-white hover:bg-white/20 h-8 w-8"
                  onClick={toggleMute}
                >
                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </Button>
                
                <Slider
                  value={[isMuted ? 0 : volume]}
                  min={0}
                  max={1}
                  step={0.01}
                  onValueChange={handleVolumeChange}
                  className="w-20"
                />
              </div>
              
              <Button
                size="icon"
                variant="ghost"
                className="text-white hover:bg-white/20 h-8 w-8"
                onClick={toggleFullscreen}
              >
                {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Big play button in the center when paused */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Button
            size="icon"
            className="bg-primary/80 hover:bg-primary h-16 w-16 rounded-full"
            onClick={togglePlay}
          >
            <Play className="h-8 w-8" />
          </Button>
        </div>
      )}
    </div>
  );
}
