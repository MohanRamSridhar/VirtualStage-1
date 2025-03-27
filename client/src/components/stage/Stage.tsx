import { Plane, Box } from '@react-three/drei';

export function Stage() {
  return (
    <group>
      {/* Stage floor */}
      <Plane
        args={[20, 10]}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
        receiveShadow
      >
        <meshStandardMaterial color="#2c2c2c" />
      </Plane>
      
      {/* Stage platform */}
      <Box
        args={[10, 1, 5]}
        position={[0, 0.5, -2]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color="#1a1a1a" />
      </Box>
      
      {/* Back wall */}
      <Box
        args={[20, 8, 0.5]}
        position={[0, 4, -5]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color="#1a1a1a" />
      </Box>
      
      {/* Side walls */}
      <Box
        args={[0.5, 8, 10]}
        position={[-10, 4, 0]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color="#1a1a1a" />
      </Box>
      <Box
        args={[0.5, 8, 10]}
        position={[10, 4, 0]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color="#1a1a1a" />
      </Box>
    </group>
  );
} 