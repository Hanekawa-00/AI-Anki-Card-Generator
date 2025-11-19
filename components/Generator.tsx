
import React, { useState } from 'react';
import { Sparkles, Loader2, FileText } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface GeneratorProps {
  onGenerate: (topic: string, count: number, context: string) => Promise<void>;
  isGenerating: boolean;
}

export const Generator: React.FC<GeneratorProps> = ({ onGenerate, isGenerating }) => {
  const { t } = useLanguage();
  const [topic, setTopic] = useState('');
  const [context, setContext] = useState('');
  const [count, setCount] = useState(5);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (topic.trim()) {
      onGenerate(topic, count, context);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors duration-300">
      <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <Sparkles className="text-primary-500 dark:text-primary-400" size={20} />
          {t.createCards}
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{t.createCardsDesc}</p>
      </div>
      
      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        <div>
          <label htmlFor="topic" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            {t.topicLabel}
          </label>
          <input
            id="topic"
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder={t.topicPlaceholder}
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-900/50 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600"
            required
          />
        </div>

        <div>
          <label htmlFor="context" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 flex justify-between">
            <span>{t.contextLabel}</span>
            <span className="text-slate-400 dark:text-slate-500 font-normal text-xs flex items-center gap-1"><FileText size={10}/> {t.pasteNotes}</span>
          </label>
          <textarea
            id="context"
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder={t.contextPlaceholder}
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-900/50 outline-none transition-all h-24 resize-none text-sm placeholder:text-slate-400 dark:placeholder:text-slate-600"
          />
        </div>

        <div className="flex items-center justify-between">
           <div className="flex items-center gap-3">
            <label htmlFor="count" className="text-sm font-medium text-slate-700 dark:text-slate-300">{t.cardCount}</label>
            <select 
              id="count"
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="px-3 py-1.5 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-sm focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-900/50 outline-none"
            >
              <option value={3}>3</option>
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={15}>15</option>
            </select>
           </div>

           <button
            type="submit"
            disabled={isGenerating || !topic.trim()}
            className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 dark:bg-primary-600 dark:hover:bg-primary-500 disabled:bg-primary-300 dark:disabled:bg-slate-700 disabled:text-slate-100 dark:disabled:text-slate-500 text-white px-6 py-2.5 rounded-lg font-medium transition-all shadow-sm shadow-primary-500/30 active:scale-95"
           >
             {isGenerating ? (
               <>
                <Loader2 className="animate-spin" size={18} />
                <span>{t.generating}</span>
               </>
             ) : (
               <>
                <Sparkles size={18} />
                <span>{t.generateButton}</span>
               </>
             )}
           </button>
        </div>
      </form>
    </div>
  );
};
