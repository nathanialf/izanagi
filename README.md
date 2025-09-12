# Izanagi's Burden - 3D Model Viewer

A modern 3D model viewer built with Next.js and React Three Fiber, featuring Destiny 2's exotic sniper rifle "Izanagi's Burden" with interactive controls and visual effects.

## Features

- **3D Model Rendering**: FBX model loading with Three.js
- **Advanced Texturing**: DDS texture support with smart material mapping
- **Interactive Controls**: 
  - Orbit camera controls (pan, zoom, rotate)
  - Material/Spectral mode toggle
  - Settings persistence via localStorage
- **Modern UI**: Glass-morphism control panel with Tabler icons
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Framework**: Next.js 15 with TypeScript
- **3D Graphics**: React Three Fiber (@react-three/fiber)
- **3D Utilities**: @react-three/drei for controls and helpers
- **Styling**: Tailwind CSS
- **Icons**: Tabler Icons React
- **3D Engine**: Three.js with FBX and DDS loaders

## Project Structure

```
src/
├── app/                    # Next.js app directory
├── components/
│   ├── Scene3D.tsx        # Main 3D scene component
│   ├── ModelLoader.tsx    # FBX model loading logic
│   ├── TextureLoader.tsx  # DDS texture loading and application
│   ├── SimpleTextureLoader.tsx # Fallback texture system
│   ├── ControlPanel.tsx   # UI controls
│   ├── ErrorBoundary.tsx  # Error handling
│   └── DDSTest.tsx        # Texture debugging utility
public/
├── models/
│   ├── izanagis-burden.fbx # 3D weapon model
│   └── textures/           # DDS texture files
└── favicon.ico
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Build for Production

```bash
npm run build
npm start
```

## Usage

- **Camera Controls**: Click and drag to rotate, scroll to zoom, right-click and drag to pan
- **Material Toggle**: Use the checkbox in the control panel to switch between Material and Spectral modes
- **Settings**: Your preferences are automatically saved to localStorage

## Texture System

The application supports both DDS textures (primary) and fallback canvas textures:

- **DDS Textures**: High-quality game textures loaded via Three.js DDSLoader
- **Smart Mapping**: Automatically assigns textures based on mesh/material names
- **Fallback System**: Simple colored textures when DDS loading fails

## Development

### Key Components

- `Scene3D`: Main 3D scene with lighting and camera setup
- `ModelLoader`: Handles FBX model loading and material application
- `TextureLoader`: Manages DDS texture loading with intelligent mapping
- `ControlPanel`: Modern UI controls with persistence

### Material Modes

- **Material Mode** (`showMaterial: true`): Full textures and realistic materials
- **Spectral Mode** (`showMaterial: false`): Translucent ghost-like appearance

## Browser Compatibility

- Modern browsers with WebGL support
- DDS texture support varies by browser
- Fallback system ensures compatibility across all platforms

## License

This project is for educational and demonstration purposes.

## Assets

Model and textures are from Destiny 2 by Bungie, used for educational purposes.