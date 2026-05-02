import React, { useState } from 'react';

const FeaturesView = () => {
    const [inputText, setInputText] = useState('');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const testMLModel = async () => {
        if (!inputText) return;
        setLoading(true);
        try {
            const response = await fetch('http://localhost:8001/analyze-task', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: inputText })
            });
            const data = await response.json();
            setResult(data);
        } catch (error) {
            console.error("ML Service offline", error);
            setResult({ error: "ML Service Offline (Ensure Port 8001 is running)" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-12 animate-slide-up pb-20">
            <div className="text-center space-y-4">
                <h2 className="text-5xl font-black text-white font-outfit tracking-tighter">AI PLAYGROUND</h2>
                <p className="text-slate-500 max-w-2xl mx-auto uppercase text-[10px] font-black tracking-[0.4em]">Live Interaction with the NLP Engine</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Real-Time ML Tester */}
                <div className="lg:col-span-8">
                    <div className="glass rounded-[3rem] p-10 border border-violet-500/20 relative overflow-hidden">
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">NLP Analysis Tester</h3>
                                <div className="flex gap-1.5">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                    <span className="text-[9px] font-black text-emerald-500/80 uppercase">Service Live : 8001</span>
                                </div>
                            </div>

                            <div className="relative group">
                                <input 
                                    type="text" 
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    placeholder="Enter a task to analyze (e.g. 'Solve calculus problems')..."
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-outfit focus:outline-none focus:border-violet-500/50 transition-all"
                                />
                                <button 
                                    onClick={testMLModel}
                                    disabled={loading}
                                    className="absolute right-2 top-2 bottom-2 px-6 bg-violet-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                                >
                                    {loading ? 'Analyzing...' : 'Analyze ⚡'}
                                </button>
                            </div>

                            {result && (
                                <div className="p-8 bg-black/40 rounded-[2rem] border border-white/5 font-mono text-sm animate-slide-up">
                                    {result.error ? (
                                        <p className="text-red-400">{result.error}</p>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-4">
                                                <p className="text-white/40 font-black text-[10px] uppercase tracking-widest">Model Output</p>
                                                <div className="space-y-2">
                                                    <p><span className="text-violet-400 font-bold">SUBJECT:</span> <span className="text-white uppercase">{result.topic}</span></p>
                                                    <p><span className="text-cyan-400 font-bold">TASK_TYPE:</span> <span className="text-white uppercase">{result.type}</span></p>
                                                    <p><span className="text-red-400 font-bold">THREAT_LVL:</span> <span className="text-white uppercase">{result.difficulty}</span></p>
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                <p className="text-white/40 font-black text-[10px] uppercase tracking-widest">RPG Parameters</p>
                                                <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                                                    <div className="text-2xl font-black text-white font-outfit">HP: {result.difficulty === 'HIGH' ? '500' : result.difficulty === 'MEDIUM' ? '200' : '100'}</div>
                                                    <div className="text-[10px] font-black text-slate-500 uppercase mt-1">Boss Health Calculated</div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-4 space-y-6">
                    <div className="glass rounded-[2rem] p-8 border border-white/5">
                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">How it works</h4>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            This interface bypasses the Backend and talks directly to your **Python ML Service**. 
                            It sends your text to the `/analyze-task` endpoint where a **SpaCy-powered pipeline** extracts 
                            domain-specific entities to determine game difficulty.
                        </p>
                    </div>
                    <div className="glass rounded-[2rem] p-8 border border-white/5 bg-gradient-to-br from-violet-500/5 to-transparent">
                        <h4 className="text-[10px] font-black text-violet-400 uppercase tracking-widest mb-2">Tech Stack</h4>
                        <div className="text-[10px] font-bold text-white space-y-1 opacity-80 uppercase">
                            <p>• Python 3.14</p>
                            <p>• FastAPI Framework</p>
                            <p>• SpaCy NLP Core</p>
                            <p>• Uvicorn Server</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FeaturesView;
