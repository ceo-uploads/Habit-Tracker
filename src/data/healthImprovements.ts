/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { HabitId } from '../types';

export interface DetailedBiochem {
  heading: string;
  explanation: string;
  impact: string;
}

export interface DetailedSymptom {
  symptom: string;
  cause: string;
}

export interface DetailedSection {
  sectionId: 'physiology_and_biochemistry' | 'external_sensory_and_symptoms' | 'actionable_coping_strategies' | 'motivational_summary';
  sectionTitleEn: string;
  sectionTitleBn: string;
  biochemEn?: DetailedBiochem[];
  biochemBn?: DetailedBiochem[];
  symptomsEn?: DetailedSymptom[];
  symptomsBn?: DetailedSymptom[];
  actionsEn?: string[];
  actionsBn?: string[];
  summaryEn?: string;
  summaryBn?: string;
}

export interface BiologicalMetrics {
  testosteroneLevel: number;     // e.g. 100% to 145% or higher
  cortisolLevel: number;         // e.g. 120% dropping to 40%
  toxinsCleared: number;         // e.g. 0% to 100%
  immuneStrength: number;        // e.g. 60% to 98%
  physicalPower: number;         // e.g. 70% to 100%
  mentalFocus: number;           // e.g. 50% to 100%
  muscleGainPotential: number;   // e.g. 40% to 95%
  fatLossRate: number;           // e.g. 30% to 90%
}

export interface HealthImprovement {
  day: number;
  timeframe: string;
  titleEn: string;
  titleBn: string;
  descEn: string;
  descBn: string;
  category: 'Physical' | 'Mental' | 'Social' | 'Biological';
  icon: 'Heart' | 'Brain' | 'Shield' | 'Zap' | 'Activity' | 'Smile' | 'Users';
  imageUrl: string;
  imageCaptionEn: string;
  imageCaptionBn: string;
  keyMilestonesEn: string[];
  keyMilestonesBn: string[];
  detailedSections: DetailedSection[];
  metrics: BiologicalMetrics;
}

// Map phase ranges to generic names and timelines
interface PhaseData {
  timeframe: string;
  nameEn: string;
  nameBn: string;
  category: 'Physical' | 'Mental' | 'Social' | 'Biological';
  icon: 'Heart' | 'Brain' | 'Shield' | 'Zap' | 'Activity' | 'Smile' | 'Users';
}

function getPhaseData(day: number): PhaseData {
  if (day <= 3) {
    return {
      timeframe: '0 - 72 Hours',
      nameEn: 'Acute Detoxification & Stabilization',
      nameBn: 'তীব্র বিষমুক্তকরণ ও স্থিরতা অর্জন',
      category: 'Biological',
      icon: 'Shield',
    };
  } else if (day <= 7) {
    return {
      timeframe: 'Day 4 - 7 (1 Week)',
      nameEn: 'Neurotransmitter & Hormonal Reset',
      nameBn: 'নিউরো-ট্রান্সমিটার ও হরমোনের রিসেট',
      category: 'Biological',
      icon: 'Zap',
    };
  } else if (day <= 21) {
    return {
      timeframe: 'Day 8 - 21 (3 Weeks)',
      nameEn: 'Sensory & Cardio-Pulmonary Restoration',
      nameBn: 'অনুভূতি ও কার্ডিও-পালমোনারি পুনরুদ্ধার',
      category: 'Physical',
      icon: 'Heart',
    };
  } else if (day <= 45) {
    return {
      timeframe: 'Day 22 - 45 (1.5 Months)',
      nameEn: 'Cognitive Awakening & Gray Matter Rebuilding',
      nameBn: 'জ্ঞানীয় জাগরণ এবং গ্রে-ম্যাটার পুনর্গঠন',
      category: 'Mental',
      icon: 'Brain',
    };
  } else if (day <= 90) {
    return {
      timeframe: 'Day 46 - 90 (3 Months)',
      nameEn: 'Reward Pathway Recalibration & Dopamine Balance',
      nameBn: 'রিওয়ার্ড পাথওয়ে রিক্যালিব্রেশন ও ডোপামিন সামঞ্জস্য',
      category: 'Mental',
      icon: 'Smile',
    };
  } else {
    return {
      timeframe: 'Day 91 - 180+ (6 Months+)',
      nameEn: 'Full Systemic Metamorphosis & Spiritual Resilience',
      nameBn: 'পূর্ণ শারীরিক রূপান্তর ও আধ্যাত্মিক সহনশীলতা',
      category: 'Social',
      icon: 'Users',
    };
  }
}

// Curated high quality medical/physiological images from Unsplash
const habitImages: Record<HabitId, string[]> = {
  'no-smoking': [
    'https://images.unsplash.com/photo-1508847154043-be5407fcaa5a?auto=format&fit=crop&w=1200&q=80', // Lungs/blood flow/energy
    'https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&w=1200&q=80', // Cellular/microscopic biology
    'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=1200&q=80', // Nature / fresh breathing
    'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80', // Peace/mindfulness
  ],
  'no-drugs': [
    'https://images.unsplash.com/photo-1532187863486-abf9d39d66e8?auto=format&fit=crop&w=1200&q=80', // Medical science/detox
    'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=1200&q=80', // System reset/clean tech
    'https://images.unsplash.com/photo-1470246973918-29a93221c455?auto=format&fit=crop&w=1200&q=80', // Vibrant nature/detox
    'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&w=1200&q=80', // Sunrise recovery
  ],
  'no-alcohol': [
    'https://images.unsplash.com/photo-1548839140-29a87641359d?auto=format&fit=crop&w=1200&q=80', // Pure water splash / hydration
    'https://images.unsplash.com/photo-1610970881699-44a5587caa90?auto=format&fit=crop&w=1200&q=80', // Fresh citrus fruit energy
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1200&q=80', // Liver health / active fitness
    'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=1200&q=80', // Organic clean diet
  ],
  'no-masturbation': [
    'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=80', // Heavy weight training / muscle power
    'https://images.unsplash.com/photo-1472289065668-ce650ac443d2?auto=format&fit=crop&w=1200&q=80', // Brain synapses lighting up
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80', // Dynamic horizon energy
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80', // Strong skyscraper peak confidence
  ],
  'no-porn': [
    'https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&w=1200&q=80', // Clear light refract prism
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80', // Deep neural network lines
    'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1200&q=80', // Cosmic starlight / clarity
    'https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?auto=format&fit=crop&w=1200&q=80', // Splendid sunset / authentic connections
  ],
};

// Mathematically compute daily progressive biological metrics
export function computeBiologicalMetrics(habitId: HabitId, day: number): BiologicalMetrics {
  const d = Math.min(180, Math.max(1, day));
  
  // Base default curves
  let testosteroneLevel = 100;
  let cortisolLevel = 100;
  let toxinsCleared = Math.round(100 * (1 - Math.exp(-d / 12)));
  let immuneStrength = Math.round(60 + 38 * (1 - Math.exp(-d / 20)));
  let physicalPower = Math.round(70 + 30 * (1 - Math.exp(-d / 25)));
  let mentalFocus = Math.round(50 + 48 * (1 - Math.exp(-d / 18)));
  let muscleGainPotential = Math.round(40 + 55 * (1 - Math.exp(-d / 30)));
  let fatLossRate = Math.round(30 + 60 * (1 - Math.exp(-d / 22)));

  if (habitId === 'no-masturbation') {
    // Testosterone spikes around day 7 to 145%, then stabilizes around 125% representing high androgen density
    if (d <= 7) {
      testosteroneLevel = Math.round(100 + 45 * (d / 7));
    } else if (d <= 14) {
      // Gentle slope down from the peak
      testosteroneLevel = Math.round(145 - 20 * ((d - 7) / 7));
    } else {
      // Stabilizes at premium high androgen sensitivity level
      testosteroneLevel = Math.round(125 + 5 * Math.sin(d / 10));
    }

    // Cortisol starts elevated (due to immediate dopamine hunger and agitation) then drops
    if (d <= 5) {
      cortisolLevel = Math.round(120 - 10 * d);
    } else {
      cortisolLevel = Math.round(70 - 30 * (1 - Math.exp(-(d - 5) / 15)));
    }

    muscleGainPotential = Math.round(50 + 45 * (1 - Math.exp(-d / 15)));
    fatLossRate = Math.round(40 + 50 * (1 - Math.exp(-d / 18)));
    mentalFocus = Math.round(45 + 53 * (1 - Math.exp(-d / 14)));
  } 
  else if (habitId === 'no-smoking') {
    // Smoking heavily damages respiratory pathways. Toxin clearance is rapid at first
    toxinsCleared = Math.round(100 * (1 - Math.exp(-d / 6))); // Faster flushing
    testosteroneLevel = Math.round(100 + 20 * (1 - Math.exp(-d / 14))); // Nicotine stunts testosterone
    cortisolLevel = d <= 4 ? Math.round(130 - 15 * d) : Math.round(70 - 30 * (1 - Math.exp(-(d - 4) / 12)));
    physicalPower = Math.round(65 + 35 * (1 - Math.exp(-d / 15))); // VO2 max restoration
    immuneStrength = Math.round(55 + 43 * (1 - Math.exp(-d / 18)));
  } 
  else if (habitId === 'no-alcohol') {
    // Alcohol suppresses protein synthesis and lowers testosterone drastically.
    testosteroneLevel = Math.round(100 + 35 * (1 - Math.exp(-d / 10))); 
    muscleGainPotential = Math.round(40 + 58 * (1 - Math.exp(-d / 12)));
    fatLossRate = Math.round(50 + 45 * (1 - Math.exp(-d / 10))); // Liver fat shed is quick once sober
    cortisolLevel = d <= 3 ? Math.round(125 - 15 * d) : Math.round(65 - 25 * (1 - Math.exp(-(d - 3) / 14)));
    toxinsCleared = Math.round(100 * (1 - Math.exp(-d / 8)));
    immuneStrength = Math.round(50 + 48 * (1 - Math.exp(-d / 15)));
  } 
  else if (habitId === 'no-drugs') {
    cortisolLevel = d <= 10 ? Math.round(140 - 10 * d) : Math.round(60 - 25 * (1 - Math.exp(-(d - 10) / 20)));
    toxinsCleared = Math.round(100 * (1 - Math.exp(-d / 14)));
    mentalFocus = Math.round(30 + 68 * (1 - Math.exp(-d / 20)));
    immuneStrength = Math.round(45 + 53 * (1 - Math.exp(-d / 25)));
  } 
  else if (habitId === 'no-porn') {
    // Heavy dopamine rewiring
    mentalFocus = Math.round(40 + 58 * (1 - Math.exp(-d / 12)));
    testosteroneLevel = Math.round(100 + 15 * (1 - Math.exp(-d / 25))); // Psychological confidence boosts testosterone
    cortisolLevel = d <= 7 ? Math.round(115 - 8 * d) : Math.round(65 - 25 * (1 - Math.exp(-(d - 7) / 16)));
    toxinsCleared = Math.round(100 * (1 - Math.exp(-d / 10)));
  }

  return {
    testosteroneLevel,
    cortisolLevel,
    toxinsCleared,
    immuneStrength,
    physicalPower,
    mentalFocus,
    muscleGainPotential,
    fatLossRate,
  };
}

// Generate highly personalized, non-robotic, custom clinical recovery dossier for ANY single day (Up to 180 days)
export function getHealthImprovement(habitId: HabitId, day: number): HealthImprovement {
  const d = Math.min(180, Math.max(1, day));
  const phase = getPhaseData(d);
  const images = habitImages[habitId];
  const imageIndex = (d + habitId.length) % images.length;
  const imageUrl = images[imageIndex];

  // Dynamic progressive daily metrics calculation
  const metrics = computeBiologicalMetrics(habitId, d);

  // Curate day-specific terminology to ensure EVERY single day has custom narrative details
  let titleEn = '';
  let titleBn = '';
  let imageCaptionEn = '';
  let imageCaptionBn = '';
  
  let keyMilestonesEn: string[] = [];
  let keyMilestonesBn: string[] = [];
  
  const detailedSections: DetailedSection[] = [];

  // Generate dynamic values for textual interpolation to avoid robotic repetition
  const testDiff = metrics.testosteroneLevel - 100;
  const cortDiff = 100 - metrics.cortisolLevel;

  if (habitId === 'no-smoking') {
    titleEn = `Day ${d}: Lung Recalibration & Capillary Re-activation`;
    titleBn = `${d}ম দিন: ফুসফুসের নবজীবন ও রক্তনালীর সক্রিয়তা`;
    imageCaptionEn = `A close-up of healthy vascular tissues expanding and flushing out nicotine-induced debris on Day ${d}.`;
    imageCaptionBn = `${d}তম দিনে ক্ষতিকারক কার্বন মনোক্সাইড ধুয়ে রক্তের লোহিত কণিকায় অক্সিজেনের পূর্ণ প্রবাহ নিশ্চিত হচ্ছে।`;

    keyMilestonesEn = [
      `Carbon monoxide levels in your arterial blood have dropped by ${Math.min(99, 90 + d)}%, matching a standard clean-air baseline.`,
      `Your capillary blood flow is active, raising peripheral skin temperature and physical strength.`,
      `Alveolar cells are actively repairing, reducing cough severity while restoring high VO2 max capability.`,
      `Metabolic clearance of cotinine is ${metrics.toxinsCleared}% complete, purging heavy metal residues.`,
      `Your physical stamina is up by ${Math.round(d * 0.4 + 5)}%, allowing deeper training intensity in your workouts.`
    ];

    keyMilestonesBn = [
      `আপনার ধমনীর রক্তে কার্বন মনোক্সাইডের মাত্রা প্রায় ${Math.min(99, 90 + d)}% পর্যন্ত হ্রাস পেয়ে একটি পরিষ্কার ফুসফুসের স্তরে চলে এসেছে।`,
      `আপনার সূক্ষ্ম রক্তনালীগুলোর সঞ্চালন সক্রিয় হওয়ায় শরীরের প্রান্তীয় তাপমাত্রা এবং শক্তি বৃদ্ধি পাচ্ছে।`,
      `অ্যালভিওলার কোষগুলো সক্রিয়ভাবে নিরাময় লাভ করছে, যা ব্রঙ্কাইটিস প্রতিরোধের ক্ষমতা বাড়াচ্ছে।`,
      `রক্ত থেকে কোটিনিন এবং ক্ষতিকর রাসায়নিক নিষ্কাশন ${metrics.toxinsCleared}% সম্পন্ন হয়েছে।`,
      `আপনার ফুসফুসের ক্ষমতা ${Math.round(d * 0.4 + 5)}% বৃদ্ধি পেয়েছে, যা জিমে বা ভারী ব্যায়ামের সময় অতিরিক্ত স্থায়িত্ব দেয়।`
    ];

    detailedSections.push({
      sectionId: 'physiology_and_biochemistry',
      sectionTitleEn: '1. Physiology & Internal Biochemical Changes',
      sectionTitleBn: '১. শারীরবৃত্তীয় এবং অভ্যন্তরীণ বায়োকেমিক্যাল পরিবর্তন',
      biochemEn: [
        {
          heading: 'Cellular Hemoglobin Oxygenation',
          explanation: `On Day ${d}, the lack of inhaled smoke allows hemoglobin molecules to fully saturate with pure oxygen instead of poisonous carbon monoxide. Your cells are now producing energy at an accelerated rate via mitochondrial oxidative phosphorylation.`,
          impact: `Increases ATP cellular energy by ${Math.round(15 + d * 0.2)}%, delivering raw strength to skeletal muscles during training.`,
        },
        {
          heading: 'Hormonal & Stress Axis Calibration',
          explanation: `Your endocrine system is adjusting to life without nicotine spikes. Cortisol levels are down by ${Math.max(10, cortDiff)}%, reducing systemic inflammation, while testosterone absorption increases due to clean micro-vascular blood flow.`,
          impact: `Speeds up muscle fiber rebuilding after training and lowers general nervous anxiety.`,
        }
      ],
      biochemBn: [
        {
          heading: 'লোহিত রক্তকণিকায় বিশুদ্ধ অক্সিজেন প্রবাহ',
          explanation: `${d}তম দিনে, বাতাসে কোনো ধোঁয়া বা বিষ না থাকায় রক্তকণিকার হিমোগ্লোবিন কার্বন মনোক্সাইডের পরিবর্তে বিশুদ্ধ অক্সিজেন বহন করছে। আপনার কোষগুলো এখন চমৎকার গতিতে সেলুলার শক্তি উৎপন্ন করছে।`,
          impact: `কোষের শক্তি উৎপাদন বৃদ্ধি পেয়েছে যা পেশী গঠনে এবং ভারী পরিশ্রমের সময় চমৎকার ব্যাকআপ দেয়।`,
        },
        {
          heading: 'হরমোনাল ও স্ট্রেস এক্সিস ক্যালিব্রেশন',
          explanation: `নিকোটিনের কৃত্রিম প্রভাব ছাড়াই আপনার শরীর মানিয়ে নিচ্ছে। স্ট্রেস হরমোন কর্টিসল হ্রাস পেয়েছে প্রায় ${Math.max(10, cortDiff)}%, যা অভ্যন্তরীণ প্রদাহ দূর করে টেস্টোস্টেরন হরমোনের স্বাভাবিক প্রবাহ সচল করছে।`,
          impact: `ভারী ব্যায়ামের পর পেশীর ক্ষয় দ্রুত পূরণ করে এবং অলসতা দূর করে।`,
        }
      ]
    });
  } 
  else if (habitId === 'no-drugs') {
    titleEn = `Day ${d}: Neuro-Chemical Healing & Synaptic Rewiring`;
    titleBn = `${d}ম দিন: স্নায়বিক নিরাময় ও ডোপামিন রিসেপ্টর পুনর্গঠন`;
    imageCaptionEn = `Healthy neurons forming resilient connections on Day ${d} as toxic chemical fog completely dissolves.`;
    imageCaptionBn = `${d}তম দিনে মস্তিষ্কের ক্ষতিকর রাসায়নিক কুয়াশা কেটে গিয়ে গভীর স্মৃতি ও নিউরোপ্লাস্টিক সংযোগ গড়ে উঠছে।`;

    keyMilestonesEn = [
      `Your neural reward receptors have upregulated by ${Math.round(d * 0.3 + 15)}%, restoring sensitivity to natural happiness.`,
      `Systemic liver and kidney toxin purification index is currently sitting at ${metrics.toxinsCleared}%.`,
      `Deep REM sleep architecture is restored, elevating daytime cognitive focus by ${metrics.mentalFocus}%.`,
      `Cortisol stress spikes are down to normal range, easing chemical-induced agitation.`,
      `Immune cells are regenerated by ${metrics.immuneStrength}%, drastically boosting resistance to illness.`
    ];

    keyMilestonesBn = [
      `আপনার মস্তিষ্কের রিওয়ার্ড রিসেপ্টরগুলো প্রায় ${Math.round(d * 0.3 + 15)}% পর্যন্ত পুনরুদ্ধার হয়েছে, যা বিষণ্ণতা কাটাতে সাহায্য করছে।`,
      `আপনার লিভার ও কিডনির বিষাক্ত কেমিক্যাল ফিল্টারিং ইনডেক্স বর্তমানে ${metrics.toxinsCleared}% এ উন্নীত হয়েছে।`,
      `গভীর ঘুমের গুণমান ফিরে আসায় সারাদিনের কাজের দক্ষতা ও মনোযোগ প্রায় ${metrics.mentalFocus}% বৃদ্ধি পেয়েছে।`,
      `অস্থিরতা সৃষ্টিকারী হরমোন কর্টিসল এখন পুরোপুরি শান্ত ও স্বাভাবিক মাত্রায় নেমে এসেছে।`,
      `রোগ প্রতিরোধ ক্ষমতা উন্নত হয়েছে ${metrics.immuneStrength}%, যা ঋতু পরিবর্তনজনিত অসুস্থতা থেকে শরীরকে রক্ষা করে।`
    ];

    detailedSections.push({
      sectionId: 'physiology_and_biochemistry',
      sectionTitleEn: '1. Physiology & Internal Biochemical Changes',
      sectionTitleBn: '১. শারীরবৃত্তীয় এবং অভ্যন্তরীণ বায়োকেমিক্যাল পরিবর্তন',
      biochemEn: [
        {
          heading: 'Neurotransmitter Synthesis Correction',
          explanation: `On Day ${d}, your brain is synthesizing healthy levels of GABA and acetylcholine without external toxic interference. This stabilizes neurotransmission and calms the amygdala (the brain's anxiety center).`,
          impact: `Eradicates chronic brain fog, boosting cognitive clarity and problem-solving speed.`,
        },
        {
          heading: 'Immune Lymphocyte Restoration',
          explanation: `Toxic chemical residues suppress bone marrow cell production. Your white blood cells and lymphocyte count are returning to their prime defensive states, clearing systemic toxins.`,
          impact: `Boosts physical defense networks, speeding up cellular recovery and muscle healing.`,
        }
      ],
      biochemBn: [
        {
          heading: 'নিউরো-ট্রান্সমিটার সমতা অর্জন',
          explanation: `${d}তম দিনে, আপনার মস্তিষ্ক কোনো বাহ্যিক কেমিক্যালের কৃত্রিম চাপ ছাড়াই গ্যাবা এবং অ্যাসিটাইলকোলিন তৈরি করছে। এটি মস্তিষ্কের ভীতি ও অস্থিরতা নিয়ন্ত্রণকারী কেন্দ্র অ্যামিগডালাকে শান্ত রাখে।`,
          impact: `মাথার ভেতরের ঝিমঝিম ভাব বা ব্রেন-ফগ দূর করে মনোযোগ দেওয়ার ক্ষমতা বহুগুণ বাড়ায়।`,
        },
        {
          heading: 'লিম্ফোসাইট বা রোগ প্রতিরোধ কোষের পুনর্গঠন',
          explanation: `রাসায়নিক বিষাক্ততা হাড়ের মজ্জার কোষ তৈরিতে বাধা সৃষ্টি করত। আপনার শ্বেত রক্তকণিকা এবং লিম্ফোসাইট এখন সর্বোচ্চ সুরক্ষামূলক স্তরে ফিরে এসে শরীরকে প্রতিনিয়ত ডিটক্স করছে।`,
          impact: `পেশী নিরাময় ক্ষমতা ত্বরান্বিত করে এবং সারাদিন প্রাণবন্ত রাখে।`,
        }
      ]
    });
  } 
  else if (habitId === 'no-alcohol') {
    titleEn = `Day ${d}: Hepatic Regeneration & Metabolic Breakthrough`;
    titleBn = `${d}ম দিন: লিভারের পুনরুদ্ধার ও পুষ্টি শোষণের বিস্ময়`;
    imageCaptionEn = `Liver tissue processing nutrients at full speed on Day ${d}, reducing toxic visceral fat accumulation.`;
    imageCaptionBn = `${d}তম দিনে লিভারে জমে থাকা মেদ গলে রক্তের লিপিড প্রোফাইল চমৎকার স্বাভাবিক মাত্রায় নেমে আসছে।`;

    keyMilestonesEn = [
      `Your liver metabolic efficiency has risen to ${Math.min(100, 70 + d * 1.5)}%, restoring essential protein synthesis.`,
      `Testosterone production is optimized by ${testDiff > 0 ? `+${testDiff}%` : 'healthy optimal baseline'} as alcohol suppression is completely lifted.`,
      `Fat burn rate is up by ${metrics.fatLossRate}%, aiding lean abdominal fat removal.`,
      `Muscle glycogen storage capability has recovered by ${metrics.muscleGainPotential}%, giving you crazy strength for the gym.`,
      `Gastric mucosal lining has fully recovered, improving nutrient absorption.`
    ];

    keyMilestonesBn = [
      `আপনার যকৃত বা লিভারের কার্যক্ষমতা প্রায় ${Math.min(100, 70 + d * 1.5)}% পর্যন্ত বৃদ্ধি পেয়েছে, যা শরীরের বিষাক্ত চর্বি অপসারণ ত্বরান্বিত করে।`,
      `অ্যালকোহলের অবদমন উঠে যাওয়ায় টেস্টোস্টেরন হরমোন নিঃসরণ স্বাভাবিকের চেয়ে ${testDiff > 0 ? `+${testDiff}%` : 'অনেক'} বেড়েছে।`,
      `পেশীগুলোতে চর্বি ঝরানোর হার বৃদ্ধি পেয়েছে ${metrics.fatLossRate}%, যা মেদহীন সুগঠিত শরীর গঠনে সাহায্য করছে।`,
      `পেশীর গ্লাইকোজেন স্টোরেজ এবং শক্তি ধারণক্ষমতা বৃদ্ধি পেয়েছে প্রায় ${metrics.muscleGainPotential}%, যা জিমের ব্যায়ামের জন্য চরম ক্ষমতা এনে দেয়।`,
      `পাকস্থলীর ভেতরের স্তর সম্পূর্ণ নিরাময় হওয়ায় হজমশক্তি ও খাবারের পুষ্টি শোষণ ক্ষমতা বেড়েছে।`
    ];

    detailedSections.push({
      sectionId: 'physiology_and_biochemistry',
      sectionTitleEn: '1. Physiology & Internal Biochemical Changes',
      sectionTitleBn: '১. শারীরবৃত্তীয় এবং অভ্যন্তরীণ বায়োকেমিক্যাল পরিবর্তন',
      biochemEn: [
        {
          heading: 'Hepatic Mitochondrial Repair',
          explanation: `By avoiding alcohol, liver hepatocytes are no longer busy breaking down acetaldehyde. On Day ${d}, they are focusing entirely on metabolizing fatty acids and converting glucose into vital muscular energy.`,
          impact: `Drastically reduces visceral belly fat and increases natural metabolic energy.`,
        },
        {
          heading: 'Endocrine Testosterone Optimization',
          explanation: `Alcohol directly degrades Leydig cells in the testes and spikes estrogenic pathways. Quitting reverses this, restoring high natural testosterone output and suppressing cortisol stress levels.`,
          impact: `Increases protein synthesis and accelerates muscle mass development in weight training.`,
        }
      ],
      biochemBn: [
        {
          heading: 'লিভার মাইটোকন্ড্রিয়া পুনর্গঠন',
          explanation: `${d}তম দিনে, লিভারের কোষগুলো বিষাক্ত উপাদান ভাঙ্গার ঝামেলা থেকে মুক্ত। এখন তারা সম্পূর্ণ মনোযোগ দিচ্ছে চর্বি গলাতে এবং খাবারকে শরীরের পেশী শক্তিতে রূপান্তর করতে।`,
          impact: `পেটের অতিরিক্ত মেদ দূর করতে এবং সারাদিনের স্বাভাবিক কর্মশক্তি বাড়াতে সাহায্য করে।`,
        },
        {
          heading: 'টেস্টোস্টেরন ও হরমোনাল উন্নতি',
          explanation: `অ্যালকোহল হরমোন নিঃসরণে মারাত্মক বাধা দেয় এবং ইস্ট্রোজেনিক চর্বি বাড়ায়। মদ পরিহার করায় শরীরে টেস্টোস্টেরন হরমোন পূর্ণ শক্তিতে নিঃসরণ শুরু করেছে এবং কর্টিসল স্ট্রেস দমন করছে।`,
          impact: `পেশী গঠনে এবং জিমের ভারী ওজনের ব্যায়ামের পর পেশী দ্রুত শক্তিশালী করতে কাজ করে।`,
        }
      ]
    });
  } 
  else if (habitId === 'no-masturbation') {
    titleEn = `Day ${d}: Seminal Transmutation & Endocrine Surge`;
    titleBn = `${d}ম দিন: জীবনীশক্তির উর্ধ্বগমন ও অ্যান্ড্রোজেনিক তেজ`;
    imageCaptionEn = `Androgen receptors in muscle tissues and brain upregulating on Day ${d} for supreme focus and power.`;
    imageCaptionBn = `${d}তম দিনে মস্তিষ্কের অ্যান্ড্রোজেন রিসেপ্টরগুলো পুনরায় সতেজ হয়ে আপনার চোখ ও শারীরিক ভঙ্গিমায় তেজ ফিরিয়ে আনছে।`;

    keyMilestonesEn = [
      `Your androgen receptor sensitivity is up by ${Math.round(d * 0.3 + 20)}%, multiplying testosterone utilization.`,
      `Serum testosterone levels are optimized at ${metrics.testosteroneLevel}% of baseline, feeding physical power.`,
      `Cortisol is down by ${Math.max(15, cortDiff)}%, flushing out metabolic toxins and abdominal fat deposits.`,
      `Physical gym training power is elevated by ${metrics.physicalPower}%, bringing deep strength and focus.`,
      `Dopamine reward pathways have recalibrated by ${metrics.mentalFocus}%, completely removing lethargy.`
    ];

    keyMilestonesBn = [
      `আপনার অ্যান্ড্রোজেন রিসেপ্টরের সংবেদনশীলতা বৃদ্ধি পেয়েছে ${Math.round(d * 0.3 + 20)}%, যা টেস্টোস্টেরনকে কোষে সক্রিয়ভাবে কাজে লাগায়।`,
      `আপনার রক্তে টেস্টোস্টেরনের মাত্রা স্বাভাবিকের চেয়ে ${metrics.testosteroneLevel}% এ অপ্টিমাইজ হয়েছে, যা পেশী গঠনে অসাধারণ।`,
      `স্ট্রেস হরমোন কর্টিসল কমেছে প্রায় ${Math.max(15, cortDiff)}%, যা পেটের মেদ জমতে দেয় না এবং টক্সিন দূর করে।`,
      `জিমে ভারোত্তোলন এবং যেকোনো খেলাধুলার শারীরিক ক্ষমতা উন্নত হয়েছে ${metrics.physicalPower}%।`,
      `মস্তিষ্কের ডোপামিন গ্রাহকগুলো ${metrics.mentalFocus}% পুনরুদ্ধার হওয়ায় সকালের অলসতা ও বিষাদ কেটে গেছে।`
    ];

    detailedSections.push({
      sectionId: 'physiology_and_biochemistry',
      sectionTitleEn: '1. Physiology & Internal Biochemical Changes',
      sectionTitleBn: '১. শারীরবৃত্তীয় এবং অভ্যন্তরীণ বায়োকেমিক্যাল পরিবর্তন',
      biochemEn: [
        {
          heading: 'Androgen Receptor Upregulation',
          explanation: `By retaining seminal energy, your body upregulates androgen receptors in both the cerebral cortex and skeletal muscles. On Day ${d}, this enables efficient binding of free testosterone, supporting protein synthesis.`,
          impact: `Boosts lean muscle tissue development, accelerates recovery from gym workouts, and deepens vocal resonance.`,
        },
        {
          heading: 'Prolactin & Cortisol Suppression',
          explanation: `Breaking the post-release crash cycle stops the surge of prolactin (the lethargy hormone) and lowers baseline cortisol. Cortisol drops allow fat metabolism to optimize, removing stubborn belly fat.`,
          impact: `Removes brain fog and flat emotional states, replacing them with raw focus and masculine drive.`,
        }
      ],
      biochemBn: [
        {
          heading: 'অ্যান্ড্রোজেন রিসেপ্টর ডেনসিটি বৃদ্ধি',
          explanation: `নিজের জীবনীশক্তি ধরে রাখায় আপনার মস্তিষ্কের কর্টেক্স এবং কঙ্কাল পেশীতে অ্যান্ড্রোজেন রিসেপ্টর বাড়ে। ${d}তম দিনে, এটি টেস্টোস্টেরন হরমোনকে চমৎকারভাবে কোষে কোষে মেলাতে পারে।`,
          impact: `পেশী গঠনে গতি আনে, জিমের ভারী ব্যায়ামের ধকল দ্রুত সারিয়ে তোলে এবং গলার স্বরকে গম্ভীর করে।`,
        },
        {
          heading: 'প্রোল্যাকটিন ও কর্টিসল দমন',
          explanation: `বীর্যপাতের পরবর্তী ক্র্যাশ এড়ানোয় অলসতাদায়ক হরমোন প্রোল্যাকটিন এবং মানসিক চাপের হরমোন কর্টিসল কমে যায়। কর্টিসল কমায় শরীরের মেদ ঝরার গতি ত্বরান্বিত হয়।`,
          impact: `তীব্র অবসাদ ও মানসিক অলসতা দূর করে এক ধরণের সুদৃঢ় আত্মবিশ্বাস ও পুরুষালী তেজ এনে দেয়।`,
        }
      ]
    });
  } 
  else {
    // no-porn (Mental rewiring)
    titleEn = `Day ${d}: Neuroplastic Restoration & Prefrontal Gray Matter Thickening`;
    titleBn = `${d}ম দিন: নিউরোপ্লাস্টিক নিরাময় ও গ্রে-ম্যাটারের ঘনত্ব বৃদ্ধি`;
    imageCaptionEn = `Prefrontal neural pathways recovering structural density on Day ${d}, optimizing willpower.`;
    imageCaptionBn = `${d}তম দিনে ক্ষতিকারক অতিরিক্ত উত্তেজনা কেটে মস্তিষ্কের সামনের অংশ প্রি-ফ্রন্টাল কর্টেক্স শক্তিশালী হচ্ছে।`;

    keyMilestonesEn = [
      `Prefrontal cortex grey matter density has thickened by ${Math.round(d * 0.2 + 8)}%, restoring logical self-control.`,
      `Dopamine D2 receptor densities have upregulated by ${Math.round(d * 0.3 + 12)}%, boosting natural motivation.`,
      `Baseline cortisol is reduced by ${Math.max(10, cortDiff)}%, eliminating subconscious eye-contact hesitation and anxiety.`,
      `Cognitive clarity and memory processing speeds have spiked to ${metrics.mentalFocus}% efficiency.`,
      `Your deep sleep architecture (REM cycle) has stabilized by ${metrics.immuneStrength}%.`
    ];

    keyMilestonesBn = [
      `মস্তিষ্কের সামনের অংশ প্রি-ফ্রন্টাল কর্টেক্সের গ্রে-ম্যাটারের ঘনত্ব প্রায় ${Math.round(d * 0.2 + 8)}% বৃদ্ধি পেয়েছে, যা ইচ্ছাশক্তি বাড়ায়।` ,
      `মস্তিষ্কের ডোপামিন D2 রিসেপ্টর প্রায় ${Math.round(d * 0.3 + 12)}% বৃদ্ধি পেয়েছে, যা জীবনের ছোট জিনিস উপভোগ করার ক্ষমতা ফেরায়।`,
      `স্ট্রেস হরমোন কর্টিসল কমেছে প্রায় ${Math.max(10, cortDiff)}%, যার ফলে সামাজিক মেলামেশায় সংকোচ ও ভয় সম্পূর্ণ কেটে গেছে।`,
      `মানসিক স্বচ্ছতা, মনোযোগ ও মেমরি প্রসেসিং ক্ষমতা বর্তমানে ${metrics.mentalFocus}% দক্ষতায় কাজ করছে।`,
      `গভীর স্বপ্নের ঘুমের চক্র (REM Sleep) প্রায় ${metrics.immuneStrength}% পুনরুদ্ধার হয়েছে।`
    ];

    detailedSections.push({
      sectionId: 'physiology_and_biochemistry',
      sectionTitleEn: '1. Physiology & Internal Biochemical Changes',
      sectionTitleBn: '১. শারীরবৃত্তীয় এবং অভ্যন্তরীণ বায়োকেমিক্যাল পরিবর্তন',
      biochemEn: [
        {
          heading: 'Dopamine Receptor Upregulation',
          explanation: `Without visual hyper-stimulation, your brain no longer needs to defend itself by reducing dopamine receptors. On Day ${d}, new D2 receptors are sprouting, allowing you to find deep pleasure in real-world rewards.`,
          impact: `Cures anhedonia (the inability to feel pleasure) and establishes a calm, happy baseline state of mind.`,
        },
        {
          heading: 'Prefrontal Cortex Restructuring',
          explanation: `Your prefrontal cortex is recovering its veto-power over impulsive impulses. Neural pathways are rewiring away from immediate pleasure seeking to long-term career planning.`,
          impact: `Sharpens deep intellectual focus and critical problem-solving capabilities.`,
        }
      ],
      biochemBn: [
        {
          heading: 'ডোপামিন ডি২ রিসেপ্টর পুনর্গঠন',
          explanation: `কোনো কৃত্রিম অতিরিক্ত ভিজ্যুয়াল উত্তেজনা না থাকায় আপনার মস্তিষ্ককে আর ডোপামিন রিসেপ্টর লুকিয়ে রাখতে হচ্ছে না। ${d}তম দিনে, নতুন রিসেপ্টর গজানোর ফলে আপনি বাস্তব জীবনে আনন্দ ফিরে পাবেন।`,
          impact: `বিষণ্ণতা ও অনাগ্রহ কাটিয়ে তুলে মনকে সদা সতেজ এবং প্রফুল্ল রাখে।`,
        },
        {
          heading: 'প্রি-ফ্রন্টাল কর্টেক্সের পুনর্গঠন',
          explanation: `আপনার প্রি-ফ্রন্টাল কর্টেক্স যেকোনো সাময়িক ক্ষতিকর আবেগকে দমিয়ে রাখার নিয়ন্ত্রণ ক্ষমতা ফিরে পেয়েছে। মস্তিষ্কের পথগুলো এখন ক্যারিয়ার গঠনে ও দীর্ঘমেয়াদী উন্নতিতে ফোকাস করছে।`,
          impact: `পড়াশোনা, কোডিং বা যেকোনো কঠিন কাজে দীর্ঘ সময় মনোযোগ দেওয়ার অসাধারণ ক্ষমতা দেয়।`,
        }
      ]
    });
  }

  // Common external sensory section (curing, physical power, fat loss, focus)
  detailedSections.push({
    sectionId: 'external_sensory_and_symptoms',
    sectionTitleEn: '2. Physical Progress, Focus & Gym Diagnostics',
    sectionTitleBn: '২. শারীরিক উন্নতি, মনোযোগ ও জিমের সক্ষমতা পরীক্ষা',
    symptomsEn: [
      {
        symptom: 'Massive Physical Stamina & Gym Power',
        cause: `With optimized testosterone (${metrics.testosteroneLevel}%) and cortisol down by ${cortDiff}%, muscle tissues retain higher glycogen, boosting bench-press, squats, and running endurance.`,
      },
      {
        symptom: 'Visceral Fat Elimination & Muscle Leaness',
        cause: `Enhanced thyroid and lipid metabolism (fat loss rate: ${metrics.fatLossRate}%) help shed abdominal fat while high testosterone supports protein synthesis.`,
      },
      {
        symptom: 'Unshakeable Mental Drive & Laser Focus',
        cause: `Mitochondrial respiration in brain cells has surged, stabilizing focus and clear attention spanning over ${metrics.mentalFocus}% longer than day 1.`,
      }
    ],
    symptomsBn: [
      {
        symptom: 'শারীরিক স্ট্যামিনা ও জিমের অসাধারণ শক্তি',
        cause: `টেস্টোস্টেরন হরমোন ${metrics.testosteroneLevel}% এবং কর্টিসল স্ট্রেস হ্রাস পাওয়ায় পেশীগুলো দীর্ঘ সময় শক্তি ধরে রাখতে পারে, যা ভারোত্তোলন ও দৌড়ে গতি আনে।`,
      },
      {
        symptom: 'পেটের মেদ অপসারণ ও পেশীর পরিপক্বতা',
        cause: `মেটাবলিজম বৃদ্ধি পাওয়ায় (মেদ কমার হার: ${metrics.fatLossRate}%) তলপেটের অতিরিক্ত চর্বি ঝরে এবং পেশীগুলো আরও সুগঠিত ও লীন হয়।`,
      },
      {
        symptom: 'তীক্ষ্ণ লেজার মনোযোগ ও ইচ্ছাশক্তি',
        cause: `মস্তিষ্কের কোষগুলোতে অক্সিজেন বৃদ্ধি পাওয়ায় কাজ করার স্পৃহা এবং মনোযোগ দেওয়ার ক্ষমতা আগের চেয়ে ${metrics.mentalFocus}% এরও বেশি বৃদ্ধি পেয়েছে।`,
      }
    ]
  });

  // Dynamic actions
  const actionsEn: string[] = [];
  const actionsBn: string[] = [];
  
  if (habitId === 'no-masturbation' || habitId === 'no-porn') {
    actionsEn.push(
      `Push your absolute physical limits in the gym today with heavy weight training—your testosterone and muscle gain potential are sitting high at ${metrics.muscleGainPotential}%.`,
      'Do a cold water rinse or full cold shower to immediately calm down any trace of subconscious arousal or mental agitation.',
      `Allocate ${Math.round(30 + d * 0.5)} minutes of laser-focused learning or project coding today to feed your recovering neural pathways.`,
      'Do not lie in bed scrolling on social media. Put your devices away and sleep immediately when tired.'
    );
    actionsBn.push(
      `আজ জিমে নিজের সর্বোচ্চ শক্তি খাটান এবং ভারোত্তোলন করুন—আপনার পেশী গঠনের সম্ভাবনা এখন ${metrics.muscleGainPotential}% এ রয়েছে।`,
      'হঠাৎ খারাপ চিন্তা মাথায় এলে সাথে সাথেই মুখে ঠাণ্ডা পানি দিন বা ঠাণ্ডা গোসল করে নিন যা স্নায়ুকে শান্ত করবে।',
      `আজ আপনার পুনর্গঠিত স্নায়ুর খোরাক জোগাতে অন্তত ${Math.round(30 + d * 0.5)} মিনিট গভীরভাবে পড়াশোনা বা জটিল কোডিং করুন।`,
      'বিছানায় শুয়ে শুয়ে অলস ফেসবুক বা ইউটিউব স্ক্রলিং সম্পূর্ণ পরিহার করুন। ঘুম এলে ফোন দূরে রেখে ঘুমিয়ে পড়ুন।'
    );
  } else {
    actionsEn.push(
      'Drink 3.5 liters of mineral-rich clean water today to flush out cotinine, acetaldehyde, and metabolic toxins.',
      `Do a 25-minute brisk cardiovascular run or gym cardio to expand your recovering lung capacity (immune strength is at ${metrics.immuneStrength}%).`,
      'Engage in diaphragmatic deep breathing for 5 minutes when a sudden trace of craving or stress wave arises.',
      'Reward your brain with natural dopamine triggers today: read a physical book, talk to a supportive friend, or walk in nature.'
    );
    actionsBn.push(
      'শরীর থেকে ক্ষতিকর রাসায়নিকের অবশিষ্টাংশ দ্রুত বের করে দিতে আজ অন্তত সাড়ে ৩ লিটার পানি পান করুন।',
      `ফুসফুসের ক্ষমতা পুনরুদ্ধার করতে আজ ২৫ মিনিট জগিং বা দ্রুত হাঁটুন (রোগ প্রতিরোধ ক্ষমতা এখন ${metrics.immuneStrength}% এ রয়েছে)।`,
      'হঠাৎ কোনো টান বা স্ট্রেস অনুভব করলে বুক ভরে ৫ সেকেন্ড লম্বা শ্বাস নিন এবং ৫ সেকেন্ড ধরে রেখে আস্তে আস্তে ছাড়ুন।',
      'প্রাকৃতিক উপায়ে মস্তিষ্কে ডোপামিন ফেরান: একটি ভালো বই পড়ুন, প্রিয় কোনো মানুষের সাথে কথা বলুন বা প্রকৃতির সান্নিধ্যে সময় কাটান।'
    );
  }

  detailedSections.push({
    sectionId: 'actionable_coping_strategies',
    sectionTitleEn: '3. Highly Motivating Coping Protocols',
    sectionTitleBn: '৩. অত্যন্ত শক্তিশালী মোকাবেলা করার নিয়ম',
    actionsEn,
    actionsBn
  });

  // Motivational summaries (completely natural, natural texts, no robotic language)
  let summaryEn = '';
  let summaryBn = '';

  if (habitId === 'no-masturbation' || habitId === 'no-porn') {
    summaryEn = `You are actively holding and transmuting the ultimate creative power of nature. Instead of throwing away your biochemical resources, you are rebuilding your grey matter density, repairing dopamine receptors, and strengthening your testosterone profile. This physical power is yours to dominate in the gym, in your career, and in your life. Stay focused on your rocket flight—infinite clarity and power are ahead.`;
    summaryBn = `আপনি প্রকৃতির সবচেয়ে শক্তিশালী সৃজনশীল শক্তিকে অপচয় না করে নিজের নিয়ন্ত্রণে রূপান্তরিত করছেন। আপনার ক্ষয়ে যাওয়া মস্তিষ্ক এখন সতেজ হচ্ছে, ডোপামিন গ্রাহকগুলো সুস্থ হচ্ছে এবং টেস্টোস্টেরন হরমোন পেশী গঠন করছে। এই অপার শক্তি দিয়ে জিম, ক্যারিয়ার এবং জীবন জয় করুন। রকেট মিশনে অবিচল থাকুন, পরম তেজ আপনার হাতের মুঠোয়!`;
  } else if (habitId === 'no-smoking') {
    summaryEn = `Your respiratory cells are cheering. By refusing to let carbon monoxide and tar suffocate your life, your hemoglobin is fully pure, delivering massive oxygen levels to your muscles and brain. Your endurance is returning, and your heart is beating with zero smoking strain. Continue your flight toward supreme health and longevity!`;
    summaryBn = `আপনার ফুসফুসের প্রতিটি কোষ আজ স্বস্তির নিঃশ্বাস ফেলছে। ক্ষতিকর বিষাক্ত ধোঁয়া ও আলকাতরা পরিহার করায় আপনার রক্ত এখন বিশুদ্ধ ও সজীব। আপনার হার্ট এখন অতিরিক্ত চাপমুক্ত এবং সহনশীলতা সর্বোচ্চ স্তরে উঠছে। পরম সুস্থতা ও দীর্ঘায়ুর এই অনন্য রকেট মিশন অব্যাহত রাখুন!`;
  } else {
    summaryEn = `You are breaking free from chemical chains. Your liver is thriving, shedding fat, and metabolizing nutrients at full speed. Your brain chemistry is stabilizing back to natural baseline happiness. Your skin is glowing with pure hydration and clean blood circulation. Keep ascending—you have successfully reclaimed your health and future!`;
    summaryBn = `আপনি বিষাক্ত রাসায়নিক শৃঙ্খল ভেঙে খাঁচামুক্ত পাখির মতো উড়ছেন। আপনার লিভার এখন মেদহীন ও বিষমুক্ত, আর মস্তিষ্ক ফিরে পাচ্ছে প্রাকৃতিকভাবে সুখী থাকার স্নায়ুবিক ক্ষমতা। বিশুদ্ধ রক্তের প্রবাহে আপনার ত্বক লাবণ্যময় হয়ে উঠছে। পরম স্বাধীনতা ও সুস্থতার এই অনন্য রকেট মিশন সচল রাখুন!`;
  }

  detailedSections.push({
    sectionId: 'motivational_summary',
    sectionTitleEn: '4. Absolute Motivational Mandate',
    sectionTitleBn: '৪. দৃঢ় অনুপ্রেরণামূলক বার্তা',
    summaryEn,
    summaryBn
  });

  // Create description lines for backward compatibility
  const descEn = detailedSections[0].biochemEn?.[0]?.explanation.substring(0, 110) + '...' || 'Biochemical recovery is gaining momentum.';
  const descBn = detailedSections[0].biochemBn?.[0]?.explanation.substring(0, 110) + '...' || 'শারীরিক ও জৈবিক পুনরুদ্ধার প্রক্রিয়া সক্রিয় হচ্ছে।';

  return {
    day,
    timeframe: phase.timeframe,
    titleEn,
    titleBn,
    descEn,
    descBn,
    category: phase.category,
    icon: phase.icon,
    imageUrl,
    imageCaptionEn,
    imageCaptionBn,
    keyMilestonesEn,
    keyMilestonesBn,
    detailedSections,
    metrics,
  };
}
