import { useEffect, useRef, useState } from "react";
import { useAudio } from "../../lib/stores/useAudio";
import { useAudioControl } from "../../lib/stores/useAudioControl";

interface EventAudioProps {
  eventType: string;
  genre?: string;
  environment: string;
  isActive: boolean;
}

// Audio track mapping by event and genre types
const AUDIO_TRACKS: { [key: string]: string } = {
  // By event type
  "concert": "/sounds/background.mp3",
  "theater": "/sounds/background.mp3",
  "exhibition": "/sounds/background.mp3",
  "conference": "/sounds/background.mp3",
  
  // By genre
  "rock": "/sounds/background.mp3",
  "electronic": "/sounds/background.mp3",
  "jazz": "/sounds/background.mp3",
  "classical": "/sounds/background.mp3",
  "opera": "/sounds/background.mp3",
  "art": "/sounds/background.mp3",
  "technology": "/sounds/background.mp3",
  "dance": "/sounds/background.mp3",
};

// Volume levels by environment
const ENVIRONMENT_VOLUMES: { [key: string]: number } = {
  "stadium": 0.8,
  "arena": 0.7,
  "theater": 0.5,
  "gallery": 0.3,
  "club": 0.6,
  "conference_hall": 0.4,
  "outdoor_amphitheater": 0.7,
};

export default function EventAudio({ eventType, genre, environment, isActive }: EventAudioProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentTrack, setCurrentTrack] = useState<string>("/sounds/background.mp3");
  const [volume, setVolume] = useState<number>(0.5);

  // Get audio context and control functions
  const { initAudioContext, spatialAudioEnabled } = useAudioControl();
  const { isMuted } = useAudio();

  // Determine which audio track to play
  useEffect(() => {
    // First try to match by genre for more specific music
    if (genre && AUDIO_TRACKS[genre.toLowerCase()]) {
      setCurrentTrack(AUDIO_TRACKS[genre.toLowerCase()]);
    } 
    // Fall back to event type
    else if (eventType && AUDIO_TRACKS[eventType.toLowerCase()]) {
      setCurrentTrack(AUDIO_TRACKS[eventType.toLowerCase()]);
    }
    // Default track
    else {
      setCurrentTrack("/sounds/background.mp3");
    }
    
    // Set volume based on environment
    if (environment && ENVIRONMENT_VOLUMES[environment]) {
      setVolume(ENVIRONMENT_VOLUMES[environment]);
    } else {
      setVolume(0.5);
    }
  }, [eventType, genre, environment]);

  // Initialize and play audio
  useEffect(() => {
    // Initialize audio context
    initAudioContext();
    
    if (isActive) {
      // Create audio element if it doesn't exist
      if (!audioRef.current) {
        audioRef.current = new Audio(currentTrack);
        audioRef.current.loop = true;
        audioRef.current.volume = isMuted ? 0 : volume;
      } else {
        // Update existing audio element
        audioRef.current.src = currentTrack;
        audioRef.current.volume = isMuted ? 0 : volume;
      }
      
      // Play audio
      audioRef.current.play().catch(error => {
        console.error("Audio play prevented:", error);
      });
    }
    
    return () => {
      // Clean up when component unmounts or track changes
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  }, [currentTrack, isActive, isMuted, volume, initAudioContext]);

  // Update volume when mute state changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [isMuted, volume]);

  // This component doesn't render anything visually
  return null;
}