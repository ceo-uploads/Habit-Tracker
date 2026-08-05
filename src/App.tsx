/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { sqlite } from './lib/sqliteEngine';
import { avatarStorage, processImageFile } from './lib/avatarStorage';
import { sounds } from './lib/soundEffects';
import { getHealthImprovement, HealthImprovement } from './data/healthImprovements';
import { ThreeDRocket } from './components/ThreeDRocket';
import { ProfileCard } from './components/ProfileCard';
import { FlameSelector } from './components/FlameSelector';
import { SQLiteInspector } from './components/SQLiteInspector';
import { HabitId, StreakState, UserProfile, TargetKey, HabitConfig } from './types';
import {
  Rocket,
  User,
  Shield,
  Volume2,
  VolumeX,
  Languages,
  Database,
  Calendar,
  AlertTriangle,
  RotateCcw,
  CheckCircle,
  HelpCircle,
  Clock,
  Sparkles,
  ChevronRight,
  Info,
  Phone,
  Play,
  Volume1,
  BookOpen,
  TrendingUp,
  X,
  Camera,
  Heart,
  Brain,
  ShieldCheck,
  Zap,
  Users
} from 'lucide-react';

const HABIT_CONFIGS: Record<HabitId, HabitConfig> = {
  'no-smoking': {
    id: 'no-smoking',
    nameEn: 'No Smoking',
    nameBn: 'ধূমপান বর্জন',
    tagEn: 'Breathe Pure, Live Long',
    tagBn: 'বিশুদ্ধ শ্বাস, দীর্ঘ জীবন',
    color: '#10b981',
    gradient: 'from-emerald-500 to-teal-400',
    rocketStyle: 'eco',
    flameColor: '#10b981',
    impactEn: {
      health: 'Tar damages alveoli, causing COPD and lung cancer. Nicotine increases heart rate by 20bpm, raising stroke risk by 400%.',
      mind: 'Nicotine rewires acetylcholine reward pathways, causing extreme chronic anxiety and constant focus crashes.',
      family: 'Secondhand smoke increases children’s asthma rates by 120%. High financial spending drains family resources.',
      society: 'Cigarette butts account for 38% of all litter, polluting local water reservoirs and toxic chemical runoffs.',
      advantages: 'Lungs self-cleanse in days. Blood pressure drops, stamina increases by 40%, and clean breath restores vital energy.'
    },
    impactBn: {
      health: 'আলকাতরা ফুসফুসের অ্যালভিওলি ধ্বংস করে, যার ফলে সিওপিডি এবং ফুসফুসের ক্যান্সার হয়। নিকোটিন হৃদস্পন্দন মিনিটে ২০ বার বাড়িয়ে দেয় এবং স্ট্রোকের ঝুঁকি ৪০০% বাড়ায়।',
      mind: 'নিকোটিন মস্তিষ্কের অ্যাসিটাইলকোলিন পথ পরিবর্তন করে দেয়, যার ফলে দীর্ঘস্থায়ী বিষণ্ণতা এবং ঘন ঘন মনোযোগ নষ্ট হয়।',
      family: 'পরোক্ষ ধূমপান শিশুদের অ্যাজমা বা হাঁপানির হার ১২০% বাড়িয়ে দেয়। চিকিৎসার বাড়তি খরচ পারিবারিক সঞ্চয় নষ্ট করে।',
      society: 'পরিবেশের মোট ময়লার ৩৮% সিগারেট ফিল্টার, যা লোকাল জলাশয় দূষিত করে এবং মাটির উর্বরতা কমায়।',
      advantages: 'কয়েকদিনের মধ্যে ফুসফুস নিজে থেকেই পরিষ্কার হয়ে যায়। রক্তচাপ স্বাভাবিক হয়, কার্যক্ষমতা ৪০% বাড়ে এবং সতেজ শ্বাস জীবনীশক্তি ফিরিয়ে আনে।'
    }
  },
  'no-masturbation': {
    id: 'no-masturbation',
    nameEn: 'No Masturbation',
    nameBn: 'হস্তমৈথুন বর্জন',
    tagEn: 'Sublime Vital Energy',
    tagBn: 'জীবনীশক্তির ঊর্ধ্বগমন',
    color: '#f59e0b',
    gradient: 'from-amber-500 to-orange-400',
    rocketStyle: 'classic',
    flameColor: '#f59e0b',
    impactEn: {
      health: 'Frequent stimulation over-sensitizes androgen receptors, causing lower back fatigue, muscle weakness, and hormonal crashes.',
      mind: 'Causes heavy dopamine receptor down-regulation, resulting in severe brain-fog, lack of motivation, and poor social focus.',
      family: 'Unnatural habit creates emotional isolation, detachment from family obligations, and avoidance of real relationships.',
      society: 'Promotes instant-gratification culture and degrades focus, lowering productivity and direct community engagement.',
      advantages: 'Restores baseline androgen receptors. Peak testosterone boost (up to 145%), supreme motivation, high muscular recovery, and absolute charisma.'
    },
    impactBn: {
      health: 'ঘন ঘন উদ্দীপনা অ্যান্ড্রোজেন রিসেপ্টরকে অতি-সংবেদনশীল করে তোলে, যার ফলে কোমর ব্যথা, পেশীর ক্লান্তি এবং হরমোনের ভারসাম্যহীনতা দেখা দেয়।',
      mind: 'ডোপামিন রিসেপ্টর অতিরিক্ত হ্রাস পায়, ফলে মস্তিষ্কে ধোঁয়াশা বা ব্রেন-ফগ তৈরি হয়, কাজের ইচ্ছা কমে যায় এবং সামাজিক মেলামেশায় অনীহা আসে।',
      family: 'অস্বাভাবিক অভ্যাস আবেগীয় বিচ্ছিন্নতা তৈরি করে, পরিবারের প্রতি দায়িত্ব অবহেলা এবং সত্যিকারের সম্পর্ক এড়িয়ে চলার প্রবণতা বাড়ায়।',
      society: 'তাত্ক্ষণিক আনন্দের অপসংস্কৃতি বাড়ায় এবং যুবসমাজের মনোযোগ নষ্ট করে, যা সামাজিক উন্নয়ন ও কাজের ক্ষমতা কমিয়ে দেয়।',
      advantages: 'অ্যান্ড্রোজেন রিসেপ্টর পুনরায় স্বাভাবিক হয়। টেস্টোস্টেরন লেভেল ১৪৫% পর্যন্ত বৃদ্ধি পায়, অদম্য ইচ্ছা শক্তি, আত্মবিশ্বাস এবং শারীরিক তেজ ফিরে আসে।'
    }
  },
  'no-porn': {
    id: 'no-porn',
    nameEn: 'No Pornography',
    nameBn: 'পর্নোগ্রাফি বর্জন',
    tagEn: 'Purify Visual Cortex',
    tagBn: 'দৃষ্টি ও চিন্তা শুদ্ধিকরণ',
    color: '#8b5cf6',
    gradient: 'from-violet-600 to-fuchsia-500',
    rocketStyle: 'crystal',
    flameColor: '#8b5cf6',
    impactEn: {
      health: 'Causes severe erectile dysfunctions and visual cortex over-saturation, ruining physical intimate health.',
      mind: 'Studies show shrinkage in prefrontal cortex grey matter. Destroys healthy dopamine rewards, causing severe depression.',
      family: 'Distorts normal intimacy perspectives, leading to unrealistic expectations, broken trust, and high divorce rates.',
      society: 'Objectifies human beings, fuels illegal rings, and leads to general social moral decay and elevated sexual crimes.',
      advantages: 'Brain rewires completely. Gray matter density restores, visual concentration thickens, and authentic relationships become profoundly fulfilling.'
    },
    impactBn: {
      health: 'গুরুতর শারীরিক অক্ষমতা এবং চোখের ভিজ্যুয়াল কর্টেক্সের অতিরিক্ত স্যাচুরেশন ঘটায়, যা দীর্ঘস্থায়ী দাম্পত্য স্বাস্থ্য ধ্বংস করে।',
      mind: 'গবেষণায় দেখা গেছে এটি মস্তিষ্কের প্রি-ফ্রন্টাল কর্টেক্সের গ্রে-ম্যাটার বা ধূসর অংশ সংকুচিত করে। ডোপামিন রিসেপ্টর ভেঙে ফেলে তীব্র বিষণ্ণতা ঘটায়।',
      family: 'বাস্তব সম্পর্কের প্রতি দৃষ্টিভঙ্গি বিকৃত করে, ফলে অতিরিক্ত অলীক প্রত্যাশা তৈরি হয়, বিশ্বাস নষ্ট হয় এবং বিচ্ছেদ ডেকে আনে।',
      society: 'মানুষকে পণ্য হিসেবে দেখার মানসিকতা তৈরি করে, অপরাধচক্রকে জ্বালানি দেয় এবং নৈতিক অবক্ষয় ঘটিয়ে অপরাধের হার বাড়ায়।',
      advantages: 'মস্তিষ্ক তার আসল গঠনে ফিরে যায়। গ্রে-ম্যাটারের ঘনত্ব বৃদ্ধি পায়, চোখের ভাষা সুন্দর হয় এবং বাস্তব জীবনের সম্পর্কগুলি অর্থপূর্ণ হয়ে ওঠে।'
    }
  },
  'no-drugs': {
    id: 'no-drugs',
    nameEn: 'No Drugs',
    nameBn: 'মাদক বর্জন',
    tagEn: 'Sober Mind, Safe Orbit',
    tagBn: 'সুস্থ মস্তিষ্ক, নিরাপদ জীবন',
    color: '#06b6d4',
    gradient: 'from-cyan-500 to-blue-400',
    rocketStyle: 'fusion',
    flameColor: '#06b6d4',
    impactEn: {
      health: 'Destroys liver hepatocytes, kills brain cells, increases rate of toxic cardiorespiratory arrests, and causes organ failures.',
      mind: 'Induces chronic clinical paranoia, psychoses, permanent memory loss, and severe cognitive impairment.',
      family: 'Ruins families financially, leads to internal domestic violence, high divorce rates, and trauma for children.',
      society: 'Elevates local theft, violent crimes, illicit cartels, and severely burdens the national public health sector.',
      advantages: 'Organs detoxify, liver cells regenerate, memory and logical functions normalize, and physical longevity is extended by decades.'
    },
    impactBn: {
      health: 'লিভারের কার্যকারিতা নষ্ট করে, মস্তিষ্কের কোষ ধ্বংস করে, হৃদরোগ ও ফুসফুসের জটিলতা বহুগুণ বাড়ায় এবং অঙ্গ বিকল করে দেয়।',
      mind: 'তীব্র মানসিক বিভ্রান্তি, প্যারানয়া, স্থায়ী স্মৃতিশক্তি লোপ এবং বুদ্ধিবৃত্তিক বৈকল্য তৈরি করে।',
      family: 'পারিবারিক সঞ্চয় শেষ করে দেয়, পারিবারিক কলহ ও নির্যাতনের জন্ম দেয় এবং সন্তানদের জন্য গভীর মানসিক আঘাত ডেকে আনে।',
      society: 'চুরি-ছিনতাই, সহিংস অপরাধ এবং চোরাচালান বৃদ্ধি করে, যার ফলে দেশের সার্বিক নিরাপত্তা ব্যবস্থা হুমকির মুখে পড়ে।',
      advantages: 'শরীরের বিষাক্ত টক্সিন দূর হয়, লিভারের কোষ আবার জন্মায়, স্মৃতিশক্তি ও যৌক্তিক চিন্তাভাবনা স্বাভাবিক হয় এবং স্বাভাবিক পরমায়ু বৃদ্ধি পায়।'
    }
  },
  'no-alcohol': {
    id: 'no-alcohol',
    nameEn: 'No Alcohol',
    nameBn: 'অ্যালকোহল বর্জন',
    tagEn: 'Clear Vision, Pure Pulse',
    tagBn: 'পরিষ্কার দৃষ্টি, বিশুদ্ধ রক্ত',
    color: '#ef4444',
    gradient: 'from-red-500 to-rose-400',
    rocketStyle: 'heavy',
    flameColor: '#ef4444',
    impactEn: {
      health: 'Triggers irreversible liver cirrhosis, esophageal varices, and cardiovascular muscle decay.',
      mind: 'Causes heavy CNS depression, severe emotional swings, and kills neural white matter, causing premature senility.',
      family: 'Directly linked to domestic abuse, emotional isolation, financial bankruptcy, and high family trauma.',
      society: 'Responsible for 30% of global drunk-driving road fatalities, physical brawls, and community vandalism.',
      advantages: 'Liver fat declines by 20% in weeks. Deeper restorative sleep is achieved, skin rejuvenates, and heart rate stabilizes beautifully.'
    },
    impactBn: {
      health: 'লিভার সিরোসিস বা যকৃতের অকার্যকারিতা, খাদ্যনালীর রক্তপাত এবং হৃদযন্ত্রের পেশীর ক্ষয় ঘটায়।',
      mind: 'কেন্দ্রীয় স্নায়ুতন্ত্রকে নিস্তেজ করে দেয়, মেজাজের উগ্রতা বাড়ায় এবং হোয়াইট-ম্যাটার ধ্বংস করে অকাল বার্ধক্য ডেকে আনে।',
      family: 'পারিবারিক নির্যাতন, তীব্র মানসিক দূরত্ব, অর্থনৈতিক দেউলিয়াত্ব এবং চরম পারিবারিক অশান্তির অন্যতম প্রধান কারণ।',
      society: 'বিশ্বজুড়ে ৩০% সড়ক দুর্ঘটনার জন্য মাতাল অবস্থায় গাড়ি চালানো দায়ী। এটি সামাজিক বিশৃঙ্খলা এবং কলহের সৃষ্টি করে।',
      advantages: 'কয়েক সপ্তাহের মধ্যে লিভারের চর্বি ২০% কমে যায়। গভীর ও শান্তিপূর্ণ ঘুম অর্জিত হয়, ত্বক সজীব হয় এবং হৃদস্পন্দন শান্ত ও বিশুদ্ধ হয়।'
    }
  }
};

const renderCategoryIcon = (iconName: string, className = "w-5 h-5 text-indigo-400") => {
  switch (iconName) {
    case 'Heart': return <Heart className={className} />;
    case 'Brain': return <Brain className={className} />;
    case 'Shield': return <Shield className={className} />;
    case 'Zap': return <Zap className={className} />;
    case 'Activity': return <TrendingUp className={className} />;
    case 'Smile': return <Sparkles className={className} />;
    case 'Users': return <Users className={className} />;
    default: return <Shield className={className} />;
  }
};

export default function App() {
  // Application UI states
  const [activeTab, setActiveTab] = useState<'dashboard' | 'habits' | 'pass' | 'sqlite' | 'policies'>('dashboard');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [resolvedAvatarUrl, setResolvedAvatarUrl] = useState('');
  const [streaks, setStreaks] = useState<Record<HabitId, StreakState>>({} as any);
  
  // Audio state
  const [isMuted, setIsMuted] = useState(false);
  const [language, setLanguage] = useState<'en' | 'bn'>('en');

  // Onboarding Wizard states
  const [isOnboarding, setIsOnboarding] = useState(true);
  const [onboardStep, setOnboardStep] = useState(1);
  const [formName, setFormName] = useState('');
  const [formAvatar, setFormAvatar] = useState('');
  const [formHabits, setFormHabits] = useState<HabitId[]>([]);
  const [formTargets, setFormTargets] = useState<Record<HabitId, TargetKey>>({} as any);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarUploadProgress, setAvatarUploadProgress] = useState(0);

  // Active Habit context
  const [currentSelectedHabit, setCurrentSelectedHabit] = useState<HabitId>('no-smoking');

  // Interactive Scan Button States
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [isLaunching, setIsLaunching] = useState(false);
  const [shakeScreen, setShakeScreen] = useState(false);

  // Health Detail Popup State
  const [activeHistoryDay, setActiveHistoryDay] = useState<number | null>(null);
  const [activeHistoryHabit, setActiveHistoryHabit] = useState<HabitId | null>(null);
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);

  // Honest Recovery/Fail dialog states
  const [showFailConfirm, setShowFailConfirm] = useState<HabitId | null>(null);
  const [failedResult, setFailedResult] = useState<{ highest: number; quote: string; quoteBn: string } | null>(null);
  const [showRecoveryDialog, setShowRecoveryDialog] = useState<HabitId | null>(null);
  const [recoveryDays, setRecoveryDays] = useState(1);

  // Celebratory Milestone Popup
  const [showMilestone, setShowMilestone] = useState<{ habitId: HabitId; targetDays: number } | null>(null);

  // In-App Notification Toast
  const [pushToast, setPushToast] = useState<{ title: string; body: string } | null>(null);

  // Dynamic Sector Settings Editor States
  const [isEditingSectors, setIsEditingSectors] = useState(false);
  const [editSectorsList, setEditSectorsList] = useState<HabitId[]>([]);
  const [editTargets, setEditTargets] = useState<Record<HabitId, TargetKey>>({} as any);

  // Load state from local Simulated SQLite database
  useEffect(() => {
    refreshDatabaseStates();
    // Start periodic background notifications simulator after 5 seconds
    const timer = setTimeout(() => {
      triggerRandomNotification();
    }, 12000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (profile?.avatarUrl) {
      if (profile.avatarUrl.startsWith('indexeddb:')) {
        avatarStorage.getAvatar('user_avatar').then((val) => {
          if (val) {
            setResolvedAvatarUrl(val);
          } else {
            setResolvedAvatarUrl('');
          }
        });
      } else {
        setResolvedAvatarUrl(profile.avatarUrl);
      }
    } else {
      setResolvedAvatarUrl('');
    }
  }, [profile]);

  const refreshDatabaseStates = () => {
    const dbProfile = sqlite.getProfile();
    const dbStreaks = sqlite.getStreaks();

    if (dbProfile) {
      setProfile(dbProfile);
      setLanguage(dbProfile.language);
      setIsOnboarding(false);
      
      // Auto-select first active habit if current is disabled
      if (dbProfile.selectedHabits.length > 0) {
        if (!dbProfile.selectedHabits.includes(currentSelectedHabit)) {
          setCurrentSelectedHabit(dbProfile.selectedHabits[0]);
        }
      }
    } else {
      setIsOnboarding(true);
      setOnboardStep(1);
    }
    setStreaks(dbStreaks);
    setIsMuted(sounds.getMuteState());
  };

  // Sound toggler
  const handleToggleMute = () => {
    const muted = sounds.toggleMute();
    setIsMuted(muted);
  };

  // Language toggler
  const handleToggleLanguage = () => {
    sounds.playLanguageChime();
    const nextLang = language === 'en' ? 'bn' : 'en';
    setLanguage(nextLang);
    
    if (profile) {
      sqlite.setProfile({ ...profile, language: nextLang }, profile.selectedHabits);
      setProfile({ ...profile, language: nextLang });
    }
  };

  // Clear Database & Cache Option
  const handleClearAllData = () => {
    sounds.playClick();
    const confirmMessage = language === 'en'
      ? 'Are you absolutely sure you want to delete all profile data, habit progress, and database logs? This action CANNOT be undone!'
      : 'আপনি কি নিশ্চিতভাবে সব প্রোফাইল ডাটা, অভ্যাস অগ্রগতি এবং ডাটাবেস লগ মুছে ফেলতে চান? এই কাজটি আর ফিরিয়ে আনা যাবে না!';
    if (window.confirm(confirmMessage)) {
      sqlite.resetAllData();
      sounds.playSuccessChime();
      setProfile(null);
      setStreaks({} as any);
      setIsOnboarding(true);
      setOnboardStep(1);
      setFormName('');
      setFormAvatar('');
      setFormHabits([]);
      setFormTargets({} as any);
      setActiveTab('dashboard');
      refreshDatabaseStates();
    }
  };

  // Open Sector Settings Editor
  const handleOpenSectorsEditor = () => {
    if (profile) {
      setEditSectorsList([...profile.selectedHabits]);
      const currentTargets: Record<HabitId, TargetKey> = {} as any;
      (Object.keys(HABIT_CONFIGS) as HabitId[]).forEach((hid) => {
        const strk = streaks[hid];
        currentTargets[hid] = strk ? (strk.target as TargetKey) : '1-month';
      });
      setEditTargets(currentTargets);
      setIsEditingSectors(true);
      sounds.playClick();
    }
  };

  // Save Sector Settings Editor
  const handleSaveSectorsEditor = () => {
    if (!profile) return;
    if (editSectorsList.length === 0) {
      sounds.playErrorBuzz();
      return;
    }

    sqlite.setProfile(
      {
        name: profile.name,
        avatarUrl: profile.avatarUrl,
        joinedDate: profile.joinedDate,
        language: profile.language,
        theme: profile.theme,
      },
      editSectorsList
    );

    editSectorsList.forEach((id) => {
      const targetVal = editTargets[id] || '1-month';
      sqlite.updateTarget(id, targetVal);
    });

    sounds.playSuccessChime();
    setIsEditingSectors(false);
    refreshDatabaseStates();
  };

  // Onboarding Avatar Upload handler (Reads any image format including PNG, WebP, JPG, GIF losslessly and cleanly with progress indicators)
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploadingAvatar(true);
      setAvatarUploadProgress(10);
      sounds.playClick();

      processImageFile(file, (p) => setAvatarUploadProgress(p))
        .then((base64) => {
          setFormAvatar(base64);
          setIsUploadingAvatar(false);
          sounds.playSuccessChime();
        })
        .catch((err) => {
          console.error(err);
          setIsUploadingAvatar(false);
          sounds.playErrorBuzz();
        });
    }
  };

  // complete onboarding wizard
  const handleOnboardingComplete = () => {
    if (!formName.trim() || formHabits.length === 0) {
      sounds.playErrorBuzz();
      return;
    }

    sounds.playSuccessChime();

    // 1. Set profiles
    sqlite.setProfile(
      {
        name: formName.trim(),
        avatarUrl: formAvatar || '',
        joinedDate: new Date().toISOString(),
        language,
        theme: 'dark',
      },
      formHabits
    );

    // 2. Setup targets in db
    formHabits.forEach((id) => {
      const selectedTarget = formTargets[id] || '1-month';
      sqlite.updateTarget(id, selectedTarget);
    });

    refreshDatabaseStates();
  };

  // Push notifications simulator
  const triggerRandomNotification = () => {
    const titles = {
      en: 'Flight Command Center',
      bn: 'ফ্লাইট কন্ট্রোল সেন্টার'
    };
    const reminders = [
      {
        en: 'Space Cadet! Your rocket engines are getting cold. Scan your fingerprint now for attendance.',
        bn: 'মহাকাশ ক্যাডেট! আপনার রকেট ইঞ্জিন ঠান্ডা হয়ে যাচ্ছে। এটেন্ডেন্স দিতে এখনই ফিঙ্গারপ্রিন্ট স্ক্যান করুন।'
      },
      {
        en: 'Honesty check: Integrity is your primary fuel. Keep flying high without crashing!',
        bn: 'সততার পরীক্ষা: নিষ্ঠাই আপনার প্রধান জ্বালানি। ক্র্যাশ না করে মেঘের ওপরে উড়তে থাকুন!'
      },
      {
        en: 'A beautiful report unlocked for your sector today. View My Habits to read it.',
        bn: 'আজ আপনার সেক্টরের জন্য একটি সুন্দর রিপোর্ট আনলক হয়েছে। পড়তে "আমার অভ্যাস" সেকশনে যান।'
      }
    ];

    const pick = reminders[Math.floor(Math.random() * reminders.length)];
    setPushToast({
      title: titles[language],
      body: language === 'en' ? pick.en : pick.bn,
    });

    sounds.playSuccessChime();
    // auto clear after 8 seconds
    setTimeout(() => {
      setPushToast(null);
    }, 8000);
  };

  // Fingerprint Scanner hold execution
  const scanIntervalRef = useRef<any>(null);

  const startScanning = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (isLaunching) return;

    sounds.playScanning();
    setIsScanning(true);
    setScanProgress(0);

    let progress = 0;
    scanIntervalRef.current = setInterval(() => {
      progress += 8;
      if (progress >= 100) {
        clearInterval(scanIntervalRef.current);
        triggerRocketLaunch();
      } else {
        setScanProgress(progress);
      }
    }, 100);
  };

  const stopScanning = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
    }
    if (!isLaunching) {
      setIsScanning(false);
      setScanProgress(0);
    }
  };

  // Fire up rocket!
  const triggerRocketLaunch = () => {
    setIsScanning(false);
    setScanProgress(100);
    setIsLaunching(true);
    setShakeScreen(true);
    sounds.playLaunchRumble();

    // After 2.5 seconds, complete check-in
    setTimeout(() => {
      setShakeScreen(false);
      const todayStr = new Date().toISOString().split('T')[0];
      
      let anySuccess = false;
      let milestoneHabit: HabitId | null = null;
      let milestoneDays = 30;

      if (profile && profile.selectedHabits && profile.selectedHabits.length > 0) {
        profile.selectedHabits.forEach((hid) => {
          const streak = streaks[hid];
          if (streak && !streak.history.includes(todayStr)) {
            const result = sqlite.checkIn(hid, todayStr);
            if (result.success) {
              anySuccess = true;
              if (result.isTargetMilestone) {
                milestoneHabit = hid;
                milestoneDays = streak.targetDays;
              }
            }
          }
        });
      } else {
        // Fallback for safety
        const result = sqlite.checkIn(currentSelectedHabit, todayStr);
        if (result.success) {
          anySuccess = true;
          if (result.isTargetMilestone) {
            const streak = sqlite.getStreaks()[currentSelectedHabit];
            milestoneHabit = currentSelectedHabit;
            milestoneDays = streak ? streak.targetDays : 30;
          }
        }
      }

      if (anySuccess) {
        sounds.playSuccessChime();
        if (milestoneHabit) {
          setShowMilestone({ habitId: milestoneHabit, targetDays: milestoneDays });
        }
      } else {
        // Already checked in today or check in issue
        sounds.playErrorBuzz();
      }

      setIsLaunching(false);
      setScanProgress(0);
      refreshDatabaseStates();
    }, 2500);
  };

  // "I Failed" button triggered
  const handleFailTrigger = (habitId: HabitId) => {
    sounds.playClick();
    setShowFailConfirm(habitId);
  };

  const handleFailConfirm = () => {
    if (!showFailConfirm) return;

    const res = sqlite.failHabit(showFailConfirm);
    sounds.playErrorBuzz();

    const quotes = [
      {
        en: '“Failure is simply the opportunity to begin again, this time more intelligently.” — Henry Ford',
        bn: '“ব্যর্থতা হল সহজভাবে আবার শুরু করার সুযোগ, এবার আরও বুদ্ধিমানের সাথে।” — হেনরি ফোর্ড'
      },
      {
        en: '“Fall seven times, stand up eight.” — Japanese Proverb. Honest flight is the best flight.',
        bn: '“সাতবার পড়ে যান, আটবার উঠে দাঁড়ান।” — জাপানি প্রবাদ। সততার ফ্লাইট-ই সেরা ফ্লাইট।'
      },
      {
        en: '“Your honest reset is a victory of truth. Your fuel is rebuilding right now.”',
        bn: '“আপনার সততার সাথে রিসেট করা সত্যের বড় জয়। আপনার রকেট জ্বালানি এখনই আবার তৈরি হচ্ছে।”'
      }
    ];

    const pick = quotes[Math.floor(Math.random() * quotes.length)];
    setFailedResult({
      highest: res.highestStreak,
      quote: pick.en,
      quoteBn: pick.bn,
    });

    setShowFailConfirm(null);
    refreshDatabaseStates();
  };

  // Honest Recovery Action
  const handleRecoveryTrigger = (habitId: HabitId) => {
    sounds.playClick();
    setShowRecoveryDialog(habitId);
    setRecoveryDays(1);
  };

  const handleRecoveryConfirm = () => {
    if (!showRecoveryDialog) return;

    const success = sqlite.recoverDays(showRecoveryDialog, recoveryDays);
    if (success) {
      sounds.playSuccessChime();
    } else {
      sounds.playErrorBuzz();
    }

    setShowRecoveryDialog(null);
    refreshDatabaseStates();
  };

  // Day-by-Day report voice speaking
  const handleReadVoice = (text: string) => {
    if (isPlayingVoice) {
      sounds.stopSpeaking();
      setIsPlayingVoice(false);
    } else {
      setIsPlayingVoice(true);
      sounds.speakText(text, language, () => {
        setIsPlayingVoice(false);
      });
    }
  };

  // Close health dialog and stop any active speaking
  const handleCloseHealthDialog = () => {
    sounds.stopSpeaking();
    setIsPlayingVoice(false);
    setActiveHistoryDay(null);
    setActiveHistoryHabit(null);
  };

  const activeStreakState = streaks[currentSelectedHabit];
  const activeHabitConfig = HABIT_CONFIGS[currentSelectedHabit];

  // Helper check-in eligibility
  const todayISO = new Date().toISOString().split('T')[0];
  const alreadyCheckedInToday = profile && profile.selectedHabits && profile.selectedHabits.length > 0
    ? profile.selectedHabits.every((hid) => streaks[hid]?.history.includes(todayISO))
    : activeStreakState?.history.includes(todayISO);

  const totalStreakDays = Object.values(streaks).reduce((sum, s) => sum + ((s as any).currentStreak || 0), 0);

  return (
    <div className={`min-h-screen bg-[#020617] text-slate-100 font-sans flex flex-col justify-between overflow-x-hidden relative ${shakeScreen ? 'animate-[shake_0.4s_infinite]' : ''}`}>
      {/* Immersive UI Glowing Blur Gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-900/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-orange-900/10 rounded-full blur-[150px]" />
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-purple-900/20 rounded-full blur-[100px]" />
      </div>

      {/* Top Header App Bar */}
      <header className="h-16 md:h-20 flex items-center justify-between px-3 md:px-8 z-40 border-b border-white/5 bg-slate-900/40 backdrop-blur-md sticky top-0">
        {isOnboarding ? (
          <div className="flex items-center space-x-2 md:space-x-3">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-gradient-to-tr from-violet-600 to-cyan-400 p-0.5 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <div className="w-full h-full rounded-[6px] md:rounded-[10px] bg-slate-950 flex items-center justify-center">
                <Rocket className="w-4 h-4 md:w-5 md:h-5 text-violet-400" />
              </div>
            </div>
            <div>
              <h1 className="text-sm md:text-base font-black tracking-wide bg-gradient-to-r from-violet-400 to-cyan-300 bg-clip-text text-transparent">
                VANGUARD 3D
              </h1>
              <p className="text-[8px] md:text-[10px] uppercase font-mono tracking-widest text-slate-500">
                {language === 'en' ? 'Rocket Streak System' : 'রকেট স্ট্রিক সিস্টেম'}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 md:gap-4">
            <div className="w-9 h-9 md:w-12 md:h-12 rounded-full border-2 border-blue-500/30 p-0.5 bg-slate-800 flex-shrink-0">
              <div className="w-full h-full rounded-full bg-gradient-to-tr from-slate-700 to-slate-500 flex items-center justify-center overflow-hidden">
                {resolvedAvatarUrl ? (
                  <img src={resolvedAvatarUrl} alt="Avatar" className="w-full h-full object-cover animate-fade-in" />
                ) : (
                  <span className="text-xs font-black text-white">
                    {profile?.name ? profile.name.slice(0, 2).toUpperCase() : 'US'}
                  </span>
                )}
              </div>
            </div>
            <div>
              <h2 className="text-xs md:text-sm font-bold tracking-tight text-white leading-tight">
                {language === 'en' ? `Hello, ${profile?.name?.split(' ')[0] || 'Aryan'}` : `হ্যালো, ${profile?.name?.split(' ')[0] || 'আরিয়ান'}`}
              </h2>
              <p className="text-[8px] md:text-[9px] text-blue-400 font-mono tracking-widest uppercase mt-0.5 hidden sm:block">
                {language === 'en' ? 'Master of Self-Control' : 'স্ব-নিয়ন্ত্রণ চ্যাম্পিয়ন'}
              </p>
            </div>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center gap-2 md:gap-4">
          <div className="flex bg-slate-800/50 rounded-full p-0.5 md:p-1 border border-white/10">
            <button
              onClick={() => { if (language !== 'en') handleToggleLanguage(); }}
              className={`px-2 md:px-3 py-0.5 md:py-1 rounded-full text-[8px] md:text-[10px] font-bold transition-all ${
                language === 'en'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => { if (language !== 'bn') handleToggleLanguage(); }}
              className={`px-2 md:px-3 py-0.5 md:py-1 rounded-full text-[8px] md:text-[10px] font-bold transition-all ${
                language === 'bn'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              বাংলা
            </button>
          </div>

          {!isOnboarding && (
            <div className="flex items-center gap-1 md:gap-1.5 px-1.5 md:px-2 py-1 bg-slate-900/40 rounded-xl border border-white/5">
              <span className="text-sm md:text-lg font-black text-orange-500 leading-none">{totalStreakDays}</span>
              <div className="w-3 md:w-3.5 h-4 md:h-5 bg-gradient-to-t from-red-600 via-orange-500 to-yellow-300 rounded-t-full rounded-b-sm animate-pulse shadow-[0_0_15px_rgba(249,115,22,0.6)] shrink-0"></div>
              <p className="text-[7px] md:text-[8px] text-slate-500 uppercase tracking-widest font-mono hidden sm:block shrink-0 ml-1">
                {language === 'en' ? 'Total Streaks' : 'মোট স্ট্রিক দিন'}
              </p>
            </div>
          )}

          <button
            onClick={handleToggleMute}
            className="p-1.5 md:p-2 rounded-xl bg-slate-800/50 border border-white/10 hover:bg-slate-800 transition-all text-slate-400 hover:text-white shrink-0"
            title="Mute/Unmute Audio"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>
        </div>
      </header>

      {/* Main Content Space */}
      <main className={`flex-grow flex flex-col items-center justify-start p-4 md:p-6 w-full mx-auto pb-28 relative z-10 ${activeTab === 'dashboard' && !isOnboarding ? 'max-w-7xl' : 'max-w-5xl'}`}>

        {/* 1. Onboarding Form Container */}
        {isOnboarding ? (
          <div className="w-full max-w-md bg-slate-900/60 border border-white/10 rounded-3xl p-6 md:p-8 text-center shadow-2xl relative overflow-hidden my-6 backdrop-blur-md">
            <div className="absolute top-0 left-0 w-32 h-32 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

            {onboardStep === 1 ? (
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-violet-500/10 flex items-center justify-center mb-6 border border-violet-500/20">
                  <User className="w-8 h-8 text-violet-400" />
                </div>
                <h2 className="text-2xl font-black text-white">
                  {language === 'en' ? 'INITIATE FLIGHT PROFILE' : 'ফ্লাইট প্রোফাইল সেটআপ'}
                </h2>
                <p className="text-xs text-slate-400 mt-2 max-w-sm">
                  {language === 'en' 
                    ? 'Enter your name and flight badge to initialize your local offline SQLite challenge.' 
                    : 'আপনার লোকাল SQLite চ্যালেঞ্জ চালু করতে নাম এবং ক্রু ব্যাজ আপলোড করুন।'}
                </p>

                {/* Input Name */}
                <div className="w-full mt-8 text-left">
                  <label className="text-xs text-slate-400 font-bold block mb-2 uppercase tracking-wider">
                    {language === 'en' ? 'Full Space Name:' : 'সম্পূর্ণ নাম:'}
                  </label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-violet-500 focus:outline-none px-4 py-3 rounded-xl text-sm font-semibold text-white placeholder-slate-600"
                    placeholder="E.g. CAPTAIN SHEPARD"
                  />
                </div>

                {/* Picture Upload Base64 */}
                <div className="w-full mt-6 text-left">
                  <label className="text-xs text-slate-400 font-bold block mb-2 uppercase tracking-wider">
                    {language === 'en' ? 'Flight Badge Picture:' : 'ক্রু প্রোফাইল ছবি:'}
                  </label>
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center relative overflow-hidden">
                      {formAvatar ? (
                        <img src={formAvatar} alt="Upload" className="w-full h-full object-cover" />
                      ) : (
                        <Camera className="w-6 h-6 text-slate-600" />
                      )}
                      {isUploadingAvatar && (
                        <div className="absolute inset-0 bg-slate-950/85 flex flex-col items-center justify-center">
                          <span className="text-[10px] font-black font-mono text-cyan-400 animate-pulse">{avatarUploadProgress}%</span>
                          <div className="w-12 h-1 bg-slate-800 rounded-full mt-1 overflow-hidden">
                            <div className="h-full bg-cyan-400 transition-all duration-100" style={{ width: `${avatarUploadProgress}%` }} />
                          </div>
                        </div>
                      )}
                    </div>
                    <label className="bg-slate-950 border border-slate-800 hover:bg-slate-800 text-xs font-bold text-slate-300 px-4 py-2.5 rounded-xl cursor-pointer transition-all">
                      {language === 'en' ? 'Browse Image' : 'ছবি নির্বাচন করুন'}
                      <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                    </label>
                  </div>
                </div>

                {/* Next Button */}
                <button
                  onClick={() => {
                    sounds.playClick();
                    if (formName.trim()) setOnboardStep(2);
                  }}
                  disabled={!formName.trim()}
                  className="w-full mt-10 bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white font-bold py-3.5 rounded-xl text-sm transition-all shadow-lg shadow-violet-500/20 disabled:opacity-50"
                >
                  {language === 'en' ? 'NEXT SECTOR' : 'পরবর্তী ধাপ'}
                </button>
              </div>
            ) : onboardStep === 2 ? (
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-cyan-500/10 flex items-center justify-center mb-6 border border-cyan-500/20">
                  <Rocket className="w-8 h-8 text-cyan-400 animate-pulse" />
                </div>
                <h2 className="text-2xl font-black text-white">
                  {language === 'en' ? 'SELECT SECTOR HABITS' : 'বর্জনীয় অভ্যাসসমূহ'}
                </h2>
                <p className="text-xs text-slate-400 mt-2">
                  {language === 'en'
                    ? 'Select the physical/mental habits you honestly wish to give up forever.'
                    : 'শারীরিক ও মানসিকভাবে যে অভ্যাসগুলি আপনি চিরতরে বাদ দিতে চান সেগুলি নির্বাচন করুন।'}
                </p>

                {/* Habit Options */}
                <div className="w-full mt-8 space-y-3">
                  {(Object.keys(HABIT_CONFIGS) as HabitId[]).map((id) => {
                    const c = HABIT_CONFIGS[id];
                    const selected = formHabits.includes(id);
                    return (
                      <div
                        key={id}
                        onClick={() => {
                          sounds.playClick();
                          if (selected) {
                            setFormHabits(formHabits.filter((h) => h !== id));
                          } else {
                            setFormHabits([...formHabits, id]);
                          }
                        }}
                        className={`p-4 rounded-2xl border text-left cursor-pointer transition-all flex items-center justify-between ${
                          selected
                            ? 'bg-slate-950 border-violet-500/60 shadow-lg shadow-violet-500/5'
                            : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div>
                          <span className="text-sm font-bold text-white">
                            {language === 'en' ? c.nameEn : c.nameBn}
                          </span>
                          <span className="text-[11px] text-slate-500 block mt-0.5">
                            {language === 'en' ? c.tagEn : c.tagBn}
                          </span>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-md border flex items-center justify-center ${
                            selected ? 'bg-violet-600 border-violet-500' : 'border-slate-700'
                          }`}
                        >
                          {selected && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Target Configuration mapping for selected habits */}
                {formHabits.length > 0 && (
                  <div className="w-full mt-6 text-left">
                    <label className="text-xs text-slate-400 font-bold block mb-3 uppercase tracking-wider">
                      {language === 'en' ? 'CHOOSE YOUR CHALLENGE TARGETS:' : 'চ্যালেঞ্জের লক্ষ্যমাত্রা নির্ধারণ করুন:'}
                    </label>
                    <div className="space-y-4">
                      {formHabits.map((hid) => {
                        const hConfig = HABIT_CONFIGS[hid];
                        const currentVal = formTargets[hid] || '1-month';
                        return (
                          <div key={hid} className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3">
                            <span className="text-xs font-bold text-slate-300">
                              {language === 'en' ? hConfig.nameEn : hConfig.nameBn}
                            </span>
                            <select
                              value={currentVal}
                              onChange={(e) => {
                                sounds.playClick();
                                setFormTargets({ ...formTargets, [hid]: e.target.value as TargetKey });
                              }}
                              className="bg-slate-900 border border-slate-800 text-xs rounded-lg px-2 py-1 text-slate-300 focus:outline-none focus:border-violet-500"
                            >
                              <option value="1-month">{language === 'en' ? '1 Month (30 Days)' : '১ মাস (৩০ দিন)'}</option>
                              <option value="3-months">{language === 'en' ? '3 Months (90 Days)' : '৩ মাস (৯০ দিন)'}</option>
                              <option value="6-months">{language === 'en' ? '6 Months (180 Days)' : '৬ মাস (১৮০ দিন)'}</option>
                              <option value="1-year">{language === 'en' ? '1 Year (365 Days)' : '১ বছর (৩৬৫ দিন)'}</option>
                            </select>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Navigate Buttons */}
                <div className="flex space-x-3 w-full mt-8">
                  <button
                    onClick={() => {
                      sounds.playClick();
                      setOnboardStep(1);
                    }}
                    className="flex-1 bg-slate-950 border border-slate-800 hover:bg-slate-850 text-slate-300 font-bold py-3.5 rounded-xl text-sm transition-all"
                  >
                    {language === 'en' ? 'BACK' : 'পূর্ববর্তী'}
                  </button>
                  <button
                    onClick={() => {
                      sounds.playClick();
                      if (formHabits.length > 0) setOnboardStep(3);
                    }}
                    disabled={formHabits.length === 0}
                    className="flex-1 bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white font-bold py-3.5 rounded-xl text-sm transition-all disabled:opacity-50"
                  >
                    {language === 'en' ? 'NEXT' : 'পরবর্তী'}
                  </button>
                </div>
              </div>
            ) : (
              // Onboarding step 3: Detailed Educational Impacts of Selected Habits
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-6 border border-emerald-500/20">
                  <BookOpen className="w-8 h-8 text-emerald-400 animate-pulse" />
                </div>
                <h2 className="text-2xl font-black text-white">
                  {language === 'en' ? 'HEALTH IMPACT DISCLOSURE' : 'স্বাস্থ্য প্রভাব ও সচেতনতা'}
                </h2>
                <p className="text-xs text-slate-400 mt-2 mb-6">
                  {language === 'en'
                    ? 'Understand the physical, mental, and social consequences of selected habits before entry.'
                    : 'ভ্রমণ শুরুর আগে অভ্যাসের শারীরিক, মানসিক এবং সামাজিক প্রভাবগুলি একনজরে দেখে নিন।'}
                </p>

                {/* Educational Display */}
                <div className="w-full space-y-4 max-h-[350px] overflow-y-auto pr-1 text-left">
                  {formHabits.map((hid) => {
                    const hConfig = HABIT_CONFIGS[hid];
                    const text = language === 'en' ? hConfig.impactEn : hConfig.impactBn;
                    return (
                      <div key={hid} className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4">
                        <span className="text-xs font-bold uppercase tracking-wider block mb-2 px-2 py-0.5 rounded-full inline-block text-white" style={{ backgroundColor: hConfig.color }}>
                          {language === 'en' ? hConfig.nameEn : hConfig.nameBn}
                        </span>
                        
                        <div className="space-y-3 text-[11px] leading-relaxed mt-2 text-slate-300">
                          <p>
                            <strong className="text-red-400">{language === 'en' ? '🧠 Mental Harm:' : '🧠 মানসিক ক্ষতি:'} </strong>
                            {text.mind}
                          </p>
                          <p>
                            <strong className="text-orange-400">{language === 'en' ? '🫁 Biological Harm:' : '🫁 শারীরিক ক্ষতি:'} </strong>
                            {text.health}
                          </p>
                          <p>
                            <strong className="text-blue-400">{language === 'en' ? '🏡 Family Harm:' : '🏡 পারিবারিক ক্ষতি:'} </strong>
                            {text.family}
                          </p>
                          <p>
                            <strong className="text-purple-400">{language === 'en' ? '🌍 Social Harm:' : '🌍 সামাজিক ক্ষতি:'} </strong>
                            {text.society}
                          </p>
                          <p className="bg-emerald-950/40 p-2.5 rounded-lg border border-emerald-900/30 text-emerald-300">
                            <strong className="text-emerald-400">{language === 'en' ? '✨ Recovery Advantage:' : '✨ পুনরুদ্ধারের সুবিধা:'} </strong>
                            {text.advantages}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Final Submit launch button */}
                <div className="flex space-x-3 w-full mt-8">
                  <button
                    onClick={() => {
                      sounds.playClick();
                      setOnboardStep(2);
                    }}
                    className="flex-1 bg-slate-950 border border-slate-800 hover:bg-slate-850 text-slate-300 font-bold py-3.5 rounded-xl text-sm transition-all"
                  >
                    {language === 'en' ? 'BACK' : 'পূর্ববর্তী'}
                  </button>
                  <button
                    onClick={handleOnboardingComplete}
                    className="flex-1 bg-gradient-to-r from-emerald-600 to-cyan-500 hover:from-emerald-500 hover:to-cyan-400 text-white font-bold py-3.5 rounded-xl text-sm transition-all"
                  >
                    {language === 'en' ? 'LAUNCH MISSION' : 'মিশন শুরু করুন'}
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* 2. Main Dashboard Application layout screen */
          <div className="w-full flex flex-col items-center">

            {/* Simulated Push Notification Banner */}
            {pushToast && (
              <div className="w-full max-w-md bg-slate-900 border border-violet-500/50 rounded-2xl p-4 shadow-2xl flex items-start space-x-3 text-left animate-[bounce_1s_infinite] my-2 relative z-50">
                <div className="w-8 h-8 rounded-full bg-violet-600/20 flex items-center justify-center text-violet-400 shrink-0">
                  <Rocket className="w-4 h-4" />
                </div>
                <div className="flex-grow">
                  <h4 className="text-xs font-black text-white uppercase tracking-wider">{pushToast.title}</h4>
                  <p className="text-[11px] text-slate-300 mt-1">{pushToast.body}</p>
                </div>
                <button onClick={() => setPushToast(null)} className="text-slate-500 hover:text-white shrink-0">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Dashboard Sub-Tabs View Controllers (Only if dashboard tab is active) */}
            {activeTab === 'dashboard' && (
              <div className="w-full flex flex-col lg:flex-row gap-6 items-stretch justify-center relative z-10 animate-fade-in">
                
                {/* COLUMN 1: Active Habits / অভ্যাসের তালিকা */}
                <div className="w-full lg:w-1/4 flex flex-col gap-4 text-left">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">
                    {language === 'en' ? 'Active Sectors' : 'সক্রিয় সেক্টরসমূহ'}
                  </h3>
                  <div className="flex flex-col gap-4">
                    {profile?.selectedHabits.map((hid) => {
                      const config = HABIT_CONFIGS[hid];
                      const active = currentSelectedHabit === hid;
                      const streak = streaks[hid];
                      const progressPercent = streak ? Math.min(100, (streak.currentStreak / streak.targetDays) * 100) : 0;
                      return (
                        <div
                          key={hid}
                          onClick={() => {
                            sounds.playClick();
                            setCurrentSelectedHabit(hid);
                          }}
                          className={`p-4 rounded-2xl border transition-all cursor-pointer backdrop-blur-sm relative overflow-hidden ${
                            active
                              ? 'bg-slate-800/40 border-blue-500/40 shadow-lg shadow-blue-500/10'
                              : 'bg-slate-900/40 border-white/5 hover:border-white/10 opacity-70 hover:opacity-100'
                          }`}
                        >
                          {/* Top row with name and status indicators */}
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: config.color }}>
                              {language === 'en' ? config.nameEn : config.nameBn}
                            </span>
                            <div className="flex gap-1">
                              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: active ? config.color : '#475569' }}></div>
                              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: active && streak?.currentStreak >= 5 ? config.color : '#475569' }}></div>
                              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: active && streak?.currentStreak >= 15 ? config.color : '#475569' }}></div>
                            </div>
                          </div>

                          {/* Days count */}
                          <div className="text-xl font-black text-white">
                            {streak ? streak.currentStreak : 0} {language === 'en' ? 'Days' : 'দিন'}
                          </div>

                          {/* Small custom progress bar */}
                          <div className="w-full bg-slate-700/50 h-1 mt-2.5 rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${progressPercent}%`, backgroundColor: config.color }}></div>
                          </div>

                          {/* Mini info/button */}
                          <div className="mt-2.5 flex items-center justify-between text-[9px] text-slate-400 font-mono">
                            <span>TARGET: {streak?.targetDays}d</span>
                            {active && <span className="text-blue-400 font-bold uppercase tracking-widest">{language === 'en' ? 'Active' : 'চলতি'}</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* COLUMN 2: Mission Control Center */}
                <div className="flex-1 flex flex-col items-center justify-start relative px-4 py-6">
                  {/* Orbit concentric background circles matching mockup */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none z-0">
                    <div className="w-[420px] h-[420px] border border-dashed border-blue-500/30 rounded-full flex items-center justify-center animate-[spin_60s_linear_infinite]"></div>
                    <div className="absolute w-72 h-72 border border-blue-400/20 rounded-full animate-[spin_40s_linear_infinite_reverse]"></div>
                  </div>

                  <div className="relative flex flex-col items-center w-full z-10">
                    {/* Mission Header */}
                    <div className="mb-6 text-center">
                      <p className="text-blue-400 text-[10px] uppercase tracking-[0.25em] font-bold mb-1">
                        {language === 'en' ? 'MISSION CONTROL' : 'মিশন কন্ট্রোল'}
                      </p>
                      <h1 className="text-3xl md:text-4xl font-black italic tracking-wide text-white">
                        {language === 'en' ? 'DAY' : 'দিন'} {activeStreakState?.currentStreak} / {activeStreakState?.targetDays}
                      </h1>
                      <div className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest font-mono">
                        {language === 'en' ? `Target: ${activeStreakState?.target}` : `টার্গেট: ${activeStreakState?.target}`}
                      </div>
                    </div>

                    {/* Flame level selector */}
                    <div className="mb-4 z-20">
                      <FlameSelector currentStreak={activeStreakState?.currentStreak || 0} />
                    </div>

                    {/* Interactive 3D Rocket */}
                    <div className="w-full max-w-[280px]">
                      <ThreeDRocket
                        habitId={currentSelectedHabit}
                        flameLevel={
                          activeStreakState?.currentStreak <= 5
                            ? 1
                            : activeStreakState?.currentStreak <= 15
                            ? 2
                            : activeStreakState?.currentStreak <= 30
                            ? 3
                            : 4
                        }
                        isLaunching={isLaunching}
                        theme={profile?.theme || 'dark'}
                      />
                    </div>

                    {/* Fingerprint check-in trigger */}
                    <div className="w-full flex flex-col items-center mt-6">
                      <p className="text-xs font-semibold text-slate-400 mb-4 uppercase tracking-widest min-h-[16px]">
                        {alreadyCheckedInToday
                          ? (language === 'en' ? 'All Sectors Checked in Today ✓' : 'আজকের সব সেক্টর চেক-ইন সম্পন্ন ✓')
                          : (language === 'en' ? 'Hold Fingerprint to Check-in All' : 'সব সেক্টর চেক-ইন করতে ফিঙ্গারপ্রিন্ট চেপে ধরুন')}
                      </p>

                      <div className="w-20 h-20 relative group">
                        <div className="absolute inset-0 bg-blue-600 rounded-full blur-[40px] opacity-25 group-hover:opacity-50 transition-opacity pointer-events-none"></div>
                        <button
                          onMouseDown={alreadyCheckedInToday ? undefined : startScanning}
                          onMouseUp={alreadyCheckedInToday ? undefined : stopScanning}
                          onMouseLeave={alreadyCheckedInToday ? undefined : stopScanning}
                          onTouchStart={alreadyCheckedInToday ? undefined : startScanning}
                          onTouchEnd={alreadyCheckedInToday ? undefined : stopScanning}
                          id="btn-fingerprint"
                          className={`w-full h-full rounded-full border-2 flex items-center justify-center relative select-none cursor-pointer transition-all ${
                            alreadyCheckedInToday
                              ? 'border-emerald-500 bg-emerald-950/20 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                              : isScanning
                              ? 'border-cyan-400 bg-cyan-950/20 text-cyan-300 shadow-[0_0_30px_rgba(6,182,212,0.5)] scale-95'
                              : 'border-white/10 bg-gradient-to-b from-slate-800 to-slate-900 text-blue-400 hover:border-blue-500/50 hover:scale-105 shadow-[0_15px_40px_rgba(0,0,0,0.5)]'
                          }`}
                        >
                          {/* Laser sweep animation bar */}
                          {isScanning && (
                            <div
                              className="absolute w-full h-[2px] bg-cyan-400 left-0 animate-[scan_1.5s_infinite] shadow-[0_0_10px_rgba(6,182,212,0.8)]"
                              style={{ top: `${scanProgress}%` }}
                            />
                          )}

                          {/* Fingerprint Vector Graphic */}
                          <svg
                            viewBox="0 0 24 24"
                            className={`w-10 h-10 transition-transform ${isScanning ? 'scale-110' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                          >
                            <path d="M12 2a10 10 0 0 0-8 4M12 2a10 10 0 0 1 8 4M12 6a6 6 0 0 0-4 1.5M12 6a6 6 0 0 1 4 1.5M12 10a2 2 0 0 0-2 2M12 10a2 2 0 0 1 2 2" strokeLinecap="round" />
                            <path d="M8 12a4 4 0 0 0 8 0M6 14a6 6 0 0 0 12 0M4 16a8 8 0 0 0 16 0M2 18a10 10 0 0 0 20 0" strokeLinecap="round" />
                          </svg>

                          {alreadyCheckedInToday && (
                            <div className="absolute bottom-0 left-0 w-full h-1 bg-emerald-500 animate-pulse rounded-b-full"></div>
                          )}
                          {!alreadyCheckedInToday && (
                            <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-500 animate-pulse rounded-b-full"></div>
                          )}
                        </button>
                      </div>

                      {alreadyCheckedInToday && (
                        <p className="text-[10px] text-emerald-400 font-mono mt-3 uppercase tracking-wider">
                          {language === 'en' ? 'All Sectors Checked in Today ✓' : 'আজকের সব সেক্টর চেক-ইন সম্পন্ন ✓'}
                        </p>
                      )}
                    </div>

                    {/* Multi-stat diagnostic bottom row */}
                    {(() => {
                      const currentStreak = activeStreakState?.currentStreak || 0;
                      // Rocket Phase calculation
                      let phaseEn = 'Troposphere';
                      let phaseBn = 'ট্রপোস্ফিয়ার';
                      if (currentStreak >= 91) {
                        phaseEn = 'Deep Space';
                        phaseBn = 'মহাশূন্য';
                      } else if (currentStreak >= 31) {
                        phaseEn = 'Thermosphere';
                        phaseBn = 'থার্মোস্ফিয়ার';
                      } else if (currentStreak >= 16) {
                        phaseEn = 'Mesosphere';
                        phaseBn = 'মেসোস্ফিয়ার';
                      } else if (currentStreak >= 6) {
                        phaseEn = 'Stratosphere';
                        phaseBn = 'স্ট্রাটোস্ফিয়ার';
                      }

                      // Mental Health improvement calc
                      const mentalImprovement = (currentStreak * 0.4).toFixed(1);

                      return (
                        <div className="mt-12 flex gap-12 text-center">
                          <div>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">
                              {language === 'en' ? 'Rocket Phase' : 'রকেট পর্যায়'}
                            </p>
                            <p className="text-sm font-black text-white mt-1">
                              {language === 'en' ? phaseEn : phaseBn}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">
                              {language === 'en' ? 'Mental Health' : 'মানসিক স্বাস্থ্য'}
                            </p>
                            <p className="text-sm font-black text-green-400 mt-1">
                              +{mentalImprovement}%
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">
                              {language === 'en' ? 'Stability' : 'স্থিতিশীলতা'}
                            </p>
                            <p className={`text-sm font-black mt-1 ${alreadyCheckedInToday ? 'text-blue-400' : 'text-amber-400'}`}>
                              {alreadyCheckedInToday
                                ? (language === 'en' ? 'Optimal' : 'অনুকূল')
                                : (language === 'en' ? 'Awaiting' : 'অপেক্ষমাণ')}
                            </p>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* COLUMN 3: Daily Report / দৈনিক রিপোর্ট */}
                {(() => {
                  const currentStreakDay = activeStreakState?.currentStreak || 1;
                  const currentReport = getHealthImprovement(currentSelectedHabit, currentStreakDay);

                  // Custom advice triggers
                  let triggerEn = 'Be careful this evening; triggers might be high. Stay focused on your rocket launch.';
                  let triggerBn = 'আজ সন্ধ্যায় সচেতন থাকুন; ট্রিগার অনেক বেশি হতে পারে। রকেট উৎক্ষেপণে মনোযোগ বজায় রাখুন।';
                  if (currentSelectedHabit === 'no-smoking') {
                    triggerEn = 'Triggers can spike after meals or near social circles. Keep clean deep breathing close.';
                    triggerBn = 'খাবারের পর বা বন্ধুদের আড্ডায় সিগারেট পানের ইচ্ছে হতে পারে। সতেজ শ্বাস নিন।';
                  } else if (currentSelectedHabit === 'no-masturbation' || currentSelectedHabit === 'no-porn') {
                    triggerEn = 'Isolated visual triggers are highest when lonely or in bed. Keep screens outside the bedroom.';
                    triggerBn = 'একা থাকার সময় বা ঘুমানোর আগে পর্ন দেখার ট্রিগার কাজ করতে পারে। ডিভাইসটি দূরে রাখুন।';
                  } else if (currentSelectedHabit === 'no-drugs' || currentSelectedHabit === 'no-alcohol') {
                    triggerEn = 'Weekend triggers are dangerous. Replace toxic associations with high-protein hydration.';
                    triggerBn = 'উইকএন্ড বা ছুটির দিনে বিষাক্ত আসক্তির ইচ্ছে জাগতে পারে। পুষ্টিকর পানীয় গ্রহণ করুন।';
                  }

                  return (
                    <div className="w-full lg:w-1/4 flex flex-col">
                      <div className="bg-slate-900/60 border border-white/10 rounded-3xl p-6 relative overflow-hidden flex-grow shadow-2xl flex flex-col text-left backdrop-blur-sm">
                        <div className="absolute top-[-20%] right-[-20%] w-40 h-40 bg-blue-500/10 rounded-full blur-3xl"></div>
                        <div className="flex justify-between items-center mb-6 relative z-10">
                          <h4 className="text-[10px] font-bold text-slate-400 tracking-widest uppercase font-mono">
                            {language === 'en' ? 'DAILY REPORT' : 'দৈনিক রিপোর্ট'}
                          </h4>
                          <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded border border-white/5 font-bold font-mono">
                            {language === 'en' ? 'DAY' : 'দিন'} {currentStreakDay}
                          </span>
                        </div>
                        
                        <div className="space-y-5 flex-grow flex flex-col justify-between relative z-10">
                          {/* Rich interactive preview card */}
                          <div 
                            onClick={() => {
                              sounds.playClick();
                              setActiveHistoryDay(currentStreakDay);
                              setActiveHistoryHabit(currentSelectedHabit);
                            }}
                            className="group flex-grow flex flex-col justify-center p-4 bg-slate-950/40 border border-white/5 hover:border-indigo-500/30 hover:bg-slate-950/70 rounded-2xl cursor-pointer transition-all duration-300"
                          >
                            <p className="text-[9px] font-black text-indigo-400 tracking-wider uppercase font-mono mb-1.5 flex items-center gap-1.5">
                              {renderCategoryIcon(currentReport.icon, "w-3 h-3 text-indigo-400 animate-pulse")}
                              <span>{language === 'en' ? currentReport.category : (currentReport.category === 'Physical' ? 'শারীরিক' : currentReport.category === 'Mental' ? 'মানসিক' : currentReport.category === 'Biological' ? 'জৈবিক' : 'সামাজিক')}</span>
                            </p>
                            <h5 className="text-xs font-black text-white group-hover:text-indigo-300 transition-colors leading-snug">
                              {language === 'en' ? currentReport.titleEn : currentReport.titleBn}
                            </h5>
                            
                            <p className="text-[11px] leading-relaxed text-slate-400 font-sans mt-2 line-clamp-3">
                              {language === 'en' ? currentReport.descEn : currentReport.descBn}
                            </p>
                            
                            <div className="mt-3.5 pt-2.5 border-t border-white/5 flex items-center justify-between text-[9px] font-black tracking-widest text-indigo-400 uppercase font-mono group-hover:translate-x-1 transition-transform">
                              <span>{language === 'en' ? '🔬 View Clinical Dossier' : '🔬 বৈজ্ঞানিক ডসিয়ার দেখুন'}</span>
                              <span>→</span>
                            </div>
                          </div>

                          <div className="p-4 bg-red-900/20 border border-red-500/20 rounded-xl">
                            <p className="text-[10px] text-red-400 font-bold uppercase mb-1 tracking-wider">
                              {language === 'en' ? 'Critical Alert' : 'জরুরি সতর্কতা'}
                            </p>
                            <p className="text-[11px] text-slate-300 leading-normal">
                              {language === 'en' ? triggerEn : triggerBn}
                            </p>
                          </div>

                          <div className="space-y-3">
                            <button
                              onClick={() => handleFailTrigger(currentSelectedHabit)}
                              className="w-full py-3.5 bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-lg shadow-red-900/30 transition-all text-white text-center cursor-pointer"
                            >
                              {language === 'en' ? 'I Failed / Reset Streak' : 'আমি ব্যর্থ হয়েছি'}
                            </button>
                            <button
                              onClick={() => handleRecoveryTrigger(currentSelectedHabit)}
                              className="w-full py-2.5 bg-slate-950/60 hover:bg-slate-900 border border-slate-800 rounded-xl text-[9px] uppercase font-bold tracking-wider text-slate-400 hover:text-slate-300 transition-all text-center cursor-pointer font-mono"
                            >
                              {language === 'en' ? 'Recover Forgotten Days' : 'ভুলে যাওয়া দিন পুনরুদ্ধার'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}

              </div>
            )}

            {/* 3. My Habits view: causes, biological impacts, advantage list, and calendar logs */}
            {activeTab === 'habits' && (
              <div className="w-full max-w-md flex flex-col space-y-6 text-left animate-fade-in">
                
                {/* Select habit info category */}
                <div className="bg-slate-900/60 border border-white/10 rounded-3xl p-6 shadow-2xl backdrop-blur-sm">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-3 font-mono">
                    {language === 'en' ? 'Select Sector Focus:' : 'সেক্টর নির্বাচন করুন:'}
                  </label>
                  <select
                    value={currentSelectedHabit}
                    onChange={(e) => {
                      sounds.playClick();
                      setCurrentSelectedHabit(e.target.value as HabitId);
                    }}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-100 px-4 py-3 rounded-xl text-sm font-semibold focus:outline-none focus:border-violet-500 cursor-pointer"
                  >
                    {profile?.selectedHabits.map((hid) => {
                      const c = HABIT_CONFIGS[hid];
                      return (
                        <option key={hid} value={hid}>
                          {language === 'en' ? c.nameEn : c.nameBn}
                        </option>
                      );
                    })}
                  </select>

                  <button
                    onClick={handleOpenSectorsEditor}
                    className="w-full mt-4 bg-slate-950/60 border border-slate-800/80 hover:bg-slate-850 text-[10px] font-black tracking-widest text-violet-400 hover:text-violet-300 py-3 rounded-xl transition-all font-mono uppercase flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <span>⚙️</span>
                    <span>{language === 'en' ? 'Configure Sectors & Targets' : 'সেক্টর ও চ্যালেঞ্জ কনফিগার করুন'}</span>
                  </button>
                </div>

                {/* Educational Display card for sector */}
                <div className="bg-slate-900/40 border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden backdrop-blur-sm">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: activeHabitConfig?.color }}>
                      <Info className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-white">
                        {language === 'en' ? activeHabitConfig?.nameEn : activeHabitConfig?.nameBn}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {language === 'en' ? activeHabitConfig?.tagEn : activeHabitConfig?.tagBn}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4 text-xs leading-relaxed text-slate-300">
                    <div className="border-l-2 pl-3 border-violet-500/50">
                      <strong className="text-slate-200 block mb-1">🧠 {language === 'en' ? 'Mental & Cognitive Harm:' : 'মানসিক ও চিন্তার ক্ষতি:'}</strong>
                      {language === 'en' ? activeHabitConfig?.impactEn.mind : activeHabitConfig?.impactBn.mind}
                    </div>

                    <div className="border-l-2 pl-3 border-emerald-500/50">
                      <strong className="text-slate-200 block mb-1">🫁 {language === 'en' ? 'Biological & Health Harm:' : 'শারীরিক ও জৈবিক ক্ষতি:'}</strong>
                      {language === 'en' ? activeHabitConfig?.impactEn.health : activeHabitConfig?.impactBn.health}
                    </div>

                    <div className="border-l-2 pl-3 border-cyan-500/50">
                      <strong className="text-slate-200 block mb-1">🏡 {language === 'en' ? 'Family & Household Drain:' : 'পারিবারিক ও অর্থনৈতিক ক্ষতি:'}</strong>
                      {language === 'en' ? activeHabitConfig?.impactEn.family : activeHabitConfig?.impactBn.family}
                    </div>
                  </div>
                </div>

                {/* Flight Check-In History Card */}
                <div className="bg-slate-900/40 border border-white/10 rounded-3xl p-6 shadow-2xl backdrop-blur-sm">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2 mb-4 font-mono">
                    {language === 'en' ? 'Flight Check-In History' : 'ফ্লাইট চেক-ইন ইতিহাস'}
                  </h3>

                  {activeStreakState?.history.length === 0 ? (
                    <div className="text-center py-8 text-slate-500 text-xs italic">
                      {language === 'en' ? 'No days checked in yet. Hold the fingerprint scanner to initiate flight.' : 'এখনো কোন চেক-ইন ইতিহাস নেই। রকেট চালু করতে ফিঙ্গারপ্রিন্ট চেপে ধরুন।'}
                    </div>
                  ) : (
                    <div className="grid grid-cols-5 gap-2 max-h-[250px] overflow-y-auto pr-1">
                      {/* Generates calendar spots */}
                      {Array.from({ length: activeStreakState.currentStreak }).map((_, idx) => {
                        const dayNum = idx + 1;
                        return (
                          <button
                            key={idx}
                            onClick={() => {
                              sounds.playClick();
                              setActiveHistoryDay(dayNum);
                              setActiveHistoryHabit(currentSelectedHabit);
                            }}
                            className="bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 p-2.5 rounded-xl flex flex-col items-center justify-center transition-all shadow-md active:scale-95 cursor-pointer"
                          >
                            <span className="text-[10px] text-slate-500 font-mono">Day</span>
                            <span className="text-sm font-bold text-violet-400">{dayNum}</span>
                            <span className="text-[9px] text-emerald-400 mt-1 uppercase font-semibold">See</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 4. Pass / Boarding Card view */}
            {activeTab === 'pass' && profile && (
              <div className="w-full max-w-md flex flex-col space-y-6 text-left animate-fade-in pb-12">
                <ProfileCard 
                  profile={profile} 
                  streaks={streaks} 
                  habitConfigs={HABIT_CONFIGS} 
                  onUpdateProfile={(updated) => {
                    const newProfile = { ...profile, ...updated };
                    sqlite.setProfile(
                      {
                        name: newProfile.name,
                        avatarUrl: newProfile.avatarUrl,
                        joinedDate: newProfile.joinedDate,
                        language: newProfile.language,
                        theme: newProfile.theme,
                      },
                      newProfile.selectedHabits
                    );
                    refreshDatabaseStates();
                  }}
                />
                
                {/* Settings / Danger Zone */}
                <div className="bg-slate-900/40 border border-red-500/10 rounded-3xl p-6 shadow-2xl backdrop-blur-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />
                  <h3 className="text-sm font-bold text-red-400 uppercase tracking-wider mb-2 font-mono flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                    <span>{language === 'en' ? 'System Settings & Danger Zone' : 'সিস্টেম সেটিংস ও বিপদজ্জনক অঞ্চল'}</span>
                  </h3>
                  <p className="text-xs text-slate-400 mb-5 leading-relaxed">
                    {language === 'en'
                      ? 'Clearing data will completely wipe your local simulated SQLite database, reset all active streak records, and clear your profile configurations. This action is permanent and irreversible.'
                      : 'ডাটা মুছে ফেললে আপনার লোকাল SQLite ডাটাবেস সম্পূর্ণভাবে মুছে যাবে, সব স্ট্রিক রেকর্ড এবং প্রোফাইল কনফিগারেশন রিসেট হয়ে যাবে। এই কাজটি স্থায়ী এবং আর পুনরুদ্ধার করা যাবে না।'}
                  </p>
                  <button
                    onClick={handleClearAllData}
                    className="w-full py-3.5 bg-red-600/10 hover:bg-red-600 border border-red-500/20 hover:border-red-500 text-red-400 hover:text-white font-black rounded-xl text-xs uppercase tracking-widest transition-all cursor-pointer text-center font-mono shadow-md hover:shadow-red-900/30 active:scale-[0.98]"
                  >
                    {language === 'en' ? 'Clear Data & Reset System' : 'সব ডাটা ও ক্যাশ মুছে ফেলুন'}
                  </button>
                </div>
              </div>
            )}

            {/* 5. SQLite Inspector console view */}
            {activeTab === 'sqlite' && (
              <div className="w-full max-w-lg flex flex-col space-y-6 text-left animate-fade-in pb-12">
                <SQLiteInspector language={language} onDatabaseUpdate={refreshDatabaseStates} />
                
                {/* Database Quick Action */}
                <div className="bg-slate-900/40 border border-white/5 rounded-3xl p-6 shadow-2xl backdrop-blur-sm">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 font-mono">
                    {language === 'en' ? 'Database Quick Actions' : 'ডাটাবেস কুইক অ্যাকশন সমূহ'}
                  </h4>
                  <button
                    onClick={handleClearAllData}
                    className="w-full py-3 bg-slate-950 hover:bg-red-950/20 border border-slate-800 hover:border-red-900/30 text-slate-400 hover:text-red-400 font-bold rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer text-center font-mono flex items-center justify-center gap-2 active:scale-[0.98]"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{language === 'en' ? 'Wipe & Re-initialize Database' : 'ডাটাবেস সম্পূর্ণ রিসেট করুন'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* 6. Policies view */}
            {activeTab === 'policies' && (
              <div className="w-full max-w-md flex flex-col space-y-6 text-left animate-fade-in pb-12">
                <div className="bg-slate-900/60 border border-white/10 rounded-3xl p-6 shadow-2xl backdrop-blur-sm">
                  <div className="flex items-center space-x-3 mb-5 border-b border-white/5 pb-4">
                    <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-400 shrink-0">
                      <Shield className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-white uppercase tracking-wider font-mono">
                        {language === 'en' ? 'Vanguard Flight Policies' : 'ভ্যানগার্ড মিশন নীতিমালা'}
                      </h3>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {language === 'en' ? 'Integrity and protocols for your rocket streaks' : 'রকেট স্ট্রিক সিস্টেম পরিচালনার সৎ নিয়মাবলী'}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4 text-xs leading-relaxed text-slate-300">
                    <div className="bg-slate-950/40 p-4 rounded-2xl border border-white/5">
                      <strong className="text-violet-400 block mb-1 font-mono text-[10px] uppercase tracking-wider">
                        1. {language === 'en' ? 'Integrity First Rule' : '১. সততা সবার আগে'}
                      </strong>
                      <p className="text-slate-400 text-[11px]">
                        {language === 'en'
                          ? 'Your rocket fuel is absolute honesty. If you experience a relapse or fail to maintain self-control for even a brief moment, you must self-report immediately.'
                          : 'আপনার রকেটের মূল জ্বালানি হলো নিখাদ সততা। আপনি যদি কোনো অভ্যাসে হেরে যান বা স্ব-নিয়ন্ত্রণ হারিয়ে ফেলেন, তবে সাথে সাথেই তা রিপোর্ট করতে হবে।'}
                      </p>
                    </div>

                    <div className="bg-slate-950/40 p-4 rounded-2xl border border-white/5">
                      <strong className="text-orange-400 block mb-1 font-mono text-[10px] uppercase tracking-wider">
                        2. {language === 'en' ? 'Relapse Protocols' : '২. রিল্যাপ্স প্রটোকল'}
                      </strong>
                      <p className="text-slate-400 text-[11px]">
                        {language === 'en'
                          ? 'Reporting a fail resets your active streak for that sector back to 0. This is the only way to re-calibrate your thrusters and build a true foundation of resilience.'
                          : 'ব্যর্থতা রিপোর্ট করলে আপনার সংশ্লিষ্ট সেক্টরের স্ট্রিক রিসেট হয়ে ০ হয়ে যাবে। নিজের ভুল স্বীকার করে নতুন উদ্যমে শুরু করার এটাই একমাত্র উপায়।'}
                      </p>
                    </div>

                    <div className="bg-slate-950/40 p-4 rounded-2xl border border-white/5">
                      <strong className="text-emerald-400 block mb-1 font-mono text-[10px] uppercase tracking-wider">
                        3. {language === 'en' ? 'Flight Day Recovery' : '৩. ফ্লাইট রিকভারি'}
                      </strong>
                      <p className="text-slate-400 text-[11px]">
                        {language === 'en'
                          ? 'Forgotten to check in yesterday? If you maintained self-control but forgot to log it, you can recover forgotten days under our honest-recovery backup protocols.'
                          : 'গতকাল চেক-ইন করতে ভুলে গিয়েছিলেন? যদি আপনি নিজেকে নিয়ন্ত্রণে রাখতে পেরে থাকেন কিন্তু লগ করতে ভুলে যান, তবে রিকভারি প্রটোকলের মাধ্যমে ঐ দিন পুনরুদ্ধার করতে পারবেন।'}
                      </p>
                    </div>

                    <div className="bg-slate-950/40 p-4 rounded-2xl border border-white/5">
                      <strong className="text-cyan-400 block mb-1 font-mono text-[10px] uppercase tracking-wider">
                        4. {language === 'en' ? 'Privacy Guarantee' : '৪. প্রাইভেসি গ্যারান্টি'}
                      </strong>
                      <p className="text-slate-400 text-[11px]">
                        {language === 'en'
                          ? 'All flight data is kept strictly inside your local simulated SQLite container. No cloud tracking, no cookies, no privacy exposure. You are in full command.'
                          : 'সব ফ্লাইট ডাটা আপনার লোকাল SQLite কন্টেইনারে সম্পূর্ণ সুরক্ষিত থাকে। কোনো ক্লাউড ট্র্যাকিং বা প্রাইভেসি লিক নেই। আপনার মিশন আপনার নিয়ন্ত্রণেই থাকবে।'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

      </main>

      {/* Interactive Bottom Navigation bar (Only if NOT onboarding) */}
      {!isOnboarding && (
        <nav className="fixed bottom-0 left-0 right-0 bg-slate-950/80 backdrop-blur-lg border-t border-slate-900 p-3 z-40 max-w-lg mx-auto rounded-t-3xl shadow-2xl flex items-center justify-around">
          <button
            onClick={() => {
              sounds.playClick();
              setActiveTab('dashboard');
            }}
            className={`flex flex-col items-center justify-center w-16 h-12 transition-all cursor-pointer ${
              activeTab === 'dashboard'
                ? 'text-blue-400 scale-105'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Rocket className="w-5 h-5 mb-0.5" />
            <span className="text-[8px] font-bold uppercase tracking-widest font-mono">
              {language === 'en' ? 'Dashboard' : 'ড্যাশবোর্ড'}
            </span>
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              setActiveTab('habits');
            }}
            className={`flex flex-col items-center justify-center w-16 h-12 transition-all cursor-pointer ${
              activeTab === 'habits'
                ? 'text-blue-400 scale-105'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Info className="w-5 h-5 mb-0.5" />
            <span className="text-[8px] font-bold uppercase tracking-widest font-mono">
              {language === 'en' ? 'Impact' : 'ক্ষতি'}
            </span>
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              setActiveTab('pass');
            }}
            className={`flex flex-col items-center justify-center w-16 h-12 transition-all cursor-pointer ${
              activeTab === 'pass'
                ? 'text-blue-400 scale-105'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <User className="w-5 h-5 mb-0.5" />
            <span className="text-[8px] font-bold uppercase tracking-widest font-mono">
              {language === 'en' ? 'Pass' : 'পাস'}
            </span>
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              setActiveTab('sqlite');
            }}
            className={`flex flex-col items-center justify-center w-16 h-12 transition-all cursor-pointer ${
              activeTab === 'sqlite'
                ? 'text-blue-400 scale-105'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Database className="w-5 h-5 mb-0.5" />
            <span className="text-[8px] font-bold uppercase tracking-widest font-mono">
              {language === 'en' ? 'Console' : 'কনসোল'}
            </span>
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              setActiveTab('policies');
            }}
            className={`flex flex-col items-center justify-center w-16 h-12 transition-all cursor-pointer ${
              activeTab === 'policies'
                ? 'text-blue-400 scale-105'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Shield className="w-5 h-5 mb-0.5" />
            <span className="text-[8px] font-bold uppercase tracking-widest font-mono">
              {language === 'en' ? 'Policy' : 'নীতিমালা'}
            </span>
          </button>
        </nav>
      )}

      {/* Floating Push Notification Simulator Toast */}
      {pushToast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 w-full max-w-sm px-4 z-50 animate-bounce">
          <div className="bg-slate-900/95 border-2 border-violet-500/50 rounded-2xl p-4 shadow-2xl backdrop-blur-md flex items-start gap-3 text-left">
            <div className="p-2 bg-violet-500/10 rounded-xl text-violet-400">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div className="flex-1">
              <h4 className="text-xs font-black tracking-wider text-white uppercase font-mono">{pushToast.title}</h4>
              <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">{pushToast.body}</p>
            </div>
            <button
              onClick={() => setPushToast(null)}
              className="text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Golden Celebration Milestone Modal */}
      {showMilestone && (
        <div className="fixed inset-0 bg-slate-950/90 z-50 flex items-center justify-center p-4 backdrop-blur-lg">
          <div className="w-full max-w-md bg-slate-900 border border-yellow-500/40 rounded-3xl p-6 text-center shadow-[0_0_50px_rgba(234,179,8,0.2)] animate-fade-in relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-yellow-500/5 to-transparent pointer-events-none" />
            
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-yellow-600 to-yellow-300 p-0.5 mx-auto mb-6 flex items-center justify-center shadow-lg shadow-yellow-500/20 relative">
              <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center">
                <Sparkles className="w-12 h-12 text-yellow-400 animate-pulse" />
              </div>
              <div className="absolute -bottom-1 -right-1 bg-yellow-500 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider">
                {language === 'en' ? 'GOLD' : 'স্বর্ণ'}
              </div>
            </div>

            <h2 className="text-2xl font-black text-white italic tracking-wide uppercase">
              {language === 'en' ? 'CHALLENGE COMPLETED!' : 'চ্যাম্পিয়নশিপ অর্জিত!'}
            </h2>
            <p className="text-xs text-yellow-400 font-bold uppercase tracking-widest mt-2 font-mono">
              {language === 'en' ? `Target: ${showMilestone.targetDays} Days` : `টার্গেট: ${showMilestone.targetDays} দিন`}
            </p>

            <p className="text-xs text-slate-300 leading-relaxed mt-4">
              {language === 'en' 
                ? 'Astounding flight precision, Space Cadet! You have conquered your target. Your rocket engine is now powered by solid-state integrity.' 
                : 'অসাধারণ মহাকাশ যাত্রা, ক্যাডেট! আপনি টার্গেট জয় করেছেন। আপনার রকেটে এখন সত্যের খাঁটি জ্বালানি কাজ করছে।'}
            </p>

            <div className="mt-8 space-y-3">
              <button
                onClick={() => {
                  sounds.playSuccessChime();
                  sqlite.updateTarget(showMilestone.habitId, '3-months');
                  setShowMilestone(null);
                  refreshDatabaseStates();
                }}
                className="w-full py-3.5 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-slate-950 font-black rounded-2xl text-xs uppercase tracking-[0.2em] shadow-lg shadow-yellow-500/10 transition-all cursor-pointer text-center"
              >
                {language === 'en' ? 'Start 3-Month Challenge' : '৩ মাসের চ্যালেঞ্জ শুরু করুন'}
              </button>
              <button
                onClick={() => {
                  sounds.playClick();
                  setShowMilestone(null);
                }}
                className="w-full py-3 bg-slate-950/60 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition-all cursor-pointer font-mono text-center"
              >
                {language === 'en' ? 'Continue Streak Undefined' : 'চলতি ফ্লাইট বজায় রাখুন'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Honest Failure Confirmation Modal */}
      {showFailConfirm && (
        <div className="fixed inset-0 bg-slate-950/80 z-50 flex items-center justify-center p-4 backdrop-blur-md">
          <div className="w-full max-w-sm bg-slate-900 border border-red-500/20 rounded-3xl p-6 text-center shadow-2xl animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4 border border-red-500/20">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>

            <h3 className="text-lg font-black text-white uppercase tracking-wide">
              {language === 'en' ? 'HONESTY INITIATION' : 'সততার শপথ'}
            </h3>
            <p className="text-xs text-slate-400 mt-2 max-w-xs mx-auto leading-relaxed">
              {language === 'en' 
                ? '“Integrity is the fuel of our universe.” Resetting your streak is a noble victory of truth. Your highest historical streak will be stored securely in SQLite tables.' 
                : '“নিষ্ঠাই মহাবিশ্বের জ্বালানি।” নিজের পরাজয় স্বীকার করে রিসেট করা সত্যের বড় বিজয়। আপনার সর্বোচ্চ ঐতিহাসিক স্ট্রিক লোকাল টেবিলে নিরাপদ থাকবে।'}
            </p>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowFailConfirm(null)}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer text-center"
              >
                {language === 'en' ? 'Cancel' : 'বাতিল'}
              </button>
              <button
                onClick={handleFailConfirm}
                className="flex-1 py-3 bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white font-black rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer text-center"
              >
                {language === 'en' ? 'Reset Flight' : 'রিসেট করুন'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Flight Rebuild Quote Modal */}
      {failedResult && (
        <div className="fixed inset-0 bg-slate-950/90 z-50 flex items-center justify-center p-4 backdrop-blur-lg">
          <div className="w-full max-w-md bg-slate-900 border border-white/10 rounded-3xl p-6 text-center shadow-2xl animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-violet-500/10 flex items-center justify-center mx-auto mb-4 border border-violet-500/20">
              <RotateCcw className="w-8 h-8 text-violet-400" />
            </div>

            <h3 className="text-xl font-black text-white italic tracking-wide uppercase">
              {language === 'en' ? 'FLIGHT REBUILD INITIATED' : 'নতুন ফ্লাইট চালু হলো'}
            </h3>
            <div className="my-4 bg-slate-950/50 p-4 rounded-2xl border border-white/5 text-left">
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono mb-1">{language === 'en' ? 'Previous Record:' : 'পূর্বের রেকর্ড:'}</p>
              <p className="text-sm font-black text-white">{language === 'en' ? `Highest Streak: ${failedResult.highest} Days` : `সর্বোচ্চ স্ট্রিক: ${failedResult.highest} দিন`}</p>
            </div>

            <blockquote className="text-xs text-slate-300 italic border-l-2 border-violet-500/50 pl-4 text-left my-6 leading-relaxed">
              {language === 'en' ? failedResult.quote : failedResult.quoteBn}
            </blockquote>

            <button
              onClick={() => {
                sounds.playSuccessChime();
                setFailedResult(null);
              }}
              className="w-full py-3.5 bg-gradient-to-r from-violet-600 to-cyan-400 hover:from-violet-500 hover:to-cyan-300 text-slate-950 font-black rounded-2xl text-xs uppercase tracking-[0.2em] shadow-lg transition-all cursor-pointer text-center"
            >
              {language === 'en' ? 'Resume Space Training' : 'স্পেস ট্রেনিং শুরু করুন'}
            </button>
          </div>
        </div>
      )}

      {/* Days Recovery Dialog */}
      {showRecoveryDialog && (
        <div className="fixed inset-0 bg-slate-950/80 z-50 flex items-center justify-center p-4 backdrop-blur-md">
          <div className="w-full max-w-sm bg-slate-900 border border-white/10 rounded-3xl p-6 shadow-2xl animate-fade-in text-left">
            <h3 className="text-base font-black text-white uppercase tracking-wider border-b border-white/5 pb-2 mb-4 font-mono flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              <span>{language === 'en' ? 'Honest Day Recovery' : 'ভুলে যাওয়া দিন রিকভার'}</span>
            </h3>

            <p className="text-xs text-slate-400 leading-normal mb-4">
              {language === 'en' 
                ? 'Did you fly with integrity but forgot to sign the attendance log? Restore up to 7 days safely to match your actual timeline.' 
                : 'আপনি কি নিষ্ঠার সাথেই ছিলেন কিন্তু এটেন্ডেন্স দিতে ভুলে গেছেন? আপনার সঠিক দিনের সাথে মেলাতে সর্বোচ্চ ৭ দিন রিকভার করুন।'}
            </p>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2 font-mono">
                  {language === 'en' ? 'Select Days to Add:' : 'যুক্ত করার জন্য দিন নির্বাচন:'}
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                    <button
                      key={num}
                      onClick={() => {
                        sounds.playClick();
                        setRecoveryDays(num);
                      }}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                        recoveryDays === num
                          ? 'bg-blue-600 border-blue-500 text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowRecoveryDialog(null)}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer text-center"
                >
                  {language === 'en' ? 'Cancel' : 'বাতিল'}
                </button>
                <button
                  onClick={handleRecoveryConfirm}
                  className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer text-center"
                >
                  {language === 'en' ? 'Recover Days' : 'রিকভার করুন'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upgraded History Day Detail Dialog - Highly Detailed Clinical Dossier */}
      {activeHistoryDay && activeHistoryHabit && (
        <div className="fixed inset-0 bg-slate-950/90 z-50 flex items-center justify-center p-4 backdrop-blur-md">
          <div className="w-full max-w-2xl max-h-[90vh] bg-slate-900 border border-white/10 rounded-3xl text-left shadow-2xl animate-fade-in relative overflow-hidden flex flex-col">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
            
            {/* Dossier Header sticky at top */}
            <div className="flex justify-between items-center border-b border-white/5 px-6 py-5 bg-slate-950/40 backdrop-blur-md relative z-10">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-500/10 rounded-xl border border-indigo-500/25">
                  <Rocket className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h4 className="text-[10px] font-bold text-indigo-400 tracking-[0.2em] uppercase font-mono">
                    {language === 'en' ? 'BIOLOGICAL FLIGHT DOSSIER' : 'বায়োলজিক্যাল ফ্লাইট ডসিয়ার'}
                  </h4>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                    {language === 'en' ? `DAY ${activeHistoryDay}` : `দিন ${activeHistoryDay}`} • {HABIT_CONFIGS[activeHistoryHabit] ? (language === 'en' ? HABIT_CONFIGS[activeHistoryHabit].nameEn : HABIT_CONFIGS[activeHistoryHabit].nameBn) : ''}
                  </p>
                </div>
              </div>
              <button
                onClick={handleCloseHealthDialog}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer border border-white/5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Dossier Body */}
            {(() => {
              const r = getHealthImprovement(activeHistoryHabit, activeHistoryDay);
              
              // Helper to speak localized main points
              const speakDigest = () => {
                const titleText = language === 'en' ? r.titleEn : r.titleBn;
                const milestoneText = language === 'en' 
                  ? `Key achievement: ${r.keyMilestonesEn[0]}`
                  : `প্রধান অর্জন: ${r.keyMilestonesBn[0]}`;
                const motivationSection = r.detailedSections.find(s => s.sectionId === 'motivational_summary');
                const motivationText = motivationSection 
                  ? (language === 'en' ? motivationSection.summaryEn : motivationSection.summaryBn)
                  : '';
                const fullText = `${titleText}. ${milestoneText}. ${motivationText}`;
                handleReadVoice(fullText);
              };

              return (
                <div className="overflow-y-auto p-6 space-y-8 flex-grow custom-scrollbar">
                  {/* Title & Phase Badge */}
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[9px] bg-indigo-500/15 text-indigo-300 border border-indigo-500/25 px-2.5 py-1 rounded-full font-black tracking-widest uppercase font-mono">
                        {r.timeframe}
                      </span>
                      <span className="text-[9px] bg-slate-800 text-slate-300 border border-white/5 px-2.5 py-1 rounded-full font-black tracking-widest uppercase font-mono flex items-center gap-1.5">
                        {renderCategoryIcon(r.icon, "w-3 h-3 text-indigo-400")}
                        {language === 'en' ? r.category : (r.category === 'Physical' ? 'শারীরিক' : r.category === 'Mental' ? 'মানসিক' : r.category === 'Biological' ? 'জৈবিক' : 'সামাজিক')}
                      </span>
                    </div>
                    <h2 className="text-lg md:text-xl font-black text-white leading-snug">
                      {language === 'en' ? r.titleEn : r.titleBn}
                    </h2>
                  </div>

                  {/* Curated Illustration Card */}
                  <div className="rounded-2xl border border-white/10 overflow-hidden bg-slate-950/50">
                    <img 
                      src={r.imageUrl} 
                      alt="Cellular physiology" 
                      className="w-full h-48 md:h-56 object-cover hover:scale-105 transition-transform duration-700"
                      referrerPolicy="no-referrer"
                    />
                    <div className="p-3 bg-slate-950 border-t border-white/5 text-center">
                      <p className="text-[10px] text-slate-400 leading-relaxed italic font-serif">
                        {language === 'en' ? r.imageCaptionEn : r.imageCaptionBn}
                      </p>
                    </div>
                  </div>

                  {/* BIOLOGICAL TELEMETRY & HORMONAL RADAR */}
                  {r.metrics && (
                    <div className="p-5 bg-slate-950/80 border border-indigo-500/20 rounded-2xl space-y-4">
                      <div className="flex items-center justify-between border-b border-white/5 pb-2">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-indigo-400" />
                          <h3 className="text-xs font-black text-slate-200 tracking-wider uppercase font-mono">
                            {language === 'en' ? 'Biological Telemetry & Hormonal Radar' : 'বায়োলজিক্যাল টেলিমেট্রি ও হরমোনাল রাডার'}
                          </h3>
                        </div>
                        <span className="text-[9px] bg-indigo-500/15 text-indigo-300 border border-indigo-500/25 px-2 py-0.5 rounded font-bold font-mono">
                          {language === 'en' ? 'LIVE CALCULATION' : 'সরাসরি হিসাব'}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Testosterone / Androgen Index */}
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-[10px] font-bold">
                            <span className="text-slate-400 flex items-center gap-1">
                              🧪 {language === 'en' ? 'Testosterone Level' : 'টেস্টোস্টেরন ইনডেক্স'}
                            </span>
                            <span className="text-emerald-400 font-mono">{r.metrics.testosteroneLevel}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
                              style={{ width: `${Math.min(100, (r.metrics.testosteroneLevel / 150) * 100)}%` }}
                            />
                          </div>
                          <p className="text-[9px] text-slate-500 leading-relaxed">
                            {language === 'en' 
                              ? 'Androgen receptor density and free testosterone absorption capacity.' 
                              : 'অ্যান্ড্রোজেন রিসেপ্টর ঘনত্ব ও টেস্টোস্টেরন শোষণ ক্ষমতা।'}
                          </p>
                        </div>

                        {/* Cortisol & Stress Levels */}
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-[10px] font-bold">
                            <span className="text-slate-400 flex items-center gap-1">
                              📉 {language === 'en' ? 'Cortisol & Stress' : 'কর্টিসল ও মানসিক চাপ'}
                            </span>
                            <span className="text-rose-400 font-mono">{r.metrics.cortisolLevel}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-rose-500 to-red-400 transition-all duration-500"
                              style={{ width: `${Math.min(100, r.metrics.cortisolLevel)}%` }}
                            />
                          </div>
                          <p className="text-[9px] text-slate-500 leading-relaxed">
                            {language === 'en' 
                              ? 'Stress biomarkers and systemic adrenaline toxicity level.' 
                              : 'মানসিক চাপের বায়োমার্কার ও ক্ষতিকর অ্যাড্রেনালিন বিষাক্ততার মাত্রা।'}
                          </p>
                        </div>

                        {/* Systemic Toxin Cleared */}
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-[10px] font-bold">
                            <span className="text-slate-400 flex items-center gap-1">
                              🔬 {language === 'en' ? 'Toxins Cleared' : 'নিষ্কাশিত ক্ষতিকর টক্সিন'}
                            </span>
                            <span className="text-cyan-400 font-mono">{r.metrics.toxinsCleared}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-cyan-500 to-blue-400 transition-all duration-500"
                              style={{ width: `${r.metrics.toxinsCleared}%` }}
                            />
                          </div>
                          <p className="text-[9px] text-slate-500 leading-relaxed">
                            {language === 'en' 
                              ? 'Cotinine, acetaldehyde, and heavy metal cellular purification.' 
                              : 'কোটিনিন, বিষাক্ত অ্যাসিটালডিহাইড এবং ভারী ধাতুর কোষীয় পরিশোধন।'}
                          </p>
                        </div>

                        {/* Immune System & Cellular Healing */}
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-[10px] font-bold">
                            <span className="text-slate-400 flex items-center gap-1">
                              🛡️ {language === 'en' ? 'Immune & Healing' : 'রোগ প্রতিরোধ ও নিরাময়'}
                            </span>
                            <span className="text-violet-400 font-mono">{r.metrics.immuneStrength}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-violet-500 to-indigo-400 transition-all duration-500"
                              style={{ width: `${r.metrics.immuneStrength}%` }}
                            />
                          </div>
                          <p className="text-[9px] text-slate-500 leading-relaxed">
                            {language === 'en' 
                              ? 'Lymphocyte/WBC activity and systemic cellular self-curing strength.' 
                              : 'শ্বেত রক্তকণিকার সচলতা ও অভ্যন্তরীণ কোষীয় নিরাময় ক্ষমতা।'}
                          </p>
                        </div>

                        {/* Physical Gym Power & Athletic Performance */}
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-[10px] font-bold">
                            <span className="text-slate-400 flex items-center gap-1">
                              ⚡ {language === 'en' ? 'Physical Gym Power' : 'শারীরিক শক্তি ও জিমের ক্ষমতা'}
                            </span>
                            <span className="text-amber-400 font-mono">{r.metrics.physicalPower}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-500"
                              style={{ width: `${r.metrics.physicalPower}%` }}
                            />
                          </div>
                          <p className="text-[9px] text-slate-500 leading-relaxed">
                            {language === 'en' 
                              ? 'Skeletal muscle glycogen retention and VO2 max training capacity.' 
                              : 'পেশীর গ্লাইকোজেন ধারণ ক্ষমতা ও ব্যায়াম করার কার্ডিও সক্ষমতা।'}
                          </p>
                        </div>

                        {/* Mental Focus & Neuroplasticity */}
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-[10px] font-bold">
                            <span className="text-slate-400 flex items-center gap-1">
                              🧠 {language === 'en' ? 'Mental Focus & Clarity' : 'মানসিক ফোকাস ও মেধা'}
                            </span>
                            <span className="text-indigo-400 font-mono">{r.metrics.mentalFocus}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-indigo-500 to-purple-400 transition-all duration-500"
                              style={{ width: `${r.metrics.mentalFocus}%` }}
                            />
                          </div>
                          <p className="text-[9px] text-slate-500 leading-relaxed">
                            {language === 'en' 
                              ? 'Prefrontal cortex grey matter thickness and dopamine D2 sensitivity.' 
                              : 'প্রি-ফ্রন্টাল কর্টেক্সের গ্রে-ম্যাটার ঘনত্ব ও ডোপামিন রিসেপ্টর সচলতা।'}
                          </p>
                        </div>

                        {/* Muscle Protein Synthesis & Fat Burn */}
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-[10px] font-bold">
                            <span className="text-slate-400 flex items-center gap-1">
                              💪 {language === 'en' ? 'Muscle Building Potential' : 'পেশী গঠনের সম্ভাবনা'}
                            </span>
                            <span className="text-pink-400 font-mono">{r.metrics.muscleGainPotential}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-pink-500 to-rose-400 transition-all duration-500"
                              style={{ width: `${r.metrics.muscleGainPotential}%` }}
                            />
                          </div>
                          <p className="text-[9px] text-slate-500 leading-relaxed">
                            {language === 'en' 
                              ? 'Anabolic protein synthesis rate supported by androgen sensitivity.' 
                              : 'প্রোটিন সংশ্লেষণের হার ও হরমোন দ্বারা পেশী সুগঠিত করার ক্ষমতা।'}
                          </p>
                        </div>

                        {/* Visceral Fat Burn Rate */}
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-[10px] font-bold">
                            <span className="text-slate-400 flex items-center gap-1">
                              🔥 {language === 'en' ? 'Fat Removal Rate' : 'অতিরিক্ত মেদ ঝরানোর হার'}
                            </span>
                            <span className="text-orange-400 font-mono">{r.metrics.fatLossRate}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-orange-500 to-yellow-500 transition-all duration-500"
                              style={{ width: `${r.metrics.fatLossRate}%` }}
                            />
                          </div>
                          <p className="text-[9px] text-slate-500 leading-relaxed">
                            {language === 'en' 
                              ? 'Metabolic thyroid and lipid oxidation rate for belly fat removal.' 
                              : 'তলপেটের অতিরিক্ত মেদ পোড়ানো এবং হজম শক্তি বৃদ্ধির মেটাবলিক হার।'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Audio Speech Guide */}
                  <div className="flex flex-col sm:flex-row gap-3 items-center justify-between p-4 bg-indigo-950/20 border border-indigo-500/20 rounded-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-500/5 rounded-full blur-xl pointer-events-none" />
                    <div className="flex items-center gap-2.5 text-center sm:text-left">
                      <div className="p-2 bg-indigo-500/10 rounded-lg">
                        <BookOpen className="w-4 h-4 text-indigo-400" />
                      </div>
                      <div>
                        <span className="text-[10px] font-black text-indigo-300 font-mono tracking-widest uppercase block">
                          {language === 'en' ? 'COSMIC VOICE ASSISTANT' : 'কসমিক ভয়েস অ্যাসিস্ট্যান্ট'}
                        </span>
                        <span className="text-[9px] text-slate-400 leading-tight block mt-0.5">
                          {language === 'en' ? 'Listen to an audio synthesis of your recovery briefing.' : 'আপনার সুস্থতার বিবরণী ভয়েসের মাধ্যমে শুনুন।'}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={speakDigest}
                      className="w-full sm:w-auto px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-800 hover:from-indigo-500 hover:to-indigo-700 text-white font-black rounded-xl text-[10px] uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-indigo-950/50"
                    >
                      {isPlayingVoice ? <VolumeX className="w-3.5 h-3.5 animate-pulse" /> : <Volume2 className="w-3.5 h-3.5" />}
                      <span>{isPlayingVoice ? (language === 'en' ? 'Stop' : 'থামুন') : (language === 'en' ? 'Speak Digest' : 'ভয়েস শুনুন')}</span>
                    </button>
                  </div>

                  {/* Key Milestones Checklist */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                      <h3 className="text-xs font-black text-slate-200 tracking-wider uppercase font-mono">
                        {language === 'en' ? 'Key Milestones Accomplished' : 'অর্জিত প্রধান মাইলফলকসমূহ'}
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {(language === 'en' ? r.keyMilestonesEn : r.keyMilestonesBn).map((milestone, idx) => (
                        <div key={idx} className="flex gap-2.5 p-3.5 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
                          <div className="mt-0.5 flex-shrink-0">
                            <span className="w-4 h-4 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-bold text-emerald-400 flex items-center justify-center font-mono">
                              ✓
                            </span>
                          </div>
                          <p className="text-[11px] leading-relaxed text-slate-300 font-medium">
                            {milestone}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Detailed Sections (Biochemistry / Physiology, Sensory, Actions, Motivation) */}
                  {r.detailedSections.map((section, sIdx) => {
                    if (section.sectionId === 'physiology_and_biochemistry') {
                      return (
                        <div key={sIdx} className="space-y-4">
                          <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                            <Heart className="w-4 h-4 text-rose-400" />
                            <h3 className="text-xs font-black text-slate-200 tracking-wider uppercase font-mono">
                              {language === 'en' ? section.sectionTitleEn : section.sectionTitleBn}
                            </h3>
                          </div>
                          <div className="space-y-4">
                            {(language === 'en' ? (section.biochemEn || []) : (section.biochemBn || [])).map((item, bIdx) => (
                              <div key={bIdx} className="p-4 bg-slate-950/40 border border-white/5 rounded-2xl space-y-3">
                                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                  {item.heading}
                                </h4>
                                <p className="text-[11px] leading-relaxed text-slate-400">
                                  {item.explanation}
                                </p>
                                <div className="p-3 bg-rose-950/20 border border-rose-500/10 rounded-xl flex gap-2.5 items-start">
                                  <div className="mt-0.5 p-1 bg-rose-500/10 rounded border border-rose-500/20 text-[9px] font-bold text-rose-400 font-mono uppercase">
                                    {language === 'en' ? 'Impact' : 'প্রভাব'}
                                  </div>
                                  <p className="text-[11px] leading-relaxed text-slate-300">
                                    {item.impact}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    }

                    if (section.sectionId === 'external_sensory_and_symptoms') {
                      return (
                        <div key={sIdx} className="space-y-4">
                          <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                            <Brain className="w-4 h-4 text-indigo-400" />
                            <h3 className="text-xs font-black text-slate-200 tracking-wider uppercase font-mono">
                              {language === 'en' ? section.sectionTitleEn : section.sectionTitleBn}
                            </h3>
                          </div>
                          <div className="space-y-3">
                            {(language === 'en' ? (section.symptomsEn || []) : (section.symptomsBn || [])).map((item, syIdx) => (
                              <div key={syIdx} className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 bg-slate-950/30 border border-white/5 rounded-2xl">
                                <div className="md:col-span-1 border-r-0 md:border-r border-white/5 pr-0 md:pr-3 flex items-center">
                                  <p className="text-xs font-bold text-indigo-300 font-sans">
                                    {item.symptom}
                                  </p>
                                </div>
                                <div className="md:col-span-2 pl-0 md:pl-2">
                                  <p className="text-[11px] leading-relaxed text-slate-400">
                                    <span className="text-[10px] font-bold text-slate-500 block uppercase tracking-wider font-mono mb-1">
                                      {language === 'en' ? 'Biological Cause' : 'জৈবিক কারণ'}
                                    </span>
                                    {item.cause}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    }

                    if (section.sectionId === 'actionable_coping_strategies') {
                      return (
                        <div key={sIdx} className="space-y-4">
                          <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                            <Zap className="w-4 h-4 text-amber-400" />
                            <h3 className="text-xs font-black text-slate-200 tracking-wider uppercase font-mono">
                              {language === 'en' ? section.sectionTitleEn : section.sectionTitleBn}
                            </h3>
                          </div>
                          <div className="space-y-2">
                            {(language === 'en' ? (section.actionsEn || []) : (section.actionsBn || [])).map((action, aIdx) => (
                              <div key={aIdx} className="flex gap-3 p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl items-center">
                                <span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />
                                <p className="text-[11px] leading-relaxed text-slate-300 font-medium">
                                  {action}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    }

                    if (section.sectionId === 'motivational_summary') {
                      return (
                        <div key={sIdx} className="space-y-4">
                          <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                            <Sparkles className="w-4 h-4 text-violet-400" />
                            <h3 className="text-xs font-black text-slate-200 tracking-wider uppercase font-mono">
                              {language === 'en' ? section.sectionTitleEn : section.sectionTitleBn}
                            </h3>
                          </div>
                          <div className="p-5 bg-gradient-to-r from-violet-950/30 to-slate-950/40 border-l-4 border-violet-500 rounded-r-2xl text-left shadow-inner relative overflow-hidden">
                            <div className="absolute top-0 right-0 text-violet-500/5 font-serif text-8xl pointer-events-none select-none font-bold">
                              ”
                            </div>
                            <p className="text-xs md:text-sm leading-relaxed text-slate-300 font-serif italic">
                              {language === 'en' ? section.summaryEn : section.summaryBn}
                            </p>
                          </div>
                        </div>
                      );
                    }

                    return null;
                  })}
                </div>
              );
            })()}

            {/* Dossier Footer sticky at bottom */}
            <div className="flex justify-between items-center border-t border-white/5 px-6 py-4 bg-slate-950/60 backdrop-blur-md relative z-10">
              <button
                onClick={() => {
                  sounds.playSuccessChime();
                  window.print();
                }}
                className="px-3.5 py-2 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer border border-white/5 rounded-xl text-[10px] font-bold tracking-wider uppercase font-mono"
              >
                {language === 'en' ? '🖨️ Export Dossier' : '🖨️ পাসপোর্ট প্রিন্ট করুন'}
              </button>
              <button
                onClick={handleCloseHealthDialog}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-black rounded-xl text-[10px] uppercase tracking-wider transition-all cursor-pointer text-center shadow-lg shadow-indigo-950/40"
              >
                {language === 'en' ? 'Dismiss Dossier' : 'ডসিয়ার বন্ধ করুন'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Configure Sectors & Challenges Dialog */}
      {isEditingSectors && (
        <div className="fixed inset-0 bg-slate-950/80 z-50 flex items-center justify-center p-4 backdrop-blur-md">
          <div className="w-full max-w-md bg-slate-900 border border-white/10 rounded-3xl p-6 shadow-2xl animate-fade-in text-left">
            <h3 className="text-base font-black text-white uppercase tracking-wider border-b border-white/5 pb-2 mb-4 font-mono flex items-center gap-2">
              <Rocket className="w-5 h-5 text-violet-400" />
              <span>{language === 'en' ? 'Configure Mission Sectors' : 'মিশন সেক্টর কনফিগার করুন'}</span>
            </h3>

            <p className="text-xs text-slate-400 leading-normal mb-4">
              {language === 'en' 
                ? 'Select the habits you want to track, and set your specific challenge targets. Toggling off a habit disables it from tracking.' 
                : 'যে অভ্যাসগুলো আপনি ট্র্যাক করতে চান তা নির্বাচন করুন এবং চ্যালেঞ্জের দিন নির্ধারণ করুন। কোনো অভ্যাস বন্ধ করলে তা ড্যাশবোর্ড থেকে মুছে যাবে।'}
            </p>

            {/* List of habits to edit */}
            <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
              {(Object.keys(HABIT_CONFIGS) as HabitId[]).map((hid) => {
                const c = HABIT_CONFIGS[hid];
                const isSelected = editSectorsList.includes(hid);
                const currentTarget = editTargets[hid] || '1-month';
                return (
                  <div key={hid} className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-white block">
                          {language === 'en' ? c.nameEn : c.nameBn}
                        </span>
                        <span className="text-[10px] text-slate-500 block">
                          {language === 'en' ? c.tagEn : c.tagBn}
                        </span>
                      </div>

                      <button
                        onClick={() => {
                          sounds.playClick();
                          if (isSelected) {
                            setEditSectorsList(editSectorsList.filter((x) => x !== hid));
                          } else {
                            setEditSectorsList([...editSectorsList, hid]);
                          }
                        }}
                        className={`px-3 py-1 rounded-lg text-[10px] font-bold tracking-wider uppercase transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-violet-600/20 text-violet-400 border border-violet-500/30'
                            : 'bg-slate-900 text-slate-500 border border-slate-800'
                        }`}
                      >
                        {isSelected ? (language === 'en' ? 'ACTIVE' : 'সক্রিয়') : (language === 'en' ? 'INACTIVE' : 'নিষ্ক্রিয়')}
                      </button>
                    </div>

                    {isSelected && (
                      <div className="flex items-center justify-between border-t border-slate-900 pt-2.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                          {language === 'en' ? 'Target:' : 'লক্ষ্য:'}
                        </span>
                        <select
                          value={currentTarget}
                          onChange={(e) => {
                            sounds.playClick();
                            setEditTargets({ ...editTargets, [hid]: e.target.value as TargetKey });
                          }}
                          className="bg-slate-900 border border-slate-800 text-[11px] rounded-lg px-2 py-1 text-slate-300 focus:outline-none focus:border-violet-500 cursor-pointer"
                        >
                          <option value="1-month">{language === 'en' ? '1 Month (30 Days)' : '১ মাস (৩০ দিন)'}</option>
                          <option value="3-months">{language === 'en' ? '3 Months (90 Days)' : '৩ মাস (৯০ দিন)'}</option>
                          <option value="6-months">{language === 'en' ? '6 Months (180 Days)' : '৬ মাস (১৮০ দিন)'}</option>
                          <option value="1-year">{language === 'en' ? '1 Year (365 Days)' : '১ বছর (৩৬৫ দিন)'}</option>
                        </select>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex gap-3 pt-5 border-t border-white/5 mt-4">
              <button
                onClick={() => setIsEditingSectors(false)}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer text-center font-mono"
              >
                {language === 'en' ? 'Cancel' : 'বাতিল'}
              </button>
              <button
                onClick={handleSaveSectorsEditor}
                disabled={editSectorsList.length === 0}
                className="flex-1 py-3 bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer text-center font-mono disabled:opacity-50"
              >
                {language === 'en' ? 'Save Changes' : 'পরিবর্তন সংরক্ষণ'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}