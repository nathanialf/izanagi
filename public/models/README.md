# 3D Model Assets

## Asset Placement Instructions

Place your 3D model files in this directory:

### Expected Files:
- **Main Model**: `weapon.fbx` - The primary weapon model file
- **Alternative Models**: Any `.fbx` files you want to load
- **Textures**: `.dds` texture files that accompany your models
- **Blend Files**: `.blend` source files (optional, for reference)

### Supported Formats:
- **FBX**: Primary format for 3D models (`.fbx`)
- **Textures**: DDS format (`.dds`)
- **Source**: Blender files (`.blend`)

### File Structure:
```
public/models/
├── weapon.fbx          # Main weapon model (will be loaded by default)
├── textures/           # Optional: organize textures in subdirectory
│   ├── diffuse.dds
│   ├── normal.dds
│   └── specular.dds
└── README.md           # This file
```

### Notes:
- The application will look for `weapon.fbx` by default
- If no model is found, a placeholder sword will be displayed
- Ensure texture paths in your FBX file are relative to this directory
- Large files should be optimized for web delivery

### Model Requirements:
- Models should be properly scaled (the loader applies 0.01 scale by default)
- Ensure models have proper UV mapping for textures
- Models should be centered at origin (0,0,0) for best viewing