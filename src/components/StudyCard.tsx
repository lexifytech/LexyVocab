import React, { useState, useEffect } from 'react';
import { Play, ThumbsUp, ThumbsDown, Loader2, RotateCcw } from 'lucide-react';
import { useStore } from '../store/useStore';

export const StudyCard: React.FC = () => {
  const { cards, currentCard, updateCardReview, loadNextCard, resetShownCards } = useStore();
  const [showAnswer, setShowAnswer] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!currentCard) {
      loadNextCard();
    }
  }, [currentCard, loadNextCard]);

  useEffect(() => {
    if (currentCard && !showAnswer) {
      speakText(currentCard.front);
    }
  }, [currentCard, showAnswer]);

  if (!cards.length) {
    return (
      <div className="text-center p-4 sm:p-8">
        <h2 className="text-xl sm:text-2xl font-bold mb-4">Welcome to LexyVocab!</h2>
        <p className="text-gray-600">Start by adding some flashcards to study.</p>
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
    loadNextCard();
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
    <div className="w-full max-w-md mx-auto">
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
                resetShownCards();
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
  );
};