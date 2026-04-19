import { useEffect, useState } from 'react';
import { Activity, ChevronRight } from 'lucide-react';

interface TickerMatch {
  matchId: string;
  team1: string;
  team2: string;
  score1: string;
  score2: string;
  status: string;
}

export default function LiveTicker() {
  const [matches, setMatches] = useState<TickerMatch[]>([]);

  useEffect(() => {
    const fetchScores = async () => {
      try {
        const res = await fetch('https://crickdbmodule-api-144271912366.asia-south1.run.app/api/tournaments/list-public?activeOnly=true');
        const data = await res.json();
        
        const liveMatches: TickerMatch[] = [];
        for (const t of data.tournaments || []) {
          for (const m of t.matches || []) {
            if (m.status?.toLowerCase().includes('live') || m.status?.toLowerCase().includes('match')) {
              const inn1 = m.innings?.find((i: any) => i.inningsNumber === 1);
              const inn2 = m.innings?.find((i: any) => i.inningsNumber === 2);
              
              liveMatches.push({
                matchId: m.matchId,
                team1: m.team1.shortName || m.team1.name,
                team2: m.team2.shortName || m.team2.name,
                score1: inn1 ? `${inn1.runs}/${inn1.wickets} (${inn1.overs})` : '0/0',
                score2: inn2 ? `${inn2.runs}/${inn2.wickets} (${inn2.overs})` : '',
                status: m.status
              });
            }
          }
        }
        setMatches(liveMatches);
      } catch (err) {
        console.error('Ticker fetch error:', err);
      }
    };

    fetchScores();
    const interval = setInterval(fetchScores, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  if (matches.length === 0) return null;

  return (
    <div className="bg-zinc-950 border-b border-white/5 py-1.5 sm:py-2.5 relative z-[60] overflow-hidden group">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 flex items-center gap-6 sm:gap-10 overflow-x-auto hide-scrollbar">
        {/* Live Indicator */}
        <div className="flex-none flex items-center gap-2 pr-4 sm:pr-6 border-r border-white/10">
          <div className="relative">
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-red-500 rounded-full animate-ping absolute inset-0" />
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-red-500 rounded-full relative" />
          </div>
          <span className="text-[9px] sm:text-[10px] font-black text-white uppercase tracking-widest whitespace-nowrap">Live Scores</span>
        </div>

        {/* Scorecards */}
        <div className="flex items-center gap-4 sm:gap-6 pb-0.5">
          {matches.map((m) => (
            <div 
              key={m.matchId} 
              className="flex-none flex items-center gap-4 bg-white/5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl border border-white/5 hover:border-sky-500/30 transition-all group/card cursor-pointer"
            >
              <div className="flex flex-col gap-0.5 sm:gap-1">
                <div className="flex items-center gap-2 sm:gap-3">
                  <span className="text-[10px] font-black text-zinc-500 uppercase w-8 sm:w-10">{m.team1}</span>
                  <span className="text-[10px] sm:text-xs font-bold text-white tracking-tight">{m.score1}</span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                  <span className="text-[10px] font-black text-zinc-500 uppercase w-8 sm:w-10">{m.team2}</span>
                  <span className="text-[10px] sm:text-xs font-bold text-white tracking-tight">{m.score2 || (m.status.toLowerCase().includes('won') ? '' : 'Yet to bat')}</span>
                </div>
              </div>
              
              <div className="pl-3 sm:pl-4 border-l border-white/10 flex flex-col justify-center max-w-[120px]">
                <span className="text-[8px] sm:text-[9px] font-black text-sky-500 uppercase tracking-tighter leading-none line-clamp-2">
                  {m.status}
                </span>
                <ChevronRight className="w-3 h-3 text-zinc-600 mt-1 opacity-0 group-hover/card:opacity-100 transition-opacity" />
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Decorative Gradient Overlays */}
      <div className="absolute top-0 right-0 bottom-0 w-12 bg-gradient-to-l from-zinc-950 to-transparent pointer-events-none z-10" />
      <div className="absolute top-0 left-0 bottom-0 w-12 bg-gradient-to-r from-zinc-950 to-transparent pointer-events-none z-10" />
    </div>
  );
}
