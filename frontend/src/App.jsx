import React, { useState, useEffect } from 'react';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';
import ArmoryView from './components/ArmoryView';
import FeaturesView from './components/FeaturesView';
import BattleLogs from './components/BattleLogs';

function App() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [activeTab, setActiveTab] = useState('DASHBOARD');
  const [isDistracted, setIsDistracted] = useState(false);

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log("⚠️ HERO HAS LEFT THE BATTLEFIELD!");
      } else {
        setIsDistracted(true);
        setTimeout(() => setIsDistracted(false), 5000);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  return (
    <div className="min-h-screen font-jakarta selection:bg-violet-500/30 relative">
      {/* Distraction Overlay */}
      {isDistracted && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] animate-bounce">
          <div className="glass px-6 py-3 rounded-2xl border-red-500/50 flex items-center gap-3 shadow-2xl shadow-red-500/20">
            <span className="text-xl">👁️</span>
            <span className="text-xs font-black text-red-400 uppercase tracking-widest">Spectral Gaze: Focus Restored</span>
          </div>
        </div>
      )}

      {/* Navbar */}
      <nav className="glass sticky top-0 z-50 px-6 py-4 border-b border-white/5">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <span className="text-xl">⚔️</span>
            </div>
            <span className="text-2xl font-black tracking-tighter text-white font-outfit">FocusFlow</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-[11px] font-black tracking-[0.2em]">
            <button 
              onClick={() => setActiveTab('DASHBOARD')}
              className={`transition-colors uppercase ${activeTab === 'DASHBOARD' ? 'text-violet-400' : 'text-slate-500 hover:text-violet-400'}`}
            >
              DASHBOARD
            </button>
            <button 
              onClick={() => setActiveTab('BATTLES')}
              className={`transition-colors uppercase ${activeTab === 'BATTLES' ? 'text-violet-400' : 'text-slate-500 hover:text-violet-400'}`}
            >
              BATTLES
            </button>
            <button 
              onClick={() => setActiveTab('FEATURES')}
              className={`transition-colors uppercase ${activeTab === 'FEATURES' ? 'text-violet-400' : 'text-slate-500 hover:text-violet-400'}`}
            >
              FEATURES
            </button>
            <button 
              onClick={() => setActiveTab('ARMORY')}
              className={`transition-colors uppercase ${activeTab === 'ARMORY' ? 'text-violet-400' : 'text-slate-500 hover:text-violet-400'}`}
            >
              ARMORY
            </button>
          </div>

          <div className="flex items-center gap-4">
            <div className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-black text-violet-400 tracking-wider">
              LVL 12 WARRIOR
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {activeTab === 'DASHBOARD' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-4 space-y-8">
              <div className="animate-slide-up">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1.5 h-6 bg-violet-500 rounded-full shadow-[0_0_10px_#8b5cf6]"></div>
                  <h2 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">Summon Quest</h2>
                </div>
                <TaskForm onTaskAdded={handleRefresh} />
              </div>

              <div className="glass rounded-3xl p-8 space-y-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Global Performance</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-2xl p-5 border border-white/5 group hover:border-violet-500/30 transition-colors">
                    <div className="text-3xl font-black text-white font-outfit">24h</div>
                    <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">Focus Time</div>
                  </div>
                  <div className="bg-white/5 rounded-2xl p-5 border border-white/5 group hover:border-cyan-500/30 transition-colors">
                    <div className="text-3xl font-black text-white font-outfit">12</div>
                    <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">Bosses Slain</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-8 space-y-8 animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-6 bg-cyan-500 rounded-full shadow-[0_0_10px_#06b6d4]"></div>
                  <h2 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">Active Bosses</h2>
                </div>
                <div className="px-3 py-1 rounded-md bg-white/5 text-[9px] font-black text-slate-500 tracking-widest">
                  SORTED BY THREAT
                </div>
              </div>
              <TaskList refreshTrigger={refreshTrigger} onRefresh={handleRefresh} />
            </div>
          </div>
        )}

        {activeTab === 'BATTLES' && <BattleLogs />}
        {activeTab === 'FEATURES' && <FeaturesView />}
        {activeTab === 'ARMORY' && <ArmoryView />}
      </main>

      {/* Decorative Glows */}
      <div className="fixed -bottom-40 -right-40 w-96 h-96 bg-violet-600/10 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="fixed -top-20 -left-20 w-80 h-80 bg-cyan-600/10 blur-[100px] rounded-full pointer-events-none"></div>
    </div>
  );
}

export default App;
