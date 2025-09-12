"use client";

import { useState, useEffect } from "react";
import { IconSettings, IconX} from "@tabler/icons-react";

interface ControlPanelProps {
  onShowMaterialChange: (enabled: boolean) => void;
}

export default function ControlPanel({ onShowMaterialChange }: ControlPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showMaterial, setShowMaterial] = useState(true); // Default to true (material mode)

  // Load settings from localStorage
  useEffect(() => {
    const savedShowMaterial = localStorage.getItem('izanagi-show-material') !== 'false'; // Default to true
    setShowMaterial(savedShowMaterial);
    onShowMaterialChange(savedShowMaterial);
  }, [onShowMaterialChange]);

  const handleShowMaterialToggle = (enabled: boolean) => {
    setShowMaterial(enabled);
    localStorage.setItem('izanagi-show-material', enabled.toString());
    onShowMaterialChange(enabled);
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
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-white">
                  Show Material
                </span>
                <input
                  type="checkbox"
                  checked={showMaterial}
                  onChange={(e) => handleShowMaterialToggle(e.target.checked)}
                  className="w-4 h-4 accent-blue-500"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}