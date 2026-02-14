
import React, { useState, useEffect } from 'react';
import Calculator from './components/Calculator';
import { Theme } from './types';

const App: React.FC = () => {
  const [theme, setTheme] = useState<Theme>('dark');

  // Toggle theme based on system preference or user choice
  useEffect(() => {
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme(isDark ? 'dark' : 'light');
  }, []);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className={`h-screen w-full transition-colors duration-300 ${theme === 'dark' ? 'bg-black text-white' : 'bg-white text-black'}`}>
      <Calculator theme={theme} onToggleTheme={toggleTheme} />
    </div>
  );
};

export default App;
