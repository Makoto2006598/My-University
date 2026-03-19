
import React, { useState } from 'react';
import { EngineRecommendationRequest } from '../types';
import { getEngineRecommendation, getCodeAssistance } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';
import { Cpu, Terminal, Users, Banknote, MonitorPlay, Sparkles, Loader2, AlertCircle, Code2, GraduationCap, ChevronRight, MessageSquareCode } from 'lucide-react';

type Tab = 'matchmaker' | 'mentor';

export const EngineConsultant: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('matchmaker');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  
  // State for Matchmaker
  const [formData, setFormData] = useState<EngineRecommendationRequest>({
    targetPlatform: ['PC (Windows/Mac)'],
    teamSize: '独立开发 (1-3人)',
    graphicsStyle: '风格化 / 低多边形 (Low Poly)',
    budget: '低预算 / 优先免费工具',
    programmingLanguage: 'C# 或可视化编程',
    specificFeatures: '网格建造系统，AI寻路模拟 (1000+ 单位)',
  });

  // State for Mentor
  const [mentorQuery, setMentorQuery] = useState("");

  const handleMatchmakerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    const recommendation = await getEngineRecommendation(formData);
    setResult(recommendation);
    setLoading(false);
  };

  const handleMentorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mentorQuery.trim()) return;
    setLoading(true);
    setResult(null);
    const advice = await getCodeAssistance(mentorQuery);
    setResult(advice);
    setLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const loadPresetQuery = (query: string) => {
    setMentorQuery(query);
    setActiveTab('mentor');
  };

  return (
    <div className="h-full flex flex-col bg-orange-50">
      {/* Tab Navigation */}
      <div className="bg-white/80 backdrop-blur border-b border-orange-100 p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
            <h1 className="text-xl font-bold text-stone-800 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-emerald-500" />
                技术顾问
            </h1>
            <div className="flex gap-2 p-1 bg-stone-100 rounded-lg border border-stone-200">
                <button
                    onClick={() => { setActiveTab('matchmaker'); setResult(null); }}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2
                        ${activeTab === 'matchmaker' ? 'bg-white text-stone-800 shadow' : 'text-stone-500 hover:text-stone-800'}
                    `}
                >
                    <MonitorPlay className="w-4 h-4" /> 引擎推荐
                </button>
                <button
                    onClick={() => { setActiveTab('mentor'); setResult(null); }}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2
                        ${activeTab === 'mentor' ? 'bg-white text-stone-800 shadow' : 'text-stone-500 hover:text-stone-800'}
                    `}
                >
                    <Code2 className="w-4 h-4" /> 开发导师
                </button>
            </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 lg:p-12 custom-scrollbar">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
            
            {/* LEFT COLUMN: Input */}
            <div className="space-y-6">
                {activeTab === 'matchmaker' ? (
                    // --- ENGINE MATCHMAKER FORM ---
                    <div className="bg-white/90 backdrop-blur-md p-6 rounded-2xl border border-orange-100 shadow-xl animate-in fade-in slide-in-from-left-4 duration-300">
                        <h2 className="text-2xl font-bold text-stone-800 mb-2">项目规格</h2>
                        <p className="text-stone-500 mb-6 text-sm">
                        为您的“大学模拟经营”创意寻找最合适的游戏引擎。
                        </p>

                        <form onSubmit={handleMatchmakerSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-stone-600 mb-1 flex items-center gap-2">
                                <MonitorPlay className="w-4 h-4 text-emerald-500" /> 目标平台
                            </label>
                            <select 
                            name="targetPlatform" 
                            className="w-full bg-stone-50 border border-stone-200 rounded-lg p-3 text-stone-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                            value={formData.targetPlatform[0]}
                            onChange={(e) => setFormData({...formData, targetPlatform: [e.target.value]})}
                            >
                            <option>PC (Windows/Mac/Linux)</option>
                            <option>网页端 (WebGL/WebGPU)</option>
                            <option>移动端 (iOS/Android)</option>
                            <option>主机 & PC</option>
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                            <label className="block text-sm font-medium text-stone-600 mb-1 flex items-center gap-2">
                                <Users className="w-4 h-4 text-emerald-500" /> 团队规模
                            </label>
                            <select 
                                name="teamSize" 
                                className="w-full bg-stone-50 border border-stone-200 rounded-lg p-3 text-stone-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                                value={formData.teamSize}
                                onChange={handleChange}
                            >
                                <option>个人开发者</option>
                                <option>独立开发 (1-3人)</option>
                                <option>小型工作室 (4-10人)</option>
                                <option>大型团队 (10人以上)</option>
                            </select>
                            </div>
                            <div>
                            <label className="block text-sm font-medium text-stone-600 mb-1 flex items-center gap-2">
                                <Banknote className="w-4 h-4 text-emerald-500" /> 预算
                            </label>
                            <select 
                                name="budget" 
                                className="w-full bg-stone-50 border border-stone-200 rounded-lg p-3 text-stone-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                                value={formData.budget}
                                onChange={handleChange}
                            >
                                <option>零预算 / 仅限免费工具</option>
                                <option>低预算 / 一次性购买</option>
                                <option>充足 / 可购买企业级服务</option>
                            </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-stone-600 mb-1 flex items-center gap-2">
                                <Terminal className="w-4 h-4 text-emerald-500" /> 首选编程语言
                            </label>
                            <input 
                            type="text" 
                            name="programmingLanguage" 
                            value={formData.programmingLanguage}
                            onChange={handleChange}
                            className="w-full bg-stone-50 border border-stone-200 rounded-lg p-3 text-stone-800 focus:ring-2 focus:ring-emerald-500 outline-none placeholder-stone-400"
                            placeholder="例如：C#, C++, JavaScript, 无代码..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-stone-600 mb-1 flex items-center gap-2">
                                <Cpu className="w-4 h-4 text-emerald-500" /> 关键功能需求
                            </label>
                            <textarea 
                            name="specificFeatures" 
                            value={formData.specificFeatures}
                            onChange={handleChange}
                            rows={4}
                            className="w-full bg-stone-50 border border-stone-200 rounded-lg p-3 text-stone-800 focus:ring-2 focus:ring-emerald-500 outline-none placeholder-stone-400"
                            placeholder="描述您游戏的核心技术需求..."
                            />
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-200 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-200 transition-all flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                            {loading ? '分析并生成建议...' : '生成引擎建议'}
                        </button>
                        </form>
                    </div>
                ) : (
                    // --- DEV MENTOR FORM ---
                    <div className="bg-white/90 backdrop-blur-md p-6 rounded-2xl border border-blue-100 shadow-xl animate-in fade-in slide-in-from-left-4 duration-300">
                        <h2 className="text-2xl font-bold text-stone-800 mb-2 flex items-center gap-2">
                            <GraduationCap className="w-6 h-6 text-blue-500" />
                            开发导师
                        </h2>
                        <p className="text-stone-500 mb-6 text-sm">
                            询问代码片段、教程或调试帮助。
                        </p>

                        <div className="mb-6 space-y-2">
                            <p className="text-xs font-bold text-stone-400 uppercase tracking-wider">快速提问</p>
                            <button 
                                onClick={() => loadPresetQuery("我是Unity初学者，正在制作一款类似《城市：天际线》的游戏。如何编写一个脚本，让主摄像机可以通过 WASD 移动并通过鼠标滚轮缩放？请给出详细步骤。")}
                                className="w-full text-left p-3 bg-blue-50 hover:bg-blue-100 border border-blue-100 hover:border-blue-200 rounded-lg transition-all group"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-stone-700 text-sm font-medium">Unity RTS 相机脚本 (WASD + 缩放)</span>
                                    <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-blue-500" />
                                </div>
                                <p className="text-xs text-stone-500 mt-1">初学者移动逻辑指南</p>
                            </button>
                            <button 
                                onClick={() => loadPresetQuery("如何在 Unity 中实现网格建造系统？我想让物体吸附在 1x1 的网格上。")}
                                className="w-full text-left p-3 bg-blue-50 hover:bg-blue-100 border border-blue-100 hover:border-blue-200 rounded-lg transition-all group"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-stone-700 text-sm font-medium">网格建造系统</span>
                                    <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-blue-500" />
                                </div>
                            </button>
                        </div>

                        <form onSubmit={handleMentorSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-stone-600 mb-1 flex items-center gap-2">
                                    <MessageSquareCode className="w-4 h-4 text-blue-500" /> 你的问题
                                </label>
                                <textarea 
                                    value={mentorQuery}
                                    onChange={(e) => setMentorQuery(e.target.value)}
                                    rows={6}
                                    className="w-full bg-stone-50 border border-stone-200 rounded-lg p-3 text-stone-800 focus:ring-2 focus:ring-blue-500 outline-none placeholder-stone-400 font-mono text-sm"
                                    placeholder="例如：如何在 Godot 中制作 3D 昼夜循环？"
                                />
                            </div>

                            <button 
                                type="submit" 
                                disabled={loading || !mentorQuery.trim()}
                                className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-stone-300 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <GraduationCap className="w-5 h-5" />}
                                {loading ? '咨询导师中...' : '向导师提问'}
                            </button>
                        </form>
                    </div>
                )}
                
                <div className="p-4 bg-white/50 border border-stone-200 rounded-xl flex gap-3">
                    <AlertCircle className="w-5 h-5 text-stone-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-stone-500 leading-relaxed">
                        {activeTab === 'matchmaker' 
                            ? "AI 顾问会分析您的限制条件，建议最合适的引擎。" 
                            : "AI 导师提供代码和教程。请务必在您的特定环境中验证代码。"}
                    </p>
                </div>
            </div>

            {/* RIGHT COLUMN: Output */}
            <div className="h-full flex flex-col min-h-[500px] lg:min-h-0">
                {result ? (
                    <div className="bg-white/90 backdrop-blur-md p-8 rounded-2xl border border-stone-200 shadow-xl overflow-hidden h-full flex flex-col animate-in fade-in zoom-in-95 duration-300">
                        <div className="flex items-center justify-between mb-4 pb-4 border-b border-stone-100">
                             <h3 className="text-lg font-bold text-stone-800 flex items-center gap-2">
                                {activeTab === 'matchmaker' ? <MonitorPlay className="w-5 h-5 text-emerald-500"/> : <Code2 className="w-5 h-5 text-blue-500"/>}
                                建议方案
                             </h3>
                             <button onClick={() => setResult(null)} className="text-xs text-stone-400 hover:text-stone-600 underline">清空</button>
                        </div>
                        <div className="prose prose-stone prose-sm lg:prose-base max-w-none h-full overflow-y-auto pr-2 custom-scrollbar">
                            <ReactMarkdown
                                components={{
                                    code({node, inline, className, children, ...props}: any) {
                                        return !inline ? (
                                            <div className="bg-stone-900 p-4 rounded-lg border border-stone-800 my-4 overflow-x-auto text-white">
                                                <code className={className} {...props}>{children}</code>
                                            </div>
                                        ) : (
                                            <code className="bg-stone-100 px-1 py-0.5 rounded text-emerald-600 text-sm font-bold" {...props}>{children}</code>
                                        )
                                    }
                                }}
                            >
                                {result}
                            </ReactMarkdown>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-stone-400 bg-white/30 rounded-2xl border border-stone-200 border-dashed p-8 text-center">
                        {activeTab === 'matchmaker' ? (
                            <>
                                <MonitorPlay className="w-16 h-16 mb-4 opacity-20" />
                                <p className="text-lg font-medium text-stone-500">准备分析</p>
                                <p className="text-sm">填写项目规格以获取引擎建议。</p>
                            </>
                        ) : (
                            <>
                                <Code2 className="w-16 h-16 mb-4 opacity-20" />
                                <p className="text-lg font-medium text-stone-500">等待提问</p>
                                <p className="text-sm">选择一个快速主题或输入您自己的问题。</p>
                            </>
                        )}
                    </div>
                )}
            </div>

        </div>
      </div>
    </div>
  );
};
