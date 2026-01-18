
import React, { useEffect, useState } from 'react';
import { Destination } from '../types';
import { QrCode, TrainFront, Armchair, Globe, User, Fingerprint, Star } from 'lucide-react';

interface TicketModalProps {
  destination: Destination;
  task: string;
  onAnimationComplete: (seatNumber: string) => void;
}

const TicketModal: React.FC<TicketModalProps> = ({ destination, task, onAnimationComplete }) => {
  const [stage, setStage] = useState<'seat-selection' | 'passport' | 'printing' | 'visible' | 'tearing' | 'complete'>('seat-selection');
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null);

  // Audio refs
  const stampSound = "https://assets.mixkit.co/active_storage/sfx/1202/1202-preview.mp3"; // Heavy stamp sound
  const tearSound = "https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3"; // Paper tear sound
  const clickSound = "https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3"; 

  const playSound = (url: string, vol: number = 0.5) => {
    try {
      const audio = new Audio(url);
      audio.volume = vol;
      audio.play().catch(e => console.warn("Audio play blocked", e));
    } catch (e) {
      console.warn("Audio error", e);
    }
  };

  // Seat Configuration
  const rows = [1, 2, 3];
  
  const handleSeatClick = (seatId: string) => {
    playSound(clickSound, 0.4);
    setSelectedSeat(seatId);
    // Short delay before moving to passport stage
    setTimeout(() => setStage('passport'), 500);
  };

  useEffect(() => {
    let timer: number;

    switch (stage) {
      case 'passport':
        // Wait for passport to "open", then stamp
        timer = window.setTimeout(() => {
             playSound(stampSound, 0.7);
             // After stamp, move to printing ticket
             setTimeout(() => setStage('printing'), 2000);
        }, 1000);
        break;
      case 'printing':
        // Move to visible shortly after printing starts
        timer = window.setTimeout(() => setStage('visible'), 100);
        break;
      case 'visible':
        // Stay visible for 2.5s, then tear
        timer = window.setTimeout(() => setStage('tearing'), 2500);
        break;
      case 'tearing':
        // Play tear sound
        playSound(tearSound);
        
        // Allow tear animation to play (1s transition in CSS), then complete
        timer = window.setTimeout(() => setStage('complete'), 1000);
        break;
      case 'complete':
        // Brief pause before closing modal
        timer = window.setTimeout(() => onAnimationComplete(selectedSeat || '1A'), 200);
        break;
      default:
        break;
    }

    return () => window.clearTimeout(timer);
  }, [stage, onAnimationComplete, selectedSeat]);

  if (stage === 'complete') return null;

  // Determine Stamp Color based on region/id
  const getStampColor = () => {
      const reg = destination.region.toLowerCase();
      if (reg.includes('japan') || reg.includes('asia')) return '#b91c1c'; // Red
      if (reg.includes('europe')) return '#1d4ed8'; // Blue
      if (reg.includes('usa') || reg.includes('america')) return '#15803d'; // Green
      if (reg.includes('africa')) return '#b45309'; // Amber
      return '#334155'; // Slate
  }

  const stampHex = getStampColor();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 perspective-1000">
      
      {/* Seat Selection Stage */}
      {stage === 'seat-selection' && (
        <div className="bg-slate-800 p-6 rounded-2xl shadow-2xl max-w-md w-full border border-slate-700 animate-fade-in">
          <h2 className="text-xl font-bold text-white mb-2 text-center">Select Your Seat</h2>
          <p className="text-slate-400 text-sm text-center mb-6">Choose a window seat for the best view of {destination.name}</p>
          
          <div className="flex justify-center gap-8 mb-8">
            {/* Left Side */}
            <div className="grid grid-cols-2 gap-2">
               {rows.map(row => (
                 <React.Fragment key={`left-${row}`}>
                   {['A', 'B'].map(col => {
                     const id = `${row}${col}`;
                     return (
                       <button
                         key={id}
                         onClick={() => handleSeatClick(id)}
                         className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${selectedSeat === id ? 'bg-amber-500 text-white' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}`}
                       >
                         <Armchair className="w-5 h-5" />
                       </button>
                     );
                   })}
                 </React.Fragment>
               ))}
            </div>
            
            {/* Aisle */}
            <div className="w-4 flex items-center justify-center">
               <div className="h-full w-0.5 bg-slate-700/50 dashed"></div>
            </div>

            {/* Right Side */}
            <div className="grid grid-cols-2 gap-2">
               {rows.map(row => (
                 <React.Fragment key={`right-${row}`}>
                   {['C', 'D'].map(col => {
                     const id = `${row}${col}`;
                     return (
                       <button
                         key={id}
                         onClick={() => handleSeatClick(id)}
                         className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${selectedSeat === id ? 'bg-amber-500 text-white' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}`}
                       >
                         <Armchair className="w-5 h-5" />
                       </button>
                     );
                   })}
                 </React.Fragment>
               ))}
            </div>
          </div>
          
          <div className="text-center text-xs text-slate-500 uppercase tracking-widest">
             Front of Train
          </div>
        </div>
      )}

      {/* Passport Stage */}
      {stage === 'passport' && (
         <div className="relative w-[600px] h-[380px] bg-[#3e2723] rounded-r-xl rounded-l-md shadow-2xl flex overflow-hidden border-2 border-[#5d4037] animate-passport-open">
             {/* Left Page (ID) */}
             <div className="w-1/2 bg-[#fffdf5] relative flex flex-col p-0 overflow-hidden border-r border-[#e0e0e0]">
                 {/* Guilloche Pattern Background */}
                 <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                 <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-pink-50/50"></div>
                 
                 {/* Header */}
                 <div className="relative pt-6 px-6 pb-2 text-center border-b-2 border-slate-200">
                     <div className="flex justify-center items-center gap-2 text-[#3e2723] mb-1">
                         <Globe className="w-4 h-4" />
                         <span className="text-[10px] font-bold tracking-widest uppercase">Official Document</span>
                     </div>
                     <h3 className="font-serif font-black text-[#1a237e] text-lg tracking-wide uppercase">Focus Passport</h3>
                 </div>

                 <div className="relative p-6 flex gap-4">
                     {/* Holographic Strip overlay (vertical) */}
                     <div className="absolute left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-cyan-400/30 to-transparent"></div>

                     {/* Photo Area */}
                     <div className="w-24 h-32 bg-slate-200 rounded border border-slate-300 flex flex-col overflow-hidden relative shadow-inner group">
                         {/* User Avatar */}
                         <div className="absolute inset-0 bg-gradient-to-br from-slate-300 to-slate-400">
                             <User className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-20 h-20 text-slate-500" />
                         </div>
                         {/* Holographic Overlay on Photo */}
                         <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent opacity-50"></div>
                         <div className="absolute bottom-1 right-1">
                             <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 drop-shadow-md" />
                         </div>
                     </div>
                     
                     {/* Details */}
                     <div className="flex-1 space-y-3 font-mono text-[10px] text-[#3e2723] relative z-10">
                         <div>
                             <span className="block text-[6px] uppercase text-slate-500 tracking-wider">Surname / Nom</span>
                             <span className="font-bold text-sm text-[#0d47a1]">TRAVELER</span>
                         </div>
                         <div>
                             <span className="block text-[6px] uppercase text-slate-500 tracking-wider">Given Names / Prénoms</span>
                             <span className="font-bold text-[#0d47a1]">DEEP FOCUS</span>
                         </div>
                         <div>
                             <span className="block text-[6px] uppercase text-slate-500 tracking-wider">Nationality / Nationalité</span>
                             <span className="font-semibold">GLOBAL CITIZEN</span>
                         </div>
                         <div className="flex gap-4">
                            <div>
                                <span className="block text-[6px] uppercase text-slate-500 tracking-wider">Date of Issue</span>
                                <span>{new Date().toLocaleDateString()}</span>
                            </div>
                            <div>
                                <span className="block text-[6px] uppercase text-slate-500 tracking-wider">Sex</span>
                                <span>X</span>
                            </div>
                         </div>
                     </div>
                 </div>

                 {/* Machine Readable Zone */}
                 <div className="mt-auto bg-white p-4 pt-2 border-t border-slate-200">
                     <div className="font-mono text-[10px] tracking-[2px] text-slate-800 leading-relaxed uppercase">
                         P{"<"}UTOPIA{"<<"}TRAVELER{"<<<<<<<<<<<<<<<<<"}<br/>
                         A1234567894USA8801018M2401015{"<<<<<<<<<<<<<<06"}
                     </div>
                 </div>
             </div>

             {/* Right Page (Visa/Stamp) */}
             <div className="w-1/2 bg-[#fffdf5] relative flex items-center justify-center overflow-hidden">
                 {/* Background Pattern */}
                 <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle, #b71c1c 0.5px, transparent 0.5px)', backgroundSize: '15px 15px' }}></div>
                 <div className="absolute top-4 w-full text-center border-b border-slate-200 pb-2 mx-8">
                     <span className="font-serif font-bold text-[#3e2723] text-xs uppercase tracking-[0.2em]">Visas</span>
                 </div>
                 
                 {/* Faint watermark */}
                 <Fingerprint className="absolute bottom-12 left-12 w-40 h-40 text-slate-900 opacity-[0.03] -rotate-12" />

                 {/* The Stamp (Animated SVG) */}
                 <div className="relative w-48 h-48 flex items-center justify-center transform rotate-[-12deg] opacity-0 animate-stamp-impact">
                    <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-lg mix-blend-multiply">
                        {/* Outer Ring */}
                        <circle cx="100" cy="100" r="90" fill="none" stroke={stampHex} strokeWidth="5" strokeDasharray="8,4" />
                        <circle cx="100" cy="100" r="82" fill="none" stroke={stampHex} strokeWidth="2" />
                        
                        {/* Inner Details */}
                        <line x1="100" y1="20" x2="100" y2="180" stroke={stampHex} strokeWidth="1" opacity="0.3" />
                        <line x1="20" y1="100" x2="180" y2="100" stroke={stampHex} strokeWidth="1" opacity="0.3" />
                        
                        {/* Text Path */}
                        <path id="curve-top" d="M 30 100 A 70 70 0 1 1 170 100" fill="none" />
                        <text fontSize="14" fontFamily="monospace" fontWeight="bold" fill={stampHex} letterSpacing="3">
                           <textPath href="#curve-top" startOffset="50%" textAnchor="middle">IMMIGRATION CONTROL</textPath>
                        </text>

                        {/* Center Box */}
                        <rect x="35" y="65" width="130" height="70" rx="4" fill="none" stroke={stampHex} strokeWidth="3" />
                        
                        {/* Status */}
                        <text x="100" y="55" textAnchor="middle" fontSize="12" fontFamily="sans-serif" fontWeight="bold" fill={stampHex} letterSpacing="1">ENTRY GRANTED</text>
                        
                        {/* Destination Name (Dynamic) */}
                        <text x="100" y="90" textAnchor="middle" fontSize="16" fontFamily="serif" fontWeight="900" fill={stampHex} letterSpacing="1">
                           {destination.name.length > 10 ? destination.name.substring(0, 10).toUpperCase() + '.' : destination.name.toUpperCase()}
                        </text>

                        {/* Date */}
                        <text x="100" y="115" textAnchor="middle" fontSize="12" fontFamily="monospace" fill={stampHex} letterSpacing="1">
                           {new Date().toLocaleDateString().replace(/\//g, '.')}
                        </text>

                        {/* Airplane Icon */}
                        <path d="M100 128 l-5 5 h10 z" fill={stampHex} />
                    </svg>
                 </div>
             </div>

             {/* Center Fold Shadow */}
             <div className="absolute left-1/2 top-0 bottom-0 w-12 -ml-6 bg-gradient-to-r from-black/20 via-black/5 to-transparent pointer-events-none z-20 mix-blend-multiply"></div>
         </div>
      )}

      {/* Ticket Animation Stage */}
      {(stage === 'printing' || stage === 'visible' || stage === 'tearing') && (
        <div 
          className={`relative w-full max-w-2xl bg-[#f0f0f0] text-slate-900 rounded-xl overflow-hidden shadow-2xl transition-all duration-700 transform
            ${stage === 'printing' ? 'translate-y-[100vh] opacity-0' : 'translate-y-0 opacity-100'}
          `}
        >
          {/* ... existing ticket layout ... */}
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cardboard-flat.png')]"></div>

          <div className="flex flex-col md:flex-row relative z-10">
            
            {/* Main Ticket Portion (Left) */}
            <div className="flex-1 p-0 md:border-r-2 border-dashed border-slate-300 relative group">
              {/* City Landscape Header */}
              <div className="h-32 w-full relative overflow-hidden">
                  <img 
                    src={destination.imageUrl} 
                    alt={destination.name} 
                    className="w-full h-full object-cover filter brightness-75 group-hover:brightness-100 transition-all duration-1000 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-3 left-4 text-white">
                    <h2 className="text-3xl font-black uppercase tracking-tighter">{destination.name}</h2>
                    <p className="text-xs uppercase tracking-widest opacity-80">{destination.region}</p>
                  </div>
              </div>

              {/* Ticket Details */}
              <div className="p-6">
                  <div className="flex justify-between items-end mb-6">
                      <div>
                        <span className="text-xs text-slate-400 uppercase tracking-widest">Passenger</span>
                        <p className="font-mono font-bold text-lg">YOU</p>
                      </div>
                      <div>
                        <span className="text-xs text-slate-400 uppercase tracking-widest">Seat</span>
                        <p className="font-mono font-bold text-lg text-red-600">{selectedSeat}</p>
                      </div>
                      <div>
                        <span className="text-xs text-slate-400 uppercase tracking-widest">Distance</span>
                        <p className="font-mono font-bold text-lg">{destination.distanceKm} km</p>
                      </div>
                  </div>

                  <div className="mb-4">
                    <span className="text-xs text-slate-400 uppercase tracking-widest">Mission</span>
                    <p className="font-mono text-sm border-b border-slate-300 pb-1">{task || "Unspecified Journey"}</p>
                  </div>

                  <div className="flex items-center gap-2 text-slate-400">
                    <TrainFront className="w-4 h-4" />
                    <span className="text-xs tracking-widest">FocusExpress • Non-Stop Service</span>
                  </div>
              </div>

              <div className="absolute top-1/2 -left-3 w-6 h-6 bg-slate-900 rounded-full"></div>
              <div className="absolute top-1/2 -right-3 w-6 h-6 bg-slate-900 rounded-full z-20"></div>
            </div>

            {/* Stub Portion (Right) */}
            <div className={`
              md:w-48 bg-[#e5e5e5] p-6 flex flex-col justify-center items-center text-center relative
              transition-all duration-1000 origin-left
              ${stage === 'tearing' ? 'rotate-12 translate-y-20 opacity-0' : ''}
            `}>
              <div className="mb-4">
                  <QrCode className="w-24 h-24 opacity-80" />
              </div>
              
              <div className="space-y-2 mb-4">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase">Boarding</span>
                    <p className="font-mono font-bold text-xl">{destination.durationMinutes}<span className="text-xs align-top">MIN</span></p>
                  </div>
              </div>

              <div className="w-full h-0.5 bg-slate-300 my-2"></div>
              <p className="text-[10px] text-slate-500 font-mono mt-2">VALID FOR ONE TRIP</p>
            </div>
          </div>
        </div>
      )}

      {/* Global Keyframes for stamp and passport */}
      <style>{`
        @keyframes stamp-impact {
          0% { transform: scale(2) rotate(-12deg); opacity: 0; }
          40% { opacity: 1; }
          100% { transform: scale(1) rotate(-12deg); opacity: 0.8; }
        }
        @keyframes passport-open {
          0% { transform: rotateY(90deg); opacity: 0; }
          100% { transform: rotateY(0deg); opacity: 1; }
        }
        .animate-stamp-impact {
          animation: stamp-impact 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
          animation-delay: 1s; /* Wait for passport to be fully open */
        }
        .animate-passport-open {
           animation: passport-open 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default TicketModal;
