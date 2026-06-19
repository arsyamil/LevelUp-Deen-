"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ShopItem {
  id: string;
  name: string;
  itemType: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  priceCoin: number;
  unlockLevel: number;
  description: string;
  owned: boolean;
  equipped: boolean;
}

const rarityBadge: Record<string, "default" | "brand" | "success" | "danger" | "muted"> = {
  common: "muted",
  rare: "brand",
  epic: "success",
  legendary: "danger",
};

// SVG Renderer for the Avatar
function AvatarGraphic({ equippedItems }: { equippedItems: ShopItem[] }) {
  // Determine parts based on equipped items. We map itemType to a visual choice.
  // Defaults
  const headColor = "#FFCDB2"; // skin tone
  let shirtColor = "#4A5568"; // default shirt
  let accessory = null;
  let bgGradient = ["#e2e8f0", "#cbd5e1"]; // default bg

  equippedItems.forEach((item) => {
    const type = item.itemType.toLowerCase();
    const name = item.name.toLowerCase();

    if (type === "headwear" || type === "head") {
      if (name.includes("peci") || name.includes("kopiah")) {
        accessory = "peci";
      } else if (name.includes("sorban")) {
        accessory = "sorban";
      } else if (name.includes("hijab") || name.includes("kerudung")) {
        accessory = "hijab";
      } else if (name.includes("mahkota")) {
        accessory = "crown";
      }
    } else if (type === "body" || type === "clothing") {
      if (name.includes("koko")) shirtColor = "#FFFFFF";
      if (name.includes("jubah")) shirtColor = "#1A202C";
      if (name.includes("gamis")) shirtColor = "#E2E8F0";
      if (name.includes("epic")) shirtColor = "#805AD5";
      if (name.includes("legendary")) shirtColor = "#D69E2E";
    } else if (type === "background" || type === "aura") {
      if (item.rarity === "legendary") bgGradient = ["#F6E05E", "#D69E2E"];
      else if (item.rarity === "epic") bgGradient = ["#B794F4", "#805AD5"];
      else if (item.rarity === "rare") bgGradient = ["#63B3ED", "#3182CE"];
    }
  });

  return (
    <svg viewBox="0 0 100 100" className="h-full w-full rounded-full overflow-hidden border-2 border-line bg-gradient-to-br" style={{ backgroundImage: `linear-gradient(to bottom right, ${bgGradient[0]}, ${bgGradient[1]})` }}>
      {/* Body / Shoulders */}
      <path d="M 20 100 Q 50 60 80 100 Z" fill={shirtColor} stroke="#cbd5e1" strokeWidth="2" />
      
      {/* Head */}
      <circle cx="50" cy="45" r="22" fill={headColor} />
      
      {/* Face (Eyes & Smile) */}
      <circle cx="41" cy="42" r="2.5" fill="#4A5568" />
      <circle cx="59" cy="42" r="2.5" fill="#4A5568" />
      <path d="M 43 51 Q 50 58 57 51" fill="none" stroke="#4A5568" strokeWidth="2" strokeLinecap="round" />

      {/* Accessories */}
      {accessory === "peci" && (
        <path d="M 28 30 Q 50 15 72 30 L 70 38 Q 50 35 30 38 Z" fill="#1A202C" />
      )}
      {accessory === "sorban" && (
        <>
          <path d="M 25 35 Q 50 10 75 35 L 80 50 Q 50 25 20 50 Z" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />
          <path d="M 20 50 Q 25 70 30 90 Q 20 70 15 50 Z" fill="#FFFFFF" />
        </>
      )}
      {accessory === "hijab" && (
        <path d="M 24 35 Q 50 15 76 35 L 82 70 Q 50 90 18 70 Z" fill="#2D3748" />
      )}
      {accessory === "crown" && (
        <path d="M 25 35 L 35 15 L 50 25 L 65 15 L 75 35 Z" fill="#ECC94B" />
      )}
    </svg>
  );
}

export function InteractiveAvatar() {
  const [items, setItems] = useState<ShopItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);

  const fetchAvatar = useCallback(async () => {
    try {
      const res = await fetch("/api/avatar");
      if (!res.ok) return;
      const json = await res.json();
      setItems(json.items ?? []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAvatar();
  }, [fetchAvatar]);

  async function handleEquip(itemId: string, equip: boolean) {
    setActionId(itemId);
    try {
      const res = await fetch("/api/avatar", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, equip }),
      });
      if (res.ok) {
        await fetchAvatar();
      }
    } finally {
      setActionId(null);
    }
  }

  if (loading) {
    return <div className="h-20 w-20 animate-pulse rounded-full bg-bg-soft border-2 border-line" />;
  }

  const equipped = items.filter((i) => i.equipped);
  const owned = items.filter((i) => i.owned);

  return (
    <>
      <button 
        onClick={() => setIsModalOpen(true)}
        className="group relative h-20 w-20 shrink-0 transition-transform hover:scale-105 hover:shadow-lg focus:outline-none rounded-full"
        title="Sesuaikan Avatar"
      >
        <AvatarGraphic equippedItems={equipped} />
        {/* Hover overlay hint */}
        <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 transition-opacity flex items-center justify-center group-hover:opacity-100">
          <span className="text-white text-[10px] font-bold uppercase tracking-wider">Ubah</span>
        </div>
      </button>

      {/* Customizer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <Card className="w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-line p-4">
              <h2 className="text-lg font-semibold">Sesuaikan Avatar</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-text-dim hover:text-text focus:outline-none"
              >
                ✕
              </button>
            </div>
            
            <div className="p-4 flex flex-col items-center gap-4 border-b border-line bg-bg-soft/50">
              <div className="h-32 w-32 shadow-inner rounded-full p-1 bg-bg">
                <AvatarGraphic equippedItems={equipped} />
              </div>
              <p className="text-sm text-text-dim text-center">
                Visual avatarmu akan berubah sesuai dengan item yang kamu pakai. Kumpulkan koin untuk membuka item legendaris!
              </p>
            </div>

            <div className="max-h-[50vh] overflow-y-auto p-4 space-y-3">
              {owned.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-text-dim mb-2">Kamu belum memiliki item kosmetik.</p>
                  <Button variant="secondary" size="sm" onClick={() => { setIsModalOpen(false); window.location.href = '/avatar'; }}>
                    Ke Toko Avatar
                  </Button>
                </div>
              ) : (
                owned.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-3 rounded-lg border border-line bg-bg p-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs uppercase tracking-wide text-text-dim">{item.itemType}</p>
                      <h3 className="truncate font-semibold text-sm">{item.name}</h3>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={rarityBadge[item.rarity] || "default"}>{item.rarity}</Badge>
                      <Button
                        size="sm"
                        variant={item.equipped ? "ghost" : "primary"}
                        loading={actionId === item.id}
                        onClick={() => handleEquip(item.id, !item.equipped)}
                      >
                        {item.equipped ? "Lepas" : "Pakai"}
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <div className="border-t border-line p-4 flex justify-end bg-bg-soft/50">
              <Button onClick={() => setIsModalOpen(false)}>Selesai</Button>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}
