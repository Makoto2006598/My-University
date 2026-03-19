
import React from 'react';
import { GameState, SocialPublicityTier, MinistryPublicityType, PublicityBuffType } from '../../../types';
import { formatMoney } from '../../../utils/gameUtils';
import { Megaphone, Landmark, AlertTriangle, Clock, TrendingDown, TrendingUp, Lock } from 'lucide-react';

interface PublicityPanelProps {
    gameState: GameState;
    onStartSocial: (tier: SocialPublicityTier) => void;
    onStartMinistry: (type: MinistryPublicityType) => void;
}

const SOCIAL_CAMPAIGNS = [
    {
        id: SocialPublicityTier.STANDARD,
        name: "普通宣传",
        cost: 10000,
        days: 20,
        gainMin: 0,
        gainMax: 1.5,
        desc: "在本地报纸和社区投放基础广告。"
    },
    {
        id: SocialPublicityTier.PREMIUM,
        name: "精心宣传",
        cost: 80000,
        days: 30,
        gainMin: 0,
        gainMax: 5,
        desc: "雇佣专业团队进行网络营销和电视广告投放。"
    },
    {
        id: SocialPublicityTier.MASSIVE,
        name: "大力宣传",
        cost: 150000,
        days: 50,
        gainMin: 1,
        gainMax: 10,
        desc: "覆盖全国的甚至国际的媒体轰炸。"
    }
];

const BUFF_INFO: Record<PublicityBuffType, { name: string, desc: string, color: string }> = {
    [PublicityBuffType.RECENT_PUBLICITY]: {
        name: "近期宣传",
        desc: "教育部认可度获取 -10%",
        color: "text-blue-600 bg-blue-50 border-blue-200"
    },
    [PublicityBuffType.OVER_PUBLICITY]: {
        name: "过度宣传",
        desc: "社会认可度获取 -15%，教育部认可度获取 -30%，无法开启新宣传",
        color: "text-red-600 bg-red-50 border-red-200"
    },
    [PublicityBuffType.MINISTRY_CONTACT]: {
        name: "教育部联络",
        desc: "已建立初步联络，再次公关将触发特殊效果",
        color: "text-amber-600 bg-amber-50 border-amber-200"
    },
    [PublicityBuffType.BACKROOM_DEAL]: {
        name: "背后交易",
        desc: "社会认可度获取 -90%，教育部认可度获取 -80%",
        color: "text-purple-600 bg-purple-50 border-purple-200"
    }
};

export const PublicityPanel: React.FC<PublicityPanelProps> = ({ gameState, onStartSocial, onStartMinistry }) => {
    const isOverPublicity = gameState.publicity.activeBuffs.some(b => b.type === PublicityBuffType.OVER_PUBLICITY);
    const activeSocial = gameState.publicity.activeCampaigns[0]; // Assuming one at a time for simplicity/UI

    return (
        <div className="flex flex-col h-full bg-orange-50/50 overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-orange-100 bg-white/50 shrink-0">
                <h2 className="text-2xl font-bold text-stone-800 flex items-center gap-2">
                    <Megaphone className="w-6 h-6 text-orange-600" /> 宣传处
                </h2>
                <div className="text-xs text-stone-500 mt-1">
                    提升社会知名度与教育部评分，但需注意过犹不及。
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
                
                {/* Active Effects / Status */}
                <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-sm">
                    <h3 className="text-xs font-bold text-stone-400 uppercase mb-3 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" /> 当前状态
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-3 bg-stone-50 rounded-lg border border-stone-100 flex justify-between items-center">
                            <span className="text-sm font-bold text-stone-600">社会认可度</span>
                            <span className="text-xl font-mono text-stone-800">{Math.floor(gameState.socialRecognition)}</span>
                        </div>
                        <div className="p-3 bg-stone-50 rounded-lg border border-stone-100 flex justify-between items-center">
                            <span className="text-sm font-bold text-stone-600">教育部评分</span>
                            <span className="text-xl font-mono text-stone-800">{Math.floor(gameState.ministryRecognition)}</span>
                        </div>
                    </div>

                    {/* Active Buffs List */}
                    {gameState.publicity.activeBuffs.length > 0 && (
                        <div className="mt-4 space-y-2">
                            <div className="text-[10px] font-bold text-stone-400 uppercase">生效中效果</div>
                            <div className="flex flex-wrap gap-2">
                                {gameState.publicity.activeBuffs.map((buff, idx) => (
                                    <div key={idx} className={`px-3 py-2 rounded-lg border text-xs flex items-center gap-2 ${BUFF_INFO[buff.type].color}`}>
                                        <Clock className="w-3 h-3" />
                                        <div>
                                            <div className="font-bold">{BUFF_INFO[buff.type].name}</div>
                                            <div className="opacity-80 text-[10px]">{BUFF_INFO[buff.type].desc} (剩余 {Math.ceil(buff.daysLeft / 30)} 个月)</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Social Publicity Section */}
                <div>
                    <h3 className="text-lg font-bold text-stone-800 mb-3 flex items-center gap-2">
                        <Megaphone className="w-5 h-5 text-blue-500" /> 社会宣传
                    </h3>
                    
                    {activeSocial ? (
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center animate-in zoom-in-95">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
                                <Megaphone className="w-8 h-8 animate-pulse" />
                            </div>
                            <h4 className="text-xl font-bold text-blue-800 mb-1">{SOCIAL_CAMPAIGNS.find(c => c.id === activeSocial.tier)?.name} 进行中</h4>
                            <div className="text-blue-600 text-sm mb-4">剩余 {activeSocial.daysLeft} 天</div>
                            <div className="w-full bg-blue-200 h-2 rounded-full overflow-hidden max-w-xs mx-auto">
                                <div className="bg-blue-500 h-full transition-all duration-1000" style={{ width: `${(activeSocial.daysLeft / (SOCIAL_CAMPAIGNS.find(c => c.id === activeSocial.tier)?.days || 1)) * 100}%` }}></div>
                            </div>
                            <p className="text-xs text-blue-400 mt-4">当前已有宣传活动，无法开启新的社会宣传。</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {SOCIAL_CAMPAIGNS.map(camp => (
                                <button
                                    key={camp.id}
                                    onClick={() => onStartSocial(camp.id)}
                                    disabled={isOverPublicity}
                                    className={`relative p-4 rounded-xl border text-left transition-all group overflow-hidden flex flex-col justify-between h-48
                                        ${isOverPublicity 
                                            ? 'bg-stone-100 border-stone-200 opacity-60 cursor-not-allowed' 
                                            : 'bg-white border-stone-200 hover:border-blue-400 hover:shadow-md'
                                        }`}
                                >
                                    {isOverPublicity && (
                                        <div className="absolute inset-0 z-10 bg-white/50 flex items-center justify-center">
                                            <Lock className="w-8 h-8 text-stone-400" />
                                        </div>
                                    )}
                                    <div>
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="text-sm font-bold text-stone-800">{camp.name}</div>
                                            <div className="text-xs font-mono bg-stone-100 px-1.5 py-0.5 rounded text-stone-600">{camp.days}天</div>
                                        </div>
                                        <div className="text-[10px] text-stone-500 mb-3 leading-relaxed">{camp.desc}</div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex justify-between text-xs text-stone-600">
                                            <span>费用</span>
                                            <span className="font-mono text-red-500">-{formatMoney(camp.cost)}/天</span>
                                        </div>
                                        <div className="flex justify-between text-xs text-stone-600">
                                            <span>预计收益</span>
                                            <span className="font-mono text-emerald-600">{camp.gainMin}-{camp.gainMax}/天</span>
                                        </div>
                                    </div>
                                    <div className={`mt-3 w-full py-1.5 rounded text-center text-xs font-bold transition-colors ${isOverPublicity ? 'bg-stone-200 text-stone-400' : 'bg-stone-50 text-stone-600 group-hover:bg-blue-500 group-hover:text-white'}`}>
                                        开始宣传
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Ministry Publicity Section */}
                <div>
                    <h3 className="text-lg font-bold text-stone-800 mb-3 flex items-center gap-2">
                        <Landmark className="w-5 h-5 text-amber-500" /> 教育部公关
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button
                            onClick={() => onStartMinistry(MinistryPublicityType.RECOGNITION)}
                            disabled={isOverPublicity}
                            className={`p-5 rounded-xl border text-left transition-all flex items-start gap-4
                                ${isOverPublicity 
                                    ? 'bg-stone-100 border-stone-200 opacity-60 cursor-not-allowed' 
                                    : 'bg-white border-stone-200 hover:border-amber-400 hover:shadow-md'
                                }`}
                        >
                             <div className={`p-3 rounded-lg ${isOverPublicity ? 'bg-stone-200 text-stone-400' : 'bg-amber-100 text-amber-600'}`}>
                                 <TrendingUp className="w-6 h-6" />
                             </div>
                             <div className="flex-1">
                                 <h4 className="font-bold text-stone-800 mb-1">认可度宣传</h4>
                                 <p className="text-xs text-stone-500 mb-3">向教育部展示教学成果。根据教工满意度，一次性提升教育部评分。</p>
                                 <div className="flex items-center gap-3 text-xs">
                                     <span className="font-mono font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded">-5.0M</span>
                                     <span className="text-emerald-600 font-bold">收益: 10-50 评分</span>
                                 </div>
                             </div>
                        </button>

                        <div className="p-5 rounded-xl border border-stone-200 bg-stone-50 opacity-70 flex items-start gap-4 relative overflow-hidden">
                             <div className="absolute top-2 right-2 text-[10px] font-bold bg-stone-200 text-stone-500 px-2 py-0.5 rounded">开发中</div>
                             <div className="p-3 rounded-lg bg-stone-200 text-stone-400">
                                 <Landmark className="w-6 h-6" />
                             </div>
                             <div className="flex-1">
                                 <h4 className="font-bold text-stone-800 mb-1">联络宣传</h4>
                                 <p className="text-xs text-stone-500 mb-2">建立长期的教育部联络渠道。</p>
                                 <div className="flex items-center gap-3 text-xs">
                                     <span className="font-mono text-stone-400">???</span>
                                 </div>
                             </div>
                        </div>
                    </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div className="text-xs text-amber-800 leading-relaxed">
                        <span className="font-bold">警告：</span> 过度使用宣传手段会导致反效果。<br/>
                        - 频繁进行社会宣传会触发<span className="font-bold">「过度宣传」</span>，导致评分获取大幅降低。<br/>
                        - 教育部公关过于密切可能被视为<span className="font-bold">「背后交易」</span>，严重损害社会公信力。
                    </div>
                </div>

            </div>
        </div>
    );
};
