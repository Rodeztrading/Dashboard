# TODO: Prevent Empty Saves to Firestore on Logout

## Information Gathered
- App.tsx contains useEffect hooks that save trades and tradingPlan to Firestore on every change, including when state is cleared on logout.
- handleLogout already saves data before sign out.
- handleSaveAndClose and handleTradingPlanChange update state but don't save to Firestore immediately.

## Plan
- Modify useEffect for trades: Comment out Firestore save, keep localStorage.
- Modify useEffect for tradingPlan: Comment out Firestore save, keep localStorage.
- Update handleSaveAndClose: Make async, add Firestore save after setTrades.
- Update handleTradingPlanChange: Make async, add Firestore save after setTradingPlan.

## Dependent Files to be Edited
- App.tsx

## Followup Steps
- Test login/logout to ensure no empty saves.
- Test adding trades and changing plan to ensure saves work.
- Verify data loads correctly on login.

## Completed Tasks
- [x] Modified useEffect for trades: Removed Firestore save, kept localStorage.
- [x] Modified useEffect for tradingPlan: Removed Firestore save, kept localStorage.
- [x] Updated handleSaveAndClose: Made async, added Firestore save after setTrades.
- [x] Updated handleTradingPlanChange: Made async, added Firestore save after setTradingPlan.
