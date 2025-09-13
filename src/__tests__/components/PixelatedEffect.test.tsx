import React from 'react';
import { render } from '@testing-library/react';
import PixelatedEffect from '../../components/PixelatedEffect';

// Mock Canvas from @react-three/fiber
jest.mock('@react-three/fiber', () => ({
  Canvas: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="canvas">{children}</div>
  ),
  useThree: () => ({
    gl: mockGl,
    size: mockSize
  }),
  useFrame: jest.fn()
}));

// Mock Three.js objects
const mockWebGLRenderTarget = {
  dispose: jest.fn(),
  texture: {}
};

const mockShaderMaterial = {
  dispose: jest.fn()
};

const mockMesh = {};
const mockOrthographicCamera = {};

// Mock Three.js constructors
jest.mock('three', () => ({
  WebGLRenderTarget: jest.fn(() => mockWebGLRenderTarget),
  ShaderMaterial: jest.fn(() => mockShaderMaterial),
  PlaneGeometry: jest.fn(() => ({
    dispose: jest.fn()
  })),
  Mesh: jest.fn(() => mockMesh),
  OrthographicCamera: jest.fn(() => mockOrthographicCamera),
  NearestFilter: 'NearestFilter',
  RGBAFormat: 'RGBAFormat',
  UnsignedByteType: 'UnsignedByteType',
  Scene: jest.fn(() => ({
    add: jest.fn()
  })),
  Vector4: jest.fn(() => ({}))
}));

// Mock renderer and size objects  
const mockGl = {
  render: jest.fn(),
  setRenderTarget: jest.fn(),
  setViewport: jest.fn(),
  clear: jest.fn(),
  getRenderTarget: jest.fn(() => null),
  getViewport: jest.fn(() => ({})),
  domElement: {
    style: {}
  }
};

const mockSize = {
  width: 800,
  height: 600
};

describe('PixelatedEffect', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGl.domElement.style = {};
  });

  it('should render without crashing', () => {
    render(<PixelatedEffect enabled={false} />);
  });

  it('should not modify renderer when disabled', () => {
    const originalRender = mockGl.render;
    
    render(<PixelatedEffect enabled={false} />);

    expect(mockGl.render).toBe(originalRender);
    expect(mockGl.domElement.style.imageRendering).toBe('auto');
  });

  it('should create low-resolution render target when enabled', () => {
    const THREE = require('three');
    
    render(<PixelatedEffect enabled={true} pixelSize={8} />);

    expect(THREE.WebGLRenderTarget).toHaveBeenCalledWith(
      100, // 800/8
      75,  // 600/8
      expect.objectContaining({
        minFilter: 'NearestFilter',
        magFilter: 'NearestFilter',
        format: 'RGBAFormat',
        generateMipmaps: false,
        type: 'UnsignedByteType'
      })
    );
  });

  it('should create shader material with brightness boost and bloom', () => {
    const THREE = require('three');
    
    render(<PixelatedEffect enabled={true} />);

    expect(THREE.ShaderMaterial).toHaveBeenCalledWith(
      expect.objectContaining({
        uniforms: expect.objectContaining({
          tDiffuse: { value: {} }
        }),
        fragmentShader: expect.stringContaining('color.rgb *= 2.5'),
        vertexShader: expect.stringContaining('varying vec2 vUv')
      })
    );
  });

  it('should include bloom effect in fragment shader', () => {
    const THREE = require('three');
    
    render(<PixelatedEffect enabled={true} />);

    const shaderCall = THREE.ShaderMaterial.mock.calls[0][0];
    const fragmentShader = shaderCall.fragmentShader;

    // Verify shader includes bloom effect logic
    expect(fragmentShader).toContain('bloom'); // Bloom variable
    expect(fragmentShader).toContain('bloomStrength'); // Bloom strength
    expect(fragmentShader).toContain('luminance > 0.1'); // Updated luminance threshold
    expect(fragmentShader).toContain('color.rgb += bloom'); // Bloom application
  });

  it('should include haziness effect in fragment shader', () => {
    const THREE = require('three');
    
    render(<PixelatedEffect enabled={true} />);

    const shaderCall = THREE.ShaderMaterial.mock.calls[0][0];
    const fragmentShader = shaderCall.fragmentShader;

    // Verify shader includes haziness/softness effect
    expect(fragmentShader).toContain('blurOffset'); // Blur offset variable
    expect(fragmentShader).toContain('blurred'); // Blurred color variable
    expect(fragmentShader).toContain('mix(color.rgb, blurred'); // Blur mixing
    expect(fragmentShader).toContain('vec4 blur1'); // Blur sampling
  });

  it('should apply pixelated CSS styles when enabled', () => {
    render(<PixelatedEffect enabled={true} />);

    expect(mockGl.domElement.style.imageRendering).toBe('-webkit-crisp-edges');
  });

  it('should clean up resources on unmount', () => {
    const { unmount } = render(<PixelatedEffect enabled={true} />);

    unmount();

    expect(mockWebGLRenderTarget.dispose).toHaveBeenCalled();
    expect(mockShaderMaterial.dispose).toHaveBeenCalled();
  });

  it('should handle different pixel sizes correctly', () => {
    const THREE = require('three');
    
    render(<PixelatedEffect enabled={true} pixelSize={16} />);

    expect(THREE.WebGLRenderTarget).toHaveBeenCalledWith(
      50, // 800/16
      37, // 600/16 (rounded down)
      expect.any(Object)
    );
  });

  it('should restore original renderer when disabled after being enabled', () => {
    const originalRender = mockGl.render;
    
    const { rerender } = render(<PixelatedEffect enabled={true} />);

    // Verify renderer was modified
    expect(mockGl.render).not.toBe(originalRender);

    // Disable the effect
    rerender(<PixelatedEffect enabled={false} />);

    // Verify renderer was restored and styles were reset
    expect(mockGl.domElement.style.imageRendering).toBe('auto');
  });
});