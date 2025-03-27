import { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

interface EventAudioProps {
  eventId: string;
  genre: string;
  isPlaying: boolean;
  onPlayChange: (playing: boolean) => void;
}

// Map of genres to their corresponding audio tracks
const GENRE_AUDIO = {
  'Electronic': '/audio/electronic.mp3',
  'Rock': '/audio/rock.mp3',
  'Pop': '/audio/pop.mp3',
  'Hip Hop': '/audio/hiphop.mp3',
  'Jazz': '/audio/jazz.mp3',
  'Classical': '/audio/classical.mp3',
  'R&B': '/audio/rnb.mp3',
  'Country': '/audio/country.mp3',
  'Metal': '/audio/metal.mp3',
  'Folk': '/audio/folk.mp3',
  'Blues': '/audio/blues.mp3',
  'Reggae': '/audio/reggae.mp3',
  'Latin': '/audio/latin.mp3',
  'World': '/audio/world.mp3',
  'Ambient': '/audio/ambient.mp3',
  'default': '/audio/default.mp3'
};

export default function EventAudio({ eventId, genre, isPlaying, onPlayChange }: EventAudioProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(error => {
          console.error('Error playing audio:', error);
          onPlayChange(false);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, onPlayChange]);

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0]);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const audioUrl = GENRE_AUDIO[genre as keyof typeof GENRE_AUDIO] || GENRE_AUDIO.default;

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleMute}
        className="h-8 w-8"
      >
        {isMuted ? (
          <VolumeX className="h-4 w-4" />
        ) : (
          <Volume2 className="h-4 w-4" />
        )}
      </Button>
      
      <Slider
        value={[volume]}
        onValueChange={handleVolumeChange}
        max={1}
        step={0.1}
        className="w-24"
      />
      
      <audio
        ref={audioRef}
        src={audioUrl}
        loop
        preload="auto"
        onEnded={() => onPlayChange(false)}
        onError={() => {
          console.error('Error loading audio');
          onPlayChange(false);
        }}
      />
    </div>
  );
} 