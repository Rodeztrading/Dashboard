import { useState, useEffect } from 'react';
import {
    User,
    signInWithPopup,
    signInWithRedirect,
    signOut,
    onAuthStateChanged,
    getRedirectResult,
    setPersistence,
    browserLocalPersistence
} from 'firebase/auth';
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
        let redirectChecked = false;
        let authResolved = false;
        let authUser: User | null = null;

        const updateState = () => {
            if (isMounted && redirectChecked && authResolved) {
                setAuthState({
                    user: authUser,
                    loading: false,
                    error: null
                });
            }
        };

        // Force local persistence
        setPersistence(auth, browserLocalPersistence).catch(console.error);

        // 1. Check redirect result
        getRedirectResult(auth)
            .then((result) => {
                if (result?.user) authUser = result.user;
                redirectChecked = true;
                updateState();
            })
            .catch((error) => {
                console.error('Redirect error:', error);
                redirectChecked = true;
                updateState();
            });

        // 2. Listen for auth changes
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) authUser = user;
            authResolved = true;
            updateState();
        });

        // Safety timeout
        const timeout = setTimeout(() => {
            if (isMounted && (!redirectChecked || !authResolved)) {
                redirectChecked = true;
                authResolved = true;
                updateState();
            }
        }, 3000);

        return () => {
            isMounted = false;
            unsubscribe();
            clearTimeout(timeout);
        };
    }, []);

    const loginWithGoogle = async () => {
        try {
            setAuthState(prev => ({ ...prev, loading: true, error: null }));

            const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

            if (isMobile) {
                // Mobile devices strictly use redirect for better reliability
                await signInWithRedirect(auth, googleProvider);
            } else {
                try {
                    await signInWithPopup(auth, googleProvider);
                } catch (popupError: any) {
                    if (popupError.code === 'auth/popup-blocked') {
                        await signInWithRedirect(auth, googleProvider);
                    } else {
                        throw popupError;
                    }
                }
            }
        } catch (error: any) {
            console.error('Detailed login error:', error);
            setAuthState(prev => ({
                ...prev,
                loading: false,
                error: error.message || 'No se pudo iniciar sesión. Por favor intenta de nuevo.'
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
