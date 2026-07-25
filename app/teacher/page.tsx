'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useDashboardSettings } from '@/context/DashboardSettingsContext';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { 
  GraduationCap, 
  ToggleLeft, 
  ToggleRight, 
  Check, 
  Plus, 
  Trash2, 
  Users, 
  Settings, 
  Play, 
  Eye, 
  X, 
  BookOpen, 
  Target, 
  Megaphone, 
  RotateCcw, 
  Search, 
  Building2, 
  BarChart3, 
  UserX,
  ArrowLeft,
  LayoutDashboard
} from 'lucide-react';
import { 
  createClassroom, 
  getTeacherClassrooms, 
  switchActiveClassroom, 
  getClassroomRoster, 
  updateClassroomSettings,
  assignLessonToClassroom,
  removeClassroomAssignment,
  getClassroomAssignments,
  setClassroomGoal,
  removeClassroomGoal,
  getClassroomGoals,
  postClassroomAnnouncement,
  getClassroomAnnouncements,
  removeStudentFromClassroom,
  resetStudentPortfolio
} from '@/app/actions/edu';
import { ClassroomSettings } from '@/types/education';
import { UNITS_DATA } from '../dashboard/lesson/unitsData';

interface ClassroomItem {
  id: string;
  className: string;
  classCode: string;
  createdAt?: any;
  settings?: ClassroomSettings;
}

export default function StandaloneTeacherDashboardPage() {
  const { user } = useAuth();
  const { role, classId, classCode, className: dbClassName, settings, teacherPreviewMode, setTeacherPreviewMode } = useDashboardSettings();

  // Navigation tab for full control page
  const [activeTab, setActiveTab] = useState<'roster' | 'lessons' | 'goals' | 'announcements' | 'settings'>('roster');

  // Multi-classroom state
  const [classrooms, setClassrooms] = useState<ClassroomItem[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [newClassStartingBalance, setNewClassStartingBalance] = useState(10000);
  const [createLoading, setCreateLoading] = useState(false);

  // Settings modification state
  const [startingBalance, setStartingBalance] = useState(10000);
  const [allowShortSelling, setAllowShortSelling] = useState(true);
  const [allowOptions, setAllowOptions] = useState(true);
  const [maxPositions, setMaxPositions] = useState(10);
  const [restrictedAssets, setRestrictedAssets] = useState<string[]>([]);
  const [assetInput, setAssetInput] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Data state
  const [roster, setRoster] = useState<any[]>([]);
  const [rosterLoading, setRosterLoading] = useState(false);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [goals, setGoals] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);

  // Search & Filter state for Roster
  const [searchTerm, setSearchTerm] = useState('');

  // Lesson assignment state
  const [assignLessonId, setAssignLessonId] = useState<number>(1);
  const [assignDueDate, setAssignDueDate] = useState<string>('');
  const [assignLoading, setAssignLoading] = useState(false);

  // Goal creation state
  const [goalTitle, setGoalTitle] = useState('');
  const [goalType, setGoalType] = useState<'portfolio_value' | 'stock_profit' | 'execute_orders' | 'complete_lessons'>('portfolio_value');
  const [goalTargetValue, setGoalTargetValue] = useState<number>(15000);
  const [goalTicker, setGoalTicker] = useState('');
  const [goalDescription, setGoalDescription] = useState('');
  const [goalTargetStudent, setGoalTargetStudent] = useState<string>('');
  const [goalLoading, setGoalLoading] = useState(false);

  // Announcement state
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annLoading, setAnnLoading] = useState(false);

  // Flattened list of lessons
  const allLessons = UNITS_DATA.flatMap(u => u.lessons.map(l => ({ ...l, unitTitle: u.title })));

  useEffect(() => {
    if (role === 'teacher') {
      loadTeacherClassrooms();
    }
  }, [role]);

  useEffect(() => {
    if (classId) {
      setSelectedClassId(classId);
    }
  }, [classId]);

  useEffect(() => {
    if (selectedClassId) {
      fetchClassroomData(selectedClassId);
    }
  }, [selectedClassId]);

  useEffect(() => {
    if (settings) {
      setStartingBalance(settings.startingBalance ?? 10000);
      setAllowShortSelling(settings.allowShortSelling ?? true);
      setAllowOptions(settings.allowOptions ?? true);
      setMaxPositions(settings.maxPositions ?? 10);
      setRestrictedAssets(settings.restrictedAssets ?? []);
    }
  }, [settings]);

  const loadTeacherClassrooms = async () => {
    try {
      const list = await getTeacherClassrooms();
      setClassrooms(list);
      if (list.length > 0 && !selectedClassId) {
        setSelectedClassId(list[0].id);
      }
    } catch (err) {
      console.error('Failed to load classrooms:', err);
    }
  };

  const fetchClassroomData = async (cId: string) => {
    setRosterLoading(true);
    try {
      const [rosterRes, assignRes, goalsRes, annRes] = await Promise.all([
        getClassroomRoster(cId),
        getClassroomAssignments(cId),
        getClassroomGoals(cId),
        getClassroomAnnouncements(cId)
      ]);
      setRoster(rosterRes.roster || []);
      setAssignments(assignRes || []);
      setGoals(goalsRes || []);
      setAnnouncements(annRes || []);
    } catch (err) {
      console.error('Error fetching classroom data:', err);
    } finally {
      setRosterLoading(false);
    }
  };

  const handleSwitchClassroom = async (targetId: string) => {
    setSelectedClassId(targetId);
    try {
      await switchActiveClassroom(targetId);
    } catch (err) {
      console.error('Failed to switch classroom:', err);
    }
  };

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) return;
    setCreateLoading(true);
    try {
      const res = await createClassroom(newClassName, { startingBalance: newClassStartingBalance });
      setShowCreateModal(false);
      setNewClassName('');
      await loadTeacherClassrooms();
      if (res.classId) {
        setSelectedClassId(res.classId);
      }
    } catch (err) {
      alert('Failed to create classroom');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!selectedClassId) return;
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
      await updateClassroomSettings(updated, selectedClassId);
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

  const handleAssignLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClassId) return;
    const targetLesson = allLessons.find(l => l.id === assignLessonId);
    if (!targetLesson) return;

    setAssignLoading(true);
    try {
      await assignLessonToClassroom(assignLessonId, targetLesson.title, assignDueDate, selectedClassId);
      setAssignDueDate('');
      await fetchClassroomData(selectedClassId);
    } catch (err) {
      alert('Failed to assign lesson');
    } finally {
      setAssignLoading(false);
    }
  };

  const handleRemoveAssignment = async (id: string) => {
    if (!selectedClassId) return;
    try {
      await removeClassroomAssignment(id, selectedClassId);
      await fetchClassroomData(selectedClassId);
    } catch (err) {
      alert('Failed to delete assignment');
    }
  };

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClassId || !goalTitle.trim()) return;

    setGoalLoading(true);
    try {
      let targetStudentName = '';
      if (goalTargetStudent) {
        const studentObj = roster.find(r => r.studentId === goalTargetStudent);
        if (studentObj) targetStudentName = studentObj.studentName;
      }

      await setClassroomGoal({
        title: goalTitle,
        type: goalType,
        targetValue: Number(goalTargetValue),
        ticker: goalTicker,
        description: goalDescription,
        studentId: goalTargetStudent || undefined,
        studentName: targetStudentName || undefined
      }, selectedClassId);

      setGoalTitle('');
      setGoalDescription('');
      setGoalTicker('');
      await fetchClassroomData(selectedClassId);
    } catch (err) {
      alert('Failed to set student goal');
    } finally {
      setGoalLoading(false);
    }
  };

  const handleRemoveGoal = async (id: string) => {
    if (!selectedClassId) return;
    try {
      await removeClassroomGoal(id, selectedClassId);
      await fetchClassroomData(selectedClassId);
    } catch (err) {
      alert('Failed to remove goal');
    }
  };

  const handlePostAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClassId || !annTitle.trim() || !annContent.trim()) return;

    setAnnLoading(true);
    try {
      await postClassroomAnnouncement(annTitle, annContent, selectedClassId);
      setAnnTitle('');
      setAnnContent('');
      await fetchClassroomData(selectedClassId);
    } catch (err) {
      alert('Failed to post announcement');
    } finally {
      setAnnLoading(false);
    }
  };

  const handleRemoveStudent = async (studentId: string, studentName: string) => {
    if (!confirm(`Are you sure you want to remove ${studentName} from this classroom?`)) return;
    try {
      await removeStudentFromClassroom(studentId, selectedClassId);
      await fetchClassroomData(selectedClassId);
    } catch (err) {
      alert('Failed to remove student');
    }
  };

  const handleResetStudent = async (studentId: string, studentName: string) => {
    if (!confirm(`Reset cash portfolio balance for ${studentName} back to starting cash ($${startingBalance.toLocaleString()})?`)) return;
    try {
      await resetStudentPortfolio(studentId, selectedClassId);
      await fetchClassroomData(selectedClassId);
    } catch (err) {
      alert('Failed to reset portfolio');
    }
  };

  const filteredRoster = roster.filter(s => 
    s.studentName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentClassroom = classrooms.find(c => c.id === selectedClassId) || {
    id: selectedClassId,
    className: dbClassName || 'Classroom Command Center',
    classCode: classCode || ''
  };

  if (role !== 'teacher') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center p-6 text-slate-400">
        <GraduationCap className="h-16 w-16 text-rose-500 mb-4 animate-bounce" />
        <h2 className="text-2xl font-black text-white mb-2">Instructor Access Required</h2>
        <p className="text-sm max-w-md">The teacher master console is only accessible to users with instructor role permissions assigned.</p>
        <Link href="/dashboard" className="mt-6 px-4 py-2 bg-slate-800 text-white font-bold rounded-xl text-xs">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0d14] text-slate-200">
      {/* Dedicated Standalone Teacher Header Bar */}
      <header className="border-b border-slate-800/80 bg-[#121522]/90 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-tr from-blue-600 to-teal-500 rounded-2xl shadow-lg shadow-blue-500/20">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-black text-white tracking-wide">Trillium Educator Master Portal</h1>
            <p className="text-[11px] text-slate-400">Full-Screen Instructor Control & Analytics Console</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-4 py-2 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all"
          >
            <LayoutDashboard className="h-4 w-4" /> Standard Dashboard
          </Link>
        </div>
      </header>

      <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full space-y-6">
        {/* Class Overview Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-slate-900/60 p-6 rounded-3xl border border-slate-800 backdrop-blur-md shadow-2xl">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-[10px] uppercase font-black tracking-widest text-blue-400">
                Full-Access Instructor View
              </span>
              {classrooms.length > 1 && (
                <span className="px-2 py-0.5 rounded-full bg-teal-500/10 text-[10px] font-black text-teal-400">
                  {classrooms.length} Active Classrooms
                </span>
              )}
            </div>
            <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight">
              {currentClassroom.className}
            </h1>
            {currentClassroom.classCode && (
              <div className="flex items-center gap-3 pt-1">
                <span className="text-xs text-slate-400">Student Join Code:</span>
                <code className="bg-slate-800 text-teal-300 px-3 py-1 rounded-lg font-black text-sm uppercase tracking-widest border border-slate-700 select-all">
                  {currentClassroom.classCode}
                </code>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            {/* Classroom Switcher */}
            {classrooms.length > 0 && (
              <div className="flex items-center gap-2 bg-[#0f111a] border border-slate-700 rounded-2xl px-3 py-2">
                <Building2 className="h-4 w-4 text-slate-400 shrink-0" />
                <select
                  value={selectedClassId}
                  onChange={(e) => handleSwitchClassroom(e.target.value)}
                  className="bg-transparent text-white font-bold text-xs focus:outline-none cursor-pointer pr-2"
                >
                  {classrooms.map((c) => (
                    <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                      {c.className} ({c.classCode})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider rounded-2xl transition-all shadow-md cursor-pointer"
            >
              <Plus className="h-4 w-4" /> New Class
            </button>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-2">
          <button
            onClick={() => setActiveTab('roster')}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'roster'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                : 'bg-slate-900/40 text-slate-400 hover:bg-slate-800/60 hover:text-white border border-slate-800'
            }`}
          >
            <Users className="h-4 w-4" /> Roster & Analytics ({roster.length})
          </button>

          <button
            onClick={() => setActiveTab('lessons')}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'lessons'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                : 'bg-slate-900/40 text-slate-400 hover:bg-slate-800/60 hover:text-white border border-slate-800'
            }`}
          >
            <BookOpen className="h-4 w-4" /> Assign Lessons ({assignments.length})
          </button>

          <button
            onClick={() => setActiveTab('goals')}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'goals'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                : 'bg-slate-900/40 text-slate-400 hover:bg-slate-800/60 hover:text-white border border-slate-800'
            }`}
          >
            <Target className="h-4 w-4" /> Student Goals ({goals.length})
          </button>

          <button
            onClick={() => setActiveTab('announcements')}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'announcements'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                : 'bg-slate-900/40 text-slate-400 hover:bg-slate-800/60 hover:text-white border border-slate-800'
            }`}
          >
            <Megaphone className="h-4 w-4" /> Broadcasts ({announcements.length})
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                : 'bg-slate-900/40 text-slate-400 hover:bg-slate-800/60 hover:text-white border border-slate-800'
            }`}
          >
            <Settings className="h-4 w-4" /> Rules & Controls
          </button>
        </div>

        {/* TAB CONTENTS */}
        {activeTab === 'roster' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 bg-[#161f30]/40 p-4 rounded-2xl border border-slate-800 backdrop-blur-md">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search student by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-[#0f111a] border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-white text-xs font-bold placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
              <button
                onClick={() => fetchClassroomData(selectedClassId)}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl border border-slate-700 transition-all flex items-center justify-center gap-2"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Refresh Roster Data
              </button>
            </div>

            {rosterLoading ? (
              <div className="py-20 text-center text-slate-500 text-sm">Loading classroom roster...</div>
            ) : filteredRoster.length === 0 ? (
              <div className="py-20 text-center bg-slate-900/40 border border-slate-800 rounded-3xl">
                <Users className="h-12 w-12 text-slate-600 mx-auto mb-3" />
                <h3 className="text-white font-bold text-base">No Students Enrolled</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                  Share join code <code className="text-teal-400 font-black">{currentClassroom.classCode}</code> with your students to enroll them into this classroom.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRoster.map((student) => {
                  const pVal = student.portfolioValue || 0;
                  const pDiff = pVal - startingBalance;
                  const pDiffPct = (pDiff / startingBalance) * 100;
                  const isProfitable = pDiff >= 0;

                  return (
                    <motion.div
                      key={student.studentId}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-[#161f30]/40 border border-slate-700/50 backdrop-blur-md rounded-3xl p-5 shadow-xl flex flex-col justify-between space-y-4 hover:border-slate-600 transition-all"
                    >
                      <div>
                        <div className="flex justify-between items-start border-b border-slate-800 pb-3">
                          <div>
                            <h3 className="text-white font-black text-base">{student.studentName}</h3>
                            <span className="text-[10px] text-slate-400">Joined: {student.joinedAt}</span>
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleResetStudent(student.studentId, student.studentName)}
                              title="Reset portfolio to starting cash"
                              className="p-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg transition-all"
                            >
                              <RotateCcw className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleRemoveStudent(student.studentId, student.studentName)}
                              title="Remove student from classroom"
                              className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-lg transition-all"
                            >
                              <UserX className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-3">
                          <div className="bg-[#0f111a]/60 p-3 rounded-2xl border border-slate-800">
                            <span className="text-[9px] uppercase font-black text-slate-500 block">Portfolio Value</span>
                            <span className="text-sm font-black text-white">${pVal.toLocaleString()}</span>
                            <span className={`text-[10px] font-bold block mt-0.5 ${isProfitable ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {isProfitable ? '+' : ''}{pDiffPct.toFixed(1)}% (${pDiff.toLocaleString()})
                            </span>
                          </div>

                          <div className="bg-[#0f111a]/60 p-3 rounded-2xl border border-slate-800">
                            <span className="text-[9px] uppercase font-black text-slate-500 block">Available Cash</span>
                            <span className="text-sm font-black text-slate-300">${student.cashBalance?.toLocaleString()}</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-3">
                          <div className="flex items-center gap-2 bg-[#0f111a]/40 p-2.5 rounded-xl border border-slate-800/80">
                            <BarChart3 className="h-4 w-4 text-blue-400 shrink-0" />
                            <div>
                              <span className="text-[9px] text-slate-500 font-bold block leading-none">Total Trades</span>
                              <span className="text-xs font-black text-white leading-tight">{student.tradesCount || 0} Orders</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 bg-[#0f111a]/40 p-2.5 rounded-xl border border-slate-800/80">
                            <BookOpen className="h-4 w-4 text-teal-400 shrink-0" />
                            <div>
                              <span className="text-[9px] text-slate-500 font-bold block leading-none">Lessons Done</span>
                              <span className="text-xs font-black text-white leading-tight">{student.completedLessonCount || 0} Lessons</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB: LESSONS */}
        {activeTab === 'lessons' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-[#161f30]/40 border border-slate-700/50 backdrop-blur-md rounded-3xl p-6 shadow-2xl h-fit">
              <div className="flex items-center gap-2.5 pb-4 border-b border-slate-700/50 mb-4">
                <BookOpen className="h-5 w-5 text-blue-400" />
                <h2 className="text-white font-black text-base">Assign Lesson to Class</h2>
              </div>

              <form onSubmit={handleAssignLesson} className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Select Lesson</label>
                  <select
                    value={assignLessonId}
                    onChange={(e) => setAssignLessonId(Number(e.target.value))}
                    className="w-full bg-[#0f111a] border border-slate-700 rounded-xl px-3 py-2.5 text-white text-xs font-bold focus:outline-none focus:border-blue-500"
                  >
                    {allLessons.map((l) => (
                      <option key={l.id} value={l.id} className="bg-slate-900 text-white">
                        #{l.id} {l.title} ({l.unitTitle})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Due Date (Optional)</label>
                  <input
                    type="date"
                    value={assignDueDate}
                    onChange={(e) => setAssignDueDate(e.target.value)}
                    className="w-full bg-[#0f111a] border border-slate-700 rounded-xl px-3 py-2.5 text-white text-xs font-bold focus:outline-none focus:border-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={assignLoading}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-50"
                >
                  {assignLoading ? 'Assigning...' : 'Assign Lesson'}
                </button>
              </form>
            </div>

            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-white font-black text-lg">Currently Assigned Lessons</h2>
              {assignments.length === 0 ? (
                <div className="p-12 text-center bg-slate-900/40 border border-slate-800 rounded-3xl text-slate-400 text-xs italic">
                  No lessons assigned yet. Pick a lesson from the left panel to assign!
                </div>
              ) : (
                <div className="space-y-4">
                  {assignments.map((asgn) => {
                    const completedStudentsCount = roster.filter(s => 
                      s.completedLessonIds?.includes(asgn.lessonId)
                    ).length;
                    const totalStudents = roster.length;
                    const completionPct = totalStudents > 0 ? Math.round((completedStudentsCount / totalStudents) * 100) : 0;

                    return (
                      <div
                        key={asgn.id}
                        className="p-5 bg-[#161f30]/40 border border-slate-700/50 backdrop-blur-md rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-[9px] font-black uppercase text-blue-400">
                              Lesson #{asgn.lessonId}
                            </span>
                            {asgn.dueDate && (
                              <span className="text-[10px] font-bold text-amber-400">
                                Due: {asgn.dueDate}
                              </span>
                            )}
                          </div>
                          <h3 className="text-white font-black text-base">{asgn.title}</h3>
                          <div className="flex items-center gap-4 pt-1">
                            <div className="flex items-center gap-2">
                              <div className="w-32 bg-slate-800 h-2 rounded-full overflow-hidden">
                                <div
                                  className="bg-emerald-400 h-full transition-all duration-500"
                                  style={{ width: `${completionPct}%` }}
                                />
                              </div>
                              <span className="text-xs font-black text-emerald-400">
                                {completedStudentsCount} / {totalStudents} Completed ({completionPct}%)
                              </span>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => handleRemoveAssignment(asgn.id)}
                          className="p-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-xl transition-all text-xs font-bold flex items-center justify-center gap-1.5 shrink-0"
                        >
                          <Trash2 className="h-4 w-4" /> Remove
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB: GOALS */}
        {activeTab === 'goals' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-[#161f30]/40 border border-slate-700/50 backdrop-blur-md rounded-3xl p-6 shadow-2xl space-y-4">
              <div className="flex items-center gap-2.5 pb-4 border-b border-slate-700/50">
                <Target className="h-5 w-5 text-teal-400" />
                <h2 className="text-white font-black text-base">Set Student Goal</h2>
              </div>

              <form onSubmit={handleCreateGoal} className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Goal Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Make $500 Profit on AAPL"
                    value={goalTitle}
                    onChange={(e) => setGoalTitle(e.target.value)}
                    className="w-full bg-[#0f111a] border border-slate-700 rounded-xl px-3 py-2.5 text-white text-xs font-bold focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Goal Type</label>
                  <select
                    value={goalType}
                    onChange={(e: any) => setGoalType(e.target.value)}
                    className="w-full bg-[#0f111a] border border-slate-700 rounded-xl px-3 py-2.5 text-white text-xs font-bold focus:outline-none focus:border-blue-500"
                  >
                    <option value="portfolio_value" className="bg-slate-900 text-white">Reach Portfolio Net Worth Target ($)</option>
                    <option value="stock_profit" className="bg-slate-900 text-white">Make Profit on Specific Stock ($)</option>
                    <option value="execute_orders" className="bg-slate-900 text-white">Execute Number of Trade Orders</option>
                    <option value="complete_lessons" className="bg-slate-900 text-white">Complete Number of Lessons</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Target Value</label>
                  <input
                    type="number"
                    required
                    value={goalTargetValue}
                    onChange={(e) => setGoalTargetValue(Number(e.target.value))}
                    className="w-full bg-[#0f111a] border border-slate-700 rounded-xl px-3 py-2.5 text-white text-xs font-bold focus:outline-none focus:border-blue-500"
                  />
                </div>

                {goalType === 'stock_profit' && (
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Ticker Symbol (Optional)</label>
                    <input
                      type="text"
                      placeholder="AAPL, NVDA..."
                      value={goalTicker}
                      onChange={(e) => setGoalTicker(e.target.value.toUpperCase())}
                      className="w-full bg-[#0f111a] border border-slate-700 rounded-xl px-3 py-2.5 text-white text-xs font-bold uppercase focus:outline-none focus:border-blue-500"
                    />
                  </div>
                )}

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Assign To Student</label>
                  <select
                    value={goalTargetStudent}
                    onChange={(e) => setGoalTargetStudent(e.target.value)}
                    className="w-full bg-[#0f111a] border border-slate-700 rounded-xl px-3 py-2.5 text-white text-xs font-bold focus:outline-none focus:border-blue-500"
                  >
                    <option value="" className="bg-slate-900 text-white">Entire Classroom (All Students)</option>
                    {roster.map((s) => (
                      <option key={s.studentId} value={s.studentId} className="bg-slate-900 text-white">
                        {s.studentName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Instructions / Description</label>
                  <textarea
                    rows={2}
                    placeholder="Provide details or tips for completing this goal..."
                    value={goalDescription}
                    onChange={(e) => setGoalDescription(e.target.value)}
                    className="w-full bg-[#0f111a] border border-slate-700 rounded-xl px-3 py-2.5 text-white text-xs font-bold focus:outline-none focus:border-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={goalLoading}
                  className="w-full py-3 bg-teal-500 hover:bg-teal-400 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-50"
                >
                  {goalLoading ? 'Creating...' : 'Set Student Goal'}
                </button>
              </form>
            </div>

            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-white font-black text-lg">Active Goals</h2>
              {goals.length === 0 ? (
                <div className="p-12 text-center bg-slate-900/40 border border-slate-800 rounded-3xl text-slate-400 text-xs italic">
                  No active student goals set yet. Create goals using the form on the left!
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {goals.map((g) => (
                    <div
                      key={g.id}
                      className="p-5 bg-[#161f30]/40 border border-slate-700/50 backdrop-blur-md rounded-2xl flex flex-col justify-between space-y-3 shadow-xl"
                    >
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <span className="px-2.5 py-0.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-[9px] font-black uppercase text-teal-400">
                            {g.studentName ? `Assigned to: ${g.studentName}` : 'All Students'}
                          </span>
                          <button
                            onClick={() => handleRemoveGoal(g.id)}
                            className="text-slate-500 hover:text-rose-400 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <h3 className="text-white font-black text-base mt-2">{g.title}</h3>
                        {g.description && <p className="text-xs text-slate-400 mt-1">{g.description}</p>}
                      </div>

                      <div className="bg-[#0f111a]/60 p-3 rounded-xl border border-slate-800 flex justify-between items-center">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Target</span>
                        <span className="text-xs font-black text-teal-300">
                          {g.type === 'portfolio_value' && `$${g.targetValue.toLocaleString()}`}
                          {g.type === 'stock_profit' && `$${g.targetValue.toLocaleString()} profit ${g.ticker ? `(${g.ticker})` : ''}`}
                          {g.type === 'execute_orders' && `${g.targetValue} Trades`}
                          {g.type === 'complete_lessons' && `${g.targetValue} Lessons`}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB: ANNOUNCEMENTS */}
        {activeTab === 'announcements' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-[#161f30]/40 border border-slate-700/50 backdrop-blur-md rounded-3xl p-6 shadow-2xl space-y-4">
              <div className="flex items-center gap-2.5 pb-4 border-b border-slate-700/50">
                <Megaphone className="h-5 w-5 text-indigo-400" />
                <h2 className="text-white font-black text-base">Classroom Broadcast</h2>
              </div>

              <form onSubmit={handlePostAnnouncement} className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Headline / Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Stock Market Challenge Week 2!"
                    value={annTitle}
                    onChange={(e) => setAnnTitle(e.target.value)}
                    className="w-full bg-[#0f111a] border border-slate-700 rounded-xl px-3 py-2.5 text-white text-xs font-bold focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Message Content</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Write an announcement to your class..."
                    value={annContent}
                    onChange={(e) => setAnnContent(e.target.value)}
                    className="w-full bg-[#0f111a] border border-slate-700 rounded-xl px-3 py-2.5 text-white text-xs font-bold focus:outline-none focus:border-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={annLoading}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-50"
                >
                  {annLoading ? 'Posting...' : 'Post Announcement'}
                </button>
              </form>
            </div>

            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-white font-black text-lg">Broadcast History</h2>
              {announcements.length === 0 ? (
                <div className="p-12 text-center bg-slate-900/40 border border-slate-800 rounded-3xl text-slate-400 text-xs italic">
                  No announcements posted yet. Send a message to your classroom using the panel on the left!
                </div>
              ) : (
                <div className="space-y-4">
                  {announcements.map((a) => (
                    <div
                      key={a.id}
                      className="p-5 bg-[#161f30]/40 border border-slate-700/50 backdrop-blur-md rounded-2xl space-y-2 shadow-xl"
                    >
                      <h3 className="text-white font-black text-base">{a.title}</h3>
                      <p className="text-xs text-slate-300 whitespace-pre-wrap">{a.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB: SETTINGS */}
        {activeTab === 'settings' && (
          <div className="max-w-3xl mx-auto bg-[#161f30]/40 border border-slate-700/50 backdrop-blur-md rounded-3xl p-8 space-y-6 shadow-2xl">
            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-700/50">
              <Settings className="h-6 w-6 text-teal-400" />
              <div>
                <h2 className="text-white font-black text-lg">Classroom Sandbox Rules</h2>
                <p className="text-xs text-slate-400">Configure parameters for all student portfolios in {currentClassroom.className}.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Starting Balance ($)</label>
                <input
                  type="number"
                  min="1000"
                  max="1000000"
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-[#0f111a]/40 border border-slate-700/50 rounded-2xl flex justify-between items-center">
                <div>
                  <h4 className="text-white font-bold text-xs">Allow Short Selling</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Let students sell short stocks</p>
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
                  <p className="text-[10px] text-slate-400 mt-0.5">Unlock Call/Put contracts tab</p>
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

            <div className="pt-4 border-t border-slate-700/50 flex justify-end gap-3 items-center">
              {saveSuccess && (
                <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-bold animate-pulse">
                  <Check className="h-4 w-4" /> Config Saved
                </span>
              )}
              <button
                onClick={handleSaveSettings}
                disabled={saveLoading}
                className="px-6 py-3 bg-teal-500 hover:bg-teal-400 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-[0_0_15px_rgba(20,184,166,0.3)] disabled:opacity-50 cursor-pointer"
              >
                {saveLoading ? 'Saving...' : 'Save Configuration'}
              </button>
            </div>
          </div>
        )}
      </main>

      {/* CREATE CLASSROOM MODAL */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-[#161f30] border border-slate-700 rounded-3xl p-6 shadow-2xl space-y-4"
            >
              <div className="flex justify-between items-center border-b border-slate-700 pb-3">
                <h3 className="text-white font-black text-lg">Create New Classroom</h3>
                <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleCreateClass} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Classroom Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. AP Economics - Period 4"
                    value={newClassName}
                    onChange={(e) => setNewClassName(e.target.value)}
                    className="w-full bg-[#0f111a] border border-slate-700 rounded-xl px-4 py-3 text-white font-bold focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Starting Cash per Student ($)</label>
                  <input
                    type="number"
                    value={newClassStartingBalance}
                    onChange={(e) => setNewClassStartingBalance(Number(e.target.value))}
                    className="w-full bg-[#0f111a] border border-slate-700 rounded-xl px-4 py-3 text-white font-bold focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2.5 text-xs font-bold text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createLoading}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase rounded-xl shadow-md cursor-pointer disabled:opacity-50"
                  >
                    {createLoading ? 'Creating...' : 'Create Classroom'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
