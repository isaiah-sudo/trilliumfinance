'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePortfolioStore } from '@/store/usePortfolioStore';
import { useSettings } from '@/context/SettingsContext';
import { borrowMoney } from '@/app/actions/trading';
import { 
  BookOpen, 
  HelpCircle, 
  CheckCircle, 
  Info, 
  ArrowLeft, 
  Lock, 
  Unlock, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Coins,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Square,
  Sparkles,
  ChevronsLeftRight
} from 'lucide-react';

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
}

const quizQuestions: QuizQuestion[] = [
  {
    id: 1,
    question: "What is a 'Liability' in financial terms?",
    options: [
      "An asset that automatically makes you money every single day.",
      "Something you owe to someone else, like a loan or a bill.",
      "The physical key to a bank vault containing cash."
    ],
    correctAnswer: 1
  },
  {
    id: 2,
    question: "If you borrow money with a daily compounding interest rate, how is the interest calculated?",
    options: [
      "It is calculated once at the very end of the year on the original sum.",
      "The annual rate is divided by 365, and interest is compounded onto the balance daily.",
      "It is never added because simulator borrowing is always interest-free."
    ],
    correctAnswer: 1
  },
  {
    id: 3,
    question: "What is the primary risk of using 'Leverage' in investing?",
    options: [
      "It multiplies your potential gains but also amplifies your potential losses.",
      "It makes the stock market freeze up and stop trading.",
      "It causes your portfolio to be locked forever without any access."
    ],
    correctAnswer: 0
  },
  {
    id: 4,
    question: "What happens if your interest rate exceeds your investment returns?",
    options: [
      "You make double the money because interest counts as income.",
      "You lose money overall, creating a leverage trap where debt eats your equity.",
      "The lender forgives your loan automatically."
    ],
    correctAnswer: 1
  },
  {
    id: 5,
    question: "Why does the interest rate increase as you borrow larger amounts of money?",
    options: [
      "Because the bank wants to celebrate your success.",
      "Because larger loans carry higher default and leverage risk for the lender.",
      "Because smaller loans are legally prohibited from having interest rates."
    ],
    correctAnswer: 1
  }
];

const glossaryDefinitions: Record<string, string> = {
  "Liability": "Something you owe to someone else, like a loan or a bill. In accounting, it is the opposite of an Asset.",
  "Leverage": "Using borrowed money to increase your total investment size. This multiplies both potential gains and potential losses.",
  "Daily Compounding": "Calculating interest daily and adding it to your balance, so you pay interest on your accumulated interest, making debt grow exponentially.",
  "Dynamic Interest Rate": "An interest rate that adjusts based on the amount borrowed. Higher loan amounts pose greater risk and trigger higher rates."
};

const lessonText = `
Welcome to the Debt & Leverage Masterclass! 
Let's explore four vital concepts that control how borrowed money behaves.

First: What is a Liability?
A liability is simply anything you owe to someone else. When you borrow money to buy stocks, that loan is a liability because you must pay it back.

Second: The Power of Leverage.
Leverage means using borrowed money to increase your investment size. If you have five thousand dollars of your own cash and borrow another five thousand dollars, you have ten thousand dollars total to invest. This is called two-to-one leverage! If your stocks go up twenty percent, you gain two thousand dollars instead of just one thousand. But beware: if your stocks drop twenty percent, your loss is also doubled to two thousand dollars!

Third: Daily Compounding Interest.
Borrowing money isn't free. You must pay an interest fee. Unlike simple interest, daily compounding interest means the interest is calculated every single day on your outstanding balance. Each day, the daily rate (which is the annual interest rate divided by three hundred and sixty-five) is added to what you owe. This means you pay interest on your interest, causing the debt to grow faster over time!

Fourth: Dynamic Interest Rates.
Lenders face higher risks when they lend larger sums. Therefore, your interest rate is dynamic: it adjusts based on how much you borrow. A small loan has a low rate like four point eight percent, while a max loan has a rate of twelve percent.

Make sure you understand these core rules before trying the quiz on the right!
`;

interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  delay: number;
  duration: number;
}

interface Spark {
  id: number;
  x: number;
  y: number;
  dx: number;
  dy: number;
  color: string;
}

interface ActivePopup {
  term: string;
  definition: string;
  isPinned: boolean;
  defaultX: number;
  defaultY: number;
  wordX?: number;
  wordY?: number;
  wordHeight?: number;
  dragX?: number;
  dragY?: number;
}

type CelebrationStep = 'none' | 'lock' | 'text' | 'done';

export default function DebtLeverageLessonPage() {
  const { numberFont, textFont } = useSettings();
  const { portfolio, fetchPortfolio } = usePortfolioStore();

  // TTS Voice state
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Draggable layout state
  const [leftWidth, setLeftWidth] = useState(50); // percentage
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);

  // Multiple Glossary Popups state
  const [activeGlossaries, setActiveGlossaries] = useState<Record<string, ActivePopup>>({});
  const [sparks, setSparks] = useState<Spark[]>([]);
  const sparkAnimRef = useRef<number | null>(null);

  // Sparks & dragging tracking during glide
  const lastPositionsRef = useRef<Record<string, { x: number, y: number, time: number }>>({});
  const draggingPopupsRef = useRef<Record<string, boolean>>({});

  // Quiz state
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizPassed, setQuizPassed] = useState(false);
  const [quizError, setQuizError] = useState<string | null>(null);
  
  // Celebration state
  const [celebrationStep, setCelebrationStep] = useState<CelebrationStep>('none');
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([]);
  const confettiIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Borrowing state
  const [borrowValue, setBorrowValue] = useState(5000);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Leverage simulator state
  const [marketReturnDirection, setMarketReturnDirection] = useState<'up' | 'down'>('up');
  const marketReturnPercent = 0.20; // 20%

  useEffect(() => {
    if (typeof window !== 'undefined') {
      synthRef.current = window.speechSynthesis;
    }
    fetchPortfolio();
    
    // Check local storage for quiz status or completion
    const isCompleted = localStorage.getItem('lesson_1_completed') === 'true';
    if (portfolio?.hasBorrowed || isCompleted) {
      setQuizPassed(true);
      setQuizSubmitted(true);
      setCelebrationStep('done');
    }

    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
      if (confettiIntervalRef.current) {
        clearInterval(confettiIntervalRef.current);
      }
      if (sparkAnimRef.current) {
        cancelAnimationFrame(sparkAnimRef.current);
      }
    };
  }, [fetchPortfolio, portfolio?.hasBorrowed]);

  // High-performance DOM-Level connecting line update loop
  useEffect(() => {
    let active = true;

    const spawnSparksDOM = (containerEl: HTMLElement, x: number, y: number, vx: number, vy: number) => {
      const colors = ['#059669', '#10b981', '#3b82f6'];
      for (let i = 0; i < 2; i++) {
        const angle = Math.atan2(vy, vx) + Math.PI + (Math.random() - 0.5) * 1.2;
        const spd = (Math.random() * 25 + 10) * Math.min(1.5, Math.sqrt(vx*vx + vy*vy) * 2);
        const dx = Math.cos(angle) * spd;
        const dy = Math.sin(angle) * spd + 8;

        const spark = document.createElement('div');
        spark.className = 'spark-particle absolute rounded-full pointer-events-none z-50';
        spark.style.left = `${x}px`;
        spark.style.top = `${y}px`;
        const color = colors[Math.floor(Math.random() * colors.length)];
        spark.style.backgroundColor = color;
        spark.style.boxShadow = `0 0 6px ${color}`;
        spark.style.setProperty('--dx', `${dx}px`);
        spark.style.setProperty('--dy', `${dy}px`);

        containerEl.appendChild(spark);
        setTimeout(() => spark.remove(), 700);
      }
    };

    const updateLines = () => {
      if (!active) return;
      
      const containerEl = containerRef.current;
      if (!containerEl) {
        requestAnimationFrame(updateLines);
        return;
      }
      
      const containerRect = containerEl.getBoundingClientRect();

      // Resolve AABB collisions between popups in real-time
      const terms = Object.keys(activeGlossaries);
      for (let i = 0; i < terms.length; i++) {
        for (let j = i + 1; j < terms.length; j++) {
          const t1 = terms[i];
          const t2 = terms[j];
          const san1 = t1.replace(/\s+/g, '-');
          const san2 = t2.replace(/\s+/g, '-');
          const el1 = containerEl.querySelector(`.glossary-popup-${san1}`) as HTMLElement;
          const el2 = containerEl.querySelector(`.glossary-popup-${san2}`) as HTMLElement;
          if (el1 && el2) {
            const r1 = el1.getBoundingClientRect();
            const r2 = el2.getBoundingClientRect();
            if (r1.left < r2.right && r1.right > r2.left && r1.top < r2.bottom && r1.bottom > r2.top) {
              const overlapX = Math.min(r1.right - r2.left, r2.right - r1.left);
              const overlapY = Math.min(r1.bottom - r2.top, r2.bottom - r1.top);

              if (overlapX < overlapY) {
                const dir = (r1.left + r1.width / 2) < (r2.left + r2.width / 2) ? -1 : 1;
                const drag1 = draggingPopupsRef.current[t1];
                const drag2 = draggingPopupsRef.current[t2];
                if (drag1 && !drag2) {
                  const left2 = parseFloat(el2.style.left) || 0;
                  el2.style.left = `${left2 + overlapX * dir * -1}px`;
                } else if (drag2 && !drag1) {
                  const left1 = parseFloat(el1.style.left) || 0;
                  el1.style.left = `${left1 + overlapX * dir}px`;
                } else {
                  const left1 = parseFloat(el1.style.left) || 0;
                  const left2 = parseFloat(el2.style.left) || 0;
                  el1.style.left = `${left1 + (overlapX / 2) * dir}px`;
                  el2.style.left = `${left2 + (overlapX / 2) * dir * -1}px`;
                }
              } else {
                const dir = (r1.top + r1.height / 2) < (r2.top + r2.height / 2) ? -1 : 1;
                const drag1 = draggingPopupsRef.current[t1];
                const drag2 = draggingPopupsRef.current[t2];
                if (drag1 && !drag2) {
                  const top2 = parseFloat(el2.style.top) || 0;
                  el2.style.top = `${top2 + overlapY * dir * -1}px`;
                } else if (drag2 && !drag1) {
                  const top1 = parseFloat(el1.style.top) || 0;
                  el1.style.top = `${top1 + overlapY * dir}px`;
                } else {
                  const top1 = parseFloat(el1.style.top) || 0;
                  const top2 = parseFloat(el2.style.top) || 0;
                  el1.style.top = `${top1 + (overlapY / 2) * dir}px`;
                  el2.style.top = `${top2 + (overlapY / 2) * dir * -1}px`;
                }
              }
            }
          }
        }
      }

      // Draw thinner paths connected to center of popups
      terms.forEach(term => {
        const sanitized = term.replace(/\s+/g, '-');
        const wordEl = containerEl.querySelector(`.glossary-word-${sanitized}`);
        const popupEl = containerEl.querySelector(`.glossary-popup-${sanitized}`);
        const pathEl = containerEl.querySelector(`.glossary-path-${sanitized}`);

        if (wordEl && popupEl && pathEl) {
          const wordRect = wordEl.getBoundingClientRect();
          const popupRect = popupEl.getBoundingClientRect();

          const wordX = wordRect.left + wordRect.width / 2 - containerRect.left;
          const isAbove = (popupRect.top + popupRect.height / 2) < (wordRect.top + wordRect.height / 2);
          const wordY = isAbove 
            ? wordRect.top - containerRect.top 
            : wordRect.bottom - containerRect.top;

          // Set directly to popup center
          const popupX = popupRect.left + popupRect.width / 2 - containerRect.left;
          const popupY = popupRect.top + popupRect.height / 2 - containerRect.top;

          // Draw bezier curves curving around word
          const cx = (wordX + popupX) / 2;
          const cy = isAbove ? Math.min(wordY, popupY) - 55 : Math.max(wordY, popupY) + 55;
          const d = `M ${wordX} ${wordY} Q ${cx} ${cy} ${popupX} ${popupY}`;
          pathEl.setAttribute('d', d);

          // Spawn sparks on popup corners during momentum glide
          const px = popupRect.left - containerRect.left;
          const py = popupRect.top - containerRect.top;
          const w = popupRect.width;
          const h = popupRect.height;
          const corners = [
            { x: px, y: py }, // top left
            { x: px + w, y: py }, // top right
            { x: px, y: py + h }, // bottom left
            { x: px + w, y: py + h } // bottom right
          ];

          const currentPos = { x: popupRect.left, y: popupRect.top };
          const last = lastPositionsRef.current[term];
          const now = Date.now();
          if (last) {
            const dt = now - last.time;
            if (dt > 0) {
              const dx = currentPos.x - last.x;
              const dy = currentPos.y - last.y;
              const velocity = Math.sqrt(dx*dx + dy*dy) / dt; // px/ms
              if (velocity > 0.05 && !draggingPopupsRef.current[term]) {
                if (Math.random() < Math.min(1, velocity * 2.5)) {
                  corners.forEach(c => {
                    spawnSparksDOM(containerEl, c.x, c.y, dx, dy);
                  });
                }
              }
            }
          }
          lastPositionsRef.current[term] = { ...currentPos, time: now };
        }
      });

      requestAnimationFrame(updateLines);
    };

    updateLines();
    return () => {
      active = false;
    };
  }, [activeGlossaries, leftWidth]);

  // Window-level layout dragging event listeners (extremely smooth direct DOM updates)
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const posX = e.clientX - rect.left;
      const pct = Math.max(20, Math.min(80, (posX / rect.width) * 100));
      
      const leftPanel = containerRef.current.querySelector('.left-panel') as HTMLElement;
      const rightPanel = containerRef.current.querySelector('.right-panel') as HTMLElement;
      if (leftPanel && rightPanel && window.innerWidth >= 1024) {
        leftPanel.style.width = `${pct}%`;
        rightPanel.style.width = `${100 - pct}%`;
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (isDraggingRef.current) {
        isDraggingRef.current = false;
        document.body.style.userSelect = '';
        document.body.style.cursor = '';
        
        // Commit final layout size
        if (containerRef.current) {
          const rect = containerRef.current.getBoundingClientRect();
          const posX = e.clientX - rect.left;
          const pct = Math.max(20, Math.min(80, (posX / rect.width) * 100));
          setLeftWidth(pct);
        }
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  // Drag handlers for vertical layout line
  const handleMouseDown = () => {
    isDraggingRef.current = true;
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'col-resize';
  };

  // TTS Controls (Instantly processes speak and cancel actions with queue delays)
  const handleStartTTS = () => {
    if (typeof window === 'undefined') return;
    const synth = window.speechSynthesis;
    if (!synth) return;
    
    if (isPaused) {
      synth.resume();
      setIsPaused(false);
      setIsSpeaking(true);
      return;
    }

    synth.cancel();
    
    setTimeout(() => {
      const utterance = new SpeechSynthesisUtterance(lessonText);
      utterance.rate = 1.0;
      utterance.pitch = 1.05;
      
      utterance.onend = () => {
        setIsSpeaking(false);
        setIsPaused(false);
      };

      utterance.onerror = () => {
        setIsSpeaking(false);
        setIsPaused(false);
      };

      utteranceRef.current = utterance;
      synth.speak(utterance);
      setIsSpeaking(true);
      setIsPaused(false);
    }, 50);
  };

  const handlePauseTTS = () => {
    if (typeof window === 'undefined') return;
    const synth = window.speechSynthesis;
    if (synth && isSpeaking) {
      synth.pause();
      setIsPaused(true);
      setIsSpeaking(false);
    }
  };

  const handleStopTTS = () => {
    if (typeof window === 'undefined') return;
    const synth = window.speechSynthesis;
    if (synth) {
      synth.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
    }
  };

  const hasAlreadyBorrowed = portfolio?.hasBorrowed || false;
  const currentBorrowedAmount = portfolio?.borrowedAmount || 0;
  const currentInterestRate = portfolio?.interestRate || 0;

  // Calculate dynamic interest rate based on borrow amount (e.g. 4.8% at $1k, 8% at $5k, 12% at $10k)
  const calculateRate = (amount: number) => {
    return 0.04 + (amount / 10000) * 0.08;
  };

  const currentRate = calculateRate(borrowValue);

  // Compounding Calculations
  const simpleInterestOwed = borrowValue * (1 + currentRate);
  const compoundedOwed = borrowValue * Math.pow(1 + currentRate / 365, 365);
  const compoundingDifference = compoundedOwed - simpleInterestOwed;

  // Compounding Timeline for detailed examples
  const getCompoundingTimeline = () => {
    const days = [30, 90, 180, 365];
    return days.map(d => {
      const simple = borrowValue * (1 + (currentRate * d / 365));
      const compounded = borrowValue * Math.pow(1 + currentRate / 365, d);
      return {
        days: d,
        simple,
        compounded,
        diff: compounded - simple
      };
    });
  };

  const timelineData = getCompoundingTimeline();

  // Leverage comparison calculations
  const initialEquity = 5000;
  const leverageLoan = borrowValue;
  const leverageTotalSize = initialEquity + leverageLoan;

  const noLeverageReturn = initialEquity * marketReturnPercent * (marketReturnDirection === 'up' ? 1 : -1);
  const noLeverageFinalVal = initialEquity + noLeverageReturn;

  const leverageReturn = leverageTotalSize * marketReturnPercent * (marketReturnDirection === 'up' ? 1 : -1);
  const leverageInterestCost = compoundedOwed - leverageLoan; 
  const leverageFinalVal = initialEquity + leverageReturn - leverageInterestCost;

  // Spawning Confetti
  const triggerConfetti = () => {
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6'];
    const generatePieces = (count: number) => {
      return Array.from({ length: count }).map((_, i) => ({
        id: Math.random() + i,
        x: Math.random() * 100,
        y: Math.random() * -15 - 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 8 + 6,
        delay: Math.random() * 0.5,
        duration: Math.random() * 2.5 + 2
      }));
    };

    setConfetti(generatePieces(45));

    // Spawn more for first 1.5 seconds, then stop spawning but let remains fall
    confettiIntervalRef.current = setInterval(() => {
      setConfetti(prev => [...prev, ...generatePieces(10)]);
    }, 300);

    setTimeout(() => {
      if (confettiIntervalRef.current) {
        clearInterval(confettiIntervalRef.current);
      }
    }, 1500);
  };

  const calculateScorePercent = () => {
    let correctCount = 0;
    quizQuestions.forEach(q => {
      if (selectedAnswers[q.id] === q.correctAnswer) correctCount++;
    });
    return Math.round((correctCount / quizQuestions.length) * 100);
  };

  // Handle Quiz Submission
  const handleQuizSubmit = () => {
    let allCorrect = true;
    let answeredAll = true;

    quizQuestions.forEach((q) => {
      if (selectedAnswers[q.id] === undefined) {
        answeredAll = false;
      } else if (selectedAnswers[q.id] !== q.correctAnswer) {
        allCorrect = false;
      }
    });

    if (!answeredAll) {
      setQuizError('Please answer all 5 questions before submitting.');
      return;
    }

    setQuizError(null);
    setQuizSubmitted(true);
    if (allCorrect) {
      setCelebrationStep('lock');
      triggerConfetti();

      // Step 2: Transition to text with smooth spring delay
      setTimeout(() => {
        setCelebrationStep('text');
      }, 1500);

      // Step 3: Complete and swap container
      setTimeout(() => {
        setCelebrationStep('done');
        setQuizPassed(true);
        localStorage.setItem('lesson_1_completed', 'true');
      }, 4800);
    } else {
      setQuizPassed(false);
      setQuizError('Some answers were incorrect. Please review the lesson and try again!');
    }
  };

  const handleResetQuiz = () => {
    setSelectedAnswers({});
    setQuizSubmitted(false);
    setQuizPassed(false);
    setQuizError(null);
    setConfetti([]);
    setCelebrationStep('none');
  };

  const handleOpenBorrowConfirm = () => {
    if (!quizPassed && !hasAlreadyBorrowed) {
      setErrorMsg('You must pass the quiz first to unlock the borrowing feature.');
      return;
    }
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
      const res = await borrowMoney(borrowValue, currentRate);
      if (res.success) {
        setSuccessMsg(`Successfully borrowed $${borrowValue.toLocaleString()}! Redirecting to your dashboard to view your updated assets...`);
        setShowConfirmModal(false);
        localStorage.setItem('lesson_1_completed_at', Date.now().toString());
        localStorage.setItem('lesson_1_completed', 'true');
        localStorage.setItem('borrowed_just_now', borrowValue.toString());
        await fetchPortfolio();
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 855);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during borrowing.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Glossary interactions
  const handleGlossaryInteraction = (term: string, e: React.MouseEvent, forcePin = false) => {
    const existing = activeGlossaries[term];
    if (existing?.isPinned && !forcePin) return;

    const wordEl = e.currentTarget as HTMLElement;
    const wordRect = wordEl.getBoundingClientRect();
    const containerEl = containerRef.current;
    if (!containerEl) return;
    const containerRect = containerEl.getBoundingClientRect();

    const wordX = wordRect.left + wordRect.width / 2 - containerRect.left;
    const wordY = wordRect.top + wordRect.height / 2 - containerRect.top;

    setActiveGlossaries(prev => ({
      ...prev,
      [term]: {
        term,
        definition: glossaryDefinitions[term] || "",
        wordX,
        wordY,
        wordHeight: wordRect.height,
        dragX: existing?.dragX || 0,
        dragY: existing?.dragY || 0,
        isPinned: forcePin || existing?.isPinned || false,
        // Stagger default offsets for multiple popups to avoid stacking on top of each other
        defaultX: wordX + 20 + (Object.keys(prev).length * 15),
        defaultY: wordY - 145 - (Object.keys(prev).length * 10)
      }
    }));
  };

  // Drag End handler to check velocity for Sparks throwing effect
  const handleDragEnd = (term: string, _: any, info: any) => {
    const vx = info.velocity.x;
    const vy = info.velocity.y;
    const speed = Math.sqrt(vx * vx + vy * vy);

    // sparks only on throw (upon release), not during active cursor drag
    if (speed > 250) {
      const containerEl = containerRef.current;
      const popupEl = containerEl?.querySelector(`.glossary-popup-${term}`);
      if (containerEl && popupEl) {
        const containerRect = containerEl.getBoundingClientRect();
        const popupRect = popupEl.getBoundingClientRect();
        
        // Popup box corner coordinates relative to container
        const px = popupRect.left - containerRect.left;
        const py = popupRect.top - containerRect.top;
        const w = popupRect.width;
        const h = popupRect.height;
        const corners = [
          { x: px, y: py }, // top left
          { x: px + w, y: py }, // top right
          { x: px, y: py + h }, // bottom left
          { x: px + w, y: py + h } // bottom right
        ];

        // Generate few, highly efficient trails
        const newSparks: Spark[] = [];
        corners.forEach(c => {
          for (let i = 0; i < 3; i++) {
            const angle = Math.atan2(vy, vx) + Math.PI + (Math.random() - 0.5) * 1.2;
            const spd = (Math.random() * 40 + 20) * (speed / 1000); // Distance to travel
            const dx = Math.cos(angle) * spd;
            const dy = Math.sin(angle) * spd + 15; // include slight gravity fall
            newSparks.push({
              id: Math.random() + i,
              x: c.x,
              y: c.y,
              dx,
              dy,
              color: ['#059669', '#10b981', '#3b82f6'][Math.floor(Math.random() * 3)]
            });
          }
        });
        setSparks(prev => [...prev.slice(-30), ...newSparks]);
      }
    }
  };

  const handleCloseGlossary = (term: string) => {
    setActiveGlossaries(prev => {
      const copy = { ...prev };
      delete copy[term];
      return copy;
    });
  };

  const showCelebrationOverlay = celebrationStep === 'lock' || celebrationStep === 'text';

  // Helper to render glossary terms in text dynamically
  const formatTextWithGlossary = (text: string) => {
    let elements: React.ReactNode[] = [];
    let currentText = text;

    Object.keys(glossaryDefinitions).forEach((term) => {
      const index = currentText.indexOf(term);
      if (index !== -1) {
        elements.push(currentText.substring(0, index));
        elements.push(
          <span
            key={term}
            onMouseEnter={(e) => handleGlossaryInteraction(term, e)}
            onMouseLeave={() => {
              const existing = activeGlossaries[term];
              if (existing && !existing.isPinned) {
                setActiveGlossaries(prev => {
                  const copy = { ...prev };
                  delete copy[term];
                  return copy;
                });
              }
            }}
            onClick={(e) => handleGlossaryInteraction(term, e, true)}
            className={`glossary-word-${term.replace(/\s+/g, '-')} underline decoration-dotted decoration-emerald-500 hover:decoration-emerald-400 font-extrabold text-emerald-600 dark:text-emerald-400 cursor-pointer select-none transition-all px-0.5`}
          >
            {term}
          </span>
        );
        currentText = currentText.substring(index + term.length);
      }
    });

    elements.push(currentText);
    return elements;
  };

  return (
    <div className={`space-y-6 w-full pb-16 px-2 font-txt-${textFont}`}>
      
      {/* Header and Back navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/lesson"
            className="h-10 w-10 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 shadow-sm transition-all"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Debt & Leverage Module
            </h1>
            <p className="text-xs text-slate-500">Learn side-by-side with interactive voice narration and test your skills</p>
          </div>
        </div>
        
        {/* Status completion indicator badge (Green when completed, Grey when not) */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-2xl border border-slate-200 dark:border-slate-850 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm self-start">
          <div className={`h-2.5 w-2.5 rounded-full ${hasAlreadyBorrowed ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
          <span className={`text-xs font-bold ${hasAlreadyBorrowed ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500'}`}>
            {hasAlreadyBorrowed ? 'Completed' : 'Not Completed'}
          </span>
        </div>
      </div>

      {/* SIDE-BY-SIDE DRAGGABLE LAYOUT (Taller dimensions: min-h-[1100px]) */}
      <div 
        ref={containerRef}
        className="flex flex-col lg:flex-row items-stretch gap-0 relative rounded-[32px] overflow-hidden border border-slate-200 dark:border-slate-700/50 shadow-2xl bg-white dark:bg-[#1a2133]/90"
      >
        
        {/* SVG Connecting Line Overlay (updated dynamically at DOM level via requestAnimationFrame) */}
        <svg className="absolute inset-0 z-35 pointer-events-none w-full h-full">
          <defs>
            <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#059669" />
              <stop offset="50%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
          </defs>
          {Object.values(activeGlossaries).map(g => (
            <path
              key={g.term}
              className={`glossary-path-${g.term.replace(/\s+/g, '-')} animate-[dash_1.5s_ease-out_infinite]`}
              fill="none"
              stroke="url(#lineGrad)"
              strokeWidth="2.5"
              strokeLinecap="round"
              style={{
                strokeDasharray: '8, 4'
              }}
            />
          ))}
        </svg>

        {/* Lightweight Spark particles trails */}
        {sparks.map(s => (
          <div
            key={s.id}
            className="absolute rounded-full pointer-events-none z-50 spark-particle"
            style={{
              left: `${s.x}px`,
              top: `${s.y}px`,
              '--dx': `${s.dx}px`,
              '--dy': `${s.dy}px`,
              backgroundColor: s.color,
              boxShadow: `0 0 6px ${s.color}`
            } as React.CSSProperties}
          />
        ))}

        {/* Render multiple active/pinned popups inside container bounds */}
        {Object.values(activeGlossaries).map(g => {
          return (
            <motion.div
              key={g.term}
              drag
              dragConstraints={containerRef}
              dragElastic={0.4}
              dragMomentum={true}
              dragTransition={{ power: 0.25, bounceStiffness: 180, bounceDamping: 15 }}
              onDragStart={() => {
                draggingPopupsRef.current[g.term] = true;
              }}
              onDragEnd={(e, info) => {
                draggingPopupsRef.current[g.term] = false;
                handleDragEnd(g.term, e, info);
              }}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`glossary-popup-${g.term.replace(/\s+/g, '-')} absolute z-40 p-5 rounded-2xl bg-slate-900/95 dark:bg-slate-800/95 border-2 border-emerald-500 text-white shadow-2xl w-60 select-none cursor-grab active:cursor-grabbing backdrop-blur-md`}
              style={{
                left: g.defaultX,
                top: g.defaultY
              }}
            >
              {g.isPinned && (
                <button
                  onClick={() => handleCloseGlossary(g.term)}
                  className="absolute top-2 right-2 flex items-center justify-center h-5 w-5 bg-white/10 hover:bg-white/20 rounded-md transition-colors"
                >
                  <svg className="h-3 w-3 stroke-white" viewBox="0 0 24 24" fill="none" strokeWidth="3">
                    <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
                  </svg>
                </button>
              )}
              <span className="block text-[10px] font-black uppercase text-emerald-400 mb-1">
                {g.term}
              </span>
              <p className="text-[11px] text-slate-200 leading-relaxed font-semibold">
                {g.definition}
              </p>
              {g.isPinned && (
                <span className="block text-[8px] text-slate-455 mt-2 italic">
                  📌 Drag and throw me inside container!
                </span>
              )}
            </motion.div>
          );
        })}

        {/* LEFT PANEL: The Voice Lesson */}
        <div 
          className="left-panel w-full lg:w-1/2 flex flex-col justify-between p-8 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-700/50 min-h-[1100px] transition-all duration-75"
          style={{ width: typeof window !== 'undefined' && window.innerWidth >= 1024 ? `${leftWidth}%` : undefined }}
        >
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
              <span className="text-xs font-extrabold uppercase text-blue-600 dark:text-blue-400 tracking-wider flex items-center gap-1.5">
                <BookOpen className="h-4 w-4" /> Lesson Guide
              </span>
              <span className="text-[10px] font-bold text-slate-400">Audio Narration Available</span>
            </div>

            {/* TTS Narration Controls */}
            <div className="flex items-center gap-3 p-4 bg-slate-550/5 dark:bg-slate-900/40 rounded-2xl border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${isSpeaking ? 'bg-blue-600 text-white animate-pulse' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                  {isSpeaking ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                </div>
                <div>
                  <span className="block text-[9px] uppercase font-bold text-slate-400">Audio Tutor</span>
                  <span className="block text-xs font-semibold text-slate-700 dark:text-slate-350">
                    {isSpeaking ? 'Reading lesson aloud...' : isPaused ? 'Narration paused' : 'Voice-over tutorial'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 ml-auto">
                {!isSpeaking || isPaused ? (
                  <button
                    onClick={handleStartTTS}
                    className="p-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-md transition-colors"
                    title="Play"
                  >
                    <Play className="h-3.5 w-3.5 fill-current" />
                  </button>
                ) : (
                  <button
                    onClick={handlePauseTTS}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors"
                    title="Pause"
                  >
                    <Pause className="h-3.5 w-3.5 fill-current" />
                  </button>
                )}
                <button
                  onClick={handleStopTTS}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors"
                  title="Stop"
                >
                  <Square className="h-3.5 w-3.5 fill-current" />
                </button>
              </div>
            </div>

            {/* In-depth educational text with glossary anchors */}
            <div className="space-y-6 text-xs md:text-sm text-slate-655 dark:text-slate-300 leading-relaxed font-medium">
              
              <div className="space-y-2">
                <h3 className="text-sm font-extrabold text-slate-850 dark:text-white flex items-center gap-2">
                  <span className="h-5 w-5 rounded-lg bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs font-black">1</span>
                  Debt & The Concept of Liabilities
                </h3>
                <p>
                  A {formatTextWithGlossary("Liability")} represents something you owe to another party. In investment modules, borrowing cash to invest introduces a temporary liability. It allows you to trade with more capital, but requires you to eventually settle the debt, paying back the principal plus compounding fees.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-extrabold text-slate-850 dark:text-white flex items-center gap-2">
                  <span className="h-5 w-5 rounded-lg bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs font-black">2</span>
                  How Leverage Multiplies Capital
                </h3>
                <p>
                  {formatTextWithGlossary("Leverage")} acts as an investment size multiplier. By adding borrowed funds (for example, a dynamic loan) to your initial portfolio equity, you can control significantly larger stock positions. While a 20% gain on leveraged capital yields twice the return, a 20% drop wipes out double your cash equity.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-extrabold text-slate-850 dark:text-white flex items-center gap-2">
                  <span className="h-5 w-5 rounded-lg bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs font-black">3</span>
                  The Cost of Daily Compounding
                </h3>
                <p>
                  {formatTextWithGlossary("Daily Compounding")} calculates interest charges every single day. Instead of simple annual rates, each day's interest fee is computed as:
                  Daily Fee = Current Balance * (Rate / 365)
                  This fee is appended to your liability balance. Over time, you begin paying interest on top of accumulated interest fees, driving debt growth exponentially higher.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-extrabold text-slate-850 dark:text-white flex items-center gap-2">
                  <span className="h-5 w-5 rounded-lg bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs font-black">4</span>
                  Why Lenders Use Dynamic Pricing
                </h3>
                <p>
                  A {formatTextWithGlossary("Dynamic Interest Rate")} is scale-dependent. If you borrow more capital, lenders face a higher risk that you won't be able to pay it back. To compensate for this elevated portfolio default risk, the interest rate automatically increases as the borrowed sum goes up.
                </p>
              </div>

            </div>
          </div>

          <div className="p-4 bg-emerald-50/20 dark:bg-emerald-950/10 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl flex items-center gap-2 mt-6">
            <Sparkles className="h-4.5 w-4.5 text-emerald-555 shrink-0 animate-pulse" />
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold leading-normal">
              Hover over terms to view definitions. Click to pin multiple popups, then drag and throw them around!
            </span>
          </div>
        </div>

        {/* VERTICAL DRAGGABLE DIVIDER LINE */}
        <div 
          onMouseDown={handleMouseDown}
          className="hidden lg:flex w-2.5 hover:w-3 bg-slate-100 hover:bg-blue-500/30 dark:bg-[#151b2a] dark:hover:bg-blue-400/20 items-center justify-center cursor-col-resize select-none transition-all relative z-40 border-l border-r border-slate-200 dark:border-slate-800"
        >
          <ChevronsLeftRight className="h-4 w-4 text-slate-400 dark:text-slate-500" />
        </div>

        {/* RIGHT PANEL: Quiz Swapped with Loaning Parameters */}
        <div 
          className="right-panel w-full lg:w-1/2 flex flex-col justify-between min-h-[1100px] relative overflow-hidden"
          style={{ width: typeof window !== 'undefined' && window.innerWidth >= 1024 ? `${100 - leftWidth}%` : undefined }}
        >
          {/* Confetti Animation Layer */}
          {confetti.length > 0 && (
            <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
              {confetti.map((p) => (
                <div
                  key={p.id}
                  className="absolute rounded-full"
                  style={{
                    left: `${p.x}%`,
                    top: `${p.y}%`,
                    width: `${p.size}px`,
                    height: `${p.size}px`,
                    backgroundColor: p.color,
                    opacity: 0.8,
                    animation: `fall ${p.duration}s linear forwards`,
                    animationDelay: `${p.delay}s`,
                  }}
                />
              ))}
            </div>
          )}

          {/* Backdrop blur during active transitions */}
          {showCelebrationOverlay && (
            <div className="absolute inset-0 z-20 bg-slate-900/10 dark:bg-slate-950/20 backdrop-blur-[8px] transition-all duration-500" />
          )}

          {/* Celebrations overlay sequence */}
          <AnimatePresence>
            {showCelebrationOverlay && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-40 flex flex-col items-center justify-center p-6 bg-white/95 dark:bg-[#1a2133]/95"
              >
                <div className="flex flex-col items-center space-y-4 max-w-sm text-center relative w-full h-80">
                  
                  {/* Lock unlocks and smoothly shrinks / moves up */}
                  <motion.div
                    initial={{ scale: 1.5, y: 30 }}
                    animate={
                      celebrationStep === 'lock' 
                        ? { scale: 1.5, y: 30 } 
                        : { scale: 0.8, y: -40 }
                    }
                    transition={{ type: 'spring', stiffness: 70, damping: 20 }}
                    className="h-16 w-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-xl mx-auto absolute inset-x-0 top-16"
                  >
                    <Unlock className="h-8 w-8" />
                  </motion.div>

                  {/* Fade in congratulations text */}
                  {celebrationStep === 'text' && (
                    <motion.div
                      initial={{ opacity: 0, y: 40 }}
                      animate={{ opacity: 1, y: 20 }}
                      transition={{ duration: 0.6 }}
                      className="space-y-2 absolute inset-x-0 bottom-6"
                    >
                      <h3 className="text-xl font-black text-slate-905 dark:text-white flex items-center justify-center gap-1">
                        <Sparkles className="h-5 w-5 text-amber-500 animate-pulse" />
                        Perfect Score!
                      </h3>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                        Congrats! You finished the quiz with {calculateScorePercent()}%!
                      </p>
                      <p className="text-xs text-slate-500">
                        Swapping to Loaning Simulators...
                      </p>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* CONTAINER SWAP */}
          {(!quizPassed && !hasAlreadyBorrowed) ? (
            // STATE A: SHOW QUIZ
            <div className="flex flex-col justify-between h-full">
              
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg flex items-center justify-center bg-amber-100 text-amber-600">
                    <Lock className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-md font-bold text-slate-800 dark:text-white">Knowledge Lock Check (5 Problems)</h3>
                    <p className="text-[10px] text-slate-455 font-semibold">Pass with 100% to unlock simulator loans</p>
                  </div>
                </div>
              </div>

              {/* Quiz questions list */}
              <div className="p-6 space-y-6 flex-1 overflow-y-auto max-h-[820px]">
                {quizQuestions.map((q, idx) => (
                  <div key={q.id} className="space-y-3 p-4 bg-slate-550/5 dark:bg-slate-900/25 rounded-2xl border border-slate-100 dark:border-slate-800/80">
                    <h4 className="text-xs font-extrabold text-slate-850 dark:text-slate-200">
                      Problem {idx + 1}: {q.question}
                    </h4>
                    <div className="space-y-2">
                      {q.options.map((opt, oIdx) => {
                        const isSelected = selectedAnswers[q.id] === oIdx;
                        const isCorrect = q.correctAnswer === oIdx;
                        let optionStyle = "border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/40";
                        
                        if (quizSubmitted) {
                          if (isSelected) {
                            optionStyle = isCorrect
                              ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400"
                              : "border-rose-500 bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-450";
                          } else if (isCorrect) {
                            optionStyle = "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/10 text-emerald-750 dark:text-emerald-400";
                          }
                        } else if (isSelected) {
                          optionStyle = "border-blue-600 bg-blue-50/50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400";
                        }

                        return (
                          <button
                            key={oIdx}
                            disabled={quizSubmitted && quizPassed}
                            onClick={() => {
                              if (quizSubmitted && !quizPassed) {
                                setQuizSubmitted(false);
                                setQuizError(null);
                              }
                              setSelectedAnswers(prev => ({ ...prev, [q.id]: oIdx }));
                            }}
                            className={`w-full text-left p-3.5 rounded-xl border text-xs font-semibold transition-all flex items-center justify-between ${optionStyle}`}
                          >
                            <span>{opt}</span>
                            {isSelected && (
                              <div className={`h-4.5 w-4.5 rounded-full flex items-center justify-center shrink-0 border ${
                                quizSubmitted
                                  ? isCorrect
                                    ? 'bg-emerald-500 border-emerald-500 text-white'
                                    : 'bg-rose-500 border-rose-500 text-white'
                                  : 'bg-blue-600 border-blue-600 text-white'
                              }`}>
                                <span className="text-[9px] font-black">✓</span>
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/30 dark:bg-slate-900/20">
                <div>
                  {quizError && (
                    <p className="text-xs font-bold text-rose-600 dark:text-rose-405 flex items-center gap-1.5">
                      <AlertTriangle className="h-4 w-4 shrink-0" />
                      {quizError}
                    </p>
                  )}
                </div>

                <div className="flex gap-2 w-full sm:w-auto justify-end">
                  {quizSubmitted && !quizPassed && (
                    <button
                      onClick={handleResetQuiz}
                      className="px-5 py-2 bg-slate-100 dark:bg-slate-800 text-slate-705 dark:text-slate-300 font-bold rounded-xl text-xs border border-slate-200 dark:border-slate-700 hover:bg-slate-200 transition-colors"
                    >
                      Retry Quiz
                    </button>
                  )}
                  {(!quizSubmitted || !quizPassed) && (
                    <button
                      onClick={handleQuizSubmit}
                      className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl text-xs hover:bg-blue-500 transition-colors shadow-md"
                    >
                      Submit Answers
                    </button>
                  )}
                </div>
              </div>

            </div>
          ) : (
            // STATE B: SHOW LOAN INTERACTIVES IN MAIN RIGHT CONTAINER
            <div className="flex flex-col justify-between h-full p-8 space-y-6 overflow-y-auto max-h-[1100px]">
              
              <div className="border-b border-slate-100 dark:border-slate-800/80 pb-4">
                <span className="text-[9px] font-black uppercase tracking-wider text-emerald-500 px-2.5 py-0.5 bg-emerald-100 dark:bg-emerald-950/30 rounded-full inline-block mb-1">
                  Simulator Unlocked
                </span>
                <h3 className="text-lg font-black text-slate-850 dark:text-white">Loaning & Leverage Portal</h3>
                <p className="text-xs text-slate-550">Configure your dynamic loan parameters and apply them directly</p>
              </div>

              {/* Slider principal widget */}
              <div className="space-y-4">
                <div className="space-y-2 p-4 bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 rounded-2xl">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400">Borrow Principal</span>
                    <span className={`text-2xl font-black text-blue-600 dark:text-blue-400 font-num-${numberFont}`}>
                      ${borrowValue.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] font-bold text-slate-450 font-num-${numberFont}`}>$1k</span>
                    <input
                      type="range"
                      min="1000"
                      max="10000"
                      step="500"
                      disabled={hasAlreadyBorrowed}
                      value={borrowValue}
                      onChange={(e) => setBorrowValue(Number(e.target.value))}
                      className="flex-1 h-2.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600 disabled:opacity-60"
                    />
                    <span className={`text-[10px] font-bold text-slate-450 font-num-${numberFont}`}>$10k</span>
                  </div>
                </div>

                {/* Pricing summary */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 bg-slate-50/50 dark:bg-slate-900/20 border border-slate-100 dark:border-slate-800 rounded-xl text-center">
                    <span className="block text-[9px] font-bold text-slate-400 uppercase">Dynamic Rate</span>
                    <span className={`text-xs font-black text-slate-805 dark:text-white font-num-${numberFont}`}>
                      {(currentRate * 100).toFixed(2)}%
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50/50 dark:bg-slate-900/20 border border-slate-100 dark:border-slate-800 rounded-xl text-center">
                    <span className="block text-[9px] font-bold text-slate-400 uppercase">Simple Interest</span>
                    <span className={`text-xs font-black text-slate-805 dark:text-white font-num-${numberFont}`}>
                      ${simpleInterestOwed.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-900 text-white rounded-xl text-center border border-slate-800">
                    <span className="block text-[9px] font-bold text-slate-455 uppercase">Daily Compounded</span>
                    <span className={`text-xs font-black text-blue-400 font-num-${numberFont}`}>
                      ${compoundedOwed.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Compounding timeline table */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-350">Compounding Timeline Comparison</h4>
                <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-805 bg-slate-50/40 dark:bg-slate-900/10 text-left text-xs">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-slate-100 dark:bg-slate-800 text-slate-500 uppercase text-[9px] font-extrabold border-b border-slate-200 dark:border-slate-700">
                        <th className="p-2.5">Timeline</th>
                        <th className="p-2.5 text-right">Simple Interest</th>
                        <th className="p-2.5 text-right">Compounded Daily</th>
                        <th className="p-2.5 text-right">Diff Penalty</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {timelineData.map(t => (
                        <tr key={t.days} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                          <td className="p-2.5 font-bold">{t.days} Days</td>
                          <td className="p-2.5 text-right font-num-sans text-slate-600 dark:text-slate-400">${t.simple.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                          <td className="p-2.5 text-right font-num-sans font-bold text-slate-700 dark:text-slate-300">${t.compounded.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                          <td className="p-2.5 text-right font-num-sans font-extrabold text-rose-500">+${t.diff.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Leverage outcomes simulator */}
              <div className="space-y-3 bg-slate-50/50 dark:bg-slate-900/20 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <span className="text-xs font-bold text-slate-850 dark:text-slate-200">Leverage Returns Simulator</span>
                  <div className="flex rounded-lg bg-slate-100 dark:bg-slate-800 p-0.5 border border-slate-200 dark:border-slate-700 shrink-0">
                    <button
                      onClick={() => setMarketReturnDirection('up')}
                      className={`px-2.5 py-1 rounded-lg text-[9px] font-bold transition-all ${
                        marketReturnDirection === 'up' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-550 hover:text-slate-800'
                      }`}
                    >
                      Market Up 20%
                    </button>
                    <button
                      onClick={() => setMarketReturnDirection('down')}
                      className={`px-2.5 py-1 rounded-lg text-[9px] font-bold transition-all ${
                        marketReturnDirection === 'down' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-550 hover:text-slate-850'
                      }`}
                    >
                      Market Down 20%
                    </button>
                  </div>
                </div>

                <div className="space-y-2 text-xs font-semibold">
                  <div className="flex justify-between items-center p-2.5 bg-white dark:bg-slate-850 border border-slate-100 dark:border-slate-800 rounded-xl">
                    <span className="text-slate-550">Without Leverage (Cash Only)</span>
                    <span className={`font-num-${numberFont} ${marketReturnDirection === 'up' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      ${noLeverageFinalVal.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-2.5 bg-blue-50/10 dark:bg-blue-900/10 border-2 border-blue-500/20 rounded-xl">
                    <span className="text-slate-555">With Leverage (Dynamic Loan)</span>
                    <span className={`font-num-${numberFont} ${leverageFinalVal > initialEquity ? 'text-emerald-500' : 'text-rose-500'}`}>
                      ${leverageFinalVal.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Active Portfolio apply action */}
              <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                {errorMsg && (
                  <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/30 text-rose-600 dark:text-rose-400 text-xs font-bold">
                    {errorMsg}
                  </div>
                )}
                {successMsg && (
                  <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/30 text-emerald-600 dark:text-emerald-450 text-xs font-bold flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 shrink-0" />
                    {successMsg}
                  </div>
                )}

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-slate-50/50 dark:bg-slate-800/30 border border-slate-150 dark:border-slate-800/80 rounded-2xl">
                  <div className="text-left">
                    <span className="text-[10px] font-extrabold text-slate-400 block uppercase">Final Parameter Check</span>
                    <span className={`text-md font-extrabold text-slate-850 dark:text-white font-num-${numberFont}`}>
                      Borrow ${borrowValue.toLocaleString()} @ {(currentRate * 100).toFixed(2)}%
                    </span>
                  </div>

                  <button
                    onClick={handleOpenBorrowConfirm}
                    disabled={hasAlreadyBorrowed || isSubmitting}
                    className={`w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all shrink-0 ${
                      hasAlreadyBorrowed
                        ? 'bg-slate-200 dark:bg-slate-800 text-slate-450 dark:text-slate-500 cursor-not-allowed border border-slate-200 dark:border-slate-700/50'
                        : 'bg-emerald-600 text-white hover:bg-emerald-505 hover:shadow-emerald-700/20 active:translate-y-[1px]'
                    }`}
                  >
                    {hasAlreadyBorrowed ? 'Already Borrowed' : 'Confirm & Apply Loan'}
                  </button>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>

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
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Confirm Loan</h3>
                <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                  Borrowing <span className="font-extrabold text-blue-600 dark:text-blue-400">${borrowValue.toLocaleString()}</span> means you will have an interest rate of <span className="font-extrabold text-amber-650">{(currentRate * 100).toFixed(2)}%</span> compounding daily.
                </p>
                <p className="text-[10px] font-black uppercase text-amber-500 tracking-wider">
                  You will owe ${compoundedOwed.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} after a year.
                </p>

                <div className="pt-4 flex gap-3">
                  <button
                    onClick={() => setShowConfirmModal(false)}
                    className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-350 font-bold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs transition-colors"
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

      {/* Confetti & Line Animation style keyframes */}
      <style jsx global>{`
        @keyframes fall {
          0% {
            transform: translateY(-20px) rotate(0deg);
          }
          100% {
            transform: translateY(1150px) rotate(360deg);
          }
        }
        @keyframes dash {
          to {
            stroke-dashoffset: -20;
          }
        }
        @keyframes spark-fade-move {
          0% {
            transform: translate(0, 0) scale(1);
            opacity: 1;
          }
          100% {
            transform: translate(var(--dx), var(--dy)) scale(0);
            opacity: 0;
          }
        }
        .spark-particle {
          width: 5px;
          height: 5px;
          animation: spark-fade-move 0.7s cubic-bezier(0.1, 0.8, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
}

// Icon fallbacks inside the file scope (since Lucide can be dynamic)
function X(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}
