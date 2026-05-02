import React from 'react';

const ArmoryView = () => {
    const stats = [
        { label: 'Strength', value: 85, color: 'var(--hp-low)' },
        { label: 'Intelligence', value: 92, color: 'var(--secondary)' },
        { label: 'Willpower', value: 78, color: 'var(--primary)' },
        { label: 'Stealth', value: 64, color: 'var(--text-muted)' }
    ];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 animate-slide-up">
            {/* Batman Silhouette Area */}
            <div className="lg:col-span-5 flex flex-col items-center">
                <div className="glass rounded-[3rem] w-full aspect-square flex items-center justify-center relative overflow-hidden group">
                    {/* Background Tech Radar */}
                    <div className="absolute inset-0 opacity-10 pointer-events-none">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-2 border-white/20 rounded-full animate-pulse"></div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-white/20 rounded-full"></div>
                    </div>

                    {/* Batman Sprite - Using the calibrated class */}
                    <div className="sprite-batman w-64 h-64 z-10 transition-transform duration-700 group-hover:scale-110"></div>

                    <div className="absolute bottom-10 left-0 w-full text-center">
                        <div className="text-[10px] font-black text-violet-400 uppercase tracking-[0.4em]">Codename: Dark Knight</div>
                        <div className="text-3xl font-black text-white font-outfit tracking-tighter mt-1">STATUS: STALKING</div>
                    </div>
                </div>
            </div>

            {/* Performance Data */}
            <div className="lg:col-span-7 space-y-8">
                <div className="flex items-center gap-3">
                    <div className="w-1.5 h-6 bg-violet-500 rounded-full"></div>
                    <h2 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">Wayne Tech Analysis</h2>
                </div>

                <div className="glass rounded-3xl p-10 space-y-10">
                    <div className="space-y-6">
                        {stats.map(stat => (
                            <div key={stat.label} className="space-y-2">
                                <div className="flex justify-between items-end">
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</span>
                                    <span className="text-sm font-black text-white">{stat.value}%</span>
                                </div>
                                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                                    <div 
                                        className="h-full transition-all duration-1000 ease-out"
                                        style={{ width: `${stat.value}%`, backgroundColor: stat.color, boxShadow: `0 0 10px ${stat.color}44` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="pt-8 border-t border-white/5 grid grid-cols-2 gap-6">
                        <div>
                            <div className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Total XP</div>
                            <div className="text-2xl font-black text-white font-outfit tracking-tight">124,500</div>
                        </div>
                        <div>
                            <div className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Rank</div>
                            <div className="text-2xl font-black text-violet-400 font-outfit tracking-tight">LEGENDARY</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ArmoryView;
