"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Suspense, useState } from "react";
import ModelLoader from "./ModelLoader";
import { ErrorBoundary, ErrorFallback } from "./ErrorBoundary";
import ControlPanel from "./ControlPanel";
import { DDSTest } from "./DDSTest";
import PixelatedEffect from "./PixelatedEffect";

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
  const [pixelatedMode, setPixelatedMode] = useState(false);

  const handleShowMaterialChange = (newShowMaterial: boolean) => {
    setShowMaterial(newShowMaterial);
  };

  const handlePixelatedModeChange = (newPixelatedMode: boolean) => {
    setPixelatedMode(newPixelatedMode);
  };

  return (
    <div className="w-full h-full">
      <ControlPanel 
        onShowMaterialChange={handleShowMaterialChange}
        onPixelatedModeChange={handlePixelatedModeChange}
      />
      <Canvas
        camera={{
          position: [0, 2, 3],
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

        <PixelatedEffect enabled={pixelatedMode} pixelSize={4} />
        
        <OrbitControls
          enablePan={true}
          enableZoom={false}
          enableRotate={true}
          target={[0, 0, 0]}
        />
      </Canvas>
    </div>
  );
}