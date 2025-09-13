"use client";

import { useMemo, useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

interface PixelatedEffectProps {
  enabled?: boolean;
  pixelSize?: number; // Resolution divider - higher = more pixelated (fewer pixels)
}

export default function PixelatedEffect({ 
  enabled = false, 
  pixelSize = 8 
}: PixelatedEffectProps) {
  const { gl, size } = useThree();
  const lowResTargetRef = useRef<THREE.WebGLRenderTarget | null>(null);
  const originalRenderRef = useRef<typeof gl.render | null>(null);
  const pixelMaterialRef = useRef<THREE.ShaderMaterial | null>(null);
  const quadMeshRef = useRef<THREE.Mesh | null>(null);
  const orthoCameraRef = useRef<THREE.OrthographicCamera | null>(null);

  // Create low-resolution render target and upscaling material
  useEffect(() => {
    // Dispose previous render target
    if (lowResTargetRef.current) {
      lowResTargetRef.current.dispose();
    }

    // Create VERY low resolution render target - this is the sprite resolution!
    const lowResWidth = Math.max(1, Math.floor(size.width / pixelSize));
    const lowResHeight = Math.max(1, Math.floor(size.height / pixelSize));
    
    
    lowResTargetRef.current = new THREE.WebGLRenderTarget(lowResWidth, lowResHeight, {
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      format: THREE.RGBAFormat,
      generateMipmaps: false, // Disable mipmaps to prevent any smoothing
      type: THREE.UnsignedByteType, // Force 8-bit color to reduce precision
    });

    // Create simple upscaling material
    pixelMaterialRef.current = new THREE.ShaderMaterial({
      uniforms: {
        tDiffuse: { value: lowResTargetRef.current.texture },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D tDiffuse;
        varying vec2 vUv;

        void main() {
          // Simple nearest neighbor sampling with brightness boost
          vec4 color = texture2D(tDiffuse, vUv);
          // Make the pixelated model brighter
          color.rgb *= 1.5;
          gl_FragColor = color;
        }
      `,
    });

    // Create full-screen quad for upscaling
    const geometry = new THREE.PlaneGeometry(2, 2);
    quadMeshRef.current = new THREE.Mesh(geometry, pixelMaterialRef.current);

    // Create orthographic camera
    orthoCameraRef.current = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    return () => {
      if (lowResTargetRef.current) {
        lowResTargetRef.current.dispose();
      }
      geometry.dispose();
      if (pixelMaterialRef.current) {
        pixelMaterialRef.current.dispose();
      }
    };
  }, [size.width, size.height, pixelSize]);

  // Override renderer when enabled
  useEffect(() => {
    if (!enabled || !lowResTargetRef.current || !pixelMaterialRef.current || !quadMeshRef.current || !orthoCameraRef.current) {
      // Restore original render function if disabled
      if (originalRenderRef.current) {
        gl.render = originalRenderRef.current;
        originalRenderRef.current = null;
      }
      gl.domElement.style.imageRendering = 'auto';
      return;
    }

    // Store original render function
    if (!originalRenderRef.current) {
      originalRenderRef.current = gl.render.bind(gl);
    }

    // Apply CSS for crisp pixel scaling
    gl.domElement.style.imageRendering = 'pixelated';
    gl.domElement.style.imageRendering = '-moz-crisp-edges';
    gl.domElement.style.imageRendering = '-webkit-crisp-edges';

    const lowResWidth = Math.max(1, Math.floor(size.width / pixelSize));
    const lowResHeight = Math.max(1, Math.floor(size.height / pixelSize));

    // Override the render function
    gl.render = (scene: THREE.Scene, camera: THREE.Camera) => {
      // Step 1: Render scene at very low resolution (this is our "sprite")
      const originalTarget = gl.getRenderTarget();
      const originalViewport = gl.getViewport(new THREE.Vector4());
      
      originalRenderRef.current!(scene, camera);     
 
      gl.setRenderTarget(lowResTargetRef.current);
      gl.setViewport(0, 0, lowResWidth, lowResHeight);
      
      // Render scene normally with the provided camera
      originalRenderRef.current!(scene, camera);
      
      // Step 2: Scale the low-res result up to full screen (sprite scaling)
      gl.setRenderTarget(originalTarget);
      gl.setViewport(originalViewport);
      gl.clear();
      
      // Render the upscaled quad
      const quadScene = new THREE.Scene();
      quadScene.add(quadMeshRef.current!);
      originalRenderRef.current!(quadScene, orthoCameraRef.current!);
    };

    return () => {
      // Restore original render function
      if (originalRenderRef.current) {
        gl.render = originalRenderRef.current;
        originalRenderRef.current = null;
      }
      gl.domElement.style.imageRendering = 'auto';
    };
  }, [enabled, pixelSize, gl, size.width, size.height]);

  return null;
}
