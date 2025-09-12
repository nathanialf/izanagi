import '@testing-library/jest-dom'

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Mock WebGL context for Three.js
const mockGetContext = jest.fn()
HTMLCanvasElement.prototype.getContext = mockGetContext

// Mock performance.now for Three.js animations
Object.defineProperty(window, 'performance', {
  value: {
    now: jest.fn(() => Date.now()),
  },
})

// Mock URL.createObjectURL
Object.defineProperty(window.URL, 'createObjectURL', {
  value: jest.fn(() => 'mocked-url'),
})

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
}
global.localStorage = localStorageMock

// Mock React Three Fiber components
jest.mock('@react-three/fiber', () => {
  const React = require('react')
  
  // Create mock components that render as divs with data attributes
  const createMockComponent = (name) => 
    React.forwardRef((props, ref) => 
      React.createElement('div', {
        ...props,
        ref,
        'data-three-type': name,
        'data-testid': name,
      }, props.children)
    )
  
  return {
    Canvas: createMockComponent('Canvas'),
    extend: jest.fn(),
    useFrame: jest.fn(),
    useLoader: jest.fn(),
    useThree: jest.fn(() => ({
      scene: {},
      camera: {},
      gl: {},
    })),
  }
})

// Mock React Three Drei components  
jest.mock('@react-three/drei', () => ({
  OrbitControls: require('react').forwardRef((props, ref) => 
    require('react').createElement('div', {
      ...props,
      ref,
      'data-three-type': 'OrbitControls',
      'data-testid': 'orbit-controls',
    })
  ),
}))

global.React = require('react')

// Suppress React warnings for Three.js primitive elements during testing
const originalConsoleError = console.error
console.error = (message, ...args) => {
  // Suppress React warnings about Three.js primitive casing
  if (typeof message === 'string' && message.includes('is using incorrect casing')) {
    const threeJsPrimitives = [
      'boxGeometry', 'sphereGeometry', 'planeGeometry', 'cylinderGeometry',
      'meshStandardMaterial', 'meshBasicMaterial', 'meshPhongMaterial',
      'pointLight', 'directionalLight', 'ambientLight', 'hemisphereLight'
    ]
    
    const isThreeJsWarning = threeJsPrimitives.some(primitive => message.includes(primitive))
    if (isThreeJsWarning) {
      return // Suppress Three.js casing warnings
    }
  }
  
  originalConsoleError(message, ...args)
}

// Override React.createElement to handle Three.js primitives
const originalCreateElement = global.React.createElement
global.React.createElement = function(type, props, ...children) {
  // Handle Three.js primitive elements (lowercase names)
  if (typeof type === 'string') {
    const threeJsPrimitives = [
      'mesh', 'group', 'scene', 'object3D',
      'boxGeometry', 'sphereGeometry', 'planeGeometry', 'cylinderGeometry',
      'meshStandardMaterial', 'meshBasicMaterial', 'meshPhongMaterial',
      'pointLight', 'directionalLight', 'ambientLight', 'hemisphereLight'
    ]
    
    if (threeJsPrimitives.includes(type)) {
      return originalCreateElement('div', {
        ...props,
        'data-three-type': type,
        'data-testid': type,
      }, ...children)
    }
  }
  
  return originalCreateElement(type, props, ...children)
}