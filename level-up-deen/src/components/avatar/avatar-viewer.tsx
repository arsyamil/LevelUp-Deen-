"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Text, RoundedBox, Float, Stars } from "@react-three/drei";
import * as THREE from "three";

interface EquippedItem {
  id: string;
  item: {
    id: string;
    name: string;
    item_type: string;
    rarity: string;
    model_url: string | null;
    gender_restriction: string;
  } | null;
}

// ── Simple 3D Avatar Character ──
function AvatarCharacter({ equipped }: { equipped: EquippedItem[] }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      // Gentle idle animation
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.15;
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.2) * 0.05;
    }
  });

  const headwear = equipped.find((e) => e.item?.item_type === "headwear");
  const outfit = equipped.find((e) => e.item?.item_type === "outfit");
  const accessory = equipped.find((e) => e.item?.item_type === "accessory");

  // Color mapping based on rarity
  const rarityColor: Record<string, string> = {
    common: "#94a3b8",
    rare: "#6366f1",
    epic: "#10b981",
    legendary: "#f59e0b",
  };

  const outfitColor = outfit ? rarityColor[outfit.item?.rarity ?? "common"] : "#6366f1";
  const headwearColor = headwear ? rarityColor[headwear.item?.rarity ?? "common"] : null;
  
  const outfitName = outfit?.item?.name.toLowerCase() || "";
  const headwearName = headwear?.item?.name.toLowerCase() || "";
  
  const isGamis = outfitName.includes("gamis") || outfitName.includes("jubah") || outfitName.includes("abaya");
  const isPeci = headwearName.includes("peci") || headwearName.includes("sorban");
  const isHijab = headwearName.includes("hijab") || headwearName.includes("khimar") || headwearName.includes("pashmina");

  return (
    <group ref={groupRef}>
      {/* Body */}
      <RoundedBox 
        args={isGamis ? [0.8, 2.2, 0.5] : [0.8, 1.2, 0.5]} 
        radius={0.1} 
        position={isGamis ? [0, -0.5, 0] : [0, 0, 0]}
      >
        <meshStandardMaterial color={outfitColor} roughness={0.4} metalness={0.1} />
      </RoundedBox>

      {/* Head */}
      <mesh position={[0, 0.95, 0]}>
        <sphereGeometry args={[0.35, 32, 32]} />
        <meshStandardMaterial color="#e8d5b7" roughness={0.6} />
      </mesh>

      {/* Eyes */}
      <mesh position={[-0.1, 1.0, 0.3]}>
        <sphereGeometry args={[0.04, 16, 16]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
      <mesh position={[0.1, 1.0, 0.3]}>
        <sphereGeometry args={[0.04, 16, 16]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>

      {/* Smile */}
      <mesh position={[0, 0.88, 0.32]} rotation={[0.2, 0, 0]}>
        <torusGeometry args={[0.06, 0.015, 8, 16, Math.PI]} />
        <meshStandardMaterial color="#c4846b" />
      </mesh>

      {/* Headwear */}
      {headwearColor && (
        isPeci ? (
          <mesh position={[0, 1.25, 0]}>
            <cylinderGeometry args={[0.3, 0.32, 0.25, 32]} />
            <meshStandardMaterial color={headwearColor} roughness={0.9} />
          </mesh>
        ) : isHijab ? (
          <mesh position={[0, 0.95, -0.05]}>
            <sphereGeometry args={[0.38, 32, 32, 0, Math.PI * 2, 0, Math.PI / 1.5]} />
            <meshStandardMaterial color={headwearColor} roughness={0.8} />
          </mesh>
        ) : (
          <Float speed={2} floatIntensity={0.1}>
            <RoundedBox args={[0.7, 0.15, 0.55]} radius={0.05} position={[0, 1.3, 0]}>
              <meshStandardMaterial color={headwearColor} roughness={0.3} metalness={0.2} />
            </RoundedBox>
          </Float>
        )
      )}

      {/* Arms */}
      <RoundedBox args={[0.2, 0.8, 0.2]} radius={0.08} position={[-0.55, -0.1, 0]}>
        <meshStandardMaterial color={outfitColor} roughness={0.4} metalness={0.1} />
      </RoundedBox>
      <RoundedBox args={[0.2, 0.8, 0.2]} radius={0.08} position={[0.55, -0.1, 0]}>
        <meshStandardMaterial color={outfitColor} roughness={0.4} metalness={0.1} />
      </RoundedBox>

      {/* Legs (Hidden by Gamis) */}
      {!isGamis && (
        <>
          <RoundedBox args={[0.25, 0.7, 0.25]} radius={0.08} position={[-0.2, -0.95, 0]}>
            <meshStandardMaterial color="#334155" roughness={0.5} />
          </RoundedBox>
          <RoundedBox args={[0.25, 0.7, 0.25]} radius={0.08} position={[0.2, -0.95, 0]}>
            <meshStandardMaterial color="#334155" roughness={0.5} />
          </RoundedBox>
        </>
      )}

      {/* Accessory indicator (floating orb) */}
      {accessory && (
        <Float speed={3} floatIntensity={0.3}>
          <mesh position={[0.7, 0.5, 0]}>
            <sphereGeometry args={[0.1, 16, 16]} />
            <meshStandardMaterial
              color={rarityColor[accessory.item?.rarity ?? "common"]}
              emissive={rarityColor[accessory.item?.rarity ?? "common"]}
              emissiveIntensity={0.5}
              roughness={0.2}
              metalness={0.8}
            />
          </mesh>
        </Float>
      )}

      {/* Equipped item labels */}
      {headwear?.item && (
        <Text position={[0, 1.6, 0]} fontSize={0.08} color="#a78bfa" anchorX="center">
          {headwear.item.name}
        </Text>
      )}
      {outfit?.item && (
        <Text position={[0, isGamis ? -1.7 : -0.8, 0.4]} fontSize={0.07} color="#94a3b8" anchorX="center">
          {outfit.item.name}
        </Text>
      )}
    </group>
  );
}

// ── Background scene ──
function SceneBackground({ bgName }: { bgName: string | null }) {
  const bgColors: Record<string, [string, string]> = {
    "Sajadah Masjid": ["#1a1a2e", "#16213e"],
    "Pemandangan Ka'bah": ["#0f0c29", "#302b63"],
    "Langit Malam Cosmic": ["#0a0a23", "#1a0533"],
    "Taman Madinah": ["#0d1b2a", "#1b2838"],
  };

  const [top, bottom] = bgColors[bgName ?? ""] ?? ["#0f172a", "#1e1b4b"];

  return (
    <>
      <color attach="background" args={[top]} />
      <fog attach="fog" args={[bottom, 5, 15]} />
      {/* Ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.35, 0]}>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color={bottom} roughness={0.8} />
      </mesh>
      {/* Stars */}
      <Stars radius={10} depth={20} count={500} factor={4} saturation={0} fade speed={1} />
    </>
  );
}

export function AvatarViewer({ coachMode = false }: { coachMode?: boolean }) {
  const [equipped, setEquipped] = useState<EquippedItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEquipped = useCallback(async () => {
    try {
      const res = await fetch("/api/avatar/equipped");
      const json = await res.json();
      setEquipped(json.equipped ?? []);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEquipped();
  }, [fetchEquipped]);

  const bgItem = equipped.find((e) => e.item?.item_type === "background");
  const titleItem = equipped.find((e) => e.item?.item_type === "title");

  if (loading) {
    return (
      <div className={`flex ${coachMode ? "h-full w-full" : "h-[400px]"} items-center justify-center rounded-2xl border border-line bg-bg-soft`}>
        <p className="text-sm text-text-dim">Memuat avatar...</p>
      </div>
    );
  }

  return (
    <div className={coachMode ? "h-full w-full" : "space-y-3"}>
      {/* Title badge */}
      {!coachMode && titleItem?.item && (
        <div className="flex items-center justify-center gap-2 rounded-xl border border-brand/30 bg-brand/10 px-4 py-2">
          <span className="text-sm">🏅</span>
          <span className="text-sm font-semibold text-brand">{titleItem.item.name}</span>
        </div>
      )}

      {/* 3D Canvas */}
      <div className={`${coachMode ? "h-full w-full" : "h-[400px] border border-line bg-bg-soft"} overflow-hidden rounded-2xl`}>
        <Canvas camera={{ position: [0, 0.5, 3.5], fov: 45 }}>
          <Suspense fallback={null}>
            {!coachMode ? <SceneBackground bgName={bgItem?.item?.name ?? null} /> : <color attach="background" args={["#0f172a"]} />}
            <ambientLight intensity={0.6} />
            <directionalLight position={[5, 5, 5]} intensity={0.8} castShadow />
            <pointLight position={[-3, 2, 3]} intensity={0.4} color="#a78bfa" />
            <AvatarCharacter equipped={equipped} />
            <OrbitControls
              enableZoom={false}
              enablePan={false}
              minPolarAngle={Math.PI / 4}
              maxPolarAngle={Math.PI / 1.8}
            />
          </Suspense>
        </Canvas>
      </div>

      {/* Equipped items summary */}
      {!coachMode && equipped.length > 0 && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {equipped
            .filter((e) => e.item)
            .map((e) => (
              <div
                key={e.id}
                className="rounded-lg border border-line bg-bg-soft px-3 py-2 text-center"
              >
                <p className="text-[10px] uppercase tracking-wide text-text-dim">{e.item!.item_type}</p>
                <p className="mt-0.5 truncate text-xs font-medium">{e.item!.name}</p>
              </div>
            ))}
        </div>
      )}

      {!coachMode && equipped.length === 0 && (
        <p className="text-center text-sm text-text-dim">
          Belum ada item yang di-equip. Beli dan pakai item dari shop di bawah!
        </p>
      )}
    </div>
  );
}
