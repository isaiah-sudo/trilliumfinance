'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, User, Sparkles } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

function TrilliumLogoMark({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="330 330 320 320"
      aria-hidden="true"
      className={`${className} transition-all duration-300 [&_path]:fill-current`}
    >
      <path d="M460 478v2c-1.65 1.5-3.404 2.82-5.176 4.172-4.331 4.34-5.255 8.855-5.262 14.828.145 5.502.343 9.008 4.438 13 7.41 5.527 13.79 6.867 23 6 7.996-2.028 14.412-6.118 19-13l1 10h-2l-.062 3.125c-1.96 15.159-14.199 28.396-25.594 37.46-27.369 20.233-63.328 23.847-96.281 19.29A148.4 148.4 0 0 1 338 565c1.454-17.931 17.3-38.924 29-52h2c.26-.584.52-1.168.79-1.77 8.19-15.088 30.315-26.191 46.21-31.105 7.189-2.028 14.545-3.128 21.938-4.125l3.158-.453c6.991-.823 12.347-.118 18.904 2.453" />
      <path d="M579.281 485.082c9.715 4.91 18.383 10.933 26.719 17.918l2.582 2.02c13.975 11.446 24.002 29.217 32.293 44.918.49.924.978 1.85 1.482 2.802l1.385 2.662 1.246 2.39c.949 2.07 1.546 3.985 2.012 6.208-28.394 16.311-70.951 15.934-101.937 8.188-16.248-4.75-30.312-11.896-42.442-23.672-2.571-2.553-2.571-2.553-5.422-4.703C495 542 495 542 494.375 539.75c.78-3.429 2.377-5.721 4.313-8.625C501.186 527.08 503 522.801 503 518l3.727.105q2.448.043 4.898.082l2.45.077c7.394.09 12.492-2.125 17.925-7.264 4.145-5.574 3.869-12.36 3-19-2.09-5.383-5.933-9.049-10-13v-2c16.74-5.58 38.982.717 54.281 8.082" />
      <path d="M489 338c4.223 1.646 7.072 4.77 10.188 7.938l1.745 1.763c5.046 5.162 9.65 10.589 14.067 16.299.737.92 1.475 1.84 2.234 2.79C530.117 383.27 538.371 401.614 543 422l.688 2.953c1.464 7.609 1.515 15.193 1.562 22.922l.028 3.28c-.023 5.672-.357 10.494-2.278 15.845l-6.8 1.36q-3.498.7-6.993 1.406l-1.982.399-5.71 1.151A298 298 0 0 1 512 473l2-1c.428-10.103.238-18.735-6-27v-2l-1.687-.812C504 441 504 441 501.5 439.375c-2.609-1.696-2.609-1.696-6.5-1.375v-2c-7.266 1.498-13.166 3.113-18 9-3.206 5.088-5.144 10.055-5.098 16.11l.01 2.285.026 2.355.013 2.402q.02 2.925.049 5.848c-5.807-.725-11.305-2.028-16.951-3.54-3.496-.908-6.826-1.572-10.428-1.897L441 468c-7.162-10.742-4.002-32.947-1.812-45.125.531-2.652 1.155-5.247 1.812-7.875l.488-1.955c7.427-28.739 24.967-51.418 46.184-71.557 1.55-1.404 1.55-1.404 1.328-3.488" />
      <path d="m565.063 583.188 3.2.212q3.872.264 7.737.6c-3.421 5.146-7.795 7.561-13.062 10.5l-2.597 1.47C535.295 610 535.295 610 523 610l-1 2c-1.898.379-1.898.379-4.375.563l-2.79.218L512 613l-2.336.281c-30.437 3.546-60.78-1.569-87.664-16.281a700 700 0 0 0-6-3v-2l-1.766-.344c-2.418-.71-3.96-1.669-5.984-3.156l-1.86-1.344L405 586v-1c25.63-3.041 25.63-3.041 36 4 25.273 13.816 57.357 13.511 84.5 6.125 10.636-3.259 10.636-3.259 20.433-8.406 6.492-4.164 11.576-4.194 19.13-3.532" />
    </svg>
  );
}

export default function ChatPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: 'Hello! I am your Trillium Finance AI Assistant. Ask me anything about virtual paper trading, compounding interest, leaderboard rankings, or our financial literacy pillars!',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const placeholders = [
    "Ask how to start trading with virtual cash...",
    "Ask about stock market trends...",
    "Ask what compounding interest is...",
    "Ask how rankings leaderboard XP works...",
    "Ask about AAPL and MSFT indices..."
  ];
  const [currentPlaceholderIdx, setCurrentPlaceholderIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPlaceholderIdx((prev) => (prev + 1) % placeholders.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  const handleSendMessage = () => {
    if (!inputValue.trim() || isThinking) return;

    const userMsgText = inputValue;
    const userMsg: Message = {
      id: Math.random().toString(),
      sender: 'user',
      text: userMsgText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsThinking(true);

    // Simulate AI response
    setTimeout(() => {
      let aiText = '';
      const textLower = userMsgText.toLowerCase();

      if (textLower.includes('hello') || textLower.includes('hi') || textLower.includes('hey')) {
        aiText = "Hello! How are you doing? I am ready to guide you through your trading practice today.";
      } else if (textLower.includes('how are you')) {
        aiText = "I'm doing fantastic! Ready to help you master the stock market. How are you doing today?";
      } else if (textLower.includes('trade') || textLower.includes('stock') || textLower.includes('paper')) {
        aiText = "Trillium Finance matches live market feeds with $100,000 in virtual cash so you can learn to invest in AAPL, MSFT, and indices with absolutely zero financial risk!";
      } else if (textLower.includes('xp') || textLower.includes('streak') || textLower.includes('leaderboard')) {
        aiText = "Completing daily check-ins and quests builds your streak! Climb the rankings leaderboard, unlock badges, and showcase your trading mastery to the community.";
      } else {
        aiText = "That sounds like a great question! Let's explore that topic by reviewing our Key Financial Literacy Pillars or testing your skills in the simulator.";
      }

      const aiMsg: Message = {
        id: Math.random().toString(),
        sender: 'ai',
        text: aiText,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsThinking(false);
    }, 1500);
  };

  return (
    <div className="w-full flex justify-center">
      {/* Container spans edge-to-edge on mobile/tablet, full-width with rounded corners on desktop */}
      <div className="w-full rounded-3xl border border-slate-200 dark:border-slate-700/50 bg-white/90 dark:bg-[#1a2133]/90 backdrop-blur-md shadow-[0_5px_0_0_#cbd5e1] dark:shadow-[0_5px_0_0_#121622] overflow-hidden flex flex-col h-[1100px] relative mx-auto">
        
        {/* Northern Lights Feature spanning the entire container background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute inset-0 bg-white/40 dark:bg-[#0f111a]/40 backdrop-blur-[1px]" />
          
          {/* Green Aurora Ribbon */}
          <motion.div
            animate={{
              x: isThinking ? [-150, 150, -150] : [-50, 50, -50],
              y: isThinking ? [20, -40, 20] : [5, -15, 5],
              scaleY: isThinking ? [1.1, 1.4, 1.1] : [1, 1.15, 1],
              opacity: isThinking ? 0.75 : 0.45,
            }}
            transition={{
              x: { duration: isThinking ? 4 : 12, repeat: Infinity, ease: "easeInOut" },
              y: { duration: isThinking ? 3 : 10, repeat: Infinity, ease: "easeInOut" },
              scaleY: { duration: isThinking ? 3.5 : 11, repeat: Infinity, ease: "easeInOut" },
              opacity: { duration: 1.5, ease: "easeInOut" },
            }}
            className="absolute -bottom-16 -left-[25%] w-[150%] h-[260px] rounded-full bg-gradient-to-r from-transparent via-emerald-500/40 via-teal-400/30 to-transparent blur-[80px] transform -rotate-[4deg] skew-x-12"
          />

          {/* Blue Aurora Ribbon */}
          <motion.div
            animate={{
              x: isThinking ? [150, -150, 150] : [50, -50, 50],
              y: isThinking ? [-40, 20, -40] : [-15, 5, -15],
              scaleY: isThinking ? [1.4, 1.1, 1.4] : [1.1, 1, 1.1],
              opacity: isThinking ? 0.8 : 0.5,
            }}
            transition={{
              x: { duration: isThinking ? 3.5 : 10, repeat: Infinity, ease: "easeInOut" },
              y: { duration: isThinking ? 2.5 : 9, repeat: Infinity, ease: "easeInOut" },
              scaleY: { duration: isThinking ? 3 : 10, repeat: Infinity, ease: "easeInOut" },
              opacity: { duration: 1.5, ease: "easeInOut" },
            }}
            className="absolute -bottom-24 -left-[25%] w-[150%] h-[300px] rounded-full bg-gradient-to-r from-transparent via-blue-500/40 via-cyan-400/30 to-transparent blur-[90px] transform rotate-[3deg] -skew-x-12"
          />

          {/* Purple Aurora Ribbon */}
          <motion.div
            animate={{
              x: isThinking ? [-120, 120, -120] : [-40, 40, -40],
              y: isThinking ? [30, -30, 30] : [10, -10, 10],
              scaleY: isThinking ? [1.2, 1.5, 1.2] : [1, 1.15, 1],
              opacity: isThinking ? 0.75 : 0.45,
            }}
            transition={{
              x: { duration: isThinking ? 4.5 : 14, repeat: Infinity, ease: "easeInOut" },
              y: { duration: isThinking ? 3.5 : 12, repeat: Infinity, ease: "easeInOut" },
              scaleY: { duration: isThinking ? 4 : 13, repeat: Infinity, ease: "easeInOut" },
              opacity: { duration: 1.5, ease: "easeInOut" },
            }}
            className="absolute -bottom-20 -left-[25%] w-[150%] h-[280px] rounded-full bg-gradient-to-r from-transparent via-purple-500/35 via-fuchsia-400/25 to-transparent blur-[80px] transform -rotate-[2deg]"
          />
        </div>

        {/* Messages area - Translucent to let Northern Lights shine through */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 z-10 relative bg-transparent">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`flex gap-3 max-w-[80%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
              >
                <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 border ${
                  msg.sender === 'user' 
                    ? 'bg-blue-600 border-blue-500 text-white' 
                    : 'bg-emerald-500 border-emerald-400 text-slate-900'
                }`}>
                  {msg.sender === 'user' ? (
                    <User className="h-4 w-4" />
                  ) : (
                    <TrilliumLogoMark className="h-4 w-4 text-slate-950" />
                  )}
                </div>
                <div className={`p-4 rounded-2xl text-sm leading-relaxed font-semibold shadow-md ${
                  msg.sender === 'user'
                    ? 'bg-blue-600/95 text-white rounded-tr-none'
                    : 'bg-slate-100/90 dark:bg-[#0f111a]/85 text-slate-800 dark:text-slate-200 border border-slate-200/50 dark:border-slate-700/40 rounded-tl-none'
                }`}>
                  {msg.text}
                </div>
              </motion.div>
            ))}

            {isThinking && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3 max-w-[80%]"
              >
                <div className="h-8 w-8 rounded-full flex items-center justify-center shrink-0 border bg-emerald-500 border-emerald-400 text-slate-900">
                  <TrilliumLogoMark className="h-4 w-4 text-slate-950" />
                </div>
                <div className="bg-slate-100/90 dark:bg-[#0f111a]/85 text-slate-500 dark:text-slate-400 border border-slate-200/50 dark:border-slate-700/40 p-4 rounded-2xl rounded-tl-none flex items-center gap-1.5 shadow-md">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Gray separator line and Translucent Input area */}
        <div className="border-t border-slate-200 dark:border-slate-700/60 p-4 bg-white/80 dark:bg-[#1a2133]/85 backdrop-blur-md z-10 flex items-center gap-3">
          
          {/* Curved Up Arrow Line - Upward facing and a shade darker than background */}
          <svg className="w-8 h-8 text-slate-500 dark:text-slate-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 20h4a6 6 0 0 0 6-6V6" />
            <path d="m11 9 3-3 3 3" />
          </svg>

          {/* Input field and Text Cycler */}
          <div className="relative flex-1 h-11 bg-slate-200/40 dark:bg-[#0f111a]/60 rounded-2xl border border-slate-300/60 dark:border-slate-700/60 px-4 flex items-center">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSendMessage();
              }}
              className="w-full h-full bg-transparent border-0 outline-none text-slate-900 dark:text-white text-sm font-semibold pr-10"
            />
            {inputValue === '' && (
              <div className="absolute left-4 pointer-events-none text-slate-450 dark:text-slate-500 text-sm font-semibold overflow-hidden h-5">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentPlaceholderIdx}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                  >
                    {placeholders[currentPlaceholderIdx]}
                  </motion.div>
                </AnimatePresence>
              </div>
            )}

            <button
              onClick={handleSendMessage}
              disabled={isThinking || !inputValue.trim()}
              className="absolute right-2.5 p-1.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
