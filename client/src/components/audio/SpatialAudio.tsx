import { useEffect, useMemo, useRef } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useAudioControl } from "@/lib/stores/useAudioControl";
import { useVRMode } from "@/lib/stores/useVRMode";

interface SpatialAudioProps {
  eventId: number;
  environmentType: string;
}

export default function SpatialAudio({ eventId, environmentType }: SpatialAudioProps) {
  const { scene } = useThree();
  const { 
    audioContext, 
    initAudioContext, 
    createAudioNode, 
    updateAudioNodePosition,
    spatialAudioEnabled
  } = useAudioControl();
  
  // Check if spatial audio is enabled in VR mode settings
  const { spatialAudioEnabled: spatialEnabledInVR } = useVRMode();
  
  // Track created audio elements
  const audioElements = useRef<HTMLAudioElement[]>([]);
  
  // Calculate audio positions based on environment type
  const audioPositions = useMemo(() => {
    switch (environmentType) {
      case "stadium":
      case "arena":
        // Sources for a large environment: main stage, left, right, rear
        return [
          { id: `stage-main-${eventId}`, position: [0, 3, -15] },
          { id: `stage-left-${eventId}`, position: [-8, 3, -12] },
          { id: `stage-right-${eventId}`, position: [8, 3, -12] },
          { id: `ambient-left-${eventId}`, position: [-15, 2, 5] },
          { id: `ambient-right-${eventId}`, position: [15, 2, 5] },
        ];
      case "theater":
      case "outdoor_amphitheater":
        // Medium-sized environment
        return [
          { id: `stage-main-${eventId}`, position: [0, 2, -10] },
          { id: `stage-left-${eventId}`, position: [-5, 2, -8] },
          { id: `stage-right-${eventId}`, position: [5, 2, -8] },
        ];
      case "club":
      case "gallery":
      default:
        // Smaller environment
        return [
          { id: `stage-main-${eventId}`, position: [0, 1.5, -5] },
          { id: `ambient-1-${eventId}`, position: [-3, 1.5, -3] },
          { id: `ambient-2-${eventId}`, position: [3, 1.5, -3] },
        ];
    }
  }, [environmentType, eventId]);
  
  // Initialize audio when component mounts
  useEffect(() => {
    // Make sure audio context is initialized
    initAudioContext();
    
    // Only set up audio sources if context exists and spatial audio is enabled
    if (audioContext && spatialAudioEnabled && spatialEnabledInVR) {
      // We'll use the same music file for all sources in this demo
      // but with different volumes to simulate different parts of the environment
      const setupAudioSources = async () => {
        audioPositions.forEach((source, index) => {
          const audioEl = new Audio("/sounds/background.mp3");
          audioEl.loop = true;
          audioEl.volume = 0; // Start with zero volume, the spatial audio system will control volume
          
          // Create audio node with position
          createAudioNode(
            source.id, 
            audioEl, 
            source.position as [number, number, number],
            // Different volumes for different sources
            index === 0 ? 0.8 : 0.4 // Main source louder than ambient
          );
          
          // Keep track of created element to clean up later
          audioElements.current.push(audioEl);
          
          // Play the audio
          audioEl.play().catch(error => {
            console.log("Audio play prevented:", error);
          });
        });
      };
      
      setupAudioSources();
    }
    
    // Cleanup function
    return () => {
      audioElements.current.forEach(el => {
        el.pause();
        el.src = "";
      });
      audioElements.current = [];
    };
  }, [audioContext, createAudioNode, audioPositions, initAudioContext, spatialAudioEnabled, spatialEnabledInVR]);
  
  // For visualization, create mesh objects to represent audio sources
  return (
    <>
      {spatialAudioEnabled && spatialEnabledInVR && audioPositions.map((source, index) => (
        <mesh
          key={source.id}
          position={new THREE.Vector3(...source.position)}
          scale={index === 0 ? 0.5 : 0.3} // Main source larger
        >
          <sphereGeometry args={[1, 16, 16]} />
          <meshBasicMaterial wireframe color={index === 0 ? "#ff0000" : "#00ff00"} transparent opacity={0.5} />
        </mesh>
      ))}
    </>
  );
}
