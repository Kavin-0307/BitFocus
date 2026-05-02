import React, { useState } from 'react';
import { createTask } from '../services/api';

const TaskForm = ({ onTaskAdded }) => {
    const [title, setTitle] = useState('');
    const [priority, setPriority] = useState(3);
    const [deadline, setDeadline] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title) return;

        setLoading(true);
        try {
            await createTask({
                taskTitle: title,
                taskPriority: parseInt(priority),
                taskDeadline: deadline ? new Date(deadline).toISOString() : null
            });
            setTitle('');
            setDeadline('');
            onTaskAdded();
        } catch (error) {
            console.error("Task creation failed", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="glass rounded-3xl p-8 space-y-6 group border border-white/5 relative overflow-hidden">
            <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Quest Designation</label>
                <input 
                    type="text" 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="E.g., Complete Project Alpha"
                    className="w-full bg-black/20 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-violet-500/50 focus:ring-4 focus:ring-violet-500/10 transition-all font-medium"
                    required
                />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Intensity</label>
                    <input 
                        type="number" 
                        min="1" max="10"
                        value={priority} 
                        onChange={(e) => setPriority(e.target.value)}
                        className="w-full bg-black/20 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-violet-500/50 transition-all font-bold text-center"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Deadline</label>
                    <input 
                        type="datetime-local" 
                        value={deadline} 
                        onChange={(e) => setDeadline(e.target.value)}
                        className="w-full bg-black/20 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-violet-500/50 transition-all text-[10px] uppercase font-bold"
                    />
                </div>
            </div>

            <button 
                type="submit" 
                disabled={loading}
                className="w-full py-5 rounded-2xl btn-neon btn-primary font-black text-[10px] uppercase tracking-[0.3em] disabled:opacity-50"
            >
                {loading ? (
                    <span className="flex items-center justify-center gap-3">
                        <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Generating...
                    </span>
                ) : 'Spawn Quest ⚔️'}
            </button>
        </form>
    );
};

export default TaskForm;
