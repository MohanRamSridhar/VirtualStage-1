import { useMemo } from 'react';
import { Sphere, Cylinder } from '@react-three/drei';
import { Vector3 } from 'three';

interface AudienceMemberProps {
  position: [number, number, number];
}

function AudienceMember({ position }: AudienceMemberProps) {
  return (
    <group position={position}>
      {/* Head */}
      <Sphere args={[0.2, 16, 16]} position={[0, 1.6, 0]}>
        <meshStandardMaterial color="#ffdbac" />
      </Sphere>
      {/* Body */}
      <Cylinder args={[0.25, 0.25, 1.2, 8]} position={[0, 0.8, 0]}>
        <meshStandardMaterial color={`hsl(${Math.random() * 360}, 70%, 50%)`} />
      </Cylinder>
    </group>
  );
}

export function Audience() {
  const audiencePositions = useMemo(() => {
    const positions: [number, number, number][] = [];
    const rows = 5;
    const membersPerRow = 8;
    const spacing = 1.2;
    const rowSpacing = 1.5;
    
    for (let row = 0; row < rows; row++) {
      for (let i = 0; i < membersPerRow; i++) {
        const x = (i - (membersPerRow - 1) / 2) * spacing;
        const z = row * rowSpacing + 2; // Start 2 units in front of stage
        
        // Add some randomization to positions
        const randomX = (Math.random() - 0.5) * 0.3;
        const randomZ = (Math.random() - 0.5) * 0.3;
        
        positions.push([x + randomX, 0, z + randomZ]);
      }
    }
    
    return positions;
  }, []);
  
  return (
    <group>
      {audiencePositions.map((position, index) => (
        <AudienceMember key={index} position={position} />
      ))}
    </group>
  );
} 