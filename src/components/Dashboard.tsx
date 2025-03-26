import React from 'react';
import { Brain, Calendar, GraduationCap, Library } from 'lucide-react';
import { useStore } from '../store/useStore';

export const Dashboard: React.FC = () => {
  const stats = useStore(state => state.stats);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center gap-3">
          <Library className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500" />
          <div>
            <h3 className="text-sm sm:text-lg font-semibold">Total Cards</h3>
            <p className="text-xl sm:text-2xl font-bold">{stats.totalCards}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center gap-3">
          <Brain className="w-6 h-6 sm:w-8 sm:h-8 text-green-500" />
          <div>
            <h3 className="text-sm sm:text-lg font-semibold">Memorized</h3>
            <p className="text-xl sm:text-2xl font-bold">{stats.memorizedCards}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center gap-3">
          <GraduationCap className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-500" />
          <div>
            <h3 className="text-sm sm:text-lg font-semibold">To Learn</h3>
            <p className="text-xl sm:text-2xl font-bold">{stats.remainingCards}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center gap-3">
          <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-purple-500" />
          <div>
            <h3 className="text-sm sm:text-lg font-semibold">Study Streak</h3>
            <p className="text-xl sm:text-2xl font-bold">{stats.streak} days</p>
          </div>
        </div>
      </div>
    </div>
  );
};