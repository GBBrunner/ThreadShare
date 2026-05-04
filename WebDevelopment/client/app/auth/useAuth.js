'use client'
import { useContext } from 'react';
import { AuthContext } from './AuthContext';

export function useAuth() {
    const { signed_in_user, signIn, signOut } = useContext(AuthContext);
    return { signed_in_user, signIn, signOut };
}