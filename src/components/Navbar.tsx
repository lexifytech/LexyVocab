import React from 'react';
import { Brain } from 'lucide-react';

interface NavbarProps {
  showLoginButton?: boolean;
  onHomeClick?: () => void;
  onLoginClick?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  showLoginButton = true,
  onHomeClick,
  onLoginClick
}) => {
  const handleHomeClick = () => {
    if (onHomeClick) {
      onHomeClick();
    }
  };

  const handleLoginClick = () => {
    if (onLoginClick) {
      onLoginClick();
    }
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <button 
            onClick={handleHomeClick}
            className="flex items-center focus:outline-none hover:opacity-80"
          >
            <Brain className="h-8 w-8 text-blue-500" />
            <span className="ml-2 text-xl font-semibold text-gray-900">LexyVocab</span>
          </button>
          {showLoginButton && (
            <button
              onClick={handleLoginClick}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Login
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}; 