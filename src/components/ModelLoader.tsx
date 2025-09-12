"use client";

import { useLoader } from "@react-three/fiber";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { useEffect, useState } from "react";
import { Box } from "@react-three/drei";
import { Mesh } from "three";
import { useDDSTextures, applyTexturesToMaterial } from "./TextureLoader";
import { useSimpleTextures, applySimpleTexturesToMaterial } from "./SimpleTextureLoader";

interface ModelLoaderProps {
  modelPath?: string;
  showMaterial?: boolean;
}

function FBXModel({ modelPath, showMaterial = true }: { modelPath: string; showMaterial?: boolean }) {
  const fbx = useLoader(FBXLoader, modelPath);
  
  // Load actual DDS textures
  const textures = useDDSTextures([
    "/models/textures/IzanagisBurdenAmmo_Diffuse.dds",
    "/models/textures/IzanagisBurdenDetails_Diffuse.dds",
    "/models/textures/IzanagisBurdenReciever_Diffuse.dds",
    "/models/textures/IzanagisBurdenReciever_Gstack.dds",
    "/models/textures/IzanagisBurdenReciever_Normal.dds",
    "/models/textures/IzanagisBurdenReticleNumbers_Diffuse.dds",
    "/models/textures/IzanagisBurdenReticle_Diffuse.dds",
    "/models/textures/IzanagisBurdenReticle_Gstack.dds",
    "/models/textures/IzanagisBurdenReticle_Normal.dds",
    "/models/textures/IzanagisBurdenScope_Diffuse.dds",
    "/models/textures/IzanagisBurdenScope_Gstack.dds",
    "/models/textures/IzanagisBurdenScope_Normal.dds",
  ]);
  
  // Keep simple textures as fallback
  const simpleTextures = useSimpleTextures();
  
  useEffect(() => {
    if (fbx) {
      console.log("FBX Model loaded successfully:", fbx);
      console.log("=== TEXTURE DEBUG REPORT ===");
      console.log("DDS textures loaded:", Object.keys(textures).length > 0 ? Object.keys(textures) : "NONE - DDS loading failed");
      console.log("Simple textures loaded:", Object.keys(simpleTextures).length > 0 ? Object.keys(simpleTextures) : "NONE");
      
      if (Object.keys(textures).length === 0) {
        console.log("⚠️ WARNING: No DDS textures loaded! Check browser network tab for 404s or loading errors");
      }
      
      // Scale and position the model (only do this once)
      if (fbx.scale.x === 1) { // Check if not already scaled
        fbx.scale.setScalar(0.01);
        fbx.position.set(0, 0, 0);
      }
      
      // Apply materials every time textures or showMaterial changes
      const ghostMode = !showMaterial; // Convert showMaterial to ghostMode for legacy functions
      
      fbx.traverse((child) => {
        if (child instanceof Mesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          
          // Fix geometry normals if they're incorrect
          if (child.geometry) {
            child.geometry.computeVertexNormals();
          }
          
          // Apply textures to materials
          if (child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach((mat, index) => {
                const materialName = mat.name || `material_${index}`;
                const meshName = child.name || 'unnamed_mesh';
                
                // Use DDS textures if available, fallback to simple textures
                if (Object.keys(textures).length > 0) {
                  applyTexturesToMaterial(mat, textures, ghostMode, materialName, meshName);
                } else {
                  applySimpleTexturesToMaterial(mat, simpleTextures, ghostMode);
                }
              });
            } else {
              const materialName = child.material.name || 'unnamed_material';
              const meshName = child.name || 'unnamed_mesh';
              
              // Use DDS textures if available, fallback to simple textures
              if (Object.keys(textures).length > 0) {
                applyTexturesToMaterial(child.material, textures, ghostMode, materialName, meshName);
              } else {
                applySimpleTexturesToMaterial(child.material, simpleTextures, ghostMode);
              }
            }
          }
        }
      });
    }
  }, [fbx, textures, simpleTextures, showMaterial]);

  return <primitive object={fbx} />;
}

function PlaceholderWeapon() {
  return (
    <group>
      {/* Weapon handle */}
      <Box args={[0.2, 1.5, 0.2]} position={[0, -0.5, 0]}>
        <meshStandardMaterial color="#654321" />
      </Box>
      
      {/* Weapon blade */}
      <Box args={[0.05, 2, 0.3]} position={[0, 1, 0]}>
        <meshStandardMaterial color="#C0C0C0" metalness={0.8} roughness={0.2} />
      </Box>
      
      {/* Crossguard */}
      <Box args={[0.8, 0.1, 0.1]} position={[0, 0.2, 0]}>
        <meshStandardMaterial color="#8B4513" />
      </Box>
    </group>
  );
}

export default function ModelLoader({ modelPath, showMaterial = true }: ModelLoaderProps) {
  const [modelExists, setModelExists] = useState(false);

  useEffect(() => {
    if (modelPath) {
      // Check if model file exists
      fetch(modelPath)
        .then((response) => {
          setModelExists(response.ok);
        })
        .catch(() => {
          setModelExists(false);
        });
    }
  }, [modelPath]);

  if (modelPath && modelExists) {
    return <FBXModel modelPath={modelPath} showMaterial={showMaterial} />;
  }

  return <PlaceholderWeapon />;
}