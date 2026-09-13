import React, { useState, useEffect } from 'react';
import { skillsAPI } from '../services/api';
import SkillHexagonRadar from '../components/dashboard/SkillHexagonRadar';
import SkillModal, { AVAILABLE_ICONS } from '../components/skills/SkillModal';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Hexagon, 
  Zap, 
  Power, 
  CheckCircle2, 
  AlertCircle,
  Sparkles
} from 'lucide-react';

const SkillsPage = () => {
  const [radarData, setRadarData] = useState([]);
  const [skillsDetail, setSkillsDetail] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [skillToEdit, setSkillToEdit] = useState(null);
  const [actionMessage, setActionMessage] = useState('');

  useEffect(() => {
    loadSkills();
  }, []);

  const loadSkills = async () => {
    try {
      setLoading(true);
      const [radarRes, detailRes] = await Promise.all([
        skillsAPI.getRadarData(),
        skillsAPI.getSkillsDetail(),
      ]);
      setRadarData(radarRes.data);
      setSkillsDetail(detailRes.data);
    } catch (err) {
      console.error('Failed to load skills:', err);
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (msg) => {
    setActionMessage(msg);
    setTimeout(() => setActionMessage(''), 3500);
  };

  const handleOpenAddModal = () => {
    setSkillToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (skill) => {
    setSkillToEdit(skill);
    setIsModalOpen(true);
  };

  const handleSaveSkill = async (payload) => {
    try {
      if (skillToEdit) {
        await skillsAPI.updateSkill(skillToEdit.skill_id, payload);
        showNotification(`Skill '${payload.name}' updated successfully!`);
      } else {
        await skillsAPI.createSkill(payload);
        showNotification(`Skill '${payload.name}' forged successfully!`);
      }
      loadSkills();
    } catch (err) {
      console.error('Failed to save skill:', err);
      alert(err.response?.data?.detail || 'Failed to save skill');
    }
  };

  const handleToggleActive = async (skill) => {
    try {
      await skillsAPI.toggleSkillActive(skill.skill_id);
      showNotification(`Skill '${skill.name}' is now ${skill.is_active ? 'Inactive' : 'Active'}!`);
      loadSkills();
    } catch (err) {
      console.error('Failed to toggle skill active:', err);
    }
  };

  const handleDeleteSkill = async (skill) => {
    const confirmMsg = `Are you sure you want to delete '${skill.name}'?\n\nNote: All past completed tasks, XP rewards, and level history will be permanently preserved.`;
    if (!window.confirm(confirmMsg)) return;

    try {
      await skillsAPI.deleteSkill(skill.skill_id);
      showNotification(`Skill '${skill.name}' deleted. Historical data preserved.`);
      loadSkills();
    } catch (err) {
      console.error('Failed to delete skill:', err);
      alert(err.response?.data?.detail || 'Failed to delete skill');
    }
  };

  const getSkillIcon = (iconName) => {
    const found = AVAILABLE_ICONS.find((i) => i.id === iconName);
    return found ? found.icon : Zap;
  };

  const activeSkillsCount = skillsDetail.filter((s) => s.is_active).length;
  const inactiveSkillsCount = skillsDetail.filter((s) => !s.is_active).length;

  return (
    <div className="space-y-6 pb-16 md:pb-8">
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black font-display text-slate-900 dark:text-white flex items-center gap-2">
            <Hexagon className="w-6 h-6 text-purple-500 dark:text-purple-400" />
            Character Skills & Dynamic Polygon
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Customize, activate, or forge productivity attributes. Shape dynamically adapts to your active skills!
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-display font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition shrink-0"
        >
          <Plus className="w-4 h-4" /> Add Custom Skill
        </button>
      </div>

      {/* Action Notification Banner */}
      {actionMessage && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs rounded-xl flex items-center gap-2 font-semibold animate-pulse">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {loading ? (
        <div className="text-center py-20 text-cyan-500 dark:text-cyan-400 text-xs font-bold animate-pulse">
          Calibrating Character Polygon Matrix...
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Dynamic Polygon Radar Card (1 Col) */}
          <div className="lg:col-span-1 space-y-4">
            <SkillHexagonRadar radarData={radarData} />

            {/* Quick Stats Summary */}
            <div className="quest-card p-4 flex items-center justify-around text-center">
              <div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">
                  Total Skills
                </span>
                <span className="text-lg font-black font-display text-slate-900 dark:text-white">
                  {skillsDetail.length}
                </span>
              </div>
              <div className="h-8 w-px bg-slate-200 dark:bg-quest-800" />
              <div>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 block font-medium">
                  Active (Polygon)
                </span>
                <span className="text-lg font-black font-display text-emerald-600 dark:text-emerald-400">
                  {activeSkillsCount}
                </span>
              </div>
              <div className="h-8 w-px bg-slate-200 dark:bg-quest-800" />
              <div>
                <span className="text-[11px] text-slate-400 block font-medium">
                  Inactive
                </span>
                <span className="text-lg font-black font-display text-slate-400">
                  {inactiveSkillsCount}
                </span>
              </div>
            </div>
          </div>

          {/* Individual Skills Management Grid (2 Cols) */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {skillsDetail.map((skill) => {
                const IconComponent = getSkillIcon(skill.icon);
                return (
                  <div
                    key={skill.id}
                    className={`quest-card p-5 flex flex-col justify-between transition ${
                      !skill.is_active ? 'opacity-70 bg-slate-100/60 dark:bg-quest-950/40' : ''
                    }`}
                  >
                    <div>
                      {/* Top Row: Icon, Name, Level, Active Toggle */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-md"
                            style={{
                              backgroundColor: `${skill.color}20`,
                              color: skill.color,
                              border: `1px solid ${skill.color}40`,
                            }}
                          >
                            <IconComponent className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-base font-bold font-display text-slate-900 dark:text-white">
                                {skill.name}
                              </h4>
                              {!skill.is_active && (
                                <span className="text-[9px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded bg-slate-200 dark:bg-quest-800 text-slate-500">
                                  Inactive
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                              Attribute
                            </span>
                          </div>
                        </div>

                        {/* Level Badge */}
                        <div 
                          className="px-2.5 py-1 rounded-xl text-xs font-black font-display shadow-sm"
                          style={{
                            backgroundColor: `${skill.color}15`,
                            color: skill.color,
                            border: `1px solid ${skill.color}50`,
                          }}
                        >
                          LVL {skill.level}
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 line-clamp-2 min-h-[32px]">
                        {skill.description || 'Custom attribute configured for personal quests and bounties.'}
                      </p>
                    </div>

                    {/* XP Progress to next level */}
                    <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-quest-800">
                      <div>
                        <div className="flex items-center justify-between text-xs font-semibold mb-1">
                          <span className="text-slate-500 dark:text-slate-400">XP Progress</span>
                          <span className="text-slate-700 dark:text-slate-200">
                            {skill.current_level_xp} / {skill.next_level_xp} XP ({skill.progress_percentage}%)
                          </span>
                        </div>

                        <div className="w-full h-2 bg-slate-200 dark:bg-quest-950 rounded-full overflow-hidden border border-slate-300 dark:border-quest-850">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${Math.max(5, skill.progress_percentage)}%`,
                              backgroundColor: skill.color,
                            }}
                          />
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                          <span>Total: {skill.xp.toLocaleString()} XP</span>
                          <span>Next Rank: Level {skill.level + 1}</span>
                        </div>
                      </div>

                      {/* Action buttons: Edit, Toggle Active, Delete */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-quest-850">
                        {/* Toggle Active switch */}
                        <button
                          onClick={() => handleToggleActive(skill)}
                          title={skill.is_active ? 'Deactivate (hide from radar polygon)' : 'Activate (include in radar polygon)'}
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                            skill.is_active
                              ? 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10'
                              : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                          }`}
                        >
                          <Power className="w-3.5 h-3.5" />
                          <span className="text-[11px]">{skill.is_active ? 'Active' : 'Inactive'}</span>
                        </button>

                        <div className="flex items-center gap-1">
                          {/* Edit */}
                          <button
                            onClick={() => handleOpenEditModal(skill)}
                            title="Edit Skill Name, Color & Icon"
                            className="p-1.5 text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 rounded-lg hover:bg-slate-100 dark:hover:bg-quest-800 transition"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => handleDeleteSkill(skill)}
                            title="Delete Skill (Past task XP remains safe)"
                            className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-500/10 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Skill Modal */}
      <SkillModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveSkill}
        skillToEdit={skillToEdit}
      />
    </div>
  );
};

export default SkillsPage;
