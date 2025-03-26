import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useKeyboardControls } from "@react-three/drei";
import * as THREE from "three";
import { useVRMode } from "@/lib/stores/useVRMode";
import { useAudioControl } from "@/lib/stores/useAudioControl";

// Define controls enum to match our keyboard controls
enum Controls {
  forward = 'forward',
  back = 'back',
  left = 'left',
  right = 'right',
  jump = 'jump',
}

export default function VRControls() {
  // Access the camera
  const { camera } = useThree();
  
  // Get movement speed and VR mode from settings
  const { movementSpeed, mode: vrMode, vrSession } = useVRMode();
  
  // Audio listener position updater
  const { updateListenerPosition } = useAudioControl();
  
  // Direction vector for movement
  const movement = useRef(new THREE.Vector3());
  
  // Rotation for desktop mode
  const rotation = useRef({ x: 0, y: 0 });
  
  // Position tracking for collision detection
  const currentPosition = useRef(new THREE.Vector3());
  
  // Get keyboard controls state without causing rerenders
  const [, getKeyboardState] = useKeyboardControls<Controls>();
  
  // Handle control inputs and move camera
  useFrame((state, delta) => {
    // Store current position
    currentPosition.current.copy(camera.position);
    
    // Reset movement vector
    movement.current.set(0, 0, 0);
    
    // Different control handling based on mode
    if (vrMode === 'vr' && vrSession) {
      // VR mode uses controllers
      handleVRControls(delta);
    } else {
      // Desktop mode uses keyboard
      handleKeyboardControls(delta);
    }
    
    // Move character based on inputs
    if (movement.current.lengthSq() > 0) {
      movement.current.normalize().multiplyScalar(movementSpeed * delta);
      camera.position.add(movement.current);
    }
    
    // Apply simple bounds to prevent going out of the environment
    const bounds = 40; // Should match environment size
    camera.position.x = THREE.MathUtils.clamp(camera.position.x, -bounds, bounds);
    camera.position.z = THREE.MathUtils.clamp(camera.position.z, -bounds, bounds);
    
    // Ensure we maintain consistent height (no flying or sinking)
    // Only enforce for desktop mode; VR mode needs natural height
    if (vrMode === 'desktop') {
      camera.position.y = 1.6; // Consistent eye height for desktop mode
    }
    
    // Update audio listener position
    const cameraDirection = new THREE.Vector3();
    camera.getWorldDirection(cameraDirection);
    const cameraUp = new THREE.Vector3(0, 1, 0);
    
    updateListenerPosition(
      camera.position.toArray() as [number, number, number],
      cameraDirection.toArray() as [number, number, number],
      cameraUp.toArray() as [number, number, number]
    );
  });
  
  // Handle keyboard controls for desktop mode
  const handleKeyboardControls = (delta: number) => {
    const keyboardState = getKeyboardState();
    
    // Get camera direction to allow movement relative to camera direction
    const cameraDirection = new THREE.Vector3();
    camera.getWorldDirection(cameraDirection);
    cameraDirection.y = 0; // Keep movement on horizontal plane
    cameraDirection.normalize();
    
    // Calculate perpendicular direction for strafing
    const cameraSide = new THREE.Vector3().crossVectors(
      new THREE.Vector3(0, 1, 0),
      cameraDirection
    );
    
    // Forward/backward
    if (keyboardState.forward) {
      movement.current.add(cameraDirection);
    } else if (keyboardState.back) {
      movement.current.sub(cameraDirection);
    }
    
    // Left/right strafing
    if (keyboardState.left) {
      movement.current.add(cameraSide);
    } else if (keyboardState.right) {
      movement.current.sub(cameraSide);
    }
    
    // Mouse look handling would normally go here,
    // but that requires pointer lock controls which we're not implementing
    // for simplicity
  };
  
  // Handle VR controls using game pads
  const handleVRControls = (delta: number) => {
    // In our simplified implementation, we'll check for navigator.getGamepads() 
    // since we're not using the XR Controllers directly anymore
    if (navigator.getGamepads) {
      const gamepads = navigator.getGamepads();
      
      for (let i = 0; i < gamepads.length; i++) {
        const gamepad = gamepads[i];
        
        if (gamepad && gamepad.connected && gamepad.axes.length >= 2) {
          // Get thumbstick values
          const thumbstickX = gamepad.axes[0];
          const thumbstickY = gamepad.axes[1];
          
          // Only move if thumbstick is pushed enough (to prevent drift)
          if (Math.abs(thumbstickX) > 0.2 || Math.abs(thumbstickY) > 0.2) {
            // Calculate the direction of movement in world space
            const cameraDirection = new THREE.Vector3();
            camera.getWorldDirection(cameraDirection);
            cameraDirection.y = 0; // Keep movement on horizontal plane
            cameraDirection.normalize();
            
            // Get perpendicular direction for strafing
            const cameraSide = new THREE.Vector3().crossVectors(
              new THREE.Vector3(0, 1, 0),
              cameraDirection
            );
            
            // Forward/backward
            movement.current.add(cameraDirection.clone().multiplyScalar(-thumbstickY));
            
            // Left/right
            movement.current.add(cameraSide.clone().multiplyScalar(thumbstickX));
          }
        }
      }
    }
  };

  return null; // This is a behavior component, doesn't render anything
}
