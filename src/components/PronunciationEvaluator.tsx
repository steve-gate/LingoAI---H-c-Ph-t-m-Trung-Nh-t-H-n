import React from 'react';
import { EvaluationResult, SyllableFeedback } from '../types';
import { 
  CheckCircle, AlertTriangle, HelpCircle, Sparkles, BookOpen, 
  Volume2, Activity, Timer, Award, Star, BarChart3 
} from 'lucide-react';
import { motion } from 'motion/react';
import { playNativeText } from '../utils/tts';

interface PronunciationEvaluatorProps {
  result: EvaluationResult;
  langCode: 'zh' | 'ja' | 'ko' | 'en';
}

export default function PronunciationEvaluator({ result, langCode }: PronunciationEvaluatorProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (score >= 50) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-rose-600 bg-rose-50 border-rose-200';
  };

  const getScoreRingColor = (score: number) => {
    if (score >= 80) return 'stroke-emerald-500';
    if (score >= 50) return 'stroke-amber-500';
    return 'stroke-rose-500';
  };

  const getScoreBgRingColor = (score: number) => {
    if (score >= 80) return 'stroke-emerald-100';
    if (score >= 50) return 'stroke-amber-100';
    return 'stroke-rose-100';
  };

  const getScoreTextColor = (score: number) => {
    if (score >= 80) return 'text-emerald-700';
    if (score >= 50) return 'text-amber-700';
    return 'text-rose-700';
  };

  // SVG parameters for overall score circle
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffsetValue = circumference - (result.overallScore / 100) * circumference;

  // ⭐ SUB-RENDERER: Forced Alignment
  const renderForcedAlignmentTimeline = (syllables: SyllableFeedback[]) => {
    if (!syllables || syllables.length === 0) return null;
    const startTimes = syllables.map(s => s.startTimeMs ?? 0);
    const endTimes = syllables.map(s => s.endTimeMs ?? 1000);
    const minTime = Math.min(...startTimes);
    const maxTime = Math.max(...endTimes);
    const totalDuration = maxTime - minTime || 1;

    return (
      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 mt-2">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-black text-slate-600 uppercase tracking-widest flex items-center gap-1.5">
            <Timer className="w-4 h-4 text-indigo-500" />
            Nhận diện đồng bộ thời gian (Forced Alignment)
          </span>
          <span className="text-[10px] font-mono bg-indigo-50 text-indigo-600 font-extrabold px-2 py-0.5 rounded-full">
            Nói trong: {(totalDuration / 1000).toFixed(2)}s
          </span>
        </div>

        <div className="relative h-14 bg-white border border-slate-100/70 rounded-xl p-1 select-none overflow-hidden">
          {syllables.map((s, idx) => {
            const sTime = s.startTimeMs ?? (idx * 300);
            const eTime = s.endTimeMs ?? ((idx + 1) * 300);
            const startPct = ((sTime - minTime) / totalDuration) * 100;
            const endPct = ((eTime - minTime) / totalDuration) * 100;
            const widthPct = Math.max(endPct - startPct, 12); // minimum clickable width

            const isGood = s.score >= 80;
            const isOk = s.score >= 50;
            const bgClass = isGood 
              ? 'bg-emerald-50 hover:bg-emerald-100/65 border-emerald-200 text-emerald-800' 
              : isOk 
                ? 'bg-amber-50 hover:bg-amber-100/65 border-amber-200 text-amber-800' 
                : 'bg-rose-50 hover:bg-rose-100/65 border-rose-200 text-rose-800';

            return (
              <a
                href={`#syl-detail-${idx}`}
                key={idx}
                style={{ left: `${Math.min(startPct, 88)}%`, width: `${Math.min(widthPct, 100)}%` }}
                className={`absolute top-1 bottom-1 rounded-lg border flex flex-col items-center justify-center p-0.5 text-center transition-all ${bgClass}`}
                title={`Âm tiết: ${s.syllable} phát âm từ ${sTime}ms đến ${eTime}ms (${s.score}đ)`}
              >
                <span className="text-xs font-extrabold truncate max-w-full leading-none">{s.syllable}</span>
                <span className="text-[7.5px] scale-90 font-mono font-medium opacity-80 leading-none mt-0.5">{sTime}ms</span>
              </a>
            );
          })}
        </div>
      </div>
    );
  };

  // ⭐ SUB-RENDERER: Phonemes breakups
  const renderPhonemes = (phonemes?: any[]) => {
    if (!phonemes || phonemes.length === 0) return null;
    return (
      <div className="flex flex-wrap gap-1 mt-2.5">
        <span className="text-[9.5px] text-slate-400 font-extrabold uppercase tracking-wider self-center mr-1">Ngữ âm đơn:</span>
        {phonemes.map((ph, pi) => {
          const isGood = ph.score >= 80;
          const isOk = ph.score >= 50;
          const colorClass = isGood 
            ? 'bg-emerald-500/10 text-emerald-700 border-emerald-200/50' 
            : isOk 
              ? 'bg-amber-500/10 text-amber-700 border-amber-200/50' 
              : 'bg-rose-500/10 text-rose-700 border-rose-200/50';

          return (
            <div 
              key={pi} 
              className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md border text-[10.5px] font-medium ${colorClass}`}
              title={`Ngữ âm ${ph.phoneme} đạt độ chính xác ${ph.score}%`}
            >
              <span className="font-extrabold font-mono text-[11px]">{ph.phoneme}</span>
              <span className="opacity-30">|</span>
              <span className="font-bold text-[9px]">{ph.score}</span>
              <span className="text-[8px] opacity-60 font-mono uppercase">({ph.type === 'consonant' ? 'phụ' : ph.type === 'vowel' ? 'nguyên' : ph.type})</span>
            </div>
          );
        })}
      </div>
    );
  };

  // ⭐ SUB-RENDERER: Chinese Tone comparative curved lines (Mandarin Tone Contour Chart)
  const renderChineseToneChart = (chineseTone: any) => {
    if (!chineseTone) return null;
    const { expectedTone, actualTone, contourExpected, contourActual, description } = chineseTone;

    // Highest height in tone coordinates is 5, Lowest is 1
    // scale coordinates nicely inside the 160x70 bounding box
    const mapY = (val: number) => 65 - (val / 5) * 50;

    // X coordinates spacing (10, 45, 80, 115, 150)
    const pointsExp = contourExpected.map((v: number, i: number) => `${15 + i * 32},${mapY(v)}`).join(' ');
    const pointsAct = contourActual.map((v: number, i: number) => `${15 + i * 32},${mapY(v)}`).join(' ');

    return (
      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3.5 mt-3 space-y-2.5">
        <div className="flex justify-between items-center">
          <span className="text-xs font-extrabold text-slate-700 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-indigo-500" />
            Đường cao độ thanh điệu (Tone Pitch Curve)
          </span>
          <div className="flex items-center gap-2.5 text-[9.5px]">
            <span className="flex items-center gap-1 text-slate-400 font-semibold">
              <span className="w-2.5 h-[1.5px] border-t-2 border-dashed border-indigo-400 inline-block" /> Thanh chuẩn {expectedTone}
            </span>
            <span className="flex items-center gap-1 text-emerald-600 font-bold">
              <span className="w-2.5 h-[2px] bg-emerald-500 inline-block" /> Bạn đọc (Thanh {actualTone})
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {/* Tone diagram */}
          <div className="w-full bg-white rounded-xl border border-slate-100 p-1 relative h-20 flex items-center justify-center">
            <div className="absolute left-1 top-0 bottom-0 flex flex-col justify-between text-[7px] text-slate-300 font-black py-0.5 pointer-events-none">
              <span>Độ 5 (Cao)</span>
              <span>Độ 3 (Vừa)</span>
              <span>Độ 1 (Thấp)</span>
            </div>

            <svg className="w-full h-full" viewBox="0 0 160 70">
              {/* grid dividers */}
              <line x1="5" y1="15" x2="155" y2="15" stroke="#f8fafc" strokeWidth="1" />
              <line x1="5" y1="35" x2="155" y2="35" stroke="#f8fafc" strokeWidth="1" />
              <line x1="5" y1="55" x2="155" y2="55" stroke="#f8fafc" strokeWidth="1" />

              {/* expected path */}
              <polyline
                fill="none"
                stroke="#6366f1"
                strokeWidth="1.5"
                strokeDasharray="3 2"
                points={pointsExp}
              />
              {/* user actual path */}
              <polyline
                fill="none"
                stroke="#10b981"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={pointsAct}
              />

              {/* points vectors */}
              {contourExpected.map((v: number, i: number) => (
                <circle key={`e-${i}`} cx={15 + i * 32} cy={mapY(v)} r="2" fill="#6366f1" />
              ))}
              {contourActual.map((v: number, i: number) => (
                <circle key={`a-${i}`} cx={15 + i * 32} cy={mapY(v)} r="2.5" fill="#10b981" />
              ))}
            </svg>
          </div>

          <div className="text-left bg-white p-2.5 rounded-xl border border-slate-100">
            <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block">Bình luận âm học</span>
            <p className="text-[11px] text-slate-600 leading-normal italic font-medium">
              &ldquo;{description}&rdquo;
            </p>
          </div>
        </div>
      </div>
    );
  };

  // ⭐ SUB-RENDERER: Japanese Tokyo Pitch Accent staircase graph
  const renderJapanesePitchAccent = (pitchAccent: any) => {
    if (!pitchAccent) return null;
    const { patternType, contourExpected, contourActual, description } = pitchAccent;

    return (
      <div className="bg-indigo-50/40 border border-indigo-100 rounded-2xl p-4 mt-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-black text-indigo-950 uppercase tracking-widest flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-indigo-600" />
            Nhạc điệu Cao độ Tokyo (Pitch Accent)
          </span>
          <span className="text-[10px] bg-indigo-100 text-indigo-700 font-extrabold px-2.5 py-0.5 rounded-full font-mono">
            Loại: {patternType}
          </span>
        </div>

        <p className="text-xs text-slate-600 mb-3.5 font-medium leading-relaxed">{description}</p>

        {/* Height ladder representations */}
        <div className="flex justify-center items-end gap-1.5 h-14 bg-white border border-indigo-100/50 rounded-xl p-2 relative overflow-hidden select-none">
          {contourExpected.map((level: 'H' | 'L', idx: number) => {
            const actLevel = contourActual?.[idx] || level;
            const isHigh = level === 'H';
            const isActHigh = actLevel === 'H';
            const holdsMath = level === actLevel;

            return (
              <div key={idx} className="flex-1 flex flex-col items-center max-w-[50px] relative">
                <div className="h-6 w-full relative flex items-center justify-center">
                  {/* Expected point connection indicator */}
                  <span className={`w-3 h-3 rounded-full z-10 ${
                    isHigh ? 'bg-indigo-600 border-2 border-white shadow-xs' : 'bg-slate-300 border-2 border-white'
                  }`} style={{ transform: isHigh ? 'translateY(-6px)' : 'translateY(6px)' }} />

                  {/* actual if failed */}
                  {!holdsMath && (
                    <span className="w-2.5 h-2.5 rounded-full absolute z-20 bg-rose-500 border border-white"
                      style={{ transform: isActHigh ? 'translateY(-6px)' : 'translateY(6px)' }}
                      title="Cao độ thực tế lệch!"
                    />
                  )}

                  {/* center line */}
                  <div className="absolute w-full h-[1px] bg-slate-100 top-1/2" />
                </div>
                <span className={`text-[9px] font-bold mt-1 uppercase ${isHigh ? 'text-indigo-600 font-black' : 'text-slate-400'}`}>
                  {level}
                </span>
              </div>
            );
          })}
        </div>

        <div className="flex justify-center gap-4 text-[9.5px] text-slate-400 mt-2 font-semibold">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-indigo-600" /> Trọng âm chuẩn</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500" /> Bạn đọc lệch</span>
        </div>
      </div>
    );
  };

  return (
    <div id="evaluation-result-panel" className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden p-6 md:p-8 space-y-7">
      
      {/* 0. ⭐ GAMIFICATION REWARDS NOTIFICATION (XP Banners/Achievements) */}
      <div className="flex flex-col gap-2">
        {result.xpEarned > 0 && (
          <div className="bg-gradient-to-r from-indigo-500 to-violet-500 rounded-2xl p-4 text-white text-left flex justify-between items-center shadow-lg shadow-indigo-100 animate-fadeIn">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex flex-col items-center justify-center text-lg animate-pulse">
                ⚡
              </div>
              <div>
                <span className="text-[10px] text-indigo-200 uppercase font-bold tracking-widest block leading-none">Hoàn thành thử thách giọng</span>
                <span className="text-sm font-black tracking-tight">Cộng thưởng +{result.xpEarned} điểm kinh nghiệm!</span>
              </div>
            </div>
            <span className="text-xs bg-white text-indigo-700 font-mono font-black px-2.5 py-1 rounded-full shadow-xs">
              +{result.xpEarned} XP
            </span>
          </div>
        )}

        {result.achievementsAwarded && result.achievementsAwarded.length > 0 && (
          <div className="bg-gradient-to-r from-amber-500/10 via-yellow-500/5 to-transparent border border-amber-500/20 rounded-2xl p-3 flex gap-3 items-center mt-1 animate-bounce-subtle">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-lg shadow-sm shrink-0">
              {result.achievementsAwarded[0].icon || '🏆'}
            </div>
            <div className="text-left">
              <span className="text-[9.5px] text-amber-600 font-extrabold uppercase tracking-widest block">Mở khoá huy chương danh dự</span>
              <span className="text-xs font-black text-amber-950 block leading-tight">{result.achievementsAwarded[0].title}</span>
              <span className="text-[11px] text-slate-500 leading-snug">{result.achievementsAwarded[0].description}</span>
            </div>
          </div>
        )}
      </div>

      {/* 1. Upper overall score board */}
      <div className="flex flex-col items-center gap-6 border-b border-slate-100 pb-7 w-full animate-fadeIn">
        
        {/* Circle metric */}
        <div className="flex flex-col items-center justify-center">
          <div className="relative w-32 h-32 flex items-center justify-center">
            <svg viewBox="0 0 128 128" className="w-full h-full transform -rotate-90">
              {/* Background circle */}
              <circle
                cx="64"
                cy="64"
                r={radius}
                strokeWidth={8}
                className={`fill-transparent ${getScoreBgRingColor(result.overallScore)}`}
              />
              {/* Foreground circle with animation */}
              <motion.circle
                cx="64"
                cy="64"
                r={radius}
                strokeWidth={8}
                strokeLinecap="round"
                className={`fill-transparent ${getScoreRingColor(result.overallScore)}`}
                style={{ strokeDasharray: circumference }}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: strokeDashoffsetValue }}
                transition={{ duration: 1.2, ease: "easeOut" }}
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className={`text-4.5xl font-extrabold font-mono leading-none ${getScoreTextColor(result.overallScore)}`}>
                {result.overallScore}
              </span>
              <span className="text-[9px] text-slate-400 uppercase font-black tracking-widest mt-1">Điểm Tổng</span>
            </div>
          </div>
          <span className="mt-3 text-sm font-extrabold text-slate-800">
            {result.overallScore >= 80 ? 'Xuất Sắc! 🎉' : result.overallScore >= 50 ? 'Khá Tốt! 👍' : 'Cần Cố Gắng! 💪'}
          </span>
        </div>

        {/* Categories split metrics */}
        <div className="w-full space-y-3.5 text-left">
          <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1 px-1 flex items-center gap-1">
            <BarChart3 className="w-3.5 h-3.5 text-indigo-500" /> Tiêu chí phân loại
          </h4>
          
          {/* Accuracy progress bar */}
          <div className="bg-slate-50/50 p-2.5 rounded-xl border border-slate-100">
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="font-bold text-slate-700">Độ chuẩn âm sắc (Accuracy)</span>
              <span className="font-bold font-mono text-slate-800">{result.accuracyScore}%</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-emerald-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${result.accuracyScore}%` }}
                transition={{ duration: 1, delay: 0.1 }}
              />
            </div>
          </div>

          {/* Intonation progress bar */}
          <div className="bg-slate-50/50 p-2.5 rounded-xl border border-slate-100">
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="font-bold text-slate-700">Ngữ điệu & Thanh điệu (Intonation/Tone)</span>
              <span className="font-bold font-mono text-slate-800">{result.intonationScore}%</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-indigo-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${result.intonationScore}%` }}
                transition={{ duration: 1, delay: 0.2 }}
              />
            </div>
          </div>

          {/* Fluency progress bar */}
          <div className="bg-slate-50/50 p-2.5 rounded-xl border border-slate-100">
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="font-bold text-slate-700">Độ trôi chảy & Tốc bổng (Fluency)</span>
              <span className="font-bold font-mono text-slate-800">{result.fluencyScore}%</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-cyan-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${result.fluencyScore}%` }}
                transition={{ duration: 1, delay: 0.3 }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. AI general coach feedback phrase */}
      <div className="bg-indigo-50/40 rounded-2xl p-4 md:p-5 border border-indigo-100/35 text-left flex gap-3">
        <Sparkles className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
        <div>
          <h5 className="text-xs font-black text-indigo-950 uppercase tracking-widest mb-1">Huấn luyện viên AI nhận xét</h5>
          <p className="text-xs md:text-sm text-slate-700 leading-relaxed font-medium">{result.feedback}</p>
        </div>
      </div>

      {/* 3. Pitch Accent layout above syllabus cards if ja */}
      {langCode === 'ja' && result.japanesePitchAccent && (
        renderJapanesePitchAccent(result.japanesePitchAccent)
      )}

      {/* 4. ⭐ TIMELINE FORCED ALIGNMENT METRIC */}
      {renderForcedAlignmentTimeline(result.syllableFeedback)}

      {/* 5. Syllable-by-syllable interactive breakdown - Core ELSA engine */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 text-left">
            <BookOpen className="w-4 h-4 text-indigo-500" />
            Chi tiết âm vị & âm tiết
          </h4>
          <span className="text-[10px] text-slate-400 font-medium">Nhấp xem trực chỉ mẹo khẩu hình</span>
        </div>

        {/* Giant native text letters with score background indicators */}
        <div className="flex flex-wrap gap-x-5 gap-y-3 items-center justify-center bg-slate-50 border border-slate-100 p-5 rounded-2xl">
          {result.syllableFeedback.map((syllable, idx) => {
            const isGood = syllable.score >= 80;
            const isOk = syllable.score >= 50;
            const textClass = isGood 
              ? 'text-emerald-700 hover:scale-105' 
              : isOk 
                ? 'text-amber-600 hover:scale-105' 
                : 'text-rose-600 hover:scale-105 font-semibold';

            return (
              <a 
                href={`#syl-detail-${idx}`}
                key={idx}
                className="flex flex-col items-center transition-all p-1.5 rounded-xl cursor-pointer group focus:outline-none"
                title={`Bấm xem nhận xét chi tiết âm tiết ${syllable.syllable}`}
              >
                <span className={`text-4xl md:text-5xl font-extrabold tracking-wide transition-all ${textClass}`}>
                  {syllable.syllable}
                </span>
                <span className="text-[11px] mt-1 font-mono text-slate-400 group-hover:text-slate-800 tracking-wider">
                  {syllable.phonetic}
                </span>
                <span className={`text-[9px] font-mono font-bold mt-1 px-1.5 py-0.2 rounded-full border ${
                  isGood ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : isOk ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-rose-50 text-rose-700 border-rose-100'
                }`}>
                  {syllable.score}đ
                </span>
              </a>
            );
          })}
        </div>

        {/* Individual syllabic details, phonemes list, and tone curves */}
        <div className="space-y-3.5">
          {result.syllableFeedback.map((s, idx) => {
            const isGood = s.score >= 80;
            const isOk = s.score >= 50;
            const borderStyle = isGood 
              ? 'border-emerald-100 bg-emerald-50/5' 
              : isOk 
                ? 'border-amber-100 bg-amber-50/5' 
                : 'border-rose-100 bg-rose-50/5';

            const bulletColor = isGood ? 'bg-emerald-500 animate-pulse' : isOk ? 'bg-amber-500' : 'bg-rose-500';

            return (
              <div 
                id={`syl-detail-${idx}`}
                key={idx}
                className={`flex flex-col rounded-2xl border p-4 sm:p-5 transition-all text-left ${borderStyle}`}
              >
                <div className="flex flex-wrap items-center justify-between gap-3 mb-2.5">
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${bulletColor}`} />
                    <span className="text-xl font-bold text-slate-900">{s.syllable}</span>
                    <span className="text-xs font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                      {s.phonetic}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
                      {s.startTimeMs}ms - {s.endTimeMs}ms
                    </span>
                  </div>

                  <span className={`text-xs font-mono font-bold px-3 py-0.5 rounded-full border ${getScoreColor(s.score)}`}>
                    {s.score} điểm
                  </span>
                </div>

                {/* Issue and Solution Tips */}
                <div className="space-y-2">
                  {s.issue ? (
                    <div className="flex items-start gap-1.5">
                      <span className="font-extrabold text-rose-600 shrink-0 text-xs mt-0.5">Nhận khiếm khuyết:</span>
                      <span className="text-slate-600 text-xs leading-normal">{s.issue}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-emerald-700 text-xs font-medium">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>Chuẩn âm sắc và trường độ tuyệt hảo!</span>
                    </div>
                  )}

                  {s.correction && (
                    <div className="bg-white border border-slate-100/80 p-3 rounded-xl">
                      <span className="font-bold text-indigo-600 text-[10px] uppercase tracking-wider block mb-0.5">Chỉ định cải thiện:</span>
                      <p className="text-slate-700 text-xs leading-relaxed font-normal">{s.correction}</p>
                    </div>
                  )}

                  {/* ⭐ RENDER PHONEMES BLOCK */}
                  {renderPhonemes(s.phonemes)}

                  {/* ⭐ RENDER CHINESE TONE INDIVIDUAL GRAPH */}
                  {langCode === 'zh' && s.chineseTone && (
                    renderChineseToneChart(s.chineseTone)
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 6. Practical Action Tips summary */}
      <div className="border-t border-slate-100 pt-5 text-left">
        <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
          <Volume2 className="w-4 h-4 text-indigo-600" />
          Kế hoạch luyện tập nâng cao từ AI
        </h4>
        <div className="text-xs md:text-sm text-slate-600 leading-relaxed bg-[#F8FAFC] rounded-2xl p-4 border border-slate-100 font-medium">
          {result.improvedTips}
        </div>
      </div>

    </div>
  );
}
