import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    // Function to verify token with the API
    const verifyToken = useCallback(async (token) => {
        try {
            const API_BASE = process.env.REACT_APP_API_BASE;
            const response = await axios.post(
                `${API_BASE}/token/verify/`,
                { token }
                
            );
            
            // If we get here, the token is valid
            return response.status === 200;
        } catch (error) {
            // Token is invalid or expired
            console.error('Token verification failed:', error);
            return false;
        }
    }, []);

    useEffect(() => {
        // Check for token on initial load and verify it
        const checkAuthentication = async () => {
            const token = localStorage.getItem('token');

            if (token) {
                // Verify the token with the API
                const isValid = await verifyToken(token);
                
                if (isValid) {
                    setIsAuthenticated(true);
                } else {
                    // Token is invalid, remove it and set authenticated to false
                    localStorage.removeItem('token');
                    localStorage.removeItem('refresh');
                    setIsAuthenticated(false);
                }
            } else {
                setIsAuthenticated(false);
            }
            
            setLoading(false);
        };

        checkAuthentication();
    }, [verifyToken]);

    const login = async (token, userData) => {
        localStorage.setItem('token', token);
        
        // Verify the token before setting authenticated
        const isValid = await verifyToken(token);
        
        if (isValid) {
            setIsAuthenticated(true);
        } else {
            // Token is invalid, remove it
            localStorage.removeItem('token');
            setIsAuthenticated(false);
            throw new Error('Invalid token provided');
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('refresh');
        setIsAuthenticated(false);
    };

    // Method to check if current token is still valid
    const checkTokenValidity = async () => {
        const token = localStorage.getItem('token');
        
        if (!token) {
            setIsAuthenticated(false);
            return false;
        }

        const isValid = await verifyToken(token);
        
        if (!isValid) {
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
            loading 
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
