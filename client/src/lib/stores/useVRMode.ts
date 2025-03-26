import { create } from "zustand";
import { persist } from "zustand/middleware";

export type VRMode = "desktop" | "vr";

interface VRState {
  mode: VRMode;
  isVRSupported: boolean;
  vrSession: XRSession | null;
  
  // Settings
  cameraHeight: number;
  movementSpeed: number;
  renderQuality: "low" | "medium" | "high";
  spatialAudioEnabled: boolean;
  
  // Actions
  setMode: (mode: VRMode) => void;
  setVRSupported: (supported: boolean) => void;
  setVRSession: (session: XRSession | null) => void;
  updateSettings: (settings: Partial<Pick<VRState, 'cameraHeight' | 'movementSpeed' | 'renderQuality' | 'spatialAudioEnabled'>>) => void;
}

export const useVRMode = create<VRState>()(
  persist(
    (set) => ({
      mode: "desktop",
      isVRSupported: false,
      vrSession: null,
      
      // Default settings
      cameraHeight: 1.6, // Average human height in meters
      movementSpeed: 1.5,
      renderQuality: "medium",
      spatialAudioEnabled: true,
      
      // Actions
      setMode: (mode) => set({ mode }),
      setVRSupported: (supported) => set({ isVRSupported: supported }),
      setVRSession: (session) => set({ vrSession: session }),
      updateSettings: (settings) => set((state) => ({ ...state, ...settings }))
    }),
    {
      name: "vr-mode-settings",
      // Only persist user settings, not the session state
      partialize: (state) => ({
        mode: state.mode,
        cameraHeight: state.cameraHeight,
        movementSpeed: state.movementSpeed,
        renderQuality: state.renderQuality,
        spatialAudioEnabled: state.spatialAudioEnabled
      })
    }
  )
);
