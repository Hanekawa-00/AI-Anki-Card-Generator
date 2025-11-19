import { AnkiConnectResponse, Flashcard } from '../types';

const ANKI_CONNECT_URL = 'http://127.0.0.1:8765';

// Versioned model name to ensure we can update styles by bumping version
const MODEL_NAME = "FlashGenius-Elegant-v3";

const MODEL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;700&family=JetBrains+Mono:wght@400;700&display=swap');

.card {
  font-family: 'Outfit', system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  font-size: 18px;
  line-height: 1.6;
  color: #334155; /* Slate 700 */
  background-color: #f1f5f9; /* Slate 100 */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  margin: 0;
  padding: 10px;
}

/* The main card container */
.fg-container {
  background-color: #ffffff;
  border-radius: 24px;
  box-shadow: 
    0 10px 15px -3px rgba(0, 0, 0, 0.05), 
    0 4px 6px -2px rgba(0, 0, 0, 0.025),
    0 0 0 1px rgba(0,0,0,0.03);
  width: 100%;
  max-width: 650px;
  padding: 40px;
  box-sizing: border-box;
  text-align: left;
  position: relative;
  overflow: hidden;
}

/* Decorative top gradient bar */
.fg-container::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 6px;
  background: linear-gradient(90deg, #3b82f6, #8b5cf6);
}

/* Labels */
.fg-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-weight: 700;
  color: #94a3b8;
  margin-bottom: 12px;
  display: block;
}

.fg-label.answer {
  color: #10b981; /* Emerald 500 */
}

/* Content Typography */
.fg-front {
  font-size: 1.5rem;
  font-weight: 600;
  color: #0f172a; /* Slate 900 */
  line-height: 1.35;
  margin-bottom: 4px;
}

.fg-back {
  font-size: 1.1rem;
  color: #334155;
}

.fg-divider {
  height: 1px;
  background: linear-gradient(90deg, #f1f5f9 0%, #cbd5e1 50%, #f1f5f9 100%);
  margin: 32px 0;
  border: none;
}

/* Semantic HTML Styling */
strong { 
  color: #2563eb; 
  font-weight: 700; 
}

em { 
  color: #be185d; /* Pink 700 */
  font-style: normal;
  font-weight: 600;
  background-color: #fce7f3; /* Pink 100 */
  padding: 0 4px;
  border-radius: 4px;
}

code {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.85em;
  background-color: #f8fafc;
  color: #ef4444;
  padding: 3px 6px;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
}

ul {
  padding-left: 0;
  margin: 16px 0;
  list-style: none;
}

li {
  position: relative;
  padding-left: 24px;
  margin-bottom: 8px;
}

li::before {
  content: "→";
  position: absolute;
  left: 0;
  color: #8b5cf6; /* Violet 500 */
  font-weight: bold;
}

/* Night Mode Support */
.nightMode .card { background-color: #0f172a; color: #e2e8f0; }
.nightMode .fg-container { 
  background-color: #1e293b; 
  box-shadow: none;
  border: 1px solid #334155;
}
.nightMode .fg-front { color: #f1f5f9; }
.nightMode .fg-back { color: #cbd5e1; }
.nightMode .fg-divider { background: linear-gradient(90deg, #1e293b 0%, #334155 50%, #1e293b 100%); }
.nightMode strong { color: #60a5fa; }
.nightMode em { color: #f472b6; background-color: rgba(244, 114, 182, 0.1); }
.nightMode code { background-color: #0f172a; border-color: #334155; color: #f87171; }
`;

const CARD_TEMPLATES = [
  {
    Name: "Elegant Card",
    Front: `
      <div class="fg-container">
        <span class="fg-label">Question</span>
        <div class="fg-front">
          {{Front}}
        </div>
      </div>
    `,
    Back: `
      <div class="fg-container">
        <span class="fg-label">Question</span>
        <div class="fg-front">
          {{Front}}
        </div>
        
        <hr class="fg-divider">
        
        <span class="fg-label answer">Answer</span>
        <div class="fg-back">
          {{Back}}
        </div>
      </div>
    `
  }
];

/**
 * Generic function to invoke AnkiConnect actions
 */
async function invoke<T>(action: string, params: Record<string, any> = {}): Promise<T> {
  try {
    const response = await fetch(ANKI_CONNECT_URL, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action, version: 6, params }),
    });

    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.statusText}`);
    }

    const data: AnkiConnectResponse<T> = await response.json();

    if (data.error) {
      throw new Error(data.error);
    }

    return data.result;
  } catch (error) {
    console.error(`AnkiConnect Error (${action}):`, error);
    throw error;
  }
}

export const checkConnection = async (): Promise<boolean> => {
  try {
    await invoke('version');
    // Ensure our custom model exists whenever we connect
    await ensureModel();
    return true;
  } catch (e) {
    return false;
  }
};

export const getDeckNames = async (): Promise<string[]> => {
  return invoke<string[]>('deckNames');
};

/**
 * Ensures the custom Note Type (Model) exists in Anki.
 * If it doesn't exist, it creates it with our custom CSS.
 */
export const ensureModel = async (): Promise<void> => {
  try {
    const modelNames = await invoke<string[]>('modelNames');
    if (!modelNames.includes(MODEL_NAME)) {
      console.log(`Creating custom model: ${MODEL_NAME}`);
      await invoke('createModel', {
        modelName: MODEL_NAME,
        inOrderFields: ["Front", "Back"],
        css: MODEL_CSS,
        cardTemplates: CARD_TEMPLATES
      });
    }
  } catch (error) {
    console.error("Failed to ensure Anki model exists:", error);
  }
};

export const addNote = async (deckName: string, card: Flashcard): Promise<number> => {
  const note = {
    deckName: deckName,
    modelName: MODEL_NAME, // Use our custom beautiful model
    fields: {
      Front: card.front,
      Back: card.back
    },
    options: {
      allowDuplicate: false,
      duplicateScope: "deck",
      duplicateScopeOptions: {
        deckName: deckName,
        checkChildren: false,
        checkAllModels: false
      }
    },
    tags: card.tags
  };

  return invoke<number>('addNote', { note });
};

export const addNotes = async (deckName: string, cards: Flashcard[]): Promise<boolean[]> => {
  // Ensure model exists before batch operation
  await ensureModel();

  // We execute sequentially to track individual success
  const results = await Promise.all(cards.map(async (card) => {
    try {
      await addNote(deckName, card);
      return true;
    } catch (error: any) {
      const errorMsg = String(error);
      // Handle duplicate error gracefully
      if (errorMsg.includes('duplicate') || errorMsg.includes('Duplicate')) {
        console.warn(`Skipping duplicate: ${card.front.substring(0, 15)}...`);
        return false; // Return false (not added) but don't throw
      }
      console.error(`Failed to add card: ${errorMsg}`);
      return false;
    }
  }));

  return results;
};

export const createDeck = async (deck: string): Promise<number> => {
  return invoke<number>('createDeck', { deck });
};
