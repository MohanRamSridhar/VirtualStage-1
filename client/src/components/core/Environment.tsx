import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Environment as EnvironmentImpl, Stars, Cloud } from '@react-three/drei';
import { Group, Vector3 } from 'three';
import ConcertStage from './ConcertStage';
import AudienceModel from './AudienceModel';
import { useEvents } from '@/lib/stores/useEvents';

export default function Environment() {
  const groupRef = useRef<Group>(null);
  const { currentEvent } = useEvents();
  
  // Create audience positions
  const audiencePositions = useMemo(() => {
    const positions: Array<{ position: [number, number, number]; rotation: [number, number, number]; scale: number; type: 'standing' | 'seated' | 'dancing' }> = [];
    
    // Front row (standing/dancing)
    for (let i = -8; i <= 8; i += 1.5) {
      positions.push({
        position: [i, 0, 5],
        rotation: [0, Math.PI, 0],
        scale: 0.8,
        type: 'dancing'
      });
    }
    
    // Middle rows (seated)
    for (let row = 1; row <= 3; row++) {
      for (let i = -7; i <= 7; i += 2) {
        positions.push({
          position: [i, 0, 5 + row * 2],
          rotation: [0, Math.PI, 0],
          scale: 0.7,
          type: 'seated'
        });
      }
    }
    
    // Back rows (standing)
    for (let row = 4; row <= 5; row++) {
      for (let i = -6; i <= 6; i += 2.5) {
        positions.push({
          position: [i, 0, 5 + row * 2],
          rotation: [0, Math.PI, 0],
          scale: 0.75,
          type: 'standing'
        });
      }
    }
    
    return positions;
  }, []);
  
  // Subtle camera movement
  useFrame((state) => {
    if (!groupRef.current) return;
    const time = state.clock.getElapsedTime();
    groupRef.current.position.y = Math.sin(time * 0.2) * 0.1;
  });
  
  return (
    <group ref={groupRef}>
      {/* Concert Stage */}
      <ConcertStage />
      
      {/* Audience */}
      {audiencePositions.map((props, index) => (
        <AudienceModel key={index} {...props} />
      ))}
      
      {/* Environmental Lighting */}
      <EnvironmentImpl preset="night" background blur={0.8} />
      
      {/* Night Sky */}
      <Stars 
        radius={100} 
        depth={50} 
        count={5000} 
        factor={4} 
        saturation={0} 
        fade 
        speed={1}
      />
      
      {/* Atmospheric Clouds */}
      <Cloud
        opacity={0.5}
        speed={0.4}
        segments={20}
      />
      
      {/* Ambient Lighting */}
      <ambientLight intensity={0.2} />
      
      {/* Stage Area Lighting */}
      <pointLight
        position={[0, 10, 0]}
        intensity={0.5}
        color={currentEvent?.genre === 'Electronic' ? '#ff00ff' : '#ffffff'}
      />
      
      {/* Audience Area Lighting */}
      <pointLight
        position={[0, 8, 10]}
        intensity={0.3}
        color="#ffffff"
      />
      
      {/* Side Lighting */}
      <pointLight
        position={[-15, 5, 0]}
        intensity={0.2}
        color="#ff6600"
      />
      <pointLight
        position={[15, 5, 0]}
        intensity={0.2}
        color="#0066ff"
      />
      
      {/* Ground Fog Effect */}
      <fog attach="fog" args={['#000000', 30, 100]} />
      
      {/* Ground Plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial 
          color="#111111"
          roughness={0.8}
          metalness={0.2}
          transparent
          opacity={0.8}
        />
      </mesh>
    </group>
  );
}
