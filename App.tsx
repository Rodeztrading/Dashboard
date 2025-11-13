import React, { useState, useEffect } from 'react';
import BalanceManager from './components/BalanceManager';
import TradeWorkflow from './components/TradeWorkflow';
import TradeHistory from './components/TradeHistory';
import Dashboard from './components/Dashboard';
import Sidebar from './components/Sidebar';
import DashboardHeader from './components/DashboardHeader';
import Settings from './components/Settings';
import Sniper from './components/Sniper';
import type { VisualTrade } from './types';

const App: React.FC = () => {
  const [trades, setTrades] = useState<VisualTrade[]>(() => {
    try {
      const savedTrades = localStorage.getItem('visual-ai-journal-trades');
      return savedTrades ? JSON.parse(savedTrades) : [];
    } catch (error) {
      console.error("Failed to parse trades from localStorage", error);
      return [];
    }
  });

  const [initialBalance, setInitialBalance] = useState<number | null>(null);
  const [currentBalance, setCurrentBalance] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [activeView, setActiveView] = useState('dashboard');
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);
  const [userProfile, setUserProfile] = useState({
    name: 'Malinda Holloway',
    handle: '@malindah',
    avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d'
  });
  const [tradingPlan, setTradingPlan] = useState('');

  useEffect(() => {
    localStorage.setItem('visual-ai-journal-trades', JSON.stringify(trades));
  }, [trades]);

  useEffect(() => {
    const savedNotes = localStorage.getItem('traderStrategyNotes');
    if (savedNotes) {
      setTradingPlan(savedNotes);
    }
  }, []);

  const handleTradingPlanChange = (notes: string) => {
    setTradingPlan(notes);
    localStorage.setItem('traderStrategyNotes', notes);
  };
  
  const isSessionActive = initialBalance !== null;

  const handleSetBalance = (balance: number) => {
    setInitialBalance(balance);
    setCurrentBalance(balance);
  };

  const handleSaveTrade = (trade: VisualTrade) => {
    setTrades(prevTrades => [...prevTrades, trade]);
    
    if (currentBalance !== null) {
      const profitOrLoss = trade.outcome === 'WIN' 
        ? trade.amountInvested * (trade.payout / 100)
        : -trade.amountInvested;
      
      setCurrentBalance(prevBalance => (prevBalance !== null ? prevBalance + profitOrLoss : null));
    }
  };

  const handleSaveAndClose = (trade: VisualTrade) => {
    handleSaveTrade(trade);
    setIsTradeModalOpen(false);
  };

  const handleEndSession = () => {
    if (window.confirm('¿Confirmar fin de la sesión? Se reiniciará el capital para una nueva sesión. El historial de operaciones se conservará.')) {
      alert(`Sesión terminada. Saldo final: $${currentBalance?.toFixed(2)}`);
      setInitialBalance(null);
      setCurrentBalance(null);
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

  const handleUpdateProfile = (newProfile: { name: string; handle: string; avatar: string; }) => {
    setUserProfile(newProfile);
    setActiveView('dashboard');
  };

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return (
          <div className="space-y-4">
            <BalanceManager 
              initialBalance={initialBalance}
              currentBalance={currentBalance}
              onSetBalance={handleSetBalance}
            />
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center futuristic-panel p-4">
                <div>
                    <h3 className="text-lg font-bold uppercase">Consola de Operaciones</h3>
                    <p className="text-text-secondary mt-1 text-sm">Registra una nueva operación o revisa tu historial.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 justify-end">
                    <button 
                        onClick={() => setIsTradeModalOpen(true)}
                        className="futuristic-button font-bold py-2 px-4 rounded-lg"
                        disabled={!isSessionActive}
                    >
                        + Registrar Operación
                    </button>
                    <button 
                        onClick={handleEndSession}
                        className="futuristic-button-red font-bold py-2 px-4 rounded-lg"
                        disabled={!isSessionActive}
                    >
                        Terminar Sesión
                    </button>
                </div>
            </div>
            <Dashboard trades={trades} initialBalance={initialBalance} selectedDate={selectedDate} />
            <TradeHistory trades={trades} selectedDate={selectedDate} onClearFilter={() => setSelectedDate(null)} />
          </div>
        );
      case 'settings':
        return <Settings userProfile={userProfile} onSave={handleUpdateProfile} tradingPlan={tradingPlan} onTradingPlanChange={handleTradingPlanChange} />;
      case 'sniper':
        return <Sniper trades={trades} />;
      default:
        return <p>Vista no encontrada</p>;
    }
  };

  return (
    <div className="grid grid-cols-[80px_1fr] md:grid-cols-[280px_1fr] h-screen bg-background-dark text-text-primary font-sans">
      <Sidebar 
        activeView={activeView} 
        setActiveView={setActiveView} 
        userProfile={userProfile}
        trades={trades}
        selectedDate={selectedDate}
        onDateSelect={handleDateSelect}
        tradingPlan={tradingPlan}
      />

      <main className="overflow-y-auto p-4 flex flex-col gap-4">
        {isSessionActive ? (
          <>
            <DashboardHeader viewTitle={activeView} />
            {renderContent()}
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="w-full max-w-xl mx-auto space-y-4">
                <div className="text-center futuristic-panel">
                    <h2 className="text-2xl font-bold text-glow-cyan uppercase">Conexión a la Consola de Trading</h2>
                    <p className="text-gray-300 mt-2">Establece tu capital para iniciar la sesión.</p>
                </div>
                <BalanceManager 
                    initialBalance={initialBalance}
                    currentBalance={currentBalance}
                    onSetBalance={handleSetBalance}
                />
            </div>
          </div>
        )}
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
