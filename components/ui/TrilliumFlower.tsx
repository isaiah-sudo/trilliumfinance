'use client';

import React, { useState, useEffect } from 'react';

interface TrilliumFlowerProps {
  isClosed: boolean;
}

export const TrilliumFlower: React.FC<TrilliumFlowerProps> = ({ isClosed }) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [pressedPetal, setPressedPetal] = useState<number | null>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isHovered) return;
      // Get normalized mouse position (-1 to 1) relative to window
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      setMousePos({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isHovered]);

  // Interpolated parallax effect values
  const flowerOffsetX = mousePos.x * 20;
  const flowerOffsetY = mousePos.y * 20;

  return (
    <div
      className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 p-8 text-white select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setMousePos({ x: 0, y: 0 });
        setPressedPetal(null);
      }}
    >
      {/* Decorative ambient background glows */}
      <div className="absolute top-1/4 left-1/4 h-[350px] w-[350px] rounded-full bg-emerald-500/10 blur-[100px] transition-all duration-1000" />
      <div className="absolute bottom-1/4 right-1/4 h-[400px] w-[400px] rounded-full bg-blue-500/10 blur-[120px] transition-all duration-1000" />

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute top-1/3 left-1/4 w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping [animation-duration:3.s]" />
        <div className="absolute bottom-1/3 right-1/4 w-2 h-2 bg-teal-300 rounded-full animate-pulse [animation-duration:4s]" />
        <div className="absolute top-1/2 right-1/3 w-1 h-1 bg-white rounded-full animate-ping [animation-duration:5s]" />
      </div>

      {/* Interactive Flower Canvas */}
      <div
        className="relative flex h-[320px] w-[320px] md:h-[480px] md:w-[480px] items-center justify-center transition-transform duration-700 ease-out"
        style={{
          transform: `translate3d(${flowerOffsetX}px, ${flowerOffsetY}px, 0) rotate(${flowerOffsetX * 0.15}deg)`,
        }}
      >
        <svg
          viewBox="0 0 400 400"
          className="h-full w-full drop-shadow-[0_0_45px_rgba(16,185,129,0.3)]"
        >
          <defs>
            {/* Gradients */}
            <linearGradient id="sepalGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#065f46" />
              <stop offset="100%" stopColor="#022c22" />
            </linearGradient>

            <linearGradient id="petalGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="70%" stopColor="#f8fafc" />
              <stop offset="100%" stopColor="#fed7aa" />
            </linearGradient>

            <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fbbf24" stopOpacity="1" />
              <stop offset="70%" stopColor="#f59e0b" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#d97706" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* 3 Green Sepals (Background leaves) */}
          <g style={{ transformOrigin: '200px 200px' }}>
            {/* Sepal 1 (Down - 0deg) */}
            <path
              d="M 200,200 C 180,240 160,300 200,350 C 240,300 220,240 200,200"
              fill="url(#sepalGrad)"
              className="transition-transform duration-[850ms] cubic-bezier(0.4, 0, 0.2, 1) origin-[200px_200px]"
              style={{
                transform: isClosed
                  ? 'rotate(0deg) translate(0px, -45px) scale(0.58, 0.85)'
                  : 'rotate(0deg) translate(0px, 0px) scale(1, 1)',
              }}
            />
            {/* Sepal 2 (Up-Left - 120deg) */}
            <path
              d="M 200,200 C 180,240 160,300 200,350 C 240,300 220,240 200,200"
              fill="url(#sepalGrad)"
              className="transition-transform duration-[850ms] cubic-bezier(0.4, 0, 0.2, 1) origin-[200px_200px]"
              style={{
                transform: isClosed
                  ? 'rotate(120deg) translate(0px, -45px) scale(0.58, 0.85)'
                  : 'rotate(120deg) translate(0px, 0px) scale(1, 1)',
              }}
            />
            {/* Sepal 3 (Up-Right - 240deg) */}
            <path
              d="M 200,200 C 180,240 160,300 200,350 C 240,300 220,240 200,200"
              fill="url(#sepalGrad)"
              className="transition-transform duration-[850ms] cubic-bezier(0.4, 0, 0.2, 1) origin-[200px_200px]"
              style={{
                transform: isClosed
                  ? 'rotate(240deg) translate(0px, -45px) scale(0.58, 0.85)'
                  : 'rotate(240deg) translate(0px, 0px) scale(1, 1)',
              }}
            />
          </g>

          {/* Glowing Pistil/Stamens (Center) */}
          <g
            className="transition-opacity duration-[500ms] ease-in-out"
            style={{
              opacity: isClosed ? 0 : 1,
              transformOrigin: '200px 200px',
            }}
          >
            <circle cx="200" cy="200" r="30" fill="url(#centerGlow)" />
            <circle cx="200" cy="182" r="5" fill="#f59e0b" />
            <line x1="200" y1="200" x2="200" y2="182" stroke="#d97706" strokeWidth="2" />

            <circle cx="215" cy="209" r="5" fill="#f59e0b" />
            <line x1="200" y1="200" x2="215" y2="209" stroke="#d97706" strokeWidth="2" />

            <circle cx="185" cy="209" r="5" fill="#f59e0b" />
            <line x1="200" y1="200" x2="185" y2="209" stroke="#d97706" strokeWidth="2" />
          </g>

          {/* 3 Petals (Foreground) */}
          {/* Petal 1 (Up-Center - 0deg) */}
          <g
            className="cursor-pointer select-none transition-transform duration-[800ms] cubic-bezier(0.4, 0, 0.2, 1)"
            style={{
              transformOrigin: '200px 200px',
              transform: isClosed
                ? 'rotate(0deg) translate(0px, 42px) scale(0.18, 0.72)'
                : pressedPetal === 1
                  ? 'rotate(0deg) translate(0px, 15px) scale(0.95, 0.95)'
                  : 'rotate(0deg) translate(0px, 0px) scale(1, 1)',
            }}
            onMouseDown={() => setPressedPetal(1)}
            onMouseUp={() => setPressedPetal(null)}
            onMouseLeave={() => setPressedPetal(null)}
            onTouchStart={() => setPressedPetal(1)}
            onTouchEnd={() => setPressedPetal(null)}
          >
            <path
              d="M 200,200 C 160,160 140,80 200,40 C 260,80 240,160 200,200"
              fill="url(#petalGrad)"
              className="drop-shadow-md"
            />
            <path
              d="M 200,200 Q 200,120 200,60"
              stroke="#fed7aa"
              strokeWidth="1.5"
              fill="none"
              opacity="0.6"
            />
          </g>

          {/* Petal 2 (Bottom-Right - 120deg) */}
          <g
            className="cursor-pointer select-none transition-transform duration-[800ms] cubic-bezier(0.4, 0, 0.2, 1)"
            style={{
              transformOrigin: '200px 200px',
              transform: isClosed
                ? 'rotate(120deg) translate(0px, 42px) scale(0.18, 0.72)'
                : pressedPetal === 2
                  ? 'rotate(120deg) translate(0px, 15px) scale(0.95, 0.95)'
                  : 'rotate(120deg) translate(0px, 0px) scale(1, 1)',
            }}
            onMouseDown={() => setPressedPetal(2)}
            onMouseUp={() => setPressedPetal(null)}
            onMouseLeave={() => setPressedPetal(null)}
            onTouchStart={() => setPressedPetal(2)}
            onTouchEnd={() => setPressedPetal(null)}
          >
            <path
              d="M 200,200 C 160,160 140,80 200,40 C 260,80 240,160 200,200"
              fill="url(#petalGrad)"
              className="drop-shadow-md"
            />
            <path
              d="M 200,200 Q 200,120 200,60"
              stroke="#fed7aa"
              strokeWidth="1.5"
              fill="none"
              opacity="0.6"
            />
          </g>

          {/* Petal 3 (Bottom-Left - 240deg) */}
          <g
            className="cursor-pointer select-none transition-transform duration-[800ms] cubic-bezier(0.4, 0, 0.2, 1)"
            style={{
              transformOrigin: '200px 200px',
              transform: isClosed
                ? 'rotate(240deg) translate(0px, 42px) scale(0.18, 0.72)'
                : pressedPetal === 3
                  ? 'rotate(240deg) translate(0px, 15px) scale(0.95, 0.95)'
                  : 'rotate(240deg) translate(0px, 0px) scale(1, 1)',
            }}
            onMouseDown={() => setPressedPetal(3)}
            onMouseUp={() => setPressedPetal(null)}
            onMouseLeave={() => setPressedPetal(null)}
            onTouchStart={() => setPressedPetal(3)}
            onTouchEnd={() => setPressedPetal(null)}
          >
            <path
              d="M 200,200 C 160,160 140,80 200,40 C 260,80 240,160 200,200"
              fill="url(#petalGrad)"
              className="drop-shadow-md"
            />
            <path
              d="M 200,200 Q 200,120 200,60"
              stroke="#fed7aa"
              strokeWidth="1.5"
              fill="none"
              opacity="0.6"
            />
          </g>
        </svg>
      </div>
    </div>
  );
};
