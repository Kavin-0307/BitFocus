import React, { useEffect, useState } from 'react';
import TaskCard from './TaskCard';
import { getTasks } from '../services/api';

const TaskList = ({ refreshTrigger, onRefresh }) => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchTasks = async () => {
        setLoading(true);
        try {
            const data = await getTasks();
            setTasks(data);
        } catch (error) {
            console.error("Failed to fetch tasks", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, [refreshTrigger]);

    if (loading && tasks.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-12 h-12 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin"></div>
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] animate-pulse">Syncing Battle Log...</div>
            </div>
        );
    }

    if (tasks.length === 0) {
        return (
            <div className="glass rounded-3xl p-16 text-center border-dashed border-2 border-white/5">
                <div className="text-6xl mb-6 opacity-20 grayscale">🛡️</div>
                <h3 className="text-xl font-bold text-white mb-2">The Realm is Safe</h3>
                <p className="text-slate-500 text-sm max-w-xs mx-auto">No bosses currently threatening your focus. Summon a new quest to begin your training.</p>
            </div>
        );
    }

    // Sort: Active first, then priority
    const sortedTasks = [...tasks].sort((a, b) => {
        if (a.taskStatus === 'COMPLETED' && b.taskStatus !== 'COMPLETED') return 1;
        if (a.taskStatus !== 'COMPLETED' && b.taskStatus === 'COMPLETED') return -1;
        return b.taskPriority - a.taskPriority;
    });

    return (
        <div className="space-y-6">
            {sortedTasks.map((task, index) => (
                <div 
                    key={task.taskId} 
                    className="animate-slide-up" 
                    style={{ animationDelay: `${0.1 * index}s` }}
                >
                    <TaskCard 
                        task={task} 
                        onUpdate={() => onRefresh()} 
                    />
                </div>
            ))}
        </div>
    );
};

export default TaskList;
