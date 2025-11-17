
import React from 'react';
import type { VisualTrade } from '../types';
import MarkdownRenderer from './MarkdownRenderer';

interface TradeHistoryProps {
  trades: VisualTrade[];
  selectedDate: Date | null;
  onClearFilter: () => void;
  onViewTrade: (trade: VisualTrade, index: number, tradeList: VisualTrade[]) => void;
}

const TradeHistory: React.FC<TradeHistoryProps> = ({ trades, selectedDate, onClearFilter, onViewTrade }) => {

  const filteredTrades = React.useMemo(() => {
    if (!selectedDate) return trades;
    return trades.filter(trade => {
      const tradeDate = new Date(trade.createdAt);
      return tradeDate.toDateString() === selectedDate.toDateString();
    });
  }, [trades, selectedDate]);

  const tradeList = filteredTrades.map((trade, index) => {
    const profitOrLoss = trade.outcome === 'WIN' 
        ? trade.amountInvested * (trade.payout / 100)
        : -trade.amountInvested;
    const originalIndex = trades.findIndex(t => t.id === trade.id);

    return (
      <div 
        key={trade.id} 
        className="futuristic-panel p-3 transition-all duration-300 hover:border-cyan hover:bg-cyan/5 cursor-pointer"
        onClick={() => onViewTrade(trade, index, filteredTrades)}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-start">
          <div className="space-y-2">
            <h3 className="font-bold text-center mb-1 text-glow-cyan text-sm">OPERACIÓN #{originalIndex + 1}</h3>
            <img src={`data:${trade.tradeImage.mimeType};base64,${trade.tradeImage.base64}`} alt="Trade" className="rounded-lg border-2 border-cyan/20" />
          </div>
          <div className="space-y-2">
            <div className="text-center font-bold text-base bg-background-dark/50 p-2 rounded-md border border-cyan/20">
                <p>Acción: <span className={trade.userAction === 'CALL' ? 'text-cyan' : 'text-magenta'}>{trade.userAction}</span></p>
                <p>Resultado: <span className={trade.outcome === 'WIN' ? 'text-cyan' : 'text-magenta'}>{trade.outcome === 'WIN' ? 'VICTORIA' : 'PÉRDIDA'}</span></p>
                <p className="text-xs mt-2 text-gray-400">Invertido: ${trade.amountInvested.toFixed(2)} @ {trade.payout}%</p>
                <p className="text-sm mt-1">P/L: <span className={profitOrLoss >= 0 ? 'text-cyan' : 'text-magenta'}>{profitOrLoss >= 0 ? '+' : ''}${profitOrLoss.toFixed(2)}</span></p>
            </div>
            {trade.aiAnalysis && (
              <div className="bg-background-dark/50 p-2 rounded-md border border-cyan/20 text-xs">
                <h4 className="font-bold text-cyan mb-1">Análisis del Observador IA</h4>
                <MarkdownRenderer content={trade.aiAnalysis} />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }).reverse(); 

  const getEmptyStateMessage = () => {
    if (selectedDate && trades.length > 0) {
      return `No se encontraron operaciones para el ${selectedDate.toLocaleDateString('es-ES')}.`;
    }
    return "Aún no hay operaciones registradas.";
  };

  return (
    <div className="futuristic-panel">
      <div className="flex justify-between items-center mb-4 border-b-2 border-cyan/50 pb-2">
        <h2 className="text-xl font-bold text-glow-cyan uppercase">Historial</h2>
        {selectedDate && (
          <button onClick={onClearFilter} className="text-sm text-cyan hover:text-white underline">
            Mostrar Todas
          </button>
        )}
      </div>
      {tradeList.length === 0 ? (
        <p className="text-gray-500 text-center py-8">{getEmptyStateMessage()}</p>
      ) : (
        <div className="space-y-4 max-h-[800px] overflow-y-auto pr-2">
          {tradeList}
        </div>
      )}
    </div>
  );
};

export default TradeHistory;
