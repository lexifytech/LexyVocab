import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../types/supabase';

type Card = Database['public']['Tables']['flashcards']['Row'];

interface CardFormProps {
  deckId: string;
  onCardAdded?: () => void;
  onCancel?: () => void;
  initialData?: Card;
}

export const CardForm: React.FC<CardFormProps> = ({ 
  deckId, 
  onCardAdded, 
  onCancel,
  initialData 
}) => {
  const [formData, setFormData] = useState({
    front: '',
    verse: '',
    sentence: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        front: initialData.front,
        verse: initialData.verse,
        sentence: initialData.sentence,
      });
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('No authenticated user found');
      return;
    }

    if (initialData) {
      const { error } = await supabase
        .from('flashcards')
        .update({
          ...formData,
          user_id: user.id,
        })
        .eq('id', initialData.id);

      if (error) {
        console.error('Error updating flashcard:', error);
        return;
      }
    } else {
      const { error } = await supabase
        .from('flashcards')
        .insert([{
          ...formData,
          deck_id: deckId,
          user_id: user.id,
        }]);

      if (error) {
        console.error('Error creating flashcard:', error);
        return;
      }
    }

    setFormData({ front: '', verse: '', sentence: '' });
    onCardAdded?.();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Word/Expression
        </label>
        <input
          type="text"
          value={formData.front}
          onChange={e => setFormData(prev => ({ ...prev, front: e.target.value }))}
          className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring focus:ring-blue-200"
          placeholder="Enter a word or expression"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Translation/Hint
        </label>
        <input
          type="text"
          value={formData.verse}
          onChange={e => setFormData(prev => ({ ...prev, verse: e.target.value }))}
          className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring focus:ring-blue-200"
          placeholder="Enter the translation or a hint"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Example Sentence
        </label>
        <input
          type="text"
          value={formData.sentence}
          onChange={e => setFormData(prev => ({ ...prev, sentence: e.target.value }))}
          className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring focus:ring-blue-200"
          placeholder="Enter an example sentence"
          required
        />
      </div>

      <div className="flex justify-end gap-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {initialData ? 'Save Changes' : 'Add Card'}
        </button>
      </div>
    </form>
  );
};