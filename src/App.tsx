import React, { useEffect, useState } from 'react';
import { Brain, BookOpen, Library, LayoutDashboard, LogOut } from 'lucide-react';
import { Session } from '@supabase/supabase-js';
import { supabase } from './lib/supabase';
import { Dashboard } from './components/Dashboard';
import { StudyView } from './components/StudyView';
import { DecksView } from './components/DecksView';
import { LandingPage } from './components/LandingPage';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { Navbar } from './components/Navbar';

type View = 'dashboard' | 'study' | 'decks';

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [view, setView] = useState<View>('dashboard');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleHomeClick = () => {
    setShowLogin(false);
  };

  const handleLoginClick = () => {
    setShowLogin(true);
  };

  if (session) {
    return (
      <div className="min-h-screen bg-gray-100">
        <header className="bg-white shadow fixed top-0 left-0 right-0 z-10">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Brain className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500" />
                <h1 className="ml-2 text-xl sm:text-2xl font-bold text-gray-900">LexyVocab</h1>
              </div>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="sm:hidden p-2"
              >
                <div className="w-6 h-0.5 bg-gray-600 mb-1"></div>
                <div className="w-6 h-0.5 bg-gray-600 mb-1"></div>
                <div className="w-6 h-0.5 bg-gray-600"></div>
              </button>
              <nav className="hidden sm:flex space-x-4">
                {renderNavButtons()}
              </nav>
            </div>
            {isMenuOpen && (
              <nav className="sm:hidden py-2 space-y-1">
                {renderNavButtons()}
              </nav>
            )}
          </div>
        </header>

        <main className="max-w-7xl mx-auto pt-16 sm:pt-20 px-4 sm:px-6 lg:px-8 pb-6">
          {view === 'dashboard' && <Dashboard />}
          {view === 'study' && <StudyView />}
          {view === 'decks' && <DecksView />}
        </main>
      </div>
    );
  }

  if (showLogin) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <Navbar 
          showLoginButton={false} 
          onHomeClick={handleHomeClick}
        />
        <div className="flex items-center justify-center flex-1 h-[calc(100vh-4rem)] p-4">
          <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
              <p className="mt-2 text-gray-600">Sign in to continue to LexyVocab</p>
            </div>
            <Auth
              supabaseClient={supabase}
              appearance={{ theme: ThemeSupa }}
              providers={['google']}
              theme="default"
            />
          </div>
        </div>
      </div>
    );
  }

  return <LandingPage onLoginClick={handleLoginClick} />;

  function renderNavButtons() {
    return (
      <>
        <button
          onClick={() => {
            setView('dashboard');
            setIsMenuOpen(false);
          }}
          className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium w-full sm:w-auto ${
            view === 'dashboard'
              ? 'bg-blue-100 text-blue-700'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          Dashboard
        </button>
        <button
          onClick={() => {
            setView('study');
            setIsMenuOpen(false);
          }}
          className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium w-full sm:w-auto ${
            view === 'study'
              ? 'bg-blue-100 text-blue-700'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Study
        </button>
        <button
          onClick={() => {
            setView('decks');
            setIsMenuOpen(false);
          }}
          className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium w-full sm:w-auto ${
            view === 'decks'
              ? 'bg-blue-100 text-blue-700'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Library className="w-4 h-4" />
          Decks
        </button>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium w-full sm:w-auto text-gray-500 hover:text-gray-700"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </>
    );
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };
}

export default App;