import { Flashcard, StudyStats } from '../types';

const CARDS_KEY = 'lexyvocab_cards';
const STATS_KEY = 'lexyvocab_stats';

export const storage = {
  getCards: (): Flashcard[] => {
    const cards = localStorage.getItem(CARDS_KEY);
    return cards ? JSON.parse(cards) : [];
  },

  saveCards: (cards: Flashcard[]) => {
    localStorage.setItem(CARDS_KEY, JSON.stringify(cards));
  },

  getStats: (): StudyStats => {
    const stats = localStorage.getItem(STATS_KEY);
    return stats ? JSON.parse(stats) : {
      totalCards: 0,
      memorizedCards: 0,
      remainingCards: 0,
      streak: 0,
      lastStudyDate: null,
    };
  },

  saveStats: (stats: StudyStats) => {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  },
};