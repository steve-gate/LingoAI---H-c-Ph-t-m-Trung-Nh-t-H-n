import React from 'react';
import { Award, Trophy, Zap, CheckCircle2, Lock, Sparkles, ChevronRight } from 'lucide-react';
import { UserStats, DailyQuest } from '../types';

interface GamificationDashboardProps {
  stats: UserStats;
}

export default function GamificationDashboard({ stats }: GamificationDashboardProps) {
  // Ensure default stats fallback values to guarantee robustness
  const xp = stats.xp ?? 0;
  const level = stats.level ?? 1;
  const badges = stats.badges ?? [];
  const quests = stats.dailyQuests ?? [];

  // Calculate percentage of progression to next level (200 XP per level-up)
  const currentLevelXp = xp % 200;
  const xpPercentage = Math.min((currentLevelXp / 200) * 100, 100);

  // Badge configuration mappings for gold, silver, bronze gradient looks
  const getBadgeStyle = (badgeName: string) => {
    if (badgeName.includes('Vua') || badgeName.includes('Sứ giả') || badgeName.includes('Thần')) {
      return {
        bg: 'from-amber-400 to-yellow-600 text-white shadow-amber-100',
        iconColor: 'text-amber-200',
        border: 'border-amber-300'
      };
    }
    if (badgeName.includes('Tân binh') || badgeName.includes('Học giả')) {
      return {
        bg: 'from-indigo-400 to-blue-600 text-white shadow-indigo-100',
        iconColor: 'text-indigo-200',
        border: 'border-indigo-300'
      };
    }
    return {
      bg: 'from-slate-400 to-slate-600 text-white shadow-slate-100',
      iconColor: 'text-slate-200',
      border: 'border-slate-300'
    };
  };

  return (
    <div id="gamification-stats-card" className="bg-white border border-slate-100 rounded-3xl p-5 shadow-xs space-y-5">
      {/* 1. Header showing Level Emblem */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500 text-white flex items-center justify-center font-black text-lg shadow-md shadow-indigo-100 relative overflow-hidden group">
            <span className="z-10">{level}</span>
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600 to-violet-400 opacity-60" />
            <span className="absolute -bottom-1 -right-1 opacity-20"><Zap className="w-6 h-6 fill-white" /></span>
          </div>
          <div className="text-left">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest block">Đẳng cấp học viên</span>
            <span className="text-sm font-extrabold text-slate-800">
              {level <= 1 ? 'Giọng ải Sơ Cấp 🎓' : level <= 3 ? 'Bậc Thầy Ngữ Điệu 🎤' : 'Huyền Thoại Đông Á 🌟'}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1 text-xs text-indigo-600 font-extrabold bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100/40 font-mono">
          <Zap className="w-3.5 h-3.5 fill-indigo-500 text-indigo-500" />
          <span>{xp} XP</span>
        </div>
      </div>

      {/* 2. XP Progress Bar slider */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center text-xs">
          <span className="text-slate-400 font-semibold uppercase tracking-wider text-[9px]">Điểm kinh nghiệm cấp</span>
          <span className="font-bold font-mono text-slate-700">{currentLevelXp} / 200 XP</span>
        </div>
        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-50 relative">
          <div 
            className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-700 ease-out shadow-xs flex items-center justify-end pr-1.5"
            style={{ width: `${xpPercentage}%` }}
          >
            {xpPercentage >= 20 && <div className="w-1 h-1 bg-white rounded-full animate-ping" />}
          </div>
        </div>
      </div>

      {/* 3. Daily Quests Log Checklist */}
      <div className="space-y-2.5 border-t border-slate-100/80 pt-4">
        <div className="flex items-center justify-between pb-1">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
            <Trophy className="w-3.5 h-3.5 text-amber-500" /> Nhiệm vụ hàng ngày
          </span>
          <span className="text-[10px] font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
            {quests.filter(q => q.done).length}/{quests.length} Đạt
          </span>
        </div>

        <div className="space-y-1.5">
          {quests.map((quest) => {
            const isDone = quest.done;
            return (
              <div 
                key={quest.id}
                className={`flex items-start justify-between gap-3 p-2.5 rounded-xl border text-left transition-all ${
                  isDone 
                    ? 'bg-emerald-50/20 border-emerald-100/80 text-slate-500' 
                    : 'bg-white hover:bg-slate-50/50 border-slate-100 text-slate-700'
                }`}
              >
                <div className="flex gap-2.5 items-start min-w-0">
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-slate-200 mt-0.5 shrink-0 flex items-center justify-center bg-slate-50" />
                  )}
                  <div className="min-w-0">
                    <p className={`text-xs font-bold leading-snug ${isDone ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                      {quest.description}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5 text-[9px] text-slate-400 font-mono">
                      <span>Tiến trình: {quest.progress}/{quest.target}</span>
                    </div>
                  </div>
                </div>
                <span className={`text-[10px] font-bold font-mono px-1.5 py-0.5 rounded-md flex items-center gap-0.5 shrink-0 select-none ${
                  isDone ? 'bg-slate-100 text-slate-400' : 'bg-amber-50 text-amber-700 border border-amber-100/50'
                }`}>
                  +{quest.rewardXp}XP
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Badges unlocked container */}
      <div className="space-y-2 border-t border-slate-100/80 pt-4">
        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1 text-left">
          <Award className="w-3.5 h-3.5 text-indigo-500" /> Huy chương học giả
        </span>

        {badges.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-4 border border-dashed border-slate-200 bg-slate-50/50 rounded-xl text-center space-y-1">
            <Lock className="w-4 h-4 text-slate-300" />
            <span className="text-[10px] text-slate-400 font-medium">Chưa mở khoá huy chương nào</span>
          </div>
        ) : (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {badges.map((badge, idx) => {
              const style = getBadgeStyle(badge);
              return (
                <div 
                  key={idx}
                  title="Danh hiệu phát âm danh giá của bạn"
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-gradient-to-r ${style.bg} border ${style.border} shadow-sm transform hover:scale-105 active:scale-95 transition-all outline-none select-none`}
                >
                  <Sparkles className={`w-3 h-3 ${style.iconColor} fill-current`} />
                  <span>{badge}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
