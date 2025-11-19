
import React, { useState, useEffect } from 'react';
import { Download, ChevronDown } from 'lucide-react';
import { Flashcard } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface ExportBarProps {
  cards: Flashcard[];
  onExport: (deckName: string) => void;
  decks: string[];
  isExporting: boolean;
  ankiConnected: boolean;
}

export const ExportBar: React.FC<ExportBarProps> = ({ cards, onExport, decks, isExporting, ankiConnected }) => {
  const { t } = useLanguage();
  const [selectedDeck, setSelectedDeck] = useState<string>('Default');
  const [newDeckName, setNewDeckName] = useState('');
  const [isCreatingDeck, setIsCreatingDeck] = useState(false);

  // Default to 'Default' deck if available, otherwise first one
  useEffect(() => {
    if (decks.length > 0 && !decks.includes(selectedDeck)) {
      if (decks.includes('Default')) setSelectedDeck('Default');
      else setSelectedDeck(decks[0]);
    }
  }, [decks]);

  if (cards.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 w-full max-w-2xl px-4 z-40 animate-slide-up">
      <div className="bg-slate-900 dark:bg-slate-800 text-white rounded-2xl shadow-2xl dark:shadow-black/50 p-4 flex items-center justify-between ring-1 ring-slate-800 dark:ring-slate-600 transition-colors duration-300">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <span className="font-bold text-lg">{cards.length} {t.cardsReady}</span>
            <span className="text-slate-400 text-xs">{t.reviewAndExport}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {ankiConnected ? (
            <>
             <div className="relative group">
               {!isCreatingDeck ? (
                 <div className="relative">
                    <select
                      value={selectedDeck}
                      onChange={(e) => {
                        if (e.target.value === '___NEW___') {
                          setIsCreatingDeck(true);
                        } else {
                          setSelectedDeck(e.target.value);
                        }
                      }}
                      className="appearance-none bg-slate-800 dark:bg-slate-900 hover:bg-slate-700 dark:hover:bg-slate-950 text-white text-sm py-2 pl-4 pr-10 rounded-lg border border-slate-700 dark:border-slate-600 focus:ring-2 focus:ring-primary-500 outline-none cursor-pointer transition-colors min-w-[140px]"
                    >
                      {decks.map(deck => <option key={deck} value={deck}>{deck}</option>)}
                      <option value="___NEW___">{t.createDeck}</option>
                    </select>
                    <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                 </div>
               ) : (
                 <div className="flex items-center gap-2 animate-fade-in">
                   <input 
                    autoFocus
                    type="text" 
                    placeholder={t.deckNamePlaceholder}
                    className="bg-slate-800 dark:bg-slate-900 text-white text-sm py-2 px-3 rounded-lg border border-slate-700 focus:border-primary-500 outline-none w-32"
                    value={newDeckName}
                    onChange={e => setNewDeckName(e.target.value)}
                    onBlur={() => {
                      if (!newDeckName.trim()) setIsCreatingDeck(false);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newDeckName.trim()) {
                        setSelectedDeck(newDeckName);
                        setIsCreatingDeck(false);
                      }
                    }}
                   />
                 </div>
               )}
             </div>

              <button
                onClick={() => onExport(isCreatingDeck && newDeckName ? newDeckName : selectedDeck)}
                disabled={isExporting}
                className="bg-primary-600 hover:bg-primary-500 dark:hover:bg-primary-400 disabled:bg-slate-700 text-white px-5 py-2 rounded-lg font-medium transition-all flex items-center gap-2 shadow-lg shadow-primary-900/20 active:scale-95"
              >
                {isExporting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Download size={18} />
                )}
                <span>{t.syncToAnki}</span>
              </button>
            </>
          ) : (
             <span className="text-amber-400 text-sm bg-amber-950/30 px-3 py-1.5 rounded border border-amber-900/50">
               {t.connectToExport}
             </span>
          )}
        </div>
      </div>
    </div>
  );
};
