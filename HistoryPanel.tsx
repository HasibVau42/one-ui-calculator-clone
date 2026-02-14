
import React from 'react';
import { HistoryItem, Theme } from '../types';

interface HistoryPanelProps {
  isOpen: boolean;
  history: HistoryItem[];
  onClose: () => void;
  onClear: () => void;
  onSelect: (item: HistoryItem) => void;
  theme: Theme;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({ isOpen, history, onClose, onClear, onSelect, theme }) => {
  if (!isOpen) return null;

  const isDark = theme === 'dark';
  const bgColor = isDark ? 'bg-[#000000]' : 'bg-[#F2F2F2]';
  const textColor = isDark ? 'text-white' : 'text-black';
  const subTextColor = isDark ? 'text-gray-400' : 'text-gray-600';
  const borderColor = isDark ? 'border-gray-800' : 'border-gray-300';

  return (
    <div className={`absolute inset-0 z-50 flex flex-col animate-slide-up ${bgColor}`}>
      {/* Header */}
      <div className={`flex justify-between items-center px-6 py-4 border-b ${borderColor}`}>
        <h2 className={`text-lg font-medium ${textColor}`}>History</h2>
        <button 
            onClick={onClose}
            className={`text-sm font-medium ${subTextColor} p-2`}
        >
            Close
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto px-6 py-4 no-scrollbar">
          {history.length === 0 ? (
            <div className={`h-full flex items-center justify-center ${subTextColor}`}>
              No history
            </div>
          ) : (
            <div className="flex flex-col gap-8 pb-10">
              {history.map((item) => (
                <div 
                  key={item.id} 
                  className="text-right cursor-pointer active:opacity-50"
                  onClick={() => onSelect(item)}
                >
                  <div className={`text-xl mb-1 ${item.expression.length > 20 ? 'break-all' : ''} ${textColor}`}>
                    {item.expression}
                  </div>
                  <div className={`text-2xl font-light text-[#00C853]`}>
                    = {item.result}
                  </div>
                </div>
              ))}
            </div>
          )}
      </div>

      <div className={`p-4 border-t ${borderColor}`}>
          <button 
            onClick={onClear}
            className={`w-full py-3 rounded-full text-sm font-medium ${isDark ? 'bg-[#2E2E2E] text-white' : 'bg-white text-black'} shadow-sm active:opacity-80`}
          >
            Clear history
          </button>
      </div>

      <style>{`
        @keyframes slide-up {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slide-up 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
    </div>
  );
};

export default HistoryPanel;
