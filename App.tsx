import React, { useState, useEffect } from 'react';
import BalanceManager from './components/BalanceManager';
import TradeWorkflow from './components/TradeWorkflow';
import TradeHistory from './components/TradeHistory';
import Dashboard from './components/Dashboard';
import Sidebar from './components/Sidebar';
import DashboardHeader from './components/DashboardHeader';
import Settings from './components/Settings';
import Sniper from './components/Sniper';
import SessionReviewModal from './components/SessionReviewModal';
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
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const [userProfile, setUserProfile] = useState({
    name: 'Sniper Trader',
    handle: '@sniper_trader',
    avatar: 'https://images.unsplash.com/photo-1577962917302-cd874c4e31d2?w=400&h=400&fit=crop'
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
    setSessionStartTime(Date.now());
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
    if (window.confirm('¿Confirmar fin de la sesión? Se generará un análisis de IA y luego se reiniciará el capital.')) {
      setIsReviewModalOpen(true);
    }
  };

  const handleCloseReviewAndReset = () => {
    alert(`Sesión terminada. Saldo final: $${currentBalance?.toFixed(2)}`);
    setInitialBalance(null);
    setCurrentBalance(null);
    setSessionStartTime(null);
    setIsReviewModalOpen(false);
    setActiveView('dashboard');
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
                <p className="text-text-secondary mt-1 text-sm">
                  {isSessionActive ? 'Registra una nueva operación o revisa tu historial.' : 'Establece un capital para registrar operaciones.'}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-end">
                <button 
                  onClick={() => setIsTradeModalOpen(true)}
                  className={`font-bold py-2 px-4 rounded-lg ${isSessionActive ? 'futuristic-button' : 'bg-gray-700 text-gray-400 cursor-not-allowed'}`}
                  disabled={!isSessionActive}
                  title={!isSessionActive ? 'Establece un capital para registrar operaciones' : ''}
                >
                  + Registrar Operación
                </button>
                <button 
                  onClick={handleEndSession}
                  className={`font-bold py-2 px-4 rounded-lg ${isSessionActive ? 'futuristic-button-red' : 'bg-gray-700 text-gray-400 cursor-not-allowed'}`}
                  disabled={!isSessionActive}
                  title={!isSessionActive ? 'No hay sesión activa' : ''}
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

  const sessionTrades = trades.filter(t => sessionStartTime && new Date(t.id).getTime() >= sessionStartTime);

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
        <DashboardHeader viewTitle={activeView} />
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
      
      {isReviewModalOpen && initialBalance && currentBalance && (
        <SessionReviewModal
          isOpen={isReviewModalOpen}
          onClose={handleCloseReviewAndReset}
          sessionTrades={sessionTrades}
          initialBalance={initialBalance}
          finalBalance={currentBalance}
          tradingPlan={tradingPlan}
        />
      )}
    </div>
  );
};

export default App;