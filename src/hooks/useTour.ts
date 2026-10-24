import { useState, useEffect } from 'react';

interface TourState {
  [key: string]: boolean;
}

export const useTour = (tourKey: string) => {
  const [open, setOpen] = useState(false);
  const STORAGE_KEY = 'tanaka_tours_completed';

  useEffect(() => {
    // Check if tour has been completed
    const completedTours = getCompletedTours();
    if (!completedTours[tourKey]) {
      // Show tour after a short delay for better UX
      const timer = setTimeout(() => {
        setOpen(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [tourKey]);

  const getCompletedTours = (): TourState => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  };

  const markTourCompleted = () => {
    const completedTours = getCompletedTours();
    completedTours[tourKey] = true;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(completedTours));
    setOpen(false);
  };

  const resetTour = () => {
    const completedTours = getCompletedTours();
    delete completedTours[tourKey];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(completedTours));
    setOpen(true);
  };

  const resetAllTours = () => {
    localStorage.removeItem(STORAGE_KEY);
  };

  return {
    open,
    setOpen,
    markTourCompleted,
    resetTour,
    resetAllTours,
  };
};
