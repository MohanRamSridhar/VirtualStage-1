import { useEffect, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Sky, Stars, Cloud, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { useEvents } from "@/lib/stores/useEvents";
import SpatialAudio from "@/components/audio/SpatialAudio";

interface EnvironmentProps {
  type: string;
  eventId: number;
}

export default function Environment({ type, eventId }: EnvironmentProps) {
  // Get event details for environment customization
  const { selectedEvent } = useEvents();
  
  const getEnvironmentSettings = () => {
    switch (type.toLowerCase()) {
      case "stadium":
        return {
          floorTexture: "asphalt.png",
          skyType: "day",
          hasClouds: true,
          isDark: false,
          scale: 100,
        };
      case "theater":
        return {
          floorTexture: "wood.jpg",
          skyType: "none",
          hasClouds: false,
          isDark: true,
          scale: 50,
        };
      case "gallery":
        return {
          floorTexture: "wood.jpg",
          skyType: "none",
          hasClouds: false,
          isDark: false,
          scale: 40,
        };
      case "outdoor_amphitheater":
        return {
          floorTexture: "grass.png",
          skyType: "night",
          hasClouds: false,
          isDark: false,
          scale: 75,
        };
      case "club":
        return {
          floorTexture: "wood.jpg",
          skyType: "none",
          hasClouds: false,
          isDark: true,
          scale: 30,
        };
      case "arena":
        return {
          floorTexture: "asphalt.png",
          skyType: "day",
          hasClouds: true,
          isDark: false,
          scale: 80,
        };
      default:
        return {
          floorTexture: "grass.png",
          skyType: "day",
          hasClouds: true,
          isDark: false,
          scale: 50,
        };
    }
  };

  const settings = getEnvironmentSettings();

  // Load floor texture
  const floorTexture = useTexture(`/textures/${settings.floorTexture}`);
  floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
  floorTexture.repeat.set(20, 20);
  
  // Create stage lighting based on environment
  const stageLightRef = useRef<THREE.SpotLight>(null);
  const ambientLightRef = useRef<THREE.AmbientLight>(null);
  
  // Stage decorations and props based on event type
  const [stageProps, setStageProps] = useState<{
    floorColor: string;
    backWallColor: string;
    sideWallColor: string;
    stageHeight: number;
    hasBackscreen: boolean;
    hasSideScreens: boolean;
    hasPodium: boolean;
    hasSeating: boolean;
  }>({
    floorColor: "#444444",
    backWallColor: "#222222",
    sideWallColor: "#333333",
    stageHeight: 1,
    hasBackscreen: false,
    hasSideScreens: false,
    hasPodium: false,
    hasSeating: false
  });
  
  // Moving lights for music events
  const [movingLights, setMovingLights] = useState<{ position: [number, number, number], color: string }[]>([]);
  
  useEffect(() => {
    // Set up specific environment props based on event type
    const setupEnvProps = () => {
      if (!selectedEvent) return;
      
      let props = { ...stageProps };
      
      switch (selectedEvent.type.toLowerCase()) {
        case "concert":
          props = {
            floorColor: "#444444",
            backWallColor: "#111111",
            sideWallColor: "#222222",
            stageHeight: 1.5,
            hasBackscreen: true,
            hasSideScreens: true,
            hasPodium: false,
            hasSeating: false
          };
          
          // Set up moving lights for concerts
          const lights = [];
          // Calculate light positions based on an arc
          for (let i = 0; i < 5; i++) {
            const angle = (i / 4) * Math.PI - Math.PI / 2;
            const x = Math.cos(angle) * 8;
            const z = Math.sin(angle) * 8 - 5; // Position them behind the stage
            lights.push({
              position: [x, 5, z] as [number, number, number],
              color: ["#ff0000", "#00ff00", "#0000ff", "#ffff00", "#ff00ff"][i]
            });
          }
          setMovingLights(lights);
          break;
          
        case "theater":
        case "opera":
          props = {
            floorColor: "#8B4513", // Brown wooden floor
            backWallColor: "#8B0000", // Dark red curtain
            sideWallColor: "#8B0000", // Dark red curtain
            stageHeight: 1.2,
            hasBackscreen: false,
            hasSideScreens: false,
            hasPodium: false,
            hasSeating: true
          };
          setMovingLights([]); // No moving lights for theater
          break;
          
        case "exhibition":
        case "gallery":
          props = {
            floorColor: "#FFFFFF", // White floor
            backWallColor: "#FFFFFF", // White walls
            sideWallColor: "#FFFFFF",
            stageHeight: 0.5,
            hasBackscreen: false,
            hasSideScreens: false,
            hasPodium: false,
            hasSeating: false
          };
          setMovingLights([]); // No moving lights for exhibitions
          break;
          
        case "conference":
        case "lecture":
          props = {
            floorColor: "#444444",
            backWallColor: "#1E3F66", // Blue wall
            sideWallColor: "#1E3F66",
            stageHeight: 0.8,
            hasBackscreen: true, // Presentation screen
            hasSideScreens: false,
            hasPodium: true, // Speaker podium
            hasSeating: true
          };
          setMovingLights([]); // No moving lights for conferences
          break;
          
        default:
          // Default to concert setup
          props = {
            floorColor: "#444444",
            backWallColor: "#222222",
            sideWallColor: "#333333",
            stageHeight: 1,
            hasBackscreen: false,
            hasSideScreens: false,
            hasPodium: false,
            hasSeating: false
          };
          
          // Simple lighting setup
          const defaultLights = [];
          for (let i = 0; i < 3; i++) {
            defaultLights.push({
              position: [(i - 1) * 8, 5, -5] as [number, number, number],
              color: ["#ff0000", "#ffffff", "#0000ff"][i]
            });
          }
          setMovingLights(defaultLights);
      }
      
      setStageProps(props);
    };
    
    setupEnvProps();
  }, [selectedEvent]);
  
  // Animate moving lights
  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    
    // Animate stage light for concerts
    if (stageLightRef.current && selectedEvent?.type === "concert") {
      const intensity = 1 + Math.sin(time * 2) * 0.3;
      stageLightRef.current.intensity = intensity;
    }
    
    // Animate ambient light for certain environments
    if (ambientLightRef.current && settings.isDark) {
      const intensity = 0.2 + Math.sin(time) * 0.05;
      ambientLightRef.current.intensity = intensity;
    }
  });
  
  // Detect scene size for placing objects
  const { size } = useThree();
  const aspectRatio = size.width / size.height;

  // Generate random positions for audience members in concerts
  const [audiencePositions] = useState(() => {
    if (type === "stadium" || type === "arena" || type === "outdoor_amphitheater") {
      return Array.from({ length: 50 }, () => ({
        position: [
          (Math.random() - 0.5) * settings.scale,
          0, // On the ground
          (Math.random() * 0.5 + 0.5) * settings.scale / 2, // Only in the positive Z (in front of the stage)
        ] as [number, number, number],
        scale: 0.8 + Math.random() * 0.4,
      }));
    }
    return [];
  });

  return (
    <>
      {/* Lighting */}
      <ambientLight ref={ambientLightRef} intensity={settings.isDark ? 0.2 : 0.8} color={settings.isDark ? "#2c2c5c" : "#ffffff"} />
      <directionalLight position={[10, 10, 5]} intensity={settings.isDark ? 0.1 : 0.8} castShadow />
      
      {/* Main stage spotlight */}
      <spotLight 
        ref={stageLightRef}
        position={[0, 10, 0]} 
        intensity={1.5} 
        angle={Math.PI / 4} 
        penumbra={0.1} 
        castShadow 
        color={settings.isDark ? "#ffffff" : "#ffffe0"}
      />
      
      {/* Moving spotlights for concerts */}
      {movingLights.map((light, index) => (
        <spotLight
          key={`moving-light-${index}`}
          position={light.position}
          intensity={1.2}
          angle={Math.PI / 8}
          penumbra={0.2}
          color={light.color}
          castShadow={false}
        />
      ))}
      
      {/* Sky or background environment */}
      {settings.skyType === "day" && <Sky sunPosition={[100, 10, 100]} />}
      {settings.skyType === "night" && (
        <>
          <color attach="background" args={["#000010"]} />
          <Stars radius={100} depth={50} count={5000} factor={4} />
        </>
      )}
      {settings.skyType === "none" && <color attach="background" args={[settings.isDark ? "#0a0a0a" : "#f0f0f0"]} />}
      
      {/* Clouds for outdoor environments */}
      {settings.hasClouds && (
        <>
          <Cloud position={[-10, 15, -10]} speed={0.2} opacity={0.4} />
          <Cloud position={[10, 12, -15]} speed={0.1} opacity={0.3} />
          <Cloud position={[0, 18, -20]} speed={0.3} opacity={0.5} />
        </>
      )}
      
      {/* Ground/floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[settings.scale, settings.scale]} />
        <meshStandardMaterial map={floorTexture} roughness={0.8} metalness={0.2} />
      </mesh>
      
      {/* Stage */}
      <group position={[0, 0, -10]}>
        {/* Stage platform with dynamic height based on event type */}
        <mesh position={[0, stageProps.stageHeight / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[20, stageProps.stageHeight, 10]} />
          <meshStandardMaterial color={stageProps.floorColor} roughness={0.9} />
        </mesh>
        
        {/* Back wall */}
        <mesh position={[0, 5, -5]} castShadow receiveShadow>
          <boxGeometry args={[20, 10, 0.2]} />
          <meshStandardMaterial color={stageProps.backWallColor} roughness={1} />
        </mesh>
        
        {/* Side walls */}
        <mesh position={[-10, 5, 0]} rotation={[0, Math.PI / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[10, 10, 0.2]} />
          <meshStandardMaterial color={stageProps.sideWallColor} roughness={1} />
        </mesh>
        
        <mesh position={[10, 5, 0]} rotation={[0, Math.PI / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[10, 10, 0.2]} />
          <meshStandardMaterial color={stageProps.sideWallColor} roughness={1} />
        </mesh>
        
        {/* Conditional stage elements based on event type */}
        
        {/* Back screen for presentations or concerts */}
        {stageProps.hasBackscreen && (
          <group position={[0, 5, -4.9]}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[16, 8, 0.1]} />
              <meshStandardMaterial color="#000000" roughness={0.5} metalness={0.2} />
            </mesh>
            {/* Screen content - would normally be a video texture */}
            <mesh position={[0, 0, 0.06]}>
              <planeGeometry args={[15.5, 7.5]} />
              <meshBasicMaterial color="#0072CE" />
            </mesh>
          </group>
        )}
        
        {/* Side screens for larger venues */}
        {stageProps.hasSideScreens && (
          <>
            <group position={[-9.9, 5, -2]} rotation={[0, Math.PI / 2, 0]}>
              <mesh castShadow receiveShadow>
                <boxGeometry args={[6, 4, 0.1]} />
                <meshStandardMaterial color="#000000" roughness={0.5} metalness={0.2} />
              </mesh>
              <mesh position={[0, 0, 0.06]} rotation={[0, Math.PI, 0]}>
                <planeGeometry args={[5.5, 3.5]} />
                <meshBasicMaterial color="#333333" />
              </mesh>
            </group>
            
            <group position={[9.9, 5, -2]} rotation={[0, -Math.PI / 2, 0]}>
              <mesh castShadow receiveShadow>
                <boxGeometry args={[6, 4, 0.1]} />
                <meshStandardMaterial color="#000000" roughness={0.5} metalness={0.2} />
              </mesh>
              <mesh position={[0, 0, 0.06]} rotation={[0, Math.PI, 0]}>
                <planeGeometry args={[5.5, 3.5]} />
                <meshBasicMaterial color="#333333" />
              </mesh>
            </group>
          </>
        )}
        
        {/* Podium for conferences/lectures */}
        {stageProps.hasPodium && (
          <mesh position={[0, stageProps.stageHeight + 0.5, 0]} castShadow receiveShadow>
            <boxGeometry args={[2, 1, 1.5]} />
            <meshStandardMaterial color="#4b2b15" roughness={0.8} />
          </mesh>
        )}
        
        {/* Seating for theaters or conference rooms */}
        {stageProps.hasSeating && (
          <group position={[0, 0, 10]}>
            {/* Multiple rows of seats */}
            {Array.from({ length: 5 }).map((_, rowIndex) => (
              <group key={`seat-row-${rowIndex}`} position={[0, rowIndex * 0.5, rowIndex * 3]}>
                {/* Seats across a row */}
                {Array.from({ length: 10 }).map((_, seatIndex) => (
                  <mesh 
                    key={`seat-${rowIndex}-${seatIndex}`}
                    position={[(seatIndex - 4.5) * 2, 0.25, 0]}
                    castShadow
                    receiveShadow
                  >
                    <boxGeometry args={[1.5, 0.5, 2]} />
                    <meshStandardMaterial color="#3a3a3a" roughness={0.9} />
                  </mesh>
                ))}
              </group>
            ))}
          </group>
        )}
      </group>
      
      {/* Simple audience representation for stadium/arena */}
      {audiencePositions.map((item, index) => (
        <mesh 
          key={`audience-${index}`} 
          position={item.position} 
          scale={[item.scale, item.scale * 2, item.scale]}
          castShadow
        >
          <capsuleGeometry args={[0.2, 1, 4, 8]} />
          <meshStandardMaterial color={`hsl(${Math.random() * 360}, 70%, 60%)`} />
        </mesh>
      ))}
      
      {/* Audio sources based on the environment */}
      <SpatialAudio eventId={eventId} environmentType={type} />
    </>
  );
}
