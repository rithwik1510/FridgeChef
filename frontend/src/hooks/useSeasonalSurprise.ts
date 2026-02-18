'use client';

import { useMemo } from 'react';
import { ComponentType } from 'react';
import {
  Sun,
  CloudSun,
  SunHorizon,
  Moon,
  Tree,
  Ghost,
  Bird,
  HeartStraight,
  Confetti,
  Clover,
  Rabbit,
  Flag,
  IconProps,
} from '@phosphor-icons/react';

interface SeasonalGreeting {
  greeting: string;
  Icon: ComponentType<IconProps>;
  iconColor: string;
  iconBgColor: string;
  suggestion?: string;
}

// Get the current time-based greeting
const getTimeBasedGreeting = (): SeasonalGreeting => {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) {
    return {
      greeting: 'Good morning, Chef!',
      Icon: Sun,
      iconColor: 'text-amber-500',
      iconBgColor: 'bg-amber-500/10',
      suggestion: 'How about some breakfast recipes?',
    };
  } else if (hour >= 12 && hour < 17) {
    return {
      greeting: 'Good afternoon!',
      Icon: CloudSun,
      iconColor: 'text-sky-500',
      iconBgColor: 'bg-sky-500/10',
      suggestion: 'Time for a hearty lunch?',
    };
  } else if (hour >= 17 && hour < 21) {
    return {
      greeting: 'Good evening!',
      Icon: SunHorizon,
      iconColor: 'text-orange-500',
      iconBgColor: 'bg-orange-500/10',
      suggestion: 'Time for dinner inspiration?',
    };
  } else {
    return {
      greeting: 'Late night cooking?',
      Icon: Moon,
      iconColor: 'text-indigo-400',
      iconBgColor: 'bg-indigo-400/10',
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
      Icon: Tree,
      iconColor: 'text-green-600',
      iconBgColor: 'bg-green-600/10',
      suggestion: 'Time for some festive recipes!',
    };
  }

  // Halloween (Oct 31)
  if (month === 10 && day === 31) {
    return {
      greeting: 'Happy Halloween!',
      Icon: Ghost,
      iconColor: 'text-purple-500',
      iconBgColor: 'bg-purple-500/10',
      suggestion: 'Try some spooky treats!',
    };
  }

  // Thanksgiving (4th Thursday of November - approximate with Nov 22-28)
  if (month === 11 && day >= 22 && day <= 28) {
    return {
      greeting: 'Happy Thanksgiving!',
      Icon: Bird,
      iconColor: 'text-amber-600',
      iconBgColor: 'bg-amber-600/10',
      suggestion: 'Perfect time for a feast!',
    };
  }

  // Valentine's Day (Feb 14)
  if (month === 2 && day === 14) {
    return {
      greeting: "Happy Valentine's Day!",
      Icon: HeartStraight,
      iconColor: 'text-rose-500',
      iconBgColor: 'bg-rose-500/10',
      suggestion: 'Cook something special for your loved one!',
    };
  }

  // New Year (Jan 1-2)
  if (month === 1 && (day === 1 || day === 2)) {
    return {
      greeting: 'Happy New Year!',
      Icon: Confetti,
      iconColor: 'text-yellow-500',
      iconBgColor: 'bg-yellow-500/10',
      suggestion: 'Start the year with healthy recipes!',
    };
  }

  // St. Patrick's Day (Mar 17)
  if (month === 3 && day === 17) {
    return {
      greeting: "Happy St. Patrick's Day!",
      Icon: Clover,
      iconColor: 'text-emerald-500',
      iconBgColor: 'bg-emerald-500/10',
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
        Icon: Rabbit,
        iconColor: 'text-pink-400',
        iconBgColor: 'bg-pink-400/10',
        suggestion: 'How about some spring recipes?',
      };
    }
  }

  // Independence Day (Jul 4)
  if (month === 7 && day === 4) {
    return {
      greeting: 'Happy 4th of July!',
      Icon: Flag,
      iconColor: 'text-blue-600',
      iconBgColor: 'bg-blue-600/10',
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

// Helper to get just the greeting message (for cases where icon is not needed)
export const useGreetingMessage = () => {
  const { greeting, suggestion } = useSeasonalSurprise();
  return `${greeting}${suggestion ? ` ${suggestion}` : ''}`;
};

export default useSeasonalSurprise;
