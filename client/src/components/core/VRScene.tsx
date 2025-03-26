import { Canvas } from "@react-three/fiber";
import { useState, useEffect } from "react";
import { KeyboardControls } from "@react-three/drei";
import * as THREE from "three";
import { useVRMode } from "@/lib/stores/useVRMode";
import { useAudioControl } from "@/lib/stores/useAudioControl";
import Environment from "./Environment";
import VRControls from "./VRControls";

// Define keyboard controls
enum Controls {
  forward = 'forward',
  back = 'back',
  left = 'left',
  right = 'right',
  jump = 'jump',
}

interface VRSceneProps {
  environment: string;
  eventId: number;
  children?: React.ReactNode;
}

export default function VRScene({ environment, eventId, children }: VRSceneProps) {
  const [isXRSupported, setIsXRSupported] = useState(false);
  const { setVRSupported, cameraHeight, renderQuality } = useVRMode();
  const { initAudioContext, updateListenerPosition } = useAudioControl();
  
  // Check if WebXR is supported
  useEffect(() => {
    const checkXRSupport = async () => {
      if ("xr" in navigator) {
        try {
          const isSupported = await (navigator as any).xr.isSessionSupported("immersive-vr");
          setIsXRSupported(isSupported);
          setVRSupported(isSupported);
          console.log("WebXR immersive-vr support:", isSupported);
        } catch (error) {
          console.error("Error checking WebXR support:", error);
          setIsXRSupported(false);
          setVRSupported(false);
        }
      } else {
        console.log("WebXR not available in this browser");
        setIsXRSupported(false);
        setVRSupported(false);
      }
    };
    
    checkXRSupport();
    
    // Initialize audio context
    initAudioContext();
  }, [setVRSupported, initAudioContext]);

  // Setup keyboard controls mapping
  const keyMap = [
    { name: Controls.forward, keys: ['ArrowUp', 'KeyW'] },
    { name: Controls.back, keys: ['ArrowDown', 'KeyS'] },
    { name: Controls.left, keys: ['ArrowLeft', 'KeyA'] },
    { name: Controls.right, keys: ['ArrowRight', 'KeyD'] },
    { name: Controls.jump, keys: ['Space'] },
  ];

  // Determine pixel ratio based on quality setting
  const getPixelRatio = () => {
    switch (renderQuality) {
      case "low": return 1;
      case "medium": return Math.min(1.5, window.devicePixelRatio);
      case "high": return window.devicePixelRatio;
      default: return 1;
    }
  };

  return (
    <div className="w-full h-full">
      {isXRSupported && (
        <button 
          className="fixed top-5 right-5 z-50 bg-primary text-primary-foreground p-2 rounded-md"
          onClick={() => console.log("VR Button clicked - VR mode would start here")}
        >
          Enter VR
        </button>
      )}
      
      <KeyboardControls map={keyMap}>
        <Canvas
          shadows
          camera={{
            position: [0, cameraHeight, 5],
            fov: 75,
            near: 0.1,
            far: 1000
          }}
          gl={{
            antialias: renderQuality !== "low",
            alpha: false,
            depth: true,
            stencil: false,
            powerPreference: "default",
            pixelRatio: getPixelRatio()
          }}
          className="w-full h-full"
          onCreated={({ camera }) => {
            // Set initial listener position for spatial audio
            const position = camera.position.toArray();
            // Forward vector is the negative z direction in camera local space
            const forward = new THREE.Vector3(0, 0, -1);
            forward.applyQuaternion(camera.quaternion);
            // Up vector is the positive y direction in camera local space
            const up = new THREE.Vector3(0, 1, 0);
            up.applyQuaternion(camera.quaternion);
            
            updateListenerPosition(
              position as [number, number, number],
              forward.toArray() as [number, number, number],
              up.toArray() as [number, number, number]
            );
          }}
        >
          {/* Movement Controls */}
          <VRControls />
          
          {/* Environment based on event type */}
          <Environment type={environment} eventId={eventId} />
          
          {/* Render any additional children */}
          {children}
        </Canvas>
      </KeyboardControls>
    </div>
  );
}
