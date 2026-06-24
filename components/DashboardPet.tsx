'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue } from 'framer-motion';

export default function DashboardPet() {
  const petRef = useRef<HTMLDivElement>(null);
  
  // Motion values for hardware-accelerated movement
  const x = useMotionValue(100);
  const y = useMotionValue(200);

  // Smooth physics
  const physicsRef = useRef({
    vx: 1.1,
    vy: 0,
    gravity: 0.35,
    isDragging: false,
    direction: 1, // 1 for right, -1 for left
    targetContainer: null as HTMLElement | null,
    state: 'WALKING' as 'WALKING' | 'IDLE_LOOKING' | 'WALKING_TO_GAZE' | 'GAZING' | 'JUMPING',
    stateTimer: 0,
    targetGazeCard: null as HTMLElement | null,
    targetGazeX: 0,
    targetGazeY: 0,
  });

  const jumpRef = useRef({
    t: 0,
    duration: 65, // frames
    startX: 0,
    startY: 0,
    targetX: 0,
    targetY: 0,
    targetContainer: null as HTMLElement | null,
  });

  const [facingRight, setFacingRight] = useState(true);
  const [isDangling, setIsDangling] = useState(false);
  const [isGazing, setIsGazing] = useState(false);
  const [isReaching, setIsReaching] = useState(false);
  const [isLookAround, setIsLookAround] = useState(false);
  
  // Custom eye and mouth states for detailed animation reactions
  const [eyeState, setEyeState] = useState<'default' | 'worried' | 'squinting' | 'looking-up' | 'wide-eyed'>('default');
  const [mouthState, setMouthState] = useState<'default' | 'worried' | 'wide-eyed'>('default');

  // Position updates and physics simulation
  useEffect(() => {
    let active = true;

    // Find the header or default container on mount
    const defaultContainer = document.querySelector('.pet-container-target') as HTMLElement | null;
    if (defaultContainer) {
      physicsRef.current.targetContainer = defaultContainer;
      const rect = defaultContainer.getBoundingClientRect();
      x.set(rect.left + window.scrollX + rect.width / 2 - 16);
      y.set(rect.top + window.scrollY - 42); // Stand on top of the container
    } else {
      x.set(window.innerWidth / 2 - 16);
      y.set(100);
    }

    const updatePhysics = () => {
      if (!active) return;
      const petEl = petRef.current;
      if (!petEl) {
        requestAnimationFrame(updatePhysics);
        return;
      }
      const physics = physicsRef.current;
      const petWidth = 32;
      const petHeight = 42;

      // --- STANDARD BOUNDS QUERY ---
      let minX = 0;
      let maxX = window.innerWidth - petWidth;
      let maxY = window.innerHeight - petHeight - 20; // viewport floor

      if (physics.targetContainer) {
        const rect = physics.targetContainer.getBoundingClientRect();
        minX = Math.max(0, rect.left + window.scrollX);
        maxX = Math.min(window.innerWidth - petWidth, rect.right + window.scrollX - petWidth);
        maxY = rect.top + window.scrollY - petHeight; // Floor is on top of container
      }

      if (!physics.isDragging) {
        // --- JUMP STATE HANDLING ---
        if (physics.state === 'JUMPING') {
          const jump = jumpRef.current;
          jump.t += 1;
          const progress = Math.min(1, jump.t / jump.duration);
          
          // Parabolic arc interpolation
          const currentX = jump.startX + (jump.targetX - jump.startX) * progress;
          const peakHeight = 120;
          const currentY = jump.startY + (jump.targetY - jump.startY) * progress - peakHeight * Math.sin(Math.PI * progress);
          
          x.set(currentX);
          y.set(currentY);
          setIsDangling(true);

          if (progress >= 1) {
            // Landed
            physics.state = 'WALKING';
            physics.targetContainer = jump.targetContainer;
            physics.vy = 0;
            physics.stateTimer = 0;
            setIsDangling(false);
          }
          requestAnimationFrame(updatePhysics);
          return;
        }

        // Apply gravity if not grounded
        let currentY = y.get();
        if (currentY < maxY) {
          physics.vy += physics.gravity;
          currentY = Math.min(maxY, currentY + physics.vy);
          y.set(currentY);
          setIsDangling(true);
          
          // --- REAL-TIME CONTAINER INTERSECTION DETECTION DURING FALL ---
          if (physics.vy > 0) {
            const px = x.get() + petWidth / 2;
            const py = currentY + petHeight;
            const targets = Array.from(document.querySelectorAll('.pet-container-target')) as HTMLElement[];
            
            for (const target of targets) {
              const rect = target.getBoundingClientRect();
              const targetLeft = rect.left + window.scrollX;
              const targetRight = rect.right + window.scrollX;
              const targetTop = rect.top + window.scrollY;

              if (px >= targetLeft && px <= targetRight && py >= targetTop - 10 && py <= targetTop + 10) {
                physics.targetContainer = target;
                physics.vy = 0;
                y.set(targetTop - petHeight);
                setIsDangling(false);
                physics.state = 'WALKING';
                break;
              }
            }
          }
        } else {
          physics.vy = 0;
          y.set(maxY);
          setIsDangling(false);
        }

        // Screen boundaries safety checks
        let currentX = x.get();
        if (currentX < 0) x.set(0);
        if (currentX > window.innerWidth - petWidth) x.set(window.innerWidth - petWidth);

        // --- STATE TIMERS & RANDOM ACTIONS ---
        if (y.get() >= maxY) {
          physics.stateTimer += 1;

          // Periodically pick new action if in normal walking
          if (physics.state === 'WALKING' && physics.stateTimer > 250) {
            physics.stateTimer = 0;
            const rand = Math.random();

            if (rand < 0.25) {
              // Action: Look around (Idle)
              physics.state = 'IDLE_LOOKING';
              setIsLookAround(true);
            } else if (rand < 0.55) {
              // Action: Jump to another container (restricting to adjacent tiers)
              const containers = Array.from(document.querySelectorAll('.pet-container-target')) as HTMLElement[];
              
              if (containers.length > 1) {
                // Get absolute Y coordinate (vertical height) and bounding rect for all containers
                const containerData = containers.map(c => {
                  const rect = c.getBoundingClientRect();
                  return {
                    element: c,
                    y: rect.top + window.scrollY,
                    rect
                  };
                });

                // Sort containers by vertical height
                containerData.sort((a, b) => a.y - b.y);

                // Group containers into height tiers (threshold of 100px difference)
                const tiers: { y: number; elements: typeof containerData }[] = [];
                containerData.forEach(item => {
                  const matchingTier = tiers.find(t => Math.abs(t.y - item.y) < 100);
                  if (matchingTier) {
                    matchingTier.elements.push(item);
                  } else {
                    tiers.push({ y: item.y, elements: [item] });
                  }
                });

                // Find our current container's tier index
                const currentTierIndex = tiers.findIndex(t => 
                  t.elements.some(item => item.element === physics.targetContainer)
                );

                if (currentTierIndex !== -1) {
                  // Restrict selection to adjacent tiers (exactly 1 tier up or 1 tier down)
                  const possibleTierIndices: number[] = [];
                  if (currentTierIndex > 0) possibleTierIndices.push(currentTierIndex - 1);
                  if (currentTierIndex < tiers.length - 1) possibleTierIndices.push(currentTierIndex + 1);

                  if (possibleTierIndices.length > 0) {
                    const chosenTierIndex = possibleTierIndices[Math.floor(Math.random() * possibleTierIndices.length)];
                    const chosenTier = tiers[chosenTierIndex];
                    const targetItem = chosenTier.elements[Math.floor(Math.random() * chosenTier.elements.length)];
                    const rect = targetItem.rect;
                    
                    physics.state = 'JUMPING';
                    jumpRef.current = {
                      t: 0,
                      duration: 65,
                      startX: x.get(),
                      startY: y.get(),
                      targetX: rect.left + window.scrollX + rect.width / 2 - 16,
                      targetY: rect.top + window.scrollY - petHeight,
                      targetContainer: targetItem.element,
                    };
                  }
                }
              }
            } else if (rand < 0.85) {
              // Action: Gaze/tilt a trophy card
              const trophies = Array.from(document.querySelectorAll('.trophy-card-element')) as HTMLElement[];
              if (trophies.length > 0) {
                const targetCard = trophies[Math.floor(Math.random() * trophies.length)];
                const rect = targetCard.getBoundingClientRect();
                physics.state = 'WALKING_TO_GAZE';
                physics.targetGazeCard = targetCard;
                physics.targetGazeX = rect.right + window.scrollX - 24; // Bottom-right corner of trophy card
                physics.targetGazeY = rect.bottom + window.scrollY - petHeight;
              }
            }
          }

          // --- STATE MACHINE BEHAVIOR ---
          if (physics.state === 'WALKING') {
            let currentX = x.get();
            currentX += physics.vx * physics.direction;
            
            if (currentX <= minX) {
              currentX = minX;
              physics.direction = 1;
              setFacingRight(true);
            } else if (currentX >= maxX) {
              currentX = maxX;
              physics.direction = -1;
              setFacingRight(false);
            }
            x.set(currentX);
          } 
          else if (physics.state === 'IDLE_LOOKING') {
            // Squish and flip direction looking around
            if (physics.stateTimer % 45 === 0) {
              setFacingRight(prev => !prev);
            }
            if (physics.stateTimer > 120) {
              physics.state = 'WALKING';
              physics.stateTimer = 0;
              setIsLookAround(false);
            }
          } 
          else if (physics.state === 'WALKING_TO_GAZE') {
            // Walk to targeted X coordinate
            let currentX = x.get();
            const diff = physics.targetGazeX - currentX;
            if (Math.abs(diff) < 6) {
              // Reached target corner
              physics.state = 'GAZING';
              physics.stateTimer = 0;
              setFacingRight(false); // Face left/up towards the card
            } else {
              // Walk towards target
              physics.direction = diff > 0 ? 1 : -1;
              setFacingRight(physics.direction === 1);
              currentX += physics.vx * physics.direction;
              x.set(currentX);
            }
          } 
          else if (physics.state === 'GAZING') {
            const timer = physics.stateTimer;
            
            // --- DETAILED SLOW MULTI-STAGE GAZING TIMELINE ---
            if (timer < 60) {
              // 1. Stops and looks up
              setEyeState('looking-up');
              setMouthState('default');
              setIsGazing(false);
              setIsReaching(false);
            } 
            else if (timer < 110) {
              // 2. Squints
              setEyeState('squinting');
              setMouthState('default');
              setIsGazing(true);
              setIsReaching(false);
            } 
            else if (timer < 230) {
              // 3. Reaches up and tilts trophy towards him
              setEyeState('looking-up');
              setMouthState('default');
              setIsGazing(true);
              setIsReaching(true);
              if (timer === 111 && physics.targetGazeCard) {
                physics.targetGazeCard.dispatchEvent(new CustomEvent('pet-gaze', { detail: { tilting: true } }));
              }
            } 
            else if (timer < 290) {
              // 4. Goes wide-eyed in wonder
              setEyeState('wide-eyed');
              setMouthState('wide-eyed');
              setIsGazing(false);
              setIsReaching(false);
              if (timer === 231 && physics.targetGazeCard) {
                // Return trophy to normal
                physics.targetGazeCard.dispatchEvent(new CustomEvent('pet-gaze', { detail: { tilting: false } }));
              }
            } 
            else {
              // 5. Done. Resumes walking
              physics.state = 'WALKING';
              physics.stateTimer = 0;
              setEyeState('default');
              setMouthState('default');
              physics.targetGazeCard = null;
            }
          }
        }
      }

      // Synchronize React state display hooks from physical loop without reading state variables
      const isActuallyDangling = (y.get() < maxY) || physics.isDragging;
      if (physics.isDragging) {
        setEyeState('worried');
        setMouthState('worried');
      } else if (isActuallyDangling) {
        setEyeState('looking-up'); // looking down/up while falling
        setMouthState('worried');
      }

      requestAnimationFrame(updatePhysics);
    };

    requestAnimationFrame(updatePhysics);
    return () => {
      active = false;
      // Clean up any remaining trophy tilt on unmount
      document.querySelectorAll('.trophy-card-element').forEach(el => {
        el.dispatchEvent(new CustomEvent('pet-gaze', { detail: { tilting: false } }));
      });
    };
  }, [x, y]);

  // Handle Drag Start
  const handleDragStart = () => {
    physicsRef.current.isDragging = true;
    physicsRef.current.state = 'WALKING';
    physicsRef.current.stateTimer = 0;
    physicsRef.current.targetContainer = null; // Clear landing target so we fall when dropped
    setIsDangling(true);
    setIsGazing(false);
    setIsReaching(false);
    setIsLookAround(false);

    // Cancel any active trophy tilt
    if (physicsRef.current.targetGazeCard) {
      physicsRef.current.targetGazeCard.dispatchEvent(new CustomEvent('pet-gaze', { detail: { tilting: false } }));
      physicsRef.current.targetGazeCard = null;
    }
  };

  // Handle Drag End - Raycast to find dropping target card
  const handleDragEnd = (event: any) => {
    physicsRef.current.isDragging = false;
    physicsRef.current.vy = 0.5; // Start with initial downward velocity
  };

  const isWalking = physicsRef.current.state === 'WALKING' || physicsRef.current.state === 'WALKING_TO_GAZE';

  return (
    <>
      <motion.div
        ref={petRef}
        drag
        dragElastic={0.1}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        style={{ x, y }}
        className="absolute z-[100] h-12 w-8 cursor-grab active:cursor-grabbing select-none"
      >
        {/* The Pet SVG Body */}
        <div 
          className="relative w-full h-full flex flex-col items-center transition-transform duration-100"
          style={{
            transform: facingRight ? 'scaleX(1)' : 'scaleX(-1)'
          }}
        >
          {/* Arms */}
          <div className="absolute top-4 inset-x-[-8px] flex justify-between pointer-events-none">
            {/* Left Arm */}
            <svg
              className={`h-4 w-3 origin-right text-amber-500 fill-current transition-all duration-200 ${
                physicsRef.current.isDragging ? 'pet-arm-drag' : isDangling ? 'animate-[flail_0.15s_infinite]' : isLookAround ? 'animate-none' : 'pet-arm'
              }`}
              viewBox="0 0 10 20"
              style={{ 
                transform: isReaching 
                  ? 'rotate(-140deg) translateY(-3px)' 
                  : isGazing 
                    ? 'rotate(-100deg) translateY(-1px)' 
                    : physicsRef.current.isDragging 
                      ? 'rotate(55deg)' 
                      : isDangling 
                        ? 'rotate(-140deg)' // arms up when falling
                        : 'rotate(-40deg)' 
              }}
            >
              <rect x="2" y="0" width="4" height="18" rx="2" />
            </svg>
            {/* Right Arm */}
            <svg
              className={`h-4 w-3 origin-left text-amber-500 fill-current transition-all duration-200 ${
                physicsRef.current.isDragging ? 'pet-arm-drag' : isDangling ? 'animate-[flail_0.15s_infinite]' : isLookAround ? 'animate-none' : 'pet-arm'
              }`}
              viewBox="0 0 10 20"
              style={{ 
                transform: isReaching
                  ? 'rotate(10deg)'
                  : isGazing
                    ? 'rotate(10deg)'
                    : physicsRef.current.isDragging 
                      ? 'rotate(-55deg)' 
                      : isDangling 
                        ? 'rotate(140deg)' // arms up when falling
                        : 'rotate(40deg)' 
              }}
            >
              <rect x="4" y="0" width="4" height="18" rx="2" />
            </svg>
          </div>

          {/* Main Body Circle */}
          <div 
            className={`w-8 h-8 rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 border border-amber-700 shadow-md relative flex items-center justify-center transition-transform duration-300 ${
              isWalking ? 'pet-body-walk' : ''
            }`}
            style={{
              transform: isLookAround ? 'scaleY(0.85) scaleX(1.15)' : isGazing ? 'rotate(-10deg) scale(1.05)' : 'scale(1)'
            }}
          >
            {/* Eyes */}
            <div className="flex gap-1.5 mt-[-2px] ml-[2px] transition-transform duration-300"
                 style={{ 
                   transform: eyeState === 'looking-up' ? 'translateY(-3.5px) scale(0.95)' : 'none' 
                 }}>
              {/* Left Eye */}
              <div className="h-2.5 w-2 bg-white rounded-full flex items-center justify-center relative overflow-hidden transition-all duration-200"
                   style={{
                     transform: eyeState === 'squinting' ? 'scaleY(0.3)' : eyeState === 'wide-eyed' ? 'scale(1.25)' : 'scale(1)'
                   }}>
                <div className="h-1.2 w-1.2 bg-slate-900 rounded-full absolute transition-all duration-300"
                     style={{ 
                       top: eyeState === 'looking-up' ? '1px' : '2px', 
                       right: '1px',
                       transform: eyeState === 'worried' ? 'scale(0.8) translate(-1px, 1px)' : 'none'
                     }} />
              </div>
              {/* Right Eye */}
              <div className="h-2.5 w-2 bg-white rounded-full flex items-center justify-center relative overflow-hidden transition-all duration-200"
                   style={{
                     transform: eyeState === 'squinting' ? 'scaleY(0.3)' : eyeState === 'wide-eyed' ? 'scale(1.25)' : 'scale(1)'
                   }}>
                <div className="h-1.2 w-1.2 bg-slate-900 rounded-full absolute transition-all duration-300"
                     style={{ 
                       top: eyeState === 'looking-up' ? '1px' : '2px', 
                       right: '1px',
                       transform: eyeState === 'worried' ? 'scale(0.8) translate(-1px, 1px)' : 'none'
                     }} />
              </div>
            </div>

            {/* Mouth */}
            {mouthState === 'worried' ? (
              // Concerned squiggly mouth path
              <svg className="absolute bottom-2 left-1/2 -translate-x-1/2 w-3.5 h-1.5 text-amber-900 stroke-current fill-none stroke-[1.5]" viewBox="0 0 10 5">
                <path d="M 0 2 Q 2.5 0, 5 2 T 10 2" />
              </svg>
            ) : mouthState === 'wide-eyed' ? (
              // Open surprised mouth circle
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full border border-amber-950 bg-amber-900/10" />
            ) : (
              // Normal happy curve
              <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 w-2 h-1 border-b-2 border-amber-900 rounded-b-full transition-all duration-300" />
            )}
          </div>

          {/* Legs */}
          <div className="absolute bottom-0 inset-x-1.5 flex justify-between pointer-events-none">
            {/* Left Leg */}
            <svg
              className={`h-4.5 w-2.5 text-amber-600 fill-current transition-all duration-200 ${
                physicsRef.current.isDragging ? 'pet-leg-drag' : isDangling ? 'animate-[leg-dangle_0.2s_infinite]' : isLookAround || isGazing ? 'animate-none' : 'pet-left-leg'
              }`}
              viewBox="0 0 8 16"
              style={{
                transform: physicsRef.current.isDragging ? 'translateY(-3px) scaleY(0.7)' : 'none'
              }}
            >
              <rect x="1.5" y="0" width="4.5" height="13" rx="2" />
              <ellipse cx="3.5" cy="13" rx="3.5" ry="2" />
            </svg>
            {/* Right Leg */}
            <svg
              className={`h-4.5 w-2.5 text-amber-600 fill-current transition-all duration-200 ${
                physicsRef.current.isDragging ? 'pet-leg-drag' : isDangling ? 'animate-[leg-dangle_0.2s_infinite_0.1s]' : isLookAround || isGazing ? 'animate-none' : 'pet-right-leg'
              }`}
              viewBox="0 0 8 16"
              style={{
                transform: physicsRef.current.isDragging ? 'translateY(-3px) scaleY(0.7)' : 'none'
              }}
            >
              <rect x="1.5" y="0" width="4.5" height="13" rx="2" />
              <ellipse cx="3.5" cy="13" rx="3.5" ry="2" />
            </svg>
          </div>
        </div>
      </motion.div>

      {/* Embedded Animations */}
      <style jsx global>{`
        @keyframes walk-left {
          0%, 100% { transform: rotate(-22deg); }
          50% { transform: rotate(22deg); }
        }
        @keyframes walk-right {
          0%, 100% { transform: rotate(22deg); }
          50% { transform: rotate(-22deg); }
        }
        @keyframes swing-arms-pet {
          0%, 100% { transform: rotate(-30deg); }
          50% { transform: rotate(10deg); }
        }
        @keyframes flail {
          0%, 100% { transform: rotate(-60deg); }
          50% { transform: rotate(60deg); }
        }
        @keyframes leg-dangle {
          0%, 100% { transform: translateY(0px) scaleY(1); }
          50% { transform: translateY(2px) scaleY(1.15); }
        }
        @keyframes walk-bob {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-3.5px) scaleY(1.03); }
        }
        .pet-left-leg {
          animation: walk-left 0.55s linear infinite;
          transform-origin: top center;
        }
        .pet-right-leg {
          animation: walk-right 0.55s linear infinite;
          transform-origin: top center;
        }
        .pet-arm {
          animation: swing-arms-pet 0.55s ease-in-out infinite;
          transform-origin: top center;
        }
        .pet-body-walk {
          animation: walk-bob 0.275s ease-in-out infinite;
          transform-origin: bottom center;
        }
      `}</style>
    </>
  );
}
