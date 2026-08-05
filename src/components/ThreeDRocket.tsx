/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { HabitId } from '../types';

interface ThreeDRocketProps {
  habitId: HabitId;
  flameLevel: number; // 1 (small) to 4 (cosmic purple)
  isLaunching: boolean; // Launch animation triggered
  theme: 'light' | 'dark';
}

export const ThreeDRocket: React.FC<ThreeDRocketProps> = ({
  habitId,
  flameLevel,
  isLaunching,
  theme,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  // Mouse hover 3D tilt tracking
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    // Normalize to max 25 degrees tilt
    const rotY = (x / (rect.width / 2)) * 25;
    const rotX = -(y / (rect.height / 2)) * 25;

    setRotation({ x: rotX, y: rotY });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotation({ x: 0, y: 0 });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  // Flame color selection based on level and habit
  const getFlameColors = (): { primary: string; secondary: string; sparks: string[] } => {
    // Default palette overrides based on streak levels
    if (flameLevel === 2) {
      return { primary: '#3b82f6', secondary: '#60a5fa', sparks: ['#2563eb', '#60a5fa', '#93c5fd'] }; // Blue Plasma
    } else if (flameLevel === 3) {
      return { primary: '#10b981', secondary: '#34d399', sparks: ['#059669', '#34d399', '#a7f3d0'] }; // Green Fusion
    } else if (flameLevel >= 4) {
      return { primary: '#8b5cf6', secondary: '#a78bfa', sparks: ['#7c3aed', '#a78bfa', '#ddd6fe'] }; // Cosmic Purple
    }

    // Default habit specific colors for level 1
    switch (habitId) {
      case 'no-smoking':
        return { primary: '#10b981', secondary: '#6ee7b7', sparks: ['#047857', '#34d399', '#a7f3d0'] }; // Eco Green
      case 'no-masturbation':
        return { primary: '#f59e0b', secondary: '#fcd34d', sparks: ['#d97706', '#fcd34d', '#fef3c7'] }; // Gold Energy
      case 'no-porn':
        return { primary: '#8b5cf6', secondary: '#c084fc', sparks: ['#6d28d9', '#c084fc', '#f3e8ff'] }; // Deep Violet
      case 'no-drugs':
        return { primary: '#06b6d4', secondary: '#67e8f9', sparks: ['#0891b2', '#22d3ee', '#ecfeff'] }; // Rejuvenating Cyan
      case 'no-alcohol':
        return { primary: '#ef4444', secondary: '#f87171', sparks: ['#b91c1c', '#f87171', '#fee2e2'] }; // Combustion Red
      default:
        return { primary: '#f97316', secondary: '#fdba74', sparks: ['#ea580c', '#fdba74', '#ffedd5'] };
    }
  };

  // Canvas flame particles animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      alpha: number;
      color: string;
      life: number;
      maxLife: number;
    }> = [];

    const resizeCanvas = () => {
      canvas.width = canvas.parentElement?.clientWidth || 300;
      canvas.height = canvas.parentElement?.clientHeight || 250;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const colors = getFlameColors();

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const emitX = canvas.width / 2;
      const emitY = 65; // nozzle point relative to the rocket inside the layout

      // Emit new particles
      const count = isLaunching ? 20 : isHovered ? 8 : 4;
      for (let i = 0; i < count; i++) {
        const spread = isLaunching ? 4.5 : isHovered ? 2.5 : 1.5;
        const speed = isLaunching ? 12 : isHovered ? 7 : 4.5;
        const sparkColor = colors.sparks[Math.floor(Math.random() * colors.sparks.length)];

        particles.push({
          x: emitX + (Math.random() - 0.5) * 12,
          y: emitY,
          vx: (Math.random() - 0.5) * spread,
          vy: Math.random() * speed + 2,
          size: Math.random() * 8 + (isLaunching ? 8 : 2),
          alpha: 1,
          color: Math.random() > 0.4 ? colors.primary : Math.random() > 0.5 ? colors.secondary : sparkColor,
          life: 0,
          maxLife: Math.random() * 25 + (isLaunching ? 40 : 15),
        });
      }

      // Update and draw particles
      particles.forEach((p, idx) => {
        p.life++;
        p.x += p.vx;
        p.y += p.vy;
        p.alpha = 1 - p.life / p.maxLife;
        p.size *= 0.96; // Shrink as they fall

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        
        // Glow effect for flames
        ctx.shadowBlur = isLaunching ? 25 : p.size * 1.5;
        ctx.shadowColor = p.color;
        
        ctx.fillStyle = p.color;
        ctx.fill();
        ctx.restore();
      });

      // Filter out dead particles
      particles = particles.filter((p) => p.life < p.maxLife);

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [habitId, flameLevel, isLaunching, isHovered]);

  // Determine SVG rocket parts colors based on habit style
  const getRocketColors = () => {
    switch (habitId) {
      case 'no-smoking':
        return { body: '#10b981', fin: '#047857', window: '#34d399', detail: '#a7f3d0' }; // Eco
      case 'no-masturbation':
        return { body: '#f59e0b', fin: '#b45309', window: '#fbbf24', detail: '#fef3c7' }; // Gold
      case 'no-porn':
        return { body: '#8b5cf6', fin: '#5b21b6', window: '#a78bfa', detail: '#f3e8ff' }; // Violet
      case 'no-drugs':
        return { body: '#06b6d4', fin: '#0e7490', window: '#22d3ee', detail: '#ecfeff' }; // Cyan
      case 'no-alcohol':
        return { body: '#ef4444', fin: '#991b1b', window: '#f87171', detail: '#fee2e2' }; // Red
    }
  };

  const rc = getRocketColors();

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
      className="relative w-full h-[280px] flex flex-col items-center justify-center select-none cursor-grab active:cursor-grabbing"
      style={{ perspective: '800px' }}
    >
      {/* 3D Transform Node */}
      <div
        className="relative w-full h-full flex flex-col items-center justify-center transition-transform duration-200 ease-out"
        style={{
          transformStyle: 'preserve-3d',
          transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) translateY(${
            isLaunching ? '-100px' : '0px'
          }) scale(${isLaunching ? 1.15 : isHovered ? 1.05 : 1})`,
          transition: isLaunching
            ? 'transform 0.4s cubic-bezier(0.19, 1, 0.22, 1)'
            : isHovered
            ? 'none'
            : 'transform 0.5s ease',
        }}
      >
        {/* Layer 1: Fire Engine Particles Canvas (Placed backward on Z axis) */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ transform: 'translateZ(-40px)' }}
        >
          <canvas ref={canvasRef} className="w-full h-full" />
        </div>

        {/* Layer 2: Rocket Body (Placed in the center Z axis) */}
        <div
          className="relative w-[150px] h-[180px] flex items-center justify-center drop-shadow-[0_20px_35px_rgba(0,0,0,0.55)]"
          style={{ transform: 'translateZ(0px)' }}
        >
          <svg
            viewBox="0 0 100 120"
            className="w-full h-full transition-transform duration-300"
            style={{
              transform: isLaunching ? 'translateY(-10px) scaleY(1.05)' : 'none',
            }}
          >
            {/* Thruster exhaust cone */}
            <path
              d="M42 95 L58 95 L54 105 L46 105 Z"
              fill="#4b5563"
              stroke="#1f2937"
              strokeWidth="1.5"
            />

            {/* Left Fin */}
            <path
              d="M38 75 L18 102 L36 94 Z"
              fill={rc.fin}
              stroke="#111827"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />

            {/* Right Fin */}
            <path
              d="M62 75 L82 102 L64 94 Z"
              fill={rc.fin}
              stroke="#111827"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />

            {/* Main Rocket fuselage */}
            <path
              d="M50 10 C50 10 28 40 36 82 C36 89 42 96 50 96 C58 96 64 89 64 82 C72 40 50 10 50 10 Z"
              fill={rc.body}
              stroke="#111827"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />

            {/* Nosecone tip detail */}
            <path
              d="M50 10 C50 10 37 28 42 42 C44 38 46 36 50 36 C54 36 56 38 58 42 C63 28 50 10 50 10 Z"
              fill={rc.fin}
              stroke="#111827"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />

            {/* Window frame */}
            <circle cx="50" cy="54" r="13" fill="#1f2937" stroke="#111827" strokeWidth="1.5" />
            <circle cx="50" cy="54" r="10" fill={rc.window} />
            
            {/* Glass reflection highlight */}
            <path
              d="M45 49 A 10 10 0 0 1 55 49 A 10 10 0 0 0 45 49"
              fill="#ffffff"
              opacity="0.4"
            />

            {/* Accent lines/ribs */}
            <path
              d="M36 78 Q50 82 64 78"
              fill="none"
              stroke={rc.detail}
              strokeWidth="2"
              opacity="0.6"
            />
            <path
              d="M37 68 Q50 72 63 68"
              fill="none"
              stroke={rc.detail}
              strokeWidth="1.5"
              opacity="0.4"
            />
          </svg>
        </div>

        {/* Layer 3: Glass Window Reflection overlay (Placed in front of Z axis) */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{ transform: 'translateZ(30px)' }}
        >
          {/* Subtle star particle fields orbiting the rocket inside the 3D grid */}
          <div className="absolute top-10 left-5 w-1 h-1 bg-white rounded-full animate-ping opacity-60" />
          <div className="absolute bottom-20 right-4 w-1.5 h-1.5 bg-yellow-200 rounded-full animate-pulse" />
          <div className="absolute top-1/2 left-4/5 w-1 h-1 bg-cyan-300 rounded-full animate-ping duration-1000" />
        </div>
      </div>
    </div>
  );
};

export default ThreeDRocket;
