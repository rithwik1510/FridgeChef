'use client';

import { useMemo } from 'react';

interface SeasonalGreeting {
  greeting: string;
  emoji: string;
  suggestion?: string;
}

// Get the current time-based greeting
const getTimeBasedGreeting = (): SeasonalGreeting => {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) {
    return {
      greeting: 'Good morning, Chef!',
      emoji: '☀️',
      suggestion: 'How about some breakfast recipes?',
    };
  } else if (hour >= 12 && hour < 17) {
    return {
      greeting: 'Good afternoon!',
      emoji: '🌤️',
      suggestion: 'Time for a hearty lunch?',
    };
  } else if (hour >= 17 && hour < 21) {
    return {
      greeting: 'Good evening!',
      emoji: '🌅',
      suggestion: 'Time for dinner inspiration?',
    };
  } else {
    return {
      greeting: 'Late night cooking?',
      emoji: '🌙',
      suggestion: 'How about a midnight snack?',
    };
  }
};

// Check for special holidays
const getHolidayGreeting = (): SeasonalGreeting | null => {
  const now = new Date();
  const month = now.getMonth() + 1; // 1-12
  const day = now.getDate();

  // Christmas (Dec 24-26)
  if (month === 12 && day >= 24 && day <= 26) {
    return {
      greeting: 'Merry Christmas!',
      emoji: '🎄',
      suggestion: 'Time for some festive recipes!',
    };
  }

  // Halloween (Oct 31)
  if (month === 10 && day === 31) {
    return {
      greeting: 'Happy Halloween!',
      emoji: '🎃',
      suggestion: 'Try some spooky treats!',
    };
  }

  // Thanksgiving (4th Thursday of November - approximate with Nov 22-28)
  if (month === 11 && day >= 22 && day <= 28) {
    return {
      greeting: 'Happy Thanksgiving!',
      emoji: '🦃',
      suggestion: 'Perfect time for a feast!',
    };
  }

  // Valentine's Day (Feb 14)
  if (month === 2 && day === 14) {
    return {
      greeting: "Happy Valentine's Day!",
      emoji: '💝',
      suggestion: 'Cook something special for your loved one!',
    };
  }

  // New Year (Jan 1-2)
  if (month === 1 && (day === 1 || day === 2)) {
    return {
      greeting: 'Happy New Year!',
      emoji: '🎉',
      suggestion: 'Start the year with healthy recipes!',
    };
  }

  // St. Patrick's Day (Mar 17)
  if (month === 3 && day === 17) {
    return {
      greeting: "Happy St. Patrick's Day!",
      emoji: '☘️',
      suggestion: 'Try some Irish-inspired dishes!',
    };
  }

  // Easter (approximate - typically March/April)
  // This is simplified - Easter date varies year to year
  if (month === 4 && day >= 1 && day <= 20) {
    const dayOfWeek = now.getDay();
    if (dayOfWeek === 0) { // Sunday in April
      return {
        greeting: 'Happy Easter!',
        emoji: '🐰',
        suggestion: 'How about some spring recipes?',
      };
    }
  }

  // Independence Day (Jul 4)
  if (month === 7 && day === 4) {
    return {
      greeting: 'Happy 4th of July!',
      emoji: '🇺🇸',
      suggestion: 'Time for BBQ recipes!',
    };
  }

  return null;
};

export const useSeasonalSurprise = () => {
  const greeting = useMemo(() => {
    // Check for holiday first
    const holidayGreeting = getHolidayGreeting();
    if (holidayGreeting) {
      return holidayGreeting;
    }

    // Fall back to time-based greeting
    return getTimeBasedGreeting();
  }, []);

  return greeting;
};

// Helper to get just the greeting message
export const useGreetingMessage = () => {
  const { greeting, emoji, suggestion } = useSeasonalSurprise();
  return `${emoji} ${greeting}${suggestion ? ` ${suggestion}` : ''}`;
};

export default useSeasonalSurprise;
