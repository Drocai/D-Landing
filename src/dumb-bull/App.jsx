import React, { Suspense, useRef, useState } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import {
  PerspectiveCamera,
  Preload,
  ScreenShake,
  Sparkles,
  Stars,
} from '@react-three/drei';
import * as THREE from 'three';
import { create } from 'zustand';

/**
 * DUMB BULL prototype game app.
 *
 * Note: This file is intended for a separate React/Vite app as described
 * in `src/dumb-bull/README.md`.
 */
const useGameStore = create((set) => ({
  gameState: 'MENU',
  score: 0,
  highScore: typeof window !== 'undefined' && window.localStorage
    ? Number.parseInt(localStorage.getItem('db_highscore') || '0', 10)
    : 0,
  hype: 100,
  speed: 0.5,
  setGameState: (state) => set({ gameState: state }),
  resetGame: () =>
    set({ score: 0, hype: 100, speed: 0.5, gameState: 'PLAYING' }),
  addScore: (points) =>
    set((state) => ({
      score: state.score + points,
      hype: Math.min(state.hype + 5, 100),
    })),
  damage: (amount) => set((state) => ({ hype: Math.max(state.hype - amount, 0) })),
  updateHighscore: (score) =>
    set((state) => {
      const newHigh = Math.max(score, state.highScore);
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('db_highscore', String(newHigh));
      }
      return { highScore: newHigh };
    }),
}));

const SynthwaveFloorShader = {
  uniforms: {
    uTime: { value: 0 },
    uColor: { value: new THREE.Color('#ff003c') },
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
      float gridY = step(0.98, fract(vUv.y * 20.0 + uTime * 2.0));
      float gridX = step(0.98, fract(vUv.x * 10.0));
      float grid = max(gridX, gridY);
      float alpha = (1.0 - vUv.y) * grid;
      gl_FragColor = vec4(uColor, alpha);
    }
  `,
};

const PlayerBull = () => {
  const { gameState } = useGameStore();
  const playerRef = useRef(null);
  const runTex = useLoader(THREE.TextureLoader, '/bull_run.png');

  useFrame(({ mouse, clock }) => {
    if (gameState !== 'PLAYING' || !playerRef.current) {
      return;
    }

    const targetX = mouse.x * 6;
    playerRef.current.position.x += (targetX - playerRef.current.position.x) * 0.15;
    playerRef.current.position.y = Math.sin(clock.getElapsedTime() * 15) * 0.2 + 0.5;
    playerRef.current.rotation.z = (playerRef.current.position.x - targetX) * 0.1;
  });

  return (
    <group ref={playerRef} position={[0, 0, 0]}>
      <mesh>
        <planeGeometry args={[2.5, 2.5]} />
        <meshBasicMaterial map={runTex} transparent side={THREE.DoubleSide} toneMapped={false} />
      </mesh>
      <mesh position={[0, -1.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.8, 32]} />
        <meshBasicMaterial color="black" opacity={0.5} transparent />
      </mesh>
    </group>
  );
};

const ItemVisual = ({ type }) => {
  const mesh = useRef(null);

  useFrame((_, delta) => {
    if (!mesh.current) {
      return;
    }

    mesh.current.rotation.y += delta * 2;
    mesh.current.rotation.x += delta;
  });

  if (type === 'CHINA') {
    return (
      <mesh ref={mesh}>
        <dodecahedronGeometry args={[0.6, 0]} />
        <meshStandardMaterial
          color="gold"
          metalness={1}
          roughness={0.2}
          emissive="orange"
          emissiveIntensity={0.5}
        />
      </mesh>
    );
  }

  return (
    <mesh ref={mesh} position={[0, 0.5, 0]}>
      <boxGeometry args={[1.5, 2, 0.5]} />
      <meshStandardMaterial color="#111" emissive="red" emissiveIntensity={0.2} />
      <Sparkles count={10} scale={2} size={5} speed={0.4} opacity={0.5} color="red" />
    </mesh>
  );
};

const ObstacleManager = () => {
  const { gameState, addScore, damage, hype, score, setGameState, updateHighscore } = useGameStore();
  const [items, setItems] = useState([]);
  const lastSpawn = useRef(0);
  const itemIdCounter = useRef(0);

  useFrame((state, delta) => {
    if (gameState !== 'PLAYING') {
      return;
    }

    setItems((prev) => {
      let updated = prev;

      // Spawn new item if needed
      if (state.clock.elapsedTime - lastSpawn.current > 0.8) {
        lastSpawn.current = state.clock.elapsedTime;
        const type = Math.random() > 0.3 ? 'CHINA' : 'WALL';
        const lane = (Math.random() - 0.5) * 8;
        itemIdCounter.current += 1;
        updated = [...updated, { id: itemIdCounter.current, x: lane, z: -20, type, active: true }];
      }

      // Move items and check collisions in a single pass
      return updated
        .map((item) => {
          const newZ = item.z + 10 * delta;

          if (item.active && newZ > -1 && newZ < 1) {
            const playerX = state.mouse.x * 6;
            const dist = Math.abs(playerX - item.x);

            if (dist < 1.5) {
              if (item.type === 'CHINA') {
                addScore(100);
              } else {
                damage(30);
              }

              return { ...item, active: false, z: newZ };
            }
          }

          return { ...item, z: newZ };
        })
        .filter((item) => item.z < 10);
    });

    if (hype <= 0) {
      updateHighscore(score);
      setGameState('GAMEOVER');
    }
  });

  return (
    <>
      {items.map(
        (item) =>
          item.active && (
            <group key={item.id} position={[item.x, 0, item.z]}>
              <ItemVisual type={item.type} />
            </group>
          ),
      )}
    </>
  );
};

const Environment = () => {
  const floorRef = useRef(null);

  useFrame(({ clock }) => {
    if (floorRef.current) {
      floorRef.current.uniforms.uTime.value = clock.getElapsedTime();
    }
  });

  return (
    <>
      <color attach="background" args={['#050505']} />
      <fog attach="fog" args={['#050505', 5, 30]} />

      <ambientLight intensity={0.5} />
      <spotLight position={[10, 10, 10]} angle={0.5} penumbra={1} intensity={2} color="#d4af37" />
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={2} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]}>
        <planeGeometry args={[100, 100, 20, 20]} />
        <shaderMaterial ref={floorRef} args={[SynthwaveFloorShader]} transparent />
      </mesh>
    </>
  );
};

const Interface = () => {
  const { gameState, score, hype, highScore, resetGame } = useGameStore();

  if (gameState === 'MENU') {
    return (
      <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm">
        <h1 className="mb-4 -skew-x-12 bg-gradient-to-r from-yellow-400 to-red-600 bg-clip-text text-8xl font-black text-transparent">
          DUMB BULL
        </h1>
        <p className="mb-8 font-mono text-xl text-white">⚠️ SMASH CHINA. AVOID WALLS. KEEP THE HYPE UP. ⚠️</p>
        <button
          onClick={resetGame}
          className="skew-x-[-10deg] rounded-sm bg-yellow-500 px-12 py-4 text-2xl font-black text-black transition-transform hover:scale-105 hover:bg-yellow-400"
        >
          START RAMPAGE
        </button>
      </div>
    );
  }

  if (gameState === 'GAMEOVER') {
    return (
      <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-red-900/90">
        <h2 className="mb-2 text-6xl font-black text-white">CRASHED OUT</h2>
        <div className="mb-8 text-4xl font-bold text-yellow-400">SCORE: {score}</div>
        <p className="mb-8 text-white/70">High Score: {highScore}</p>
        <button onClick={resetGame} className="mt-8 text-white underline hover:text-yellow-400">
          PLAY AGAIN
        </button>
      </div>
    );
  }

  return (
    <div className="pointer-events-none absolute left-0 top-0 flex w-full justify-between p-6">
      <div>
        <div className="text-xs font-bold tracking-widest text-gray-500">DAMAGE DEALT</div>
        <div className="text-5xl font-black text-white" style={{ textShadow: '4px 4px 0 #000' }}>
          ${score}
        </div>
      </div>
      <div className="w-64">
        <div className="mb-1 text-right text-xs font-bold tracking-widest text-gray-500">HYPE METER</div>
        <div className="h-6 w-full skew-x-[-12deg] border-2 border-gray-700 bg-gray-900">
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
    <div className="relative h-screen w-full select-none overflow-hidden bg-black font-sans">
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
