import { useRef, useState, useEffect, Suspense } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { GLTF } from "three-stdlib";

// Define model types for different performers
export type PerformerType = "rock" | "classical" | "dancer" | "speaker" | "audience";

// Define model interface
type ModelMap = {
  [key in PerformerType]: string;
};

// Map of model paths by performer type
const MODEL_PATHS: ModelMap = {
  rock: "/models/rock_performer.glb",
  classical: "/models/orchestra_conductor.glb",
  dancer: "/models/dancer.glb",
  speaker: "/models/speaker.glb",
  audience: "/models/audience.glb"
};

// Map event types to performer types
const EVENT_TO_PERFORMER_MAP: { [key: string]: PerformerType } = {
  "concert": "rock",
  "classical": "classical",
  "dance": "dancer",
  "conference": "speaker",
  "theater": "classical",
  "exhibition": "audience",
  "opera": "classical"
};

interface PerformerModelProps {
  eventType: string;
  position?: [number, number, number];
  scale?: number;
  rotate?: boolean;
  genre?: string;
}

// Load and dispose of model cache
const modelCache = new Map();

// Preload common models
Object.values(MODEL_PATHS).forEach(path => {
  useGLTF.preload(path);
});

export default function PerformerModel({ 
  eventType,
  position = [0, 0, 0],
  scale = 1,
  rotate = true,
  genre
}: PerformerModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [performerType, setPerformerType] = useState<PerformerType>("audience");
  
  // Determine which performer type to use based on event type and genre
  useEffect(() => {
    let performer: PerformerType = "audience";
    
    // First check for specific genre matches
    if (genre) {
      const genreLower = genre.toLowerCase();
      if (genreLower.includes("rock")) {
        performer = "rock";
      } else if (genreLower.includes("classical") || genreLower.includes("opera")) {
        performer = "classical";
      } else if (genreLower.includes("dance")) {
        performer = "dancer";
      } else if (genreLower.includes("tech") || genreLower.includes("conference")) {
        performer = "speaker";
      }
    }
    
    // If no match by genre, try by event type
    if (performer === "audience" && eventType) {
      const typeLower = eventType.toLowerCase();
      
      // Check if we have a direct mapping
      if (typeLower in EVENT_TO_PERFORMER_MAP) {
        performer = EVENT_TO_PERFORMER_MAP[typeLower];
      } else {
        // Try to find partial matches
        if (typeLower.includes("concert")) {
          performer = "rock";
        } else if (typeLower.includes("opera") || typeLower.includes("symphony")) {
          performer = "classical";
        } else if (typeLower.includes("dance")) {
          performer = "dancer";
        } else if (typeLower.includes("conference") || typeLower.includes("lecture")) {
          performer = "speaker";
        }
      }
    }
    
    setPerformerType(performer);
  }, [eventType, genre]);

  // Load appropriate model
  const { scene: modelScene } = useGLTF(MODEL_PATHS[performerType]) as GLTF & {
    scene: THREE.Group;
  };
  
  // Clone model if loaded
  useEffect(() => {
    if (modelScene) {
      setModelLoaded(true);
      console.log(`Performer model loaded: ${performerType}`);
    }
  }, [modelScene, performerType]);
  
  // Animate the model
  useFrame(({ clock }) => {
    if (groupRef.current && rotate) {
      // Simple animations based on performer type
      if (performerType === "rock") {
        // Rock performer moves more dramatically
        groupRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.5) * 0.3;
        groupRef.current.position.y = Math.sin(clock.getElapsedTime() * 2) * 0.05 + position[1];
      } else if (performerType === "classical") {
        // Conductor makes rhythmic movements
        groupRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.2) * 0.1;
        groupRef.current.rotation.z = Math.sin(clock.getElapsedTime() * 1) * 0.05;
      } else if (performerType === "dancer") {
        // Dancer moves more fluidly
        groupRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.3) * 0.5;
        groupRef.current.position.y = Math.sin(clock.getElapsedTime() * 1) * 0.1 + position[1];
      } else if (performerType === "speaker") {
        // Speaker makes subtle gestures
        groupRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.1) * 0.05;
        groupRef.current.rotation.z = Math.sin(clock.getElapsedTime() * 0.3) * 0.02;
      } else {
        // Audience has slight sway
        groupRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.1) * 0.02;
      }
    }
  });

  return (
    <group 
      ref={groupRef} 
      position={[position[0], position[1], position[2]]}
      scale={[scale, scale, scale]}
    >
      {modelLoaded ? (
        <Suspense fallback={
          <mesh castShadow>
            <boxGeometry args={[1, 2, 1]} />
            <meshStandardMaterial color="#AAAAAA" />
          </mesh>
        }>
          <primitive object={modelScene.clone()} castShadow />
        </Suspense>
      ) : (
        <mesh castShadow>
          <boxGeometry args={[1, 2, 1]} />
          <meshStandardMaterial color="#AAAAAA" />
        </mesh>
      )}
    </group>
  );
}