import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Plus, Pencil, Trash2, ChevronRight, ArrowLeft, X, Search } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { CardForm } from './CardForm';
import type { Database } from '../types/supabase';
import debounce from 'lodash/debounce';

type Deck = Database['public']['Tables']['decks']['Row'];
type Card = Database['public']['Tables']['flashcards']['Row'];

export const DecksView: React.FC = () => {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [editingDeckId, setEditingDeckId] = useState<string | null>(null);
  const [deckName, setDeckName] = useState('');
  const [showCardsModal, setShowCardsModal] = useState(false);
  const [deckCards, setDeckCards] = useState<Card[]>([]);
  const [viewingDeckId, setViewingDeckId] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const CARDS_PER_PAGE = 5;

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

  const loadDeckCards = async (deckId: string, reset = false, searchTerm = '') => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('No authenticated user found');
      return;
    }

    if (reset) {
      setPage(0);
      setHasMore(true);
      setDeckCards([]);
    }

    const currentPage = reset ? 0 : page;
    const from = currentPage * CARDS_PER_PAGE;
    const to = from + CARDS_PER_PAGE - 1;

    let query = supabase
      .from('flashcards')
      .select('*')
      .eq('deck_id', deckId)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (searchTerm) {
      query = query.or(`front.ilike.%${searchTerm}%,verse.ilike.%${searchTerm}%,sentence.ilike.%${searchTerm}%`);
    }

    const { data: cards, error } = await query;

    if (error) {
      console.error('Error loading cards:', error);
      return;
    }

    if (cards.length < CARDS_PER_PAGE) {
      setHasMore(false);
    }

    setDeckCards(prev => reset ? cards : [...prev, ...cards]);
    setPage(prev => reset ? 1 : prev + 1);
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

  const handleUpdateDeck = async (deckId: string, newName: string) => {
    if (!newName.trim()) return;

    const { error } = await supabase
      .from('decks')
      .update({ name: newName.trim() })
      .eq('id', deckId);

    if (error) {
      console.error('Error updating deck:', error);
      return;
    }

    setDecks(decks.map(d => 
      d.id === deckId ? { ...d, name: newName.trim() } : d
    ));
    setEditingDeckId(null);
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

    setDeckCards(prev => prev.filter(card => card.id !== cardId));
  };

  const handleUpdateCard = async (cardId: string, updatedData: Partial<Card>) => {
    const { error } = await supabase
      .from('flashcards')
      .update(updatedData)
      .eq('id', cardId);

    if (error) {
      console.error('Error updating card:', error);
      return;
    }

    setDeckCards(prev => 
      prev.map(card => card.id === cardId ? { ...card, ...updatedData } : card)
    );
    setEditingCard(null);
  };

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight * 1.5 && hasMore && viewingDeckId) {
      loadDeckCards(viewingDeckId);
    }
  }, [hasMore, viewingDeckId]);

  const CardsModal = () => {
    const deck = decks.find(d => d.id === viewingDeckId);
    const [isAddingCard, setIsAddingCard] = useState(false);
    const [localSearchQuery, setLocalSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [modalCards, setModalCards] = useState<Card[]>([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [hasMoreCards, setHasMoreCards] = useState(true);

    const loadModalCards = useCallback(async (reset = false, searchTerm = '') => {
      if (!viewingDeckId || isLoading) return;

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error('No authenticated user found');
        return;
      }

      setIsLoading(true);

      try {
        const pageToLoad = reset ? 0 : currentPage;
        const from = pageToLoad * CARDS_PER_PAGE;
        const to = from + CARDS_PER_PAGE - 1;

        let query = supabase
          .from('flashcards')
          .select('*')
          .eq('deck_id', viewingDeckId)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .range(from, to);

        if (searchTerm) {
          query = query.or(`front.ilike.%${searchTerm}%,verse.ilike.%${searchTerm}%,sentence.ilike.%${searchTerm}%`);
        }

        const { data: cards, error } = await query;

        if (error) {
          console.error('Error loading cards:', error);
          return;
        }

        if (!cards || cards.length < CARDS_PER_PAGE) {
          setHasMoreCards(false);
        }

        setModalCards(prev => reset ? cards || [] : [...prev, ...(cards || [])]);
        setCurrentPage(prev => reset ? 1 : prev + 1);
      } finally {
        setIsLoading(false);
      }
    }, [viewingDeckId, currentPage, isLoading]);

    // Effect to load cards when modal opens
    useEffect(() => {
      if (viewingDeckId) {
        setModalCards([]);
        setCurrentPage(0);
        setHasMoreCards(true);
        setLocalSearchQuery('');
        loadModalCards(true);
      }
    }, [viewingDeckId]);

    // Debounce for search
    const debouncedSearch = useMemo(
      () => debounce((query: string) => {
        setCurrentPage(0);
        setModalCards([]);
        setHasMoreCards(true);
        loadModalCards(true, query);
      }, 300),
      [loadModalCards]
    );

    const handleSearch = useCallback((query: string) => {
      setLocalSearchQuery(query);
      debouncedSearch(query);
    }, [debouncedSearch]);

    const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
      if (!hasMoreCards || isLoading) return;
      
      const element = e.currentTarget;
      const { scrollTop, scrollHeight, clientHeight } = element;
      
      if (scrollHeight - scrollTop <= clientHeight * 1.5) {
        loadModalCards(false, localSearchQuery);
      }
    }, [hasMoreCards, isLoading, loadModalCards, localSearchQuery]);

    const handleCloseModal = useCallback(() => {
      setShowCardsModal(false);
      setViewingDeckId(null);
      setEditingCard(null);
      setModalCards([]);
      setCurrentPage(0);
      setHasMoreCards(true);
      setLocalSearchQuery('');
      setIsLoading(false);
    }, []);

    const handleCardAdded = useCallback(() => {
      loadModalCards(true);
      setIsAddingCard(false);
    }, [loadModalCards]);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">
              {deck?.name}
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsAddingCard(true)}
                className="px-3 py-1.5 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Add Card
              </button>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>

          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <input
                type="text"
                value={localSearchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search cards..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring focus:ring-blue-200"
              />
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            </div>
          </div>

          <div className="flex flex-col h-[calc(90vh-13rem)]">
            {isAddingCard ? (
              <div className="p-4 border-b">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Add New Card</h3>
                  <button
                    onClick={() => setIsAddingCard(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <CardForm deckId={viewingDeckId!} onCardAdded={handleCardAdded} />
              </div>
            ) : null}

            <div className="flex-1 overflow-y-auto p-4" onScroll={handleScroll}>
              {modalCards.length > 0 ? (
                <div className="space-y-4">
                  {modalCards.map((card) => (
                    <div key={card.id} className="border rounded-lg p-4">
                      {editingCard?.id === card.id ? (
                        <CardForm
                          deckId={viewingDeckId!}
                          initialData={card}
                          onCardAdded={() => handleUpdateCard(card.id, editingCard)}
                          onCancel={() => setEditingCard(null)}
                        />
                      ) : (
                        <>
                          <div className="flex justify-between items-start mb-2">
                            <p className="font-medium text-gray-900">{card.front}</p>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setEditingCard(card)}
                                className="p-1.5 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteCard(card.id)}
                                className="p-1.5 text-gray-500 hover:text-red-600 rounded-full hover:bg-gray-100"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          <p className="text-gray-600">{card.verse}</p>
                          <p className="text-gray-500 mt-2 text-sm">{card.sentence}</p>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">
                    {localSearchQuery ? 'No cards found matching your search.' : 'No cards in this deck yet.'}
                  </p>
                  {!localSearchQuery && (
                    <button
                      onClick={() => setIsAddingCard(true)}
                      className="inline-flex items-center gap-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                    >
                      <Plus className="w-4 h-4" />
                      Add Your First Card
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Decks listing screen
  if (!selectedDeck) {
    return (
      <div className="max-w-md mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Your Decks</h1>
          <button
            onClick={() => setIsCreating(true)}
            className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {isCreating && (
          <div className="mb-6 bg-white rounded-lg shadow-sm p-4">
            <form onSubmit={handleCreateDeck}>
              <input
                type="text"
                value={deckName}
                onChange={(e) => setDeckName(e.target.value)}
                placeholder="Enter deck name"
                className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring focus:ring-blue-200 mb-3"
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreating(false);
                    setDeckName('');
                  }}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="space-y-3">
          {decks.map((deck) => (
            <div
              key={deck.id}
              className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm"
            >
              {editingDeckId === deck.id ? (
                <input
                  type="text"
                  defaultValue={deck.name}
                  onBlur={(e) => handleUpdateDeck(deck.id, e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleUpdateDeck(deck.id, e.currentTarget.value);
                    }
                  }}
                  className="flex-1 rounded-md border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring focus:ring-blue-200"
                  autoFocus
                />
              ) : (
                <span className="text-lg font-medium text-gray-900">{deck.name}</span>
              )}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditingDeckId(deck.id)}
                  className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
                >
                  <Pencil className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDeleteDeck(deck.id)}
                  className="p-2 text-gray-500 hover:text-red-600 rounded-full hover:bg-gray-100"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => {
                    setViewingDeckId(deck.id);
                    setShowCardsModal(true);
                  }}
                  className="p-2 text-gray-500 hover:text-blue-600 rounded-full hover:bg-gray-100"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {decks.length === 0 && !isCreating && (
          <div className="text-center py-8">
            <p className="text-gray-500">No decks yet. Create your first deck to get started!</p>
          </div>
        )}

        {showCardsModal && <CardsModal />}
      </div>
    );
  }

  // Selected deck screen (adding cards)
  return (
    <div className="max-w-md mx-auto px-4 py-6">
      <div className="mb-6">
        <button
          onClick={() => {
            setSelectedDeck(null);
            setEditingDeckId(null);
          }}
          className="inline-flex items-center text-blue-500 hover:text-blue-600 font-medium"
        >
          <ArrowLeft className="w-5 h-5 mr-1" />
          Back to Decks
        </button>
      </div>

      <div className="mb-6">
        {editingDeckId === selectedDeck.id ? (
          <div className="bg-white rounded-lg shadow-sm p-4">
            <input
              type="text"
              defaultValue={selectedDeck.name}
              onBlur={(e) => handleUpdateDeck(selectedDeck.id, e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleUpdateDeck(selectedDeck.id, e.currentTarget.value);
                }
              }}
              className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring focus:ring-blue-200"
              autoFocus
            />
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">{selectedDeck.name}</h1>
            <button
              onClick={() => setEditingDeckId(selectedDeck.id)}
              className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
            >
              <Pencil className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Add New Card</h2>
        <CardForm deckId={selectedDeck.id} />
      </div>
    </div>
  );
};