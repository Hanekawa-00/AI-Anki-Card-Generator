
import React, { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Header } from './components/Header';
import { Generator } from './components/Generator';
import { CardList } from './components/CardList';
import { ExportBar } from './components/ExportBar';
import { AnkiStatusModal } from './components/AnkiStatusModal';
import { ToastContainer } from './components/Toast';
import { checkConnection, getDeckNames, addNotes, createDeck } from './services/ankiService';
import { generateFlashcards } from './services/geminiService';
import { Flashcard, AnkiConnectionStatus, AppState, ToastMessage, ToastType } from './types';
import { useLanguage } from './contexts/LanguageContext';

const App: React.FC = () => {
  const { language, t } = useLanguage();
  const [ankiStatus, setAnkiStatus] = useState<AnkiConnectionStatus>(AnkiConnectionStatus.DISCONNECTED);
  const [decks, setDecks] = useState<string[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [generatedCards, setGeneratedCards] = useState<Flashcard[]>([]);
  const [isExporting, setIsExporting] = useState(false);

  // Toast State
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Theme Management
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Load Persisted State
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
    }

    // Load saved cards
    const savedCards = localStorage.getItem('flashgenius_cards');
    if (savedCards) {
      try {
        setGeneratedCards(JSON.parse(savedCards));
      } catch (e) {
        console.error("Failed to load saved cards");
      }
    }
  }, []);

  // Persist Theme
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Persist Cards
  useEffect(() => {
    localStorage.setItem('flashgenius_cards', JSON.stringify(generatedCards));
  }, [generatedCards]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const addToast = (message: string, type: ToastType = 'info') => {
    const id = uuidv4();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Initialize Connection
  const initAnki = useCallback(async () => {
    const connected = await checkConnection();
    if (connected) {
      setAnkiStatus(AnkiConnectionStatus.CONNECTED);
      try {
        const deckList = await getDeckNames();
        setDecks(deckList);
      } catch (e) {
        console.error("Failed to fetch decks", e);
      }
    } else {
      setAnkiStatus(AnkiConnectionStatus.DISCONNECTED);
    }
  }, []);

  useEffect(() => {
    initAnki();
  }, [initAnki]);

  // Handlers
  const handleGenerate = async (topic: string, count: number, context: string) => {
    setAppState(AppState.GENERATING);
    try {
      const rawCards = await generateFlashcards(topic, count, context, language);
      const newCards: Flashcard[] = rawCards.map(c => ({
        id: uuidv4(),
        front: c.front,
        back: c.back,
        tags: c.tags
      }));
      // Append to existing instead of replace? For now replace to keep it clean, 
      // but in a real app maybe append is better. Let's stick to replace for "Generation" flow.
      setGeneratedCards(newCards);
      setAppState(AppState.REVIEW);
    } catch (error) {
      addToast(t.genError, 'error');
      setAppState(AppState.IDLE);
    }
  };

  const handleUpdateCard = (id: string, field: 'front' | 'back' | 'tags', value: string | string[]) => {
    setGeneratedCards(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const handleDeleteCard = (id: string) => {
    setGeneratedCards(prev => prev.filter(c => c.id !== id));
  };

  const handleClearAll = () => {
    if (window.confirm("Are you sure you want to delete all cards?")) {
      setGeneratedCards([]);
      addToast(t.clearedSuccess, 'success');
    }
  };

  const handleExport = async (deckName: string) => {
    if (ankiStatus !== AnkiConnectionStatus.CONNECTED) {
      setIsSettingsOpen(true);
      return;
    }
    
    setIsExporting(true);
    try {
      if (!decks.includes(deckName)) {
        await createDeck(deckName);
        setDecks(prev => [...prev, deckName]);
      }

      const results = await addNotes(deckName, generatedCards);
      
      const successCount = results.filter(r => r === true).length;
      const totalCount = results.length;
      const duplicateCount = totalCount - successCount;
      
      if (successCount > 0) {
        let message = t.exportSuccess.replace('{n}', successCount.toString()).replace('{deck}', deckName);
        if (duplicateCount > 0) {
          message += t.duplicatesSkipped.replace('{n}', duplicateCount.toString());
        }
        addToast(message, 'success');
        // Optional: Clear cards after successful export? 
        // Let's keep them in case user wants to export to another deck.
        setAppState(AppState.IDLE);
      } else if (duplicateCount > 0) {
        const msg = t.exportNoNew.replace('{n}', duplicateCount.toString()).replace('{deck}', deckName);
        addToast(msg, 'info');
      } else {
        addToast(t.exportError, 'error');
      }
    } catch (error) {
      console.error(error);
      addToast(t.exportError, 'error');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors duration-300 font-sans">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <Header 
        ankiStatus={ankiStatus} 
        onOpenSettings={() => setIsSettingsOpen(true)}
        theme={theme}
        toggleTheme={toggleTheme}
      />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8 space-y-8 pb-32">
        {/* Generator Section */}
        <section>
          <Generator 
            onGenerate={handleGenerate} 
            isGenerating={appState === AppState.GENERATING} 
          />
        </section>

        {/* Results Section */}
        <section>
          {(generatedCards.length > 0 || appState === AppState.REVIEW) && (
            <div className="animate-fade-in">
              <div className="flex items-center justify-between mb-4 px-1">
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                  {t.generatedCards}
                </h2>
                <button 
                  onClick={handleClearAll}
                  className="text-sm text-red-500 hover:text-red-600 font-medium px-3 py-1 rounded-md hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                >
                  {t.clearAll}
                </button>
              </div>
              
              <CardList 
                cards={generatedCards} 
                onUpdateCard={handleUpdateCard} 
                onDeleteCard={handleDeleteCard} 
              />
            </div>
          )}
        </section>
      </main>

      {/* Floating Actions */}
      <ExportBar 
        cards={generatedCards} 
        onExport={handleExport} 
        decks={decks}
        isExporting={isExporting}
        ankiConnected={ankiStatus === AnkiConnectionStatus.CONNECTED}
      />

      {/* Modals */}
      <AnkiStatusModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)}
        onRetry={initAnki}
        isConnected={ankiStatus === AnkiConnectionStatus.CONNECTED}
      />
    </div>
  );
};

export default App;
