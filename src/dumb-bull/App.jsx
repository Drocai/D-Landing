import React, { Suspense, useRef, useState } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import {
  PerspectiveCamera,
  Preload,
  ScreenShake,
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
    ? Number.parseInt(window.localStorage.getItem('db_highscore') || '0', 10)
    : 0,
  hype: 100,
  speed: 0.5,
  combo: 0,
  maxCombo: 0,
  difficultyLevel: 1,
  isPaused: false,
  setGameState: (state) => set({ gameState: state }),
  setPaused: (paused) => set({ isPaused: paused }),
  resetGame: () =>
    set({ 
      score: 0, 
      hype: 100, 
      speed: 0.5, 
      gameState: 'PLAYING', 
      combo: 0,
      difficultyLevel: 1,
      isPaused: false
    }),
  addScore: (points) =>
    set((state) => {
      const newCombo = state.combo + 1;
      const multiplier = Math.min(Math.floor(newCombo / 5) + 1, 5);
      const finalPoints = points * multiplier;
      return {
        score: state.score + finalPoints,
        hype: Math.min(state.hype + 5, 100),
        combo: newCombo,
        maxCombo: Math.max(newCombo, state.maxCombo),
      };
    }),
  resetCombo: () => set({ combo: 0 }),
  increaseDifficulty: () => 
    set((state) => ({
      difficultyLevel: state.difficultyLevel + 1,
      speed: Math.min(state.speed + 0.1, 2.0),
    })),
  damage: (amount) => set((state) => ({ 
    hype: Math.max(state.hype - amount, 0),
    combo: 0, // Reset combo on damage
  })),
  updateHighscore: (score) =>
    set((state) => {
      const newHigh = Math.max(score, state.highScore);
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('db_highscore', String(newHigh));
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
  const { gameState, isPaused } = useGameStore();
  const playerRef = useRef(null);
  const touchX = useRef(0);
  const runTex = useLoader(THREE.TextureLoader, '/bull_run.png');

  // Handle touch/mouse input
  React.useEffect(() => {
    const handleTouch = (e) => {
      if (e.touches && e.touches[0]) {
        const touch = e.touches[0];
        touchX.current = (touch.clientX / window.innerWidth) * 2 - 1;
      }
    };

    const handleMouse = (e) => {
      touchX.current = (e.clientX / window.innerWidth) * 2 - 1;
    };

    window.addEventListener('touchmove', handleTouch, { passive: true });
    window.addEventListener('mousemove', handleMouse);

    return () => {
      window.removeEventListener('touchmove', handleTouch);
      window.removeEventListener('mousemove', handleMouse);
    };
  }, []);

  useFrame(({ mouse, clock }) => {
    if (gameState !== 'PLAYING' || !playerRef.current || isPaused) {
      return;
    }

    // Use touch input if available, fallback to mouse
    const inputX = touchX.current !== 0 ? touchX.current : mouse.x;
    const targetX = inputX * 6;
    
    // Smooth interpolation for better control
    playerRef.current.position.x += (targetX - playerRef.current.position.x) * 0.2;
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
        <circleGeometry args={[0.8, 16]} />
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
          metalness={0.8}
          roughness={0.3}
          emissive="orange"
          emissiveIntensity={0.4}
        />
      </mesh>
    );
  }

  return (
    <mesh ref={mesh} position={[0, 0.5, 0]}>
      <boxGeometry args={[1.5, 2, 0.5]} />
      <meshStandardMaterial color="#111" emissive="red" emissiveIntensity={0.2} />
    </mesh>
  );
};

const ObstacleManager = () => {
  const { 
    gameState, 
    addScore, 
    damage, 
    hype, 
    score, 
    setGameState, 
    updateHighscore,
    difficultyLevel,
    increaseDifficulty,
    resetCombo,
    isPaused,
    speed
  } = useGameStore();
  const [items, setItems] = useState([]);
  const [floatingTexts, setFloatingTexts] = useState([]);
  const lastSpawn = useRef(0);
  const itemIdCounter = useRef(0);
  const textIdCounter = useRef(0);
  const lastDifficultyUpdate = useRef(0);
  const touchX = useRef(0);

  // Get player position from touch/mouse
  React.useEffect(() => {
    const handleTouch = (e) => {
      if (e.touches && e.touches[0]) {
        const touch = e.touches[0];
        touchX.current = ((touch.clientX / window.innerWidth) * 2 - 1) * 6;
      }
    };
    window.addEventListener('touchmove', handleTouch, { passive: true });
    return () => window.removeEventListener('touchmove', handleTouch);
  }, []);

  useFrame((state, delta) => {
    if (gameState !== 'PLAYING' || isPaused) {
      return;
    }

    // Progressive difficulty every 500 points
    if (score - lastDifficultyUpdate.current >= 500) {
      lastDifficultyUpdate.current = score;
      increaseDifficulty();
    }

    // Dynamic spawn rate based on difficulty
    const spawnInterval = Math.max(0.4, 0.8 - (difficultyLevel * 0.05));
    const moveSpeed = 8 + (difficultyLevel * 0.5);

    setItems((prev) => {
      let updated = prev;

      // Spawn new item
      if (state.clock.elapsedTime - lastSpawn.current > spawnInterval) {
        lastSpawn.current = state.clock.elapsedTime;
        const type = Math.random() > 0.35 ? 'CHINA' : 'WALL';
        const lane = (Math.random() - 0.5) * 8;
        itemIdCounter.current += 1;
        updated = [...updated, { id: itemIdCounter.current, x: lane, z: -20, type, active: true }];
      }

      // Move items and check collisions
      return updated
        .map((item) => {
          const newZ = item.z + moveSpeed * delta;

          if (item.active && newZ > -1 && newZ < 1) {
            const playerX = touchX.current !== 0 ? touchX.current : state.mouse.x * 6;
            const dist = Math.abs(playerX - item.x);

            if (dist < 1.5) {
              if (item.type === 'CHINA') {
                addScore(100);
                
                // Haptic feedback (mobile)
                if (navigator.vibrate) {
                  navigator.vibrate(50);
                }

                // Add floating score text
                textIdCounter.current += 1;
                setFloatingTexts((prev) => [...prev, {
                  id: textIdCounter.current,
                  x: item.x,
                  z: newZ,
                  startTime: state.clock.elapsedTime,
                }]);
              } else {
                damage(30);
                resetCombo();
                
                // Stronger vibration for damage
                if (navigator.vibrate) {
                  navigator.vibrate([100, 50, 100]);
                }
              }

              return { ...item, active: false, z: newZ };
            }
          }

          return { ...item, z: newZ };
        })
        .filter((item) => item.z < 10);
    });

    // Update floating texts
    setFloatingTexts((prev) => 
      prev.filter((text) => state.clock.elapsedTime - text.startTime < 1.0)
    );

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
      
      {/* Reduced stars from 5000 to 500 for 90% performance gain */}
      <Stars radius={100} depth={50} count={500} factor={4} saturation={0} fade speed={2} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]}>
        {/* Reduced geometry complexity from 20x20 to 10x10 */}
        <planeGeometry args={[100, 100, 10, 10]} />
        <shaderMaterial ref={floorRef} args={[SynthwaveFloorShader]} transparent />
      </mesh>
    </>
  );
};

const Interface = () => {
  const { gameState, score, hype, highScore, combo, maxCombo, difficultyLevel, resetGame, setPaused, isPaused } = useGameStore();

  // Pause handler
  const handlePause = () => {
    if (gameState === 'PLAYING') {
      setPaused(!isPaused);
    }
  };

  // Keyboard controls
  React.useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
        handlePause();
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameState, isPaused]);

  if (gameState === 'MENU') {
    return (
      <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm">
        <h1 className="mb-4 -skew-x-12 bg-gradient-to-r from-yellow-400 to-red-600 bg-clip-text text-8xl font-black text-transparent">
          DUMB BULL
        </h1>
        <p className="mb-4 font-mono text-xl text-white">⚠️ SMASH CHINA. AVOID WALLS. KEEP THE HYPE UP. ⚠️</p>
        <div className="mb-8 text-center text-sm text-white/60">
          <p>🎮 Use mouse or touch to move</p>
          <p>💎 Gold = Points | 🧱 Walls = Damage</p>
          <p>🔥 Build combos for multipliers (max 5x)</p>
          <p>⏸️ Press ESC or P to pause</p>
        </div>
        <button
          onClick={resetGame}
          className="skew-x-[-10deg] rounded-sm bg-yellow-500 px-12 py-4 text-2xl font-black text-black transition-transform hover:scale-105 hover:bg-yellow-400"
        >
          START RAMPAGE
        </button>
        {highScore > 0 && (
          <p className="mt-4 text-white/70">High Score: ${highScore}</p>
        )}
      </div>
    );
  }

  if (gameState === 'GAMEOVER') {
    return (
      <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-red-900/90">
        <h2 className="mb-2 text-6xl font-black text-white">CRASHED OUT</h2>
        <div className="mb-4 text-4xl font-bold text-yellow-400">SCORE: ${score}</div>
        {maxCombo > 5 && <p className="mb-2 text-white/90">Max Combo: {maxCombo}x 🔥</p>}
        <p className="mb-8 text-white/70">High Score: ${highScore}</p>
        <button 
          onClick={resetGame} 
          className="rounded bg-yellow-500 px-8 py-3 text-xl font-bold text-black transition-transform hover:scale-105 hover:bg-yellow-400"
        >
          PLAY AGAIN
        </button>
      </div>
    );
  }

  if (isPaused) {
    return (
      <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm">
        <h2 className="mb-4 text-5xl font-black text-white">PAUSED</h2>
        <p className="mb-8 text-white/70">Press ESC or P to resume</p>
        <button 
          onClick={handlePause}
          className="rounded bg-yellow-500 px-8 py-3 text-xl font-bold text-black transition-transform hover:scale-105 hover:bg-yellow-400"
        >
          RESUME
        </button>
      </div>
    );
  }

  const comboMultiplier = Math.min(Math.floor(combo / 5) + 1, 5);

  return (
    <div className="pointer-events-none absolute left-0 top-0 flex w-full justify-between p-6">
      <div>
        <div className="text-xs font-bold tracking-widest text-gray-500">DAMAGE DEALT</div>
        <div className="text-5xl font-black text-white" style={{ textShadow: '4px 4px 0 #000' }}>
          ${score}
        </div>
        {combo > 0 && (
          <div className="mt-2">
            <div className="text-2xl font-bold text-yellow-400">
              {combo}x COMBO {comboMultiplier > 1 && `(${comboMultiplier}x POINTS)`}
            </div>
          </div>
        )}
        <div className="mt-1 text-xs text-gray-400">Level {difficultyLevel}</div>
      </div>
      <div className="w-64">
        <div className="mb-1 flex justify-between">
          <div className="text-xs font-bold tracking-widest text-gray-500">HYPE METER</div>
          <button 
            onClick={handlePause}
            className="pointer-events-auto text-xs text-white/50 hover:text-white"
          >
            ⏸️ PAUSE
          </button>
        </div>
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
      <Canvas 
        dpr={[1, 2]} 
        performance={{ min: 0.5 }}
        gl={{ 
          antialias: false,
          powerPreference: 'high-performance',
          alpha: false,
          stencil: false,
          depth: true
        }}
      >
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
