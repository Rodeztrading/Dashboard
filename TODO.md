# TODO: Integrate Firebase Authentication and Theme System

## Completed Steps
- [x] Set up Firebase Auth in services/firebase.ts: Import Firebase config, initialize app, export auth.
- [x] Update components/LoginScreen.tsx: Change form to email/password, integrate Firebase signInWithEmailAndPassword, handle errors.
- [x] Update App.tsx: Replace sessionStorage with Firebase onAuthStateChanged for user state, update handleLogout to use signOut.
- [x] Test the login functionality by running the app and attempting to log in with email/password.
- [x] Ensure Firebase Authentication is enabled in the Firebase console (email/password provider).
- [x] Add user profile section in Settings for display name update.
- [x] Implement theme system with 3 styles: Futurista, Casual, Trading Pro.
- [x] Add theme selector in Settings.
- [x] Apply theme changes to CSS variables and component styling.
- [x] Update Sidebar and DashboardHeader to support theme changes.

## Notes
- This replaces the current username-only login with Firebase Auth.
- User data (trades, plans) will still be stored locally per user, but authentication is now via Firebase.
- Theme system allows switching between futuristic (default), casual (light), and trading pro (dark with green/red accents) styles.
- Theme preference is saved in localStorage and applied on app load.
