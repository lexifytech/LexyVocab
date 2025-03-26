export interface Flashcard {
  id: string;
  front: string;
  verse: string;
  sentence: string;
  createdAt: number;
  lastReviewed: number | null;
  nextReview: number | null;
  reviewCount: number;
  confidence: number; // 0-1 scale
}

export interface StudyStats {
  totalCards: number;
  memorizedCards: number;
  remainingCards: number;
  streak: number;
  lastStudyDate: number | null;
}