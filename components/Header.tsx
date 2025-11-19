import React from 'react';
import { AnkiConnectionStatus } from '../types';
import { Wifi, WifiOff, BookOpen, Settings, Moon, Sun } from 'lucide-react';

interface HeaderProps {
  ankiStatus: AnkiConnectionStatus;
  onOpenSettings: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({ ankiStatus, onOpenSettings, theme, toggleTheme }) => {
  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="bg-primary-600 p-2 rounded-lg text-white shadow-sm shadow-primary-500/30">
            <BookOpen size={20} />
          </div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">FlashGenius</h1>
        </div>

        <div className="flex items-center space-x-3 sm:space-x-4">
          <div 
            className={`hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
              ankiStatus === AnkiConnectionStatus.CONNECTED 
                ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-900/50 dark:text-green-400' 
                : 'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-900/50 dark:text-red-400'
            }`}
            title={ankiStatus === AnkiConnectionStatus.CONNECTED ? "Connected to Anki" : "Disconnected from Anki"}
          >
            {ankiStatus === AnkiConnectionStatus.CONNECTED ? <Wifi size={14} /> : <WifiOff size={14} />}
            <span>{ankiStatus === AnkiConnectionStatus.CONNECTED ? 'Anki Connected' : 'Anki Disconnected'}</span>
          </div>
          
          <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block"></div>

          <button
            onClick={toggleTheme}
            className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all"
            aria-label="Toggle Theme"
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>

          <button 
            onClick={onOpenSettings}
            className="p-2 text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all"
            aria-label="Settings"
          >
            <Settings size={20} />
          </button>
        </div>
      </div>
    </header>
  );
};