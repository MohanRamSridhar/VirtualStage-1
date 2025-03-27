import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { SpotLight, PointLight, Group } from 'three';
import { aiService } from '@/lib/services/aiService';
import { useEvents } from '@/lib/stores/useEvents';

interface AIStageEffectsProps {
  eventId: number;
  audioFeatures?: {
    tempo: number;
    energy: number;
    loudness: number;
    frequency: number[];
  };
}

export default function AIStageEffects({ eventId, audioFeatures }: AIStageEffectsProps) {
  const effectsRef = useRef<Group>(null);
  const spotLightsRef = useRef<SpotLight[]>([]);
  const pointLightsRef = useRef<PointLight[]>([]);
  const { currentEvent } = useEvents();

  // Initialize lights
  useEffect(() => {
    if (!effectsRef.current) return;

    // Create spot lights for dynamic effects
    const spotLights = Array(6).fill(null).map((_, i) => {
      const light = new SpotLight('#ffffff', 1, 100);
      light.position.set(
        Math.cos(i * Math.PI / 3) * 10,
        8,
        Math.sin(i * Math.PI / 3) * 10
      );
      light.angle = Math.PI / 4;
      light.penumbra = 0.5;
      light.decay = 1;
      light.distance = 100;
      effectsRef.current?.add(light);
      return light;
    });
    spotLightsRef.current = spotLights;

    // Create point lights for ambient effects
    const pointLights = Array(4).fill(null).map((_, i) => {
      const light = new PointLight('#ffffff', 0.5, 50);
      light.position.set(
        Math.cos(i * Math.PI / 2) * 5,
        4,
        Math.sin(i * Math.PI / 2) * 5
      );
      effectsRef.current?.add(light);
      return light;
    });
    pointLightsRef.current = pointLights;

    return () => {
      spotLights.forEach(light => light.dispose());
      pointLights.forEach(light => light.dispose());
    };
  }, []);

  // Update effects based on audio features and AI recommendations
  useFrame(async (state) => {
    if (!effectsRef.current || !audioFeatures) return;

    const time = state.clock.getElapsedTime();

    try {
      // Get AI-generated stage effects
      const effects = await aiService.generateStageEffects(
        eventId,
        audioFeatures,
        'energetic' // You can make this dynamic based on crowd mood
      );

      // Apply lighting patterns
      spotLightsRef.current.forEach((light, i) => {
        if (effects.lightingPattern[i]) {
          const pattern = effects.lightingPattern[i];
          light.color.setHex(parseInt(pattern.replace('#', ''), 16));
          light.intensity = 0.5 + Math.sin(time * audioFeatures.tempo / 60) * 0.5;
          light.position.y = 8 + Math.sin(time * 2 + i) * 0.5;
        }
      });

      // Apply visual effects
      effects.visualEffects.forEach((effect, i) => {
        const pointLight = pointLightsRef.current[i % pointLightsRef.current.length];
        if (pointLight) {
          pointLight.intensity = 0.3 + Math.sin(time * 1.5 + i) * 0.2;
          pointLight.distance = 30 + Math.sin(time + i) * 10;
        }
      });

      // Update camera angles if needed
      if (effects.cameraAngles.length > 0) {
        const currentAngle = Math.floor(time % effects.cameraAngles.length);
        const [x, y, z] = effects.cameraAngles[currentAngle];
        // You can use these coordinates to smoothly move the camera
      }

    } catch (error) {
      console.error('Error generating stage effects:', error);
    }
  });

  return (
    <group ref={effectsRef}>
      {/* Base stage lighting */}
      <ambientLight intensity={0.2} />
      
      {/* Dynamic spotlight rig */}
      <group position={[0, 8, 0]}>
        {spotLightsRef.current.map((_, i) => (
          <spotLight
            key={i}
            position={[
              Math.cos(i * Math.PI / 3) * 10,
              0,
              Math.sin(i * Math.PI / 3) * 10
            ]}
            angle={Math.PI / 4}
            penumbra={0.5}
            intensity={0.5}
            color={currentEvent?.genre === 'Electronic' ? '#ff00ff' : '#ffffff'}
            castShadow
          />
        ))}
      </group>
      
      {/* Dynamic point light system */}
      <group position={[0, 4, 0]}>
        {pointLightsRef.current.map((_, i) => (
          <pointLight
            key={i}
            position={[
              Math.cos(i * Math.PI / 2) * 5,
              0,
              Math.sin(i * Math.PI / 2) * 5
            ]}
            intensity={0.3}
            distance={50}
            decay={2}
          />
        ))}
      </group>
      
      {/* Fog effect */}
      <fog attach="fog" args={['#000000', 30, 100]} />
    </group>
  );
} 