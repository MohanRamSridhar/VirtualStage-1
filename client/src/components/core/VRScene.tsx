import { Canvas } from "@react-three/fiber";
import { useState, useEffect, createContext, useContext } from "react";
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

// Create a context for VR button
const VRButtonContext = createContext<{
  enterVR: () => void;
  exitVR: () => void;
  isPresenting: boolean;
}>({
  enterVR: () => {},
  exitVR: () => {},
  isPresenting: false,
});

// Custom VR Button Component
function VRButton() {
  const { isPresenting, enterVR } = useContext(VRButtonContext);
  
  return (
    <button
      onClick={enterVR}
      className="px-4 py-2 bg-primary text-white rounded-lg font-medium"
      disabled={isPresenting}
    >
      Enter VR
    </button>
  );
}

export default function VRScene({ environment, eventId, children }: VRSceneProps) {
  const [isXRSupported, setIsXRSupported] = useState(false);
  const [isPresenting, setIsPresenting] = useState(false);
  const { setVRSupported, cameraHeight, renderQuality, setVRSession, setMode } = useVRMode();
  const { initAudioContext, updateListenerPosition } = useAudioControl();
  
  // Functions to enter/exit VR
  const enterVR = async () => {
    try {
      if (window.navigator.xr) {
        const session = await window.navigator.xr.requestSession('immersive-vr', {
          optionalFeatures: ['local-floor', 'bounded-floor']
        });
        
        setIsPresenting(true);
        setVRSession(session);
        setMode('vr');
        
        session.addEventListener('end', () => {
          setIsPresenting(false);
          setVRSession(null);
          setMode('desktop');
        });
      }
    } catch (error) {
      console.error("Error entering VR: ", error);
    }
  };
  
  const exitVR = async () => {
    // This function would be called when exiting VR
    // The session's 'end' event will handle cleanup
  };
  
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

  // VR context value
  const vrContextValue = {
    enterVR,
    exitVR,
    isPresenting
  };

  return (
    <VRButtonContext.Provider value={vrContextValue}>
      <div className="w-full h-full">
        {isXRSupported && (
          <div className="fixed top-5 right-5 z-50">
            <VRButton />
          </div>
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

              // Configure WebXR if needed
              if (isPresenting) {
                console.log("Setting up WebXR on canvas creation");
              }
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
    </VRButtonContext.Provider>
  );
}
