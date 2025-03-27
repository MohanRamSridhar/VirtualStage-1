export interface Event {
  id: number;
  title: string;
  description: string;
  date: Date;
  duration: number;
  type: string;
  genre: string;
  artist: string;
  thumbnail?: string;
  videoUrl?: string;
  environment: string;
  isLive: boolean;
  isPremium: boolean;
  tags: string[];
  spatialAudio: boolean;
}

export interface Reaction {
  id: number;
  userId: number;
  eventId: number;
  type: string;
  timestamp: Date;
}

export interface UserHistory {
  id: number;
  userId: number;
  eventId: number;
  reactionType: string;
  timestamp: Date;
} 