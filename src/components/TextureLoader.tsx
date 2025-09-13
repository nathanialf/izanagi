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

export function applyTexturesToMaterial(material: THREE.Material, textures: TextureMap, ghostMode: boolean = false, materialName: string = '', meshName: string = '', gameBoyMode: boolean = false): THREE.Material {
  
  if (!(material instanceof THREE.MeshStandardMaterial || material instanceof THREE.MeshPhysicalMaterial || material instanceof THREE.MeshPhongMaterial)) {
    console.warn(`Unsupported material type: ${material.type}`);
    return material;
  }

  if (ghostMode) {
    // Ghost mode: make translucent with emission
    material.transparent = true;
    material.opacity = 0.3;
    material.emissive = new THREE.Color(0x004466);
    material.emissiveIntensity = 0.5;
    material.needsUpdate = true;
    return material;
  }

  if (gameBoyMode) {
    // Create a unique material clone for this mesh to avoid shared material issues
    const uniqueMaterial = material.clone();
    
    // Game Boy mode: apply green palette colors to the unique material
    uniqueMaterial.transparent = false;
    uniqueMaterial.opacity = 1.0;
    uniqueMaterial.emissive = new THREE.Color(0x000000);
    uniqueMaterial.emissiveIntensity = 0;
    uniqueMaterial.side = THREE.BackSide;
    uniqueMaterial.depthTest = true;
    uniqueMaterial.depthWrite = true;
    
    // Map different parts to Game Boy green shades (4-color palette)
    const searchName = (materialName + ' ' + meshName).toLowerCase();
    
    
    let gameBoyColor: THREE.Color;
    
    // Extract mesh number from mesh name (e.g., "Mesh_0008rip" -> 8)
    const meshMatch = meshName.match(/mesh_(\d+)/i);
    const meshNumber = meshMatch ? parseInt(meshMatch[1], 10) : 0;
    
    
    // Distribute the 21 meshes across 4 Game Boy colors
    // Meshes 0-5: Darkest green
    if (meshNumber >= 0 && meshNumber <= 5) {
      gameBoyColor = new THREE.Color(0x0f380f); // Darkest green
    }
    // Meshes 6-10: Dark green  
    else if (meshNumber >= 6 && meshNumber <= 10) {
      gameBoyColor = new THREE.Color(0x306230); // Dark green
    }
    // Meshes 11-15: Light green
    else if (meshNumber >= 11 && meshNumber <= 15) {
      gameBoyColor = new THREE.Color(0x8bac0f); // Light green
    }
    // Meshes 16-20: Lightest green
    else {
      gameBoyColor = new THREE.Color(0x9bbc0f); // Lightest green
    }
    
    uniqueMaterial.color = gameBoyColor;
    uniqueMaterial.map = null; // Remove textures to show solid colors
    
    // Set material properties for Game Boy look
    if (uniqueMaterial instanceof THREE.MeshStandardMaterial || uniqueMaterial instanceof THREE.MeshPhysicalMaterial) {
      uniqueMaterial.metalness = 0.0;
      uniqueMaterial.roughness = 0.8;
    } else if (uniqueMaterial instanceof THREE.MeshPhongMaterial) {
      uniqueMaterial.shininess = 10;
      uniqueMaterial.specular = new THREE.Color(0x111111);
    }
    
    uniqueMaterial.needsUpdate = true;
    return uniqueMaterial;
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
  return material;
}