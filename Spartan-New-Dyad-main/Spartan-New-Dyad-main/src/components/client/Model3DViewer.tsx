"use client";

import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Grid, Environment, ContactShadows, Html, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

interface Model3DViewerProps {
  modelUrl?: string;
  file?: File;
  onError?: (error: Error) => void;
  onLoad?: () => void;
  className?: string;
}

// Component to load 3D models
function Model({ url, file }: { url?: string; file?: File }) {
  const [model, setModel] = useState<THREE.Group | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadModel = async () => {
      try {
        let objectUrl: string | undefined;

        if (file) {
          objectUrl = URL.createObjectURL(file);
        }

        const finalUrl = objectUrl || url;

        if (!finalUrl) {
          throw new Error('No model URL or file provided');
        }

        // Try to load as GLTF/GLB first
        try {
          const gltf = await useGLTF.preload(finalUrl);
          setModel(gltf.scene);
        } catch (gltfError) {
          // If GLTF fails, try to load as STL (you'd need an STL loader)
          console.error('GLTF loading failed:', gltfError);
          throw new Error('Model format not supported. Please use GLB/GLTF format.');
        }

        if (objectUrl) {
          URL.revokeObjectURL(objectUrl);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load model');
      }
    };

    loadModel();

    return () => {
      if (model) {
        // Cleanup
      }
    };
  }, [url, file]);

  if (error) {
    return (
      <Html position={[0, 0, 0]}>
        <div className="bg-red-500/20 text-red-300 p-4 rounded-lg">
          {error}
        </div>
      </Html>
    );
  }

  if (!model) {
    return (
      <Html position={[0, 0, 0]}>
        <div className="text-white">Loading model...</div>
      </Html>
    );
  }

  return <primitive object={model} />;
}

// Fallback component when no model is loaded
function PlaceholderModel() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.5;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0.5, 0]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#6366f1" />
    </mesh>
  );
}

export const Model3DViewer: React.FC<Model3DViewerProps> = ({
  modelUrl,
  file,
  onError,
  onLoad,
  className = "",
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleLoad = () => {
    setLoading(false);
    onLoad?.();
  };

  const handleError = (err: Error) => {
    setLoading(false);
    setError(err.message);
    onError?.(err);
  };

  return (
    <div className={`w-full h-full ${className}`}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50 z-10">
          <div className="text-white">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
            <p>Carregando modelo 3D...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50 z-10">
          <div className="bg-red-500/20 text-red-300 p-6 rounded-lg max-w-md">
            <p className="font-bold mb-2">Erro ao carregar modelo</p>
            <p>{error}</p>
          </div>
        </div>
      )}

      <Canvas
        shadows
        camera={{ position: [2, 2, 2], fov: 50 }}
        className="w-full h-full"
      >
        <color attach="background" args={['#0f172a']} />
        
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
        <pointLight position={[-10, -10, -5]} intensity={0.5} />

        <Environment preset="city" />

        {modelUrl || file ? (
          <Model url={modelUrl} file={file} />
        ) : (
          <PlaceholderModel />
        )}

        <Grid
          args={[10, 10]}
          cellSize={0.5}
          cellThickness={0.5}
          cellColor="#6366f1"
          sectionSize={5}
          sectionThickness={1}
          sectionColor="#4f46e5"
          fadeDistance={25}
          fadeStrength={1}
          followCamera={false}
          infiniteGrid
        />

        <ContactShadows
          position={[0, -0.01, 0]}
          opacity={0.5}
          scale={10}
          blur={2}
          far={4}
        />

        <OrbitControls
          makeDefault
          minPolarAngle={0}
          maxPolarAngle={Math.PI / 2}
          minDistance={1}
          maxDistance={10}
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
        />
      </Canvas>

      {/* Controls Info */}
      <div className="absolute bottom-4 left-4 bg-slate-900/80 text-white p-3 rounded-lg text-xs backdrop-blur-sm">
        <p><strong>Controles:</strong></p>
        <p>• Clique + arraste: Rotacionar</p>
        <p>• Scroll: Zoom</p>
        <p>• Clique direito + arraste: Mover</p>
      </div>
    </div>
  );
};

export default Model3DViewer;