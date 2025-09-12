"use client";

import React from "react";

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error }>;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("FBX Loading Error:", error);
    console.error("Error Info:", errorInfo);
  }

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error} />;
      }
      
      return (
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[1, 0.1, 0.1]} />
          <meshStandardMaterial color="red" />
        </mesh>
      );
    }

    return this.props.children;
  }
}

function ErrorFallback({ error }: { error: Error }) {
  console.error("Model loading failed:", error.message);
  
  return (
    <group>
      {/* Error indicator - red box */}
      <mesh position={[0, 1, 0]}>
        <boxGeometry args={[2, 0.2, 0.2]} />
        <meshStandardMaterial color="red" />
      </mesh>
      
      {/* Placeholder weapon */}
      <mesh position={[0, -0.5, 0]}>
        <boxGeometry args={[0.2, 1.5, 0.2]} />
        <meshStandardMaterial color="#654321" />
      </mesh>
      <mesh position={[0, 1, 0]}>
        <boxGeometry args={[0.05, 2, 0.3]} />
        <meshStandardMaterial color="#C0C0C0" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  );
}

export { ErrorBoundary, ErrorFallback };