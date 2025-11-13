import React from 'react';
import type { VisualTrade } from '../types';

interface SessionReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionTrades: VisualTrade[];
  initialBalance: number;
  finalBalance: number;
  tradingPlan: string;
}

const SessionReviewModal: React.FC<SessionReviewModalProps> = ({
  isOpen,
  onClose,
  sessionTrades,
  initialBalance,
  finalBalance,
  tradingPlan
}) => {
  if (!isOpen) return null;

  const profitLoss = finalBalance - initialBalance;
  const profitLossPercentage = initialBalance > 0 ? (profitLoss / initialBalance) * 100 : 0;
  const wins = sessionTrades.filter(t => t.outcome === 'WIN').length;
  const losses = sessionTrades.filter(t => t.outcome === 'LOSS').length;
  const winRate = sessionTrades.length > 0 ? (wins / sessionTrades.length) * 100 : 0;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="futuristic-panel max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-border-color pb-4">
            <h2 className="text-2xl font-bold text-glow-cyan uppercase">Resumen de Sesión</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors text-2xl"
            >
              ×
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-background-dark/50 p-4 border border-border-color rounded-lg text-center">
              <p className="text-sm text-text-secondary uppercase">Capital Inicial</p>
              <p className="text-2xl font-bold">${initialBalance.toFixed(2)}</p>
            </div>
            <div className="bg-background-dark/50 p-4 border border-border-color rounded-lg text-center">
              <p className="text-sm text-text-secondary uppercase">Capital Final</p>
              <p className="text-2xl font-bold text-glow-cyan">${finalBalance.toFixed(2)}</p>
            </div>
            <div className="bg-background-dark/50 p-4 border border-border-color rounded-lg text-center">
              <p className="text-sm text-text-secondary uppercase">P/L Total</p>
              <p className={`text-2xl font-bold ${profitLoss >= 0 ? 'text-glow-cyan' : 'text-glow-magenta'}`}>
                {profitLoss >= 0 ? '+' : ''}${profitLoss.toFixed(2)} ({profitLossPercentage.toFixed(2)}%)
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-background-dark/50 p-4 border border-border-color rounded-lg text-center">
              <p className="text-sm text-text-secondary uppercase">Total Operaciones</p>
              <p className="text-2xl font-bold">{sessionTrades.length}</p>
            </div>
            <div className="bg-background-dark/50 p-4 border border-border-color rounded-lg text-center">
              <p className="text-sm text-text-secondary uppercase">Victorias</p>
              <p className="text-2xl font-bold text-glow-cyan">{wins}</p>
            </div>
            <div className="bg-background-dark/50 p-4 border border-border-color rounded-lg text-center">
              <p className="text-sm text-text-secondary uppercase">Win Rate</p>
              <p className="text-2xl font-bold text-glow-cyan">{winRate.toFixed(1)}%</p>
            </div>
          </div>

          {tradingPlan && (
            <div className="bg-background-dark/50 p-4 border border-border-color rounded-lg">
              <h3 className="text-lg font-bold text-glow-cyan uppercase mb-2">Plan de Trading</h3>
              <p className="text-text-secondary whitespace-pre-wrap">{tradingPlan}</p>
            </div>
          )}

          <div className="bg-background-dark/50 p-4 border border-border-color rounded-lg">
            <h3 className="text-lg font-bold text-glow-cyan uppercase mb-2">Análisis de IA</h3>
            <p className="text-text-secondary">
              {profitLoss >= 0 
                ? `¡Excelente sesión! Lograste un rendimiento positivo de ${profitLossPercentage.toFixed(2)}% con un win rate de ${winRate.toFixed(1)}%. Continúa siguiendo tu plan de trading y mantén la disciplina.`
                : `Sesión con pérdidas de ${Math.abs(profitLossPercentage).toFixed(2)}%. Revisa tu plan de trading y analiza qué operaciones no siguieron tu estrategia. El win rate de ${winRate.toFixed(1)}% sugiere ${winRate < 50 ? 'revisar tu análisis de entrada' : 'mejorar tu gestión de riesgo'}.`
              }
            </p>
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="futuristic-button font-bold py-2 px-6 rounded-lg"
            >
              Cerrar y Finalizar Sesión
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionReviewModal;
