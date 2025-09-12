"use client";

import { useLoader } from "@react-three/fiber";
import { DDSLoader } from "three/examples/jsm/loaders/DDSLoader.js";
import { TextureLoader } from "three";
import * as THREE from "three";
import { useEffect, useState } from "react";

interface TextureMap {
  [key: string]: THREE.Texture;
}

export function useDDSTextures(texturePaths: string[]): TextureMap {
  const [textures, setTextures] = useState<TextureMap>({});
  
  useEffect(() => {
    const loadTextures = async () => {
      const ddsLoader = new DDSLoader();
      const textureLoader = new TextureLoader();
      const loadedTextures: TextureMap = {};
      
      for (const path of texturePaths) {
        try {
          let texture: THREE.Texture;
          
          if (path.endsWith('.dds')) {
            texture = await new Promise<THREE.Texture>((resolve, reject) => {
              ddsLoader.load(path, resolve, undefined, reject);
            });
          } else {
            texture = await new Promise<THREE.Texture>((resolve, reject) => {
              textureLoader.load(path, resolve, undefined, reject);
            });
          }
          
          const fileName = path.split('/').pop()?.replace(/\.(dds|jpg|png|jpeg)$/, '') || path;
          loadedTextures[fileName] = texture;
          
        } catch (error) {
          console.warn(`Failed to load texture: ${path}`, error);
        }
      }
      setTextures(loadedTextures);
    };
    
    loadTextures();
  }, [texturePaths]);
  
  return textures;
}

// Smart texture mapping based on material/mesh names
function findBestTextureForMaterial(materialName: string, meshName: string, textures: TextureMap): THREE.Texture | null {
  const searchName = (materialName + ' ' + meshName).toLowerCase();
  
  // Priority order for texture matching
  const searchPatterns = [
    // Exact matches first
    { pattern: 'receiver', textureKey: 'IzanagisBurdenReciever_Diffuse' },
    { pattern: 'scope', textureKey: 'IzanagisBurdenScope_Diffuse' },
    { pattern: 'ammo', textureKey: 'IzanagisBurdenAmmo_Diffuse' },
    { pattern: 'reticle', textureKey: 'IzanagisBurdenReticle_Diffuse' },
    { pattern: 'details', textureKey: 'IzanagisBurdenDetails_Diffuse' },
    { pattern: 'retriclenumbers', textureKey: 'IzanagisBurdenReticleNumbers_Diffuse' },
    
    // Fallback to any diffuse texture
    { pattern: '', textureKey: 'IzanagisBurdenReciever_Diffuse' }, // Default to receiver
  ];
  
  for (const { pattern, textureKey } of searchPatterns) {
    if (pattern === '' || searchName.includes(pattern)) {
      const texture = textures[textureKey];
      if (texture) {
        return texture;
      }
    }
  }
  
  // Last resort: use any available diffuse texture
  const diffuseTextures = Object.entries(textures).filter(([key]) => key.toLowerCase().includes('diffuse'));
  if (diffuseTextures.length > 0) {
    return diffuseTextures[0][1];
  }
  
  return null;
}

export function applyTexturesToMaterial(material: THREE.Material, textures: TextureMap, ghostMode: boolean = false, materialName: string = '', meshName: string = '') {
  
  if (!(material instanceof THREE.MeshStandardMaterial || material instanceof THREE.MeshPhysicalMaterial || material instanceof THREE.MeshPhongMaterial)) {
    console.warn(`Unsupported material type: ${material.type}`);
    return;
  }

  if (ghostMode) {
    // Ghost mode: make translucent with emission
    material.transparent = true;
    material.opacity = 0.3;
    material.emissive = new THREE.Color(0x004466);
    material.emissiveIntensity = 0.5;
    material.needsUpdate = true;
    return;
  }

  // SOLID MODE - Force non-transparent and proper rendering
  material.transparent = false;
  material.opacity = 1.0;
  material.emissive = new THREE.Color(0x000000);
  material.emissiveIntensity = 0;
  material.side = THREE.BackSide; // Render back sides of faces
  material.depthTest = true;
  material.depthWrite = true;
    
  // Apply textures and set material properties
  const bestTexture = findBestTextureForMaterial(materialName, meshName, textures);
  
  if (bestTexture) {
    material.map = bestTexture;
    // Configure texture settings
    bestTexture.wrapS = THREE.RepeatWrapping;
    bestTexture.wrapT = THREE.RepeatWrapping;
    bestTexture.flipY = false;
  }
  
  // Set material properties for Izanagi's Burden appearance
  if (material instanceof THREE.MeshStandardMaterial || material instanceof THREE.MeshPhysicalMaterial) {
    material.metalness = 0.9;
    material.roughness = 0.4;
    material.color = new THREE.Color(1, 1, 1);
  } else if (material instanceof THREE.MeshPhongMaterial) {
    material.shininess = 80;
    material.specular = new THREE.Color(0x888888);
    material.color = new THREE.Color(1, 1, 1);
  }
  
  material.needsUpdate = true;
}