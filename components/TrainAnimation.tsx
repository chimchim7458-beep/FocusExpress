import React, { useState } from 'react';
import { TimerState, Station } from '../types';

interface TrainAnimationProps {
  state: TimerState;
  destinationId: string;
  imageUrl: string;
  environment: Station['environment'];
  themeColor?: string;
}

const TrainAnimation: React.FC<TrainAnimationProps> = ({ state, destinationId, imageUrl, environment, themeColor = 'red' }) => {
  const isRunning = state === TimerState.RUNNING;
  
  // Image Loading State: 'primary' | 'backup' | 'fallback'
  const [imgSource, setImgSource] = useState<'primary' | 'backup' | 'fallback'>('primary');

  // 1. The original high-quality train (User Favorite) - naturally faces RIGHT
  const PRIMARY_URL = "https://cdn.pixabay.com/photo/2023/06/18/10/37/steam-train-8071887_1280.png";
  
  // 2. Reliable Wikimedia Backup
  const BACKUP_URL = "https://upload.wikimedia.org/wikipedia/commons/e/e5/Steam_locomotive_R_761.png";

  const handleImageError = () => {
    if (imgSource === 'primary') {
      console.warn("Primary train image failed, switching to backup.");
      setImgSource('backup');
    } else if (imgSource === 'backup') {
      console.warn("Backup train image failed, switching to SVG fallback.");
      setImgSource('fallback');
    }
  };

  // Color Mapping Configuration
  // Expanded to support all available colors in App.tsx
  const colorMap: Record<string, { hueRotate: string, primary: string, dark: string, light: string }> = {
    red:     { hueRotate: '0deg',   primary: '#ef4444', dark: '#7f1d1d', light: '#f87171' },
    orange:  { hueRotate: '30deg',  primary: '#f97316', dark: '#7c2d12', light: '#fb923c' },
    amber:   { hueRotate: '45deg',  primary: '#f59e0b', dark: '#78350f', light: '#fbbf24' },
    yellow:  { hueRotate: '60deg',  primary: '#eab308', dark: '#713f12', light: '#facc15' },
    lime:    { hueRotate: '90deg',  primary: '#84cc16', dark: '#3f6212', light: '#a3e635' },
    green:   { hueRotate: '120deg', primary: '#22c55e', dark: '#14532d', light: '#4ade80' },
    emerald: { hueRotate: '150deg', primary: '#10b981', dark: '#064e3b', light: '#34d399' },
    teal:    { hueRotate: '170deg', primary: '#14b8a6', dark: '#0f5132', light: '#5eead4' },
    cyan:    { hueRotate: '180deg', primary: '#06b6d4', dark: '#164e63', light: '#22d3ee' },
    sky:     { hueRotate: '200deg', primary: '#0ea5e9', dark: '#0c4a6e', light: '#7dd3fc' },
    blue:    { hueRotate: '220deg', primary: '#3b82f6', dark: '#1e3a8a', light: '#60a5fa' },
    indigo:  { hueRotate: '240deg', primary: '#6366f1', dark: '#312e81', light: '#818cf8' },
    violet:  { hueRotate: '260deg', primary: '#8b5cf6', dark: '#4c1d95', light: '#a78bfa' },
    purple:  { hueRotate: '280deg', primary: '#a855f7', dark: '#581c87', light: '#c084fc' },
    fuchsia: { hueRotate: '300deg', primary: '#d946ef', dark: '#701a75', light: '#e879f9' },
    pink:    { hueRotate: '330deg', primary: '#ec4899', dark: '#831843', light: '#f472b6' },
    rose:    { hueRotate: '345deg', primary: '#f43f5e', dark: '#881337', light: '#fb7185' },
    // Default fallback
    default: { hueRotate: '0deg',   primary: '#ef4444', dark: '#7f1d1d', light: '#f87171' }
  };

  const currentTheme = colorMap[themeColor] || colorMap.default;

  // Weather Rendering Logic
  const renderWeather = () => {
    switch (environment) {
      case 'snow':
        return (
          <>
             {/* Background Snow */}
             <div className="absolute inset-0 z-10 pointer-events-none opacity-60">
               {[...Array(30)].map((_, i) => (
                 <div key={`bg-snow-${i}`} 
                      className="absolute bg-white rounded-full opacity-70 animate-snow"
                      style={{
                        width: Math.random() * 3 + 1 + 'px',
                        height: Math.random() * 3 + 1 + 'px',
                        left: Math.random() * 100 + '%',
                        animationDuration: Math.random() * 3 + 2 + 's',
                        animationDelay: Math.random() * -5 + 's'
                      }}
                 />
               ))}
             </div>
             {/* Foreground Snow */}
             <div className="absolute inset-0 z-40 pointer-events-none">
               {[...Array(15)].map((_, i) => (
                 <div key={`fg-snow-${i}`} 
                      className="absolute bg-white rounded-full shadow-md animate-snow"
                      style={{
                        width: Math.random() * 4 + 3 + 'px',
                        height: Math.random() * 4 + 3 + 'px',
                        left: Math.random() * 100 + '%',
                        animationDuration: Math.random() * 2 + 1.5 + 's',
                        animationDelay: Math.random() * -5 + 's',
                        opacity: 0.9
                      }}
                 />
               ))}
             </div>
          </>
        );
      case 'city':
      case 'cyberpunk':
        return (
          <>
             {/* Rain Layers */}
             <div className={`absolute inset-0 z-40 pointer-events-none ${environment === 'cyberpunk' ? 'opacity-40 mix-blend-screen' : 'opacity-20'}`}>
                {/* Neon tint for cyberpunk */}
                {environment === 'cyberpunk' && <div className="absolute inset-0 bg-gradient-to-t from-fuchsia-900/30 to-cyan-900/30 mix-blend-overlay"></div>}
                
                {[...Array(20)].map((_, i) => (
                   <div key={`rain-${i}`} 
                        className={`absolute w-0.5 animate-rain ${environment === 'cyberpunk' ? 'bg-cyan-200 shadow-[0_0_5px_cyan]' : 'bg-slate-300'}`}
                        style={{
                          height: Math.random() * 100 + 50 + 'px',
                          left: Math.random() * 100 + '%',
                          animationDuration: '0.6s',
                          animationDelay: Math.random() * -1 + 's',
                          opacity: Math.random() * 0.5 + 0.2
                        }}
                   />
                ))}
             </div>
          </>
        );
      case 'nature':
        return (
          <div className="absolute inset-0 z-40 pointer-events-none overflow-hidden">
             {/* Fog / Mist */}
             <div className="absolute bottom-0 left-0 w-[200%] h-32 bg-gradient-to-t from-white/20 to-transparent animate-fog opacity-30"></div>
             <div className="absolute bottom-10 left-0 w-[200%] h-24 bg-gradient-to-t from-emerald-100/10 to-transparent animate-fog opacity-20" style={{ animationDuration: '15s', animationDirection: 'reverse' }}></div>
          </div>
        );
      case 'desert':
        return (
          <div className="absolute inset-0 z-40 pointer-events-none mix-blend-overlay opacity-30">
             {/* Dust Overlay */}
             <div className="absolute inset-0 bg-amber-600/20"></div>
             {/* Flying Dust Particles */}
             {[...Array(10)].map((_, i) => (
                <div key={`dust-${i}`}
                     className="absolute w-1 h-1 bg-amber-200 rounded-full animate-snow"
                     style={{
                        left: Math.random() * 100 + '%',
                        animationDuration: Math.random() * 4 + 3 + 's',
                        animationName: 'snow', // reuse falling/drifting logic but maybe slower?
                        opacity: 0.6
                     }}
                />
             ))}
          </div>
        );
      case 'clear':
        return (
          <div className="absolute inset-0 z-40 pointer-events-none">
             {/* Sun/Lens Flare effect top right */}
             <div className="absolute -top-10 -right-10 w-64 h-64 bg-yellow-100/10 rounded-full blur-3xl mix-blend-screen"></div>
             <div className="absolute top-0 right-0 w-32 h-32 bg-orange-400/20 rounded-full blur-2xl mix-blend-screen animate-pulse"></div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="relative w-full h-72 md:h-96 overflow-hidden md:rounded-xl bg-slate-900 border-y-4 md:border-4 border-slate-900 shadow-2xl group">
      
      {/* 1. BACKGROUND LAYER (Distant Scenery) */}
      <div className={`absolute inset-0 flex h-full w-[300%] ${isRunning ? 'animate-scrolling-photo blur-sm' : 'blur-0'} transition-all duration-1000 will-change-transform z-0`}>
         <img src={imageUrl} className="w-1/3 h-full object-cover brightness-50" alt="background" />
         <img src={imageUrl} className="w-1/3 h-full object-cover scale-x-[-1] brightness-50" alt="background mirrored" />
         <img src={imageUrl} className="w-1/3 h-full object-cover brightness-50" alt="background loop start" />
      </div>

      {/* Atmospheric Overlay (Night tint) - BEHIND THE TRAIN */}
      <div className="absolute inset-0 pointer-events-none mix-blend-multiply bg-indigo-950/60 z-10"></div>
      
      {/* Weather Layer */}
      {renderWeather()}
      
      {/* 2. TRACKS LAYER */}
      <div className={`absolute bottom-0 left-0 right-0 h-28 w-[200%] flex items-end z-20 ${isRunning ? 'animate-track-fast' : 'paused'}`}>
          <div className="w-full h-full bg-gradient-to-b from-transparent via-black/80 to-black"></div>
          
          {/* Rails (The metallic lines) */}
          <div className="absolute bottom-4 left-0 w-full h-2 bg-slate-400/30 border-t border-b border-slate-500/50"></div>

          {/* Moving Sleepers/Gravel */}
          {Array.from({ length: 40 }).map((_, i) => (
             <div key={i} className="absolute bottom-0 w-[5%] h-10 flex justify-center" style={{ left: `${i * 5}%` }}>
                <div className="w-full h-4 bg-stone-800 mb-1 skew-x-[60deg] blur-[0.5px] border border-stone-700 shadow-lg"></div>
             </div>
          ))}
      </div>

      {/* 3. TRAIN LAYER - Resized to be smaller (55% of original container width) */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[55%] md:w-[380px] h-32 md:h-44 z-30 flex items-end justify-center pointer-events-none transition-all duration-500">
        
        {/* Steam Output (Behind Train) - Positioned relative to the smaller train */}
        {isRunning && (
            <div className="absolute top-[10%] right-[15%] z-0 mix-blend-screen opacity-70">
               <div className="w-12 h-12 bg-white/40 blur-xl rounded-full animate-steam-1 absolute"></div>
               <div className="w-16 h-16 bg-white/30 blur-xl rounded-full animate-steam-2 absolute delay-300"></div>
               <div className="w-20 h-20 bg-white/20 blur-2xl rounded-full animate-steam-3 absolute delay-700"></div>
            </div>
        )}

        {/* Train Visualization */}
        <div className={`relative w-full h-full flex items-end justify-center z-10 ${isRunning ? 'animate-train-rumble' : ''}`}>
           
           {imgSource !== 'fallback' ? (
             <img 
              key={imgSource} // Force re-render on source change
              src={imgSource === 'primary' ? PRIMARY_URL : BACKUP_URL} 
              alt="Steam Train" 
              onError={handleImageError}
              // Applied Dynamic Color Filter
              // We replace the static tailwind filter with a dynamic inline style to support all mission colors
              className="w-full h-full object-contain drop-shadow-[0_20px_30px_rgba(0,0,0,0.8)]"
              style={{
                filter: `brightness(1.1) contrast(1.25) sepia(0.8) saturate(4) hue-rotate(${currentTheme.hueRotate})`
              }}
             />
           ) : (
             // REALISTIC DYNAMIC COLOR SVG FALLBACK - FLIPPED TO FACE RIGHT
             <svg viewBox="0 0 1000 450" className="w-full h-full drop-shadow-2xl scale-x-[-1]">
                <defs>
                    <linearGradient id="boilerGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor={currentTheme.dark} /> 
                        <stop offset="50%" stopColor={currentTheme.primary} />
                        <stop offset="100%" stopColor={currentTheme.dark} /> 
                    </linearGradient>
                    <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#fcd34d" />
                        <stop offset="100%" stopColor="#b45309" />
                    </linearGradient>
                    <filter id="glow">
                         <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
                         <feMerge>
                             <feMergeNode in="coloredBlur"/>
                             <feMergeNode in="SourceGraphic"/>
                         </feMerge>
                     </filter>
                </defs>

                {/* --- WHEELS (Animated) --- */}
                <g transform="translate(0,20)">
                    {/* Rear Bogie Wheel */}
                    <g className={isRunning ? "animate-wheel-spin" : ""}>
                        <circle cx="850" cy="350" r="35" fill="#1e293b" stroke="#334155" strokeWidth="4" />
                        <circle cx="850" cy="350" r="15" fill="#0f172a" />
                        <path d="M850 350 L850 315" stroke="#334155" strokeWidth="3" />
                        <path d="M850 350 L885 350" stroke="#334155" strokeWidth="3" />
                        <path d="M850 350 L850 385" stroke="#334155" strokeWidth="3" />
                        <path d="M850 350 L815 350" stroke="#334155" strokeWidth="3" />
                    </g>
                    
                    {/* Driving Wheels (Big) */}
                    {[350, 520, 690].map(cx => (
                        <g key={cx} className={isRunning ? "animate-wheel-spin" : ""}>
                            <circle cx={cx} cy="330" r="80" fill="#0f172a" stroke="#475569" strokeWidth="6" />
                            <circle cx={cx} cy="330" r="65" fill="none" stroke="#1e293b" strokeWidth="2" strokeDasharray="5,5" />
                            <path d={`M${cx} 330 L${cx} 250`} stroke="#334155" strokeWidth="6" />
                            <path d={`M${cx} 330 L${cx+60} 295`} stroke="#334155" strokeWidth="6" />
                            <path d={`M${cx} 330 L${cx+60} 365`} stroke="#334155" strokeWidth="6" />
                            <path d={`M${cx} 330 L${cx} 410`} stroke="#334155" strokeWidth="6" />
                            <path d={`M${cx} 330 L${cx-60} 365`} stroke="#334155" strokeWidth="6" />
                            <path d={`M${cx} 330 L${cx-60} 295`} stroke="#334155" strokeWidth="6" />
                            <circle cx={cx} cy="330" r="22" fill="#64748b" />
                        </g>
                    ))}

                    {/* Front Bogie Wheels */}
                    <g className={isRunning ? "animate-wheel-spin" : ""}>
                        <circle cx="150" cy="360" r="30" fill="#1e293b" stroke="#334155" strokeWidth="4" />
                        <path d="M150 360 L150 330" stroke="#334155" strokeWidth="3" />
                        <path d="M150 360 L180 360" stroke="#334155" strokeWidth="3" />
                        <path d="M150 360 L150 390" stroke="#334155" strokeWidth="3" />
                        <path d="M150 360 L120 360" stroke="#334155" strokeWidth="3" />
                    </g>
                    <g className={isRunning ? "animate-wheel-spin" : ""}>
                        <circle cx="230" cy="360" r="30" fill="#1e293b" stroke="#334155" strokeWidth="4" />
                        <path d="M230 360 L230 330" stroke="#334155" strokeWidth="3" />
                        <path d="M230 360 L260 360" stroke="#334155" strokeWidth="3" />
                        <path d="M230 360 L230 390" stroke="#334155" strokeWidth="3" />
                        <path d="M230 360 L200 360" stroke="#334155" strokeWidth="3" />
                    </g>

                    {/* Connecting Rod (Animated) */}
                    <g className={isRunning ? "animate-rod-move" : ""}>
                        <path d="M350 360 L690 360" stroke="#cbd5e1" strokeWidth="12" strokeLinecap="round" filter="drop-shadow(0 4px 4px rgba(0,0,0,0.5))" />
                        <circle cx="350" cy="360" r="10" fill="#94a3b8" />
                        <circle cx="520" cy="360" r="10" fill="#94a3b8" />
                        <circle cx="690" cy="360" r="10" fill="#94a3b8" />
                    </g>
                </g>

                {/* --- BODY (Dynamic Theme) --- */}
                <g transform="translate(0,20)">
                    {/* Cow Catcher */}
                    <path d="M40 380 L120 380 L120 300 L90 280 Z" fill={currentTheme.dark} stroke="#450a0a" strokeWidth="2" />
                    <path d="M50 380 L90 280" stroke={currentTheme.primary} strokeWidth="2" />
                    <path d="M70 380 L100 280" stroke={currentTheme.primary} strokeWidth="2" />
                    <path d="M90 380 L110 280" stroke={currentTheme.primary} strokeWidth="2" />

                    {/* Cylinder */}
                    <rect x="220" y="300" width="100" height="60" rx="5" fill="#450a0a" stroke={currentTheme.dark} strokeWidth="2" />
                    
                    {/* Boiler Main (Gradient) */}
                    <rect x="120" y="140" width="550" height="160" rx="10" fill="url(#boilerGradient)" />
                    
                    {/* Boiler Bands (Details) */}
                    <rect x="250" y="140" width="12" height="160" fill="#450a0a" opacity="0.6" />
                    <rect x="400" y="140" width="12" height="160" fill="#450a0a" opacity="0.6" />
                    <rect x="550" y="140" width="12" height="160" fill="#450a0a" opacity="0.6" />

                    {/* Smokestack */}
                    <path d="M180 140 L180 80 L160 60 L240 60 L220 80 L220 140 Z" fill="#450a0a" />
                    <ellipse cx="200" cy="60" rx="40" ry="10" fill="#2d0505" />
                    
                    {/* Domes */}
                    <path d="M320 140 L320 100 A 30 30 0 0 1 380 100 L380 140 Z" fill={currentTheme.dark} />
                    <path d="M480 140 L480 90 A 35 35 0 0 1 550 90 L550 140 Z" fill={currentTheme.dark} />

                    {/* Cab (Theme) */}
                    <path d="M650 300 L950 300 L950 100 L650 100 Z" fill={currentTheme.dark} stroke="#450a0a" strokeWidth="4" />
                    {/* Cab Roof */}
                    <path d="M630 100 L970 100 L960 90 L640 90 Z" fill="#450a0a" />
                    <rect x="640" y="90" width="320" height="15" fill="#2d0505" />
                    
                    {/* Cab Window */}
                    <rect x="700" y="140" width="120" height="80" rx="5" fill="#475569" stroke="#334155" strokeWidth="4" />
                    <path d="M705 145 L750 145 L720 215 L705 215 Z" fill="white" opacity="0.1" />
                    <rect x="700" y="140" width="120" height="80" rx="5" fill="#facc15" opacity="0.1" />
                    
                    {/* Cab Window Frame/Armrest */}
                    <rect x="690" y="230" width="140" height="12" fill="#334155" />
                    
                    {/* Cab Door Outline */}
                    <rect x="850" y="140" width="60" height="160" rx="2" fill="none" stroke="#450a0a" strokeWidth="2" />
                    <circle cx="860" cy="220" r="3" fill="#f59e0b" />

                    {/* Front Light */}
                    <rect x="110" y="180" width="20" height="40" fill="#334155" />
                    <circle cx="100" cy="200" r="18" fill="#fbbf24" filter="url(#glow)" />
                    
                    {/* Running Board (Gold Accent) */}
                    <rect x="120" y="210" width="550" height="8" fill="url(#goldGradient)" />
                    
                    {/* Steam Pipes/Whistle */}
                    <rect x="510" y="70" width="10" height="20" fill="#f59e0b" />
                    <circle cx="515" cy="70" r="4" fill="#f59e0b" />
                </g>
             </svg>
           )}
           
           {/* Wheels blur (subtle) - Only for image mode */}
           {isRunning && imgSource !== 'fallback' && (
             <div className="absolute bottom-3 left-[15%] right-[25%] h-14 bg-black/30 blur-md z-20"></div>
           )}
        </div>
      </div>

      {/* 4. FOREGROUND SPEED LAYER (Passing objects) - Very transparent */}
      {isRunning && (
        <div className="absolute inset-0 z-40 pointer-events-none overflow-hidden opacity-30">
           <div className="absolute bottom-0 w-[200%] h-full animate-foreground-pass flex items-end">
              <div className="w-32 h-[150%] bg-black blur-2xl skew-x-[-20deg] ml-[80%]"></div>
           </div>
        </div>
      )}

      <style>{`
        @keyframes scroll-photo {
          0% { transform: translateX(0); }
          100% { transform: translateX(-66.666%); } 
        }
        @keyframes scroll-bg {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes foreground-pass {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        @keyframes steam-rise-1 {
          0% { transform: translateY(0) scale(1) translateX(0); opacity: 0.6; }
          100% { transform: translateY(-90px) scale(3) translateX(-120px); opacity: 0; }
        }
        @keyframes steam-rise-2 {
          0% { transform: translateY(0) scale(1) translateX(0); opacity: 0.5; }
          100% { transform: translateY(-80px) scale(2.5) translateX(-100px); opacity: 0; }
        }
        @keyframes steam-rise-3 {
          0% { transform: translateY(0) scale(1) translateX(0); opacity: 0.4; }
          100% { transform: translateY(-70px) scale(2) translateX(-80px); opacity: 0; }
        }
        @keyframes train-rumble {
            0% { transform: translateY(0) rotate(0deg); }
            25% { transform: translateY(-1.5px) rotate(-0.2deg); }
            50% { transform: translateY(0.5px) rotate(0deg); }
            75% { transform: translateY(-1px) rotate(0.2deg); }
            100% { transform: translateY(0) rotate(0deg); }
        }
        @keyframes wheel-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(-360deg); } /* Counter-clockwise logic = Clockwise visual when flipped */
        }
        @keyframes rod-cycle {
          0% { transform: translate(0px, 0px); }
          25% { transform: translate(30px, -30px); }
          50% { transform: translate(0px, -60px); }
          75% { transform: translate(-30px, -30px); }
          100% { transform: translate(0px, 0px); }
        }
        @keyframes snow {
          0% { transform: translateY(-10px) translateX(0); }
          50% { transform: translateY(50vh) translateX(10px); }
          100% { transform: translateY(100vh) translateX(-10px); }
        }
        @keyframes rain {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(120vh); }
        }
        @keyframes fog {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        .animate-scrolling-photo {
          animation: scroll-photo 30s linear infinite;
        }
        .animate-track-fast {
          animation: scroll-bg 0.15s linear infinite;
        }
        .animate-foreground-pass {
          animation: foreground-pass 2.5s linear infinite;
        }
        .animate-steam-1 {
          animation: steam-rise-1 1.5s ease-out infinite;
        }
        .animate-steam-2 {
          animation: steam-rise-2 1.8s ease-out infinite;
        }
        .animate-steam-3 {
          animation: steam-rise-3 2.2s ease-out infinite;
        }
        .animate-train-rumble {
           animation: train-rumble 0.2s linear infinite;
        }
        .animate-wheel-spin {
           animation: wheel-spin 0.5s linear infinite;
           transform-box: fill-box;
           transform-origin: center;
        }
        .animate-rod-move {
           animation: rod-cycle 0.5s linear infinite;
        }
        .animate-snow {
           animation: snow 3s linear infinite;
        }
        .animate-rain {
           animation: rain 0.6s linear infinite;
        }
        .animate-fog {
           animation: fog 20s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default TrainAnimation;