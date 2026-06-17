'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePortfolioStore } from '@/store/usePortfolioStore';
import { useSettings } from '@/context/SettingsContext';
import { borrowMoney } from '@/app/actions/trading';
import { BookOpen, HelpCircle, CheckCircle, Info, ChevronRight, X } from 'lucide-react';

interface TermProps {
  word: string;
  definition: string;
}

function FinancialTerm({ word, definition }: TermProps) {
  return (
    <span className="relative group cursor-pointer inline-block mx-0.5">
      <span className="underline decoration-dotted decoration-blue-500 hover:decoration-blue-400 font-bold text-blue-600 dark:text-blue-400 transition-colors">
        {word}
      </span>
      {/* Tooltip popup */}
      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 rounded-xl bg-slate-900/95 dark:bg-slate-800/95 text-white border border-slate-700/50 shadow-2xl text-xs font-medium opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-300 transform scale-95 group-hover:scale-100 z-50 text-center backdrop-blur-sm">
        <span className="font-extrabold text-blue-400 block mb-1">{word}</span>
        {definition}
        <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900/95 dark:border-t-slate-800/95" />
      </span>
    </span>
  );
}

export default function LessonPage() {
  const { numberFont, textFont } = useSettings();
  const { portfolio, fetchPortfolio } = usePortfolioStore();
  
  const [isStarted, setIsStarted] = useState(false);
  const [borrowValue, setBorrowValue] = useState(5000);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchPortfolio();
  }, [fetchPortfolio]);

  const hasAlreadyBorrowed = portfolio?.hasBorrowed || false;

  const handleOpenBorrowConfirm = () => {
    if (hasAlreadyBorrowed) {
      setErrorMsg('You have already completed the borrowing action for this lesson.');
      return;
    }
    setErrorMsg(null);
    setShowConfirmModal(true);
  };

  const handleConfirmBorrow = async () => {
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      const res = await borrowMoney(borrowValue, 0.08);
      if (res.success) {
        setSuccessMsg(`Successfully borrowed $${borrowValue.toLocaleString()}! Your available portfolio cash has been credited.`);
        setShowConfirmModal(false);
        await fetchPortfolio();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during borrowing.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`space-y-6 max-w-4xl mx-auto font-txt-${textFont}`}>
      {/* Page Title */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg">
          <BookOpen className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Interactive Lessons</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Learn core financial concepts with interactive actions</p>
        </div>
      </div>

      {/* Main Lesson Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl bg-white dark:bg-[#1a2133]/90 border border-slate-200 dark:border-slate-700/50 p-6 shadow-2xl overflow-hidden relative"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
              Module 1: Debt & Leverage
            </span>
            <h2 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white">Loaning & Borrowing</h2>
            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Understand how loans work, what interest rates are, and how debt impacts a portfolio. You will get to test this by adding real borrowed cash into your active simulator portfolio!
            </p>
          </div>
          <button
            onClick={() => setIsStarted(!isStarted)}
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-2xl shadow-[0_4px_0_0_#1d4ed8] hover:bg-blue-500 active:translate-y-[2px] active:shadow-[0_2px_0_0_#1d4ed8] transition-all flex items-center justify-center gap-2 self-start md:self-center shrink-0"
          >
            {isStarted ? 'Hide Lesson' : 'Start Lesson'}
            <ChevronRight className={`h-4 w-4 transition-transform duration-300 ${isStarted ? 'rotate-90' : ''}`} />
          </button>
        </div>

        {/* Start Popup/Collapsible Lesson Area */}
        <AnimatePresence>
          {isStarted && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700/50 space-y-6 overflow-hidden"
            >
              {/* Error and Success notifications */}
              {errorMsg && (
                <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/30 text-rose-600 dark:text-rose-400 text-xs font-semibold">
                  {errorMsg}
                </div>
              )}
              {successMsg && (
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 shrink-0" />
                  {successMsg}
                </div>
              )}

              {/* Slider Control Layout */}
              <div className="flex flex-col md:flex-row items-center gap-6 p-6 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-200 dark:border-slate-700/30">
                {/* Number Value on the Left */}
                <div className="w-full md:w-32 flex flex-col items-center md:items-start text-center md:text-left">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Borrow Value</span>
                  <span className={`text-2xl font-black text-blue-600 dark:text-blue-400 font-num-${numberFont}`}>
                    ${borrowValue.toLocaleString()}
                  </span>
                </div>

                {/* Borrow Button to the left of the slider */}
                <button
                  onClick={handleOpenBorrowConfirm}
                  disabled={hasAlreadyBorrowed || isSubmitting}
                  className={`px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all shrink-0 ${
                    hasAlreadyBorrowed
                      ? 'bg-slate-300 dark:bg-slate-800 text-slate-500 dark:text-slate-500 cursor-not-allowed border border-slate-200 dark:border-slate-700/50'
                      : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-emerald-700/20 active:translate-y-[1px]'
                  }`}
                >
                  {hasAlreadyBorrowed ? 'Borrowed' : 'Borrow'}
                </button>

                {/* Range Slider on the Right */}
                <div className="flex-1 w-full flex items-center gap-3">
                  <span className={`text-[10px] font-bold text-slate-400 font-num-${numberFont}`}>$1k</span>
                  <input
                    type="range"
                    min="1000"
                    max="10000"
                    step="500"
                    disabled={hasAlreadyBorrowed}
                    value={borrowValue}
                    onChange={(e) => setBorrowValue(Number(e.target.value))}
                    className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600 disabled:opacity-50"
                  />
                  <span className={`text-[10px] font-bold text-slate-400 font-num-${numberFont}`}>$10k</span>
                </div>
              </div>

              {/* Financial Term Explainer */}
              <div className="p-5 bg-blue-50/50 dark:bg-blue-950/10 border border-blue-100 dark:border-blue-900/20 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                  <Info className="h-4 w-4 shrink-0" />
                  <span className="text-xs font-extrabold uppercase tracking-wide">Learn the Financial Terms</span>
                </div>
                <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                  A <FinancialTerm word="Loan" definition="Money you borrow from someone else that you must pay back later." /> is
                  when you borrow money from someone else with the promise that you will pay it back. The{' '}
                  <FinancialTerm word="Principal" definition="The starting amount of money you borrowed, before interest is added." /> is
                  the actual amount of money you borrowed today. But borrowing isn't free! You have to pay{' '}
                  <FinancialTerm word="Interest" definition="A fee you pay to the lender for letting you borrow their money." />,
                  which is a fee for using their money, based on an{' '}
                  <FinancialTerm word="Interest Rate" definition="A percentage of the loan amount that shows how much interest fee you will be charged." />{' '}
                  (which is 8.00% on this loan). In accounting, borrowed money is a{' '}
                  <FinancialTerm word="Liability" definition="Something you owe to someone else, like a loan or a bill." /> because
                  it is a <FinancialTerm word="Debt" definition="The total amount of money you owe right now to other people or banks." />{' '}
                  you owe. Use borrowing wisely to leverage your investments!
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmModal && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-[#1a2133] border border-slate-200 dark:border-slate-700/80 rounded-3xl p-6 w-full max-w-md shadow-2xl relative"
            >
              <button
                onClick={() => setShowConfirmModal(false)}
                className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="text-center space-y-4">
                <div className="mx-auto h-12 w-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
                  <HelpCircle className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Confirm Your Borrowing</h3>
                <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                  Borrowing <span className="font-extrabold text-blue-600 dark:text-blue-400">${borrowValue.toLocaleString()}</span> will
                  mean you will face an interest rate of <span className="font-extrabold text-amber-600">8.00%</span> on that borrowed sum.
                </p>
                <p className="text-[11px] font-black uppercase text-amber-500 tracking-wider">
                  Use it wisely!
                </p>

                <div className="pt-4 flex gap-3">
                  <button
                    onClick={() => setShowConfirmModal(false)}
                    className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmBorrow}
                    disabled={isSubmitting}
                    className="flex-1 py-2.5 bg-blue-600 text-white font-bold rounded-xl shadow-[0_3px_0_0_#1d4ed8] hover:bg-blue-500 active:translate-y-[2px] active:shadow-none text-xs transition-all"
                  >
                    {isSubmitting ? 'Borrowing...' : 'Confirm'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
