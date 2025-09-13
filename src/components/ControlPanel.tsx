"use client";

import { useState, useEffect } from "react";
import { IconSettings, IconX} from "@tabler/icons-react";

interface ControlPanelProps {
  onShowMaterialChange: (enabled: boolean) => void;
  onPixelatedModeChange?: (enabled: boolean) => void;
}

export default function ControlPanel({ 
  onShowMaterialChange,
  onPixelatedModeChange
}: ControlPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showMaterial, setShowMaterial] = useState(true); // Default to true (material mode)
  const [pixelatedMode, setPixelatedMode] = useState(false); // Default to false

  // Load settings from localStorage
  useEffect(() => {
    const savedShowMaterial = localStorage.getItem('izanagi-show-material') !== 'false'; // Default to true
    const savedPixelatedMode = localStorage.getItem('izanagi-pixelated-mode') === 'true'; // Default to false
    
    setShowMaterial(savedShowMaterial);
    setPixelatedMode(savedPixelatedMode);
    
    onShowMaterialChange(savedShowMaterial);
    onPixelatedModeChange?.(savedPixelatedMode);
  }, [onShowMaterialChange, onPixelatedModeChange]);

  const handleShowMaterialToggle = (enabled: boolean) => {
    setShowMaterial(enabled);
    localStorage.setItem('izanagi-show-material', enabled.toString());
    onShowMaterialChange(enabled);
  };

  const handlePixelatedModeToggle = (enabled: boolean) => {
    setPixelatedMode(enabled);
    localStorage.setItem('izanagi-pixelated-mode', enabled.toString());
    onPixelatedModeChange?.(enabled);
  };

  return (
    <>
      {/* Toggle Button - Only show when panel is closed */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed top-6 right-6 z-50 bg-inherit border-none cursor-pointer"
          title="Open Controls"
        >
          <IconSettings size={30} stroke={2} color="white"/>
        </button>
      )}

      {/* Control Panel */}
      {isOpen && (
        <div className="fixed z-50 min-w-[280px] bg-gray font-mono">
          {/* Header with close button */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-white text-lg font-medium">
                Controls
              </h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="cursor-pointer bg-inherit border-none"
              title="Close"
            >
              <IconX size={18} stroke={3} color="white"/>
            </button>
          </div>
          
          <div className="space-y-6">
            {/* Show Material Toggle */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-white">
                  Show Material
                </span>
                <input
                  type="checkbox"
                  checked={showMaterial}
                  onChange={(e) => handleShowMaterialToggle(e.target.checked)}
                  className="w-4 h-4 accent-blue-500"
                  aria-label="Show Material"
                />
              </div>
            </div>

            {/* Pixelated Mode Toggle */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-white">
                  Pixelated Mode
                </span>
                <input
                  type="checkbox"
                  checked={pixelatedMode}
                  onChange={(e) => handlePixelatedModeToggle(e.target.checked)}
                  className="w-4 h-4 accent-red-500"
                  aria-label="Pixelated Mode"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}