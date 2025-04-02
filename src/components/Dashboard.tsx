import React, { useState, useEffect } from 'react';
import { Brain, Calendar, GraduationCap, Library, Loader2, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { DashboardAvatar } from './DashboardAvatar';

interface Stats {
  totalCards: number;
  memorizedCards: number;
  remainingCards: number;
  streak: number;
}

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<Stats>({
    totalCards: 0,
    memorizedCards: 0,
    remainingCards: 0,
    streak: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('No authenticated user found');
      setIsLoading(false);
      return;
    }

    // Get all cards for the user
    const { data: cards, error } = await supabase
      .from('flashcards')
      .select('*')
      .eq('user_id', user.id);

    if (error) {
      console.error('Error loading cards:', error);
      setIsLoading(false);
      return;
    }

    // Calculate stats
    const totalCards = cards.length;
    const memorizedCards = cards.filter(card => card.confidence >= 4).length;
    const remainingCards = totalCards - memorizedCards;

    // Calculate streak
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const { data: reviews, error: reviewsError } = await supabase
      .from('flashcards')
      .select('last_reviewed')
      .eq('user_id', user.id)
      .not('last_reviewed', 'is', null)
      .order('last_reviewed', { ascending: false });

    if (reviewsError) {
      console.error('Error loading reviews:', reviewsError);
      setIsLoading(false);
      return;
    }

    let streak = 0;
    if (reviews && reviews.length > 0) {
      // Get unique dates of reviews
      const uniqueDates = [...new Set(reviews.map(review => {
        const date = new Date(review.last_reviewed);
        date.setHours(0, 0, 0, 0);
        return date.getTime();
      }))].sort((a, b) => b - a); // Sort in descending order

      const lastReviewDate = new Date(uniqueDates[0]);
      const daysSinceLastReview = Math.floor((today.getTime() - lastReviewDate.getTime()) / (24 * 60 * 60 * 1000));

      // Streak is only active if last review was today or yesterday
      if (daysSinceLastReview <= 1) {
        streak = 1; // Count today/yesterday as first day

        // Check previous days
        for (let i = 1; i < uniqueDates.length; i++) {
          const currentDate = new Date(uniqueDates[i]);
          const previousDate = new Date(uniqueDates[i - 1]);
          const daysBetween = Math.floor((previousDate.getTime() - currentDate.getTime()) / (24 * 60 * 60 * 1000));

          // If there's more than 1 day gap, break the streak
          if (daysBetween > 1) {
            break;
          }
          
          streak++;
        }
      }
    }

    setStats({
      totalCards,
      memorizedCards,
      remainingCards,
      streak
    });
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back!</h1>
          <p className="text-gray-600">Here's your learning progress overview</p>
        </div>
        
        <div className="mb-8">
          <DashboardAvatar
            totalCards={stats.totalCards}
            memorizedCards={stats.memorizedCards}
            streak={stats.streak}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6 transform transition-all duration-200 hover:scale-105 hover:shadow-md">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Library className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Cards</h3>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalCards}</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-sm text-gray-600">Your vocabulary collection</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 transform transition-all duration-200 hover:scale-105 hover:shadow-md">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Brain className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Memorized</h3>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.memorizedCards}</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-sm text-gray-600">Words you've mastered</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 transform transition-all duration-200 hover:scale-105 hover:shadow-md">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <GraduationCap className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">To Learn</h3>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.remainingCards}</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-sm text-gray-600">Words to practice</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 transform transition-all duration-200 hover:scale-105 hover:shadow-md">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Study Streak</h3>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.streak} days</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-sm text-gray-600">Keep the momentum going!</p>
            </div>
          </div>
        </div>

        {stats.streak >= 3 && (
          <div className="mt-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center gap-4">
              <Sparkles className="w-8 h-8" />
              <div>
                <h3 className="text-xl font-bold">Amazing Streak!</h3>
                <p className="text-blue-100">You're on fire! Keep up the great work with your daily practice.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};