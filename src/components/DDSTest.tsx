"use client";

import { useEffect, useState } from "react";

export function DDSTest() {
  const [testResult, setTestResult] = useState<string>("Testing...");

  useEffect(() => {
    const testDDS = async () => {
      try {
        // Test if we can at least fetch the DDS file
        const response = await fetch("/models/textures/IzanagisBurdenReciever_Diffuse.dds");
        if (response.ok) {
          const blob = await response.blob();
          console.log("DDS file fetch successful:", {
            size: blob.size,
            type: blob.type,
            url: "/models/textures/IzanagisBurdenReciever_Diffuse.dds"
          });
          setTestResult(`DDS fetch OK: ${blob.size} bytes`);
          
          // Try to load with Three.js DDSLoader
          const { DDSLoader } = await import("three/examples/jsm/loaders/DDSLoader.js");
          const loader = new DDSLoader();
          
          loader.load(
            "/models/textures/IzanagisBurdenReciever_Diffuse.dds",
            (texture) => {
              console.log("DDS texture loaded successfully with Three.js:", texture);
              setTestResult(`✅ DDS loads in Three.js: ${texture.image?.width}x${texture.image?.height}`);
            },
            undefined,
            (error) => {
              console.error("DDS loading failed in Three.js:", error);
              setTestResult(`❌ DDS Three.js error: ${error}`);
            }
          );
        } else {
          setTestResult(`❌ DDS fetch failed: ${response.status}`);
        }
      } catch (error) {
        setTestResult(`❌ DDS test error: ${error}`);
      }
    };

    testDDS();
  }, []);

  return (
    <div className="fixed top-20 left-4 bg-blue-900 text-white p-3 rounded text-sm max-w-xs z-50">
      <div className="font-bold mb-1">DDS Test:</div>
      <div>{testResult}</div>
    </div>
  );
}