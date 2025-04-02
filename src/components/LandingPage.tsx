import React from 'react';
import { BookOpen, Library, Sparkles } from 'lucide-react';
import { Navbar } from './Navbar';

interface LandingPageProps {
  onLoginClick: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLoginClick }) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Navbar onLoginClick={onLoginClick} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="pt-16 pb-20">
          <div className="text-center">
            <p className="text-xl sm:text-2xl text-gray-600 max-w-3xl mx-auto">
              Master vocabulary effortlessly with our intelligent flashcard system
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-3">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white mx-auto">
                <BookOpen className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900 text-center">
                Smart Learning
              </h3>
              <p className="mt-2 text-gray-600 text-center">
                Adaptive spaced repetition helps you learn faster and remember longer
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white mx-auto">
                <Library className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900 text-center">
                Organized Decks
              </h3>
              <p className="mt-2 text-gray-600 text-center">
                Create multiple decks to organize your vocabulary by topic or level
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white mx-auto">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900 text-center">
                Progress Tracking
              </h3>
              <p className="mt-2 text-gray-600 text-center">
                Monitor your learning progress and stay motivated
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};