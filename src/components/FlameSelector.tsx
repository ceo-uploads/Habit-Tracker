/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface FlameSelectorProps {
  currentStreak: number;
}

export const FlameSelector: React.FC<FlameSelectorProps> = ({ currentStreak }) => {
  // Determine flame style based on streak sizes
  const getFlameSpecs = () => {
    if (currentStreak <= 0) {
      return {
        color: '#64748b', // Cold gray
        glow: 'rgba(100, 116, 139, 0.2)',
        label: 'Inactive',
        labelBn: 'নিষ্ক্রিয়',
        className: 'opacity-40 scale-95',
      };
    } else if (currentStreak <= 5) {
      return {
        color: '#f97316', // Orange Amber
        glow: 'rgba(249, 115, 22, 0.55)',
        label: 'Scout Ignition',
        labelBn: 'প্রাথমিক প্রজ্জ্বলন',
        className: 'animate-pulse hover:scale-105',
      };
    } else if (currentStreak <= 15) {
      return {
        color: '#3b82f6', // Plasma Blue
        glow: 'rgba(59, 130, 246, 0.7)',
        label: 'Plasma Thrust',
        labelBn: 'প্লাজমা থ্রাস্ট',
        className: 'animate-[bounce_2s_infinite] hover:scale-110',
      };
    } else if (currentStreak <= 30) {
      return {
        color: '#10b981', // Fusion Green
        glow: 'rgba(16, 185, 129, 0.8)',
        label: 'Hyper-drive Fusion',
        labelBn: 'হাইপার-ড্রাইভ ফিউশন',
        className: 'animate-[bounce_1.5s_infinite] hover:scale-115',
      };
    } else {
      return {
        color: '#8b5cf6', // Cosmic Purple
        glow: 'rgba(139, 92, 246, 0.95)',
        label: 'Cosmic Supernova',
        labelBn: 'মহাজাগতিক সুপারনোভা',
        className: 'animate-[ping_3s_infinite] hover:scale-120 hover:rotate-6',
      };
    }
  };

  const specs = getFlameSpecs();

  return (
    <div className={`flex flex-col items-center justify-center transition-all duration-300 ${specs.className}`}>
      {/* Glow Backing */}
      <div className="relative w-16 h-16 flex items-center justify-center">
        <div
          className="absolute inset-0 rounded-full blur-xl transition-all duration-300"
          style={{ backgroundColor: specs.glow }}
        />

        {/* Flame SVG */}
        <svg
          viewBox="0 0 100 100"
          className="w-14 h-14 relative z-10 transition-transform duration-300"
        >
          {/* Outer Layer */}
          <path
            d="M50 5 C50 5 90 40 85 70 C80 90 65 100 50 100 C35 100 20 90 15 70 C10 40 50 5 50 5 Z"
            fill={specs.color}
            opacity="0.85"
          />

          {/* Inner pulsating core */}
          <path
            d="M50 25 C50 25 75 52 70 75 C65 88 58 92 50 92 C42 92 35 88 30 75 C25 52 50 25 50 25 Z"
            fill="#ffffff"
            opacity="0.9"
            className="animate-pulse"
          />

          {/* Bottom hot point */}
          <ellipse cx="50" cy="85" rx="12" ry="8" fill="#fdba74" opacity="0.95" />
        </svg>

        {/* Counter Overlay */}
        <span className="absolute text-slate-950 font-black text-sm select-none pointer-events-none z-20 mt-6 tracking-tight">
          {currentStreak}
        </span>
      </div>

      {/* Label */}
      <div className="mt-2 text-center">
        <span
          className="text-[10px] font-mono uppercase tracking-widest font-bold block"
          style={{ color: specs.color }}
        >
          {specs.label}
        </span>
      </div>
    </div>
  );
};

export default FlameSelector;
