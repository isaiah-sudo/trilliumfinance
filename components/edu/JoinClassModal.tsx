'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, X, Check, AlertCircle } from 'lucide-react';
import { Button, Input, Spinner } from '@/components/ui';
import { joinClassroom } from '@/app/actions/edu';
import { useAuth } from '@/context/AuthContext';
import { useDashboardSettings } from '@/context/DashboardSettingsContext';

interface JoinClassModalProps {
  /** Custom trigger element if provided, otherwise renders default header button */
  trigger?: React.ReactNode;
}

export function JoinClassModal({ trigger }: JoinClassModalProps) {
  const { user } = useAuth();
  const { classCode: currentClassCode, className: currentClassName } = useDashboardSettings();

  const [isOpen, setIsOpen] = useState(false);
  const [classCode, setClassCode] = useState('');
  const [studentName, setStudentName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleOpen = () => {
    setError('');
    setSuccessMsg('');
    setClassCode('');
    // Default student name to user display name or email prefix if available
    const initialName = user?.displayName || user?.email?.split('@')[0] || '';
    setStudentName(initialName);
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = classCode.trim().toUpperCase();
    const cleanName = studentName.trim() || 'Student';

    if (!cleanCode) {
      setError('Please enter a class code.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await joinClassroom(cleanCode, cleanName);
      if (res.success) {
        setSuccessMsg(`Successfully joined ${res.className || 'the classroom'}!`);
        setTimeout(() => {
          setIsOpen(false);
          setSuccessMsg('');
        }, 1800);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to join class. Please check your code and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {trigger ? (
        <div onClick={handleOpen} className="inline-block cursor-pointer">
          {trigger}
        </div>
      ) : (
        <button
          onClick={handleOpen}
          className="flex h-[36px] sm:h-[38px] items-center gap-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 px-2.5 sm:px-3 border border-emerald-500/30 text-xs font-bold text-emerald-400 transition-all shadow-sm hover:-translate-y-[0.5px] cursor-pointer shrink-0"
          title="Join a Classroom with Class Code"
        >
          <GraduationCap className="h-4 w-4 text-emerald-400 shrink-0" />
          <span className="hidden sm:inline">Join Class</span>
        </button>
      )}

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.18 }}
              className="bg-white dark:bg-[#161f30] border border-slate-200 dark:border-slate-700/80 rounded-3xl p-6 w-full max-w-md shadow-2xl relative overflow-hidden"
            >
              {/* Decorative top accent glow */}
              <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

              {/* Close Button */}
              <button
                onClick={handleClose}
                className="absolute top-5 right-5 flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>

              {/* Modal Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                    Join a Classroom
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Enter the code provided by your teacher
                  </p>
                </div>
              </div>

              {/* Current Class Badge (if user is enrolled in a class) */}
              {currentClassCode && (
                <div className="mb-4 p-3 rounded-2xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider block">Current Class</span>
                    <span className="font-extrabold text-slate-800 dark:text-white">{currentClassName || 'Enrolled Class'}</span>
                  </div>
                  <span className="font-mono font-extrabold text-emerald-400 px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    {currentClassCode}
                  </span>
                </div>
              )}

              {/* Success Notification */}
              {successMsg ? (
                <div className="my-6 p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center gap-3">
                  <Check className="h-5 w-5 shrink-0" />
                  <span className="text-xs font-extrabold">{successMsg}</span>
                </div>
              ) : (
                /* Form Inputs */
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5 block">
                      Class Code
                    </label>
                    <Input
                      type="text"
                      placeholder="e.g. TRIL89"
                      value={classCode}
                      onChange={(e) => setClassCode(e.target.value.toUpperCase())}
                      className="w-full uppercase tracking-widest font-mono font-extrabold text-center text-lg bg-slate-50 dark:bg-[#0f111a] border-slate-300 dark:border-slate-700/60 focus:border-emerald-500 rounded-xl"
                      maxLength={10}
                      autoFocus
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5 block">
                      Your Name
                    </label>
                    <Input
                      type="text"
                      placeholder="Enter your name"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      className="w-full text-sm font-semibold bg-slate-50 dark:bg-[#0f111a] border-slate-300 dark:border-slate-700/60 focus:border-emerald-500 rounded-xl"
                    />
                  </div>

                  {error && (
                    <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="pt-2">
                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-emerald-500 hover:bg-emerald-600 font-bold py-2.5 text-sm shadow-[0_0_15px_rgba(16,185,129,0.25)]"
                    >
                      {loading ? (
                        <div className="flex items-center justify-center gap-2">
                          <Spinner className="h-4 w-4 text-white" />
                          <span>Enrolling...</span>
                        </div>
                      ) : (
                        <span>Join Class</span>
                      )}
                    </Button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

export default JoinClassModal;
