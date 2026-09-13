import React, { useState } from 'react';
import { Compass, CheckCircle2, Circle, Gift, Sparkles } from 'lucide-react';
import { missionsAPI } from '../../services/api';
import { useGame } from '../../context/GameContext';
import { useAuth } from '../../context/AuthContext';

const DailyMissionCard = ({ mission, onMissionClaimed }) => {
  const { triggerLevelUp } = useGame();
  const { refreshUser } = useAuth();
  const [claiming, setClaiming] = useState(false);

  if (!mission) return null;

  const items = mission.items || [];
  const completedItemsCount = items.filter((i) => i.completed).length;
  const isAllCompleted = items.length > 0 && completedItemsCount === items.length;
  const isClaimed = mission.is_claimed;

  const handleClaim = async () => {
    try {
      setClaiming(true);
      const res = await missionsAPI.claimReward();
      if (res.data.success) {
        if (res.data.did_level_up) {
          triggerLevelUp({
            new_level: res.data.level,
            previous_level: res.data.level - 1,
            new_total_xp: res.data.new_total_xp,
          });
        }
        await refreshUser();
        if (onMissionClaimed) onMissionClaimed();
      }
    } catch (err) {
      console.error('Failed to claim mission reward:', err);
    } finally {
      setClaiming(false);
    }
  };

  return (
    <div className="quest-card p-6 flex flex-col justify-between border-quest-800">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold font-display text-white">
                Daily Mission Expedition
              </h3>
              <span className="text-[11px] text-slate-400">
                {completedItemsCount}/{items.length} Objectives Cleared
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-black">
            <Sparkles className="w-3.5 h-3.5 fill-current" />
            +{mission.xp_reward} XP Bounty
          </div>
        </div>

        {/* Objectives list */}
        <div className="space-y-2.5 my-3">
          {items.map((item, idx) => (
            <div
              key={idx}
              className={`p-2.5 rounded-xl border flex items-center gap-3 transition ${
                item.completed
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                  : 'bg-quest-950/60 border-quest-850 text-slate-300'
              }`}
            >
              {item.completed ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 fill-emerald-500/20" />
              ) : (
                <Circle className="w-4 h-4 text-slate-500 shrink-0" />
              )}
              <span className={`text-xs font-medium ${item.completed ? 'line-through text-slate-400' : ''}`}>
                {item.text}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Claim Reward Button */}
      <div className="pt-3 border-t border-quest-800">
        {isClaimed ? (
          <div className="py-2.5 text-center text-xs font-bold text-slate-400 bg-quest-950/40 rounded-xl border border-quest-850">
            ✓ Bounty Claimed (+{mission.xp_reward} XP)
          </div>
        ) : (
          <button
            onClick={handleClaim}
            disabled={!isAllCompleted || claiming}
            className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold font-display uppercase tracking-wider flex items-center justify-center gap-2 transition ${
              isAllCompleted
                ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 shadow-glow-gold hover:from-amber-300 hover:to-yellow-400'
                : 'bg-quest-850 text-slate-500 border border-quest-800 cursor-not-allowed'
            }`}
          >
            <Gift className="w-4 h-4" />
            <span>
              {isAllCompleted ? `Claim +${mission.xp_reward} XP Mission Bounty` : 'Complete All Objectives to Unlock Bounty'}
            </span>
          </button>
        )}
      </div>
    </div>
  );
};

export default DailyMissionCard;
