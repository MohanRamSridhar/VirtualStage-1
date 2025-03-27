import { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { useAudioControl } from '@/lib/stores/useAudioControl';
import { useEvents } from '@/lib/stores/useEvents';
import { Event } from '@/lib/types';
import { Stage } from '@/components/stage/Stage';
import { Audience } from '@/components/stage/Audience';
import DynamicStageEffects from '@/components/stage/DynamicStageEffects';

interface ConcertStageProps {
  eventId: string;
}

export default function ConcertStage({ eventId }: ConcertStageProps) {
  const event = useEvents((state) => state.events.find((e: Event) => e.id === eventId));
  const { initAudioContext } = useAudioControl();
  const [hasInteracted, setHasInteracted] = useState(false);
  
  useEffect(() => {
    const handleInteraction = () => {
      if (!hasInteracted) {
        initAudioContext();
        setHasInteracted(true);
      }
    };
    
    window.addEventListener('click', handleInteraction);
    window.addEventListener('touchstart', handleInteraction);
    
    return () => {
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
    };
  }, [hasInteracted, initAudioContext]);
  
  if (!event) return null;
  
  return (
    <div className="w-full h-full">
      <Canvas shadows>
        <PerspectiveCamera
          makeDefault
          position={[0, 5, 10]}
          fov={75}
        />
        <OrbitControls
          enablePan={false}
          minDistance={5}
          maxDistance={20}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 2}
        />
        <Stage />
        <Audience />
        <DynamicStageEffects
          eventId={eventId}
          audioUrl={event.streamUrl}
        />
        <ambientLight intensity={0.1} />
      </Canvas>
    </div>
  );
} 