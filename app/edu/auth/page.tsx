'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, BookOpen, ChevronRight, Sparkles, User, HelpCircle } from 'lucide-react';
import { Button, Card, Input, Spinner } from '@/components/ui';
import { setUserRole, createClassroom, joinClassroom } from '@/app/actions/edu';

export default function EducationAuthPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState<'select' | 'teacher_form' | 'student_form'>('select');
  const [roleLoading, setRoleLoading] = useState(false);
  const [actionError, setActionError] = useState('');

  // Form states
  const [teacherName, setTeacherName] = useState('');
  const [className, setClassName] = useState('');
  
  const [studentName, setStudentName] = useState('');
  const [classCode, setClassCode] = useState('');

  useEffect(() => {
    // If not loading and no user, we can prompt them to log in first
    if (!authLoading && !user) {
      router.push('/login?redirect=/edu/auth');
    }
  }, [user, authLoading, router]);

  const handleSelectTeacher = () => {
    setActionError('');
    setStep('teacher_form');
  };

  const handleSelectStudent = () => {
    setActionError('');
    setStep('student_form');
  };

  const handleTeacherSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherName || !className) {
      setActionError('Please fill in all fields.');
      return;
    }
    setRoleLoading(true);
    setActionError('');

    try {
      // 1. Assign role
      await setUserRole('teacher', teacherName);
      // 2. Create classroom
      const res = await createClassroom(className);
      if (res.success) {
        router.push('/edu/teacher-dashboard');
      }
    } catch (err: any) {
      setActionError(err.message || 'Failed to initialize teacher account.');
    } finally {
      setRoleLoading(false);
    }
  };

  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName || !classCode) {
      setActionError('Please fill in all fields.');
      return;
    }
    setRoleLoading(true);
    setActionError('');

    try {
      // 1. Assign role
      await setUserRole('student', studentName);
      // 2. Join classroom (which registers student & maps portfolio starting cash)
      const res = await joinClassroom(classCode, studentName);
      if (res.success) {
        router.push('/edu/student-dashboard');
      }
    } catch (err: any) {
      setActionError(err.message || 'Failed to join class. Please verify the code.');
    } finally {
      setRoleLoading(false);
    }
  };

  if (authLoading || roleLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0f111a] text-slate-400">
        <div className="flex flex-col items-center gap-4">
          <Spinner className="h-12 w-12 text-teal-400" />
          <p className="font-semibold animate-pulse text-sm tracking-wider uppercase">Loading credentials...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-6 bg-[#090d16] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-[#090d16] to-[#090d16]">
      <div className="w-full max-w-4xl">
        <header className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-4"
          >
            <Sparkles className="h-3 w-3" /> Trillium Education Mode
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl"
          >
            Select Your Learning <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400">Journey</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-3 text-slate-400 text-sm max-w-lg mx-auto"
          >
            Connect, learn, and master paper trading in a sandbox environment governed by classroom guidelines.
          </motion.p>
        </header>

        <AnimatePresence mode="wait">
          {step === 'select' && (
            <motion.div
              key="select"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-8"
            >
              {/* Teacher Selection Card */}
              <div
                className="group relative cursor-pointer border border-slate-700/50 bg-[#161f30]/40 backdrop-blur-md p-8 hover:bg-[#1a263b]/60 transition-all duration-300 rounded-[2.5rem] flex flex-col justify-between overflow-hidden shadow-2xl hover:shadow-teal-500/5"
                onClick={handleSelectTeacher}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 rounded-full blur-3xl group-hover:bg-teal-500/10 transition-colors" />
                <div className="space-y-6">
                  <div className="w-14 h-14 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 group-hover:scale-110 transition-transform">
                    <GraduationCap className="h-7 w-7" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-extrabold text-white group-hover:text-teal-400 transition-colors">I am a Teacher</h3>
                    <p className="mt-2 text-slate-400 text-sm leading-relaxed">
                      Create interactive classes, monitor student performance, set custom portfolios, and enforce day-trading limits or asset whitelists.
                    </p>
                  </div>
                </div>
                <div className="mt-12 flex items-center justify-between text-teal-400 font-bold text-sm tracking-wider uppercase">
                  <span>Create Class</span>
                  <ChevronRight className="h-5 w-5 group-hover:translate-x-2 transition-transform" />
                </div>
              </div>

              {/* Student Selection Card */}
              <div
                className="group relative cursor-pointer border border-slate-700/50 bg-[#161f30]/40 backdrop-blur-md p-8 hover:bg-[#1a263b]/60 transition-all duration-300 rounded-[2.5rem] flex flex-col justify-between overflow-hidden shadow-2xl hover:shadow-emerald-500/5"
                onClick={handleSelectStudent}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-colors" />
                <div className="space-y-6">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                    <BookOpen className="h-7 w-7" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-extrabold text-white group-hover:text-emerald-400 transition-colors">I am a Student</h3>
                    <p className="mt-2 text-slate-400 text-sm leading-relaxed">
                      Join a class with a teacher-provided code, trade approved assets, and grow your paper-trading portfolio according to classroom rules.
                    </p>
                  </div>
                </div>
                <div className="mt-12 flex items-center justify-between text-emerald-400 font-bold text-sm tracking-wider uppercase">
                  <span>Join Class</span>
                  <ChevronRight className="h-5 w-5 group-hover:translate-x-2 transition-transform" />
                </div>
              </div>
            </motion.div>
          )}

          {step === 'teacher_form' && (
            <motion.div
              key="teacher"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-md mx-auto"
            >
              <Card className="border-slate-700/50 bg-[#161f30]/80 backdrop-blur-md p-8 rounded-[2rem] shadow-2xl">
                <div className="flex items-center gap-3 mb-6">
                  <Button variant="secondary" size="sm" onClick={() => setStep('select')} className="px-3 py-1 font-semibold text-xs border-slate-700 dark:bg-slate-800 text-slate-300">
                    ← Back
                  </Button>
                  <h3 className="text-xl font-bold text-white">Create Teacher Profile</h3>
                </div>

                <form onSubmit={handleTeacherSubmit} className="space-y-5">
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Your Name</label>
                    <div className="relative">
                      <Input
                        type="text"
                        placeholder="Dr. Smith, Professor Isaiah..."
                        value={teacherName}
                        onChange={(e) => setTeacherName(e.target.value)}
                        className="w-full bg-[#0f111a] border-slate-700/50 rounded-xl px-4 py-3 text-white font-semibold focus:border-teal-500"
                        block
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Class Name</label>
                    <Input
                      type="text"
                      placeholder="e.g. AP Macroeconomics - Block 3"
                      value={className}
                      onChange={(e) => setClassName(e.target.value)}
                      className="w-full bg-[#0f111a] border-slate-700/50 rounded-xl px-4 py-3 text-white font-semibold focus:border-teal-500"
                      block
                    />
                  </div>

                  {actionError && <div className="text-rose-500 text-xs font-semibold">{actionError}</div>}

                  <Button type="submit" className="w-full bg-teal-500 hover:bg-teal-600 font-bold py-3 text-base shadow-[0_0_15px_rgba(20,184,166,0.3)]" block>
                    Create Class Code & Dashboard
                  </Button>
                </form>
              </Card>
            </motion.div>
          )}

          {step === 'student_form' && (
            <motion.div
              key="student"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-md mx-auto"
            >
              <Card className="border-slate-700/50 bg-[#161f30]/80 backdrop-blur-md p-8 rounded-[2rem] shadow-2xl">
                <div className="flex items-center gap-3 mb-6">
                  <Button variant="secondary" size="sm" onClick={() => setStep('select')} className="px-3 py-1 font-semibold text-xs border-slate-700 dark:bg-slate-800 text-slate-300">
                    ← Back
                  </Button>
                  <h3 className="text-xl font-bold text-white">Join Classroom</h3>
                </div>

                <form onSubmit={handleStudentSubmit} className="space-y-5">
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Your Full Name</label>
                    <Input
                      type="text"
                      placeholder="Enter your name"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      className="w-full bg-[#0f111a] border-slate-700/50 rounded-xl px-4 py-3 text-white font-semibold focus:border-emerald-500"
                      block
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Class Code</label>
                    <Input
                      type="text"
                      placeholder="e.g. TRIL-8921"
                      value={classCode}
                      onChange={(e) => setClassCode(e.target.value)}
                      className="w-full bg-[#0f111a] border-slate-700/50 rounded-xl px-4 py-3 text-white font-extrabold focus:border-emerald-500 uppercase tracking-widest"
                      block
                    />
                  </div>

                  {actionError && <div className="text-rose-500 text-xs font-semibold">{actionError}</div>}

                  <Button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 font-bold py-3 text-base shadow-[0_0_15px_rgba(16,185,129,0.3)]" block>
                    Join Class & Initialize Portfolio
                  </Button>
                </form>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
