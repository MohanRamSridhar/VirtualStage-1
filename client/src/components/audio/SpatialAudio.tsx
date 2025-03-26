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
  
  // Get the appropriate audio file based on environment type
  const getAudioFile = (environmentType: string, sourceType: string): string => {
    // For a real application, we would have different music files for different event types
    // For now, we'll use the background.mp3 file and add logic for future expansion
    if (sourceType.includes('stage-main')) {
      switch (environmentType.toLowerCase()) {
        case 'stadium':
        case 'arena':
          return "/sounds/background.mp3"; // Upbeat, energetic music for stadiums
        case 'theater':
          return "/sounds/background.mp3"; // Classical or orchestral music
        case 'gallery':
          return "/sounds/background.mp3"; // Ambient, atmospheric music
        case 'club':
          return "/sounds/background.mp3"; // Electronic, dance music
        default:
          return "/sounds/background.mp3";
      }
    } else if (sourceType.includes('ambient')) {
      // Ambient sounds would be different based on the environment
      // But for now, we use the same file with different volumes
      return "/sounds/background.mp3";
    } else {
      // Other sound sources
      return "/sounds/background.mp3";
    }
  };

  // Initialize audio when component mounts
  useEffect(() => {
    // Make sure audio context is initialized
    initAudioContext();
    
    // Only set up audio sources if context exists and spatial audio is enabled
    if (audioContext && spatialAudioEnabled && spatialEnabledInVR) {
      const setupAudioSources = async () => {
        audioPositions.forEach((source, index) => {
          // Select the appropriate audio file based on environment and source type
          const audioFile = getAudioFile(environmentType, source.id);
          
          const audioEl = new Audio(audioFile);
          audioEl.loop = true;
          audioEl.volume = 0; // Start with zero volume, the spatial audio system will control volume
          
          // Different initial volumes based on source position and environment
          let sourceVolume = 0.5;
          
          // Main stage sources are louder
          if (source.id.includes('stage-main')) {
            sourceVolume = 0.8;
          } 
          // Ambient sources are quieter
          else if (source.id.includes('ambient')) {
            sourceVolume = 0.3;
          }
          // Side stage sources have medium volume
          else if (source.id.includes('stage')) {
            sourceVolume = 0.5;
          }
          
          // Create audio node with position and calculated volume
          createAudioNode(
            source.id, 
            audioEl, 
            source.position as [number, number, number],
            sourceVolume
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
