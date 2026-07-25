'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useDashboardSettings } from '@/context/DashboardSettingsContext';
import { motion } from 'framer-motion';
import { GraduationCap, ToggleLeft, ToggleRight, Check, Plus, Trash2, Users, Settings, Play, Eye, X } from 'lucide-react';
import { createClassroom, getClassroomRoster, updateClassroomSettings } from '@/app/actions/edu';
import { ClassroomSettings } from '@/types/education';

export default function TeacherDashboard() {
  const { user } = useAuth();
  const { role, classId, classCode, className: dbClassName, settings, teacherPreviewMode, setTeacherPreviewMode } = useDashboardSettings();

  // Classroom creation state
  const [newClassName, setNewClassName] = useState('');
  const [createLoading, setCreateLoading] = useState(false);

  // Settings modification state
  const [startingBalance, setStartingBalance] = useState(100000);
  const [allowShortSelling, setAllowShortSelling] = useState(true);
  const [allowOptions, setAllowOptions] = useState(true);
  const [maxPositions, setMaxPositions] = useState(10);
  const [restrictedAssets, setRestrictedAssets] = useState<string[]>([]);
  const [assetInput, setAssetInput] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Roster state
  const [roster, setRoster] = useState<any[]>([]);
  const [rosterLoading, setRosterLoading] = useState(false);

  // Load settings into local state when they are fetched
  useEffect(() => {
    if (settings) {
      setStartingBalance(settings.startingBalance ?? 100000);
      setAllowShortSelling(settings.allowShortSelling ?? true);
      setAllowOptions(settings.allowOptions ?? true);
      setMaxPositions(settings.maxPositions ?? 10);
      setRestrictedAssets(settings.restrictedAssets ?? []);
    }
  }, [settings]);

  // Fetch roster
  useEffect(() => {
    if (classId) {
      fetchRoster();
    }
  }, [classId]);

  const fetchRoster = async () => {
    setRosterLoading(true);
    try {
      const res = await getClassroomRoster();
      setRoster(res.roster || []);
    } catch (err) {
      console.error('Failed to load roster:', err);
    } finally {
      setRosterLoading(false);
    }
  };

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) return;
    setCreateLoading(true);
    try {
      await createClassroom(newClassName);
      window.location.reload();
    } catch (err) {
      alert('Failed to create classroom');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setSaveLoading(true);
    setSaveSuccess(false);
    try {
      const updated: ClassroomSettings = {
        startingBalance,
        allowShortSelling,
        allowOptions,
        maxPositions,
        restrictedAssets
      };
      await updateClassroomSettings(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      alert('Failed to update classroom settings');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleAddAsset = () => {
    const asset = assetInput.toUpperCase().trim();
    if (asset && !restrictedAssets.includes(asset)) {
      setRestrictedAssets([...restrictedAssets, asset]);
    }
    setAssetInput('');
  };

  const handleRemoveAsset = (asset: string) => {
    setRestrictedAssets(restrictedAssets.filter((a) => a !== asset));
  };

  if (role !== 'teacher') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 text-slate-400">
        <GraduationCap className="h-16 w-16 text-rose-500 mb-4 animate-bounce" />
        <h2 className="text-xl font-bold text-white mb-2">Access Restricted</h2>
        <p className="text-sm max-w-md">The teacher panel is only accessible to users with the instructor role assigned.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Overview stats header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/40 p-6 rounded-3xl border border-slate-700/50 backdrop-blur-md">
        <div>
          <span className="text-[10px] uppercase tracking-widest font-black text-blue-500">Instructor Management Console</span>
          <h1 className="text-2xl font-black text-white mt-1">
            {classId ? dbClassName : 'Welcome, Instructor'}
          </h1>
          {classCode && (
            <p className="text-xs text-slate-400 mt-1">
              Class Code: <code className="bg-slate-800 text-teal-400 px-2 py-0.5 rounded font-black text-sm uppercase tracking-widest">{classCode}</code> (Share with students)
            </p>
          )}
        </div>
        
        {classId && (
          <button
            onClick={() => setTeacherPreviewMode(!teacherPreviewMode)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              teacherPreviewMode 
                ? 'bg-amber-500 hover:bg-amber-400 border-amber-400 text-white shadow-[0_0_15px_rgba(245,158,11,0.3)]' 
                : 'bg-slate-800/80 hover:bg-slate-700/80 border-slate-700 text-slate-300'
            }`}
          >
            <Eye className="h-4 w-4" />
            {teacherPreviewMode ? 'Simulation Active' : 'Preview Student View'}
          </button>
        )}
      </div>

      {!classId ? (
        /* Create classroom form */
        <div className="max-w-md mx-auto bg-slate-900/60 border border-slate-700/50 rounded-3xl p-8 shadow-2xl">
          <div className="flex flex-col items-center text-center space-y-4 mb-6">
            <div className="p-4 bg-blue-600/10 border border-blue-500/20 text-blue-400 rounded-2xl">
              <GraduationCap className="h-10 w-10" />
            </div>
            <div>
              <h2 className="text-white font-bold text-lg">Create a Classroom</h2>
              <p className="text-xs text-slate-400 mt-1">Initialize your student trading environment to begin controlling student sandboxes.</p>
            </div>
          </div>
          <form onSubmit={handleCreateClass} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Classroom Name</label>
              <input
                type="text"
                required
                value={newClassName}
                onChange={(e) => setNewClassName(e.target.value)}
                placeholder="Intro to Personal Finance - Period 3"
                className="w-full bg-[#0f111a] border border-slate-700 rounded-xl px-4 py-3 text-white font-bold placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={createLoading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-50"
            >
              {createLoading ? 'Generating Sandbox...' : 'Create Class'}
            </button>
          </form>
        </div>
      ) : (
        /* Teacher console content */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Rules / Settings inputs */}
          <div className="lg:col-span-2 bg-[#161f30]/40 border border-slate-700/50 backdrop-blur-md rounded-3xl p-6 space-y-6 shadow-2xl">
            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-700/50">
              <Settings className="h-5 w-5 text-teal-400" />
              <h2 className="text-white font-bold text-base">Classroom Sandbox Settings</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Starting Balance ($)</label>
                <input
                  type="number"
                  min="1000"
                  max="10000000"
                  value={startingBalance}
                  onChange={(e) => setStartingBalance(Number(e.target.value))}
                  className="w-full bg-[#0f111a] border border-slate-700 rounded-xl px-4 py-3 text-white font-bold focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Max Positions (Unique Assets)</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={maxPositions}
                  onChange={(e) => setMaxPositions(Number(e.target.value))}
                  className="w-full bg-[#0f111a] border border-slate-700 rounded-xl px-4 py-3 text-white font-bold focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            {/* Toggle options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-[#0f111a]/40 border border-slate-700/50 rounded-2xl flex justify-between items-center">
                <div>
                  <h4 className="text-white font-bold text-xs">Allow Short Selling</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Let students sell stocks they do not own</p>
                </div>
                <button
                  onClick={() => setAllowShortSelling(!allowShortSelling)}
                  className="text-slate-300 hover:text-white"
                >
                  {allowShortSelling ? (
                    <ToggleRight className="h-9 w-9 text-teal-400" />
                  ) : (
                    <ToggleLeft className="h-9 w-9 text-slate-600" />
                  )}
                </button>
              </div>

              <div className="p-4 bg-[#0f111a]/40 border border-slate-700/50 rounded-2xl flex justify-between items-center">
                <div>
                  <h4 className="text-white font-bold text-xs">Allow Options Trading</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Unlock Call and Put contracts tab</p>
                </div>
                <button
                  onClick={() => setAllowOptions(!allowOptions)}
                  className="text-slate-300 hover:text-white"
                >
                  {allowOptions ? (
                    <ToggleRight className="h-9 w-9 text-teal-400" />
                  ) : (
                    <ToggleLeft className="h-9 w-9 text-slate-600" />
                  )}
                </button>
              </div>
            </div>

            {/* Restricted assets */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Restricted Tickers</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="TSLA, AMC, GME..."
                  value={assetInput}
                  onChange={(e) => setAssetInput(e.target.value)}
                  className="bg-[#0f111a] border border-slate-700 rounded-xl px-4 py-2.5 text-white font-bold uppercase focus:outline-none focus:border-blue-500 transition-colors placeholder-slate-600 flex-1 text-sm"
                  onKeyDown={(e) => { if (e.key === 'Enter') handleAddAsset(); }}
                />
                <button
                  type="button"
                  onClick={handleAddAsset}
                  className="p-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-teal-400 rounded-xl transition-all"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {restrictedAssets.length === 0 ? (
                  <span className="text-[11px] text-slate-500 italic">No tickers are currently banned.</span>
                ) : (
                  restrictedAssets.map((asset) => (
                    <span 
                      key={asset}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-extrabold"
                    >
                      {asset}
                      <button 
                        onClick={() => handleRemoveAsset(asset)}
                        className="hover:text-white transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-700/50 flex justify-end gap-3">
              {saveSuccess && (
                <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-bold animate-pulse">
                  <Check className="h-4 w-4" /> Config Saved Successfully
                </span>
              )}
              <button
                onClick={handleSaveSettings}
                disabled={saveLoading}
                className="px-6 py-3 bg-teal-500 hover:bg-teal-400 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-[0_0_15px_rgba(20,184,166,0.3)] disabled:opacity-50 cursor-pointer"
              >
                {saveLoading ? 'Saving...' : 'Save Config'}
              </button>
            </div>
          </div>

          {/* Student Roster panel */}
          <div className="bg-[#161f30]/40 border border-slate-700/50 backdrop-blur-md rounded-3xl p-6 flex flex-col min-h-[450px] shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-700/50 mb-4 shrink-0">
              <div className="flex items-center gap-2.5">
                <Users className="h-5 w-5 text-blue-400" />
                <h2 className="text-white font-bold text-base">Student Roster</h2>
              </div>
              <button 
                onClick={fetchRoster}
                className="text-[10px] font-black uppercase text-blue-400 hover:underline"
              >
                Refresh
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-[400px]">
              {rosterLoading ? (
                <div className="text-center py-12 text-slate-500 text-xs">Loading members...</div>
              ) : roster.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs italic">No students joined yet. Share code '{classCode}' with your class!</div>
              ) : (
                roster.map((student) => (
                  <div 
                    key={student.studentId}
                    className="p-4 bg-[#0f111a]/40 border border-slate-800 rounded-2xl flex flex-col gap-2 hover:border-slate-700 transition-colors"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-black text-white">{student.studentName}</span>
                      <span className="text-[9px] text-slate-400">Joined: {student.joinedAt}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800/60">
                      <div>
                        <span className="text-[9px] text-slate-500 uppercase font-black block">Cash Cash</span>
                        <span className="text-xs font-bold text-slate-300">${student.cashBalance?.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-500 uppercase font-black block">Portfolio Value</span>
                        <span className="text-xs font-bold text-teal-400">${student.portfolioValue?.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
