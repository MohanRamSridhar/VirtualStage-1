import { 
  users, type User, type InsertUser, 
  events, type Event, type InsertEvent,
  userEventInteractions, type UserEventInteraction, type InsertUserEventInteraction,
  chatMessages, type ChatMessage, type InsertChatMessage,
  reactions, type Reaction, type InsertReaction,
  UserPreferences
} from "@shared/schema";

// Interface for all storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserPreferences(userId: number, preferences: UserPreferences): Promise<User | undefined>;
  
  // Event operations
  getEvent(id: number): Promise<Event | undefined>;
  getAllEvents(): Promise<Event[]>;
  getEventsByGenre(genre: string): Promise<Event[]>;
  getEventsByArtist(artist: string): Promise<Event[]>;
  getEventsByType(type: string): Promise<Event[]>;
  getUpcomingEvents(): Promise<Event[]>;
  getLiveEvents(): Promise<Event[]>;
  createEvent(event: InsertEvent): Promise<Event>;
  
  // User-Event interactions
  getUserEventInteraction(userId: number, eventId: number): Promise<UserEventInteraction | undefined>;
  createUserEventInteraction(interaction: InsertUserEventInteraction): Promise<UserEventInteraction>;
  updateUserEventInteraction(id: number, updates: Partial<UserEventInteraction>): Promise<UserEventInteraction | undefined>;
  getUserEventInteractions(userId: number): Promise<UserEventInteraction[]>;
  
  // Chat messages
  getChatMessages(eventId: number): Promise<ChatMessage[]>;
  addChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  
  // Reactions
  getReactions(eventId: number): Promise<Reaction[]>;
  addReaction(reaction: InsertReaction): Promise<Reaction>;
  
  // Recommendations
  getRecommendedEvents(userId: number): Promise<Event[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private events: Map<number, Event> = new Map();
  private userEventInteractions: Map<number, UserEventInteraction> = new Map();
  private chatMessages: Map<number, ChatMessage> = new Map();
  private reactions: Map<number, Reaction> = new Map();
  
  private userIdCounter: number;
  private eventIdCounter: number;
  private interactionIdCounter: number;
  private messageIdCounter: number;
  private reactionIdCounter: number;

  constructor() {
    this.userIdCounter = 1;
    this.eventIdCounter = 1;
    this.interactionIdCounter = 1;
    this.messageIdCounter = 1;
    this.reactionIdCounter = 1;
    
    // Add some initial data
    this.setupInitialData();
  }

  private setupInitialData() {
    // Add sample events with different types to showcase various environments
    const sampleEvents: InsertEvent[] = [
      {
        title: "Neon Dreams Electronic Festival",
        description: "Experience the ultimate electronic music festival in a futuristic neon-lit virtual stadium.",
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
        duration: 180,
        type: "concert",
        genre: "electronic",
        artist: "Digital Pulse Collective",
        thumbnail: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3",
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        environment: "stadium",
        isLive: false,
        isPremium: false,
        tags: ["electronic", "dance", "festival", "night"],
        spatialAudio: true
      },
      {
        title: "Classical Symphony Under the Stars",
        description: "A breathtaking classical concert featuring the works of Mozart, Beethoven, and Bach under a starry night sky.",
        date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
        duration: 120,
        type: "concert",
        genre: "classical",
        artist: "Virtual Symphony Orchestra",
        thumbnail: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6",
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        environment: "outdoor_amphitheater",
        isLive: false,
        isPremium: true,
        tags: ["classical", "symphony", "orchestra"],
        spatialAudio: true
      },
      {
        title: "Virtual Art Gallery Opening: Future Visions",
        description: "Explore cutting-edge digital artworks in an immersive gallery space, featuring works from the world's most innovative digital artists.",
        date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        duration: 90,
        type: "exhibition",
        genre: "digital art",
        artist: "Various Digital Artists",
        thumbnail: "https://images.unsplash.com/photo-1531058020387-3be344556be6",
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        environment: "gallery",
        isLive: false,
        isPremium: false,
        tags: ["art", "exhibition", "digital", "interactive"],
        spatialAudio: false
      },
      {
        title: "Rock Legends Reunion",
        description: "The biggest rock legends come together for a one-night-only virtual concert experience.",
        date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // Tomorrow
        duration: 150,
        type: "concert",
        genre: "rock",
        artist: "The Rock Legends",
        thumbnail: "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14",
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        streamUrl: "https://cdn.videvo.net/videvo_files/video/premium/video0036/large_watermarked/360_360-0019_preview.mp4",
        environment: "arena",
        isLive: true,
        isPremium: true,
        tags: ["rock", "live", "concert", "legends", "streaming"],
        spatialAudio: true,
        createdAt: new Date()
      },
      {
        title: "Jazz in the Virtual Club",
        description: "An intimate jazz performance in a faithfully recreated 1920s jazz club environment.",
        date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        duration: 120,
        type: "concert",
        genre: "jazz",
        artist: "The Virtual Jazz Quartet",
        thumbnail: "https://images.unsplash.com/photo-1511192336575-5a79af67a629",
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        environment: "club",
        isLive: false,
        isPremium: false,
        tags: ["jazz", "club", "intimate", "night"],
        spatialAudio: true
      },
      // Additional event types to showcase different environments
      {
        title: "La Traviata: VR Opera Experience",
        description: "Experience Verdi's classic opera in a breathtaking virtual theater production with immersive audio and visuals.",
        date: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000), // 9 days from now
        duration: 150,
        type: "theater",
        genre: "opera",
        artist: "VR Opera Company",
        thumbnail: "https://images.unsplash.com/photo-1522776851755-3125f04b8e9e",
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        environment: "theater",
        isLive: false,
        isPremium: true,
        tags: ["opera", "classical", "theater", "immersive"],
        spatialAudio: true
      },
      {
        title: "Future of AI Conference 2025",
        description: "Join leading experts in artificial intelligence for a day of presentations and discussions about the future of AI.",
        date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
        duration: 480, // 8 hours
        type: "conference",
        genre: "technology",
        artist: "Various Speakers",
        thumbnail: "https://images.unsplash.com/photo-1558346490-a72e53ae2d4f",
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        environment: "conference_hall",
        isLive: false,
        isPremium: true,
        tags: ["tech", "ai", "conference", "education"],
        spatialAudio: false
      },
      {
        title: "Modern Dance Fusion",
        description: "A groundbreaking contemporary dance performance exploring the intersection of movement, technology, and human emotion.",
        date: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000), // 12 days from now
        duration: 90,
        type: "theater",
        genre: "dance",
        artist: "Digital Movement Collective",
        thumbnail: "https://images.unsplash.com/photo-1594745561049-37e9172792f5",
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        environment: "theater",
        isLive: true,
        isPremium: false,
        tags: ["dance", "contemporary", "performance", "art"],
        spatialAudio: true
      },
      {
        title: "Indie Game Showcase 2025",
        description: "Explore the future of independent game development with demonstrations, talks, and hands-on experiences from talented indie developers.",
        date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
        duration: 360, // 6 hours
        type: "exhibition",
        genre: "gaming",
        artist: "Independent Game Developers",
        thumbnail: "https://images.unsplash.com/photo-1511512578047-dfb367046420",
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        environment: "gallery",
        isLive: false,
        isPremium: false,
        tags: ["gaming", "indie", "interactive", "technology"],
        spatialAudio: true
      }
    ];
    
    sampleEvents.forEach(event => this.createEvent(event));
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const createdAt = new Date();
    const user: User = { ...insertUser, id, createdAt };
    this.users.set(id, user);
    return user;
  }

  async updateUserPreferences(userId: number, preferences: UserPreferences): Promise<User | undefined> {
    const user = this.users.get(userId);
    if (!user) return undefined;
    
    const updatedUser: User = {
      ...user,
      preferences
    };
    
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  // Event operations
  async getEvent(id: number): Promise<Event | undefined> {
    return this.events.get(id);
  }

  async getAllEvents(): Promise<Event[]> {
    return Array.from(this.events.values());
  }

  async getEventsByGenre(genre: string): Promise<Event[]> {
    return Array.from(this.events.values()).filter(
      (event) => event.genre.toLowerCase() === genre.toLowerCase(),
    );
  }

  async getEventsByArtist(artist: string): Promise<Event[]> {
    return Array.from(this.events.values()).filter(
      (event) => event.artist.toLowerCase().includes(artist.toLowerCase()),
    );
  }

  async getEventsByType(type: string): Promise<Event[]> {
    return Array.from(this.events.values()).filter(
      (event) => event.type.toLowerCase() === type.toLowerCase(),
    );
  }

  async getUpcomingEvents(): Promise<Event[]> {
    const now = new Date();
    return Array.from(this.events.values()).filter(
      (event) => new Date(event.date) > now,
    ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  async getLiveEvents(): Promise<Event[]> {
    return Array.from(this.events.values()).filter(
      (event) => event.isLive,
    );
  }

  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const id = this.eventIdCounter++;
    const createdAt = new Date();
    const event: Event = { ...insertEvent, id, createdAt };
    this.events.set(id, event);
    return event;
  }

  // User-Event interactions
  async getUserEventInteraction(userId: number, eventId: number): Promise<UserEventInteraction | undefined> {
    return Array.from(this.userEventInteractions.values()).find(
      (interaction) => interaction.userId === userId && interaction.eventId === eventId,
    );
  }

  async createUserEventInteraction(insertInteraction: InsertUserEventInteraction): Promise<UserEventInteraction> {
    const id = this.interactionIdCounter++;
    const interactionTime = new Date();
    const interaction: UserEventInteraction = { ...insertInteraction, id, interactionTime };
    this.userEventInteractions.set(id, interaction);
    return interaction;
  }

  async updateUserEventInteraction(id: number, updates: Partial<UserEventInteraction>): Promise<UserEventInteraction | undefined> {
    const interaction = this.userEventInteractions.get(id);
    if (!interaction) return undefined;
    
    const updatedInteraction: UserEventInteraction = {
      ...interaction,
      ...updates,
      interactionTime: new Date() // Update interaction time
    };
    
    this.userEventInteractions.set(id, updatedInteraction);
    return updatedInteraction;
  }

  async getUserEventInteractions(userId: number): Promise<UserEventInteraction[]> {
    return Array.from(this.userEventInteractions.values()).filter(
      (interaction) => interaction.userId === userId,
    );
  }

  // Chat messages
  async getChatMessages(eventId: number): Promise<ChatMessage[]> {
    return Array.from(this.chatMessages.values())
      .filter((message) => message.eventId === eventId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  async addChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const id = this.messageIdCounter++;
    const timestamp = new Date();
    const message: ChatMessage = { ...insertMessage, id, timestamp };
    this.chatMessages.set(id, message);
    return message;
  }

  // Reactions
  async getReactions(eventId: number): Promise<Reaction[]> {
    return Array.from(this.reactions.values()).filter(
      (reaction) => reaction.eventId === eventId,
    );
  }

  async addReaction(insertReaction: InsertReaction): Promise<Reaction> {
    const id = this.reactionIdCounter++;
    const timestamp = new Date();
    const reaction: Reaction = { ...insertReaction, id, timestamp };
    this.reactions.set(id, reaction);
    return reaction;
  }

  // Recommendations - Simple recommendation algorithm
  async getRecommendedEvents(userId: number): Promise<Event[]> {
    const user = await this.getUser(userId);
    if (!user || !user.preferences) {
      // Without preferences, return upcoming events
      return this.getUpcomingEvents();
    }

    // Get user interactions to analyze their behavior
    const interactions = await this.getUserEventInteractions(userId);
    
    // Track genres the user has interacted with
    let scores: Record<string, number> = {};
    
    // Count interactions by genre
    for (const interaction of interactions) {
      const event = await this.getEvent(interaction.eventId);
      if (event) {
        if (!scores[event.genre]) {
          scores[event.genre] = 0;
        }
        
        // Increase score based on interaction type
        if (interaction.attended) scores[event.genre] += 3;
        if (interaction.bookmarked) scores[event.genre] += 2;
        if (interaction.rating) scores[event.genre] += interaction.rating;
      }
    }
    
    // Add scores from user preferences
    if (user.preferences.genres) {
      for (const genre of user.preferences.genres) {
        if (!scores[genre]) {
          scores[genre] = 0;
        }
        scores[genre] += 5; // Preferences get a high weight
      }
    }
    
    // Get all upcoming events
    let upcoming = await this.getUpcomingEvents();
    
    // Score each event
    let scored = upcoming.map(event => {
      const genreScore = scores[event.genre] || 0;
      
      // Check if artist is in user's favorites
      const artistScore = user.preferences?.favoriteArtists?.includes(event.artist) ? 10 : 0;
      
      return {
        event,
        score: genreScore + artistScore
      };
    });
    
    // Sort by score and return top events
    scored.sort((a, b) => b.score - a.score);
    return scored.map(item => item.event);
  }
}

export const storage = new MemStorage();
