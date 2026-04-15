"use client";

import { useRef, useState, useMemo, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Float, ContactShadows, Center } from "@react-three/drei";
import * as THREE from "three";
import { useSpring, animated } from "@react-spring/three";

type CreeperState = "IDLE" | "FUSE" | "EXPLODING" | "DEAD";

function ProceduralCreeper({ onExplode }: { onExplode: () => void }) {
  const headRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);
  const [state, setState] = useState<CreeperState>("IDLE");

  // Procedural 8x8 Pixel-Perfect Texture
  const creeperTexture = useMemo(() => {
    const size = 8;
    const data = new Uint8Array(size * size * 4);

    // Lighter, more vibrant Creeper greens with heavily weighted probabilities (less white)
    const colors = [
      new THREE.Color("#D0F0C0"), // Very pale highlight (Reduced Chance)
      new THREE.Color("#98FB98"), // Light lime green
      new THREE.Color("#5CD65C"), // Bright Base green
      new THREE.Color("#5CD65C"), // Bright Base green
      new THREE.Color("#5CD65C"), // Bright Base green 
      new THREE.Color("#339933"), // Soft shadow
      new THREE.Color("#339933")  // Soft shadow
    ];

    for (let i = 0; i < size * size; i++) {
       // Deterministic seeded randomness (shifted seed for a new constant pattern)
       const rand = Math.sin((i + 42) * 54.321) * 98765.4321;
       const seed = Math.abs(rand % 1); // strictly ensures uniform positive 0-1 distribution
       
       const color = colors[Math.floor(seed * colors.length)];
       data[i * 4] = color.r * 255;
       data[i * 4 + 1] = color.g * 255;
       data[i * 4 + 2] = color.b * 255;
       data[i * 4 + 3] = 255;
    }

    const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
    tex.magFilter = THREE.NearestFilter;
    tex.minFilter = THREE.NearestFilter;
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.needsUpdate = true;
    return tex;
  }, []);

  const topGrassTexture = useMemo(() => {
    const size = 16;
    const data = new Uint8Array(size * size * 4);
    for (let i = 0; i < size * size; i++) {
       const rand = Math.sin((i + 142) * 54.321) * 98765.4321;
       const seed = Math.abs(rand % 1);
       const isSpeck = seed > 0.95;
       const color = isSpeck ? new THREE.Color("#6db040") : new THREE.Color("#7ebd4b");
       data[i * 4] = color.r * 255; data[i * 4 + 1] = color.g * 255; data[i * 4 + 2] = color.b * 255; data[i * 4 + 3] = 255;
    }
    const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
    tex.magFilter = THREE.NearestFilter; tex.minFilter = THREE.NearestFilter; tex.colorSpace = THREE.SRGBColorSpace; tex.needsUpdate = true;
    return tex;
  }, []);

  const dirtTexture = useMemo(() => {
    const size = 16;
    const data = new Uint8Array(size * size * 4);
    const brown = new THREE.Color("#866043");
    const grey = new THREE.Color("#959595");
    const darkBrown = new THREE.Color("#684a32");
    for (let i = 0; i < size * size; i++) {
       const rand = Math.sin((i + 242) * 54.321) * 98765.4321;
       const seed = Math.abs(rand % 1);
       let color = brown;
       if (seed > 0.96) color = grey; // occasional grey rock
       else if (seed > 0.75) color = darkBrown; // shadow dirt

       data[i * 4] = color.r * 255; data[i * 4 + 1] = color.g * 255; data[i * 4 + 2] = color.b * 255; data[i * 4 + 3] = 255;
    }
    const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
    tex.magFilter = THREE.NearestFilter; tex.minFilter = THREE.NearestFilter; tex.colorSpace = THREE.SRGBColorSpace; tex.needsUpdate = true;
    return tex;
  }, []);

  const sideGrassTexture = useMemo(() => {
    const size = 16;
    const data = new Uint8Array(size * size * 4);
    const brown = new THREE.Color("#9b7653");
    const grey = new THREE.Color("#959595");
    const darkBrown = new THREE.Color("#825b3e");
    
    // Exact drip pattern from top (0) to bottom (15)
    const grassMask = [
      1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1, // Y=0
      1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,
      1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,
      1,1,0,1,1,1,1,0,1,1,1,0,1,1,1,1,
      1,0,0,1,1,1,0,0,1,1,0,0,0,1,1,1,
      0,0,0,0,1,1,0,0,0,1,0,0,0,0,1,0,
      0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,
      0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
      0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
      0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
      0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
      0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
      0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
      0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
      0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
      0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0, // Y=15
    ];

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
         const i = y * size + x;
         const mapY = 15 - y; // DataTexture Y=0 is bottom
         const isGrass = grassMask[mapY * size + x] === 1;

         let color;
         const rand = Math.sin((i + 342) * 54.321) * 98765.4321;
         const seed = Math.abs(rand % 1);

         if (isGrass) {
             const isSpeck = seed > 0.95;
             color = isSpeck ? new THREE.Color("#6db040") : new THREE.Color("#7ebd4b");
         } else {
             color = brown;
             if (seed > 0.96) color = grey; 
             else if (seed > 0.75) color = darkBrown; 
         }

         data[i * 4] = color.r * 255; data[i * 4 + 1] = color.g * 255; data[i * 4 + 2] = color.b * 255; data[i * 4 + 3] = 255;
      }
    }
    const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
    tex.magFilter = THREE.NearestFilter; tex.minFilter = THREE.NearestFilter; tex.colorSpace = THREE.SRGBColorSpace; tex.needsUpdate = true;
    return tex;
  }, []);

  const { scale, emissiveIntensity } = useSpring({
    scale: state === "EXPLODING" ? [1.6, 1.2, 1.6] : state === "FUSE" ? [1.15, 1.10, 1.15] : [1, 1, 1],
    emissiveIntensity: state === "EXPLODING" ? 1.0 : state === "FUSE" ? 0.3 : 0,
    config: { tension: state === "EXPLODING" ? 400 : 300, friction: 15 },
  });

  const pointerRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      pointerRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointerRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("pointermove", handlePointerMove);
    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, []);

  useFrame(() => {
    if (state === "IDLE" && headRef.current) {
      // Use window-relative pointer to prevent extreme rotations when scrolling the canvas vertically
      // Multiply by 2 to restore sensitivity since window coords are wider than canvas coords
      const clampedX = Math.max(-1.5, Math.min(1.5, pointerRef.current.x * 2));
      const clampedY = Math.max(-1.5, Math.min(1.5, pointerRef.current.y * 2));

      const targetY = (clampedX * Math.PI) / 3;
      const targetX = - (clampedY * Math.PI) / 6;
      headRef.current.rotation.y = THREE.MathUtils.lerp(headRef.current.rotation.y, targetY, 0.08);
      headRef.current.rotation.x = THREE.MathUtils.lerp(headRef.current.rotation.x, targetX, 0.08);

      const targetZ = -clampedX * 0.25;
      headRef.current.rotation.z = THREE.MathUtils.lerp(headRef.current.rotation.z, targetZ, 0.08);
    }
  });

  const handleSingleClick = (e: any) => {
    e.stopPropagation();
    if (state === "IDLE") {
      setState("FUSE");
      setTimeout(() => {
        setState((prev) => prev === "FUSE" ? "IDLE" : prev);
      }, 300);
    }
  };

  const handleDoubleClick = (e: any) => {
    e.stopPropagation();
    if (state !== "DEAD") {
      setState("EXPLODING");
      setTimeout(() => {
        setState("DEAD");
        onExplode();

        setTimeout(() => {
          setState("IDLE");
        }, 3000);
      }, 150);
    }
  };

  const isVisible = state !== "DEAD";

  const creeperMaterialProps = {
    map: creeperTexture,
    roughness: 1.0,
    metalness: 0.0,
    emissive: new THREE.Color(0xffffff),
  };

  const faceMaterial = <meshStandardMaterial color="#111111" roughness={1.0} />;

  return (
    <group
      onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { document.body.style.cursor = 'auto'; }}
      onClick={handleSingleClick}
      onDoubleClick={handleDoubleClick}
      rotation-y={Math.PI / 6}
      rotation-x={0.1}
    >
      <Center>
        <mesh position={[0, -0.5, 0]} castShadow receiveShadow>
          <boxGeometry args={[3, 1, 3]} />
          <meshStandardMaterial attach="material-0" map={sideGrassTexture} roughness={1} />
          <meshStandardMaterial attach="material-1" map={sideGrassTexture} roughness={1} />
          <meshStandardMaterial attach="material-2" map={topGrassTexture} roughness={1} />
          <meshStandardMaterial attach="material-3" map={dirtTexture} roughness={1} />
          <meshStandardMaterial attach="material-4" map={sideGrassTexture} roughness={1} />
          <meshStandardMaterial attach="material-5" map={sideGrassTexture} roughness={1} />
        </mesh>

        <animated.group
          visible={isVisible}
          scale={scale as any}
        >
          <group ref={bodyRef} position={[0, 0, 0]}>
            <mesh position={[-0.25, 0.375, 0.25]} castShadow receiveShadow>
              <boxGeometry args={[0.5, 0.75, 0.5]} />
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              <animated.meshStandardMaterial {...(creeperMaterialProps as any)} emissiveIntensity={emissiveIntensity} />
            </mesh>
            <mesh position={[0.25, 0.375, 0.25]} castShadow receiveShadow>
              <boxGeometry args={[0.5, 0.75, 0.5]} />
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              <animated.meshStandardMaterial {...(creeperMaterialProps as any)} emissiveIntensity={emissiveIntensity} />
            </mesh>
            <mesh position={[-0.25, 0.375, -0.25]} castShadow receiveShadow>
              <boxGeometry args={[0.5, 0.75, 0.5]} />
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              <animated.meshStandardMaterial {...(creeperMaterialProps as any)} emissiveIntensity={emissiveIntensity} />
            </mesh>
            <mesh position={[0.25, 0.375, -0.25]} castShadow receiveShadow>
              <boxGeometry args={[0.5, 0.75, 0.5]} />
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              <animated.meshStandardMaterial {...(creeperMaterialProps as any)} emissiveIntensity={emissiveIntensity} />
            </mesh>

            <mesh position={[0, 1.5, 0]} castShadow receiveShadow>
              <boxGeometry args={[1, 1.5, 0.5]} />
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              <animated.meshStandardMaterial {...(creeperMaterialProps as any)} emissiveIntensity={emissiveIntensity} />
            </mesh>
          </group>

          <group ref={headRef} position={[0, 2.25, 0]}>
            <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
              <boxGeometry args={[1, 1, 1]} />
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              <animated.meshStandardMaterial {...(creeperMaterialProps as any)} emissiveIntensity={emissiveIntensity} />

              <group position={[0, 0, 0.505]}>
                <mesh position={[-0.25, 0.125, 0]}><boxGeometry args={[0.25, 0.25, 0.01]} />{faceMaterial}</mesh>
                <mesh position={[0.25, 0.125, 0]}><boxGeometry args={[0.25, 0.25, 0.01]} />{faceMaterial}</mesh>
                <mesh position={[0, -0.1875, 0]}><boxGeometry args={[0.25, 0.375, 0.01]} />{faceMaterial}</mesh>
                <mesh position={[-0.1875, -0.3125, 0]}><boxGeometry args={[0.125, 0.375, 0.01]} />{faceMaterial}</mesh>
                <mesh position={[0.1875, -0.3125, 0]}><boxGeometry args={[0.125, 0.375, 0.01]} />{faceMaterial}</mesh>
              </group>
            </mesh>
          </group>
        </animated.group>
      </Center>
    </group>
  );
}

function Particles({ active }: { active: boolean }) {
  const crescentCount = 6;  // Barely any crescents per the request
  const debrisCount = 60;   // More individual loose particulates

  const meshCrescent = useRef<THREE.InstancedMesh>(null);
  const meshDebris = useRef<THREE.InstancedMesh>(null);

  const [dummy] = useState(() => new THREE.Object3D());
  const [time, setTime] = useState(0);

  // High-fidelity procedural crescent smoke (Perfect Pixel-Art Crescent Moon)
  const smokeTexture = useMemo(() => {
    const size = 16;
    const data = new Uint8Array(size * size * 4);

    const crescentShape = [
      0,0,0,0,0, 1,1,1,1,1, 0,0,0,0,0,0,
      0,0,0,1,1, 1,1,1,1,1, 1,1,0,0,0,0,
      0,0,1,1,1, 1,1,0,0,1, 1,1,1,0,0,0,
      0,1,1,1,1, 0,0,0,0,0, 0,1,1,1,0,0,
      0,1,1,1,0, 0,0,0,0,0, 0,0,1,1,0,0,
      1,1,1,0,0, 0,0,0,0,0, 0,0,0,1,0,0,
      1,1,1,0,0, 0,0,0,0,0, 0,0,0,0,0,0,
      1,1,1,0,0, 0,0,0,0,0, 0,0,0,0,0,0,
      1,1,1,0,0, 0,0,0,0,0, 0,0,0,0,0,0,
      1,1,1,0,0, 0,0,0,0,0, 0,0,0,1,0,0,
      0,1,1,1,0, 0,0,0,0,0, 0,0,1,1,0,0,
      0,1,1,1,1, 0,0,0,0,0, 0,1,1,1,0,0,
      0,0,1,1,1, 1,1,0,0,1, 1,1,1,0,0,0,
      0,0,0,1,1, 1,1,1,1,1, 1,1,0,0,0,0,
      0,0,0,0,0, 1,1,1,1,1, 0,0,0,0,0,0,
      0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0,0,
    ];

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const i = (y * size + x) * 4;

        if (crescentShape[y * size + x] === 1) {
          const light = Math.random() > 0.5;
          data[i] = light ? 211 : 128;
          data[i + 1] = light ? 211 : 128;
          data[i + 2] = light ? 211 : 128;
          data[i + 3] = 255;
        } else {
          data[i + 3] = 0;
        }
      }
    }
    const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
    tex.magFilter = THREE.NearestFilter;
    tex.minFilter = THREE.NearestFilter;
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.needsUpdate = true;
    return tex;
  }, []);

  // Simple procedural dusty particulate
  const debrisTexture = useMemo(() => {
    const size = 2; // Flat 2x2 grid representing debris scale chunks
    const data = new Uint8Array(size * size * 4);
    for (let i = 0; i < 4; i++) {
      const light = Math.random() > 0.5;
      data[i * 4] = light ? 211 : 128;
      data[i * 4 + 1] = light ? 211 : 128;
      data[i * 4 + 2] = light ? 211 : 128;
      data[i * 4 + 3] = 255;
    }
    const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
    tex.magFilter = THREE.NearestFilter;
    tex.minFilter = THREE.NearestFilter;
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.needsUpdate = true;
    return tex;
  }, []);

  const [crescents] = useState(() => Array.from({ length: crescentCount }, () => ({
    pos: new THREE.Vector3(),
    vel: new THREE.Vector3(),
    angVel: 0,
    rot: 0,
    baseScale: 1
  })));

  const [debris] = useState(() => Array.from({ length: debrisCount }, () => ({
    pos: new THREE.Vector3(),
    vel: new THREE.Vector3(),
    angVel: 0,
    rot: 0,
    baseScale: 1
  })));

  // Simulation Spawn Trigger
  useEffect(() => {
    if (active) {
      setTime(0); // Restart physics clock

      const resetPart = (arr: any[], speedMult: number, scaleRange: [number, number]) => {
        arr.forEach(p => {
          p.pos.set(0, 1.5, 0); // Burst directly from torso height

          // Calculate a dense spherical velocity spray
          const phi = Math.random() * Math.PI * 2;
          const costheta = Math.random() * 2 - 1;
          const u = Math.random();
          const theta = Math.acos(costheta);
          const r = speedMult * Math.cbrt(u);

          p.vel.set(
            r * Math.sin(theta) * Math.cos(phi),
            r * Math.sin(theta) * Math.sin(phi),
            r * Math.cos(theta)
          );

          // Boost core Y velocity bounds for a puff rather than true ball
          p.vel.y += speedMult * 0.4;

          p.angVel = (Math.random() - 0.5) * 0.5; // Local Z rotational translation factor
          p.rot = Math.random() * Math.PI * 2;
          p.baseScale = scaleRange[0] + Math.random() * (scaleRange[1] - scaleRange[0]);
        });
      };

      // Crescents: Kept tight mapping close to the origin with low thrust
      resetPart(crescents, 0.3, [0.6, 1.2]);
      // Debris: Tiny individual chunks flying far
      resetPart(debris, 0.9, [0.08, 0.25]);
    }
  }, [active, crescents, debris]);

  // Simulation Lifecycle Runtime
  useFrame((state, delta) => {
    if (!active || !meshCrescent.current || !meshDebris.current) return;

    setTime(t => t + delta);

    // Bounds restricted to exactly 1.5 seconds representation parameter
    const normalizedTime = Math.min(time / 1.5, 1);

    // The Scale Tween: Jump outwards vastly during first 10% representation, shrink slowly
    let scaleMult = 1;
    if (normalizedTime < 0.1) {
      scaleMult = 1 + (normalizedTime / 0.1);
    } else {
      scaleMult = 2 - ((normalizedTime - 0.1) / 0.9);
    }

    // Smooth opacity burnaway starting roughly mid-curve
    const opacityBurn = normalizedTime > 0.4 ? 1 - ((normalizedTime - 0.4) / 0.6) : 1;

    // Update structural material opacities efficiently
    (meshCrescent.current.material as THREE.MeshBasicMaterial).opacity = Math.max(opacityBurn, 0);
    (meshDebris.current.material as THREE.MeshBasicMaterial).opacity = Math.max(opacityBurn, 0);

    const applyPhysics = (arr: any[], meshObj: THREE.InstancedMesh, doRotate: boolean) => {
      arr.forEach((p, i) => {
        // Drag modifier algorithm (multiplying standard curve slows rapidly)
        p.vel.multiplyScalar(0.93);
        p.pos.add(p.vel);

        if (doRotate) p.rot += p.angVel;

        dummy.position.copy(p.pos);

        // Strict Camera Billboarding lock mechanism
        dummy.rotation.copy(state.camera.rotation);
        // Layering Z orientation locally to prevent 3d clipping
        if (doRotate) dummy.rotateZ(p.rot);
        
        dummy.scale.setScalar(p.baseScale * scaleMult);

        dummy.updateMatrix();
        meshObj.setMatrixAt(i, dummy.matrix);
      });
      meshObj.instanceMatrix.needsUpdate = true;
    };

    applyPhysics(crescents, meshCrescent.current, true); // Crescents rotate wildly
    applyPhysics(debris, meshDebris.current, false);   // Dust particulates lock rotation
  });

  return (
    <group visible={active && time < 1.5}>
      <instancedMesh ref={meshCrescent} args={[undefined, undefined, crescentCount]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial map={smokeTexture} transparent opacity={1} depthWrite={false} color="#f0f0f0" />
      </instancedMesh>

      <instancedMesh ref={meshDebris} args={[undefined, undefined, debrisCount]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial map={debrisTexture} transparent opacity={1} depthWrite={false} color="#e0e0e0" />
      </instancedMesh>
    </group>
  );
}

export function InteractiveCreeper({ onExplode }: { onExplode?: () => void }) {
  const [explosionCloud, setExplosionCloud] = useState(false);

  const triggerExplosion = () => {
    setExplosionCloud(true);
    onExplode?.();
    // Component lifecycle unmount bounds (Cloud handles it organically, but standard boundary clears after 1.6)
    setTimeout(() => setExplosionCloud(false), 1600);
  };

  return (
    <div 
      className={`relative w-full h-[500px] flex items-center justify-center`}
      style={{ position: "relative", transform: "translateZ(0)" }}
    >
      <div className="absolute top-4 left-4 z-10 font-pixel text-zinc-500/60 text-xs pointer-events-none select-none tracking-widest animate-pulse">
        try clicking on the creeper....
      </div>
      <Canvas 
        shadows 
        camera={{ position: [0, 4, 12], fov: 40 }}
        eventPrefix="client"
      >
        <ambientLight intensity={1.2} />
        <directionalLight position={[10, 10, 10]} intensity={2.5} castShadow />
        <Environment preset="city" />

        <Float speed={2.5} rotationIntensity={0.1} floatIntensity={0.4}>
          <ProceduralCreeper onExplode={triggerExplosion} />
        </Float>

        <ContactShadows resolution={512} position={[0, -2.5, 0]} opacity={0.6} scale={15} blur={2.5} far={4} />
        <Particles active={explosionCloud} />
      </Canvas>
    </div>
  );
}
