import { create } from "zustand";
import { persist } from "zustand/middleware";
import { apiRequest } from "../queryClient";

interface User {
  id: number;
  username: string;
  email: string;
  displayName?: string;
  avatar?: string;
  preferences?: {
    genres: string[];
    favoriteArtists: string[];
    notificationSettings: {
      email: boolean;
      inApp: boolean;
    };
    audioQuality: "low" | "medium" | "high";
    accessibility: {
      subtitles: boolean;
      highContrast: boolean;
    };
  };
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (username: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  updatePreferences: (preferences: User['preferences']) => Promise<void>;
}

interface RegisterData {
  username: string;
  password: string;
  email: string;
  displayName?: string;
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      
      login: async (username, password) => {
        set({ isLoading: true, error: null });
        try {
          // For this demo, we'll simulate login by fetching a user by username
          // In a real app, you'd use a proper login endpoint with secure password validation
          const response = await fetch(`/api/users/username/${username}`);
          
          if (!response.ok) {
            throw new Error('Invalid login credentials');
          }
          
          const user = await response.json();
          
          // In a real app, password validation would happen on the server
          // This is just a simulation - we'll assume the password is correct for the demo
          // In a production app, NEVER implement client-side password validation like this
          if (password) {
            console.log('Login successful');
            set({ user, isAuthenticated: true, isLoading: false });
          } else {
            throw new Error('Password is required');
          }
        } catch (error) {
          console.error('Login error:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Unknown error', 
            isLoading: false 
          });
          throw error; // Re-throw to allow the component to handle the error
        }
      },
      
      register: async (userData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiRequest('POST', '/api/users', userData);
          const user = await response.json();
          
          set({ user, isAuthenticated: true, isLoading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Unknown error', 
            isLoading: false 
          });
        }
      },
      
      logout: () => {
        set({ user: null, isAuthenticated: false });
      },
      
      updatePreferences: async (preferences) => {
        const { user } = get();
        if (!user) {
          set({ error: 'User not authenticated' });
          return;
        }
        
        set({ isLoading: true, error: null });
        try {
          const response = await apiRequest(
            'PATCH', 
            `/api/users/${user.id}/preferences`, 
            preferences
          );
          
          const updatedUser = await response.json();
          set({ user: updatedUser, isLoading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Unknown error', 
            isLoading: false 
          });
        }
      }
    }),
    {
      name: 'vr-events-auth',
      // Only persist specific fields
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);
