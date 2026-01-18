
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { TimerState, Station, FocusSession, Destination, MissionLabel, GroundingChunk } from './types';
import { getDestinationRealtimeData } from './services/geminiService';
import TrainAnimation from './components/TrainAnimation';
import TicketModal from './components/TicketModal';
import Stats from './components/Stats';
import { Play, Pause, Square, Ticket, AlertCircle, CheckCircle2, Map, ArrowRight, FlagTriangleRight, Armchair, Sparkles, Cloud, Sun, CloudRain, Snowflake, Wind, Thermometer, Tag, Plus, X, BookOpen, Briefcase, Code, Coffee, PenTool, Clock, Trash2, Brain, Music, Dumbbell, Gamepad2, ShoppingCart, Camera, Calculator, Heart, Globe, Zap, Palette, ExternalLink, MapPin, Volume2, VolumeX, Music2, SkipForward, SkipBack, Shuffle, Hourglass } from 'lucide-react';

// Icon Mapping
const ICON_MAP: Record<string, React.ElementType> = {
  book: BookOpen,
  briefcase: Briefcase,
  code: Code,
  coffee: Coffee,
  pen: PenTool,
  brain: Brain,
  music: Music,
  dumbbell: Dumbbell,
  gamepad: Gamepad2,
  cart: ShoppingCart,
  camera: Camera,
  calc: Calculator,
  heart: Heart,
  globe: Globe,
  zap: Zap,
  tag: Tag,
  palette: Palette
};

// Available Colors for Custom Labels
const AVAILABLE_COLORS = [
  'red', 'orange', 'amber', 'yellow', 'lime', 'green', 'emerald', 'teal', 
  'cyan', 'sky', 'blue', 'indigo', 'violet', 'purple', 'fuchsia', 'pink', 'rose'
];

// Audio Assets
const AUDIO_URLS = {
  CLICK: "https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3", // Crisp Click
  DEPARTURE: "https://assets.mixkit.co/active_storage/sfx/2737/2737-preview.mp3", // Whistle
  ARRIVAL: "https://assets.mixkit.co/active_storage/sfx/1381/1381-preview.mp3", // Station Bell/Chime (No waves/hiss)
};

// Updated Music Tracks - Reduced to 3 reliable tracks
const MUSIC_TRACKS = [
  { name: "Chill Lo-Fi", url: "https://cdn.pixabay.com/audio/2022/05/27/audio_1808fbf07a.mp3" },
  { name: "Empty Mind", url: "https://cdn.pixabay.com/audio/2022/09/02/audio_72502a492a.mp3" }, 
  { name: "Study Beat", url: "https://cdn.pixabay.com/audio/2022/01/21/audio_31743c58bd.mp3" }
];

// Destinations Configuration
const FREESTYLE_DESTINATION: Destination = {
  id: 'freestyle',
  name: 'Freestyle',
  region: 'Unknown',
  durationMinutes: 0,
  distanceKm: 0,
  themeColor: 'text-slate-200',
  imageUrl: 'https://images.unsplash.com/photo-1470115636492-6d2b56f9146d?auto=format&fit=crop&w=800&q=80',
  lat: 0, lng: 0, timezone: 'UTC'
};

const DESTINATIONS: Destination[] = [
  { 
    id: 'commute', 
    name: 'Suburbs', 
    region: 'Local Line', 
    durationMinutes: 15, 
    distanceKm: 12, 
    themeColor: 'text-blue-400',
    imageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80',
    lat: 40.7128, lng: -74.0060, timezone: 'America/New_York' // Generic
  },
  { 
    id: 'kyoto', 
    name: 'Kyoto', 
    region: 'Japan', 
    durationMinutes: 25, 
    distanceKm: 45, 
    themeColor: 'text-pink-400',
    imageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80',
    lat: 35.0116, lng: 135.7681, timezone: 'Asia/Tokyo'
  },
  { 
    id: 'zurich', 
    name: 'Zürich', 
    region: 'Switzerland', 
    durationMinutes: 45, 
    distanceKm: 120, 
    themeColor: 'text-cyan-400',
    imageUrl: 'https://images.unsplash.com/photo-1515488764276-beab7607c1e6?auto=format&fit=crop&w=800&q=80',
    lat: 47.3769, lng: 8.5417, timezone: 'Europe/Zurich'
  },
  { 
    id: 'paris', 
    name: 'Paris', 
    region: 'France', 
    durationMinutes: 60, 
    distanceKm: 300, 
    themeColor: 'text-amber-400',
    imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80',
    lat: 48.8566, lng: 2.3522, timezone: 'Europe/Paris'
  },
  { 
    id: 'london', 
    name: 'London', 
    region: 'UK', 
    durationMinutes: 90, 
    distanceKm: 450, 
    themeColor: 'text-red-400',
    imageUrl: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=800&q=80',
    lat: 51.5074, lng: -0.1278, timezone: 'Europe/London'
  },
  { 
    id: 'berlin', 
    name: 'Berlin', 
    region: 'Germany', 
    durationMinutes: 120, 
    distanceKm: 800, 
    themeColor: 'text-yellow-400',
    imageUrl: 'https://images.unsplash.com/photo-1560969184-10fe8719e047?auto=format&fit=crop&w=800&q=80',
    lat: 52.5200, lng: 13.4050, timezone: 'Europe/Berlin'
  },
  { 
    id: 'cairo', 
    name: 'Cairo', 
    region: 'Egypt', 
    durationMinutes: 150, 
    distanceKm: 1800, 
    themeColor: 'text-orange-300',
    imageUrl: 'https://images.unsplash.com/photo-1572252009286-268acec5ca0a?auto=format&fit=crop&w=800&q=80',
    lat: 30.0444, lng: 31.2357, timezone: 'Africa/Cairo'
  },
  { 
    id: 'istanbul', 
    name: 'Istanbul', 
    region: 'Turkey', 
    durationMinutes: 180, 
    distanceKm: 2500, 
    themeColor: 'text-orange-500',
    imageUrl: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=800&q=80',
    lat: 41.0082, lng: 28.9784, timezone: 'Europe/Istanbul'
  },
  { 
    id: 'tokyo', 
    name: 'Tokyo', 
    region: 'Japan', 
    durationMinutes: 240, 
    distanceKm: 9000, 
    themeColor: 'text-fuchsia-400',
    imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=800&q=80',
    lat: 35.6762, lng: 139.6503, timezone: 'Asia/Tokyo'
  },
  { 
    id: 'nyc', 
    name: 'New York', 
    region: 'USA', 
    durationMinutes: 300, 
    distanceKm: 6000, 
    themeColor: 'text-emerald-400',
    imageUrl: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=800&q=80',
    lat: 40.7128, lng: -74.0060, timezone: 'America/New_York'
  },
  { 
    id: 'rio', 
    name: 'Rio', 
    region: 'Brazil', 
    durationMinutes: 360, 
    distanceKm: 8000, 
    themeColor: 'text-green-500',
    imageUrl: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=800&q=80',
    lat: -22.9068, lng: -43.1729, timezone: 'America/Sao_Paulo'
  },
  { 
    id: 'sydney', 
    name: 'Sydney', 
    region: 'Australia', 
    durationMinutes: 480, 
    distanceKm: 12000, 
    themeColor: 'text-indigo-400',
    imageUrl: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=800&q=80',
    lat: -33.8688, lng: 151.2093, timezone: 'Australia/Sydney'
  },
];

// Hidden Destinations for Surprise/Freestyle (Expanded and Verified)
const HIDDEN_DESTINATIONS: Destination[] = [
  { 
    id: 'rome', name: 'Rome', region: 'Italy', durationMinutes: 60, distanceKm: 800, 
    themeColor: 'text-amber-500', lat: 41.9028, lng: 12.4964, timezone: 'Europe/Rome',
    imageUrl: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=800&q=80'
  },
  { 
    id: 'barcelona', name: 'Barcelona', region: 'Spain', durationMinutes: 60, distanceKm: 900, 
    themeColor: 'text-orange-400', lat: 41.3851, lng: 2.1734, timezone: 'Europe/Madrid',
    imageUrl: 'https://images.unsplash.com/photo-1579282240050-352db0a14c21?auto=format&fit=crop&w=800&q=80'
  },
  { 
    id: 'reykjavik', name: 'Reykjavik', region: 'Iceland', durationMinutes: 60, distanceKm: 2000, 
    themeColor: 'text-cyan-300', lat: 64.1466, lng: -21.9426, timezone: 'Atlantic/Reykjavik',
    imageUrl: 'https://images.unsplash.com/photo-1476610182048-b716b8518aae?auto=format&fit=crop&w=800&q=80'
  },
  { 
    id: 'singapore', name: 'Singapore', region: 'Asia', durationMinutes: 60, distanceKm: 9500, 
    themeColor: 'text-emerald-500', lat: 1.3521, lng: 103.8198, timezone: 'Asia/Singapore',
    imageUrl: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=800&q=80'
  },
  { 
    id: 'cape-town', name: 'Cape Town', region: 'South Africa', durationMinutes: 60, distanceKm: 10000, 
    themeColor: 'text-yellow-500', lat: -33.9249, lng: 18.4241, timezone: 'Africa/Johannesburg',
    imageUrl: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?auto=format&fit=crop&w=800&q=80'
  },
  { 
    id: 'amsterdam', name: 'Amsterdam', region: 'Netherlands', durationMinutes: 60, distanceKm: 400, 
    themeColor: 'text-red-400', lat: 52.3676, lng: 4.9041, timezone: 'Europe/Amsterdam',
    imageUrl: 'https://images.unsplash.com/photo-1512470876302-6a084e9c62ea?auto=format&fit=crop&w=800&q=80'
  },
  { 
    id: 'vancouver', name: 'Vancouver', region: 'Canada', durationMinutes: 60, distanceKm: 5000, 
    themeColor: 'text-teal-400', lat: 49.2827, lng: -123.1207, timezone: 'America/Vancouver',
    imageUrl: 'https://images.unsplash.com/photo-1559511260-66a654ae98e2?auto=format&fit=crop&w=800&q=80'
  },
  { 
    id: 'seoul', name: 'Seoul', region: 'South Korea', durationMinutes: 60, distanceKm: 8500, 
    themeColor: 'text-indigo-400', lat: 37.5665, lng: 126.9780, timezone: 'Asia/Seoul',
    imageUrl: 'https://images.unsplash.com/photo-1517154421773-0529f29ea451?auto=format&fit=crop&w=800&q=80'
  },
  { 
    id: 'dubai', name: 'Dubai', region: 'UAE', durationMinutes: 60, distanceKm: 6000, 
    themeColor: 'text-amber-300', lat: 25.2048, lng: 55.2708, timezone: 'Asia/Dubai',
    imageUrl: 'https://images.unsplash.com/photo-1512453979798-5ea904ac66de?auto=format&fit=crop&w=800&q=80'
  },
  { 
    id: 'prague', name: 'Prague', region: 'Czech Republic', durationMinutes: 60, distanceKm: 700, 
    themeColor: 'text-orange-300', lat: 50.0755, lng: 14.4378, timezone: 'Europe/Prague',
    imageUrl: 'https://images.unsplash.com/photo-1541849546-216549ae216d?auto=format&fit=crop&w=800&q=80'
  },
  { 
    id: 'athens', name: 'Athens', region: 'Greece', durationMinutes: 60, distanceKm: 2000, 
    themeColor: 'text-blue-300', lat: 37.9838, lng: 23.7275, timezone: 'Europe/Athens',
    imageUrl: 'https://images.unsplash.com/photo-1603565816030-6b389eeb23cb?auto=format&fit=crop&w=800&q=80'
  }
];

const PRESET_LABELS: MissionLabel[] = [
  { id: 'study', name: 'Study', color: 'indigo', icon: 'book', subLabels: ['Math', 'Physics', 'Chemistry', 'Biology', 'History', 'Literature', 'CS'] },
  { id: 'work', name: 'Work', color: 'blue', icon: 'briefcase' },
  { id: 'reading', name: 'Reading', color: 'yellow', icon: 'coffee', customSubLabelPrompt: 'Book Title' },
  { id: 'code', name: 'Code', color: 'emerald', icon: 'code' },
  { id: 'writing', name: 'Writing', color: 'pink', icon: 'pen' },
];

const MOTIVATIONAL_TIPS = [
  "Deep Work is a superpower in the 21st century.",
  "Focus isn't about saying yes, it's about saying no to good ideas.",
  "The train is moving. Don't jump off.",
  "Momentum creates motivation, not the other way around.",
  "Just one more minute of focus.",
  "You are building mental muscle right now.",
  "Distraction is the enemy of depth.",
  "Keep your eyes on the rails.",
  "Flow state is just around the corner.",
  "Every mile counts.",
];

interface WeatherState {
  temp: number;
  condition: string;
  environment: Station['environment'];
  Icon: React.ElementType;
}

const App: React.FC = () => {
  // State
  const [timerState, setTimerState] = useState<TimerState>(TimerState.IDLE);
  const [selectedDestination, setSelectedDestination] = useState<Destination>(DESTINATIONS[1]); 
  const [timeLeft, setTimeLeft] = useState<number>(DESTINATIONS[1].durationMinutes * 60); 
  const [initialDuration, setInitialDuration] = useState<number>(DESTINATIONS[1].durationMinutes * 60);
  
  // Freestyle Logic
  const [showFreestyleModal, setShowFreestyleModal] = useState(false);
  const [customHours, setCustomHours] = useState(0);
  const [customMinutes, setCustomMinutes] = useState(45);

  // Mission Inputs
  const [taskDetail, setTaskDetail] = useState<string>("");
  const [availableLabels, setAvailableLabels] = useState<MissionLabel[]>(PRESET_LABELS);
  const [activeLabel, setActiveLabel] = useState<MissionLabel | null>(null);
  const [activeSubLabel, setActiveSubLabel] = useState<string | null>(null);
  
  // Custom Label Creation
  const [isCreatingLabel, setIsCreatingLabel] = useState(false);
  const [newLabelName, setNewLabelName] = useState("");
  const [newLabelColor, setNewLabelColor] = useState<string>("indigo");
  const [newLabelIcon, setNewLabelIcon] = useState<string>("tag");

  const [currentStation, setCurrentStation] = useState<Station | null>(null);
  const [preloadedStation, setPreloadedStation] = useState<Station | null>(null);
  const [sessions, setSessions] = useState<FocusSession[]>([]);
  const [loadingStation, setLoadingStation] = useState<boolean>(false);
  const [isBooking, setIsBooking] = useState<boolean>(false);
  const [selectedSeat, setSelectedSeat] = useState<string>("");
  const [confirmAbandon, setConfirmAbandon] = useState<boolean>(false);
  const [currentTip, setCurrentTip] = useState<string>(MOTIVATIONAL_TIPS[0]);
  const [weather, setWeather] = useState<WeatherState>({ temp: 20, condition: 'Clear', environment: 'clear', Icon: Sun });
  const [localTime, setLocalTime] = useState<string>("");
  
  // Grounding Data
  const [groundingChunks, setGroundingChunks] = useState<GroundingChunk[]>([]);
  
  // Audio State
  const [isMusicOn, setIsMusicOn] = useState<boolean>(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);
  const musicRef = useRef<HTMLAudioElement | null>(null);
  
  // Refs
  const timerRef = useRef<number | null>(null);

  // Initialize Audio
  useEffect(() => {
    // Initialize Music Player
    musicRef.current = new Audio();
    musicRef.current.loop = true;
    musicRef.current.volume = 0.4;
    // Set initial source
    musicRef.current.src = MUSIC_TRACKS[0].url;
  }, []);

  // Track Change Effect
  useEffect(() => {
    if (musicRef.current) {
        // Pause current to switch
        const wasPlaying = !musicRef.current.paused || (timerState === TimerState.RUNNING && isMusicOn);
        musicRef.current.pause();
        
        musicRef.current.src = MUSIC_TRACKS[currentTrackIndex].url;
        musicRef.current.load(); // Important for reliability

        if (isMusicOn && wasPlaying) {
            musicRef.current.play().catch(e => console.log("Track switch play failed", e));
        }
    }
  }, [currentTrackIndex]);

  // Helper: Play Click Sound
  const playClick = () => {
    const audio = new Audio(AUDIO_URLS.CLICK); 
    audio.volume = 0.5;
    audio.play().catch(() => {});
  };

  // Helper: Play One-Shot SFX
  const playSfx = (url: string) => {
    try {
      const audio = new Audio(url);
      audio.volume = 0.6;
      audio.play().catch(e => console.log("SFX play failed (likely blocked):", e));
    } catch (e) {
       console.error("Audio error", e);
    }
  };

  // Effect: Manage Playing Audio based on TimerState
  useEffect(() => {
    if (!musicRef.current) return;

    if (timerState === TimerState.RUNNING) {
      // Resume or Start Music if enabled
      if (isMusicOn) {
        musicRef.current.play().catch(e => console.log("Music play failed:", e));
      } else {
        musicRef.current.pause();
      }
    } else {
      // Pause Everything
      musicRef.current.pause();
    }
  }, [timerState, isMusicOn]);

  // Calculate Progress
  const progress = Math.max(0, Math.min(100, ((initialDuration - timeLeft) / initialDuration) * 100));

  // --- Real-time Weather/Station Fetching via Gemini with Maps Grounding ---
  const fetchDataForDestination = useCallback(async (dest: Destination) => {
    // Skip fetching for the placeholder freestyle object if it's currently selected (before real selection)
    if (dest.id === 'freestyle') return;

    // We intentionally do not block UI. This runs in background to update widgets.
    try {
      const result = await getDestinationRealtimeData(dest.name);
      
      if (result) {
        // Map returned condition string to our App environment types
        const cond = result.weather.condition.toLowerCase();
        let env: Station['environment'] = 'city';
        let Icon = Sun;

        if (cond.includes('snow')) { env = 'snow'; Icon = Snowflake; }
        else if (cond.includes('rain') || cond.includes('drizzle')) { env = 'city'; Icon = CloudRain; }
        else if (cond.includes('storm')) { env = 'cyberpunk'; Icon = CloudRain; }
        else if (cond.includes('fog') || cond.includes('mist')) { env = 'nature'; Icon = Wind; }
        else if (cond.includes('cloud')) { env = 'nature'; Icon = Cloud; }
        else if (cond.includes('clear') || cond.includes('sun')) { env = 'clear'; Icon = Sun; }
        else if (cond.includes('hot')) { env = 'desert'; Icon = Sun; }
        
        const finalEnv = (['city', 'nature', 'cyberpunk', 'desert', 'snow', 'clear'].includes(result.station.environment) 
                         ? result.station.environment 
                         : env) as Station['environment'];

        setWeather({
          temp: result.weather.temp,
          condition: result.weather.condition,
          environment: finalEnv,
          Icon
        });

        setLocalTime(result.localTime);
        setPreloadedStation(result.station); // Store real station for later
        setGroundingChunks(result.groundingChunks);
      }
    } catch (error) {
      console.error("Failed to fetch destination data", error);
    }
  }, []);

  // Fetch data when destination changes
  useEffect(() => {
    fetchDataForDestination(selectedDestination);
  }, [selectedDestination, fetchDataForDestination]);


  // Timer Logic
  useEffect(() => {
    if (timerState === TimerState.RUNNING && timeLeft > 0) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && timerState === TimerState.RUNNING) {
      completeSession();
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerState, timeLeft]);

  // Motivational Tips Rotation
  useEffect(() => {
    if (timerState === TimerState.RUNNING) {
      const interval = setInterval(() => {
        const randomTip = MOTIVATIONAL_TIPS[Math.floor(Math.random() * MOTIVATIONAL_TIPS.length)];
        setCurrentTip(randomTip);
      }, 30000); // Change every 30 seconds
      return () => clearInterval(interval);
    }
  }, [timerState]);

  // Format Time
  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Format Duration for Display (minutes to hours)
  const formatDurationDisplay = (minutes: number) => {
    const hours = minutes / 60;
    if (Number.isInteger(hours)) {
      return `${hours}h`;
    }
    return `${hours.toFixed(1).replace(/\.0$/, '')}h`;
  };

  // Helper for Label Colors
  const getLabelColorClasses = (color: string, isSelected: boolean) => {
     // Default mapping for presets
     const map: Record<string, string> = {
        indigo: isSelected ? 'bg-indigo-600 text-white border-indigo-400' : 'bg-indigo-900/40 text-indigo-200 border-indigo-800/50 hover:bg-indigo-900/60',
        blue: isSelected ? 'bg-blue-600 text-white border-blue-400' : 'bg-blue-900/40 text-blue-200 border-blue-800/50 hover:bg-blue-900/60',
        yellow: isSelected ? 'bg-yellow-600 text-white border-yellow-400' : 'bg-yellow-900/40 text-yellow-200 border-yellow-800/50 hover:bg-yellow-900/60',
        emerald: isSelected ? 'bg-emerald-600 text-white border-emerald-400' : 'bg-emerald-900/40 text-emerald-200 border-emerald-800/50 hover:bg-emerald-900/60',
        pink: isSelected ? 'bg-pink-600 text-white border-pink-400' : 'bg-pink-900/40 text-pink-200 border-pink-800/50 hover:bg-pink-900/60',
        // Fallbacks
        fuchsia: isSelected ? 'bg-fuchsia-600 text-white border-fuchsia-400' : 'bg-fuchsia-900/40 text-fuchsia-200 border-fuchsia-800/50 hover:bg-fuchsia-900/60',
        orange: isSelected ? 'bg-orange-600 text-white border-orange-400' : 'bg-orange-900/40 text-orange-200 border-orange-800/50 hover:bg-orange-900/60',
        cyan: isSelected ? 'bg-cyan-600 text-white border-cyan-400' : 'bg-cyan-900/40 text-cyan-200 border-cyan-800/50 hover:bg-cyan-900/60',
        red: isSelected ? 'bg-red-600 text-white border-red-400' : 'bg-red-900/40 text-red-200 border-red-800/50 hover:bg-red-900/60',
        amber: isSelected ? 'bg-amber-600 text-white border-amber-400' : 'bg-amber-900/40 text-amber-200 border-amber-800/50 hover:bg-amber-900/60',
        lime: isSelected ? 'bg-lime-600 text-white border-lime-400' : 'bg-lime-900/40 text-lime-200 border-lime-800/50 hover:bg-lime-900/60',
        teal: isSelected ? 'bg-teal-600 text-white border-teal-400' : 'bg-teal-900/40 text-teal-200 border-teal-800/50 hover:bg-teal-900/60',
        sky: isSelected ? 'bg-sky-600 text-white border-sky-400' : 'bg-sky-900/40 text-sky-200 border-sky-800/50 hover:bg-sky-900/60',
        violet: isSelected ? 'bg-violet-600 text-white border-violet-400' : 'bg-violet-900/40 text-violet-200 border-violet-800/50 hover:bg-violet-900/60',
        purple: isSelected ? 'bg-purple-600 text-white border-purple-400' : 'bg-purple-900/40 text-purple-200 border-purple-800/50 hover:bg-purple-900/60',
        rose: isSelected ? 'bg-rose-600 text-white border-rose-400' : 'bg-rose-900/40 text-rose-200 border-rose-800/50 hover:bg-rose-900/60',
        green: isSelected ? 'bg-green-600 text-white border-green-400' : 'bg-green-900/40 text-green-200 border-green-800/50 hover:bg-green-900/60',
     };
     
     if (!map[color]) {
         return isSelected ? `bg-${color}-600 text-white border-${color}-400` : `bg-${color}-900/40 text-${color}-200 border-${color}-800/50 hover:bg-${color}-900/60`;
     }

     return map[color];
  };

  // Actions
  const handleDepartClick = () => {
    playClick();
    if (!activeLabel) {
       alert("Please select a mission label (e.g., Study, Work).");
       return;
    }
    
    // Check for predefined sublabels
    if (activeLabel.subLabels && !activeSubLabel) {
       alert(`Please select a subject for ${activeLabel.name}.`);
       return;
    }

    // Check for custom sublabel input
    if (activeLabel.customSubLabelPrompt && (!activeSubLabel || !activeSubLabel.trim())) {
        alert(`Please enter the ${activeLabel.customSubLabelPrompt.toLowerCase()}.`);
        return;
    }

    // Check if we are in Freestyle mode
    if (selectedDestination.id === 'freestyle') {
        setShowFreestyleModal(true);
        return;
    }

    // Start Booking Animation
    setIsBooking(true);
  };

  const confirmFreestyle = () => {
    playClick();
    const totalMinutes = (customHours * 60) + customMinutes;
    if (totalMinutes <= 0) {
        alert("Please set a duration greater than 0.");
        return;
    }

    // Pick a random HIDDEN destination for the "Surprise" (not from the main list)
    // Filter out the one we just visited if applicable to avoid repeats
    let availableDestinations = HIDDEN_DESTINATIONS;
    if (selectedDestination && selectedDestination.id.startsWith('freestyle-')) {
        availableDestinations = HIDDEN_DESTINATIONS.filter(d => `freestyle-${d.id}` !== selectedDestination.id);
        // Fallback if list is empty (unlikely given length)
        if (availableDestinations.length === 0) availableDestinations = HIDDEN_DESTINATIONS;
    }
    
    const randomDest = availableDestinations[Math.floor(Math.random() * availableDestinations.length)];
    
    // Create a destination object that looks like the random one but has custom time
    const surpriseDestination: Destination = {
        ...randomDest,
        durationMinutes: totalMinutes,
        // We keep the real name so the passport shows where you are actually going
        name: randomDest.name, 
        id: `freestyle-${randomDest.id}`
    };

    setSelectedDestination(surpriseDestination);
    setInitialDuration(totalMinutes * 60);
    setTimeLeft(totalMinutes * 60);
    setShowFreestyleModal(false);
    
    // Start booking with the new surprise destination
    setIsBooking(true);
  };

  const handleAddCustomLabel = () => {
     playClick();
     if (newLabelName.trim()) {
        const newLabel: MissionLabel = {
           id: `custom-${Date.now()}`,
           name: newLabelName.trim(),
           color: newLabelColor,
           icon: newLabelIcon,
           isCustom: true
        };
        setAvailableLabels([...availableLabels, newLabel]);
        setActiveLabel(newLabel);
        
        // Reset
        setNewLabelName("");
        setNewLabelColor("indigo");
        setNewLabelIcon("tag");
        setIsCreatingLabel(false);
     }
  };

  const handleDeleteLabel = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    playClick();
    if (window.confirm("Delete this label?")) {
      setAvailableLabels(prev => prev.filter(l => l.id !== id));
      if (activeLabel?.id === id) {
        setActiveLabel(null);
        setActiveSubLabel(null);
      }
    }
  };

  const onTicketAnimationComplete = async (seat: string) => {
    setIsBooking(false);
    setSelectedSeat(seat);
    
    setLoadingStation(true);
    setTimerState(TimerState.RUNNING); 
    setConfirmAbandon(false);
    
    playSfx(AUDIO_URLS.DEPARTURE);
    
    if (preloadedStation) {
      setCurrentStation(preloadedStation);
      setLoadingStation(false);
    } else {
       try {
         const result = await getDestinationRealtimeData(selectedDestination.name, taskDetail);
         if (result && result.station) {
            setCurrentStation(result.station);
            setWeather(prev => ({ ...prev, temp: result.weather.temp, condition: result.weather.condition }));
            setLocalTime(result.localTime);
         }
       } catch(e) {
         console.error("Fallback station fetch failed", e);
         setCurrentStation({
           name: `${selectedDestination.name} Central`,
           description: "You have arrived at your destination.",
           environment: "city"
         });
       } finally {
         setLoadingStation(false);
       }
    }
  };

  const pauseSession = () => {
    playClick();
    setTimerState(TimerState.PAUSED);
  };

  const abandonSession = () => {
    playClick();
    if (!confirmAbandon) {
      setConfirmAbandon(true);
      setTimeout(() => setConfirmAbandon(false), 3000);
      return;
    }
    setTimerState(TimerState.IDLE);
    setTimeLeft(initialDuration);
    setCurrentStation(null);
    setConfirmAbandon(false);
  };

  const finishEarly = () => {
    playClick();
    completeSession(true);
  };

  const completeSession = (early: boolean = false) => {
    setTimerState(TimerState.COMPLETED);
    if (timerRef.current) clearInterval(timerRef.current);
    
    playSfx(AUDIO_URLS.ARRIVAL);
    
    const timeSpentSeconds = initialDuration - timeLeft;
    const timeSpentMinutes = Math.floor(timeSpentSeconds / 60);

    const newSession: FocusSession = {
      id: Date.now().toString(),
      task: taskDetail,
      label: activeLabel || undefined,
      subLabel: activeSubLabel || undefined,
      durationMinutes: initialDuration / 60,
      actualDurationMinutes: early ? timeSpentMinutes : (initialDuration / 60),
      startTime: Date.now(),
      completed: true,
      station: currentStation || undefined,
      destination: selectedDestination,
      seat: selectedSeat
    };
    
    setSessions(prev => [newSession, ...prev]);
  };

  const resetTimer = () => {
    playClick();
    setTimerState(TimerState.IDLE);
    setTimeLeft(initialDuration);
    setCurrentStation(null);
    setTaskDetail("");
    setSelectedSeat("");
    setConfirmAbandon(false);
  };

  const handleSelectDestination = (dest: Destination) => {
    playClick();
    if (timerState === TimerState.IDLE) {
      setSelectedDestination(dest);
      if (dest.id !== 'freestyle') {
        setInitialDuration(dest.durationMinutes * 60);
        setTimeLeft(dest.durationMinutes * 60);
      }
    }
  };

  const toggleMusic = () => {
      playClick();
      setIsMusicOn(!isMusicOn);
  };

  const nextTrack = () => {
      playClick();
      setCurrentTrackIndex((prev) => (prev + 1) % MUSIC_TRACKS.length);
  };

  const prevTrack = () => {
      playClick();
      setCurrentTrackIndex((prev) => (prev - 1 + MUSIC_TRACKS.length) % MUSIC_TRACKS.length);
  };

  // Helper for rendering label icon
  const LabelIcon = ({ name, className }: { name?: string, className?: string }) => {
    const IconComponent = name && ICON_MAP[name] ? ICON_MAP[name] : Tag;
    return <IconComponent className={className} />;
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center md:py-10 md:px-4 font-inter p-0">
      
      {/* Label Creation Modal */}
      {isCreatingLabel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl w-full max-w-sm shadow-2xl animate-fade-in">
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">New Mission Label</h3>
                <button onClick={() => { playClick(); setIsCreatingLabel(false); }}><X className="w-5 h-5 text-slate-400 hover:text-white" /></button>
             </div>
             {/* ... form content same as before ... */}
             <div className="space-y-6">
                <div>
                   <label className="block text-xs uppercase text-slate-500 font-bold mb-2">Label Name</label>
                   <input 
                      autoFocus
                      type="text" 
                      value={newLabelName}
                      onChange={(e) => setNewLabelName(e.target.value)}
                      placeholder="e.g., Fitness, Gaming"
                      className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition-colors"
                      onKeyDown={(e) => e.key === 'Enter' && handleAddCustomLabel()}
                   />
                </div>
                <div>
                   <label className="block text-xs uppercase text-slate-500 font-bold mb-2">Theme Color</label>
                   <div className="flex flex-wrap gap-2">
                      {AVAILABLE_COLORS.map(color => (
                        <button
                          key={color}
                          onClick={() => { playClick(); setNewLabelColor(color); }}
                          className={`w-8 h-8 rounded-full border-2 transition-all ${newLabelColor === color ? `bg-${color}-500 border-white scale-110 shadow-lg` : `bg-${color}-800 border-transparent opacity-60 hover:opacity-100`}`}
                        />
                      ))}
                   </div>
                </div>
                <div>
                   <label className="block text-xs uppercase text-slate-500 font-bold mb-2">Icon</label>
                   <div className="grid grid-cols-6 gap-2">
                      {Object.keys(ICON_MAP).map(key => {
                        const IconComp = ICON_MAP[key];
                        return (
                          <button
                             key={key}
                             onClick={() => { playClick(); setNewLabelIcon(key); }}
                             className={`p-2 rounded-lg flex items-center justify-center transition-all ${newLabelIcon === key ? 'bg-slate-600 text-white ring-2 ring-amber-500' : 'bg-slate-700 text-slate-400 hover:bg-slate-600 hover:text-slate-200'}`}
                          >
                             <IconComp className="w-5 h-5" />
                          </button>
                        );
                      })}
                   </div>
                </div>
                <button 
                  onClick={handleAddCustomLabel}
                  disabled={!newLabelName.trim()}
                  className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl font-bold text-white shadow-lg hover:shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
                >
                  Create Label
                </button>
             </div>
          </div>
        </div>
      )}

      {/* Freestyle Duration Modal */}
      {showFreestyleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl w-full max-w-sm shadow-2xl animate-fade-in text-center">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2"><Hourglass className="w-5 h-5 text-amber-500" /> Set Journey Time</h3>
                    <button onClick={() => { playClick(); setShowFreestyleModal(false); }}><X className="w-5 h-5 text-slate-400 hover:text-white" /></button>
                </div>
                
                <div className="flex justify-center items-center gap-4 mb-8">
                    <div className="flex flex-col">
                        <input 
                           type="number" 
                           min="0" max="23"
                           value={customHours}
                           onChange={(e) => setCustomHours(parseInt(e.target.value) || 0)}
                           className="w-20 h-20 text-4xl text-center bg-slate-900 border border-slate-600 rounded-xl text-white focus:border-amber-500 focus:outline-none"
                        />
                        <span className="text-xs uppercase mt-2 text-slate-500 font-bold">Hours</span>
                    </div>
                    <span className="text-4xl text-slate-600 mb-6">:</span>
                    <div className="flex flex-col">
                        <input 
                           type="number" 
                           min="0" max="59"
                           value={customMinutes}
                           onChange={(e) => setCustomMinutes(parseInt(e.target.value) || 0)}
                           className="w-20 h-20 text-4xl text-center bg-slate-900 border border-slate-600 rounded-xl text-white focus:border-amber-500 focus:outline-none"
                        />
                        <span className="text-xs uppercase mt-2 text-slate-500 font-bold">Minutes</span>
                    </div>
                </div>

                <button 
                  onClick={confirmFreestyle}
                  className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl font-bold text-white shadow-lg hover:shadow-orange-500/20 transition-all active:scale-95"
                >
                  Start Surprise Journey
                </button>
            </div>
        </div>
      )}

      {/* Ticket Overlay */}
      {isBooking && (
        <TicketModal 
          destination={selectedDestination} 
          task={`${activeLabel?.name} ${activeSubLabel ? `(${activeSubLabel})` : ''}: ${taskDetail}`} 
          onAnimationComplete={onTicketAnimationComplete} 
        />
      )}

      {/* Header */}
      <header className={`text-center ${timerState === TimerState.RUNNING ? 'hidden md:block mb-4 md:mb-8 mt-4' : 'mb-6 md:mb-8 mt-6'}`}>
        <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500 font-mono tracking-tighter drop-shadow-sm">
          FocusExpress
        </h1>
        <p className="text-slate-400 text-xs md:text-sm mt-1 font-medium">Departing for Deep Work</p>
      </header>

      {/* Main Container */}
      <main className="w-full max-w-5xl bg-slate-800 md:rounded-3xl border-none md:border border-slate-700 shadow-none md:shadow-2xl relative overflow-hidden flex flex-col flex-grow md:flex-grow-0 p-4 md:p-6 min-h-screen md:min-h-0">
        
        {/* Train Visualization */}
        <div className="mb-6 md:mb-8 relative group">
            
            {/* Audio Toggle Widget (Top Left) */}
            <div className="absolute top-4 left-4 z-40 flex flex-col gap-2 animate-fade-in">
                <div className={`flex items-center backdrop-blur-md rounded-xl border shadow-lg transition-all overflow-hidden ${isMusicOn ? 'bg-indigo-900/80 border-indigo-400' : 'bg-black/40 border-white/10'}`}>
                    <button 
                      onClick={toggleMusic}
                      className={`p-2 md:px-3 md:py-2 flex items-center gap-2 hover:bg-white/10 ${isMusicOn ? 'text-white' : 'text-slate-400'}`}
                    >
                       {isMusicOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                    </button>
                    
                    {/* Track Controls (Only visible when expanded or music on) */}
                    <div className="flex items-center border-l border-white/10">
                        <button onClick={prevTrack} className="p-2 hover:bg-white/10 text-slate-300 hover:text-white"><SkipBack className="w-3 h-3" /></button>
                        <div className="px-2 text-[10px] font-mono w-24 text-center truncate text-slate-200 select-none">
                            {MUSIC_TRACKS[currentTrackIndex].name}
                        </div>
                        <button onClick={nextTrack} className="p-2 hover:bg-white/10 text-slate-300 hover:text-white"><SkipForward className="w-3 h-3" /></button>
                    </div>
                </div>
            </div>

            {/* Weather & Time Widget (Top Right) */}
            <div className="absolute top-4 right-4 z-40 flex flex-col items-end animate-fade-in gap-2">
                {/* Same weather widget code */}
                <div className="flex items-center gap-3 backdrop-blur-md bg-black/40 p-2 pr-4 rounded-full border border-white/10 shadow-lg">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-slate-700 to-slate-900 shadow-inner border border-slate-600 ${weather.environment === 'clear' ? 'text-yellow-400' : 'text-blue-200'}`}>
                      <weather.Icon className="w-6 h-6 animate-pulse-slow" />
                    </div>
                    <div className="flex flex-col items-end">
                       <div className="flex items-center gap-1">
                          <Thermometer className="w-3 h-3 text-slate-400" />
                          <span className="text-xl font-bold text-white font-mono leading-none">{weather.temp}°C</span>
                       </div>
                       <span className="text-[10px] text-slate-300 uppercase font-bold tracking-wider">{weather.condition}</span>
                    </div>
                </div>
                
                <div className="flex items-center gap-2 backdrop-blur-md bg-black/20 px-3 py-1 rounded-full border border-white/5">
                   <Clock className="w-3 h-3 text-slate-400" />
                   <span className="text-xs font-mono text-slate-200">{localTime}</span>
                </div>
            </div>

            <TrainAnimation 
              state={timerState} 
              destinationId={selectedDestination.id}
              imageUrl={selectedDestination.imageUrl}
              environment={weather.environment}
              themeColor={activeLabel?.color || 'red'}
            />
            
            {/* Motivational Tip Bar */}
            {timerState === TimerState.RUNNING && (
              <div className="mt-4 bg-slate-900/50 rounded-lg p-3 text-center border border-slate-700 animate-fade-in flex items-center justify-center gap-2">
                 <Sparkles className="w-4 h-4 text-amber-400" />
                 <p className="text-xs md:text-sm text-slate-300 italic font-medium">"{currentTip}"</p>
              </div>
            )}

            {/* Progress Bar (Track) */}
            <div className="mt-4 relative h-2 md:h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-700">
                <div 
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-amber-500 to-red-500 transition-all duration-1000 ease-linear shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                  style={{ width: `${progress}%` }}
                ></div>
            </div>
            <div className="flex justify-between text-[10px] md:text-xs text-slate-500 mt-2 font-mono font-bold">
                <span>DEPARTURE</span>
                <span className={selectedDestination.themeColor}>{selectedDestination.name.toUpperCase()} ({selectedDestination.id === 'freestyle' ? 'SURPRISE' : `${selectedDestination.distanceKm} km`})</span>
            </div>
        </div>

        {/* Station Info / Loading State */}
        <div className="min-h-[40px] md:min-h-[60px] mb-6 text-center flex flex-col items-center justify-center px-2">
            {loadingStation ? (
               <div className="flex items-center space-x-2 text-amber-400 animate-pulse">
                 <Ticket className="w-5 h-5" />
                 <span className="font-mono text-sm">Conductor is announcing arrival details...</span>
               </div>
            ) : currentStation ? (
              <div className="animate-fade-in flex flex-col items-center">
                  <h2 className="text-xl md:text-2xl font-bold text-white mb-1">{currentStation.name}</h2>
                  <p className="text-slate-400 text-xs md:text-sm italic">"{currentStation.description}"</p>
                  
                  {/* Grounding Source Attribution */}
                  {groundingChunks.length > 0 && (
                     <div className="flex flex-wrap justify-center gap-2 mt-2 opacity-60 hover:opacity-100 transition-opacity">
                        {groundingChunks.map((chunk, i) => (
                           <a 
                             key={i} 
                             href={chunk.web?.uri || chunk.maps?.uri} 
                             target="_blank" 
                             rel="noopener noreferrer"
                             className="text-[10px] text-slate-500 hover:text-blue-400 flex items-center gap-1 bg-slate-800/50 px-2 py-0.5 rounded-full border border-slate-700"
                           >
                             {chunk.maps ? <MapPin className="w-3 h-3" /> : <ExternalLink className="w-3 h-3" />}
                             Source: {chunk.web?.title || chunk.maps?.placeName || "Google Maps"}
                           </a>
                        ))}
                     </div>
                  )}
              </div>
            ) : (
               <div className="text-slate-500 flex items-center space-x-2 text-sm">
                 <AlertCircle className="w-4 h-4" />
                 <span>Select destination and identify your mission</span>
               </div>
            )}
        </div>

        {/* Controls & Selection */}
        <div className="flex flex-col items-center flex-grow justify-start">
            
            {/* Timer Display */}
            <div className={`text-6xl md:text-7xl font-mono font-bold tracking-wider mb-6 md:mb-8 transition-colors ${timerState === TimerState.RUNNING ? 'text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]' : 'text-slate-500'}`}>
                {formatTime(timeLeft)}
            </div>

            {/* Inputs & Selectors (Only visible when IDLE) */}
            {timerState === TimerState.IDLE && (
              <div className="w-full mb-8 space-y-6">
                 
                 {/* 1. Destination Grid */}
                 <div className="space-y-2">
                   <h3 className="text-slate-400 text-[10px] md:text-xs font-bold uppercase tracking-widest text-center">Select Destination</h3>
                   <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 md:gap-3 max-h-48 md:max-h-none overflow-y-auto pb-2">
                      
                      {/* Freestyle Option */}
                      <button
                        onClick={() => handleSelectDestination(FREESTYLE_DESTINATION)}
                        className={`
                          relative overflow-hidden group p-2 md:p-3 rounded-xl border transition-all duration-200 text-left
                          flex flex-col h-20 md:h-24 justify-between
                          ${selectedDestination.id === 'freestyle'
                            ? `bg-slate-700 border-white ring-1 ring-white shadow-lg` 
                            : 'bg-slate-800 border-slate-700 hover:border-slate-500 hover:bg-slate-750'
                          }
                        `}
                      >
                         <div className="absolute inset-0 opacity-20 transition-opacity group-hover:opacity-40 bg-gradient-to-br from-indigo-900 to-purple-900">
                             <Shuffle className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white w-10 h-10 opacity-30" />
                          </div>
                          <div className="relative z-10 flex justify-between items-start">
                            <span className={`font-bold text-xs md:text-sm ${selectedDestination.id === 'freestyle' ? 'text-white' : 'text-slate-200'} drop-shadow-md`}>Freestyle</span>
                          </div>
                          <div className="relative z-10 flex items-end justify-between text-xs text-slate-300">
                             <span className="text-[10px] uppercase opacity-75">Anywhere</span>
                             <span className={`font-mono font-bold bg-black/40 px-1 rounded ${selectedDestination.id === 'freestyle' ? 'text-white' : ''}`}>?</span>
                          </div>
                      </button>

                      {/* Standard Destinations */}
                      {DESTINATIONS.map((dest) => (
                        <button
                          key={dest.id}
                          onClick={() => handleSelectDestination(dest)}
                          className={`
                            relative overflow-hidden group p-2 md:p-3 rounded-xl border transition-all duration-200 text-left
                            flex flex-col h-20 md:h-24 justify-between
                            ${selectedDestination.id === dest.id 
                              ? `bg-slate-700 border-${dest.themeColor.split('-')[1]}-400 ring-1 ring-${dest.themeColor.split('-')[1]}-400 shadow-lg` 
                              : 'bg-slate-800 border-slate-700 hover:border-slate-500 hover:bg-slate-750'
                            }
                          `}
                        >
                          {/* Background Image Overlay */}
                          <div className="absolute inset-0 opacity-20 transition-opacity group-hover:opacity-40">
                             <img src={dest.imageUrl} className="w-full h-full object-cover filter grayscale mix-blend-overlay" alt={dest.name} />
                          </div>
                          
                          <div className="relative z-10 flex justify-between items-start">
                            <span className={`font-bold text-xs md:text-sm ${selectedDestination.id === dest.id ? 'text-white' : dest.themeColor} drop-shadow-md`}>{dest.name}</span>
                          </div>
                          
                          <div className="relative z-10 flex items-end justify-between text-xs text-slate-300">
                             <span className="text-[10px] uppercase opacity-75">{dest.region}</span>
                             <span className={`font-mono font-bold bg-black/40 px-1 rounded ${selectedDestination.id === dest.id ? 'text-white' : ''}`}>{formatDurationDisplay(dest.durationMinutes)}</span>
                          </div>
                        </button>
                      ))}
                   </div>
                 </div>

                 {/* 2. Mission Label Selection */}
                 <div className="space-y-3">
                    <h3 className="text-slate-400 text-[10px] md:text-xs font-bold uppercase tracking-widest text-center">Define Your Mission</h3>
                    
                    {/* Primary Labels */}
                    <div className="flex flex-wrap justify-center gap-2">
                       {availableLabels.map((label) => {
                          const isSelected = activeLabel?.id === label.id;
                          const colorClasses = getLabelColorClasses(label.color, isSelected);
                          
                          return (
                            <div 
                              key={label.id} 
                              className={`
                                 group relative flex items-center rounded-full border transition-all select-none
                                 ${colorClasses}
                                 p-0
                              `}
                            >
                               {/* 1. Selection Button (Left side) */}
                               <button
                                  type="button"
                                  onClick={() => {
                                     playClick();
                                     setActiveLabel(label);
                                     setActiveSubLabel(null);
                                  }}
                                  className="flex items-center gap-2 pl-3 py-2 h-full flex-grow rounded-l-full focus:outline-none hover:bg-black/10 transition-colors"
                               >
                                  <LabelIcon name={label.icon} className="w-4 h-4" />
                                  <span className="text-sm font-semibold">{label.name}</span>
                               </button>

                               {/* 2. Divider (Subtle) */}
                               <div className="w-px h-4 bg-current opacity-20"></div>

                               {/* 3. Delete Button (Right side) */}
                               <button 
                                  type="button"
                                  onClick={(e) => handleDeleteLabel(label.id, e)}
                                  className="pr-3 pl-2 py-2 h-full flex items-center justify-center rounded-r-full hover:bg-red-500/20 hover:text-red-200 focus:outline-none transition-colors"
                                  title="Delete Label"
                               >
                                  <X className="w-3.5 h-3.5" />
                               </button>
                            </div>
                          );
                       })}
                       
                       {/* Add Custom Label Button */}
                       <button 
                            onClick={() => { playClick(); setIsCreatingLabel(true); }}
                            className="px-4 py-2 rounded-full text-sm font-semibold border border-dashed border-slate-600 text-slate-500 hover:text-slate-300 hover:border-slate-400 hover:bg-slate-800 transition-all flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" /> Add Label
                        </button>
                    </div>

                    {/* Sub-Labels / Custom Sub-Label Input */}
                    {(activeLabel?.subLabels || activeLabel?.customSubLabelPrompt) && (
                       <div className="bg-slate-900/50 rounded-xl p-3 border border-slate-700/50 animate-fade-in">
                          <p className="text-xs text-slate-500 mb-2 text-center uppercase tracking-wider">
                            {activeLabel.customSubLabelPrompt ? activeLabel.customSubLabelPrompt : 'Select Subject'}
                          </p>
                          
                          {activeLabel.subLabels ? (
                            <div className="flex flex-wrap justify-center gap-2">
                               {activeLabel.subLabels.map(sub => (
                                  <button
                                    key={sub}
                                    onClick={() => { playClick(); setActiveSubLabel(sub); }}
                                    className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all ${activeSubLabel === sub ? 'bg-indigo-600 border-indigo-500 text-white shadow-md' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}`}
                                  >
                                     {sub}
                                  </button>
                               ))}
                            </div>
                          ) : (
                            <div className="flex justify-center">
                                <input 
                                  type="text"
                                  autoFocus
                                  placeholder={`e.g. "The Great Gatsby"`}
                                  className="w-full max-w-sm bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-sm text-center text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 transition-all placeholder-slate-500"
                                  value={activeSubLabel || ''}
                                  onChange={(e) => setActiveSubLabel(e.target.value)}
                                />
                            </div>
                          )}
                       </div>
                    )}

                    {/* Task Detail Input */}
                    <div className="max-w-md mx-auto relative w-full pt-2">
                      <input 
                        type="text" 
                        placeholder="Specific details? (e.g. Chapter 4, Ticket #123)" 
                        className="w-full bg-slate-900 border border-slate-600 rounded-xl pl-4 pr-12 py-3 md:py-4 text-center text-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all shadow-inner placeholder-slate-600 text-sm md:text-base"
                        value={taskDetail}
                        onChange={(e) => setTaskDetail(e.target.value)}
                      />
                      <Ticket className="absolute right-4 top-1/2 -translate-y-[40%] text-slate-500 w-5 h-5" />
                   </div>
                 </div>
                 
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-4 md:gap-6 mt-auto md:mt-0 mb-4 md:mb-0">
                {timerState === TimerState.IDLE && (
                  <button 
                    onClick={handleDepartClick}
                    className="group relative flex items-center justify-center w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 shadow-xl hover:scale-105 hover:shadow-orange-500/20 transition-all active:scale-95"
                  >
                    <div className="flex flex-col items-center animate-pulse">
                      <Play className="w-6 h-6 md:w-8 md:h-8 text-white ml-1 fill-white mb-1" />
                      <span className="text-[10px] font-bold text-white uppercase tracking-wider">Depart</span>
                    </div>
                  </button>
                )}

                {/* Remaining buttons same as before but playClick() added implicitly via their existing functions calling it if needed */}
                {timerState === TimerState.RUNNING && (
                   <div className="flex items-center gap-4">
                     <button 
                        onClick={finishEarly}
                        title="Arrive Early (Complete)"
                        className="flex flex-col items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-full bg-emerald-700/80 hover:bg-emerald-600 transition-all text-emerald-100 z-10"
                     >
                        <FlagTriangleRight className="w-5 h-5 md:w-6 md:h-6 fill-current" />
                        <span className="text-[8px] uppercase font-bold mt-1">Arrive</span>
                     </button>

                     <button 
                        onClick={pauseSession}
                        className="flex flex-col items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full bg-red-600 hover:bg-red-500 transition-all border-4 border-slate-900 shadow-[0_0_20px_rgba(220,38,38,0.4)] z-10"
                     >
                        <Pause className="w-6 h-6 md:w-8 md:h-8 text-white fill-white" />
                     </button>
                     
                     <button 
                        onClick={abandonSession}
                        title={confirmAbandon ? "Click to Confirm" : "Abandon Trip"}
                        className={`flex flex-col items-center justify-center w-12 h-12 rounded-full transition-all z-10 ${confirmAbandon ? 'bg-red-600 text-white scale-110' : 'bg-red-900/50 text-red-400 hover:bg-red-900 hover:text-white'}`}
                     >
                        <Square className="w-4 h-4 fill-current" />
                     </button>
                   </div>
                )}

                {timerState === TimerState.PAUSED && (
                   <div className="flex items-center gap-4">
                     <button 
                        onClick={finishEarly}
                        title="Arrive Early (Complete)"
                        className="flex flex-col items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-full bg-emerald-700/80 hover:bg-emerald-600 transition-all text-emerald-100 z-10"
                     >
                        <FlagTriangleRight className="w-5 h-5 md:w-6 md:h-6 fill-current" />
                        <span className="text-[8px] uppercase font-bold mt-1">Arrive</span>
                     </button>

                     <button 
                        onClick={() => { playClick(); setTimerState(TimerState.RUNNING); }}
                        className="flex flex-col items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full bg-amber-500 hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/20 z-10"
                     >
                        <Play className="w-6 h-6 md:w-8 md:h-8 text-slate-900 fill-slate-900 ml-1" />
                     </button>
                     
                     <button 
                        onClick={abandonSession}
                        title={confirmAbandon ? "Click to Confirm" : "Abandon Trip"}
                        className={`flex flex-col items-center justify-center w-12 h-12 rounded-full transition-all z-10 ${confirmAbandon ? 'bg-red-600 text-white scale-110' : 'bg-red-900/50 text-red-400 hover:bg-red-900 hover:text-white'}`}
                     >
                        <Square className="w-4 h-4 fill-current" />
                     </button>
                   </div>
                )}

                {timerState === TimerState.COMPLETED && (
                  <div className="flex flex-col items-center animate-bounce">
                    <button 
                      onClick={resetTimer}
                      className="flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-500/20 transition-all"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                      <span>Book Next Ticket</span>
                    </button>
                    <p className="mt-4 text-emerald-400 text-sm">You have arrived!</p>
                  </div>
                )}
            </div>

        </div>
      </main>

      {/* Statistics Section - Hidden on mobile during run if space is tight, or stacked below */}
      <div className={`${timerState === TimerState.RUNNING ? 'hidden md:block' : 'block'} w-full flex justify-center pb-8`}>
        <Stats sessions={sessions} />
      </div>
      
      {/* Session History */}
      {sessions.length > 0 && timerState === TimerState.IDLE && (
        <div className="w-full max-w-5xl mt-4 md:mt-8 px-4 pb-8">
           <h3 className="text-slate-400 uppercase text-xs font-bold tracking-widest mb-4">Travel Log</h3>
           <div className="space-y-3">
              {sessions.map((s) => (
                <div key={s.id} className="flex items-center justify-between p-3 md:p-4 bg-slate-800 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors">
                    <div className="flex items-center gap-3 md:gap-4">
                        <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center bg-slate-700 overflow-hidden border border-slate-600 flex-shrink-0`}>
                           {s.destination?.imageUrl ? (
                              <img src={s.destination.imageUrl} alt={s.destination.name} className="w-full h-full object-cover" />
                           ) : (
                              <Map className="w-5 h-5 md:w-6 md:h-6 text-slate-400" />
                           )}
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                              {/* Pill for Label */}
                              {s.label && (
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getLabelColorClasses(s.label.color, false)}`}>
                                   <LabelIcon name={s.label.icon} className="w-3 h-3 mr-1 inline-block" />
                                   {s.label.name} {s.subLabel ? `• ${s.subLabel}` : ''}
                                </span>
                              )}
                              <span className="text-[10px] md:text-xs text-slate-500 flex items-center gap-1">
                                <ArrowRight className="w-3 h-3" />
                                {Math.round(s.actualDurationMinutes || s.durationMinutes)}m
                              </span>
                            </div>
                            
                            <div className="flex flex-col gap-1">
                               <div className="flex items-center gap-2">
                                  <span className={`font-bold text-sm md:text-base ${s.destination?.themeColor || 'text-white'}`}>{s.destination?.name || s.station?.name || "Unknown"}</span>
                                  {s.seat && <span className="text-[10px] bg-slate-700 px-1.5 rounded text-slate-300 w-fit">Seat {s.seat}</span>}
                               </div>
                               {s.task && <p className="text-xs md:text-sm text-slate-400 line-clamp-1 italic">{s.task}</p>}
                            </div>
                        </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                       <div className="text-[10px] md:text-xs text-slate-500">{new Date(s.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                       <div className="text-[10px] md:text-xs text-emerald-500 flex items-center justify-end gap-1">
                         <CheckCircle2 className="w-3 h-3" />
                         <span className="hidden md:inline">Arrived</span>
                       </div>
                    </div>
                </div>
              ))}
           </div>
        </div>
      )}

    </div>
  );
};

export default App;
