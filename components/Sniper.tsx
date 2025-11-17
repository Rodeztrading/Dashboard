import React, { useState, useEffect, useMemo } from 'react';
import type { VisualTrade } from '../types';
import BalanceManager from './BalanceManager';
import TradeHistory from './TradeHistory';
import Calendar from './Calendar';


// --- ImageViewer with Stats Overlay ---
interface ImageViewerProps {
  trades: VisualTrade[];
  startIndex: number;
  onClose: () => void;
}

const ImageViewer: React.FC<ImageViewerProps> = ({ trades, startIndex, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(startIndex);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        setCurrentIndex(prev => (prev + 1) % trades.length);
      } else if (e.key === 'ArrowLeft') {
        setCurrentIndex(prev => (prev - 1 + trades.length) % trades.length);
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [trades.length, onClose]);

  const selectedTrade = trades[currentIndex];

  if (!selectedTrade) return null;

  const profitOrLoss = selectedTrade.outcome === 'WIN' 
    ? selectedTrade.amountInvested * (selectedTrade.payout / 100)
    : -selectedTrade.amountInvested;

  const navigate = (direction: 'next' | 'prev') => {
    if (direction === 'next') {
        setCurrentIndex(prev => (prev + 1) % trades.length);
    } else {
        setCurrentIndex(prev => (prev - 1 + trades.length) % trades.length);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="relative w-full max-w-6xl h-full max-h-[90vh] flex flex-col items-center justify-center" 
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-white bg-red-600 rounded-full w-8 h-8 flex items-center justify-center z-20 text-xl font-bold hover:bg-red-500 transition-colors"
          aria-label="Cerrar visor de imagen"
        >
          &times;
        </button>
        
        {trades.length > 1 && (
            <>
                <button onClick={() => navigate('prev')} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 p-2 rounded-full z-10 text-white">&lt;</button>
                <button onClick={() => navigate('next')} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 p-2 rounded-full z-10 text-white">&gt;</button>
            </>
        )}
        
        <div className="absolute top-4 text-white bg-black/50 px-2 py-1 rounded-md text-sm">
            {currentIndex + 1} / {trades.length}
        </div>

        <div className="flex-grow flex items-center justify-center w-full overflow-hidden" style={{ height: 'calc(100% - 120px)' }}>
          <img
            src={`data:${selectedTrade.tradeImage.mimeType};base64,${selectedTrade.tradeImage.base64}`}
            alt={`Trade ${selectedTrade.id}`}
            className="w-auto h-auto max-w-full max-h-full object-contain rounded-lg"
          />
        </div>
        
        <div className="absolute bottom-4 left-4 right-4 bg-black/60 p-3 rounded-lg text-white grid grid-cols-2 md:grid-cols-4 gap-2 text-center text-sm md:text-base">
            <div>
                <p className="text-xs uppercase text-gray-400">Acción</p>
                <p className={`font-bold ${selectedTrade.userAction === 'CALL' ? 'text-cyan' : 'text-magenta'}`}>{selectedTrade.userAction}</p>
            </div>
            <div>
                <p className="text-xs uppercase text-gray-400">Resultado</p>
                <p className={`font-bold ${selectedTrade.outcome === 'WIN' ? 'text-cyan' : 'text-magenta'}`}>{selectedTrade.outcome}</p>
            </div>
            <div>
                <p className="text-xs uppercase text-gray-400">Invertido</p>
                <p className="font-bold">${selectedTrade.amountInvested.toFixed(2)} @ {selectedTrade.payout}%</p>
            </div>
            <div>
                <p className="text-xs uppercase text-gray-400">P/L</p>
                <p className={`font-bold ${profitOrLoss >= 0 ? 'text-cyan' : 'text-magenta'}`}>{profitOrLoss >= 0 ? '+' : ''}${profitOrLoss.toFixed(2)}</p>
            </div>
        </div>
      </div>
    </div>
  );
};

interface SniperProps {
  trades: VisualTrade[];
  initialBalance: number | null;
  currentBalance: number | null;
  onSetBalance: (balance: number) => void;
  isSessionActive: boolean;
  onEndSession: () => void;
  onOpenTradeModal: () => void;
  selectedDate: Date | null;
  onDateSelect: (date: Date | null) => void;
  onClearFilter: () => void;
  sessionStartTime: number | null;
  theme: string;
}

const Sniper: React.FC<SniperProps> = (props) => {
  const { trades, initialBalance, currentBalance, onSetBalance, isSessionActive, onEndSession, onOpenTradeModal, selectedDate, onDateSelect, onClearFilter, theme } = props;
  
  const [viewingTradesInfo, setViewingTradesInfo] = useState<{ trades: VisualTrade[]; startIndex: number; } | null>(null);
  const [activeFilterId, setActiveFilterId] = useState<string>('call'); 
  
  // Automatic trade grouping
  const callWinTrades = useMemo(() => trades.filter(t => t.userAction === 'CALL' && t.outcome === 'WIN'), [trades]);
  const putWinTrades = useMemo(() => trades.filter(t => t.userAction === 'PUT' && t.outcome === 'WIN'), [trades]);
  const lossTrades = useMemo(() => trades.filter(t => t.outcome === 'LOSS'), [trades]);

  const filteredPatternTrades = useMemo(() => {
    switch (activeFilterId) {
      case 'put':
        return putWinTrades;
      case 'improve':
        return lossTrades;
      case 'call':
      default:
        return callWinTrades;
    }
  }, [activeFilterId, callWinTrades, putWinTrades, lossTrades]);
  
  const handleViewImage = (trades: VisualTrade[], startIndex: number) => {
    setViewingTradesInfo({ trades, startIndex });
  };
  
  const handleViewFromHistory = (trade: VisualTrade, index: number, tradeList: VisualTrade[]) => {
    setViewingTradesInfo({ trades: tradeList, startIndex: index });
  };

  const renderTradeThumbnail = (trade: VisualTrade, onClick: () => void) => (
    <div
      key={trade.id}
      className="group relative cursor-pointer aspect-video"
      onClick={onClick}
    >
      <img
        src={`data:${trade.tradeImage.mimeType};base64,${trade.tradeImage.base64}`}
        alt={`Trade ${trade.id}`}
        className="w-full h-full object-cover rounded-lg border-2 border-transparent group-hover:border-cyan transition-all duration-300"
      />
      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center rounded-lg">
        <p className="text-white font-bold text-lg uppercase tracking-wider">Ver</p>
      </div>
    </div>
  );
  
  const FilterButton: React.FC<{id: string, label: string, count: number}> = ({ id, label, count }) => {
    const isActive = activeFilterId === id;
    return (
      <button 
        onClick={() => setActiveFilterId(id)}
        className={`px-3 py-1 text-sm rounded-full transition-colors ${isActive ? 'bg-cyan text-background-dark font-bold' : 'bg-slate-700 hover:bg-slate-600'}`}
      >
        {label} <span className="text-xs opacity-70">{count}</span>
      </button>
    );
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Session Controls */}
      <div className="flex flex-col gap-4">
        <BalanceManager 
            initialBalance={initialBalance}
            currentBalance={currentBalance}
            onSetBalance={onSetBalance}
        />
        <div className="futuristic-panel p-4 flex flex-col justify-center">
            <h3 className="text-lg font-bold uppercase">Consola de Operaciones</h3>
            <p className="text-text-secondary mt-1 text-sm mb-4">Registra una nueva operación o termina la sesión.</p>
            <div className="flex flex-col sm:flex-row gap-3">
                <button
                    onClick={onOpenTradeModal}
                    className={`font-bold py-2.5 px-4 rounded-md transition-all text-sm flex-1 bg-transparent border border-cyan-400 hover:bg-cyan-400 hover:text-white ${
                        !isSessionActive
                            ? 'bg-gray-600 text-gray-400 cursor-not-allowed border-gray-600'
                            : theme === 'casual' ? 'text-black' : 'text-white'
                    }`}
                    disabled={!isSessionActive}
                >
                    + Registrar Operación
                </button>
                <button
                    onClick={onEndSession}
                    className={`font-bold py-2.5 px-4 rounded-md transition-all text-sm flex-1 ${
                        !isSessionActive
                            ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                            : 'bg-red-600 hover:bg-red-700 text-white'
                    }`}
                    disabled={!isSessionActive}
                >
                    Terminar Sesión
                </button>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left Column: Calendar and History */}
        <div className="flex flex-col gap-4">
            <Calendar trades={trades} selectedDate={selectedDate} onDateSelect={onDateSelect} />
            <div className="flex-grow">
                <TradeHistory 
                  trades={trades} 
                  selectedDate={selectedDate} 
                  onClearFilter={onClearFilter} 
                  onViewTrade={handleViewFromHistory}
                />
            </div>
        </div>

        {/* Right Column: Sniper Pattern Organizer */}
        <div className="flex flex-col gap-4">
          <div className="futuristic-panel flex-shrink-0">
             <h2 className="text-xl font-bold text-glow-cyan uppercase">Organizador de Patrones</h2>
             <p className="text-sm text-text-secondary mb-3">Las operaciones se clasifican automáticamente. Filtra para analizar tus patrones.</p>
             <div className="flex flex-wrap items-center gap-2 border-t border-border-color pt-3">
                <span className="text-sm font-bold mr-2">Filtrar:</span>
                <FilterButton id="call" label="Call" count={callWinTrades.length} />
                <FilterButton id="put" label="Put" count={putWinTrades.length} />
                <FilterButton id="improve" label="Mejorar" count={lossTrades.length} />
             </div>
          </div>
          <div className="futuristic-panel pr-2">
            {filteredPatternTrades.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {filteredPatternTrades.map((trade, index) => renderTradeThumbnail(
                    trade, 
                    () => handleViewImage(filteredPatternTrades, index)
                  ))}
                </div>
            ) : (
                <div className="flex items-center justify-center h-full">
                    <p className="text-center text-text-secondary py-4">No hay operaciones que coincidan con este filtro.</p>
                </div>
            )}
          </div>
        </div>
      </div>

      {/* Viewer Modal */}
      {viewingTradesInfo && (
        <ImageViewer 
          trades={viewingTradesInfo.trades}
          startIndex={viewingTradesInfo.startIndex}
          onClose={() => setViewingTradesInfo(null)}
        />
      )}
    </div>
  );
};

export default Sniper;