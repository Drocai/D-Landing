import React, { Suspense, useRef, useState } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { PerspectiveCamera, Stars, Sparkles, ScreenShake, Preload } from '@react-three/drei';
import * as THREE from 'three';
import { create } from 'zustand';

/**
 * ------------------------------------------------------------------
 * STATE MANAGEMENT (Zustand)
 * ------------------------------------------------------------------
 */
const useGameStore = create((set) => ({
  gameState: 'MENU', // MENU, PLAYING, GAMEOVER
  score: 0,
  highScore: Number.parseInt(window.localStorage.getItem('db_highscore') || '0', 10),
  hype: 100, // Health mechanics
  speed: 0.5,
  setGameState: (state) => set({ gameState: state }),
  resetGame: () => set({ score: 0, hype: 100, speed: 0.5, gameState: 'PLAYING' }),
  addScore: (points) => set((state) => ({ score: state.score + points, hype: Math.min(state.hype + 5, 100) })),
  damage: (amount) => set((state) => ({ hype: Math.max(state.hype - amount, 0) })),
  updateHighscore: (score) => set((state) => {
    const newHigh = Math.max(score, state.highScore);
    window.localStorage.setItem('db_highscore', String(newHigh));
    return { highScore: newHigh };
  }),
}));

/**
 * ------------------------------------------------------------------
 * SHADERS & MATERIALS
 * ------------------------------------------------------------------
 */
const SynthwaveFloorShader = {
  uniforms: {
    uTime: { value: 0 },
    uColor: { value: new THREE.Color('#ff003c') }, // Red grid
    uGridSize: { value: 10.0 },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      gl_Position = projectionMatrix * viewMatrix * worldPosition;
    }
  `,
  fragmentShader: `
    uniform float uTime;
    uniform vec3 uColor;
    varying vec2 vUv;

    void main() {
      // Moving grid effect
      float gridY = step(0.98, fract(vUv.y * 20.0 + uTime * 2.0));
      float gridX = step(0.98, fract(vUv.x * 10.0));
      float grid = max(gridX, gridY);

      // Fade out into distance
      float alpha = (1.0 - vUv.y) * grid;

      gl_FragColor = vec4(uColor, alpha);
    }
  `,
};

/**
 * ------------------------------------------------------------------
 * GAME COMPONENTS
 * ------------------------------------------------------------------
 */

// 1. The Player (Using your 2D Assets as 3D Billboards)
const PlayerBull = () => {
  const { gameState } = useGameStore();
  const playerRef = useRef(null);

  // Load textures (Assuming you renamed your uploads)
  const [runTex] = useLoader(THREE.TextureLoader, ['/bull_run.png', '/bull_smash.png']);

  // Mouse/Touch controls
  useFrame(({ mouse, clock }) => {
    if (gameState !== 'PLAYING' || !playerRef.current) return;

    // Lerp position for smooth movement
    const targetX = mouse.x * 6; // Lane width
    playerRef.current.position.x += (targetX - playerRef.current.position.x) * 0.15;

    // Bobbing animation (running)
    playerRef.current.position.y = Math.sin(clock.getElapsedTime() * 15) * 0.2 + 0.5;

    // Tilt based on movement
    playerRef.current.rotation.z = (playerRef.current.position.x - targetX) * 0.1;
  });

  return (
    <group ref={playerRef} position={[0, 0, 0]}>
      {/* Sprite Billboard */}
      <mesh>
        <planeGeometry args={[2.5, 2.5]} />
        <meshBasicMaterial
          map={runTex}
          transparent
          side={THREE.DoubleSide}
          toneMapped={false}
        />
      </mesh>
      {/* Shadow */}
      <mesh position={[0, -1.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.8, 32]} />
        <meshBasicMaterial color="black" opacity={0.5} transparent />
      </mesh>
    </group>
  );
};

// 2. Obstacles & Collectibles Manager
const ObstacleManager = () => {
  const { gameState, addScore, damage, hype, setGameState, score, updateHighscore } = useGameStore();
  // Simplified pooling for React state
  const [items, setItems] = useState([]);
  const lastSpawn = useRef(0);

  useFrame((state, delta) => {
    if (gameState !== 'PLAYING') return;

    // 1. Spawning Logic
    if (state.clock.elapsedTime - lastSpawn.current > 0.8) {
      lastSpawn.current = state.clock.elapsedTime;
      const type = Math.random() > 0.3 ? 'CHINA' : 'WALL'; // 70% China, 30% Walls
      const lane = (Math.random() - 0.5) * 8;

      setItems((prev) => [...prev, {
        id: Math.random(),
        x: lane,
        z: -20,
        type,
        active: true,
      }]);
    }

    // 2. Movement & Collision Logic
    setItems((prev) => prev
      .map((item) => {
        const newZ = item.z + (10 * delta); // Speed

        // Collision Check (Simple distance check against player at 0,0,0)
        if (item.active && newZ > -1 && newZ < 1) {
          // Player X is tracked via mouse, we need access to it.
          // For this simplified version, we'll assume player is roughly at mouse x * 6
          const playerX = state.mouse.x * 6;
          const dist = Math.abs(playerX - item.x);

          if (dist < 1.5) {
            if (item.type === 'CHINA') {
              addScore(100);
              // Trigger smash effect here
            } else {
              damage(30);
              // Trigger hit effect
            }
            return { ...item, active: false, z: newZ }; // Hide item
          }
        }
        return { ...item, z: newZ };
      })
      .filter((item) => item.z < 10)); // Cleanup items behind camera

    // 3. Game Over Check
    if (hype <= 0) {
      updateHighscore(score);
      setGameState('GAMEOVER');
    }
  });

  return (
    <>
      {items.map((item) => item.active && (
        <group key={item.id} position={[item.x, 0, item.z]}>
          <ItemVisual type={item.type} />
        </group>
      ))}
    </>
  );
};

// Visual representation of items
const ItemVisual = ({ type }) => {
  // Rotate the china
  const mesh = useRef(null);
  useFrame((_, delta) => {
    if (mesh.current) {
      mesh.current.rotation.y += delta * 2;
      mesh.current.rotation.x += delta;
    }
  });

  if (type === 'CHINA') {
    return (
      <mesh ref={mesh}>
        <dodecahedronGeometry args={[0.6, 0]} />
        <meshStandardMaterial color="gold" metalness={1} roughness={0.2} emissive="orange" emissiveIntensity={0.5} />
      </mesh>
    );
  }
  return ( // WALL
    <mesh position={[0, 0.5, 0]}>
      <boxGeometry args={[1.5, 2, 0.5]} />
      <meshStandardMaterial color="#111" emissive="red" emissiveIntensity={0.2} />
      <Sparkles count={10} scale={2} size={5} speed={0.4} opacity={0.5} color="red" />
    </mesh>
  );
};

// 3. The Environment
const Environment = () => {
  const floorRef = useRef(null);
  useFrame(({ clock }) => {
    if (floorRef.current) floorRef.current.uniforms.uTime.value = clock.getElapsedTime();
  });

  return (
    <>
      <color attach="background" args={['#050505']} />
      <fog attach="fog" args={['#050505', 5, 30]} />

      <ambientLight intensity={0.5} />
      <spotLight position={[10, 10, 10]} angle={0.5} penumbra={1} intensity={2} color="#d4af37" />

      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={2} />

      {/* Infinite Grid Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]}>
        <planeGeometry args={[100, 100, 20, 20]} />
        <shaderMaterial ref={floorRef} args={[SynthwaveFloorShader]} transparent />
      </mesh>
    </>
  );
};

/**
 * ------------------------------------------------------------------
 * UI OVERLAYS (HTML)
 * ------------------------------------------------------------------
 */
const Interface = () => {
  const { gameState, score, hype, highScore, resetGame } = useGameStore();

  if (gameState === 'MENU') {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm z-50">
        <h1 className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-red-600 mb-4 transform -skew-x-12">
          DUMB BULL
        </h1>
        <p className="text-white text-xl mb-8 font-mono">⚠️ SMASH CHINA. AVOID WALLS. KEEP THE HYPE UP. ⚠️</p>
        <button
          onClick={resetGame}
          className="px-12 py-4 bg-yellow-500 hover:bg-yellow-400 text-black font-black text-2xl rounded-sm skew-x-[-10deg] transition-transform hover:scale-105"
        >
          START RAMPAGE
        </button>
        <div className="mt-8 flex gap-4">
          <button className="text-white border border-white/20 px-6 py-2 rounded-full hover:bg-white/10">🎵 Pre-Save Track</button>
        </div>
      </div>
    );
  }

  if (gameState === 'GAMEOVER') {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-900/90 z-50">
        <h2 className="text-6xl font-black text-white mb-2">CRASHED OUT</h2>
        <div className="text-4xl text-yellow-400 font-bold mb-8">SCORE: {score}</div>
        <p className="text-white/70 mb-8">High Score: {highScore}</p>

        <div className="bg-black/50 p-6 rounded-xl max-w-md w-full text-center border border-white/10">
          <p className="text-white font-bold mb-4">DON'T LET THE ENERGY DIE.</p>
          <div className="grid grid-cols-1 gap-3">
            <a href="#" className="block w-full bg-[#1DB954] text-black font-bold py-3 rounded">STREAM ON SPOTIFY</a>
            <a href="#" className="block w-full bg-[#FF0000] text-white font-bold py-3 rounded">WATCH VIDEO</a>
          </div>
        </div>

        <button onClick={resetGame} className="mt-8 text-white underline hover:text-yellow-400">PLAY AGAIN</button>
      </div>
    );
  }

  // HUD
  return (
    <div className="absolute top-0 left-0 w-full p-6 flex justify-between pointer-events-none">
      <div>
        <div className="text-xs text-gray-500 font-bold tracking-widest">DAMAGE DEALT</div>
        <div className="text-5xl font-black text-white" style={{ textShadow: '4px 4px 0 #000' }}>${score}</div>
      </div>
      <div className="w-64">
        <div className="text-xs text-gray-500 font-bold tracking-widest text-right mb-1">HYPE METER</div>
        <div className="w-full h-6 bg-gray-900 border-2 border-gray-700 skew-x-[-12deg]">
          <div
            className={`h-full transition-all duration-200 ${hype < 30 ? 'bg-red-500' : 'bg-yellow-400'}`}
            style={{ width: `${hype}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <div className="relative w-full h-screen bg-black overflow-hidden font-sans select-none">
      <Canvas dpr={[1, 2]}>
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={[0, 3, 8]} fov={50} />
          <Environment />
          <PlayerBull />
          <ObstacleManager />
          <ScreenShake maxY={0.05} intensity={0.5} />
          <Preload all />
        </Suspense>
      </Canvas>
      <Interface />
    </div>
  );
}
