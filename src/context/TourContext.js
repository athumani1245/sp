import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

const TourContext = createContext(null);

export const TourProvider = ({ children }) => {
    const [activeTour, setActiveTour] = useState(null);
    const [tourCompleted, setTourCompleted] = useState(() => {
        const saved = localStorage.getItem('tour_completed');
        return saved ? JSON.parse(saved) : {
            dashboard: false,
            addProperty: false,
            addUnit: false,
            addTenant: false,
            addLease: false,
            addPayment: false,
            propertyDetails: false
        };
    });

    const startTour = useCallback((tourName) => {
        setActiveTour(tourName);
    }, []);

    const completeTour = useCallback((tourName) => {
        const newState = {
            ...tourCompleted,
            [tourName]: true
        };
        setTourCompleted(newState);
        localStorage.setItem('tour_completed', JSON.stringify(newState));
        setActiveTour(null);
    }, [tourCompleted]);

    const resetTour = useCallback((tourName) => {
        const newState = {
            ...tourCompleted,
            [tourName]: false
        };
        setTourCompleted(newState);
        localStorage.setItem('tour_completed', JSON.stringify(newState));
    }, [tourCompleted]);

    const resetAllTours = useCallback(() => {
        const resetState = {
            dashboard: false,
            addProperty: false,
            addUnit: false,
            addTenant: false,
            addLease: false,
            addPayment: false,
            propertyDetails: false
        };
        setTourCompleted(resetState);
        localStorage.setItem('tour_completed', JSON.stringify(resetState));
    }, []);

    const value = useMemo(() => ({
        activeTour,
        tourCompleted,
        startTour,
        completeTour,
        resetTour,
        resetAllTours
    }), [activeTour, tourCompleted, startTour, completeTour, resetTour, resetAllTours]);

    return (
        <TourContext.Provider value={value}>
            {children}
        </TourContext.Provider>
    );
};

export const useTour = () => {
    const context = useContext(TourContext);
    if (!context) {
        throw new Error('useTour must be used within a TourProvider');
    }
    return context;
};
