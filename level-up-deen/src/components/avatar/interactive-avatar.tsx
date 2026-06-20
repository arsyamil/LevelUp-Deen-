"use client";

import dynamic from "next/dynamic";
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

const AvatarViewer = dynamic(
  () => import("@/components/avatar/avatar-viewer").then((mod) => mod.AvatarViewer),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center rounded-full bg-bg-soft text-xs text-text-dim">
        Memuat
      </div>
    ),
  }
);

function AvatarPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-brand-soft via-bg-soft to-bg">
      <span className="text-lg font-semibold text-brand">LD</span>
    </div>
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
        window.dispatchEvent(new Event("avatar-updated"));
      }
    } finally {
      setActionId(null);
    }
  }

  if (loading) {
    return <div className="h-20 w-20 animate-pulse rounded-full bg-bg-soft border-2 border-line" />;
  }

  const owned = items.filter((i) => i.owned);

  return (
    <>
      <button 
        onClick={() => setIsModalOpen(true)}
        className="group relative h-20 w-20 shrink-0 transition-transform hover:scale-105 hover:shadow-lg focus:outline-none rounded-full"
        title="Sesuaikan Avatar"
      >
        <div className="h-full w-full overflow-hidden rounded-full border-2 border-brand/30 bg-bg-soft">
          <AvatarPreview />
        </div>
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
              <div className="h-32 w-32 shadow-inner rounded-full overflow-hidden border-2 border-brand/30 bg-bg-soft p-1 bg-bg">
                <AvatarViewer coachMode />
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
