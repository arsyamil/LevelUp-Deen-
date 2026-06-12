"use client";

import { useCallback, useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SkeletonCard } from "@/components/ui/skeleton";

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

const rarityBadge: Record<ShopItem["rarity"], "default" | "brand" | "success" | "danger" | "muted"> = {
  common: "muted",
  rare: "brand",
  epic: "success",
  legendary: "danger",
};

const rarityLabel: Record<ShopItem["rarity"], string> = {
  common: "Common",
  rare: "Rare",
  epic: "Epic",
  legendary: "Legendary",
};

export function AvatarShop() {
  const [items, setItems] = useState<ShopItem[]>([]);
  const [coins, setCoins] = useState(0);
  const [level, setLevel] = useState(1);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/avatar");
      if (!res.ok) throw new Error("Gagal memuat data.");
      const json = await res.json();
      setItems(json.items ?? []);
      setCoins(json.coins ?? 0);
      setLevel(json.level ?? 1);
    } catch {
      setMessage({ text: "Gagal memuat inventori.", type: "error" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  function showMsg(text: string, type: "success" | "error") {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  }

  async function handleBuy(itemId: string) {
    setActionId(itemId);
    try {
      const res = await fetch("/api/avatar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Gagal membeli item.");
      showMsg("Item berhasil dibeli!", "success");
      setCoins(json.coinsRemaining);
      await fetchData();
    } catch (err) {
      showMsg(err instanceof Error ? err.message : "Gagal membeli item.", "error");
    } finally {
      setActionId(null);
    }
  }

  async function handleEquip(itemId: string, equip: boolean) {
    setActionId(itemId);
    try {
      const res = await fetch("/api/avatar", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, equip }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Gagal mengubah equip.");
      showMsg(equip ? "Item dipakai!" : "Item dilepas.", "success");
      await fetchData();
    } catch (err) {
      showMsg(err instanceof Error ? err.message : "Gagal equip.", "error");
    } finally {
      setActionId(null);
    }
  }

  const owned = items.filter((i) => i.owned);
  const shop = items.filter((i) => !i.owned);

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {message && (
        <div
          className={`rounded-lg border p-3 text-sm ${
            message.type === "success"
              ? "border-success/30 bg-success/10 text-success"
              : "border-danger/30 bg-danger/10 text-danger"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Inventory section */}
      {owned.length > 0 && (
        <div>
          <h2 className="section-title mb-4">Inventori Kamu ({owned.length} item)</h2>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {owned.map((item) => (
              <Card key={item.id} className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs uppercase tracking-wide text-text-dim">{item.itemType}</p>
                    <h3 className="mt-1 truncate font-semibold">{item.name}</h3>
                    {item.description && (
                      <p className="mt-1 text-xs text-text-dim line-clamp-2">{item.description}</p>
                    )}
                  </div>
                  <Badge variant={rarityBadge[item.rarity]} className="shrink-0">
                    {rarityLabel[item.rarity]}
                  </Badge>
                </div>
                <div className="mt-3 flex items-center justify-between gap-2">
                  {item.equipped ? (
                    <Badge variant="brand">Equipped</Badge>
                  ) : (
                    <span />
                  )}
                  <Button
                    size="sm"
                    variant={item.equipped ? "ghost" : "primary"}
                    loading={actionId === item.id}
                    onClick={() => handleEquip(item.id, !item.equipped)}
                  >
                    {item.equipped ? "Lepas" : "Pakai"}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Shop section */}
      <div>
        <h2 className="section-title mb-4">
          {shop.length === 0
            ? "Semua item sudah dimiliki!"
            : `Toko (${shop.length} item tersedia)`}
        </h2>
        {shop.length === 0 && owned.length === 0 && (
          <Card className="p-5">
            <p className="text-sm text-text-dim">
              Belum ada item di toko. Admin perlu menambahkan item melalui database.
            </p>
          </Card>
        )}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {shop.map((item) => {
            const locked = level < item.unlockLevel;
            const cantAfford = coins < item.priceCoin;
            return (
              <Card key={item.id} className={`p-4 ${locked ? "opacity-60" : ""}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs uppercase tracking-wide text-text-dim">{item.itemType}</p>
                    <h3 className="mt-1 truncate font-semibold">{item.name}</h3>
                    {item.description && (
                      <p className="mt-1 text-xs text-text-dim line-clamp-2">{item.description}</p>
                    )}
                  </div>
                  <Badge variant={rarityBadge[item.rarity]} className="shrink-0">
                    {rarityLabel[item.rarity]}
                  </Badge>
                </div>
                <div className="mt-3 flex items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-brand">{item.priceCoin} coin</p>
                    {locked && (
                      <p className="text-xs text-text-dim">Level {item.unlockLevel} diperlukan</p>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="primary"
                    loading={actionId === item.id}
                    disabled={locked || cantAfford}
                    onClick={() => handleBuy(item.id)}
                    title={
                      locked
                        ? `Butuh level ${item.unlockLevel}`
                        : cantAfford
                        ? "Coin tidak cukup"
                        : undefined
                    }
                  >
                    Beli
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
