import React, { useState, useEffect } from 'react';
import { SniperView } from './components/SniperView';
import { BudgetView } from './components/BudgetView';
import { LoginScreen } from './components/LoginScreen';
import { LoadingScreen } from './components/LoadingScreen';
import { ViewState, VisualTrade } from './types';
import { LayoutDashboard, Target, Settings, BarChart2, Wallet, LogOut, User } from 'lucide-react';
import { getAllTrades, saveTrade, migrateLocalTradesToFirebase, migrateLegacyGlobalTrades, resetUserData } from './services/firebaseService';
import { useAuth } from './hooks/useAuth';

const App: React.FC = () => {
  const { user, loading: authLoading, logout } = useAuth();
  const [view, setView] = useState<ViewState>(ViewState.SNIPER);
  const [trades, setTrades] = useState<VisualTrade[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTrades = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      // 1. Migrate localStorage trades if they exist (only once)
      const savedTrades = localStorage.getItem('jf_sniper_trades');
      if (savedTrades) {
        const localTrades: VisualTrade[] = JSON.parse(savedTrades);
        console.log('Migrating', localTrades.length, 'trades from localStorage to Firebase...');
        await migrateLocalTradesToFirebase(localTrades, user.uid);
        localStorage.removeItem('jf_sniper_trades');
        console.log('LocalStorage migration completed and cleared!');
      }

      // 2. Migrate legacy global Firestore trades if they exist (only once)
      try {
        const migratedCount = await migrateLegacyGlobalTrades(user.uid);
        if (migratedCount > 0) {
          console.log(`Migrated ${migratedCount} legacy global trades to user collection`);
        }
      } catch (migrationError) {
        console.warn('Legacy migration skipped or failed (likely due to permissions or empty):', migrationError);
      }

      // 3. Load all trades from user's private collection
      const firebaseTrades = await getAllTrades(user.uid);
      setTrades(firebaseTrades);
    } catch (error) {
      console.error('Error loading trades from Firebase:', error);
      // Don't fallback to localStorage - it was already migrated and cleared
      setTrades([]);
    } finally {
      setLoading(false);
    }
  };

  // Load trades from Firebase on mount and migrate from localStorage if needed
  useEffect(() => {
    loadTrades();
  }, [user]);

  const handleSaveTrade = async (tradeData: Omit<VisualTrade, 'id' | 'createdAt'>) => {
    if (!user) return;
    try {
      const newTrade: VisualTrade = {
        ...tradeData,
        id: crypto.randomUUID(),
        createdAt: Date.now(),
      };

      // Save to Firebase
      await saveTrade(newTrade, user.uid);

      // Reload trades from Firebase to ensure single source of truth and avoid duplication
      await loadTrades();
    } catch (error) {
      console.error('Error saving trade:', error);
      alert('Error al guardar el trade. Por favor, intenta de nuevo.');
    }
  };

  // Show loading screen while checking authentication
  if (authLoading) {
    return <LoadingScreen />;
  }

  // Show login screen if not authenticated
  if (!user) {
    return <LoginScreen />;
  }

  return (
    <div className="flex h-screen bg-gray-950 text-white font-sans selection:bg-sniper-blue selection:text-white">
      {/* Sidebar Navigation */}
      <nav className="w-16 md:w-20 lg:w-64 bg-gray-900 border-r border-gray-800 flex flex-col justify-between shrink-0">
        <div>
          <div className="h-16 flex items-center justify-center lg:justify-start lg:px-6 border-b border-gray-800">
            <div className="w-8 h-8 bg-sniper-blue rounded-md flex items-center justify-center mr-0 lg:mr-3 shadow-lg shadow-blue-900/50">
              <Target className="text-white w-5 h-5" />
            </div>
            <span className="hidden lg:block font-bold text-lg tracking-wider">SNIPER<span className="text-sniper-blue">.PRO</span></span>
          </div>

          <div className="py-6 space-y-2 px-2 md:px-3">
            <button
              onClick={() => setView(ViewState.DASHBOARD)}
              className={`w-full flex items-center justify-center lg:justify-start p-3 rounded-lg transition-all ${view === ViewState.DASHBOARD ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800/50'}`}
              title="Dashboard"
            >
              <LayoutDashboard className="w-5 h-5 lg:mr-3" />
              <span className="hidden lg:block">Dashboard</span>
            </button>

            <button
              onClick={() => setView(ViewState.SNIPER)}
              className={`w-full flex items-center justify-center lg:justify-start p-3 rounded-lg transition-all ${view === ViewState.SNIPER ? 'bg-gray-800 text-sniper-blue shadow-inner' : 'text-gray-400 hover:text-white hover:bg-gray-800/50'}`}
              title="Sniper Journal"
            >
              <BarChart2 className="w-5 h-5 lg:mr-3" />
              <span className="hidden lg:block">Sniper Journal</span>
            </button>

            <button
              onClick={() => setView(ViewState.BUDGET)}
              className={`w-full flex items-center justify-center lg:justify-start p-3 rounded-lg transition-all ${view === ViewState.BUDGET ? 'bg-gray-800 text-sniper-blue shadow-inner' : 'text-gray-400 hover:text-white hover:bg-gray-800/50'}`}
              title="Presupuesto"
            >
              <Wallet className="w-5 h-5 lg:mr-3" />
              <span className="hidden lg:block">Presupuesto</span>
            </button>

            <button
              onClick={() => setView(ViewState.SETTINGS)}
              className={`w-full flex items-center justify-center lg:justify-start p-3 rounded-lg transition-all ${view === ViewState.SETTINGS ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800/50'}`}
              title="Settings"
            >
              <Settings className="w-5 h-5 lg:mr-3" />
              <span className="hidden lg:block">Ajustes</span>
            </button>
          </div>
        </div>

        {/* User Profile and Logout */}
        <div className="p-4 border-t border-gray-800">
          <div className="bg-gray-800/50 rounded-lg p-3">
            {/* User Info */}
            <div className="flex items-center space-x-3 mb-3">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  className="w-10 h-10 rounded-full border-2 border-sniper-blue"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-sniper-blue flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
              )}
              <div className="hidden lg:block flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">
                  {user.displayName || 'Usuario'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user.email}
                </p>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={logout}
              className="w-full flex items-center justify-center lg:justify-start p-2 rounded-lg bg-gray-700/50 hover:bg-red-900/50 text-gray-400 hover:text-red-400 transition-all"
            >
              <LogOut className="w-4 h-4 lg:mr-2" />
              <span className="hidden lg:block text-sm">Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 relative overflow-hidden flex flex-col min-w-0">
        {view === ViewState.SNIPER && (
          <SniperView trades={trades} onSaveTrade={handleSaveTrade} />
        )}

        {view === ViewState.BUDGET && (
          <BudgetView />
        )}

        {view === ViewState.DASHBOARD && (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <LayoutDashboard className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p>Dashboard General - Próximamente</p>
            </div>
          </div>
        )}

        {view === ViewState.SETTINGS && (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <Settings className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p>Configuración del Usuario</p>
              <button
                onClick={async () => {
                  if (confirm("ADVERTENCIA: ¿Estás seguro de que quieres borrar TODOS tus datos? Esta acción eliminará permanentemente todos tus trades, cuentas y configuraciones de la nube y no se puede deshacer.")) {
                    try {
                      setLoading(true);
                      await resetUserData(user.uid);
                      setTrades([]);
                      localStorage.removeItem('jf_sniper_trades');
                      alert("Cuenta reiniciada correctamente. La aplicación se recargará.");
                      window.location.reload();
                    } catch (error) {
                      console.error("Error resetting account:", error);
                      alert("Error al reiniciar la cuenta. Por favor intenta de nuevo.");
                      setLoading(false);
                    }
                  }
                }}
                className="mt-4 px-4 py-2 bg-red-900/50 text-red-400 rounded hover:bg-red-900 border border-red-900 transition-colors"
              >
                Reinicio Total de Cuenta (Borrar Todo)
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;