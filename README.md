# Project Izanagi - 3D Model Viewer with Retro Effects

A modern 3D model viewer built with Next.js and React Three Fiber, featuring Destiny 2's exotic sniper rifle "Izanagi's Burden" with interactive controls, visual effects, and comprehensive testing infrastructure.

## Features

### Core Functionality
- **3D Model Rendering**: FBX model loading with Three.js
- **Advanced Texturing**: DDS texture support with smart material mapping
- **Interactive Controls**: 
  - Orbit camera controls (pan, zoom, rotate)
  - Material/Spectral mode toggle
  - Settings persistence via localStorage
- **Responsive Design**: Works on desktop and mobile devices

### Quality Assurance
- **Comprehensive Testing**: Unit, integration, and performance tests with Jest
- **Cross-Browser Testing**: Automated E2E testing with Playwright across Chrome, Firefox, Safari, and mobile
- **Test-Driven Build**: All tests must pass before successful build
- **Error Handling**: Robust error boundaries and WebGL fallbacks

## Tech Stack

- **Framework**: Next.js 15.5.3 with TypeScript
- **3D Graphics**: React Three Fiber (@react-three/fiber)
- **3D Utilities**: @react-three/drei for controls and helpers
- **Styling**: Tailwind CSS v4+
- **Icons**: Tabler Icons React
- **3D Engine**: Three.js with FBX and DDS loaders
- **Testing**: Jest, React Testing Library, Playwright

## Project Structure

```
src/
├── app/                      # Next.js app directory
├── components/
│   ├── Scene3D.tsx          # Main 3D scene component
│   ├── ModelLoader.tsx      # FBX model loading logic
│   ├── TextureLoader.tsx    # DDS texture loading and application
│   ├── SimpleTextureLoader.tsx # Fallback texture system
│   ├── ControlPanel.tsx     # UI controls with persistence
│   ├── ErrorBoundary.tsx    # Error handling
│   └── DDSTest.tsx          # Texture debugging utility
├── __tests__/               # Test suites
│   ├── components/          # Component unit tests
│   ├── integration/         # Integration tests
│   └── perf/                # Performance tests
e2e/
├── cross-browser.spec.ts    # Cross-browser E2E tests
public/
├── models/
│   ├── izanagis-burden.fbx  # 3D weapon model
│   └── textures/            # DDS texture files
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

### Testing

Run the full test suite:
```bash
npm run test:all    # All tests (unit + E2E)
npm run test        # Jest unit tests only  
npm run test:e2e    # Playwright E2E tests only
npm run test:coverage # Test coverage report
```

### Build for Production

```bash
npm run build       # Runs all tests + builds
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