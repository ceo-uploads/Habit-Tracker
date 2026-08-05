/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState, useEffect } from 'react';
import { UserProfile, StreakState, HabitConfig } from '../types';
import { sounds } from '../lib/soundEffects';
import { avatarStorage, processImageFile } from '../lib/avatarStorage';

import { Download, Share2, Sparkles, User, Award, ShieldAlert, Badge, Copy, Check, X, MessageSquare, Send, Settings, Camera, Languages, Moon, Sun } from 'lucide-react';

interface ProfileCardProps {
  profile: UserProfile;
  streaks: Record<string, StreakState>;
  habitConfigs: Record<string, HabitConfig>;
  onUpdateProfile?: (updated: Partial<UserProfile>) => void;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({
  profile,
  streaks,
  habitConfigs,
  onUpdateProfile,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Custom Share Modal states
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareImgUrl, setShareImgUrl] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  // Resolve custom image from IndexedDB if stored as a placeholder pointer
  const [resolvedAvatarUrl, setResolvedAvatarUrl] = useState(profile.avatarUrl);

  useEffect(() => {
    if (profile.avatarUrl && profile.avatarUrl.startsWith('indexeddb:')) {
      avatarStorage.getAvatar('user_avatar').then((val) => {
        if (val) {
          setResolvedAvatarUrl(val);
        }
      });
    } else {
      setResolvedAvatarUrl(profile.avatarUrl);
    }
  }, [profile.avatarUrl]);

  // Profile Editor Modal states
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState(profile.name);
  const [editAvatarUrl, setEditAvatarUrl] = useState(profile.avatarUrl);
  const [editLanguage, setEditLanguage] = useState(profile.language);
  const [editTheme, setEditTheme] = useState(profile.theme);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const PRESET_AVATARS = [
    { name: 'Astro Commander', url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80' },
    { name: 'Quantum Pilot', url: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&h=150&q=80' },
    { name: 'Zen Seeker', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80' },
    { name: 'Solar Voyager', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80' },
    { name: 'Cyber Sentinel', url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&h=150&q=80' },
    { name: 'Bio Engineer', url: 'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?auto=format&fit=crop&w=150&h=150&q=80' },
  ];

  const handleOpenEditor = () => {
    sounds.playClick();
    setEditName(profile.name);
    setEditAvatarUrl(resolvedAvatarUrl);
    setEditLanguage(profile.language);
    setEditTheme(profile.theme);
    setIsUploading(false);
    setUploadProgress(0);
    setIsEditingProfile(true);
  };

  const handleEditAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      setUploadProgress(10);
      sounds.playClick();

      processImageFile(file, (p) => setUploadProgress(p))
        .then((base64) => {
          setEditAvatarUrl(base64);
          setIsUploading(false);
          sounds.playSuccessChime();
        })
        .catch((err) => {
          console.error(err);
          setIsUploading(false);
          sounds.playErrorBuzz();
        });
    }
  };

  const handleSaveProfile = () => {
    if (!editName.trim()) {
      sounds.playErrorBuzz();
      return;
    }
    sounds.playSuccessChime();
    onUpdateProfile?.({
      name: editName.trim(),
      avatarUrl: editAvatarUrl,
      language: editLanguage,
      theme: editTheme,
    });
    setIsEditingProfile(false);
  };

  // Mouse tilt effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    const rotY = (x / (rect.width / 2)) * 15;
    const rotX = -(y / (rect.height / 2)) * 15;

    setRotation({ x: rotX, y: rotY });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotation({ x: 0, y: 0 });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  // Helper to render high-resolution canvas
  const renderCanvas = (): Promise<HTMLCanvasElement> => {
    return new Promise(async (resolve, reject) => {
      try {
        // 1. Create a high resolution canvas (800 x 1200) for sharp social sharing
        const canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 1200;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get 2D context'));
          return;
        }

        // 2. Render beautiful custom outer space gradient background
        const grad = ctx.createRadialGradient(400, 600, 100, 400, 600, 800);
        grad.addColorStop(0, '#1e1b4b'); // Indigo dark
        grad.addColorStop(0.5, '#0f172a'); // Slate darker
        grad.addColorStop(1, '#020617'); // Darkest void
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 800, 1200);

        // Add stars
        ctx.fillStyle = '#ffffff';
        for (let i = 0; i < 120; i++) {
          const sx = Math.random() * 800;
          const sy = Math.random() * 1200;
          const size = Math.random() * 2.5;
          ctx.globalAlpha = Math.random() * 0.8 + 0.2;
          ctx.beginPath();
          ctx.arc(sx, sy, size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1.0;

        // Cosmic glow nebulas
        const nebulaGrad = ctx.createRadialGradient(150, 200, 50, 150, 200, 300);
        nebulaGrad.addColorStop(0, 'rgba(139, 92, 246, 0.2)'); // Violet
        nebulaGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = nebulaGrad;
        ctx.fillRect(0, 0, 800, 1200);

        const nebulaGrad2 = ctx.createRadialGradient(650, 950, 50, 650, 950, 300);
        nebulaGrad2.addColorStop(0, 'rgba(6, 182, 212, 0.15)'); // Cyan
        nebulaGrad2.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = nebulaGrad2;
        ctx.fillRect(0, 0, 800, 1200);

        // 3. Render Card Frame / Border
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
        ctx.lineWidth = 12;
        ctx.strokeRect(30, 30, 740, 1140);

        // Inner neon glowing border
        ctx.strokeStyle = 'rgba(139, 92, 246, 0.3)';
        ctx.lineWidth = 2;
        ctx.strokeRect(40, 40, 720, 1120);

        // 4. Header: Badge Title
        ctx.fillStyle = 'rgba(139, 92, 246, 0.15)';
        ctx.fillRect(200, 80, 400, 50);
        ctx.strokeStyle = 'rgba(139, 92, 246, 0.5)';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(200, 80, 400, 50);

        ctx.fillStyle = '#a78bfa';
        ctx.font = 'bold 20px "Courier New", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('COSMIC RECOVERY PASS', 400, 105);

        // 5. Draw Profile Image Circle (Standard avatar if default or base64)
        const drawPlaceholderAvatar = (ax: number, ay: number, size: number) => {
          ctx.fillStyle = '#1e293b';
          ctx.beginPath();
          ctx.arc(ax, ay, size / 2, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#64748b';
          ctx.beginPath();
          ctx.arc(ax, ay - 15, size / 5, 0, Math.PI * 2);
          ctx.fill();

          ctx.beginPath();
          ctx.arc(ax, ay + 35, size / 3, Math.PI, Math.PI * 2);
          ctx.fill();
        };

        const renderAvatar = () => {
          return new Promise<void>((resolve) => {
            const avatarSize = 140;
            const ax = 400;
            const ay = 250;

            // Background disk
            ctx.beginPath();
            ctx.arc(ax, ay, avatarSize / 2 + 10, 0, Math.PI * 2);
            const avatarGrad = ctx.createLinearGradient(300, 180, 500, 320);
            avatarGrad.addColorStop(0, '#c084fc');
            avatarGrad.addColorStop(1, '#06b6d4');
            ctx.fillStyle = avatarGrad;
            ctx.fill();

            if (profile.avatarUrl) {
              const img = new Image();
              img.crossOrigin = 'anonymous';
              img.onload = () => {
                ctx.save();
                ctx.beginPath();
                ctx.arc(ax, ay, avatarSize / 2, 0, Math.PI * 2);
                ctx.clip();
                ctx.drawImage(img, ax - avatarSize / 2, ay - avatarSize / 2, avatarSize, avatarSize);
                ctx.restore();
                resolve();
              };
              img.onerror = () => {
                drawPlaceholderAvatar(ax, ay, avatarSize);
                resolve();
              };
              img.src = profile.avatarUrl;
            } else {
              drawPlaceholderAvatar(ax, ay, avatarSize);
              resolve();
            }
          });
        };

        await renderAvatar();

        // 6. User Info text
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 38px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(profile.name.toUpperCase(), 400, 360);

        ctx.fillStyle = '#64748b';
        ctx.font = '16px monospace';
        ctx.fillText(`FLIGHT INITIATED: ${new Date(profile.joinedDate).toLocaleDateString()}`, 400, 395);

        // 7. Render Streak achievements list (max 5 active habits)
        const enabledStreaks = (Object.values(streaks) as StreakState[]).filter((s) => s.currentStreak >= 0);
        let listY = 460;

        // Draw horizontal separator
        ctx.strokeStyle = 'rgba(255,255,255,0.08)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(100, listY - 20);
        ctx.lineTo(700, listY - 20);
        ctx.stroke();

        ctx.fillStyle = '#f8fafc';
        ctx.font = 'bold 24px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('ACTIVE MISSION SECTORS:', 100, listY);
        listY += 45;

        enabledStreaks.forEach((streak) => {
          const config = habitConfigs[streak.habitId];
          if (!config) return;

          // Habit box background
          ctx.fillStyle = 'rgba(15, 23, 42, 0.6)';
          ctx.fillRect(100, listY, 600, 75);
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
          ctx.strokeRect(100, listY, 600, 75);

          // Habit Name
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 20px sans-serif';
          ctx.fillText(profile.language === 'en' ? config.nameEn : config.nameBn, 130, listY + 30);

          // Subtitle
          ctx.fillStyle = '#64748b';
          ctx.font = '15px sans-serif';
          ctx.fillText(profile.language === 'en' ? `Target: ${streak.target}` : `লক্ষ্য: ${streak.target}`, 130, listY + 55);

          // Streak Flame Counter (Draw a flame graphic in the box)
          ctx.fillStyle = config.color;
          ctx.font = 'bold 28px monospace';
          ctx.textAlign = 'right';
          ctx.fillText(`${streak.currentStreak} 🔥`, 670, listY + 45);

          // Reset textAlign
          ctx.textAlign = 'left';
          listY += 95;
        });

        // 8. Bottom Passport-Style Boarding barcode design
        const footerY = 1000;
        ctx.strokeStyle = 'rgba(255,255,255,0.08)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(100, footerY);
        ctx.lineTo(700, footerY);
        ctx.stroke();

        // Render barcode lines
        ctx.fillStyle = '#94a3b8';
        let barcodeX = 120;
        while (barcodeX < 450) {
          const width = Math.random() * 6 + 1;
          ctx.fillRect(barcodeX, footerY + 30, width, 60);
          barcodeX += width + Math.random() * 5 + 2;
        }

        ctx.fillStyle = '#64748b';
        ctx.font = '12px monospace';
        ctx.fillText('S/N: RKT-9432-SQLITE-DB', 120, footerY + 110);

        // Render QR Code Box
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(550, footerY + 20, 120, 120);
        ctx.strokeStyle = '#a78bfa';
        ctx.lineWidth = 3;
        ctx.strokeRect(550, footerY + 20, 120, 120);

        // Mini inner QR spots
        ctx.fillStyle = '#a78bfa';
        ctx.fillRect(560, footerY + 30, 30, 30);
        ctx.fillRect(630, footerY + 30, 30, 30);
        ctx.fillRect(560, footerY + 100, 30, 30);
        ctx.fillRect(600, footerY + 70, 20, 20);
        ctx.fillRect(620, footerY + 110, 20, 10);
        ctx.fillRect(600, footerY + 110, 10, 20);

        resolve(canvas);
      } catch (err) {
        reject(err);
      }
    });
  };

  // Convert HTML contents into PNG and download
  const handleDownload = async () => {
    sounds.playClick();
    setIsGenerating(true);

    try {
      const canvas = await renderCanvas();
      const link = document.createElement('a');
      link.download = `${profile.name.replace(/\s+/g, '_')}_space_pass.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();

      sounds.playSuccessChime();
    } catch (e) {
      console.error('Failed to render offline profile card PNG', e);
      sounds.playErrorBuzz();
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle Share to Social
  const handleShareToSocial = async () => {
    sounds.playClick();
    setIsGenerating(true);

    try {
      const canvas = await renderCanvas();
      const dataUrl = canvas.toDataURL('image/png');
      setShareImgUrl(dataUrl);

      // Try native Web Share API with file attachment first
      canvas.toBlob(async (blob) => {
        if (!blob) {
          setShowShareModal(true);
          return;
        }

        const file = new File([blob], `${profile.name.replace(/\s+/g, '_')}_space_pass.png`, { type: 'image/png' });
        const enabledStreaks = (Object.values(streaks) as StreakState[]).filter((s) => s.currentStreak >= 0);
        const totalStreakDays = enabledStreaks.reduce((sum, s) => sum + (s.currentStreak || 0), 0);

        const shareTitle = profile.language === 'en' ? 'My Space Recovery Pass' : 'আমার স্পেস রিকভারি পাস';
        const shareText = profile.language === 'en'
          ? `I've secured a total streak of ${totalStreakDays} days in Vanguard 3D! Check out my Cosmic Pass.`
          : `আমি ভ্যানগার্ড থ্রিডিতে মোট ${totalStreakDays} দিনের স্ট্রিক অর্জন করেছি! আমার স্পেস রিকভারি পাসটি দেখুন।`;

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              files: [file],
              title: shareTitle,
              text: shareText,
            });
            sounds.playSuccessChime();
          } catch (shareErr) {
            console.log('Native share cancelled or failed, falling back to modal', shareErr);
            setShowShareModal(true);
          }
        } else {
          setShowShareModal(true);
        }
      }, 'image/png');
    } catch (err) {
      console.error('Failed to prepare sharing payload', err);
      sounds.playErrorBuzz();
    } finally {
      setIsGenerating(false);
    }
  };

  // Copy app link handler
  const handleCopyLink = () => {
    sounds.playClick();
    const appUrl = window.location.href;
    navigator.clipboard.writeText(appUrl)
      .then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
        sounds.playSuccessChime();
      })
      .catch((err) => {
        console.error('Failed to copy', err);
        sounds.playErrorBuzz();
      });
  };

  // Calculations for share details
  const enabledStreaks = (Object.values(streaks) as StreakState[]).filter((s) => s.currentStreak >= 0);
  const totalStreakDays = enabledStreaks.reduce((sum, s) => sum + (s.currentStreak || 0), 0);
  const shareText = profile.language === 'en'
    ? `I have maintained self-control for ${totalStreakDays} streak days! Join me on the Vanguard 3D Streak Tracker and build pure habits.`
    : `আমি ভ্যানগার্ড থ্রিডি-তে টানা ${totalStreakDays} দিন ধরে নিজের অভ্যাস নিয়ন্ত্রণে রেখেছি! আপনিও শুরু করুন এবং নিজের জীবন বদলে দিন।`;
  const shareUrl = window.location.href;

  return (
    <div className="w-full flex flex-col items-center">
      {/* 3D Tilt Card Container */}
      <div
        className="w-full max-w-[340px] h-[520px] rounded-3xl p-0.5 shadow-2xl relative select-none cursor-pointer overflow-hidden group"
        style={{ perspective: '1000px' }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onMouseEnter={handleMouseEnter}
      >
        {/* Holographic Glowing Base and Tilt Node */}
        <div
          ref={cardRef}
          className="w-full h-full rounded-3xl bg-slate-900 border border-violet-500/30 flex flex-col justify-between p-6 relative overflow-hidden transition-all duration-300 shadow-[0_0_30px_-5px_rgba(139,92,246,0.3)] group-hover:border-violet-400/60"
          style={{
            transformStyle: 'preserve-3d',
            transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) scale(${isHovered ? 1.02 : 1})`,
            transition: isHovered ? 'none' : 'transform 0.5s ease',
          }}
        >
          {/* Animated Glowing Nebula Spot inside card */}
          <div className="absolute -top-12 -left-12 w-48 h-48 rounded-full bg-violet-600/20 blur-3xl pointer-events-none group-hover:bg-violet-600/30 transition-all" />
          <div className="absolute -bottom-16 -right-16 w-48 h-48 rounded-full bg-cyan-600/20 blur-3xl pointer-events-none group-hover:bg-cyan-600/30 transition-all" />

          {/* Card Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4 relative z-10" style={{ transform: 'translateZ(30px)' }}>
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-violet-400 animate-pulse" />
              <span className="text-[10px] uppercase font-mono tracking-widest text-violet-300">Space Recovery Pass</span>
            </div>
            <div className="flex items-center space-x-2">
              <Award className="w-5 h-5 text-yellow-400" />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenEditor();
                }}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-violet-600 text-slate-300 hover:text-white transition-all cursor-pointer border border-white/5"
                title="Edit Profile"
              >
                <Settings className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* User Circular Avatar and Name */}
          <div className="flex flex-col items-center my-4 relative z-10" style={{ transform: 'translateZ(45px)' }}>
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-violet-500 to-cyan-400 p-1 shadow-lg relative overflow-hidden flex items-center justify-center">
              {resolvedAvatarUrl ? (
                <img
                  src={resolvedAvatarUrl}
                  alt="Avatar"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover rounded-full bg-slate-950"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center">
                  <User className="w-8 h-8 text-slate-400" />
                </div>
              )}
            </div>

            <h3 className="text-xl font-bold text-white mt-3 text-center tracking-wide uppercase">
              {profile.name}
            </h3>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">
              {profile.language === 'en' ? 'Flight Crew' : 'ফ্লাইট ক্রু'}
            </p>
          </div>

          {/* Active Sectors lists */}
          <div className="flex flex-col space-y-2 flex-grow justify-center relative z-10" style={{ transform: 'translateZ(25px)' }}>
            {(Object.values(streaks) as StreakState[])
              .filter((s) => s.currentStreak >= 0)
              .slice(0, 3)
              .map((streak) => {
                const config = habitConfigs[streak.habitId];
                if (!config) return null;
                return (
                  <div
                    key={streak.habitId}
                    className="flex items-center justify-between bg-slate-950/45 border border-slate-800/60 rounded-xl px-3 py-2 text-xs"
                  >
                    <span className="text-slate-300 font-medium">
                      {profile.language === 'en' ? config.nameEn : config.nameBn}
                    </span>
                    <span className="font-bold text-white flex items-center">
                      {streak.currentStreak} <span className="ml-1 text-[10px]" style={{ color: config.color }}>🔥</span>
                    </span>
                  </div>
                );
              })}
          </div>

          {/* Pass Footer */}
          <div className="border-t border-slate-800/80 pt-4 flex items-end justify-between relative z-10" style={{ transform: 'translateZ(30px)' }}>
            <div className="flex flex-col text-left">
              <span className="text-[9px] uppercase tracking-widest text-slate-500 font-mono">SQLite Device Storage</span>
              <span className="text-[10px] font-mono text-slate-300">RKT-SECURE-9482</span>
            </div>
            
            {/* Mock QR mini barcode for cyber pass aesthetic */}
            <div className="flex flex-col items-end">
              <div className="w-10 h-10 bg-slate-950 border border-violet-500/40 p-0.5 rounded flex flex-wrap gap-0.5">
                <div className="w-2 h-2 bg-violet-400 rounded-sm" />
                <div className="w-2 h-2 bg-violet-400 rounded-sm" />
                <div className="w-2 h-2 bg-violet-400 rounded-sm" />
                <div className="w-2 h-2 bg-slate-950" />
                <div className="w-2 h-2 bg-slate-950" />
                <div className="w-2 h-2 bg-violet-400 rounded-sm" />
                <div className="w-2 h-2 bg-violet-400 rounded-sm" />
                <div className="w-2 h-2 bg-violet-400 rounded-sm" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Responsive download and share buttons */}
      <div className="mt-6 flex flex-col sm:flex-row gap-3 w-full max-w-[340px] justify-center">
        <button
          onClick={handleDownload}
          disabled={isGenerating}
          id="btn-download-pass"
          className="flex-1 flex items-center justify-center space-x-2 bg-slate-900 hover:bg-slate-850 text-white font-bold text-xs uppercase tracking-wider py-3.5 px-4 rounded-xl border border-white/10 shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
        >
          {isGenerating ? (
            <span className="flex items-center space-x-2">
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>{profile.language === 'en' ? 'Rendering...' : 'রেন্ডার হচ্ছে...'}</span>
            </span>
          ) : (
            <>
              <Download className="w-3.5 h-3.5" />
              <span>{profile.language === 'en' ? 'Download Pass' : 'পাস ডাউনলোড'}</span>
            </>
          )}
        </button>

        <button
          onClick={handleShareToSocial}
          disabled={isGenerating}
          id="btn-share-pass"
          className="flex-1 flex items-center justify-center space-x-2 bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white font-bold text-xs uppercase tracking-wider py-3.5 px-4 rounded-xl shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>{profile.language === 'en' ? 'Share to Social' : 'সোশ্যাল শেয়ার'}</span>
        </button>
      </div>

      {/* Beautiful Interactive Social Share Backdrop Sheet / Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-slate-950/80 z-50 flex items-center justify-center p-4 backdrop-blur-md">
          <div className="w-full max-w-md bg-slate-900 border border-white/10 rounded-3xl p-6 shadow-2xl animate-fade-in text-left relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />
            
            {/* Modal Title */}
            <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
              <h3 className="text-base font-black text-white uppercase tracking-wider font-mono flex items-center gap-2">
                <Share2 className="w-4 h-4 text-violet-400" />
                <span>{profile.language === 'en' ? 'Share Space Pass' : 'স্পেস পাস শেয়ার করুন'}</span>
              </h3>
              <button
                onClick={() => { sounds.playClick(); setShowShareModal(false); }}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              {profile.language === 'en' 
                ? 'Your resilience is inspiring! Share your 3D Streak recovery passport with your friends or copy the link to invite them.' 
                : 'আপনার আত্মনিয়ন্ত্রণ প্রশংসনীয়! আপনার ৩ডি স্ট্রিক রিকভারি পাসপোর্টটি বন্ধুদের সাথে শেয়ার করুন অথবা তাদের আমন্ত্রণ জানাতে লিঙ্কটি কপি করুন।'}
            </p>

            {/* Generated Pass Card Preview */}
            <div className="w-full flex justify-center mb-5">
              <div className="relative group border border-white/10 rounded-2xl overflow-hidden shadow-lg p-1 bg-slate-950/40">
                <img 
                  src={shareImgUrl} 
                  alt="Recovery Pass" 
                  className="max-h-[220px] rounded-xl object-contain"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent flex items-end justify-center p-2 opacity-0 group-hover:opacity-100 transition-all">
                  <span className="text-[10px] text-violet-300 font-mono tracking-widest uppercase font-black">
                    {profile.language === 'en' ? 'High-Res Render' : 'হাই-রেজোলিউশন কার্ড'}
                  </span>
                </div>
              </div>
            </div>

            {/* Social Platform Shortcuts */}
            <div className="grid grid-cols-3 gap-2.5 mb-5">
              {/* X / Twitter */}
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`}
                target="_blank"
                rel="noreferrer"
                onClick={() => sounds.playClick()}
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-black border border-white/5 hover:border-violet-500/30 transition-all font-mono text-center cursor-pointer hover:-translate-y-0.5"
              >
                <span className="text-base font-black text-white mb-1">𝕏</span>
                <span className="text-[9px] text-slate-400 uppercase tracking-widest font-black">X / Twitter</span>
              </a>

              {/* WhatsApp */}
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`}
                target="_blank"
                rel="noreferrer"
                onClick={() => sounds.playClick()}
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#075e54]/20 border border-[#25d366]/20 hover:border-[#25d366]/50 transition-all font-mono text-center cursor-pointer hover:-translate-y-0.5"
              >
                <MessageSquare className="w-4 h-4 text-[#25d366] mb-1" />
                <span className="text-[9px] text-slate-400 uppercase tracking-widest font-black">WhatsApp</span>
              </a>

              {/* Facebook */}
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                target="_blank"
                rel="noreferrer"
                onClick={() => sounds.playClick()}
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#3b5998]/10 border border-[#3b5998]/20 hover:border-[#3b5998]/50 transition-all font-mono text-center cursor-pointer hover:-translate-y-0.5"
              >
                <span className="text-base font-black text-[#3b5998] mb-1">f</span>
                <span className="text-[9px] text-slate-400 uppercase tracking-widest font-black">Facebook</span>
              </a>
            </div>

            {/* Utility sharing buttons */}
            <div className="flex flex-col gap-2 border-t border-white/5 pt-4">
              {/* Copy Link */}
              <button
                onClick={handleCopyLink}
                className="w-full flex items-center justify-between p-3.5 rounded-xl bg-slate-950/60 hover:bg-slate-950 border border-slate-800 transition-all cursor-pointer font-mono text-xs text-slate-300"
              >
                <div className="flex items-center gap-2">
                  {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-500" />}
                  <span>{isCopied ? (profile.language === 'en' ? 'Copied to Clipboard!' : 'ক্লিপবোর্ডে কপি হয়েছে!') : (profile.language === 'en' ? 'Copy Referral Link' : 'রেফারেল লিঙ্ক কপি করুন')}</span>
                </div>
                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">{isCopied ? 'OK ✓' : 'COPY'}</span>
              </button>

              {/* Download Direct */}
              <button
                onClick={() => { setShowShareModal(false); handleDownload(); }}
                className="w-full flex items-center justify-between p-3.5 rounded-xl bg-slate-800/40 hover:bg-slate-850/60 border border-slate-800 transition-all cursor-pointer font-mono text-xs text-slate-300"
              >
                <div className="flex items-center gap-2">
                  <Download className="w-4 h-4 text-cyan-400" />
                  <span>{profile.language === 'en' ? 'Save PNG Image to Device' : 'ডিভাইসে পিএনজি কার্ড সংরক্ষণ করুন'}</span>
                </div>
                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">PNG</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Profile Customizer Modal */}
      {isEditingProfile && (
        <div className="fixed inset-0 bg-slate-950/85 z-50 flex items-center justify-center p-4 backdrop-blur-md">
          <div className="w-full max-w-md bg-slate-900 border border-white/10 rounded-3xl p-6 shadow-2xl animate-fade-in text-left relative overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Modal Title */}
            <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
              <h3 className="text-base font-black text-white uppercase tracking-wider font-mono flex items-center gap-2">
                <Settings className="w-4 h-4 text-violet-400" />
                <span>{profile.language === 'en' ? 'Customize Flight Pass' : 'মিশন পাস কাস্টমাইজ করুন'}</span>
              </h3>
              <button
                onClick={() => { sounds.playClick(); setIsEditingProfile(false); }}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form Section */}
            <div className="space-y-5">
              {/* Name (Callsign) */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-mono">
                  {profile.language === 'en' ? 'Crew Member Callsign / Name' : 'ক্রু মেম্বার কলসাইন / নাম'}
                </label>
                <input
                  type="text"
                  maxLength={18}
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-violet-500/50 rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-all font-sans font-bold"
                  placeholder={profile.language === 'en' ? 'Enter callsign...' : 'নাম লিখুন...'}
                />
              </div>

              {/* Avatar Selector */}
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-mono block">
                  {profile.language === 'en' ? 'Mission Avatar' : 'মিশন প্রোফাইল পিকচার'}
                </label>

                {/* Current Avatar & Upload Button */}
                <div className="flex items-center gap-4 bg-slate-950/50 border border-slate-800/80 p-3 rounded-2xl">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-violet-500 to-cyan-400 p-0.5 relative overflow-hidden flex items-center justify-center shrink-0">
                    {editAvatarUrl ? (
                      <img src={editAvatarUrl} alt="Preview" className="w-full h-full object-cover rounded-full bg-slate-950" />
                    ) : (
                      <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center">
                        <User className="w-6 h-6 text-slate-400" />
                      </div>
                    )}
                    {isUploading && (
                      <div className="absolute inset-0 bg-slate-950/85 flex flex-col items-center justify-center">
                        <span className="text-[9px] font-black font-mono text-cyan-400 animate-pulse">{uploadProgress}%</span>
                        <div className="w-10 h-1 bg-slate-800 rounded-full mt-1 overflow-hidden">
                          <div className="h-full bg-cyan-400 transition-all duration-100" style={{ width: `${uploadProgress}%` }} />
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex-grow">
                    <p className="text-[11px] text-slate-300 font-bold mb-1.5">
                      {profile.language === 'en' ? 'Upload Custom Photo' : 'নিজের ছবি আপলোড করুন'}
                    </p>
                    <label className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-2 rounded-lg cursor-pointer transition-all border border-white/5 active:scale-95">
                      <Camera className="w-3.5 h-3.5 text-violet-400" />
                      <span>{profile.language === 'en' ? 'Browse File' : 'ফাইল খুঁজুন'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleEditAvatarUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* Preset Avatars Grid */}
                <div className="space-y-2">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest font-mono block">
                    {profile.language === 'en' ? 'Or Choose Cosmic Preset' : 'অথবা কসমিক প্রিসেট নির্বাচন করুন'}
                  </span>
                  <div className="grid grid-cols-6 gap-2">
                    {PRESET_AVATARS.map((av) => {
                      const active = editAvatarUrl === av.url;
                      return (
                        <button
                          key={av.name}
                          onClick={() => { sounds.playClick(); setEditAvatarUrl(av.url); }}
                          className={`relative w-full aspect-square rounded-full overflow-hidden p-0.5 border-2 transition-all ${
                            active 
                              ? 'border-violet-500 scale-105 shadow-[0_0_12px_rgba(139,92,246,0.4)]' 
                              : 'border-slate-800 hover:border-slate-600'
                          }`}
                          title={av.name}
                        >
                          <img src={av.url} alt={av.name} className="w-full h-full object-cover rounded-full bg-slate-950 animate-fade-in" />
                          {active && (
                            <div className="absolute inset-0 bg-violet-600/10 flex items-center justify-center">
                              <div className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-ping" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Preferences: Language and Theme */}
              <div className="grid grid-cols-2 gap-3.5 pt-2 border-t border-white/5">
                {/* Language Switcher */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1">
                    <Languages className="w-3 h-3 text-violet-400" />
                    <span>{profile.language === 'en' ? 'System Language' : 'সিস্টেমের ভাষা'}</span>
                  </label>
                  <div className="grid grid-cols-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
                    <button
                      onClick={() => { sounds.playClick(); setEditLanguage('en'); }}
                      className={`py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${
                        editLanguage === 'en' ? 'bg-violet-600 text-white font-black' : 'text-slate-400 hover:text-slate-200 font-bold'
                      }`}
                    >
                      EN
                    </button>
                    <button
                      onClick={() => { sounds.playClick(); setEditLanguage('bn'); }}
                      className={`py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${
                        editLanguage === 'bn' ? 'bg-violet-600 text-white font-black' : 'text-slate-400 hover:text-slate-200 font-bold'
                      }`}
                    >
                      বাংলা
                    </button>
                  </div>
                </div>

                {/* Theme Switcher */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1">
                    {editTheme === 'dark' ? <Moon className="w-3 h-3 text-violet-400" /> : <Sun className="w-3 h-3 text-violet-400" />}
                    <span>{profile.language === 'en' ? 'Theme Mode' : 'থিম মোড'}</span>
                  </label>
                  <div className="grid grid-cols-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
                    <button
                      onClick={() => { sounds.playClick(); setEditTheme('dark'); }}
                      className={`py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-1 ${
                        editTheme === 'dark' ? 'bg-violet-600 text-white font-black' : 'text-slate-400 hover:text-slate-200 font-bold'
                      }`}
                    >
                      DARK
                    </button>
                    <button
                      onClick={() => { sounds.playClick(); setEditTheme('light'); }}
                      className={`py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-1 ${
                        editTheme === 'light' ? 'bg-violet-600 text-white font-black' : 'text-slate-400 hover:text-slate-200 font-bold'
                      }`}
                    >
                      LIGHT
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-white/5">
                <button
                  onClick={() => { sounds.playClick(); setIsEditingProfile(false); }}
                  className="flex-1 py-3 bg-slate-950 border border-slate-800 hover:bg-slate-850 text-slate-300 font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer text-center"
                >
                  {profile.language === 'en' ? 'Cancel' : 'বাতিল'}
                </button>
                <button
                  onClick={handleSaveProfile}
                  className="flex-1 py-3 bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all active:scale-[0.98] cursor-pointer text-center"
                >
                  {profile.language === 'en' ? 'Save Settings' : 'সেভ করুন'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileCard;

