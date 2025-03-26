import { Canvas } from "@react-three/fiber";
import { useState, useEffect, createContext, useContext, useRef } from "react";
import { KeyboardControls, Environment as DreiEnvironment, Sky } from "@react-three/drei";
import * as THREE from "three";
import { useVRMode } from "@/lib/stores/useVRMode";
import { useAudioControl } from "@/lib/stores/useAudioControl";
import { useIsMobile } from "@/hooks/use-is-mobile";
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
  enterMobileVR: () => void;
  isMobileVR: boolean;
}>({
  enterVR: () => {},
  exitVR: () => {},
  isPresenting: false,
  enterMobileVR: () => {},
  isMobileVR: false
});

// Custom VR Button Component
function VRButton() {
  const { isPresenting, enterVR, enterMobileVR, isMobileVR } = useContext(VRButtonContext);
  const isMobile = useIsMobile();
  
  const buttonClasses = "px-4 py-2 rounded-lg font-medium transition-colors";
  
  if (isMobile) {
    return (
      <div className="flex flex-col gap-2">
        <button
          onClick={enterMobileVR}
          className={`${buttonClasses} ${isMobileVR 
            ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" 
            : "bg-primary text-primary-foreground hover:bg-primary/90"}`}
        >
          {isMobileVR ? "Exit Mobile VR" : "Enter Mobile VR"}
        </button>
        <p className="text-xs text-white bg-black/50 p-1 rounded text-center">
          Place your phone in a VR headset after entering mobile VR mode
        </p>
      </div>
    );
  }
  
  return (
    <button
      onClick={enterVR}
      className={`${buttonClasses} bg-primary text-primary-foreground hover:bg-primary/90`}
      disabled={isPresenting}
    >
      Enter VR
    </button>
  );
}

// Environment presets for different event types
const getEnvironmentPreset = (type: string) => {
  switch (type.toLowerCase()) {
    case 'stadium':
      return { preset: 'sunset', ground: 'grass' };
    case 'theater':
      return { preset: 'night', ground: 'reflective' };
    case 'gallery':
      return { preset: 'dawn', ground: 'marble' };
    case 'club':
      return { preset: 'warehouse', ground: 'asphalt' };
    case 'arena':
      return { preset: 'city', ground: 'concrete' };
    default:
      return { preset: 'park', ground: 'grass' };
  }
};

export default function VRScene({ environment, eventId, children }: VRSceneProps) {
  const [isXRSupported, setIsXRSupported] = useState(false);
  const [isPresenting, setIsPresenting] = useState(false);
  const [isMobileVR, setIsMobileVR] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const { 
    setVRSupported, 
    cameraHeight, 
    renderQuality, 
    setVRSession, 
    setMode,
    mode
  } = useVRMode();
  
  const { initAudioContext, updateListenerPosition } = useAudioControl();
  const isMobile = useIsMobile();
  
  // Get environment settings based on type
  const envSettings = getEnvironmentPreset(environment);
  
  // Handle entering VR (for VR headsets)
  const enterVR = async () => {
    try {
      if (window.navigator.xr) {
        const session = await window.navigator.xr.requestSession('immersive-vr', {
          optionalFeatures: ['local-floor', 'bounded-floor', 'hand-tracking']
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
  
  // Handle exiting VR
  const exitVR = async () => {
    // This function would be called when exiting VR
    // The session's 'end' event will handle cleanup
  };
  
  // Handle mobile VR mode (stereoscopic view for phone-based headsets like Cardboard)
  const enterMobileVR = () => {
    if (isMobileVR) {
      setIsMobileVR(false);
      document.documentElement.classList.remove('vr-mode');
      
      // Exit fullscreen if in fullscreen mode
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(err => {
          console.error("Error exiting fullscreen:", err);
        });
      }
      
      setMode('desktop');
    } else {
      setIsMobileVR(true);
      document.documentElement.classList.add('vr-mode');
      
      // Request fullscreen for better immersion
      if (canvasRef.current && canvasRef.current.parentElement) {
        canvasRef.current.parentElement.requestFullscreen().catch(err => {
          console.error("Error requesting fullscreen:", err);
        });
      }
      
      // Handle screen orientation
      if (screen.orientation && screen.orientation.lock) {
        screen.orientation.lock('landscape').catch(err => {
          console.warn("Unable to lock screen orientation:", err);
        });
      }
      
      setMode('vr');
    }
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
    
    // Clean up VR mode on component unmount
    return () => {
      document.documentElement.classList.remove('vr-mode');
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(err => {
          console.error("Error exiting fullscreen:", err);
        });
      }
    };
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
      case "low": return Math.min(1, window.devicePixelRatio);
      case "medium": return Math.min(1.5, window.devicePixelRatio);
      case "high": return window.devicePixelRatio;
      default: return 1;
    }
  };

  // VR context value
  const vrContextValue = {
    enterVR,
    exitVR,
    isPresenting,
    enterMobileVR,
    isMobileVR
  };

  return (
    <VRButtonContext.Provider value={vrContextValue}>
      <div className={`w-full h-full ${isMobileVR ? 'vr-mode' : ''}`}>
        <div className="fixed top-5 right-5 z-50">
          <VRButton />
        </div>
        
        <KeyboardControls map={keyMap}>
          <Canvas
            ref={canvasRef}
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
            onCreated={({ gl, camera }) => {
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

              // For mobile VR, we'll set up a stereoscopic effect
              if (isMobileVR) {
                gl.xr.enabled = true;
                gl.xr.setReferenceSpaceType('local');
              }

              if (isPresenting) {
                console.log("Setting up WebXR on canvas creation");
                gl.xr.enabled = true;
              }
            }}
          >
            {/* Movement Controls */}
            <VRControls />
            
            {/* Environment lighting and background */}
            <ambientLight intensity={0.8} />
            <directionalLight 
              position={[10, 10, 5]} 
              intensity={1} 
              castShadow 
              shadow-mapSize={[2048, 2048]} 
            />
            
            {/* Sky based on environment type */}
            {environment !== 'gallery' && environment !== 'theater' && (
              <Sky 
                distance={450000} 
                sunPosition={[0, 1, 0]} 
                inclination={0.49} 
                azimuth={0.25} 
              />
            )}
            
            {/* Environment preset */}
            <DreiEnvironment preset={envSettings.preset as any} />
            
            {/* Custom environment based on event type */}
            <Environment type={environment} eventId={eventId} />
            
            {/* Render any additional children */}
            {children}
          </Canvas>
        </KeyboardControls>
      </div>
    </VRButtonContext.Provider>
  );
}
