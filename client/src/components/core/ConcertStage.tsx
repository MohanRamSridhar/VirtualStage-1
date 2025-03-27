import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { SpotLight, PointLight, Group, VideoTexture } from 'three';
import { useEvents } from '@/lib/stores/useEvents';

export default function ConcertStage() {
  const stageRef = useRef<Group>(null);
  const { currentEvent } = useEvents();
  const videoElement = useRef<HTMLVideoElement | null>(null);
  const videoTextureRef = useRef<VideoTexture | null>(null);
  
  // Create dynamic lighting effects
  const spotLights = useRef<SpotLight[]>([]);
  const pointLights = useRef<PointLight[]>([]);
  
  useEffect(() => {
    // Initialize stage lights
    const colors = [
      '#ff0000', // Red
      '#00ff00', // Green
      '#0000ff', // Blue
      '#ffff00', // Yellow
      '#ff00ff', // Magenta
      '#00ffff'  // Cyan
    ];
    
    // Create spot lights for stage lighting
    for (let i = 0; i < 6; i++) {
      const spotLight = new SpotLight(colors[i], 1, 100);
      spotLight.position.set(
        Math.cos(i * Math.PI / 3) * 10,
        8,
        Math.sin(i * Math.PI / 3) * 10
      );
      spotLight.angle = Math.PI / 4;
      spotLight.penumbra = 0.5;
      spotLight.decay = 1;
      spotLight.distance = 100;
      spotLights.current.push(spotLight);
    }
    
    // Create point lights for ambient lighting
    for (let i = 0; i < 4; i++) {
      const pointLight = new PointLight(colors[i], 0.5, 50);
      pointLight.position.set(
        Math.cos(i * Math.PI / 2) * 5,
        4,
        Math.sin(i * Math.PI / 2) * 5
      );
      pointLights.current.push(pointLight);
    }

    // Initialize video if the event has streaming
    if (currentEvent?.tags?.includes('streaming')) {
      const video = document.createElement('video');
      video.src = currentEvent.streamUrl || 'https://assets.mixkit.co/videos/preview/mixkit-concert-stage-with-lights-1010-large.mp4';
      video.loop = true;
      video.muted = true;
      video.playsInline = true;
      videoElement.current = video;
      
      const texture = new VideoTexture(video);
      videoTextureRef.current = texture;
      
      video.play().catch(console.error);
    }
    
    return () => {
      spotLights.current.forEach(light => light.dispose());
      pointLights.current.forEach(light => light.dispose());
      if (videoElement.current) {
        videoElement.current.pause();
        videoElement.current.src = '';
      }
      if (videoTextureRef.current) {
        videoTextureRef.current.dispose();
      }
    };
  }, [currentEvent]);
  
  useFrame((state, delta) => {
    if (!stageRef.current) return;
    
    // Animate stage lights
    const time = state.clock.getElapsedTime();
    
    spotLights.current.forEach((light, i) => {
      light.intensity = 0.5 + Math.sin(time + i) * 0.5;
      light.position.y = 8 + Math.sin(time * 2 + i) * 0.5;
    });
    
    pointLights.current.forEach((light, i) => {
      light.intensity = 0.3 + Math.sin(time * 1.5 + i) * 0.2;
    });
    
    // Update video texture
    if (videoTextureRef.current) {
      videoTextureRef.current.needsUpdate = true;
    }
    
    // Add subtle stage movement
    stageRef.current.position.y = Math.sin(time * 0.5) * 0.05;
  });
  
  return (
    <group ref={stageRef}>
      {/* Main Stage Structure */}
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[20, 1, 10]} />
        <meshStandardMaterial color="#444444" roughness={0.8} metalness={0.2} />
      </mesh>
      
      {/* Stage Platform */}
      <mesh position={[0, 0.6, 0]} castShadow receiveShadow>
        <boxGeometry args={[18, 0.1, 8]} />
        <meshStandardMaterial color="#666666" roughness={0.9} metalness={0.1} />
      </mesh>
      
      {/* Stage Lights */}
      {spotLights.current.map((light, i) => (
        <primitive key={`spot-${i}`} object={light} />
      ))}
      {pointLights.current.map((light, i) => (
        <primitive key={`point-${i}`} object={light} />
      ))}
      
      {/* Speakers */}
      <mesh position={[-8, 1.5, 0]} castShadow>
        <boxGeometry args={[2, 3, 2]} />
        <meshStandardMaterial color="#222222" roughness={0.7} metalness={0.3} />
      </mesh>
      <mesh position={[8, 1.5, 0]} castShadow>
        <boxGeometry args={[2, 3, 2]} />
        <meshStandardMaterial color="#222222" roughness={0.7} metalness={0.3} />
      </mesh>
      
      {/* Stage Backdrop */}
      <mesh position={[0, 4, -4.9]} castShadow>
        <boxGeometry args={[20, 8, 0.1]} />
        <meshStandardMaterial color="#111111" roughness={0.9} metalness={0.1} />
      </mesh>
      
      {/* LED Screen with Video */}
      <mesh position={[0, 4, -4.8]}>
        <planeGeometry args={[18, 7]} />
        {videoTextureRef.current ? (
          <meshBasicMaterial map={videoTextureRef.current} />
        ) : (
          <meshBasicMaterial color={currentEvent?.genre === 'Electronic' ? '#ff00ff' : '#0066cc'} />
        )}
      </mesh>
      
      {/* Stage Effects (Floor Lights) */}
      <mesh position={[0, 0.7, 0]} receiveShadow>
        <boxGeometry args={[16, 0.1, 6]} />
        <meshStandardMaterial
          color={currentEvent?.genre === 'Electronic' ? '#ff00ff' : '#ffffff'}
          emissive={currentEvent?.genre === 'Electronic' ? '#ff00ff' : '#ffffff'}
          emissiveIntensity={0.5}
          transparent
          opacity={0.8}
        />
      </mesh>
      
      {/* Side Screens */}
      <group position={[-9.9, 4, -2]} rotation={[0, Math.PI / 2, 0]}>
        <mesh castShadow>
          <boxGeometry args={[6, 4, 0.1]} />
          <meshStandardMaterial color="#000000" />
        </mesh>
        <mesh position={[0, 0, 0.06]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[5.8, 3.8]} />
          {videoTextureRef.current ? (
            <meshBasicMaterial map={videoTextureRef.current} />
          ) : (
            <meshBasicMaterial color={currentEvent?.genre === 'Electronic' ? '#ff00ff' : '#0066cc'} />
          )}
        </mesh>
      </group>
      
      <group position={[9.9, 4, -2]} rotation={[0, -Math.PI / 2, 0]}>
        <mesh castShadow>
          <boxGeometry args={[6, 4, 0.1]} />
          <meshStandardMaterial color="#000000" />
        </mesh>
        <mesh position={[0, 0, 0.06]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[5.8, 3.8]} />
          {videoTextureRef.current ? (
            <meshBasicMaterial map={videoTextureRef.current} />
          ) : (
            <meshBasicMaterial color={currentEvent?.genre === 'Electronic' ? '#ff00ff' : '#0066cc'} />
          )}
        </mesh>
      </group>
    </group>
  );
} 