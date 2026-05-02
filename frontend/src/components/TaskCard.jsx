import React, { useState, useEffect, useRef } from 'react';
import HPBar from './HPBar';
import { simulatePomodoro, deleteTask } from '../services/api';

const TaskCard = ({ task, onUpdate }) => {
    const [isBattling, setIsBattling] = useState(false);
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [distractions, setDistractions] = useState(0);
    const [combatState, setCombatState] = useState('idle');
    const timerRef = useRef(null);

    // Battle Timer Logic
    useEffect(() => {
        if (isBattling && timeLeft > 0) {
            timerRef.current = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            handleComplete(true);
        }
        return () => clearInterval(timerRef.current);
    }, [isBattling, timeLeft]);

    // Visibility Detection
    useEffect(() => {
        const handleVisibility = () => {
            if (document.hidden && isBattling) {
                setDistractions(prev => prev + 1);
            }
        };
        document.addEventListener("visibilitychange", handleVisibility);
        return () => document.removeEventListener("visibilitychange", handleVisibility);
    }, [isBattling]);

    const handleStartBattle = () => {
        setIsBattling(true);
    };

    const handleComplete = async (success) => {
        if (success) {
            setCombatState('attacking');
            setTimeout(() => setCombatState('hurt'), 400);
            setTimeout(() => setCombatState('idle'), 1200);
        }
        
        setTimeout(async () => {
            setIsBattling(false);
            clearInterval(timerRef.current);
            try {
                const updatedTask = await simulatePomodoro(task.taskId, success);
                onUpdate(updatedTask);
                setTimeLeft(25 * 60);
                setDistractions(0);
            } catch (error) {
                console.error("Battle sync failed", error);
            }
        }, success ? 1000 : 0);
    };

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const getDifficultyColor = (diff) => {
        switch(diff?.toUpperCase()) {
            case 'HIGH': return 'var(--hp-low)';
            case 'MEDIUM': return 'var(--hp-mid)';
            case 'LOW': return 'var(--hp-high)';
            default: return 'var(--text-muted)';
        }
    };

    const isCompleted = task.taskStatus === 'COMPLETED';
    const isHighThreat = task.difficulty?.toUpperCase() === 'HIGH';

    return (
        <div className={`glass rounded-[2rem] p-8 card-hover relative overflow-hidden group border border-white/5 ${isCompleted ? 'opacity-60 grayscale-[0.5]' : ''}`}>
            {/* Top Accent */}
            <div 
                className="absolute top-0 left-0 h-1.5 transition-all duration-700 group-hover:w-full"
                style={{ width: isBattling ? '100%' : '60px', backgroundColor: isBattling ? 'var(--secondary)' : getDifficultyColor(task.difficulty), boxShadow: `0 0 15px ${isBattling ? 'var(--secondary)' : getDifficultyColor(task.difficulty)}` }}
            ></div>

            <div className="relative z-10 space-y-6">
                {/* Battle Stage (Fixed Orientation: Hero Left, Boss Right) */}
                <div className={`battle-stage ${combatState === 'hurt' ? 'battle-shake' : ''}`}>
                    {/* HERO on the left */}
                    <div className="flex flex-col items-center gap-2">
                        <div className={`sprite sprite-hero ${combatState === 'attacking' ? 'attacking' : ''}`}></div>
                        <span className="text-[8px] font-black text-violet-400 uppercase tracking-[0.4em] opacity-40">HERO</span>
                    </div>

                    {isBattling && (
                        <div className="absolute top-2 left-1/2 -translate-x-1/2 flex flex-col items-center">
                            <span className="text-[10px] font-black text-white bg-black/40 px-3 py-1 rounded-full border border-white/10 uppercase tracking-widest backdrop-blur-sm">
                                {formatTime(timeLeft)}
                            </span>
                        </div>
                    )}

                    {/* BOSS on the right */}
                    <div className="flex flex-col items-center gap-2">
                        <div className={`sprite ${isHighThreat ? 'sprite-boss-doomsday' : 'sprite-boss-joker'} ${combatState === 'hurt' ? 'hurt' : ''}`}></div>
                        <span className="text-[8px] font-black text-red-400 uppercase tracking-[0.4em] opacity-40">BOSS</span>
                    </div>
                </div>

                {/* Header Info */}
                <div className="space-y-4">
                    <div className="space-y-1">
                        <h3 className="text-2xl font-black text-white font-outfit tracking-tight leading-none">{task.taskTitle}</h3>
                        <div className="flex flex-wrap gap-2 pt-2">
                            <span 
                                className="text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-lg border"
                                style={{ color: getDifficultyColor(task.difficulty), borderColor: `${getDifficultyColor(task.difficulty)}33`, backgroundColor: `${getDifficultyColor(task.difficulty)}08` }}
                            >
                                {task.difficulty} THREAT
                            </span>
                            <span className="text-[8px] font-black text-cyan-400 uppercase tracking-widest px-3 py-1 rounded-lg bg-cyan-400/5 border border-cyan-400/20">
                                SUBJECT: {task.topic || 'GENERAL'}
                            </span>
                            <span className="text-[8px] font-black text-violet-400 uppercase tracking-widest px-3 py-1 rounded-lg bg-violet-400/5 border border-violet-400/20">
                                TYPE: {task.type || 'GENERAL'}
                            </span>
                        </div>
                    </div>
                </div>

                <HPBar currentHP={task.currentHP} maxHP={task.maxHP} />

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <div className="flex items-center gap-6">
                        <div className="space-y-1">
                            <div className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Energy Required</div>
                            <div className="flex gap-1.5">
                                {Array.from({length: task.estimatedPomodoros}).map((_, i) => (
                                    <div key={i} className={`w-1.5 h-1.5 rounded-full ${i < (task.estimatedPomodoros - task.remainingPomodoros) ? 'bg-violet-500 shadow-[0_0_8px_#8b5cf6]' : 'bg-white/10'}`}></div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {!isCompleted ? (
                        <div className="flex gap-3">
                            {isBattling ? (
                                <button 
                                    onClick={() => handleComplete(false)}
                                    className="px-6 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-black uppercase tracking-widest"
                                >
                                    Flee 🏃
                                </button>
                            ) : (
                                <button 
                                    onClick={handleStartBattle}
                                    className="px-8 py-2.5 rounded-xl btn-primary btn-neon text-[10px] font-black uppercase tracking-widest"
                                >
                                    Battle ⚔️
                                </button>
                            )}
                            {isBattling && (
                                <button 
                                    onClick={() => handleComplete(true)}
                                    className="px-8 py-2.5 rounded-xl bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest shadow-[0_4px_15px_rgba(16,185,129,0.3)]"
                                >
                                    Strike ☄️
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="px-8 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em]">
                            Boss Slain
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TaskCard;
