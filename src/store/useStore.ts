import { create } from 'zustand';
import { Flashcard, StudyStats } from '../types';
import { storage } from '../utils/storage';
import { calculateNextReview } from '../utils/spaced-repetition';

interface State {
  cards: Flashcard[];
  stats: StudyStats;
  currentCard: Flashcard | null;
  shownCards: Set<string>;
  addCard: (card: Omit<Flashcard, 'id' | 'createdAt' | 'lastReviewed' | 'nextReview' | 'reviewCount' | 'confidence'>) => void;
  updateCardReview: (cardId: string, remembered: boolean) => void;
  loadNextCard: () => void;
  resetShownCards: () => void;
}

export const useStore = create<State>((set, get) => ({
  cards: storage.getCards(),
  stats: storage.getStats(),
  currentCard: null,
  shownCards: new Set<string>(),

  addCard: (cardData) => {
    const newCard: Flashcard = {
      ...cardData,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      lastReviewed: null,
      nextReview: Date.now(),
      reviewCount: 0,
      confidence: 0,
    };

    set((state) => {
      const cards = [...state.cards, newCard];
      storage.saveCards(cards);
      
      const stats = {
        ...state.stats,
        totalCards: cards.length,
        remainingCards: cards.length - state.stats.memorizedCards,
      };
      storage.saveStats(stats);
      
      return { cards, stats };
    });
  },

  updateCardReview: (cardId, remembered) => {
    set((state) => {
      const cards = state.cards.map(card => {
        if (card.id !== cardId) return card;

        const confidence = remembered 
          ? Math.min(1, (card.confidence || 0) + 0.2)
          : Math.max(0, (card.confidence || 0) - 0.2);

        return {
          ...card,
          lastReviewed: Date.now(),
          nextReview: Date.now(), // Always show cards immediately
          reviewCount: card.reviewCount + 1,
          confidence,
        };
      });

      const memorizedCards = cards.filter(c => c.confidence >= 0.8).length;
      const now = Date.now();
      const lastStudyDate = state.stats.lastStudyDate || 0;
      const isNewDay = new Date(now).getDate() !== new Date(lastStudyDate).getDate();
      
      const stats: StudyStats = {
        totalCards: cards.length,
        memorizedCards,
        remainingCards: cards.length - memorizedCards,
        streak: isNewDay ? state.stats.streak + 1 : state.stats.streak,
        lastStudyDate: now,
      };

      // Add the reviewed card to shown cards
      const shownCards = new Set(state.shownCards);
      shownCards.add(cardId);

      storage.saveCards(cards);
      storage.saveStats(stats);

      return { cards, stats, shownCards };
    });
  },

  loadNextCard: () => {
    const { cards, shownCards } = get();
    if (!cards.length) {
      set({ currentCard: null });
      return;
    }
    
    // Filter out cards that have already been shown
    const availableCards = cards.filter(card => !shownCards.has(card.id));
    
    // If all cards have been shown, reset the shown cards list
    if (availableCards.length === 0) {
      set({ shownCards: new Set() });
      set({ currentCard: cards[Math.floor(Math.random() * cards.length)] });
      return;
    }
    
    // Get a random card from the available cards
    const randomIndex = Math.floor(Math.random() * availableCards.length);
    set({ currentCard: availableCards[randomIndex] });
  },

  resetShownCards: () => {
    set({ shownCards: new Set() });
  },
}));