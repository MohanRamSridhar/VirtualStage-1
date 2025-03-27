import { useState, useEffect } from 'react';
import { SpotLight } from '@react-three/drei';
import { StageEffect, AudioFeatures } from '@/lib/types/index';
import { useAudioAnalysis } from '@/lib/hooks/useAudioAnalysis';
import { SmokeEffect } from './SmokeEffect';

interface DynamicStageEffectsProps {
  eventId: string;
  audioUrl: string;
}

export default function DynamicStageEffects({ eventId, audioUrl }: DynamicStageEffectsProps) {
  const [effects, setEffects] = useState<StageEffect[]>([]);
  const features = useAudioAnalysis(audioUrl);
  
  // Update effects based on audio features
  const updateEffects = (features: AudioFeatures) => {
    const newEffects: StageEffect[] = [];
    
    // Create spotlight effects based on tempo and energy
    const numSpotlights = Math.min(6, Math.ceil(features.energy * 6));
    for (let i = 0; i < numSpotlights; i++) {
      const angle = (i / numSpotlights) * Math.PI * 2;
      const radius = 5;
      
      newEffects.push({
        type: 'spotlight',
        intensity: features.energy * 2,
        color: `hsl(${(i / numSpotlights) * 360}, 100%, 50%)`,
        position: [
          Math.cos(angle) * radius,
          8,
          Math.sin(angle) * radius - 2
        ],
        rotation: [
          -Math.PI / 3,
          angle,
          0
        ]
      });
    }
    
    // Create laser effects based on frequency peaks
    const highFreqs = features.frequency.slice(-3);
    const avgHighFreq = highFreqs.reduce((a, b) => a + b, 0) / highFreqs.length;
    if (avgHighFreq > 0.7) {
      for (let i = 0; i < 4; i++) {
        const angle = (i / 4) * Math.PI * 2;
        newEffects.push({
          type: 'laser',
          intensity: avgHighFreq,
          color: '#00ff00',
          position: [
            Math.cos(angle) * 3,
            1,
            Math.sin(angle) * 3 - 2
          ],
          rotation: [
            Math.PI / 6,
            angle,
            0
          ]
        });
      }
    }
    
    // Add smoke effect based on bass frequencies
    const bassFreq = features.frequency[0];
    if (bassFreq > 0.7) {
      newEffects.push({
        type: 'smoke',
        intensity: bassFreq,
        color: '#ffffff',
        position: [0, 0, -2],
        rotation: [0, 0, 0]
      });
    }
    
    setEffects(newEffects);
  };
  
  // Update effects when features change
  useEffect(() => {
    if (features) {
      updateEffects(features);
    }
  }, [features]);
  
  // Render effects
  return (
    <group>
      {effects.map((effect, index) => {
        if (effect.type === 'spotlight') {
          return (
            <SpotLight
              key={`spotlight-${index}`}
              position={effect.position}
              angle={0.5}
              penumbra={0.5}
              intensity={effect.intensity}
              color={effect.color}
              castShadow
            />
          );
        }
        
        if (effect.type === 'laser') {
          return (
            <pointLight
              key={`laser-${index}`}
              position={effect.position}
              intensity={effect.intensity}
              color={effect.color}
              distance={20}
              decay={2}
            />
          );
        }
        
        if (effect.type === 'smoke') {
          return (
            <SmokeEffect
              key={`smoke-${index}`}
              position={effect.position}
              intensity={effect.intensity}
              color={effect.color}
            />
          );
        }
        
        return null;
      })}
    </group>
  );
} 