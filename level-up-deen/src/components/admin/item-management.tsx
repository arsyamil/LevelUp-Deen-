"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Item = {
  id: string;
  name: string;
  item_type: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  price_coin: number;
  unlock_level: number;
  gender_restriction: "male" | "female" | "unisex";
  description: string;
  model_url: string | null;
  is_active: boolean;
};

export function ItemManagement() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [formData, setFormData] = useState<Partial<Item>>({});

  useEffect(() => {
    fetchItems();
  }, []);

  async function fetchItems() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/items");
      if (!res.ok) throw new Error("Gagal memuat item");
      const json = await res.json();
      setItems(json.items ?? []);
    } catch (e: unknown) {
      if (e instanceof Error) setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function handleAdd() {
    setEditingItem(null);
    setFormData({
      name: "",
      item_type: "headwear",
      rarity: "common",
      price_coin: 50,
      unlock_level: 1,
      gender_restriction: "unisex",
      description: "",
      model_url: "",
      is_active: true,
    });
    setIsModalOpen(true);
  }

  function handleEdit(item: Item) {
    setEditingItem(item);
    setFormData({ ...item });
    setIsModalOpen(true);
  }

  async function handleDelete(id: string) {
    if (!confirm("Yakin ingin menghapus item ini?")) return;
    try {
      const res = await fetch(`/api/admin/items?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Gagal menghapus item");
      await fetchItems();
    } catch (e: unknown) {
      if (e instanceof Error) alert(e.message);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const method = editingItem ? "PATCH" : "POST";
      const payload = editingItem ? { id: editingItem.id, ...formData } : formData;

      const res = await fetch("/api/admin/items", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error ?? "Gagal menyimpan item");
      }

      setIsModalOpen(false);
      await fetchItems();
    } catch (e: unknown) {
      if (e instanceof Error) alert(e.message);
    }
  }

  if (loading) return <div className="animate-pulse h-32 bg-bg-soft rounded-2xl" />;

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Daftar Item Shop</h2>
        <Button onClick={handleAdd}>+ Tambah Item</Button>
      </div>

      {error && <p className="text-danger mb-4">{error}</p>}

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b border-line text-text-dim">
              <th className="py-3 pr-4 font-medium">Nama</th>
              <th className="py-3 px-4 font-medium">Tipe</th>
              <th className="py-3 px-4 font-medium">Rarity</th>
              <th className="py-3 px-4 font-medium">Harga/Lvl</th>
              <th className="py-3 px-4 font-medium">Gender</th>
              <th className="py-3 px-4 font-medium">Status</th>
              <th className="py-3 pl-4 font-medium text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-bg-soft/50 transition-colors">
                <td className="py-3 pr-4 font-medium">
                  {item.name}
                  <div className="text-xs text-text-dim font-normal truncate max-w-[200px]">{item.description}</div>
                </td>
                <td className="py-3 px-4">{item.item_type}</td>
                <td className="py-3 px-4 capitalize">
                  <Badge variant={item.rarity === 'common' ? 'muted' : item.rarity === 'rare' ? 'brand' : item.rarity === 'epic' ? 'success' : 'danger'}>
                    {item.rarity}
                  </Badge>
                </td>
                <td className="py-3 px-4">
                  {item.price_coin} Koin <br/> <span className="text-xs text-text-dim">Lvl {item.unlock_level}</span>
                </td>
                <td className="py-3 px-4 capitalize">{item.gender_restriction}</td>
                <td className="py-3 px-4">
                  <Badge variant={item.is_active ? "success" : "muted"}>
                    {item.is_active ? "Aktif" : "Nonaktif"}
                  </Badge>
                </td>
                <td className="py-3 pl-4 text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="secondary" size="sm" onClick={() => handleEdit(item)}>Edit</Button>
                    <Button variant="ghost" size="sm" className="text-danger" onClick={() => handleDelete(item.id)}>Hapus</Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {items.length === 0 && (
          <p className="text-center text-text-dim py-8">Belum ada item di shop.</p>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in">
          <Card className="w-full max-w-lg shadow-2xl p-6">
            <h2 className="text-lg font-semibold mb-4">{editingItem ? "Edit Item" : "Tambah Item"}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nama Item</label>
                  <input 
                    className="flex h-10 w-full rounded-md border border-line bg-bg px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                    required 
                    value={formData.name || ""} 
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })} 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tipe</label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-line bg-bg px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                    required 
                    value={formData.item_type || ""} 
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, item_type: e.target.value })}
                  >
                    <option value="headwear">Headwear</option>
                    <option value="outfit">Outfit</option>
                    <option value="accessory">Accessory</option>
                    <option value="background">Background</option>
                    <option value="title">Title</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Rarity</label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-line bg-bg px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                    required 
                    value={formData.rarity || ""} 
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, rarity: e.target.value as "common" | "rare" | "epic" | "legendary" })}
                  >
                    <option value="common">Common</option>
                    <option value="rare">Rare</option>
                    <option value="epic">Epic</option>
                    <option value="legendary">Legendary</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Gender</label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-line bg-bg px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                    required 
                    value={formData.gender_restriction || ""} 
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, gender_restriction: e.target.value as "male" | "female" | "unisex" })}
                  >
                    <option value="unisex">Unisex</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Harga (Koin)</label>
                  <input 
                    className="flex h-10 w-full rounded-md border border-line bg-bg px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                    type="number" 
                    required 
                    min="0"
                    value={formData.price_coin || 0} 
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, price_coin: Number(e.target.value) })} 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Level Dibutuhkan</label>
                  <input 
                    className="flex h-10 w-full rounded-md border border-line bg-bg px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                    type="number" 
                    required 
                    min="1"
                    value={formData.unlock_level || 1} 
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, unlock_level: Number(e.target.value) })} 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Deskripsi</label>
                <input 
                  className="flex h-10 w-full rounded-md border border-line bg-bg px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                  value={formData.description || ""} 
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, description: e.target.value })} 
                />
              </div>

              <div className="flex items-center gap-2 mt-4">
                <input 
                  type="checkbox" 
                  id="is_active" 
                  checked={formData.is_active} 
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, is_active: e.target.checked })} 
                />
                <label htmlFor="is_active" className="text-sm font-medium">Aktif (Tampil di Shop)</label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-line mt-6">
                <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Batal</Button>
                <Button type="submit">Simpan</Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </Card>
  );
}
