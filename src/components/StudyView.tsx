import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { StudyCard } from './StudyCard';
import type { Database } from '../types/supabase';

type Deck = Database['public']['Tables']['decks']['Row'];

export const StudyView: React.FC = () => {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(null);

  useEffect(() => {
    loadDecks();
  }, []);

  const loadDecks = async () => {
    const { data: decks, error } = await supabase
      .from('decks')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error loading decks:', error);
      return;
    }

    setDecks(decks);
  };

  if (!selectedDeckId) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Choose a Deck to Study
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {decks.map((deck) => (
              <button
                key={deck.id}
                onClick={() => setSelectedDeckId(deck.id)}
                className="p-4 border rounded-lg text-left hover:bg-gray-50 transition-colors"
              >
                <h3 className="font-medium text-gray-900">{deck.name}</h3>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={() => setSelectedDeckId(null)}
        className="mb-4 text-blue-500 hover:text-blue-600 font-medium"
      >
        ← Choose Another Deck
      </button>
      <StudyCard deckId={selectedDeckId} />
    </div>
  );
};