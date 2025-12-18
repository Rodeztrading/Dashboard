import { useState, useEffect } from 'react';
import { User, signInWithPopup, signInWithRedirect, signOut, onAuthStateChanged, getRedirectResult } from 'firebase/auth';
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
        let isMounted = true;

        // handleRedirectResult can be slow, especially on mobile
        const handleRedirect = async () => {
            try {
                const result = await getRedirectResult(auth);
                if (isMounted && result?.user) {
                    setAuthState(prev => ({
                        ...prev,
                        user: result.user,
                        loading: false,
                        error: null
                    }));
                }
            } catch (error: any) {
                console.error('Error handling redirect result:', error);
                if (isMounted) {
                    setAuthState(prev => ({
                        ...prev,
                        loading: false,
                        error: error.message || 'Error al completar el inicio de sesión'
                    }));
                }
            }
        };

        handleRedirect();

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (isMounted) {
                setAuthState(prev => ({
                    ...prev,
                    user,
                    loading: false,
                    error: null,
                }));
            }
        });

        return () => {
            isMounted = false;
            unsubscribe();
        };
    }, []);

    const loginWithGoogle = async () => {
        try {
            setAuthState(prev => ({ ...prev, loading: true, error: null }));

            // Simple mobile detection
            const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

            if (isMobile) {
                // For mobile, redirect is usually more reliable than popup
                await signInWithRedirect(auth, googleProvider);
            } else {
                await signInWithPopup(auth, googleProvider);
            }
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
