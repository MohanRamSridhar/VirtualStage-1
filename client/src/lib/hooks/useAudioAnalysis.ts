import { useEffect, useRef, useState } from 'react';
import { useAudioControl } from '@/lib/stores/useAudioControl';
import { AudioFeatures } from '@/lib/types/index';

export function useAudioAnalysis(audioUrl: string) {
  const { audioContext, isPlaying } = useAudioControl();
  const [features, setFeatures] = useState<AudioFeatures | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const frameRef = useRef<number | null>(null);
  
  // Initialize audio analysis
  useEffect(() => {
    if (!audioContext || !isPlaying) return;
    
    // Create audio element
    const audio = new Audio(audioUrl);
    audio.crossOrigin = "anonymous";
    audioRef.current = audio;
    
    // Create analyzer
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;
    analyser.smoothingTimeConstant = 0.8;
    analyserRef.current = analyser;
    
    // Create source
    const source = audioContext.createMediaElementSource(audio);
    source.connect(analyser);
    analyser.connect(audioContext.destination);
    sourceRef.current = source;
    
    // Start playback
    audio.play().catch(console.error);
    
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      audio.pause();
      source.disconnect();
      analyser.disconnect();
    };
  }, [audioContext, audioUrl, isPlaying]);
  
  // Analyze audio
  useEffect(() => {
    if (!analyserRef.current || !isPlaying) return;
    
    const analyzeFrame = () => {
      const analyser = analyserRef.current;
      if (!analyser) return;
      
      const frequencyData = new Uint8Array(analyser.frequencyBinCount);
      const timeData = new Uint8Array(analyser.frequencyBinCount);
      
      analyser.getByteFrequencyData(frequencyData);
      analyser.getByteTimeDomainData(timeData);
      
      setFeatures({
        tempo: calculateTempo(timeData),
        energy: calculateEnergy(frequencyData),
        loudness: calculateLoudness(timeData),
        frequency: calculateFrequencyBands(frequencyData)
      });
      
      frameRef.current = requestAnimationFrame(analyzeFrame);
    };
    
    frameRef.current = requestAnimationFrame(analyzeFrame);
    
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [isPlaying]);
  
  // Audio analysis helper functions
  const calculateTempo = (timeData: Uint8Array): number => {
    let peaks = 0;
    for (let i = 1; i < timeData.length - 1; i++) {
      if (timeData[i] > timeData[i - 1] && timeData[i] > timeData[i + 1] && timeData[i] > 200) {
        peaks++;
      }
    }
    return (peaks * 60) / (timeData.length / 44100); // Assuming 44.1kHz sample rate
  };
  
  const calculateEnergy = (frequencyData: Uint8Array): number => {
    const sum = frequencyData.reduce((acc, val) => acc + val, 0);
    return sum / (frequencyData.length * 255); // Normalize to 0-1
  };
  
  const calculateLoudness = (timeData: Uint8Array): number => {
    const sum = timeData.reduce((acc, val) => acc + Math.abs(val - 128), 0);
    return sum / (timeData.length * 128); // Normalize to 0-1
  };
  
  const calculateFrequencyBands = (frequencyData: Uint8Array): number[] => {
    const bands = 8;
    const bandSize = Math.floor(frequencyData.length / bands);
    return Array.from({ length: bands }, (_, i) => {
      const start = i * bandSize;
      const end = start + bandSize;
      const sum = frequencyData.slice(start, end).reduce((acc, val) => acc + val, 0);
      return sum / (bandSize * 255); // Normalize to 0-1
    });
  };
  
  return features;
} 