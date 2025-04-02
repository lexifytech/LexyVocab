import React, { useState, useEffect } from 'react';
import Avatar from 'boring-avatars';

interface DashboardAvatarProps {
  totalCards: number;
  memorizedCards: number;
  streak: number;
}

export const DashboardAvatar: React.FC<DashboardAvatarProps> = ({
  totalCards,
  memorizedCards,
  streak
}) => {
  const [currentMessage, setCurrentMessage] = useState('');
  const [mood, setMood] = useState<'happy' | 'neutral' | 'sad'>('neutral');
  const [isAnimating, setIsAnimating] = useState(false);

  // Colors based on mood with gradients
  const colors = {
    happy: ['#FFD700', '#FFA500', '#FF6347', '#FF69B4', '#9370DB'],
    neutral: ['#87CEEB', '#20B2AA', '#98FB98', '#DDA0DD', '#F0E68C'],
    sad: ['#B0C4DE', '#778899', '#A9A9A9', '#D3D3D3', '#F5F5F5']
  };

  // Possible messages based on dashboard state
  const messages = {
    noCards: [
      "Hi! How about adding some cards to start? 📚",
      "I'm here to help you learn! Let's create some cards? ✨",
      "The first step is adding cards to study! 🎯"
    ],
    lowActivity: [
      "Hey! It's been a while since you studied... 🤔",
      "How about practicing a bit today? 📖",
      "Your cards miss you! 💭"
    ],
    goodProgress: [
      "Wow! You're doing great! 🌟",
      "Keep it up, you're crushing it! 🎉",
      "Your progress is inspiring! 🚀"
    ],
    streak: [
      "Amazing! Your streak is growing! 🔥",
      "You never miss a study day! 💪",
      "Your dedication is admirable! ⭐"
    ]
  };

  useEffect(() => {
    // Determines avatar's mood based on statistics
    const newMood = totalCards === 0 
      ? 'neutral'
      : streak === 0 || memorizedCards === 0 
        ? 'sad'
        : memorizedCards / totalCards > 0.5 || streak > 2 
          ? 'happy'
          : 'neutral';

    if (newMood !== mood) {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 600);
      setMood(newMood);
    }
  }, [totalCards, memorizedCards, streak]);

  useEffect(() => {
    const updateMessage = () => {
      let possibleMessages;
      
      if (totalCards === 0) {
        possibleMessages = messages.noCards;
      } else if (streak === 0) {
        possibleMessages = messages.lowActivity;
      } else if (memorizedCards / totalCards > 0.5) {
        possibleMessages = messages.goodProgress;
      } else if (streak > 2) {
        possibleMessages = messages.streak;
      } else {
        possibleMessages = messages.lowActivity;
      }

      const newMessage = possibleMessages[Math.floor(Math.random() * possibleMessages.length)];
      setCurrentMessage(newMessage);
    };

    updateMessage();
    const interval = setInterval(updateMessage, 5000);

    return () => clearInterval(interval);
  }, [totalCards, memorizedCards, streak]);

  return (
    <div className="relative bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 opacity-50"></div>
      
      <div className="relative flex items-center gap-6 p-6">
        <div className={`relative transform transition-all duration-500 ${
          isAnimating ? 'scale-110' : 'scale-100'
        }`}>
          <div className="relative w-24 h-24 transition-transform duration-300 hover:scale-110">
            <Avatar
              size={96}
              name="lexy-vocab"
              variant="beam"
              colors={colors[mood]}
              square={false}
            />
            <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center 
              ${mood === 'happy' 
                ? 'bg-gradient-to-br from-green-400 to-green-600' 
                : mood === 'sad' 
                  ? 'bg-gradient-to-br from-red-400 to-red-600'
                  : 'bg-gradient-to-br from-yellow-400 to-yellow-600'
              } transform transition-all duration-300 hover:scale-110 shadow-lg`}>
              {mood === 'happy' ? '😊' : mood === 'sad' ? '😢' : '😐'}
            </div>
          </div>
        </div>

        <div className="flex-1">
          <div className="relative bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl shadow-md transform transition-all duration-300 hover:translate-y-[-2px] hover:shadow-lg">
            <div className="absolute -left-2 top-1/2 transform -translate-y-1/2 w-0 h-0 
                          border-t-8 border-t-transparent 
                          border-r-[16px] border-r-blue-50 
                          border-b-8 border-b-transparent">
            </div>
            <p className="text-gray-800 font-medium leading-relaxed">{currentMessage}</p>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3">
              <p className="text-sm text-purple-600 font-medium">Progress</p>
              <p className="text-lg font-bold text-purple-900">
                {totalCards > 0 
                  ? `${Math.round((memorizedCards / totalCards) * 100)}%`
                  : '0%'}
              </p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3">
              <p className="text-sm text-blue-600 font-medium">Streak</p>
              <p className="text-lg font-bold text-blue-900">{streak} days</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 