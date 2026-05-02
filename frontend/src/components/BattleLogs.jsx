import React from 'react';

const BattleLogs = () => {
    // Mock logs for demonstration
    const logs = [
        { id: 1, task: "Algebra Review", result: "VICTORY", dmg: 200, time: "25:00", date: "Today" },
        { id: 2, task: "Physics Research", result: "VICTORY", dmg: 500, time: "50:00", date: "Today" },
        { id: 3, task: "Neural Net Debug", result: "FLEE", dmg: 40, time: "12:04", date: "Yesterday" }
    ];

    return (
        <div className="space-y-8 animate-slide-up pb-20">
            <div className="flex items-center gap-4">
                <div className="w-2 h-8 bg-violet-500 rounded-full shadow-[0_0_15px_#8b5cf6]"></div>
                <h2 className="text-4xl font-black text-white font-outfit tracking-tighter uppercase">Battle Chronicles</h2>
            </div>

            <div className="glass rounded-[3rem] overflow-hidden border border-white/5">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-white/5 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">
                            <th className="px-8 py-6">Mission Designation</th>
                            <th className="px-8 py-6">Outcome</th>
                            <th className="px-8 py-6">Damage Dealt</th>
                            <th className="px-8 py-6">Focus Duration</th>
                            <th className="px-8 py-6">Date</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {logs.map((log) => (
                            <tr key={log.id} className="hover:bg-white/[0.02] transition-colors group">
                                <td className="px-8 py-6">
                                    <div className="text-sm font-bold text-white group-hover:text-violet-400 transition-colors">{log.task}</div>
                                </td>
                                <td className="px-8 py-6">
                                    <span className={`text-[9px] font-black px-3 py-1 rounded-full border ${log.result === 'VICTORY' ? 'text-emerald-400 border-emerald-400/20 bg-emerald-400/5' : 'text-red-400 border-red-400/20 bg-red-400/5'}`}>
                                        {log.result}
                                    </span>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="text-sm font-mono text-slate-400">{log.dmg} DMG</div>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="text-sm font-bold text-slate-400">{log.time}</div>
                                </td>
                                <td className="px-8 py-6 text-xs text-slate-600 font-bold uppercase tracking-widest">
                                    {log.date}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="glass rounded-[2rem] p-8 border border-dashed border-white/10 text-center">
                <p className="text-slate-500 text-xs font-black uppercase tracking-widest italic">"Every focused second is a strike against chaos."</p>
            </div>
        </div>
    );
};

export default BattleLogs;
