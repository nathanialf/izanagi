"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Suspense, useState } from "react";
import ModelLoader from "./ModelLoader";
import { ErrorBoundary, ErrorFallback } from "./ErrorBoundary";
import ControlPanel from "./ControlPanel";
import { DDSTest } from "./DDSTest";

function Lights() {
  return (
    <>
      {/* Lower ambient for more dramatic shadows */}
      <ambientLight intensity={0.2} />
      
      {/* Main directional light from front-right */}
      <directionalLight
        position={[3, 4, 5]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      
      {/* Fill light from left to show details */}
      <directionalLight
        position={[-3, 2, 2]}
        intensity={0.4}
        color="#ffffff"
      />
      
      {/* Rim light from behind for metallic highlights */}
      <directionalLight
        position={[0, 2, -5]}
        intensity={0.3}
        color="#ccddff"
      />
    </>
  );
}

export default function Scene3D() {
  const [showMaterial, setShowMaterial] = useState(true);

  const handleShowMaterialChange = (newShowMaterial: boolean) => {
    console.log(`[SCENE DEBUG] Show material changed from ${showMaterial} to ${newShowMaterial}`);
    setShowMaterial(newShowMaterial);
  };

  console.log(`[SCENE DEBUG] Current show material state: ${showMaterial}`);

  return (
    <div className="w-full h-full">
      <ControlPanel onShowMaterialChange={handleShowMaterialChange} />
      <Canvas
        camera={{
          position: [0, 2, 5],
          fov: 50,
          near: 0.1,
          far: 1000,
        }}
        shadows
        gl={{
          antialias: true,
          alpha: false,
        }}
      >
        <color attach="background" args={["#0a0a0a"]} />
        <fog attach="fog" args={["#0a0a0a", 10, 50]} />
        
        <Lights />
        
        <ErrorBoundary fallback={ErrorFallback}>
          <Suspense fallback={null}>
            <ModelLoader modelPath="/models/izanagis-burden.fbx" showMaterial={showMaterial} />
          </Suspense>
        </ErrorBoundary>
        
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={2}
          maxDistance={20}
          target={[0, 0, 0]}
        />
      </Canvas>
    </div>
  );
}