import React from 'react';
import { FocusSession } from '../types';
import { TrendingUp, Clock, MapPin } from 'lucide-react';

interface StatsProps {
  sessions: FocusSession[];
}

const Stats: React.FC<StatsProps> = ({ sessions }) => {
  const completedSessions = sessions.filter(s => s.completed);
  const totalMinutes = completedSessions.reduce((acc, curr) => acc + curr.durationMinutes, 0);
  const totalStations = completedSessions.length;

  return (
    <div className="grid grid-cols-3 gap-4 w-full max-w-2xl mt-8">
      <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex flex-col items-center">
        <Clock className="w-6 h-6 text-blue-400 mb-2" />
        <span className="text-2xl font-bold text-white">{totalMinutes}</span>
        <span className="text-xs text-slate-400 uppercase tracking-wider">Mins Focused</span>
      </div>
      
      <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex flex-col items-center">
        <MapPin className="w-6 h-6 text-green-400 mb-2" />
        <span className="text-2xl font-bold text-white">{totalStations}</span>
        <span className="text-xs text-slate-400 uppercase tracking-wider">Stations Reached</span>
      </div>

      <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex flex-col items-center">
        <TrendingUp className="w-6 h-6 text-purple-400 mb-2" />
        <span className="text-2xl font-bold text-white">{completedSessions.length > 0 ? Math.round(totalMinutes / completedSessions.length) : 0}</span>
        <span className="text-xs text-slate-400 uppercase tracking-wider">Avg Session</span>
      </div>
    </div>
  );
};

export default Stats;