import { create } from "zustand";
import { apiRequest } from "../queryClient";

export interface Event {
  id: number;
  title: string;
  description: string;
  date: Date;
  duration: number; // in minutes
  type: string; // concert, exhibition, theater, etc.
  genre: string;
  artist: string;
  thumbnail?: string;
  videoUrl?: string;
  environment: string; // stadium, theater, gallery, etc.
  isLive: boolean;
  isPremium: boolean;
  tags: string[];
  spatialAudio: boolean;
}

export interface ChatMessage {
  id: number;
  userId: number;
  eventId: number;
  message: string;
  timestamp: Date;
}

export interface Reaction {
  id: number;
  userId: number;
  eventId: number;
  type: string; // clap, heart, wow, etc.
  timestamp: Date;
}

interface EventsState {
  events: Event[];
  selectedEvent: Event | null;
  recommendations: Event[];
  isLoading: boolean;
  error: string | null;
  
  // Chat and reactions for the current event
  chatMessages: ChatMessage[];
  reactions: Reaction[];
  
  // Filters
  filters: {
    genre?: string;
    type?: string;
    artist?: string;
    isLive?: boolean;
    isPremium?: boolean;
  };
  
  // Actions
  fetchEvents: () => Promise<void>;
  fetchEventById: (id: number) => Promise<void>;
  fetchRecommendations: (userId: number) => Promise<void>;
  fetchEventChat: (eventId: number) => Promise<void>;
  fetchEventReactions: (eventId: number) => Promise<void>;
  sendChatMessage: (userId: number, eventId: number, message: string) => Promise<void>;
  sendReaction: (userId: number, eventId: number, type: string) => Promise<void>;
  setFilters: (filters: Partial<EventsState['filters']>) => void;
  clearFilters: () => void;
}

export const useEvents = create<EventsState>((set, get) => ({
  events: [],
  selectedEvent: null,
  recommendations: [],
  isLoading: false,
  error: null,
  chatMessages: [],
  reactions: [],
  filters: {},
  
  fetchEvents: async () => {
    set({ isLoading: true, error: null });
    try {
      // Apply filters if they exist
      const { filters } = get();
      let url = "/api/events";
      
      // If any filters are active, use appropriate endpoint
      if (filters.isLive) {
        url = "/api/events/live";
      } else if (filters.genre) {
        url = `/api/events/genre/${filters.genre}`;
      } else if (filters.type) {
        url = `/api/events/type/${filters.type}`;
      } else if (filters.artist) {
        url = `/api/events/artist/${filters.artist}`;
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch events: ${response.statusText}`);
      }
      
      let events = await response.json();
      
      // Apply any remaining filters on the client side if needed
      if (filters.isPremium !== undefined) {
        events = events.filter((event: Event) => event.isPremium === filters.isPremium);
      }
      
      set({ events, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Unknown error', 
        isLoading: false 
      });
    }
  },
  
  fetchEventById: async (id) => {
    set({ isLoading: true, error: null, selectedEvent: null });
    try {
      const response = await fetch(`/api/events/${id}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch event: ${response.statusText}`);
      }
      
      const event = await response.json();
      set({ selectedEvent: event, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Unknown error', 
        isLoading: false 
      });
    }
  },
  
  fetchRecommendations: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`/api/users/${userId}/recommendations`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch recommendations: ${response.statusText}`);
      }
      
      const recommendations = await response.json();
      set({ recommendations, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Unknown error', 
        isLoading: false 
      });
    }
  },
  
  fetchEventChat: async (eventId) => {
    try {
      const response = await fetch(`/api/events/${eventId}/chat`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch chat messages: ${response.statusText}`);
      }
      
      const messages = await response.json();
      set({ chatMessages: messages });
    } catch (error) {
      console.error("Error fetching chat messages:", error);
    }
  },
  
  fetchEventReactions: async (eventId) => {
    try {
      const response = await fetch(`/api/events/${eventId}/reactions`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch reactions: ${response.statusText}`);
      }
      
      const reactions = await response.json();
      set({ reactions });
    } catch (error) {
      console.error("Error fetching reactions:", error);
    }
  },
  
  sendChatMessage: async (userId, eventId, message) => {
    try {
      const response = await apiRequest('POST', '/api/chat', {
        userId,
        eventId,
        message
      });
      
      const newMessage = await response.json();
      set((state) => ({ 
        chatMessages: [...state.chatMessages, newMessage] 
      }));
    } catch (error) {
      console.error("Error sending chat message:", error);
    }
  },
  
  sendReaction: async (userId, eventId, type) => {
    try {
      const response = await apiRequest('POST', '/api/reactions', {
        userId,
        eventId,
        type
      });
      
      const newReaction = await response.json();
      set((state) => ({ 
        reactions: [...state.reactions, newReaction] 
      }));
    } catch (error) {
      console.error("Error sending reaction:", error);
    }
  },
  
  setFilters: (filters) => {
    set((state) => ({ 
      filters: { ...state.filters, ...filters } 
    }));
    get().fetchEvents();
  },
  
  clearFilters: () => {
    set({ filters: {} });
    get().fetchEvents();
  }
}));
