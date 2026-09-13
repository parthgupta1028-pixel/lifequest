import React, { useState, useEffect } from 'react';
import { achievementsAPI } from '../services/api';
import { 
  Trophy, 
  Lock, 
  CheckCircle2, 
  Sparkles, 
  Zap, 
  Flame, 
  Shield, 
  BookOpen, 
  Code 
} from 'lucide-react';

const ICON_MAP = {
  shield: Shield,
  award: Trophy,
  flame: Flame,
  code: Code,
  'book-open': BookOpen,
  crown: Trophy,
  zap: Zap,
};

const AchievementsPage = () => {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAchievements();
  }, []);

  const loadAchievements = async () => {
    try {
      setLoading(true);
      const res = await achievementsAPI.getAchievements();
      setAchievements(res.data);
    } catch (err) {
      console.error('Failed to load achievements:', err);
    } finally {
      setLoading(false);
    }
  };

  const unlockedCount = achievements.filter((a) => a.is_unlocked).length;

  return (
    <div className="space-y-6 pb-16 md:pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black font-display text-white flex items-center gap-2">
            <Trophy className="w-6 h-6 text-amber-400" />
            Trophy Hall & Accolades
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Historic milestones and honorary badges earned through consistency and grit
          </p>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 bg-quest-950 border border-quest-800 rounded-2xl text-xs font-bold self-start sm:self-auto">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span className="text-slate-300">
            Unlocked: <strong className="text-amber-400">{unlockedCount}</strong> / {achievements.length}
          </span>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-cyan-400 text-xs font-bold animate-pulse">
          Opening Vault of Accolades...
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map((ach) => {
            const Icon = ICON_MAP[ach.icon] || Trophy;
            const isUnlocked = ach.is_unlocked;

            return (
              <div
                key={ach.id}
                className={`quest-card p-5 flex flex-col justify-between transition-all duration-300 relative overflow-hidden ${
                  isUnlocked
                    ? 'border-amber-400/60 bg-gradient-to-br from-quest-900 to-amber-950/30 shadow-glow-gold'
                    : 'opacity-60 border-quest-850 bg-quest-950/70'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-md ${
                        isUnlocked
                          ? 'bg-gradient-to-br from-amber-400 to-yellow-600 text-slate-950 border border-amber-300'
                          : 'bg-quest-900 border border-quest-800 text-slate-500'
                      }`}
                    >
                      {isUnlocked ? <Icon className="w-6 h-6" /> : <Lock className="w-5 h-5" />}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-black">
                        +{ach.xp_bonus} XP
                      </span>
                    </div>
                  </div>

                  <h4 className="text-base font-bold font-display text-white mb-1">
                    {ach.title}
                  </h4>
                  <p className="text-xs text-slate-400 mb-4 line-clamp-2">
                    {ach.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-quest-800 flex items-center justify-between text-xs">
                  {isUnlocked ? (
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Unlocked{' '}
                      {ach.unlocked_at &&
                        new Date(ach.unlocked_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                    </span>
                  ) : (
                    <span className="text-slate-500 font-medium">
                      Target: {ach.requirement_value}{' '}
                      {ach.requirement_type.replace('_', ' ')}
                    </span>
                  )}

                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                    {ach.category}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AchievementsPage;
