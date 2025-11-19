
import React, { useState } from 'react';
import { Flashcard } from '../types';
import { Trash2, Tag, Edit3, Check, X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface CardListProps {
  cards: Flashcard[];
  onUpdateCard: (id: string, field: 'front' | 'back', value: string) => void;
  onDeleteCard: (id: string) => void;
}

export const CardList: React.FC<CardListProps> = ({ cards, onUpdateCard, onDeleteCard }) => {
  const { t } = useLanguage();
  const [editingId, setEditingId] = useState<string | null>(null);

  if (cards.length === 0) {
    return (
      <div className="text-center py-20 bg-white/50 dark:bg-slate-800/50 rounded-3xl border border-slate-200 dark:border-slate-700 border-dashed backdrop-blur-sm transition-colors duration-300">
        <div className="mx-auto w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
          <Tag className="text-slate-300 dark:text-slate-600" size={32} />
        </div>
        <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200">{t.noCards}</h3>
        <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-md mx-auto">
          {t.noCardsDesc}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {cards.map((card, index) => {
        const isEditing = editingId === card.id;

        return (
          <div 
            key={card.id} 
            className="relative bg-white dark:bg-slate-800 rounded-[24px] shadow-lg shadow-slate-200/60 dark:shadow-slate-900/40 border border-slate-100 dark:border-slate-700 overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1 duration-300 animate-slide-up group"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            {/* Decorative Top Bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 to-violet-500"></div>

            {/* Card Header / Actions */}
            <div className="px-8 pt-8 flex justify-between items-start">
              <div className="flex flex-wrap gap-2">
                {card.tags.map((tag, i) => (
                  <span key={i} className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-400 tracking-wide transition-colors">
                    #{tag}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {!isEditing && (
                   <button 
                    onClick={() => setEditingId(card.id)}
                    className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-colors"
                    title={t.editCard}
                  >
                    <Edit3 size={18} />
                  </button>
                )}
                <button 
                  onClick={() => onDeleteCard(card.id)}
                  className="p-2 text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                  title={t.deleteCard}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            {/* Card Content */}
            <div className="p-8 grid md:grid-cols-2 gap-8 md:gap-12">
              
              {/* Front Side */}
              <div className="flex flex-col h-full">
                <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.1em] mb-4 block">
                    {t.question}
                </span>
                
                {isEditing ? (
                  <textarea
                    value={card.front}
                    onChange={(e) => onUpdateCard(card.id, 'front', e.target.value)}
                    className="w-full p-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-y text-slate-800 dark:text-slate-200 min-h-[140px] font-mono text-sm leading-relaxed"
                    placeholder="Front content..."
                  />
                ) : (
                  <div className="flex-1 flex flex-col justify-center">
                     <div 
                        className="text-2xl font-semibold text-slate-900 dark:text-slate-100 leading-tight 
                        [&>strong]:text-blue-600 dark:[&>strong]:text-blue-400 [&>strong]:font-bold 
                        [&>em]:text-pink-700 dark:[&>em]:text-pink-400 [&>em]:not-italic [&>em]:font-semibold [&>em]:bg-pink-100 dark:[&>em]:bg-pink-900/20 [&>em]:px-1 [&>em]:rounded 
                        [&>code]:text-red-500 dark:[&>code]:text-red-400 [&>code]:bg-slate-100 dark:[&>code]:bg-slate-700/50 [&>code]:px-1.5 [&>code]:py-0.5 [&>code]:rounded-md [&>code]:border [&>code]:border-slate-200 dark:[&>code]:border-slate-600 [&>code]:text-[0.9em] [&>code]:font-mono"
                        dangerouslySetInnerHTML={{ __html: card.front }} 
                     />
                  </div>
                )}
              </div>

              {/* Back Side */}
              <div className="relative flex flex-col h-full md:border-l md:border-slate-100 dark:md:border-slate-700 md:pl-12">
                {/* Mobile Divider */}
                <div className="md:hidden w-full h-px bg-slate-100 dark:bg-slate-700 my-6"></div>

                <span className="text-xs font-bold text-emerald-500 dark:text-emerald-400 uppercase tracking-[0.1em] mb-4 block">
                    {t.answer}
                </span>

                {isEditing ? (
                  <textarea
                    value={card.back}
                    onChange={(e) => onUpdateCard(card.id, 'back', e.target.value)}
                    className="w-full p-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none resize-y text-slate-800 dark:text-slate-200 min-h-[140px] font-mono text-sm leading-relaxed"
                    placeholder="Back content..."
                  />
                ) : (
                  <div className="flex-1">
                     <div 
                        className="text-[1.1rem] text-slate-600 dark:text-slate-300 leading-relaxed 
                        [&>p]:mb-3 
                        [&>ul]:list-none [&>ul]:ml-0 [&>ul]:my-4 
                        [&>li]:relative [&>li]:pl-6 [&>li]:mb-2 
                        [&>li:before]:content-['→'] [&>li:before]:absolute [&>li:before]:left-0 [&>li:before]:text-violet-500 dark:[&>li:before]:text-violet-400 [&>li:before]:font-bold 
                        [&>strong]:text-blue-600 dark:[&>strong]:text-blue-400 [&>strong]:font-bold 
                        [&>em]:text-pink-700 dark:[&>em]:text-pink-400 [&>em]:not-italic [&>em]:font-semibold [&>em]:bg-pink-100 dark:[&>em]:bg-pink-900/20 [&>em]:px-1 [&>em]:rounded 
                        [&>code]:text-red-500 dark:[&>code]:text-red-400 [&>code]:bg-slate-100 dark:[&>code]:bg-slate-700/50 [&>code]:px-1.5 [&>code]:py-0.5 [&>code]:rounded-md [&>code]:border [&>code]:border-slate-200 dark:[&>code]:border-slate-600 [&>code]:text-[0.85em] [&>code]:font-mono"
                        dangerouslySetInnerHTML={{ __html: card.back }} 
                     />
                  </div>
                )}
              </div>
            </div>

            {/* Edit Actions Footer */}
            {isEditing && (
              <div className="px-8 py-4 bg-slate-50/50 dark:bg-slate-900/30 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3">
                 <button 
                  onClick={() => setEditingId(null)}
                  className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors"
                >
                  <X size={20} />
                </button>
                <button 
                  onClick={() => setEditingId(null)}
                  className="flex items-center gap-2 px-5 py-2 bg-slate-900 dark:bg-slate-200 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 rounded-xl font-medium text-sm transition-all shadow-lg shadow-slate-900/20 dark:shadow-none"
                >
                  <Check size={16} />
                  <span>{t.doneEditing}</span>
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
