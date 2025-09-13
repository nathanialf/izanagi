// Mock DDSLoader for Jest tests
export class DDSLoader {
  constructor() {}
  
  load(url, onLoad, onProgress, onError) {
    // Mock successful texture loading
    if (onLoad) {
      const mockTexture = {
        image: { width: 512, height: 512 },
        format: 'RGBAFormat',
        type: 'UnsignedByteType',
        minFilter: 'LinearFilter',
        magFilter: 'LinearFilter',
        wrapS: 'RepeatWrapping',
        wrapT: 'RepeatWrapping',
        needsUpdate: true
      };
      setTimeout(() => onLoad(mockTexture), 0);
    }
  }
  
  loadAsync(url) {
    return Promise.resolve({
      image: { width: 512, height: 512 },
      format: 'RGBAFormat',
      type: 'UnsignedByteType',
      minFilter: 'LinearFilter',
      magFilter: 'LinearFilter',
      wrapS: 'RepeatWrapping',
      wrapT: 'RepeatWrapping',
      needsUpdate: true
    });
  }
}