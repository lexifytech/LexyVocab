import React, { useState } from 'react';
import { useStore } from '../store/useStore';

export const CardForm: React.FC = () => {
  const addCard = useStore(state => state.addCard);
  const [formData, setFormData] = useState({
    front: '',
    verse: '',
    sentence: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addCard(formData);
    setFormData({ front: '', verse: '', sentence: '' });
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-4 sm:p-6">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Add New Flashcard</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Word/Expression</label>
            <input
              type="text"
              value={formData.front}
              onChange={e => setFormData(prev => ({ ...prev, front: e.target.value }))}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring focus:ring-blue-200"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Translation/Hint</label>
            <input
              type="text"
              value={formData.verse}
              onChange={e => setFormData(prev => ({ ...prev, verse: e.target.value }))}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring focus:ring-blue-200"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Example Sentence</label>
            <textarea
              value={formData.sentence}
              onChange={e => setFormData(prev => ({ ...prev, sentence: e.target.value }))}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring focus:ring-blue-200"
              rows={3}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            Add Card
          </button>
        </div>
      </form>
    </div>
  );
};