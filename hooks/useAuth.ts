import { useState, useEffect } from 'react';
import { User, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';

interface AuthState {
    user: User | null;
    loading: boolean;
    error: string | null;
}

export const useAuth = () => {
    const [authState, setAuthState] = useState<AuthState>({
        user: null,
        loading: true,
        error: null,
    });

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setAuthState({
                user,
                loading: false,
                error: null,
            });
        });

        return () => unsubscribe();
    }, []);

    const loginWithGoogle = async () => {
        try {
            setAuthState(prev => ({ ...prev, loading: true, error: null }));
            await signInWithPopup(auth, googleProvider);
        } catch (error: any) {
            console.error('Error signing in with Google:', error);
            setAuthState(prev => ({
                ...prev,
                loading: false,
                error: error.message || 'Error al iniciar sesión',
            }));
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
        } catch (error: any) {
            console.error('Error signing out:', error);
            setAuthState(prev => ({
                ...prev,
                error: error.message || 'Error al cerrar sesión',
            }));
        }
    };

    return {
        user: authState.user,
        loading: authState.loading,
        error: authState.error,
        loginWithGoogle,
        logout,
    };
};
