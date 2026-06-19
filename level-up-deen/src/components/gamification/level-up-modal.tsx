"use client";

import { useEffect, useState } from "react";

interface LevelUpModalProps {
  newLevel: number;
  isOpen: boolean;
  onClose: () => void;
}

export function LevelUpModal({ newLevel, isOpen, onClose }: LevelUpModalProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShow(true);
      // Dynamically import confetti to avoid SSR issues
      import("canvas-confetti").then((module) => {
        const confetti = module.default || module;
        const duration = 3000;
        const end = Date.now() + duration;

        const frame = () => {
          confetti({
            particleCount: 5,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: ["#FBBF24", "#F59E0B", "#D97706"], // Brand colors
          });
          confetti({
            particleCount: 5,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: ["#FBBF24", "#F59E0B", "#D97706"], // Brand colors
          });

          if (Date.now() < end) {
            requestAnimationFrame(frame);
          }
        };
        frame();
      });

      // Auto-close after animation + 2s
      const timer = setTimeout(() => {
        handleClose();
      }, 5000);

      return () => clearTimeout(timer);
    } else {
      setShow(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleClose = () => {
    setShow(false);
    setTimeout(onClose, 300); // Wait for transition
  };

  if (!isOpen && !show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${show ? 'opacity-100' : 'opacity-0'}`}
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div 
        className={`relative w-full max-w-sm rounded-3xl border border-brand/30 bg-bg p-8 text-center shadow-2xl shadow-brand/20 transition-all duration-300 ${
          show ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-8'
        }`}
      >
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-brand/10 ring-8 ring-brand/5">
          <span className="text-4xl">🌟</span>
        </div>
        
        <h2 className="mb-2 text-3xl font-bold tracking-tight text-brand">LEVEL UP!</h2>
        <p className="mb-8 text-lg font-medium text-text">
          Selamat! Kamu berhasil mencapai <span className="font-bold text-brand">Level {newLevel}</span>
        </p>

        <button
          onClick={handleClose}
          className="w-full rounded-xl bg-brand px-6 py-3 font-semibold text-text transition-transform hover:scale-105 active:scale-95"
        >
          Lanjutkan Perjalanan
        </button>
      </div>
    </div>
  );
}
