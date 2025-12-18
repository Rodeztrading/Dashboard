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

        // Ensure persistence is set to Local
        setPersistence(auth, browserLocalPersistence).catch(err => {
            console.error('Persistence error:', err);
        });

        // Check for redirect result on mount
        const initAuth = async () => {
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
                console.error('Auth redirect error:', error);
                if (isMounted) {
                    setAuthState(prev => ({
                        ...prev,
                        error: `Error de autenticación: ${error.message}`,
                        loading: false
                    }));
                }
            }
        };

        initAuth();

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

            const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

            if (isMobile) {
                // For mobile, we explicitly use redirect as it's the standard for Firebase on small screens
                await signInWithRedirect(auth, googleProvider);
            } else {
                await signInWithPopup(auth, googleProvider);
            }
        } catch (error: any) {
            console.error('Login error:', error);
            if (error.code === 'auth/popup-blocked') {
                // Fallback to redirect if popup is blocked
                try {
                    await signInWithRedirect(auth, googleProvider);
                } catch (redirError: any) {
                    setAuthState(prev => ({ ...prev, loading: false, error: redirError.message }));
                }
            } else {
                setAuthState(prev => ({
                    ...prev,
                    loading: false,
                    error: error.message || 'Error al iniciar sesión',
                }));
            }
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
