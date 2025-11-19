import React, { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Header } from './components/Header';
import { Generator } from './components/Generator';
import { CardList } from './components/CardList';
import { ExportBar } from './components/ExportBar';
import { AnkiStatusModal } from './components/AnkiStatusModal';
import { checkConnection, getDeckNames, addNotes, createDeck } from './services/ankiService';
import { generateFlashcards } from './services/geminiService';
import { Flashcard, AnkiConnectionStatus, AppState } from './types';

const App: React.FC = () => {
  const [ankiStatus, setAnkiStatus] = useState<AnkiConnectionStatus>(AnkiConnectionStatus.DISCONNECTED);
  const [decks, setDecks] = useState<string[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [generatedCards, setGeneratedCards] = useState<Flashcard[]>([]);
  const [isExporting, setIsExporting] = useState(false);

  // Theme Management
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
    }
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Initialize Connection
  const initAnki = useCallback(async () => {
    // Checking connection also attempts to ensure the custom model exists
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
      const rawCards = await generateFlashcards(topic, count, context);
      const newCards: Flashcard[] = rawCards.map(c => ({
        id: uuidv4(),
        front: c.front,
        back: c.back,
        tags: c.tags
      }));
      setGeneratedCards(newCards);
      setAppState(AppState.REVIEW);
    } catch (error) {
      alert("Failed to generate cards. Please check your API Key or Try again.");
      setAppState(AppState.IDLE);
    }
  };

  const handleUpdateCard = (id: string, field: 'front' | 'back', value: string) => {
    setGeneratedCards(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const handleDeleteCard = (id: string) => {
    setGeneratedCards(prev => prev.filter(c => c.id !== id));
  };

  const handleExport = async (deckName: string) => {
    if (ankiStatus !== AnkiConnectionStatus.CONNECTED) {
      setIsSettingsOpen(true);
      return;
    }
    
    setIsExporting(true);
    try {
      // Check if deck needs creation (simple check against known decks)
      if (!decks.includes(deckName)) {
        await createDeck(deckName);
        setDecks(prev => [...prev, deckName]);
      }

      const results = await addNotes(deckName, generatedCards);
      
      const successCount = results.filter(r => r === true).length;
      const totalCount = results.length;
      const duplicateCount = totalCount - successCount;
      
      if (successCount > 0) {
        let message = `Successfully exported ${successCount} cards to deck "${deckName}"!`;
        if (duplicateCount > 0) {
          message += `\n(${duplicateCount} duplicates were skipped)`;
        }
        alert(message);
        setGeneratedCards([]); // Clear after export
        setAppState(AppState.IDLE);
      } else if (duplicateCount > 0) {
        // If all were duplicates
        alert(`Sync complete. No new cards were added because all ${duplicateCount} cards already exist in deck "${deckName}".`);
      } else {
        alert("Export failed. Please check AnkiConnect is running.");
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred during export.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
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
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
              {appState === AppState.IDLE && generatedCards.length === 0 ? "Recent Cards" : "Generated Cards"}
            </h2>
            {generatedCards.length > 0 && (
              <button 
                onClick={() => setGeneratedCards([])}
                className="text-sm text-red-500 hover:text-red-600 font-medium"
              >
                Clear All
              </button>
            )}
          </div>
          
          <CardList 
            cards={generatedCards} 
            onUpdateCard={handleUpdateCard} 
            onDeleteCard={handleDeleteCard} 
          />
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