import React from 'react';
import type { VisualTrade } from '../types';
import MarkdownRenderer from './MarkdownRenderer';

interface TradeDetailModalProps {
  trade: VisualTrade;
  onClose: () => void;
}

const TradeDetailModal: React.FC<TradeDetailModalProps> = ({ trade, onClose }) => {
  const profitOrLoss = trade.outcome === 'WIN' 
    ? trade.amountInvested * (trade.payout / 100)
    : -trade.amountInvested;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-lg futuristic-panel" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-bold text-glow-cyan uppercase">Detalle de Operación</h2>
          <button onClick={onClose} className="text-sm text-gray-400 hover:text-white underline">
            Cerrar
          </button>
        </div>
        <div className="w-full h-px bg-cyan/50 mb-4"></div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column: Image and Stats */}
          <div className="space-y-4">
            <img 
              src={`data:${trade.tradeImage.mimeType};base64,${trade.tradeImage.base64}`} 
              alt="Trade Chart" 
              className="rounded-lg border-2 border-cyan/20 w-full" 
            />
            <div className="text-center font-bold text-base bg-background-dark/50 p-4 rounded-md border border-cyan/20 grid grid-cols-2 gap-4">
                <div>
                    <p className="text-sm text-gray-400 uppercase">Acción</p>
                    <p className={`text-xl ${trade.userAction === 'CALL' ? 'text-cyan' : 'text-magenta'}`}>{trade.userAction}</p>
                </div>
                <div>
                    <p className="text-sm text-gray-400 uppercase">Resultado</p>
                    <p className={`text-xl ${trade.outcome === 'WIN' ? 'text-cyan' : 'text-magenta'}`}>{trade.outcome === 'WIN' ? 'VICTORIA' : 'PÉRDIDA'}</p>
                </div>
                <div>
                    <p className="text-sm text-gray-400 uppercase">Invertido</p>
                    <p className="text-xl">${trade.amountInvested.toFixed(2)} @ {trade.payout}%</p>
                </div>
                <div>
                    <p className="text-sm text-gray-400 uppercase">P/L</p>
                    <p className={`text-xl ${profitOrLoss >= 0 ? 'text-glow-cyan' : 'text-glow-magenta'}`}>{profitOrLoss >= 0 ? '+' : ''}${profitOrLoss.toFixed(2)}</p>
                </div>
            </div>
          </div>
          
          {/* Right Column: AI Analysis */}
          <div className="bg-background-dark/50 p-4 rounded-md border border-cyan/20 flex flex-col h-full">
            <h3 className="text-lg font-bold text-cyan mb-2 text-center uppercase">Análisis del Observador IA</h3>
            <div className="overflow-y-auto pr-2 flex-grow">
              {trade.aiAnalysis ? (
                <MarkdownRenderer content={trade.aiAnalysis} />
              ) : (
                <p className="text-text-secondary text-center">No hay análisis disponible para esta operación.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradeDetailModal;
