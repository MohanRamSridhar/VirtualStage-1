import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group } from 'three';

export type AudienceType = 'standing' | 'seated' | 'dancing';

interface AudienceModelProps {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
  type: AudienceType;
  animate?: boolean;
}

export default function AudienceModel({ position, rotation, scale, type, animate = false }: AudienceModelProps) {
  const groupRef = useRef<Group>(null);
  
  useFrame((state) => {
    if (!groupRef.current || !animate) return;
    
    const time = state.clock.getElapsedTime();
    
    // Add different animations based on type
    switch (type) {
      case 'dancing':
        // Dancing movement
        groupRef.current.position.y = position[1] + Math.sin(time * 4) * 0.2;
        groupRef.current.rotation.y = rotation[1] + Math.sin(time * 2) * 0.3;
        break;
      case 'standing':
        // Subtle swaying
        groupRef.current.position.y = position[1] + Math.sin(time * 2) * 0.1;
        groupRef.current.rotation.y = rotation[1] + Math.sin(time) * 0.1;
        break;
      case 'seated':
        // Very subtle movement
        groupRef.current.position.y = position[1] + Math.sin(time) * 0.05;
        break;
    }
  });
  
  return (
    <group
      ref={groupRef}
      position={position}
      rotation={rotation}
      scale={[scale, scale, scale]}
    >
      {/* Body */}
      <mesh castShadow>
        <capsuleGeometry args={[0.3, 1, 4, 8]} />
        <meshStandardMaterial color="#444444" />
      </mesh>
      
      {/* Head */}
      <mesh position={[0, 0.8, 0]} castShadow>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial color="#ffdbac" />
      </mesh>
      
      {/* Arms */}
      <group position={[0, 0.3, 0]}>
        {/* Left Arm */}
        <mesh position={[-0.4, 0, 0]} rotation={[0, 0, Math.PI / 4]} castShadow>
          <capsuleGeometry args={[0.1, 0.6, 4, 8]} />
          <meshStandardMaterial color="#444444" />
        </mesh>
        
        {/* Right Arm */}
        <mesh position={[0.4, 0, 0]} rotation={[0, 0, -Math.PI / 4]} castShadow>
          <capsuleGeometry args={[0.1, 0.6, 4, 8]} />
          <meshStandardMaterial color="#444444" />
        </mesh>
      </group>
      
      {/* Legs */}
      {type !== 'seated' && (
        <group position={[0, -0.7, 0]}>
          {/* Left Leg */}
          <mesh position={[-0.2, 0, 0]} castShadow>
            <capsuleGeometry args={[0.12, 0.8, 4, 8]} />
            <meshStandardMaterial color="#222222" />
          </mesh>
          
          {/* Right Leg */}
          <mesh position={[0.2, 0, 0]} castShadow>
            <capsuleGeometry args={[0.12, 0.8, 4, 8]} />
            <meshStandardMaterial color="#222222" />
          </mesh>
        </group>
      )}
    </group>
  );
} 