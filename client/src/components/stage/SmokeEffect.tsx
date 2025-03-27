import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface SmokeEffectProps {
  position: [number, number, number];
  intensity: number;
  color: string;
}

export function SmokeEffect({ position, intensity, color }: SmokeEffectProps) {
  const particlesRef = useRef<THREE.Points>(null);
  
  // Create particles geometry
  const { geometry, material } = useMemo(() => {
    const particleCount = 1000;
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);
    const lifetimes = new Float32Array(particleCount);
    
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      // Random starting position in a circle
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 0.5;
      positions[i3] = Math.cos(angle) * radius;
      positions[i3 + 1] = 0;
      positions[i3 + 2] = Math.sin(angle) * radius;
      
      // Random velocities
      velocities[i3] = (Math.random() - 0.5) * 0.02;
      velocities[i3 + 1] = Math.random() * 0.1;
      velocities[i3 + 2] = (Math.random() - 0.5) * 0.02;
      
      // Random lifetimes
      lifetimes[i] = Math.random();
    }
    
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
    geometry.setAttribute('lifetime', new THREE.BufferAttribute(lifetimes, 1));
    
    const material = new THREE.PointsMaterial({
      size: 0.1,
      color: new THREE.Color(color),
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    
    return { geometry, material };
  }, [color]);
  
  // Update particles
  useFrame((state, delta) => {
    if (!particlesRef.current) return;
    
    const positions = particlesRef.current.geometry.getAttribute('position');
    const velocities = particlesRef.current.geometry.getAttribute('velocity');
    const lifetimes = particlesRef.current.geometry.getAttribute('lifetime');
    
    for (let i = 0; i < positions.count; i++) {
      const i3 = i * 3;
      
      // Update position based on velocity
      positions.array[i3] += velocities.array[i3] * intensity;
      positions.array[i3 + 1] += velocities.array[i3 + 1] * intensity;
      positions.array[i3 + 2] += velocities.array[i3 + 2] * intensity;
      
      // Update lifetime
      lifetimes.array[i] += delta * 0.5;
      if (lifetimes.array[i] > 1) {
        // Reset particle
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * 0.5;
        positions.array[i3] = Math.cos(angle) * radius;
        positions.array[i3 + 1] = 0;
        positions.array[i3 + 2] = Math.sin(angle) * radius;
        lifetimes.array[i] = 0;
      }
    }
    
    positions.needsUpdate = true;
    lifetimes.needsUpdate = true;
  });
  
  return (
    <points
      ref={particlesRef}
      position={position}
      geometry={geometry}
      material={material}
    />
  );
} 