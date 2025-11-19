import React from 'react';
import { X, AlertTriangle, CheckCircle2, RefreshCw } from 'lucide-react';

interface AnkiStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRetry: () => void;
  isConnected: boolean;
}

export const AnkiStatusModal: React.FC<AnkiStatusModalProps> = ({ isOpen, onClose, onRetry, isConnected }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-fade-in border border-slate-200 dark:border-slate-700 transition-colors duration-300">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Anki Connection Setup</h3>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
              <X size={20} />
            </button>
          </div>

          {isConnected ? (
            <div className="flex flex-col items-center py-6 text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4 text-green-600 dark:text-green-400">
                <CheckCircle2 size={32} />
              </div>
              <h4 className="text-lg font-medium text-green-700 dark:text-green-400 mb-2">Successfully Connected!</h4>
              <p className="text-slate-600 dark:text-slate-300">You can now sync generated cards directly to your local Anki decks.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-400 dark:border-amber-500/70 p-4 rounded-r-md">
                <div className="flex">
                  <AlertTriangle className="h-5 w-5 text-amber-400 dark:text-amber-500" />
                  <div className="ml-3">
                    <p className="text-sm text-amber-700 dark:text-amber-400">
                      Could not connect to Anki at <code className="bg-amber-100 dark:bg-amber-900/40 px-1 rounded">http://127.0.0.1:8765</code>
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-sm text-slate-600 dark:text-slate-300 space-y-3">
                <p className="font-medium text-slate-800 dark:text-slate-200">To enable connection:</p>
                <ol className="list-decimal list-inside space-y-2 ml-1">
                  <li>Open Anki on your computer.</li>
                  <li>Install the <strong>AnkiConnect</strong> add-on (Code: 2055492159).</li>
                  <li>
                    Go to <span className="font-mono text-xs bg-slate-100 dark:bg-slate-700 p-1 rounded">Tools &gt; Add-ons &gt; AnkiConnect &gt; Config</span> and update:
                    <pre className="mt-2 bg-slate-800 dark:bg-black text-slate-200 p-3 rounded-md text-xs overflow-x-auto">
{`{
    "webCorsOriginList": [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*" 
    ]
}`}
                    </pre>
                    <span className="text-xs text-slate-400 block mt-1">Tip: Use "*" to allow all connections for simplicity. Restart Anki after changing config.</span>
                  </li>
                </ol>
              </div>
            </div>
          )}
        </div>

        <div className="bg-slate-50 dark:bg-slate-900/50 px-6 py-4 flex justify-end space-x-3 border-t border-slate-100 dark:border-slate-700">
           <button 
            onClick={onClose}
            className="px-4 py-2 text-slate-600 dark:text-slate-400 font-medium hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            Close
          </button>
          <button 
            onClick={onRetry}
            className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors shadow-sm active:scale-95"
          >
            <RefreshCw size={16} />
            <span>Retry Connection</span>
          </button>
        </div>
      </div>
    </div>
  );
};