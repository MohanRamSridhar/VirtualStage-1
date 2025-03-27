export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  duration: number;
  artist: string;
  genre: string;
  thumbnail: string;
  streamUrl: string;
  isLive: boolean;
  price: number;
  capacity: number;
  attendees: number;
  rating: number;
  tags: string[];
}

export interface AudioFeatures {
  tempo: number;
  energy: number;
  loudness: number;
  frequency: number[];
}

export interface StageEffect {
  type: 'spotlight' | 'laser' | 'smoke' | 'particles';
  intensity: number;
  color: string;
  position: [number, number, number];
  rotation: [number, number, number];
} 