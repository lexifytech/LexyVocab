// Implements the SuperMemo 2 algorithm for spaced repetition
export const calculateNextReview = (confidence: number, reviewCount: number): number => {
  const now = Date.now();
  
  if (confidence < 0.6) {
    // If confidence is low, review again soon (within 24 hours)
    return now + 1000 * 60 * 60 * Math.max(1, 24 * confidence);
  }

  // Base interval starts at 1 day and increases with each successful review
  const baseInterval = Math.pow(2, reviewCount) * (24 * 60 * 60 * 1000);
  
  // Adjust interval based on confidence
  const interval = baseInterval * (0.5 + confidence);
  
  return now + interval;
};