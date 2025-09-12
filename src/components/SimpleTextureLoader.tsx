"use client";

import { useLoader } from "@react-three/fiber";
import { TextureLoader } from "three";
import * as THREE from "three";
import { useEffect, useState } from "react";

interface SimpleTextureMap {
  [key: string]: THREE.Texture;
}

// For now, let's create a simple colored texture instead of loading DDS
function createColoredTexture(color: string): THREE.Texture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 512, 512);
  }
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

export function useSimpleTextures(): SimpleTextureMap {
  const [textures, setTextures] = useState<SimpleTextureMap>({});
  
  useEffect(() => {
    const testTextures: SimpleTextureMap = {
      'IzanagisBurdenReciever_Diffuse': createColoredTexture('#8B4513'), // Brown
      'IzanagisBurdenScope_Diffuse': createColoredTexture('#2F4F4F'), // Dark slate gray
      'IzanagisBurdenAmmo_Diffuse': createColoredTexture('#FF6347'), // Tomato red
    };
    
    setTextures(testTextures);
  }, []);
  
  return textures;
}

export function applySimpleTexturesToMaterial(material: THREE.Material, textures: SimpleTextureMap, ghostMode: boolean = false) {
  if (material instanceof THREE.MeshStandardMaterial || material instanceof THREE.MeshPhysicalMaterial || material instanceof THREE.MeshPhongMaterial) {
    
    if (ghostMode) {
      // Ghost mode: make translucent with emission
      material.transparent = true;
      material.opacity = 0.3;
      material.emissive = new THREE.Color(0x004466);
      material.emissiveIntensity = 0.5;
      material.color = new THREE.Color(0xffffff); // Reset color to white
      material.map = null; // Remove texture
      material.needsUpdate = true;
      return;
    }
    
    // Reset ghost mode properties
    material.transparent = false;
    material.opacity = 1.0;
    material.emissive = new THREE.Color(0x000000);
    material.emissiveIntensity = 0;
    
    // Force a bright, visible color first
    material.color = new THREE.Color(0xFF6347); // Bright tomato red - very visible
    material.map = null; // Remove any existing texture first
    
    // Apply simple colored textures
    if (Object.keys(textures).length > 0) {
      // Use the first available texture as diffuse
      const firstTexture = Object.values(textures)[0];
      if (firstTexture) {
        material.map = firstTexture;
        material.color = new THREE.Color(0xffffff); // White to show texture properly
      }
    }
    
    // Set material properties for visibility (only for PBR materials)
    if (material instanceof THREE.MeshStandardMaterial || material instanceof THREE.MeshPhysicalMaterial) {
      material.metalness = 0.1; // Lower metalness for better visibility
      material.roughness = 0.8; // Higher roughness for better visibility
    } else if (material instanceof THREE.MeshPhongMaterial) {
      // Phong materials use different properties
      material.shininess = 30; // Lower shininess for better visibility
      material.specular = new THREE.Color(0x222222); // Low specular
    }
    material.needsUpdate = true;
  } else {
    console.warn(`Unsupported material type: ${material.type}`);
  }
}