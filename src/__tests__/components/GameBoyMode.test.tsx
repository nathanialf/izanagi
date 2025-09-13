import React from 'react';
import { render } from '@testing-library/react';
import * as THREE from 'three';
import { applyTexturesToMaterial } from '../../components/TextureLoader';

// Mock Three.js
jest.mock('three', () => {
  const mockColor = jest.fn().mockImplementation((color) => ({
    r: 0,
    g: 0,
    b: 0,
    setHex: jest.fn(),
    getHex: jest.fn(() => color || 0xffffff),
    getHexString: jest.fn(() => (color || 0xffffff).toString(16))
  }));

  // Create a mock class that will pass instanceof checks
  class MockMeshStandardMaterial {
    type = 'MeshStandardMaterial';
    transparent = false;
    opacity = 1.0;
    emissive = { r: 0, g: 0, b: 0 };
    emissiveIntensity = 0;
    side = 'BackSide';
    depthTest = true;
    depthWrite = true;
    color = { r: 1, g: 1, b: 1 };
    map = null;
    metalness = 0.0;
    roughness = 0.8;
    needsUpdate = false;
    
    clone = jest.fn(() => new MockMeshStandardMaterial());
    
    constructor() {
      this.clone.mockReturnValue({
        ...this,
        needsUpdate: true,
        color: { r: 1, g: 1, b: 1 }
      });
    }
  }

  return {
    ...jest.requireActual('three'),
    Color: mockColor,
    MeshStandardMaterial: MockMeshStandardMaterial,
    BackSide: 'BackSide'
  };
});

describe('Game Boy Mode', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should clone material for Game Boy mode to avoid shared material issues', () => {
    const material = new THREE.MeshStandardMaterial();
    
    const result = applyTexturesToMaterial(
      material, 
      {}, 
      false, // ghostMode
      'TestMaterial', 
      'Mesh_0005rip', 
      true // gameBoyMode
    );

    expect(material.clone).toHaveBeenCalled();
    expect(result).not.toBe(material); // Should return a different instance
  });

  it('should apply darkest green to meshes 0-5', () => {
    const material = new THREE.MeshStandardMaterial();
    
    applyTexturesToMaterial(
      material, 
      {}, 
      false, 
      'TestMaterial', 
      'Mesh_0003rip', // Mesh number 3 should get darkest green
      true
    );

    // Verify darkest green color was applied (0x0f380f)
    expect(THREE.Color).toHaveBeenCalledWith(0x0f380f);
  });

  it('should apply dark green to meshes 6-10', () => {
    const material = new THREE.MeshStandardMaterial();
    
    applyTexturesToMaterial(
      material, 
      {}, 
      false, 
      'TestMaterial', 
      'Mesh_0008rip', // Mesh number 8 should get dark green
      true
    );

    // Verify dark green color was applied (0x306230)
    expect(THREE.Color).toHaveBeenCalledWith(0x306230);
  });

  it('should apply light green to meshes 11-15', () => {
    const material = new THREE.MeshStandardMaterial();
    
    applyTexturesToMaterial(
      material, 
      {}, 
      false, 
      'TestMaterial', 
      'Mesh_0013rip', // Mesh number 13 should get light green
      true
    );

    // Verify light green color was applied (0x8bac0f)
    expect(THREE.Color).toHaveBeenCalledWith(0x8bac0f);
  });

  it('should apply lightest green to meshes 16-20', () => {
    const material = new THREE.MeshStandardMaterial();
    
    applyTexturesToMaterial(
      material, 
      {}, 
      false, 
      'TestMaterial', 
      'Mesh_0018rip', // Mesh number 18 should get lightest green
      true
    );

    // Verify lightest green color was applied (0x9bbc0f)
    expect(THREE.Color).toHaveBeenCalledWith(0x9bbc0f);
  });

  it('should set correct material properties for Game Boy mode', () => {
    const material = new THREE.MeshStandardMaterial();
    
    const result = applyTexturesToMaterial(
      material, 
      {}, 
      false, 
      'TestMaterial', 
      'Mesh_0005rip', 
      true
    );

    // Verify Game Boy mode material properties
    expect(result.transparent).toBe(false);
    expect(result.opacity).toBe(1.0);
    expect(result.metalness).toBe(0.0);
    expect(result.roughness).toBe(0.8);
    expect(result.map).toBe(null); // Textures should be removed
    expect(result.needsUpdate).toBe(true);
  });

  it('should handle edge cases for mesh number parsing', () => {
    const material = new THREE.MeshStandardMaterial();
    
    // Test with mesh name that doesn't match pattern
    applyTexturesToMaterial(
      material, 
      {}, 
      false, 
      'TestMaterial', 
      'InvalidMeshName', 
      true
    );

    // Should default to mesh number 0, which gets darkest green
    expect(THREE.Color).toHaveBeenCalledWith(0x0f380f);
  });

  it('should not apply Game Boy colors when gameBoyMode is false', () => {
    const material = new THREE.MeshStandardMaterial();
    
    const result = applyTexturesToMaterial(
      material, 
      {}, 
      false, 
      'TestMaterial', 
      'Mesh_0005rip', 
      false // gameBoyMode disabled
    );

    // Should not clone material or apply Game Boy colors
    expect(material.clone).not.toHaveBeenCalled();
    expect(result).toBe(material); // Should return same instance
  });

  it('should prioritize ghost mode over Game Boy mode', () => {
    const material = new THREE.MeshStandardMaterial();
    
    const result = applyTexturesToMaterial(
      material, 
      {}, 
      true, // ghostMode enabled
      'TestMaterial', 
      'Mesh_0005rip', 
      true // gameBoyMode also enabled
    );

    // Ghost mode should take precedence
    expect(material.transparent).toBe(true);
    expect(material.opacity).toBe(0.3);
    expect(material.clone).not.toHaveBeenCalled(); // Should not clone for Game Boy mode
    expect(result).toBe(material);
  });

  it('should handle all mesh number ranges correctly', () => {
    const material = new THREE.MeshStandardMaterial();
    const testCases = [
      { meshName: 'Mesh_0000rip', expectedColor: 0x0f380f }, // Darkest green
      { meshName: 'Mesh_0005rip', expectedColor: 0x0f380f }, // Darkest green
      { meshName: 'Mesh_0006rip', expectedColor: 0x306230 }, // Dark green
      { meshName: 'Mesh_0010rip', expectedColor: 0x306230 }, // Dark green
      { meshName: 'Mesh_0011rip', expectedColor: 0x8bac0f }, // Light green
      { meshName: 'Mesh_0015rip', expectedColor: 0x8bac0f }, // Light green
      { meshName: 'Mesh_0016rip', expectedColor: 0x9bbc0f }, // Lightest green
      { meshName: 'Mesh_0020rip', expectedColor: 0x9bbc0f }, // Lightest green
      { meshName: 'Mesh_0025rip', expectedColor: 0x9bbc0f }, // Beyond range, lightest green
    ];

    testCases.forEach(({ meshName, expectedColor }) => {
      applyTexturesToMaterial(material, {}, false, 'TestMaterial', meshName, true);
      
      expect(THREE.Color).toHaveBeenCalledWith(expectedColor);
    });
  });
});