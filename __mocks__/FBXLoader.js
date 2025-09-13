// Mock FBXLoader for Jest tests
export class FBXLoader {
  constructor() {}
  
  load(url, onLoad, onProgress, onError) {
    // Mock successful FBX loading
    if (onLoad) {
      const mockFBX = {
        scale: { x: 1, y: 1, z: 1, setScalar: jest.fn() },
        position: { set: jest.fn() },
        traverse: jest.fn()
      };
      setTimeout(() => onLoad(mockFBX), 0);
    }
  }
}