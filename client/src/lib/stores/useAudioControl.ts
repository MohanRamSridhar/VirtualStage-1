import { create } from "zustand";
import { devtools } from "zustand/middleware";

export interface AudioNode3D {
  id: string;
  audioElement: HTMLAudioElement;
  position: [number, number, number];
  volume: number;
  source: MediaElementAudioSourceNode;
  panner: PannerNode;
  gain: GainNode;
}

interface AudioControlState {
  audioContext: AudioContext | null;
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  audioNodes: Record<string, AudioNode3D>;
  isMuted: boolean;
  isPlaying: boolean;
  
  // Actions
  initAudioContext: () => void;
  setMasterVolume: (volume: number) => void;
  setMusicVolume: (volume: number) => void;
  setSFXVolume: (volume: number) => void;
  createAudioNode: (id: string, url: string, position: [number, number, number], volume?: number) => void;
  updateAudioNodePosition: (id: string, position: [number, number, number]) => void;
  updateListenerPosition: (position: [number, number, number], forward: [number, number, number], up: [number, number, number]) => void;
  removeAudioNode: (id: string) => void;
  toggleMute: () => void;
  togglePlayback: () => void;
}

export const useAudioControl = create<AudioControlState>()(
  devtools(
    (set, get) => ({
      audioContext: null,
      masterVolume: 1.0,
      musicVolume: 1.0,
      sfxVolume: 1.0,
      audioNodes: {},
      isMuted: false,
      isPlaying: false,
      
      initAudioContext: () => {
        if (!get().audioContext) {
          const context = new (window.AudioContext || (window as any).webkitAudioContext)();
          set({ audioContext: context });
        }
      },
      
      setMasterVolume: (volume: number) => {
        const clampedVolume = Math.max(0, Math.min(1, volume));
        set({ masterVolume: clampedVolume });
        
        // Update all audio node volumes
        const state = get();
        Object.values(state.audioNodes).forEach((node) => {
          node.gain.gain.value = clampedVolume * node.volume;
        });
      },
      
      setMusicVolume: (volume: number) => {
        set({ musicVolume: Math.max(0, Math.min(1, volume)) });
      },
      
      setSFXVolume: (volume: number) => {
        set({ sfxVolume: Math.max(0, Math.min(1, volume)) });
      },
      
      createAudioNode: (id: string, url: string, position: [number, number, number], volume = 1.0) => {
        const state = get();
        if (!state.audioContext) return;
        
        const audioElement = new Audio(url);
        audioElement.crossOrigin = "anonymous";
        
        const source = state.audioContext.createMediaElementSource(audioElement);
        const panner = state.audioContext.createPanner();
        const gain = state.audioContext.createGain();
        
        source.connect(panner);
        panner.connect(gain);
        gain.connect(state.audioContext.destination);
        
        panner.setPosition(...position);
        gain.gain.value = state.masterVolume * volume;
        
        const audioNode: AudioNode3D = {
          id,
          audioElement,
          position,
          volume,
          source,
          panner,
          gain
        };
        
        set((state) => ({
          audioNodes: {
            ...state.audioNodes,
            [id]: audioNode
          }
        }));
        
        audioElement.play().catch(console.error);
      },
      
      updateAudioNodePosition: (id: string, position: [number, number, number]) => {
        const state = get();
        const node = state.audioNodes[id];
        if (node) {
          node.position = position;
          node.panner.setPosition(...position);
        }
      },
      
      updateListenerPosition: (position: [number, number, number], forward: [number, number, number], up: [number, number, number]) => {
        const state = get();
        if (!state.audioContext) return;
        
        const listener = state.audioContext.listener;
        if (listener.positionX) {
          listener.positionX.setValueAtTime(position[0], state.audioContext.currentTime);
          listener.positionY.setValueAtTime(position[1], state.audioContext.currentTime);
          listener.positionZ.setValueAtTime(position[2], state.audioContext.currentTime);
          listener.forwardX.setValueAtTime(forward[0], state.audioContext.currentTime);
          listener.forwardY.setValueAtTime(forward[1], state.audioContext.currentTime);
          listener.forwardZ.setValueAtTime(forward[2], state.audioContext.currentTime);
          listener.upX.setValueAtTime(up[0], state.audioContext.currentTime);
          listener.upY.setValueAtTime(up[1], state.audioContext.currentTime);
          listener.upZ.setValueAtTime(up[2], state.audioContext.currentTime);
        } else {
          listener.setPosition(...position);
          listener.setOrientation(...forward, ...up);
        }
      },
      
      removeAudioNode: (id: string) => {
        const state = get();
        const node = state.audioNodes[id];
        if (node) {
          node.audioElement.pause();
          node.source.disconnect();
          node.panner.disconnect();
          node.gain.disconnect();
          
          set((state) => {
            const { [id]: removed, ...remaining } = state.audioNodes;
            return { audioNodes: remaining };
          });
        }
      },
      
      toggleMute: () => {
        const state = get();
        const newMuted = !state.isMuted;
        set({ isMuted: newMuted });
        
        Object.values(state.audioNodes).forEach((node) => {
          node.gain.gain.value = newMuted ? 0 : state.masterVolume * node.volume;
        });
      },
      
      togglePlayback: () => {
        const state = get();
        const newPlaying = !state.isPlaying;
        set({ isPlaying: newPlaying });
        
        Object.values(state.audioNodes).forEach((node) => {
          if (newPlaying) {
            node.audioElement.play().catch(console.error);
          } else {
            node.audioElement.pause();
          }
        });
      }
    }),
    {
      name: 'audio-control-store',
      serialize: {
        options: (state: AudioControlState) => ({
          masterVolume: state.masterVolume,
          musicVolume: state.musicVolume,
          sfxVolume: state.sfxVolume,
          isMuted: state.isMuted,
          isPlaying: state.isPlaying
        })
      }
    }
  )
);
