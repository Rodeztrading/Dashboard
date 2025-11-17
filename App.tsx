
import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './services/firebase';
import { getUserData, saveUserData, updateUserTrades, updateUserTradingPlan, updateUserTheme } from './services/firestoreService';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Sniper from './components/Sniper';
import Settings from './components/Settings';
import TradeWorkflow from './components/TradeWorkflow';
import SessionReviewModal from './components/SessionReviewModal';
import DashboardHeader from './components/DashboardHeader';
import LoginScreen from './components/LoginScreen';
import type { VisualTrade } from './types';

const App: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [trades, setTrades] = useState<VisualTrade[]>([]);
  const [tradingPlan, setTradingPlan] = useState('');

  const [initialBalance, setInitialBalance] = useState<number | null>(null);
  const [currentBalance, setCurrentBalance] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [activeView, setActiveView] = useState('dashboard');
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);

  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const [theme, setTheme] = useState<string>(() => localStorage.getItem('visual-theme') || 'futuristic');
  
  // Listen to Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          // First try to load from Firestore
          const userData = await getUserData(firebaseUser.uid);
          if (userData) {
            setTrades(userData.trades || []);
            setTradingPlan(userData.tradingPlan || '');
            setTheme(userData.theme || 'futuristic');
          } else {
            // If no Firestore data, try localStorage for migration
            const savedTrades = localStorage.getItem(`visual-trades_${firebaseUser.uid}`);
            const savedPlan = localStorage.getItem(`visual-trading-plan_${firebaseUser.uid}`);
            const savedTheme = localStorage.getItem('visual-theme') || 'futuristic';

            const tradesData = savedTrades ? JSON.parse(savedTrades) : [];
            const planData = savedPlan || '';

            setTrades(tradesData);
            setTradingPlan(planData);
            setTheme(savedTheme);

            // Save to Firestore for future sync (only if data exists)
            if (tradesData.length > 0 || planData.trim() !== '') {
              try {
                await saveUserData(firebaseUser.uid, {
                  trades: tradesData,
                  tradingPlan: planData,
                  theme: savedTheme
                });
              } catch (saveError) {
                console.error("Error saving migrated data to Firestore:", saveError);
                // Continue without failing - data is still in localStorage
              }
            }
          }
        } catch (error) {
          console.error("Error loading user data:", error);
          // Fallback to localStorage only
          const savedTrades = localStorage.getItem(`visual-trades_${firebaseUser.uid}`);
          const savedPlan = localStorage.getItem(`visual-trading-plan_${firebaseUser.uid}`);
          const savedTheme = localStorage.getItem('visual-theme') || 'futuristic';

          const tradesData = savedTrades ? JSON.parse(savedTrades) : [];
          const planData = savedPlan || '';

          setTrades(tradesData);
          setTradingPlan(planData);
          setTheme(savedTheme);
        }
      } else {
        setTrades([]);
        setTradingPlan('');
        setTheme('futuristic');
      }
    });

    return () => unsubscribe();
  }, []);

  // Apply theme on mount
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Save trades to Firestore and localStorage whenever they change
  useEffect(() => {
    if (!user) return;

    // Always save to localStorage as backup
    localStorage.setItem(`visual-trades_${user.uid}`, JSON.stringify(trades));

    console.log("Saving trades to Firestore:", trades.length, "trades");
    updateUserTrades(user.uid, trades).then(() => {
      console.log("Trades saved successfully to Firestore");
    }).catch(error => {
      console.error("Error saving trades to Firestore:", error);
      // Don't fail - data is saved in localStorage
    });
  }, [trades, user]);

  // Save trading plan to Firestore and localStorage whenever it changes
  useEffect(() => {
    if (!user) return;

    // Always save to localStorage as backup
    localStorage.setItem(`visual-trading-plan_${user.uid}`, tradingPlan);

    console.log("Saving trading plan to Firestore:", tradingPlan.substring(0, 50) + "...");
    updateUserTradingPlan(user.uid, tradingPlan).then(() => {
      console.log("Trading plan saved successfully to Firestore");
    }).catch(error => {
      console.error("Error saving trading plan to Firestore:", error);
      // Don't fail - data is saved in localStorage
    });
  }, [tradingPlan, user]);


  const handleLogin = () => {
    // Firebase auth state will be handled by onAuthStateChanged
  };

  const handleLogout = async () => {
    if (window.confirm("¿Estás seguro de que quieres cerrar sesión?")) {
      console.log("Logging out, saving data before sign out...");
      try {
        // Ensure all data is saved to Firestore before signing out
        if (user) {
          await Promise.all([
            updateUserTrades(user.uid, trades),
            updateUserTradingPlan(user.uid, tradingPlan),
            updateUserTheme(user.uid, theme)
          ]);
          console.log("All user data saved successfully before logout");
        }
        await signOut(auth);
        // Reset session-specific state
        setInitialBalance(null);
        setCurrentBalance(null);
        setSessionStartTime(null);
        setActiveView('dashboard');
      } catch (error) {
        console.error("Error during logout:", error);
        // Even if Firestore save fails, still sign out but save to localStorage as backup
        try {
          localStorage.setItem(`visual-trades_${user.uid}`, JSON.stringify(trades));
          localStorage.setItem(`visual-trading-plan_${user.uid}`, tradingPlan);
          localStorage.setItem('visual-theme', theme);
          await signOut(auth);
          alert("Sesión cerrada. Datos guardados localmente como respaldo.");
        } catch (signOutError) {
          console.error("Error signing out:", signOutError);
          alert("Error al cerrar sesión. Inténtalo de nuevo.");
        }
      }
    }
  };

  const handleThemeChange = async (newTheme: string) => {
    setTheme(newTheme);
    // Apply theme to document
    document.documentElement.setAttribute('data-theme', newTheme);
    // Save theme to localStorage
    localStorage.setItem('visual-theme', newTheme);

    // Save theme to Firestore
    if (user) {
      try {
        await updateUserTheme(user.uid, newTheme);
      } catch (error) {
        console.error("Error saving theme to Firestore:", error);
        // Theme is still saved in localStorage
      }
    }
  };

  const handleTradingPlanChange = (notes: string) => {
    setTradingPlan(notes);
  };
  
  const isSessionActive = initialBalance !== null;

  const handleSetBalance = (balance: number) => {
    setInitialBalance(balance);
    setCurrentBalance(balance);
    setSessionStartTime(Date.now());
  };
  
  const handleSaveAndClose = (tradeData: Omit<VisualTrade, 'id' | 'createdAt'>) => {
    const newTrade: VisualTrade = {
      ...tradeData,
      id: `trade_${Date.now()}_${Math.random()}`,
      createdAt: Date.now(),
    };

    setTrades(prevTrades => [...prevTrades, newTrade]);

    if (currentBalance !== null) {
      const profitOrLoss = tradeData.outcome === 'WIN'
        ? tradeData.amountInvested * (tradeData.payout / 100)
        : -tradeData.amountInvested;
      setCurrentBalance(prevBalance => (prevBalance !== null ? prevBalance + profitOrLoss : null));
    }
    setIsTradeModalOpen(false);
  };


  const handleEndSession = () => {
    if (window.confirm('¿Confirmar fin de la sesión? Se reiniciará el capital.')) {
      handleCloseReviewAndReset();
    }
  };

  const handleCloseReviewAndReset = async () => {
    console.log("Ending session, saving final trades before reset...");
    try {
      // Ensure all trades are saved to Firestore before resetting
      if (user) {
        await updateUserTrades(user.uid, trades);
        console.log("Final trades saved successfully before session reset");
      }
      alert(`Sesión terminada. Saldo final: $${currentBalance?.toFixed(2)}`);
      setInitialBalance(null);
      setCurrentBalance(null);
      setSessionStartTime(null);
      setActiveView('dashboard');
    } catch (error) {
      console.error("Error saving trades before session reset:", error);
      // Even if Firestore fails, still reset session but save to localStorage
      localStorage.setItem(`visual-trades_${user.uid}`, JSON.stringify(trades));
      alert(`Sesión terminada. Saldo final: $${currentBalance?.toFixed(2)}. Datos guardados localmente.`);
      setInitialBalance(null);
      setCurrentBalance(null);
      setSessionStartTime(null);
      setActiveView('dashboard');
    }
  };

  const handleDateSelect = (date: Date | null) => {
    if (date && selectedDate && date.toDateString() === selectedDate.toDateString()) {
      setSelectedDate(null);
    } else {
      setSelectedDate(date);
    }
  };

  const handleExportData = () => {
    if (!user) return;
    const dataToExport = {
      trades,
      tradingPlan
    };
    const dataStr = JSON.stringify(dataToExport, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `visual-journal-backup-${user.uid}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportData = (data: { trades: VisualTrade[], tradingPlan: string }) => {
    if (window.confirm("¿Estás seguro? Esto reemplazará todos los datos actuales.")) {
      if (Array.isArray(data.trades) && typeof data.tradingPlan === 'string') {
        setTrades(data.trades);
        setTradingPlan(data.tradingPlan);
        alert("Datos importados con éxito.");
      } else {
        alert("El archivo no tiene el formato correcto.");
      }
    }
  };
  
  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard trades={trades} />;
      case 'settings':
        return <Settings
                 tradingPlan={tradingPlan}
                 onTradingPlanChange={handleTradingPlanChange}
                 onExportData={handleExportData}
                 onImportData={handleImportData}
                 theme={theme}
                 onThemeChange={handleThemeChange}
               />;
      case 'sniper':
        return <Sniper
                  trades={trades}
                  initialBalance={initialBalance}
                  currentBalance={currentBalance}
                  onSetBalance={handleSetBalance}
                  isSessionActive={isSessionActive}
                  onEndSession={handleEndSession}
                  onOpenTradeModal={() => setIsTradeModalOpen(true)}
                  selectedDate={selectedDate}
                  onDateSelect={handleDateSelect}
                  onClearFilter={() => setSelectedDate(null)}
                  sessionStartTime={sessionStartTime}
                  theme={theme}
               />;
      default:
        return <p>Vista no encontrada</p>;
    }
  };

  const sessionTrades = trades.filter(t => sessionStartTime && t.createdAt >= sessionStartTime);

  if (!user) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="grid grid-cols-[80px_1fr] md:grid-cols-[280px_1fr] h-screen bg-background-dark text-text-primary font-sans">
      <Sidebar
        activeView={activeView}
        setActiveView={setActiveView}
        tradingPlan={tradingPlan}
        user={user?.displayName || user?.email || 'Usuario'}
        onLogout={handleLogout}
        theme={theme}
      />

      <main className="overflow-y-auto p-4 flex flex-col gap-4">
        <DashboardHeader viewTitle={activeView} theme={theme} />
        {renderContent()}
      </main>

      {isTradeModalOpen && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-lg">
                 <TradeWorkflow 
                    onSaveTrade={handleSaveAndClose} 
                    isSessionActive={isSessionActive}
                    onClose={() => setIsTradeModalOpen(false)}
                 />
              </div>
          </div>
      )}
      

    </div>
  );
};

export default App;
