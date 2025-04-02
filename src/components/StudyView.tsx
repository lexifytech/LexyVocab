import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { StudyCard } from './StudyCard';
import type { Database } from '../types/supabase';
import { ChevronRight, Loader2 } from 'lucide-react';

type Deck = Database['public']['Tables']['decks']['Row'];

export const StudyView: React.FC = () => {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDecks();
  }, []);

  const loadDecks = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('No authenticated user found');
      setIsLoading(false);
      return;
    }

    const { data: decks, error } = await supabase
      .from('decks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error loading decks:', error);
      setIsLoading(false);
      return;
    }

    setDecks(decks || []);
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4 sm:p-8">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (selectedDeckId) {
    return (
      <StudyCard 
        deckId={selectedDeckId} 
        onBack={() => setSelectedDeckId(null)} 
      />
    );
  }

  if (decks.length === 0) {
    return (
      <div className="text-center p-4 sm:p-8">
        <h2 className="text-xl sm:text-2xl font-bold mb-4">No Decks Available</h2>
        <p className="text-gray-600">Create a deck and add some flashcards to start studying.</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Choose a Deck to Study</h2>
      <div className="space-y-3">
        {decks.map((deck) => (
          <button
            key={deck.id}
            onClick={() => setSelectedDeckId(deck.id)}
            className="w-full flex items-center justify-between p-4 bg-white rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
          >
            <span className="text-lg font-medium text-gray-900">{deck.name}</span>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
        ))}
      </div>
    </div>
  );
};