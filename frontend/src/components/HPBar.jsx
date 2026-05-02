import React from 'react';

const HPBar = ({ currentHP, maxHP }) => {
    const percentage = Math.max(0, Math.min(100, (currentHP / maxHP) * 100));
    
    let glowColor = "var(--primary)";
    let barColor = "var(--primary)";
    
    if (percentage < 30) {
        glowColor = "var(--hp-low)";
        barColor = "var(--hp-low)";
    } else if (percentage < 60) {
        glowColor = "var(--hp-mid)";
        barColor = "var(--hp-mid)";
    } else {
        glowColor = "var(--hp-high)";
        barColor = "var(--hp-high)";
    }

    return (
        <div className="space-y-3">
            <div className="flex justify-between items-end">
                <div className="flex flex-col">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Current Integrity</span>
                    <span className="text-xl font-black text-white font-outfit leading-none">{Math.round(percentage)}%</span>
                </div>
                <div className="text-[10px] font-bold text-slate-400 font-mono bg-white/5 px-3 py-1 rounded-md border border-white/5">
                    {Math.round(currentHP)} / {maxHP} HP
                </div>
            </div>
            
            <div className="relative h-4 bg-black/40 rounded-full overflow-hidden border border-white/5 p-1">
                {/* Background segments for detail */}
                <div className="absolute inset-0 flex gap-1 px-1 py-1">
                    {Array.from({length: 10}).map((_, i) => (
                        <div key={i} className="h-full flex-1 bg-white/[0.02] rounded-sm"></div>
                    ))}
                </div>
                
                {/* Progress fill */}
                <div 
                    className="relative h-full rounded-full transition-all duration-1000 cubic-bezier(0.34, 1.56, 0.64, 1)"
                    style={{ 
                        width: `${percentage}%`, 
                        backgroundColor: barColor, 
                        boxShadow: `0 0 20px ${glowColor}66`
                    }} 
                >
                    {/* Animated shine effect on the bar */}
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 animate-[shimmer_2s_infinite]"></div>
                </div>
            </div>
        </div>
    );
};

export default HPBar;
