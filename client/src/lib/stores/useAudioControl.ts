import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AudioNode {
  id: string;
  audioElement: HTMLAudioElement;
  position: [number, number, number]; // x, y, z position
  volume: number;
  source?: AudioBufferSourceNode;
  panner?: PannerNode;
  gain?: GainNode;
}

interface AudioControlState {
  audioContext: AudioContext | null;
  spatialAudioEnabled: boolean;
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  audioNodes: Record<string, AudioNode>;
  
  // Actions
  initAudioContext: () => void;
  toggleSpatialAudio: () => void;
  setMasterVolume: (volume: number) => void;
  setMusicVolume: (volume: number) => void;
  setSfxVolume: (volume: number) => void;
  createAudioNode: (id: string, audioElement: HTMLAudioElement, position: [number, number, number], initialVolume?: number) => void;
  updateAudioNodePosition: (id: string, position: [number, number, number]) => void;
  updateListenerPosition: (position: [number, number, number], forward: [number, number, number], up: [number, number, number]) => void;
  removeAudioNode: (id: string) => void;
}

export const useAudioControl = create<AudioControlState>()(
  persist(
    (set, get) => ({
      audioContext: null,
      spatialAudioEnabled: true,
      masterVolume: 0.8,
      musicVolume: 0.6,
      sfxVolume: 1.0,
      audioNodes: {},
      
      initAudioContext: () => {
        if (!get().audioContext) {
          try {
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            const context = new AudioContext();
            set({ audioContext: context });
            
            // Resume the AudioContext if it's suspended (needed for some browsers)
            if (context.state === 'suspended') {
              context.resume();
            }
            
            console.log("AudioContext initialized successfully");
          } catch (error) {
            console.error("Failed to initialize AudioContext:", error);
          }
        }
      },
      
      toggleSpatialAudio: () => {
        set((state) => ({ spatialAudioEnabled: !state.spatialAudioEnabled }));
        
        // Update all existing audio nodes to enable/disable spatial audio
        const { audioNodes, audioContext, spatialAudioEnabled } = get();
        if (!audioContext) return;
        
        Object.values(audioNodes).forEach(node => {
          if (spatialAudioEnabled) {
            // Re-enable spatial audio if we have a panner
            if (node.panner && node.gain) {
              // Reconnect through the panner
              node.gain.disconnect();
              node.gain.connect(node.panner);
              node.panner.connect(audioContext.destination);
            }
          } else {
            // Disable spatial effects by bypassing the panner
            if (node.panner && node.gain) {
              // Disconnect the panner and connect gain directly to destination
              node.gain.disconnect();
              node.gain.connect(audioContext.destination);
            }
          }
        });
      },
      
      setMasterVolume: (volume) => {
        set({ masterVolume: volume });
        
        // Update gain on all nodes
        const { audioNodes } = get();
        Object.values(audioNodes).forEach(node => {
          if (node.gain) {
            node.gain.gain.value = volume * node.volume;
          }
        });
      },
      
      setMusicVolume: (volume) => {
        set({ musicVolume: volume });
        // Music volume would be handled separately for background music
      },
      
      setSfxVolume: (volume) => {
        set({ sfxVolume: volume });
        // SFX volume would be applied to specific effect sounds
      },
      
      createAudioNode: (id, audioElement, position, initialVolume = 1.0) => {
        const { audioContext, audioNodes, masterVolume, spatialAudioEnabled } = get();
        
        if (!audioContext) {
          console.error("AudioContext not initialized");
          return;
        }
        
        try {
          // Create audio source
          const source = audioContext.createMediaElementSource(audioElement);
          
          // Create gain node for volume control
          const gain = audioContext.createGain();
          gain.gain.value = masterVolume * initialVolume;
          
          if (spatialAudioEnabled) {
            // Create spatial panner
            const panner = audioContext.createPanner();
            panner.panningModel = 'HRTF';
            panner.distanceModel = 'inverse';
            panner.refDistance = 1;
            panner.maxDistance = 10000;
            panner.rolloffFactor = 1;
            panner.coneInnerAngle = 360;
            panner.coneOuterAngle = 0;
            panner.coneOuterGain = 0;
            
            // Set initial position
            panner.positionX.value = position[0];
            panner.positionY.value = position[1];
            panner.positionZ.value = position[2];
            
            // Connect nodes: source -> gain -> panner -> destination
            source.connect(gain);
            gain.connect(panner);
            panner.connect(audioContext.destination);
            
            set((state) => ({
              audioNodes: {
                ...state.audioNodes,
                [id]: {
                  id,
                  audioElement,
                  position,
                  volume: initialVolume,
                  source,
                  panner,
                  gain
                }
              }
            }));
          } else {
            // Non-spatial setup: source -> gain -> destination
            source.connect(gain);
            gain.connect(audioContext.destination);
            
            set((state) => ({
              audioNodes: {
                ...state.audioNodes,
                [id]: {
                  id,
                  audioElement,
                  position,
                  volume: initialVolume,
                  source,
                  gain
                }
              }
            }));
          }
          
          console.log(`Audio node created: ${id}`);
        } catch (error) {
          console.error(`Failed to create audio node ${id}:`, error);
        }
      },
      
      updateAudioNodePosition: (id, position) => {
        const { audioNodes, spatialAudioEnabled } = get();
        const node = audioNodes[id];
        
        if (!node || !spatialAudioEnabled) return;
        
        if (node.panner) {
          node.panner.positionX.value = position[0];
          node.panner.positionY.value = position[1];
          node.panner.positionZ.value = position[2];
          
          // Update stored position
          set((state) => ({
            audioNodes: {
              ...state.audioNodes,
              [id]: {
                ...node,
                position
              }
            }
          }));
        }
      },
      
      updateListenerPosition: (position, forward, up) => {
        const { audioContext, spatialAudioEnabled } = get();
        
        if (!audioContext || !spatialAudioEnabled) return;
        
        const listener = audioContext.listener;
        
        // Set listener position
        if (listener.positionX) {
          // Modern API
          listener.positionX.value = position[0];
          listener.positionY.value = position[1];
          listener.positionZ.value = position[2];
          
          // Set orientation (forward and up vectors)
          listener.forwardX.value = forward[0];
          listener.forwardY.value = forward[1];
          listener.forwardZ.value = forward[2];
          listener.upX.value = up[0];
          listener.upY.value = up[1];
          listener.upZ.value = up[2];
        } else {
          // Legacy API
          listener.setPosition(position[0], position[1], position[2]);
          listener.setOrientation(
            forward[0], forward[1], forward[2],
            up[0], up[1], up[2]
          );
        }
      },
      
      removeAudioNode: (id) => {
        const { audioNodes } = get();
        const node = audioNodes[id];
        
        if (!node) return;
        
        // Disconnect all audio nodes
        if (node.source) node.source.disconnect();
        if (node.gain) node.gain.disconnect();
        if (node.panner) node.panner.disconnect();
        
        // Remove from state
        set((state) => {
          const newNodes = { ...state.audioNodes };
          delete newNodes[id];
          return { audioNodes: newNodes };
        });
        
        console.log(`Audio node removed: ${id}`);
      }
    }),
    {
      name: "audio-control-settings",
      // Only persist settings, not the audio nodes or context
      partialize: (state) => ({
        spatialAudioEnabled: state.spatialAudioEnabled,
        masterVolume: state.masterVolume,
        musicVolume: state.musicVolume,
        sfxVolume: state.sfxVolume
      })
    }
  )
);
