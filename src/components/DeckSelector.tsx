import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Database } from '../types/supabase';

type Deck = Database['public']['Tables']['decks']['Row'];

interface DeckSelectorProps {
  selectedDeckId: string | null;
  onDeckSelect: (deckId: string | null) => void;
}

export const DeckSelector: React.FC<DeckSelectorProps> = ({
  selectedDeckId,
  onDeckSelect,
}) => {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newDeckName, setNewDeckName] = useState('');

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
    if (decks.length > 0 && !selectedDeckId) {
      onDeckSelect(decks[0].id);
    }
  };

  const handleCreateDeck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeckName.trim()) return;

    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('No authenticated user found');
      return;
    }

    const { data: deck, error } = await supabase
      .from('decks')
      .insert([{ 
        name: newDeckName.trim(),
        user_id: user.id
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating deck:', error);
      return;
    }

    setDecks([...decks, deck]);
    setNewDeckName('');
    setIsCreating(false);
    onDeckSelect(deck.id);
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Your Decks</h2>
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium bg-blue-500 text-white hover:bg-blue-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Deck
        </button>
      </div>

      {isCreating && (
        <form onSubmit={handleCreateDeck} className="mb-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={newDeckName}
              onChange={(e) => setNewDeckName(e.target.value)}
              placeholder="Enter deck name"
              className="flex-1 rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring focus:ring-blue-200"
              autoFocus
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Create
            </button>
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="flex flex-wrap gap-2">
        {decks.map((deck) => (
          <button
            key={deck.id}
            onClick={() => onDeckSelect(deck.id)}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              selectedDeckId === deck.id
                ? 'bg-blue-100 text-blue-700'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            {deck.name}
          </button>
        ))}
      </div>
    </div>
  );
};