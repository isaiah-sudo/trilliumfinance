'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

export interface AnimatedNumberProps {
  value: number | string;
  formatter?: (val: number) => string;
  className?: string;
  startOffset?: number;
  gradient?: 'up' | 'down';
}

interface Token {
  key: string;
  char: string;
  isDigit: boolean;
  digit?: number;
}

const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

function parseFormattedStringToTokens(str: string): Token[] {
  const dotIndex = str.indexOf('.');

  if (dotIndex !== -1) {
    const leftPart = str.slice(0, dotIndex);
    const rightPart = str.slice(dotIndex + 1);

    // Parse left part from right to left (ones, tens, hundreds...)
    const leftTokens: Token[] = [];
    let intDigitCount = 0;
    let nonDigitLeftCount = 0;

    for (let i = leftPart.length - 1; i >= 0; i--) {
      const char = leftPart[i];
      if (char >= '0' && char <= '9') {
        leftTokens.unshift({
          key: `int-${intDigitCount}`,
          char,
          isDigit: true,
          digit: parseInt(char, 10),
        });
        intDigitCount++;
      } else {
        leftTokens.unshift({
          key: `left-sym-${char}-${nonDigitLeftCount}`,
          char,
          isDigit: false,
        });
        nonDigitLeftCount++;
      }
    }

    // Decimal separator dot
    const dotToken: Token = {
      key: 'dot',
      char: '.',
      isDigit: false,
    };

    // Parse right part from left to right (tenths, hundredths...)
    const rightTokens: Token[] = [];
    let decDigitCount = 0;
    let nonDigitRightCount = 0;

    for (let i = 0; i < rightPart.length; i++) {
      const char = rightPart[i];
      if (char >= '0' && char <= '9') {
        rightTokens.push({
          key: `dec-${decDigitCount}`,
          char,
          isDigit: true,
          digit: parseInt(char, 10),
        });
        decDigitCount++;
      } else {
        rightTokens.push({
          key: `right-sym-${char}-${nonDigitRightCount}`,
          char,
          isDigit: false,
        });
        nonDigitRightCount++;
      }
    }

    return [...leftTokens, dotToken, ...rightTokens];
  } else {
    // No decimal point
    const tokens: Token[] = [];
    let lastDigitIdx = -1;
    for (let i = str.length - 1; i >= 0; i--) {
      if (str[i] >= '0' && str[i] <= '9') {
        lastDigitIdx = i;
        break;
      }
    }

    if (lastDigitIdx === -1) {
      return str.split('').map((char, idx) => ({
        key: `sym-${char}-${idx}`,
        char,
        isDigit: false,
      }));
    }

    const mainPart = str.slice(0, lastDigitIdx + 1);
    const suffixPart = str.slice(lastDigitIdx + 1);

    let intDigitCount = 0;
    let nonDigitCount = 0;
    for (let i = mainPart.length - 1; i >= 0; i--) {
      const char = mainPart[i];
      if (char >= '0' && char <= '9') {
        tokens.unshift({
          key: `int-${intDigitCount}`,
          char,
          isDigit: true,
          digit: parseInt(char, 10),
        });
        intDigitCount++;
      } else {
        tokens.unshift({
          key: `left-sym-${char}-${nonDigitCount}`,
          char,
          isDigit: false,
        });
        nonDigitCount++;
      }
    }

    for (let i = 0; i < suffixPart.length; i++) {
      tokens.push({
        key: `suffix-${suffixPart[i]}-${i}`,
        char: suffixPart[i],
        isDigit: false,
      });
    }

    return tokens;
  }
}

function DigitColumn({ digit, gradientStyle }: { digit: number; gradientStyle?: React.CSSProperties }) {
  return (
    <span className="inline-block relative overflow-hidden h-[1em] leading-none align-baseline text-current">
      {/* Ghost digit to guarantee exact font metric width, height, and alignment */}
      <span className="invisible opacity-0 pointer-events-none select-none leading-none">
        0
      </span>
      <motion.span
        className="absolute left-0 top-0 flex flex-col items-center justify-start w-full"
        initial={false}
        animate={{ y: `-${digit * 10}%` }}
        transition={{
          type: 'spring',
          stiffness: 280,
          damping: 26,
          mass: 0.6,
        }}
      >
        {DIGITS.map((d) => (
          <span
            key={d}
            className="h-[1em] leading-none flex items-center justify-center w-full select-none"
            style={gradientStyle}
          >
            {d}
          </span>
        ))}
      </motion.span>
    </span>
  );
}

export function AnimatedNumber({ value, formatter, className = '', gradient }: AnimatedNumberProps) {
  const formattedStr = useMemo(() => {
    if (typeof value === 'number') {
      return formatter
        ? formatter(value)
        : value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    const num = parseFloat(String(value));
    if (!isNaN(num) && formatter) {
      return formatter(num);
    }
    return String(value);
  }, [value, formatter]);

  const tokens = useMemo(() => parseFormattedStringToTokens(formattedStr), [formattedStr]);

  const gradientStyle: React.CSSProperties | undefined = useMemo(() => {
    if (gradient === 'up') {
      return {
        backgroundImage: 'linear-gradient(to top, #34d399 0%, #6ee7b7 30%, #ffffff 65%, #ffffff 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
      };
    }
    if (gradient === 'down') {
      return {
        backgroundImage: 'linear-gradient(to bottom, #f43f5e 0%, #fda4af 30%, #ffffff 65%, #ffffff 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
      };
    }
    return undefined;
  }, [gradient]);

  return (
    <span className={`inline-flex items-baseline tabular-nums ${className}`}>
      {tokens.map((token) => {
        if (token.isDigit && typeof token.digit === 'number') {
          return <DigitColumn key={token.key} digit={token.digit} gradientStyle={gradientStyle} />;
        }
        return (
          <span key={token.key} className="inline-block select-none leading-none" style={gradientStyle}>
            {token.char}
          </span>
        );
      })}
    </span>
  );
}
