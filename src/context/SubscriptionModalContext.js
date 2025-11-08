import React, { createContext, useContext, useState, useCallback } from 'react';

const SubscriptionModalContext = createContext(null);

export const SubscriptionModalProvider = ({ children }) => {
    const [openSubscriptionModal, setOpenSubscriptionModal] = useState(null);

    const registerModalOpener = useCallback((opener) => {
        setOpenSubscriptionModal(() => opener);
    }, []);

    const triggerSubscriptionModal = useCallback(() => {
        if (openSubscriptionModal) {
            openSubscriptionModal();
        }
    }, [openSubscriptionModal]);

    return (
        <SubscriptionModalContext.Provider value={{ registerModalOpener, triggerSubscriptionModal }}>
            {children}
        </SubscriptionModalContext.Provider>
    );
};

export const useSubscriptionModal = () => {
    const context = useContext(SubscriptionModalContext);
    if (!context) {
        throw new Error('useSubscriptionModal must be used within a SubscriptionModalProvider');
    }
    return context;
};
