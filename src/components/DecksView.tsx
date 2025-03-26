import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { CardForm } from './CardForm';
import type { Database } from '../types/supabase';

type Deck = Database['public']['Tables']['decks']['Row'];
type Flashcard = Database['public']['Tables']['flashcards']['Row'];

export const DecksView: React.FC = () => {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null);
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [deckName, setDeckName] = useState('');
  const [editingCard, setEditingCard] = useState<Flashcard | null>(null);

  useEffect(() => {
    loadDecks();
  }, []);

  useEffect(() => {
    if (selectedDeck) {
      loadCards(selectedDeck.id);
    }
  }, [selectedDeck]);

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

  const loadCards = async (deckId: string) => {
    const { data: cards, error } = await supabase
      .from('flashcards')
      .select('*')
      .eq('deck_id', deckId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error loading cards:', error);
      return;
    }

    setCards(cards);
  };

  const handleCreateDeck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deckName.trim()) return;

    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('No authenticated user found');
      return;
    }

    const { data: deck, error } = await supabase
      .from('decks')
      .insert([{ 
        name: deckName.trim(),
        user_id: user.id
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating deck:', error);
      return;
    }

    setDecks([...decks, deck]);
    setDeckName('');
    setIsCreating(false);
  };

  const handleUpdateDeck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDeck || !deckName.trim()) return;

    const { error } = await supabase
      .from('decks')
      .update({ name: deckName.trim() })
      .eq('id', selectedDeck.id);

    if (error) {
      console.error('Error updating deck:', error);
      return;
    }

    setDecks(decks.map(d => 
      d.id === selectedDeck.id ? { ...d, name: deckName.trim() } : d
    ));
    setDeckName('');
    setIsEditing(false);
  };

  const handleDeleteDeck = async (deckId: string) => {
    if (!confirm('Are you sure you want to delete this deck and all its cards?')) return;

    const { error } = await supabase
      .from('decks')
      .delete()
      .eq('id', deckId);

    if (error) {
      console.error('Error deleting deck:', error);
      return;
    }

    setDecks(decks.filter(d => d.id !== deckId));
    if (selectedDeck?.id === deckId) {
      setSelectedDeck(null);
      setCards([]);
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    if (!confirm('Are you sure you want to delete this card?')) return;

    const { error } = await supabase
      .from('flashcards')
      .delete()
      .eq('id', cardId);

    if (error) {
      console.error('Error deleting card:', error);
      return;
    }

    setCards(cards.filter(c => c.id !== cardId));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-1">
        <div className="bg-white rounded-lg shadow p-4">
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
                  value={deckName}
                  onChange={(e) => setDeckName(e.target.value)}
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
                  onClick={() => {
                    setIsCreating(false);
                    setDeckName('');
                  }}
                  className="p-2 text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </form>
          )}

          <div className="space-y-2">
            {decks.map((deck) => (
              <div
                key={deck.id}
                className={`flex items-center justify-between p-2 rounded-md ${
                  selectedDeck?.id === deck.id
                    ? 'bg-blue-100'
                    : 'hover:bg-gray-50'
                }`}
              >
                <button
                  onClick={() => setSelectedDeck(deck)}
                  className="flex-1 text-left"
                >
                  {deck.name}
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setDeckName(deck.name);
                      setIsEditing(true);
                      setSelectedDeck(deck);
                    }}
                    className="p-1 text-gray-500 hover:text-gray-700"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteDeck(deck.id)}
                    className="p-1 text-gray-500 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="md:col-span-2">
        {selectedDeck ? (
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between mb-6">
              {isEditing ? (
                <form onSubmit={handleUpdateDeck} className="flex-1 flex gap-2">
                  <input
                    type="text"
                    value={deckName}
                    onChange={(e) => setDeckName(e.target.value)}
                    className="flex-1 rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring focus:ring-blue-200"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setDeckName('');
                    }}
                    className="p-2 text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </form>
              ) : (
                <h2 className="text-xl font-semibold text-gray-900">
                  {selectedDeck.name}
                </h2>
              )}
            </div>

            {editingCard ? (
              <CardForm
                deckId={selectedDeck.id}
                card={editingCard}
                onSave={(newCard) => {
                  setCards(cards.map(c => 
                    c.id === newCard.id ? newCard : c
                  ));
                  setEditingCard(null);
                }}
                onCancel={() => setEditingCard(null)}
              />
            ) : (
              <CardForm
                deckId={selectedDeck.id}
                onSave={(newCard) => setCards([...cards, newCard])}
              />
            )}

            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Cards in this Deck
              </h3>
              <div className="space-y-4">
                {cards.map((card) => (
                  <div
                    key={card.id}
                    className="border rounded-lg p-4 hover:bg-gray-50"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium">{card.front}</h4>
                        <p className="text-gray-600 mt-1">{card.verse}</p>
                        <p className="text-gray-500 italic mt-2">{card.sentence}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingCard(card)}
                          className="p-1 text-gray-500 hover:text-gray-700"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCard(card.id)}
                          className="p-1 text-gray-500 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600">Select a deck to view and manage its cards</p>
          </div>
        )}
      </div>
    </div>
  );
};