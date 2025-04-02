import React, { useState, useEffect } from 'react';
import { Play, ThumbsUp, ThumbsDown, Loader2, RotateCcw, ChevronLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Database } from '../types/supabase';
import { CelebrationOverlay } from './CelebrationOverlay';

type Card = Database['public']['Tables']['flashcards']['Row'];
type Deck = Database['public']['Tables']['decks']['Row'];

interface StudyCardProps {
  deckId?: string;
  onBack?: () => void;
}

export const StudyCard: React.FC<StudyCardProps> = ({ deckId, onBack }) => {
  const [cards, setCards] = useState<Card[]>([]);
  const [currentCard, setCurrentCard] = useState<Card | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [shownCardIds, setShownCardIds] = useState<Set<string>>(new Set());
  const [deck, setDeck] = useState<Deck | null>(null);
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    loadCards();
  }, [deckId]);

  const loadCards = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('No authenticated user found');
      setIsLoading(false);
      return;
    }

    let query = supabase
      .from('flashcards')
      .select('*')
      .eq('user_id', user.id)
      .order('next_review', { ascending: true });

    if (deckId) {
      query = query.eq('deck_id', deckId);

      // Load deck information
      const { data: deckData } = await supabase
        .from('decks')
        .select('*')
        .eq('id', deckId)
        .single();

      setDeck(deckData);
    }

    const { data: cards, error } = await query;

    if (error) {
      console.error('Error loading cards:', error);
      setIsLoading(false);
      return;
    }

    setCards(cards || []);
    setIsLoading(false);
  };

  const loadNextCard = () => {
    if (!cards.length) return;

    const availableCards = cards.filter(card => !shownCardIds.has(card.id));
    if (!availableCards.length) {
      setShownCardIds(new Set());
      setCurrentCard(cards[0]);
      return;
    }

    const nextCard = availableCards[0];
    setCurrentCard(nextCard);
    setShownCardIds(prev => new Set([...prev, nextCard.id]));
  };

  const updateCardReview = async (cardId: string, remembered: boolean) => {
    const now = new Date();
    const card = cards.find(c => c.id === cardId);
    if (!card) return;

    const confidence = remembered ? Math.min(card.confidence + 1, 5) : Math.max(card.confidence - 1, 0);
    const reviewCount = card.review_count + 1;
    
    // Calculate next review date based on confidence level
    const daysUntilNextReview = remembered ? Math.pow(2, confidence) : 1;
    const nextReview = new Date(now.getTime() + daysUntilNextReview * 24 * 60 * 60 * 1000).toISOString();

    const { error } = await supabase
      .from('flashcards')
      .update({
        confidence,
        review_count: reviewCount,
        last_reviewed: now.toISOString(),
        next_review: nextReview
      })
      .eq('id', cardId);

    if (error) {
      console.error('Error updating card review:', error);
      return;
    }

    setCards(prev => prev.map(c => 
      c.id === cardId 
        ? { 
            ...c, 
            confidence, 
            review_count: reviewCount, 
            last_reviewed: now.toISOString(), 
            next_review: nextReview 
          } 
        : c
    ));

    // Updates the consecutive correct answers counter
    if (remembered) {
      const newConsecutiveCorrect = consecutiveCorrect + 1;
      setConsecutiveCorrect(newConsecutiveCorrect);
      
      // If reached 5 consecutive correct answers, show celebration
      if (newConsecutiveCorrect === 5) {
        setShowCelebration(true);
        // Reset counter after 5 seconds
        setTimeout(() => {
          setShowCelebration(false);
          setConsecutiveCorrect(0);
        }, 5000);
      }
    } else {
      setConsecutiveCorrect(0);
    }
  };

  useEffect(() => {
    if (!currentCard && cards.length > 0) {
      loadNextCard();
    }
  }, [cards, currentCard]);

  useEffect(() => {
    if (currentCard && !showAnswer) {
      speakText(currentCard.front);
    }
  }, [currentCard, showAnswer]);

  if (!cards.length) {
    return (
      <div className="text-center p-4 sm:p-8">
        <h2 className="text-xl sm:text-2xl font-bold mb-4">
          {deck ? `${deck.name} - No Cards` : 'Welcome to LexyVocab!'}
        </h2>
        <p className="text-gray-600">
          {deck 
            ? 'Start by adding some flashcards to this deck.'
            : 'Start by adding some flashcards to study.'
          }
        </p>
        {onBack && (
          <button
            onClick={onBack}
            className="mt-4 inline-flex items-center text-blue-500 hover:text-blue-600"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Back to Decks
          </button>
        )}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4 sm:p-8">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!currentCard) {
    return null;
  }

  const handleResponse = async (remembered: boolean) => {
    setIsLoading(true);
    await updateCardReview(currentCard.id, remembered);
    setShowAnswer(false);
    loadNextCard();
    setIsLoading(false);
  };

  const speakText = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="relative w-full h-full">
      {showCelebration && <CelebrationOverlay />}
      <div className="w-full max-w-md mx-auto">
        {deck && (
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">{deck.name}</h2>
            {onBack && (
              <button
                onClick={onBack}
                className="inline-flex items-center text-blue-500 hover:text-blue-600"
              >
                <ChevronLeft className="w-5 h-5 mr-1" />
                Back to Decks
              </button>
            )}
          </div>
        )}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-4 sm:p-6">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-3">
                <h2 className="text-xl sm:text-2xl font-bold">{currentCard.front}</h2>
                <button
                  onClick={() => speakText(currentCard.front)}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                  aria-label="Play pronunciation"
                >
                  <Play className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>
              <button
                onClick={() => {
                  setShownCardIds(new Set());
                  loadNextCard();
                }}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-600"
                aria-label="Reset card deck"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            </div>

            {showAnswer ? (
              <>
                <div className="mt-4">
                  <p className="text-lg mb-2">{currentCard.verse}</p>
                  <p className="text-gray-600 italic">{currentCard.sentence}</p>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => handleResponse(false)}
                    className="flex-1 flex items-center justify-center gap-2 bg-red-100 text-red-700 py-2 rounded-md hover:bg-red-200 transition-colors"
                  >
                    <ThumbsDown className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="text-sm sm:text-base">Didn't Remember</span>
                  </button>
                  <button
                    onClick={() => handleResponse(true)}
                    className="flex-1 flex items-center justify-center gap-2 bg-green-100 text-green-700 py-2 rounded-md hover:bg-green-200 transition-colors"
                  >
                    <ThumbsUp className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="text-sm sm:text-base">Remembered</span>
                  </button>
                </div>
              </>
            ) : (
              <button
                onClick={() => setShowAnswer(true)}
                className="w-full mt-6 bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition-colors"
              >
                Show Answer
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};