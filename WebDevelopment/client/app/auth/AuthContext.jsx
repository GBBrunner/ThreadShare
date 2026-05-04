'use client'
import React, { createContext, useState, useEffect, use } from 'react';

export const AuthContext = createContext({
    signed_in_user: null,
    signIn: () => {},
    signOut: () => {}
});

export function AuthProvider({ children }) {
    const [signed_in_user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        try {
            const raw = localStorage.getItem("signed_in_user");
            if (raw) setUser(JSON.parse(raw));
        } catch (err) {
            console.error('Failed to parse signed_in_user from localStorage:', err);
        }
        setLoading(false);
    }, []);

    const signIn = (user, token) => {
        setUser(user);
        try {
            localStorage.setItem("signed_in_user", JSON.stringify(user));
            if (token) localStorage.setItem("auth_token", token);
        } catch (err) {
            console.error('Failed to save signed_in_user from localStorage:', err);
        }
    };

    const signOut = () => {
        setUser(null);
        try {
            localStorage.removeItem("signed_in_user");
            localStorage.removeItem("auth_token");
        } catch (err) {
            console.error('Failed to remove signed_in_user from localStorage:', err);
        }
    };

    if (loading) {
        return <div style={{textAlign: 'center', marginTop: '2rem'}}>Loading...</div>;
    }

    return (
        <AuthContext.Provider value={{ signed_in_user, signIn, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}