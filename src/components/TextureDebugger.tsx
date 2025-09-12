"use client";

import { useEffect, useState } from "react";

export function TextureDebugger() {
  const [message, setMessage] = useState("🔧 DEBUGGER LOADING...");

  useEffect(() => {
    console.log("TextureDebugger component mounted");
    setMessage("🔧 DEBUGGER ACTIVE");
    
    const texturePaths = [
      "/models/textures/IzanagisBurdenAmmo_Diffuse.dds",
      "/models/textures/IzanagisBurdenDetails_Diffuse.dds",
      "/models/textures/IzanagisBurdenReciever_Diffuse.dds",
    ];

    const testTextures = async () => {
      const results: string[] = [];
      
      for (const path of texturePaths) {
        try {
          const response = await fetch(path);
          const status = response.ok ? "✓ OK" : "✗ FAILED";
          results.push(`${path.split('/').pop()}: ${status} (${response.status})`);
          console.log(`Texture ${path}: ${response.ok ? 'OK' : 'FAILED'} (${response.status})`);
        } catch (error) {
          results.push(`${path.split('/').pop()}: ✗ ERROR`);
          console.log(`Texture ${path}: ERROR - ${error}`);
        }
      }
      
      setMessage(results.join('\n'));
    };

    testTextures();
  }, []);

  return (
    <div 
      className="fixed bottom-4 right-4 bg-red-900 text-white p-3 rounded-lg text-base max-w-xs border-2 border-yellow-400 z-40"
      style={{ 
        backgroundColor: '#dc2626',
        color: 'white',
        fontSize: '12px',
        fontFamily: 'monospace',
        whiteSpace: 'pre-line'
      }}
    >
      <div className="font-bold text-yellow-300 mb-2">TEXTURE DEBUG</div>
      <div>{message}</div>
    </div>
  );
}