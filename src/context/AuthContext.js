import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const [subscription, setSubscription] = useState(null);
    const [hasActiveSubscription, setHasActiveSubscription] = useState(false);

    // Function to refresh token with the API
    const refreshToken = useCallback(async (refresh) => {
        try {
            const API_BASE = process.env.REACT_APP_API_BASE;
            const response = await axios.post(
                `${API_BASE}/token/refresh/`,
                { refresh }
            );
            
            // If successful, update the access token and refresh token
            if (response.data && response.data.access) {
                localStorage.setItem('token', response.data.access);
                
                // If a new refresh token is provided, update it as well
                if (response.data.refresh) {
                    localStorage.setItem('refresh', response.data.refresh);
                }
                
                return { success: true, token: response.data.access };
            }
            
            return { success: false };
        } catch (error) {
            // Token refresh failed
            console.error('Token refresh failed:', error);
            return { success: false };
        }
    }, []);

    useEffect(() => {
        // Check for token on initial load
        const checkAuthentication = async () => {
            const token = localStorage.getItem('token');
            const refresh = localStorage.getItem('refresh');
            const subscriptionData = localStorage.getItem('subscription');

            if (token && refresh) {
                // Token exists, assume it's valid and set authenticated
                // The api interceptor will handle refresh if it's expired
                setIsAuthenticated(true);
                
                // Load subscription data
                if (subscriptionData) {
                    try {
                        const parsedSubscription = JSON.parse(subscriptionData);
                        setSubscription(parsedSubscription);
                        setHasActiveSubscription(parsedSubscription.status === 'active' && parsedSubscription.is_active === true);
                    } catch (error) {
                        console.error('Failed to parse subscription data:', error);
                        setSubscription(null);
                        setHasActiveSubscription(false);
                    }
                }
            } else {
                setIsAuthenticated(false);
                setSubscription(null);
                setHasActiveSubscription(false);
            }
            
            setLoading(false);
        };

        checkAuthentication();
    }, []);

    const login = async (token, userData) => {
        localStorage.setItem('token', token);
        
        // Store subscription data if provided
        if (userData && userData.subscription) {
            localStorage.setItem('subscription', JSON.stringify(userData.subscription));
            setSubscription(userData.subscription);
            setHasActiveSubscription(userData.subscription.status === 'active' && userData.subscription.is_active === true);
        }
        
        // Set authenticated immediately on login
        setIsAuthenticated(true);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('refresh');
        localStorage.removeItem('subscription');
        setIsAuthenticated(false);
        setSubscription(null);
        setHasActiveSubscription(false);
    };

    // Method to check if current token is still valid by refreshing it
    const checkTokenValidity = async () => {
        const token = localStorage.getItem('token');
        const refresh = localStorage.getItem('refresh');
        
        if (!token || !refresh) {
            setIsAuthenticated(false);
            return false;
        }

        const result = await refreshToken(refresh);
        
        if (!result.success) {
            logout();
            return false;
        }

        return true;
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <AuthContext.Provider value={{ 
            isAuthenticated, 
            login, 
            logout, 
            checkTokenValidity,
            loading,
            subscription,
            hasActiveSubscription
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
