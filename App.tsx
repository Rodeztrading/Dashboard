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
    console.log("AUTH_EFFECT: Inicializando observador de estado de autenticación.");
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      console.log("AUTH_EFFECT: Estado de autenticación cambiado. firebaseUser:", firebaseUser ? firebaseUser.uid : "null");
      setUser(firebaseUser);
      if (!firebaseUser) {
        console.log("AUTH_EFFECT: Usuario deslogueado. Limpiando estados locales...");
        setTrades([]);
        setTradingPlan('');
        setTheme('futuristic');
      }
    });

    return () => {
      console.log("AUTH_EFFECT: Limpiando observador de estado de autenticación.");
      unsubscribe();
    };
  }, []);

  // Apply theme on mount
  useEffect(() => {
    console.log("THEME_EFFECT: Aplicando tema:", theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Este useEffect ahora solo guarda en localStorage, ya no guarda en Firestore directamente.
  useEffect(() => {
    if (!user) {
      console.log("TRADES_SAVE_EFFECT: No hay usuario, no se guardan trades en localStorage.");
      return;
    }
    console.log("TRADES_SAVE_EFFECT: Guardando trades en localStorage. Cantidad:", trades.length);
    localStorage.setItem(`visual-trades_${user.uid}`, JSON.stringify(trades));
  }, [trades, user]);

  // Load user data from Firestore on login
  useEffect(() => {
    if (!user) {
      console.log("LOAD_DATA_EFFECT: No hay usuario, no se carga data de Firestore.");
      return;
    }

    console.log("LOAD_DATA_EFFECT: Usuario logueado. Iniciando carga de data de Firestore para UID:", user.uid);

    const loadUserData = async () => {
      try {
        const userData = await getUserData(user.uid);
        if (userData) {
          console.log("LOAD_DATA_EFFECT: Data de usuario RECIBIDA de Firestore:", userData);
          setTrades(userData.trades || []);
          setTradingPlan(userData.tradingPlan || '');
          setTheme(userData.theme || 'futuristic');
          console.log("LOAD_DATA_EFFECT: Estados locales actualizados con data de Firestore.");
        } else {
          console.log("LOAD_DATA_EFFECT: No se encontraron datos en Firestore para este usuario. Intentando cargar desde localStorage.");
          // Fallback to localStorage
          const savedTrades = localStorage.getItem(`visual-trades_${user.uid}`);
          const savedPlan = localStorage.getItem(`visual-trading-plan_${user.uid}`);
          const savedTheme = localStorage.getItem('visual-theme') || 'futuristic';

          const tradesData = savedTrades ? JSON.parse(savedTrades) : [];
          const planData = savedPlan || '';

          setTrades(tradesData);
          setTradingPlan(planData);
          setTheme(savedTheme);
          console.log("LOAD_DATA_EFFECT: Estados locales actualizados con data de localStorage.");

          // Si no hay datos en Firestore pero sí en localStorage,
          // podríamos querer subir los de localStorage a Firestore la primera vez.
          if (user && (tradesData.length > 0 || planData !== '' || savedTheme !== 'futuristic')) {
             console.log("LOAD_DATA_EFFECT: Inicializando Firestore con data de localStorage.");
             await saveUserData(user.uid, {
                trades: tradesData,
                tradingPlan: planData,
                theme: savedTheme
             });
             console.log("LOAD_DATA_EFFECT: Data de localStorage guardada en Firestore.");
          }
        }
      } catch (error) {
        console.error("LOAD_DATA_EFFECT: Error al cargar datos de usuario de Firestore, fallback a localStorage:", error);
        // Fallback to localStorage
        const savedTrades = localStorage.getItem(`visual-trades_${user.uid}`);
        const savedPlan = localStorage.getItem(`visual-trading-plan_${user.uid}`);
        const savedTheme = localStorage.getItem('visual-theme') || 'futuristic';

        const tradesData = savedTrades ? JSON.parse(savedTrades) : [];
        const planData = savedPlan || '';

        setTrades(tradesData);
        setTradingPlan(planData);
        setTheme(savedTheme);
        console.log("LOAD_DATA_EFFECT: Estados locales actualizados con data de localStorage debido a un error.");
      }
    };

    loadUserData();
  }, [user]);

  // Este useEffect ahora solo guarda en localStorage, ya no guarda en Firestore directamente.
  useEffect(() => {
    if (!user) {
      console.log("PLAN_SAVE_EFFECT: No hay usuario, no se guarda plan de trading en localStorage.");
      return;
    }
    console.log("PLAN_SAVE_EFFECT: Guardando plan de trading en localStorage:", tradingPlan.substring(0, 50) + "...");
    localStorage.setItem(`visual-trading-plan_${user.uid}`, tradingPlan);
  }, [tradingPlan, user]);


  const handleLogin = () => {
    console.log("HANDLE_LOGIN: Evento de login disparado. onAuthStateChanged lo manejará.");
    // Firebase auth state will be handled by onAuthStateChanged
  };

  const handleLogout = async () => {
    if (window.confirm("¿Estás seguro de que quieres cerrar sesión?")) {
      console.log("HANDLE_LOGOUT: Cerrando sesión, intentando guardar data final ANTES de salir...");
      try {
        if (user) {
          console.log("HANDLE_LOGOUT: Data final a guardar en Firestore:");
          console.log("  Trades:", trades.length, "items.");
          console.log("  Trading Plan:", tradingPlan.substring(0, 50) + "...");
          console.log("  Theme:", theme);

          await Promise.all([
            updateUserTrades(user.uid, trades),
            updateUserTradingPlan(user.uid, tradingPlan),
            updateUserTheme(user.uid, theme)
          ]);
          console.log("HANDLE_LOGOUT: Toda la data de usuario guardada con éxito en Firestore antes de logout.");
        }
        await signOut(auth);
        console.log("HANDLE_LOGOUT: Sesión de Firebase cerrada.");
        // Resetear el estado específico de la sesión
        setInitialBalance(null);
        setCurrentBalance(null);
        setSessionStartTime(null);
        setActiveView('dashboard');
        console.log("HANDLE_LOGOUT: Estados locales de sesión reiniciados.");
      } catch (error) {
        console.error("HANDLE_LOGOUT: Error durante el logout o al guardar en Firestore:", error);
        // Incluso si falla el guardado en Firestore, cerrar sesión y guardar en localStorage como respaldo
        try {
          localStorage.setItem(`visual-trades_${user.uid}`, JSON.stringify(trades));
          localStorage.setItem(`visual-trading-plan_${user.uid}`, tradingPlan);
          localStorage.setItem('visual-theme', theme);
          await signOut(auth);
          alert("Sesión cerrada. Datos guardados localmente como respaldo.");
          console.log("HANDLE_LOGOUT: Fallback: Data guardada en localStorage, sesión cerrada.");
        } catch (signOutError) {
          console.error("HANDLE_LOGOUT: Fallback: Error al cerrar sesión:", signOutError);
          alert("Error al cerrar sesión. Inténtalo de nuevo.");
        }
      }
    }
  };

  const handleThemeChange = async (newTheme: string) => {
    console.log("HANDLE_THEME_CHANGE: Cambiando tema a:", newTheme);
    setTheme(newTheme);
    // Aplicar tema al documento
    document.documentElement.setAttribute('data-theme', newTheme);
    // Guardar tema en localStorage
    localStorage.setItem('visual-theme', newTheme);

    // Guardar tema en Firestore
    if (user) {
      try {
        console.log("HANDLE_THEME_CHANGE: Guardando tema en Firestore para UID:", user.uid);
        await updateUserTheme(user.uid, newTheme);
        console.log("HANDLE_THEME_CHANGE: Tema guardado con éxito en Firestore.");
      } catch (error) {
        console.error("HANDLE_THEME_CHANGE: Error al guardar tema en Firestore:", error);
        // El tema aún está guardado en localStorage
      }
    }
  };

  // Ahora es `async` y guarda directamente en Firestore.
  const handleTradingPlanChange = async (notes: string) => {
    console.log("HANDLE_TRADING_PLAN_CHANGE: Cambiando plan de trading a (primeros 50 caracteres):", notes.substring(0, 50) + "...");
    setTradingPlan(notes); // Actualiza el estado local

    // Guardar el nuevo tradingPlan en Firestore INMEDIATAMENTE
    if (user) { // Asegúrate de que haya un usuario logueado para guardar en Firestore
      try {
        console.log("HANDLE_TRADING_PLAN_CHANGE: Guardando plan de trading en Firestore para UID:", user.uid);
        await updateUserTradingPlan(user.uid, notes); // <<< AQUI GUARDAS EN FIRESTORE
        console.log("HANDLE_TRADING_PLAN_CHANGE: Plan de trading guardado con éxito en Firestore.");
      } catch (error) {
        console.error("HANDLE_TRADING_PLAN_CHANGE: Error al guardar plan de trading en Firestore:", error);
      }
    }
  };
  
  const isSessionActive = initialBalance !== null;

  const handleSetBalance = (balance: number) => {
    console.log("HANDLE_SET_BALANCE: Estableciendo balance inicial:", balance);
    setInitialBalance(balance);
    setCurrentBalance(balance);
    setSessionStartTime(Date.now());
  };
  
  // Ahora es `async` y guarda directamente en Firestore.
  const handleSaveAndClose = async (tradeData: Omit<VisualTrade, 'id' | 'createdAt'>) => {
    const newTrade: VisualTrade = {
      ...tradeData,
      id: `trade_${Date.now()}_${Math.random()}`,
      createdAt: Date.now(),
    };
    console.log("HANDLE_SAVE_AND_CLOSE: Nuevo trade a añadir:", newTrade);

    // Crea el nuevo array de trades para actualizar el estado local y enviar a Firestore
    const updatedTrades = [...trades, newTrade]; 
    setTrades(updatedTrades); // Actualiza el estado local con el nuevo array
    console.log("HANDLE_SAVE_AND_CLOSE: Estado local de trades actualizado. Nueva cantidad:", updatedTrades.length);

    // Guarda el nuevo array de trades en Firestore INMEDIATAMENTE
    if (user) { // Asegúrate de que haya un usuario logueado para guardar en Firestore
      try {
        console.log("HANDLE_SAVE_AND_CLOSE: Guardando trades en Firestore para UID:", user.uid, "con la cantidad:", updatedTrades.length);
        await updateUserTrades(user.uid, updatedTrades); // <<< AQUI GUARDAS EN FIRESTORE
        console.log("HANDLE_SAVE_AND_CLOSE: Trades guardados con éxito en Firestore.");
      } catch (error) {
        console.error("HANDLE_SAVE_AND_CLOSE: Error al guardar trades en Firestore:", error);
      }
    }

    if (currentBalance !== null) {
      const profitOrLoss = tradeData.outcome === 'WIN'
        ? tradeData.amountInvested * (tradeData.payout / 100)
        : -tradeData.amountInvested;
      setCurrentBalance(prevBalance => (prevBalance !== null ? prevBalance + profitOrLoss : null));
      console.log("HANDLE_SAVE_AND_CLOSE: Balance actual actualizado:", currentBalance + profitOrLoss);
    }
    setIsTradeModalOpen(false);
    console.log("HANDLE_SAVE_AND_CLOSE: Modal de trade cerrado.");
  };


  const handleEndSession = () => {
    console.log("HANDLE_END_SESSION: Intentando finalizar sesión.");
    if (window.confirm('¿Confirmar fin de la sesión? Se reiniciará el capital.')) {
      handleCloseReviewAndReset();
    }
  };

  const handleCloseReviewAndReset = async () => {
    console.log("HANDLE_CLOSE_REVIEW_AND_RESET: Finalizando sesión, guardando trades finales antes de reiniciar...");
    try {
      // Asegurarse de que todos los trades se guarden en Firestore antes de resetear la sesión
      if (user) {
        console.log("HANDLE_CLOSE_REVIEW_AND_RESET: Guardando trades finales en Firestore para UID:", user.uid, "Cantidad:", trades.length);
        await updateUserTrades(user.uid, trades);
        console.log("HANDLE_CLOSE_REVIEW_AND_RESET: Trades finales guardados con éxito antes de reinicio de sesión.");
      }
      alert(`Sesión terminada. Saldo final: $${currentBalance?.toFixed(2)}`);
      setInitialBalance(null);
      setCurrentBalance(null);
      setSessionStartTime(null);
      setActiveView('dashboard');
      console.log("HANDLE_CLOSE_REVIEW_AND_RESET: Estados de sesión reiniciados.");
    } catch (error) {
      console.error("HANDLE_CLOSE_REVIEW_AND_RESET: Error al guardar trades antes del reinicio de sesión:", error);
      // Incluso si Firestore falla, resetear sesión y guardar en localStorage
      localStorage.setItem(`visual-trades_${user.uid}`, JSON.stringify(trades));
      alert(`Sesión terminada. Saldo final: $${currentBalance?.toFixed(2)}. Datos guardados localmente.`);
      setInitialBalance(null);
      setCurrentBalance(null);
      setSessionStartTime(null);
      setActiveView('dashboard');
      console.log("HANDLE_CLOSE_REVIEW_AND_RESET: Fallback: Datos guardados localmente, sesión reiniciada.");
    }
  };

  const handleDateSelect = (date: Date | null) => {
    console.log("HANDLE_DATE_SELECT: Fecha seleccionada:", date);
    if (date && selectedDate && date.toDateString() === selectedDate.toDateString()) {
      setSelectedDate(null);
    } else {
      setSelectedDate(date);
    }
  };

  const handleExportData = () => {
    console.log("HANDLE_EXPORT_DATA: Exportando data...");
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
    console.log("HANDLE_EXPORT_DATA: Data exportada.");
  };

  const handleImportData = async (data: { trades: VisualTrade[], tradingPlan: string }) => {
    console.log("HANDLE_IMPORT_DATA: Intentando importar data.");
    if (window.confirm("¿Estás seguro? Esto reemplazará todos los datos actuales.")) {
      if (Array.isArray(data.trades) && typeof data.tradingPlan === 'string') {
        setTrades(data.trades);
        setTradingPlan(data.tradingPlan);
        alert("Datos importados con éxito.");
        console.log("HANDLE_IMPORT_DATA: Datos importados a estados locales.");

        // Guardar datos importados a Firestore
        if (user) {
          try {
            console.log("HANDLE_IMPORT_DATA: Guardando datos importados en Firestore para UID:", user.uid);
            await saveUserData(user.uid, { trades: data.trades, tradingPlan: data.tradingPlan, theme: theme });
            console.log("HANDLE_IMPORT_DATA: Datos importados guardados en Firestore con éxito.");
          } catch (error) {
            console.error("HANDLE_IMPORT_DATA: Error al guardar datos importados en Firestore:", error);
          }
        }
      } else {
        alert("El archivo no tiene el formato correcto.");
        console.error("HANDLE_IMPORT_DATA: Error: El archivo importado no tiene el formato correcto.");
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
