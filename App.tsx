import React, { useState, useEffect } from 'react';
import { SniperView } from './components/SniperView';
import { ViewState, VisualTrade } from './types';
import { LayoutDashboard, Target, Settings, BarChart2 } from 'lucide-react';
import { getAllTrades, saveTrade, migrateLocalTradesToFirebase } from './services/firebaseService';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>(ViewState.SNIPER);
  const [trades, setTrades] = useState<VisualTrade[]>([]);
  const [loading, setLoading] = useState(true);

  // Load trades from Firebase on mount and migrate from localStorage if needed
  useEffect(() => {
    const loadTrades = async () => {
      try {
        // Check if there are trades in localStorage
        const savedTrades = localStorage.getItem('jf_sniper_trades');

        if (savedTrades) {
          // Migrate local trades to Firebase
          const localTrades: VisualTrade[] = JSON.parse(savedTrades);
          console.log('Migrating', localTrades.length, 'trades from localStorage to Firebase...');

          await migrateLocalTradesToFirebase(localTrades);

          // Clear localStorage after successful migration
          localStorage.removeItem('jf_sniper_trades');
          console.log('Migration completed successfully!');
        }

        // Load all trades from Firebase
        const firebaseTrades = await getAllTrades();
        setTrades(firebaseTrades);
      } catch (error) {
        console.error('Error loading trades from Firebase:', error);

        // Fallback to localStorage if Firebase fails
        const savedTrades = localStorage.getItem('jf_sniper_trades');
        if (savedTrades) {
          try {
            setTrades(JSON.parse(savedTrades));
          } catch (e) {
            console.error('Error loading trades from localStorage', e);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    loadTrades();
  }, []);

  const handleSaveTrade = async (tradeData: Omit<VisualTrade, 'id' | 'createdAt'>) => {
    try {
      const newTrade: VisualTrade = {
        ...tradeData,
        id: crypto.randomUUID(),
        createdAt: Date.now(),
      };

      // Save to Firebase
      const savedTrade = await saveTrade(newTrade);

      // Update local state
      setTrades(prev => [savedTrade, ...prev]);
    } catch (error) {
      console.error('Error saving trade:', error);
      alert('Error al guardar el trade. Por favor, intenta de nuevo.');
    }
  };

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
              className={`w-full flex items-center justify-center lg:justify-start p-3 rounded-lgyb transition-all ${view === ViewState.SNIPER ? 'bg-gray-800 text-sniper-blue shadow-inner' : 'text-gray-400 hover:text-white hover:bg-gray-800/50'}`}
              title="Sniper Journal"
            >
              <BarChart2 className="w-5 h-5 lg:mr-3" />
              <span className="hidden lg:block">Sniper Journal</span>
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

        <div className="p-4 border-t border-gray-800">
          <div className="bg-gray-800/50 rounded-lg p-3 hidden lg:block">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-xs text-gray-400">Sistema: Online</span>
            </div>
            <p className="text-[10px] text-gray-500">v3.1.0 Lite (No AI)</p>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 relative overflow-hidden flex flex-col min-w-0">
        {view === ViewState.SNIPER && (
          <SniperView trades={trades} onSaveTrade={handleSaveTrade} />
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
                onClick={() => {
                  if (confirm("¿Borrar todos los datos locales?")) {
                    setTrades([]);
                    localStorage.removeItem('jf_sniper_trades');
                  }
                }}
                className="mt-4 px-4 py-2 bg-red-900/50 text-red-400 rounded hover:bg-red-900"
              >
                Resetear Datos Locales
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;