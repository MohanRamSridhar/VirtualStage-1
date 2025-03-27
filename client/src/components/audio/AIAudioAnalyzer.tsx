import { useEffect, useRef, useState } from 'react';
import { useAudioControl } from '@/lib/stores/useAudioControl';

interface AudioFeatures {
  tempo: number;
  energy: number;
  loudness: number;
  frequency: number[];
}

interface AIAudioAnalyzerProps {
  audioUrl: string;
  onFeaturesUpdate: (features: AudioFeatures) => void;
}

export default function AIAudioAnalyzer({ audioUrl, onFeaturesUpdate }: AIAudioAnalyzerProps) {
  const { audioContext } = useAudioControl();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Initialize audio analyzer
  useEffect(() => {
    if (!audioContext || !audioUrl) return;
    
    const audio = new Audio(audioUrl);
    audio.crossOrigin = "anonymous";
    audioRef.current = audio;
    
    // Create analyzer node
    const analyzer = audioContext.createAnalyser();
    analyzer.fftSize = 2048;
    analyzer.smoothingTimeConstant = 0.8;
    analyzerRef.current = analyzer;
    
    // Create audio source
    const source = audioContext.createMediaElementSource(audio);
    source.connect(analyzer);
    analyzer.connect(audioContext.destination);
    sourceRef.current = source;
    
    // Start audio
    audio.play().catch(console.error);
    setIsAnalyzing(true);
    
    return () => {
      audio.pause();
      source.disconnect();
      analyzer.disconnect();
      setIsAnalyzing(false);
    };
  }, [audioContext, audioUrl]);
  
  // Analyze audio features
  useEffect(() => {
    if (!isAnalyzing || !analyzerRef.current || !audioRef.current) return;
    
    const analyzer = analyzerRef.current;
    const audio = audioRef.current;
    
    // Create data arrays
    const frequencyData = new Uint8Array(analyzer.frequencyBinCount);
    const timeData = new Uint8Array(analyzer.frequencyBinCount);
    
    // Analysis loop
    const analyzeFrame = () => {
      // Get frequency and time domain data
      analyzer.getByteFrequencyData(frequencyData);
      analyzer.getByteTimeDomainData(timeData);
      
      // Calculate audio features
      const features = calculateAudioFeatures(frequencyData, timeData);
      onFeaturesUpdate(features);
      
      // Continue analysis loop
      if (isAnalyzing && !audio.paused) {
        requestAnimationFrame(analyzeFrame);
      }
    };
    
    requestAnimationFrame(analyzeFrame);
  }, [isAnalyzing, onFeaturesUpdate]);
  
  // Calculate audio features from raw data
  const calculateAudioFeatures = (
    frequencyData: Uint8Array,
    timeData: Uint8Array
  ): AudioFeatures => {
    // Calculate RMS (loudness)
    const rms = Math.sqrt(
      timeData.reduce((acc, val) => acc + (val - 128) ** 2, 0) / timeData.length
    ) / 128;
    
    // Calculate energy (sum of frequency magnitudes)
    const energy = frequencyData.reduce((acc, val) => acc + val, 0) / frequencyData.length;
    
    // Estimate tempo using peak detection
    const tempo = estimateTempo(timeData);
    
    // Get frequency distribution (simplified)
    const frequency = Array.from({ length: 8 }, (_, i) => {
      const start = Math.floor(i * frequencyData.length / 8);
      const end = Math.floor((i + 1) * frequencyData.length / 8);
      const slice = frequencyData.slice(start, end);
      return slice.reduce((acc, val) => acc + val, 0) / slice.length;
    });
    
    return {
      tempo,
      energy,
      loudness: rms * 100,
      frequency
    };
  };
  
  // Estimate tempo using a simple peak detection algorithm
  const estimateTempo = (timeData: Uint8Array): number => {
    const peaks: number[] = [];
    const threshold = 140; // Adjust based on your needs
    
    // Find peaks in the waveform
    for (let i = 1; i < timeData.length - 1; i++) {
      if (
        timeData[i] > threshold &&
        timeData[i] > timeData[i - 1] &&
        timeData[i] > timeData[i + 1]
      ) {
        peaks.push(i);
      }
    }
    
    // Calculate average time between peaks
    if (peaks.length < 2) return 120; // Default tempo
    
    const avgPeakDistance =
      peaks.slice(1).reduce((acc, peak, i) => acc + (peak - peaks[i]), 0) /
      (peaks.length - 1);
    
    // Convert to BPM (assuming 44.1kHz sample rate)
    const bpm = (44100 / 2048) * (60 / avgPeakDistance);
    
    // Clamp to reasonable BPM range
    return Math.max(60, Math.min(200, bpm));
  };
  
  return null; // This is a utility component, no visual rendering needed
} 