
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Theme, HistoryItem, CalcButton } from '../types';
import HistoryPanel from './HistoryPanel';

interface CalculatorProps {
  theme: Theme;
  onToggleTheme: () => void;
}

const Calculator: React.FC<CalculatorProps> = ({ theme, onToggleTheme }) => {
  const [expression, setExpression] = useState('');
  const [livePreview, setLivePreview] = useState('');
  const [lastEquation, setLastEquation] = useState(''); // Shows above the main number after =
  const [isResultState, setIsResultState] = useState(false); // If true, main display shows result, next key press resets
  
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [isLandscape, setIsLandscape] = useState(window.innerWidth > window.innerHeight);
  
  const displayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => setIsLandscape(window.innerWidth > window.innerHeight);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const formatNumber = (numStr: string) => {
    // Simple formatter for commas
    if (!numStr) return '';
    if (numStr === 'Error') return 'Error';
    if (numStr === 'NaN') return 'Error';
    const parts = numStr.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join('.');
  };

  const evaluate = useCallback((exp: string): string => {
    try {
      // Basic sanitization and conversion for JS eval
      let sanitized = exp
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/−/g, '-')
        .replace(/%/g, '/100')
        .replace(/√/g, 'Math.sqrt')
        .replace(/∛/g, 'Math.cbrt')
        .replace(/cbrt/g, 'Math.cbrt')
        .replace(/\^/g, '**')
        .replace(/π/g, 'Math.PI')
        .replace(/e/g, 'Math.E')
        .replace(/log/g, 'Math.log10')
        .replace(/ln/g, 'Math.log')
        .replace(/sin/g, 'Math.sin')
        .replace(/cos/g, 'Math.cos')
        .replace(/tan/g, 'Math.tan')
        .replace(/abs/g, 'Math.abs')
        .replace(/rand/g, 'Math.random()');

      // Add multiplication sign before parenthesis if missing (e.g. 5(2) -> 5*(2))
      sanitized = sanitized.replace(/(\d)(\()/g, '$1*$2');
      sanitized = sanitized.replace(/(\))(\d)/g, '$1*$2');
      
      // Handle implicit multiplication for Math constants/functions (e.g. 5Math.PI -> 5*Math.PI)
      sanitized = sanitized.replace(/(\d)(Math)/g, '$1*$2');
      sanitized = sanitized.replace(/(\))((Math))/g, '$1*$2');

      // Handle factorial (!) basic support for integers
      if (sanitized.includes('!')) {
         // Regex to find number preceding ! (e.g. 5!)
         // This is a naive implementation and works for simple integers.
         sanitized = sanitized.replace(/(\d+)!/g, (match, number) => {
             const n = parseInt(number);
             if (n < 0) return 'NaN';
             let result = 1;
             for(let i = 2; i <= n; i++) result *= i;
             return result.toString();
         });
         
         // If ! still remains (e.g. from complex expression like (2+3)! which isn't handled by simple regex), return Error
         if (sanitized.includes('!')) return 'Error'; 
      }

      // eslint-disable-next-line no-eval
      const res = eval(sanitized);
      
      if (isNaN(res) || !isFinite(res)) return 'Error';
      // Limit precision to avoid long decimals
      const resultString = String(parseFloat(res.toPrecision(12)));
      return resultString;
    } catch {
      return '';
    }
  }, []);

  // Update live preview when expression changes
  useEffect(() => {
    if (!expression || isResultState) {
      setLivePreview('');
      return;
    }
    
    // Only show preview if expression has operators
    if (!/[+\-×÷%^√]/.test(expression)) {
      setLivePreview('');
      return;
    }

    const res = evaluate(expression);
    if (res && res !== 'Error') {
      setLivePreview(res);
    } else {
      setLivePreview('');
    }
  }, [expression, isResultState, evaluate]);


  const handleButtonClick = (val: string) => {
    // Vibrate on tap for Android feel
    if (navigator.vibrate) navigator.vibrate(10);

    if (val === 'C') {
      setExpression('');
      setLivePreview('');
      setLastEquation('');
      setIsResultState(false);
    } else if (val === '=') {
      if (!expression) return;
      
      const finalResult = evaluate(expression);
      
      if (finalResult && finalResult !== 'Error') {
        const newItem: HistoryItem = {
          id: Date.now().toString(),
          expression,
          result: finalResult,
          timestamp: Date.now()
        };
        setHistory(prev => [newItem, ...prev]);
        setLastEquation(expression); // Show equation at top
        setExpression(finalResult); // Main display becomes result
        setIsResultState(true);
        setLivePreview('');
      }
    } else if (val === 'DEL') {
      if (isResultState) {
        setExpression('');
        setLastEquation('');
        setIsResultState(false);
      } else {
        setExpression(prev => prev.slice(0, -1));
      }
    } else if (['+', '−', '×', '÷', '%', '^'].includes(val)) {
      // Operator logic
      if (isResultState) {
        setIsResultState(false);
        setLastEquation('');
        // Continue with result
      }
      setExpression(prev => prev + val);
    } else {
      // Number or function logic
      if (isResultState) {
        setExpression(val);
        setLastEquation('');
        setIsResultState(false);
      } else {
        setExpression(prev => prev + val);
      }
    }
  };

  const buttons: CalcButton[] = [
    { label: 'C', value: 'C', type: 'action' },
    { label: '( )', value: '(', type: 'operator' },
    { label: '%', value: '%', type: 'operator' },
    { label: '÷', value: '÷', type: 'operator' },
    { label: '7', value: '7', type: 'number' },
    { label: '8', value: '8', type: 'number' },
    { label: '9', value: '9', type: 'number' },
    { label: '×', value: '×', type: 'operator' },
    { label: '4', value: '4', type: 'number' },
    { label: '5', value: '5', type: 'number' },
    { label: '6', value: '6', type: 'number' },
    { label: '−', value: '−', type: 'operator' },
    { label: '1', value: '1', type: 'number' },
    { label: '2', value: '2', type: 'number' },
    { label: '3', value: '3', type: 'number' },
    { label: '+', value: '+', type: 'operator' },
    { label: '+/−', value: '-', type: 'number' }, // Handled as negative sign char in logic
    { label: '0', value: '0', type: 'number' },
    { label: '.', value: '.', type: 'number' },
    { label: '=', value: '=', type: 'action' },
  ];

  const landscapeButtons: CalcButton[] = [
    { label: '2nd', value: '', type: 'function' }, // Placeholder for now
    { label: 'deg', value: '', type: 'function' }, // Placeholder
    { label: 'sin', value: 'sin(', type: 'function' },
    { label: 'cos', value: 'cos(', type: 'function' },
    { label: 'tan', value: 'tan(', type: 'function' },
    
    { label: 'xʸ', value: '^', type: 'function' },
    { label: 'log', value: 'log(', type: 'function' },
    { label: 'ln', value: 'ln(', type: 'function' },
    { label: '(', value: '(', type: 'function' },
    { label: ')', value: ')', type: 'function' },
    
    { label: '√', value: '√(', type: 'function' },
    { label: '|x|', value: 'abs(', type: 'function' },
    { label: 'x⁻¹', value: '^(-1)', type: 'function' },
    { label: 'x!', value: '!', type: 'function' },
    { label: 'x²', value: '^2', type: 'function' },

    { label: 'π', value: 'π', type: 'function' },
    { label: 'e', value: 'e', type: 'function' },
    { label: 'x³', value: '^3', type: 'function' },
    { label: '∛', value: 'cbrt(', type: 'function' },
    { label: 'rand', value: 'rand', type: 'function' },
  ];

  const clearHistory = () => setHistory([]);

  // Dynamic Styles
  const bgColor = theme === 'dark' ? 'bg-black' : 'bg-[#f2f2f2]';
  const displayTextColor = theme === 'dark' ? 'text-white' : 'text-black';
  const secondaryTextColor = theme === 'dark' ? 'text-gray-400' : 'text-gray-500';

  return (
    <div className={`flex flex-col h-full w-full relative ${bgColor} transition-colors duration-200`}>
      {/* Top Bar: History, Unit Converter, Theme */}
      <div className="flex justify-between items-center px-4 pt-4 pb-2 z-10">
         <div className="flex items-center gap-4">
             {/* Simple placeholders for Samsung icons */}
             <button onClick={() => setShowHistory(true)} className={`p-2 rounded-full ${theme === 'dark' ? 'active:bg-gray-800 text-gray-400' : 'active:bg-gray-200 text-gray-600'}`}>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M13 3a9 9 0 0 0-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42A8.954 8.954 0 0 1 13 21a9 9 0 0 1 0-18zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/></svg>
             </button>
             <button className={`p-2 rounded-full ${theme === 'dark' ? 'active:bg-gray-800 text-gray-400' : 'active:bg-gray-200 text-gray-600'}`}>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M7 2H5v2H3v2h2v2h2V6h2V4H7V2zm12 18h-2v2h-2v-2h-2v-2h2v-2h2v2h2v2zM7 22H5v-2H3v-2h2v-2h2v2h2v2H7v2zm12-18h-2v2h-2V4h-2V2h2V0h2v2h2v2zM9 10h6v4H9z"/></svg>
             </button>
         </div>
         <button onClick={onToggleTheme} className={`p-2 rounded-full ${theme === 'dark' ? 'active:bg-gray-800 text-gray-400' : 'active:bg-gray-200 text-gray-600'}`}>
             {theme === 'dark' ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.415 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" /></svg>
             ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" /></svg>
             )}
         </button>
      </div>

      {/* Display Area */}
      <div 
        ref={displayRef}
        className="flex-1 flex flex-col justify-end items-end px-8 pb-4 overflow-hidden relative"
        onClick={() => {}} // Could be used to move cursor in future
      >
        {/* Last equation (appears small at top after =) */}
        <div className={`text-xl font-light mb-1 min-h-[1.75rem] transition-colors ${secondaryTextColor}`}>
          {lastEquation}
        </div>

        {/* Main Display */}
        <div 
           className={`text-5xl sm:text-6xl font-light break-all text-right w-full transition-all duration-200 ${displayTextColor}`}
           style={{ lineHeight: '1.2' }}
        >
          {formatNumber(expression) || '0'}
        </div>

        {/* Live Preview (appears small at bottom while typing) */}
        {!isResultState && (
          <div className={`text-2xl font-light mt-2 h-8 text-right w-full transition-opacity duration-200 ${livePreview ? 'opacity-100' : 'opacity-0'} ${secondaryTextColor}`}>
            {formatNumber(livePreview)}
          </div>
        )}
      </div>

      {/* Control Bar (Backspace) */}
      <div className={`flex justify-between items-center px-6 py-2 border-t ${theme === 'dark' ? 'border-gray-800' : 'border-gray-300'}`}>
         {/* Placeholder for scientific toggle or unit converter quick access */}
         <div className={`${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'} text-xs tracking-widest uppercase`}>
             {/* Calculator */}
         </div>

         {/* Backspace Button */}
         <button 
           onClick={() => handleButtonClick('DEL')}
           className={`p-2 rounded-full ${theme === 'dark' ? 'text-[#00C853] active:bg-gray-800' : 'text-[#00C853] active:bg-gray-200'} transition-colors`}
         >
           <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
             <path d="M22 3H7C6.31 3 5.77 3.35 5.6 3.64L0 12L5.6 20.36C5.77 20.64 6.31 21 7 21H22C23.1 21 24 20.1 24 19V5C24 3.9 23.1 3 22 3ZM19 15.59L17.59 17L14 13.41L10.41 17L9 15.59L12.59 12L9 8.41L10.41 7L14 10.59L17.59 7L19 8.41L15.41 12L19 15.59Z" fill="currentColor"/>
           </svg>
         </button>
      </div>

      {/* Buttons Grid */}
      <div className={`px-4 pb-6 pt-2 transition-all duration-300 w-full max-w-2xl mx-auto ${isLandscape ? 'flex flex-row gap-4' : 'block'}`}>
        {isLandscape && (
          <div className="grid grid-cols-5 gap-3 flex-1">
             {landscapeButtons.map((btn) => (
               <CalcBtn key={btn.label} btn={btn} theme={theme} onClick={() => handleButtonClick(btn.value)} isLandscape />
            ))}
          </div>
        )}
        <div className={`grid grid-cols-4 gap-3 ${isLandscape ? 'w-[60%]' : 'w-full'}`}>
          {buttons.map((btn) => (
             <CalcBtn key={btn.label} btn={btn} theme={theme} onClick={() => handleButtonClick(btn.value)} />
          ))}
        </div>
      </div>

      <HistoryPanel 
        isOpen={showHistory} 
        history={history} 
        onClose={() => setShowHistory(false)} 
        onClear={clearHistory}
        theme={theme}
        onSelect={(item) => {
          setExpression(item.expression);
          setLivePreview('');
          setIsResultState(false);
          setShowHistory(false);
        }}
      />
    </div>
  );
};

interface CalcBtnProps {
  btn: CalcButton;
  theme: Theme;
  onClick: () => void;
  isLandscape?: boolean;
}

const CalcBtn: React.FC<CalcBtnProps> = ({ btn, theme, onClick, isLandscape }) => {
  // Samsung Color Palette Logic
  // Dark Mode:
  // - Numbers: Dark Grey (#333333)
  // - Operators (Right): Dark Grey (#333333) with Green Text (#25D056) or Green Circle
  //   *Actually on S23 One UI 6, Operators are Grey Circle, Green Text. 
  //   *Except = which is Green Circle, White Text.
  // - Top Row: Grey (#333333), Green Text.
  
  // Light Mode:
  // - Numbers: Light Grey (#F0F0F0) or White
  // - Operators: Light Grey, Green Text
  // - =: Green Circle, White Text

  const isDark = theme === 'dark';
  
  // Base
  let bgColor = isDark ? 'bg-[#2E2E2E]' : 'bg-[#E8E8E8]';
  let textColor = isDark ? 'text-white' : 'text-black';
  let fontSize = 'text-2xl';
  const fontWeight = 'font-normal';

  if (btn.type === 'action' && btn.label === '=') {
    // The equals button
    bgColor = 'bg-[#00C853]'; // Samsung Green
    textColor = 'text-white';
  } else if (['+', '−', '×', '÷', '%'].includes(btn.label)) {
    // Operators
    textColor = 'text-[#00C853]'; // Samsung Green Text
    fontSize = 'text-3xl';
  } else if (btn.label === 'C' || btn.label === '( )') {
    // Top function row
    textColor = 'text-[#FF5252]'; // Red/Orange for C often, or Green for brackets
    if (btn.label !== 'C') textColor = 'text-[#00C853]';
  } else if (btn.type === 'function') {
    // Scientific functions
    bgColor = isDark ? 'bg-[#1E1E1E]' : 'bg-[#D0D0D0]';
    textColor = isDark ? 'text-white' : 'text-black';
    fontSize = 'text-lg';
  }

  // Override specific logic for brackets in normal view
  if (btn.label === '( )') {
     // Usually treats as operator color
     textColor = 'text-[#00C853]';
  }
  if (btn.label === 'C') {
     textColor = 'text-[#FF5252]';
  }

  // Adjust for landscape compact mode
  if (isLandscape) {
     if (btn.type === 'function') {
        fontSize = 'text-sm';
     }
  }

  return (
    <button
      onClick={onClick}
      className={`
        relative overflow-hidden
        aspect-square rounded-full flex items-center justify-center ${fontSize} ${fontWeight}
        transition-all duration-100 transform active:scale-90 active:opacity-80
        ${bgColor} ${textColor}
        ${btn.span ? `col-span-${btn.span}` : ''}
      `}
      style={{
         // Add subtle shadow or refinement if needed
      }}
    >
      {btn.label}
    </button>
  );
};

export default Calculator;
