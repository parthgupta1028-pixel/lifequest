import React, { useState, useEffect } from 'react';
import { analyticsAPI } from '../services/api';
import ProductivityHeatmap from '../components/analytics/ProductivityHeatmap';
import { 
  DailyAnalyticsView, 
  WeeklyAnalyticsView, 
  MonthlyAnalyticsView 
} from '../components/analytics/AnalyticsViews';
import { BarChart3, Calendar, TrendingUp, Sparkles } from 'lucide-react';

const AnalyticsPage = () => {
  const [activeTab, setActiveTab] = useState('HEATMAP'); // HEATMAP, DAILY, WEEKLY, MONTHLY
  const [heatmapData, setHeatmapData] = useState([]);
  const [dailyData, setDailyData] = useState(null);
  const [weeklyData, setWeeklyData] = useState(null);
  const [monthlyData, setMonthlyData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAllAnalytics();
  }, []);

  const loadAllAnalytics = async () => {
    try {
      setLoading(true);
      const [hmRes, dRes, wRes, mRes] = await Promise.all([
        analyticsAPI.getHeatmap(),
        analyticsAPI.getDaily(),
        analyticsAPI.getWeekly(),
        analyticsAPI.getMonthly(),
      ]);
      setHeatmapData(hmRes.data);
      setDailyData(dRes.data);
      setWeeklyData(wRes.data);
      setMonthlyData(mRes.data);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-16 md:pb-8">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black font-display text-white">
            Productivity Analytics & Telemetry
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Track historical XP velocity, consistency heatmaps, and time allocation
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex bg-quest-950 p-1 rounded-2xl border border-quest-800 text-xs font-bold self-start sm:self-auto">
          {[
            { id: 'HEATMAP', label: 'Heatmap' },
            { id: 'DAILY', label: 'Daily' },
            { id: 'WEEKLY', label: 'Weekly' },
            { id: 'MONTHLY', label: 'Monthly' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl transition ${
                activeTab === tab.id
                  ? 'bg-cyan-500 text-slate-950 font-black shadow-glow-cyan'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-cyan-400 text-xs font-bold animate-pulse flex items-center justify-center gap-2">
          <Sparkles className="w-5 h-5 animate-spin" />
          <span>Computing Character Telemetry...</span>
        </div>
      ) : (
        <div>
          {activeTab === 'HEATMAP' && (
            <div className="space-y-6">
              <ProductivityHeatmap heatmapData={heatmapData} />
              <WeeklyAnalyticsView weeklyData={weeklyData} />
            </div>
          )}
          {activeTab === 'DAILY' && <DailyAnalyticsView dailyData={dailyData} />}
          {activeTab === 'WEEKLY' && <WeeklyAnalyticsView weeklyData={weeklyData} />}
          {activeTab === 'MONTHLY' && <MonthlyAnalyticsView monthlyData={monthlyData} />}
        </div>
      )}
    </div>
  );
};

export default AnalyticsPage;
