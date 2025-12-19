import React, { useState, useEffect } from 'react';
import { RodezView } from './components/RodezView';
import { BudgetView } from './components/BudgetView';
import { LoginScreen } from './components/LoginScreen';
import { LoadingScreen } from './components/LoadingScreen';
import { DominicView } from './components/DominicView';
import { ViewState, VisualTrade } from './types';
import { LayoutDashboard, Target, Settings, BarChart2, Wallet, LogOut, User, Download, Smartphone, Share, Users } from 'lucide-react';
import { getAllTrades, saveTrade, migrateLocalTradesToFirebase, migrateLegacyGlobalTrades, resetUserData } from './services/firebaseService';
import { useAuth } from './hooks/useAuth';
import { usePWAInstall } from './hooks/usePWAInstall';

const App: React.FC = () => {
  const { user, loading: authLoading, logout } = useAuth();
  const { isInstallable, installApp } = usePWAInstall();
  const [view, setView] = useState<ViewState>(ViewState.SNIPER); // ViewState.SNIPER will remain the enum value for logic consistency unless I change the enum too, but for UI it will be RODEZ
  const [trades, setTrades] = useState<VisualTrade[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTrades = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      // 1. Migrate localStorage trades if they exist (only once)
      const savedTrades = localStorage.getItem('jf_rodez_trades');
      if (savedTrades) {
        try {
          const localTrades: VisualTrade[] = JSON.parse(savedTrades);
          console.log('Migrating', localTrades.length, 'trades from localStorage to Firebase...');
          await migrateLocalTradesToFirebase(localTrades, user.uid);
          localStorage.removeItem('jf_rodez_trades');
          console.log('LocalStorage migration completed and cleared!');
        } catch (parseError) {
          console.error('Error parsing local trades:', parseError);
          localStorage.removeItem('jf_rodez_trades'); // Clear corrupted data
        }
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
    <div className="flex h-screen bg-gray-950 text-white font-sans selection:bg-rodez-red selection:text-white">
      {/* Sidebar Navigation */}
      <nav className="w-16 md:w-20 lg:w-64 bg-gray-900 border-r border-gray-800 flex flex-col justify-between shrink-0">
        <div>
          <div className="h-28 flex items-center justify-center lg:justify-start lg:px-8 border-b border-gray-800">
            <img src="/logo_rodez.png" alt="RODEZ" className="h-16 lg:h-20 w-auto object-contain transition-all" />
          </div>

          <div className="py-6 space-y-2 px-2 md:px-3">


            <button
              onClick={() => setView(ViewState.SNIPER)}
              className={`w-full flex items-center justify-center lg:justify-start p-3 rounded-lg transition-all ${view === ViewState.SNIPER ? 'bg-gray-800 text-rodez-red shadow-inner' : 'text-gray-400 hover:text-white hover:bg-gray-800/50'}`}
              title="RODEZ Journal"
            >
              <BarChart2 className="w-5 h-5 lg:mr-3" />
              <span className="hidden lg:block">RODEZ Journal</span>
            </button>

            <button
              onClick={() => setView(ViewState.BUDGET)}
              className={`w-full flex items-center justify-center lg:justify-start p-3 rounded-lg transition-all ${view === ViewState.BUDGET ? 'bg-gray-800 text-rodez-red shadow-inner' : 'text-gray-400 hover:text-white hover:bg-gray-800/50'}`}
              title="Presupuesto"
            >
              <Wallet className="w-5 h-5 lg:mr-3" />
              <span className="hidden lg:block">Presupuesto</span>
            </button>

            <button
              onClick={() => setView(ViewState.DOMINIC)}
              className={`w-full flex items-center justify-center lg:justify-start p-3 rounded-lg transition-all ${view === ViewState.DOMINIC ? 'bg-gray-800 text-rodez-red shadow-inner' : 'text-gray-400 hover:text-white hover:bg-gray-800/50'}`}
              title="Dominic"
            >
              <Users className="w-5 h-5 lg:mr-3" />
              <span className="hidden lg:block">Dominic</span>
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
                  className="w-10 h-10 rounded-full border-2 border-rodez-red"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-rodez-red flex items-center justify-center">
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
          <RodezView trades={trades} onSaveTrade={handleSaveTrade} />
        )}

        {view === ViewState.BUDGET && (
          <BudgetView />
        )}

        {view === ViewState.DOMINIC && (
          <DominicView />
        )}



        {view === ViewState.SETTINGS && (
          <div className="max-w-2xl mx-auto py-8 px-4">
            <div className="text-center mb-8">
              <Settings className="w-16 h-16 mx-auto mb-4 text-gray-700" />
              <h2 className="text-2xl font-bold text-white mb-2">Ajustes</h2>
              <p className="text-gray-400">Configuración de tu cuenta y aplicación</p>
            </div>

            {/* Mobile App Section */}
            <div className="bg-gray-800/30 rounded-xl p-6 mb-6 border border-gray-800">
              <h3 className="text-lg font-semibold mb-4 flex items-center text-white">
                <Smartphone className="w-5 h-5 mr-2 text-rodez-red" />
                Aplicación Móvil RODEZ
              </h3>

              <div className="space-y-4">
                <p className="text-gray-400 text-sm">
                  Instala RODEZ en tu dispositivo para un acceso más rápido y mejor experiencia.
                </p>

                {isInstallable ? (
                  <button
                    onClick={installApp}
                    className="w-full sm:w-auto flex items-center justify-center px-6 py-3 bg-rodez-red hover:bg-red-600 text-white rounded-lg transition-all shadow-lg shadow-red-900/20 font-medium"
                  >
                    <Download className="w-5 h-5 mr-2" />
                    Instalar Aplicación
                  </button>
                ) : (
                  <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-800">
                    <p className="text-sm text-gray-300 font-medium mb-2">¿Cómo instalar?</p>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Android / Chrome</p>
                        <p className="text-sm text-gray-400">Si no ves el botón, usa el menú del navegador y selecciona "Instalar aplicación".</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">iOS (iPhone/iPad)</p>
                        <p className="text-sm text-gray-400 flex flex-col gap-1">
                          <span>1. Toca el botón <Share className="w-3 h-3 inline mx-1" /> Compartir</span>
                          <span>2. Selecciona "Agregar a Inicio"</span>
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-red-900/10 rounded-xl p-6 border border-red-900/20">
              <h3 className="text-lg font-semibold mb-4 flex items-center text-red-400">
                <LogOut className="w-5 h-5 mr-2" />
                Zona de Peligro
              </h3>

              <p className="text-gray-400 text-sm mb-4">
                Estas acciones son destructivas y no se pueden deshacer.
              </p>

              <button
                onClick={async () => {
                  if (confirm("ADVERTENCIA: ¿Estás seguro de que quieres borrar TODOS tus datos? Esta acción eliminará permanentemente todos tus trades, cuentas y configuraciones de la nube y no se puede deshacer.")) {
                    try {
                      setLoading(true);
                      await resetUserData(user.uid);
                      setTrades([]);
                      localStorage.removeItem('jf_rodez_trades');
                      alert("Cuenta reiniciada correctamente. La aplicación se recargará.");
                      window.location.reload();
                    } catch (error) {
                      console.error("Error resetting account:", error);
                      alert("Error al reiniciar la cuenta. Por favor intenta de nuevo.");
                      setLoading(false);
                    }
                  }
                }}
                className="w-full sm:w-auto px-4 py-2 bg-red-900/20 text-red-400 rounded hover:bg-red-900/40 border border-red-900/50 transition-colors text-sm flex items-center justify-center"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Reinicio Total de Cuenta
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;