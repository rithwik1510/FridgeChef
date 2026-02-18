'use client';

import { useEffect } from 'react';

// ASCII art recipe for console
const ASCII_RECIPE = `
  ╔═══════════════════════════════════════════════════════╗
  ║                                                       ║
  ║   🍳 FridgeChef's Secret Recipe 🍳                    ║
  ║                                                       ║
  ║   Ingredients:                                        ║
  ║   • 1 cup of creativity                               ║
  ║   • 2 tbsp of passion for food                        ║
  ║   • A pinch of AI magic                               ║
  ║   • Unlimited curiosity                               ║
  ║                                                       ║
  ║   Instructions:                                       ║
  ║   1. Mix all ingredients with love                    ║
  ║   2. Let it simmer with patience                      ║
  ║   3. Serve with a smile                               ║
  ║                                                       ║
  ║   Made with ❤️ by the FridgeChef team                 ║
  ║                                                       ║
  ║   🥕 Scan your fridge and let's cook! 🥕              ║
  ║                                                       ║
  ╚═══════════════════════════════════════════════════════╝
`;

// Fun console messages
const CONSOLE_MESSAGES = [
  {
    type: 'info',
    message: '🍳 Welcome to FridgeChef! Looking under the hood?',
  },
  {
    type: 'info',
    message: "👨‍🍳 Pro tip: Try the Konami code (↑↑↓↓←→←→BA) for a surprise!",
  },
  {
    type: 'info',
    message: '🎯 Type "ratatouille" anywhere for another easter egg!',
  },
];

// Global recipe function for console
const exposeGlobalRecipe = () => {
  if (typeof window !== 'undefined') {
    (window as any).recipe = () => {
      console.log('%c' + ASCII_RECIPE, 'color: #C4704B; font-family: monospace;');
      return '🍳 Enjoy the secret recipe!';
    };

    (window as any).fridgechef = {
      version: '1.0.0',
      recipe: (window as any).recipe,
      tips: [
        'Check your fridge before shopping',
        'Fresh herbs can transform any dish',
        'Taste as you cook',
        'Sharp knives are safer knives',
      ],
      randomTip: function() {
        return this.tips[Math.floor(Math.random() * this.tips.length)];
      },
    };
  }
};

// Print styled console messages
const printConsoleMessages = () => {
  if (typeof window === 'undefined') return;

  // Header
  console.log(
    '%c FridgeChef ',
    'background: #C4704B; color: #FBF8F3; font-size: 20px; font-weight: bold; padding: 10px 20px; border-radius: 4px;'
  );

  // Messages
  CONSOLE_MESSAGES.forEach(({ message }) => {
    console.log(
      '%c' + message,
      'color: #7D8B6E; font-size: 12px; padding: 4px 0;'
    );
  });

  // Hint about global function
  console.log(
    '%c💡 Type recipe() in the console for a secret!',
    'color: #E8C547; font-size: 12px; font-style: italic; padding: 4px 0;'
  );
};

// Component to initialize console messages
export const SecretMessages: React.FC = () => {
  useEffect(() => {
    // Only run in browser and in development
    if (typeof window === 'undefined') return;

    // Expose global functions
    exposeGlobalRecipe();

    // Print console messages (only once)
    const hasShownMessages = sessionStorage.getItem('fridgechef-console-shown');
    if (!hasShownMessages) {
      printConsoleMessages();
      sessionStorage.setItem('fridgechef-console-shown', 'true');
    }
  }, []);

  // This component doesn't render anything visible
  return null;
};

// Export utilities for use elsewhere
export { ASCII_RECIPE, exposeGlobalRecipe };

export default SecretMessages;
