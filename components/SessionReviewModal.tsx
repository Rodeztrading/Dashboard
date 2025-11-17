import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import MarkdownRenderer from './MarkdownRenderer';
import type { VisualTrade } from '../types';

interface SessionReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionTrades: VisualTrade[];
  initialBalance: number;
  finalBalance: number;
  tradingPlan: string;
}

const LoadingSpinner: React.FC = () => (
  <div className="flex items-center justify-center space-x-2">
    <div className="w-4 h-4 rounded-full bg-cyan animate-pulse" style={{ animationDelay: '0s' }}></div>
    <div className="w-4 h-4 rounded-full bg-cyan animate-pulse" style={{ animationDelay: '0.2s' }}></div>
    <div className="w-4 h-4 rounded-full bg-cyan animate-pulse" style={{ animationDelay: '0.4s' }}></div>
    <p className="text-text-secondary ml-2">Tu coach de IA está analizando la sesión...</p>
  </div>
);

const SessionReviewModal: React.FC<SessionReviewModalProps> = ({
  isOpen,
  onClose,
  sessionTrades,
  initialBalance,
  finalBalance,
  tradingPlan,
}) => {
  const [analysis, setAnalysis] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const runAnalysis = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

        const prompt = `
          Actúa como un coach de trading profesional y analista de rendimiento. Tu tarea es analizar la sesión de trading que te proporcionaré y dar una retroalimentación constructiva y educativa.

          Aquí está el plan de trading del usuario:
          ---
          ${tradingPlan || "El usuario no definió un plan de trading."}
          ---

          Aquí están los datos de la sesión:
          *   Capital Inicial: $${initialBalance.toFixed(2)}
          *   Capital Final: $${finalBalance.toFixed(2)}
          *   P/L Total: $${(finalBalance - initialBalance).toFixed(2)}
          *   Total de Operaciones: ${sessionTrades.length}

          Y aquí está el detalle de cada operación:
          ${sessionTrades.map((trade, index) => `
          ---
          Operación #${index + 1}:
          - Acción: ${trade.userAction}
          - Resultado: ${trade.outcome}
          - P/L: ${trade.outcome === 'WIN' ? `+$${(trade.amountInvested * (trade.payout / 100)).toFixed(2)}` : `-$${trade.amountInvested.toFixed(2)}`}
          - Análisis IA Pre-operación: ${trade.aiAnalysis ? `"${trade.aiAnalysis.replace(/\n/g, ' ')}"` : "N/A"}
          `).join('')}
          ---

          Basado en TODA esta información, proporciona un análisis de la sesión en formato Markdown. Tu análisis debe ser objetivo, directo y útil para un trader que busca mejorar. Estructura tu respuesta de la siguiente manera:

          ### Resumen de Rendimiento
          *   (Comenta brevemente el resultado general de la sesión en términos de P/L, porcentaje de ganancia/pérdida sobre el capital inicial y win-rate).

          ### Aciertos de la Sesión
          *   (Identifica 2-3 cosas que el trader hizo bien. ¿Siguió su plan? ¿Tomó operaciones con buen análisis previo? ¿Gestionó bien el riesgo? Sé específico y usa ejemplos de las operaciones si es posible).

          ### Áreas de Mejora
          *   (Identifica 2-3 áreas donde el trader puede mejorar. ¿Hubo operaciones impulsivas o de "venganza"? ¿Se desvió del plan? ¿Ignoró el análisis de la IA en momentos clave? Ofrece consejos prácticos y claros).

          ### Conclusión y Siguiente Paso
          *   (Resume la sesión en una frase y ofrece una recomendación CLAVE y ACCIONABLE para la próxima sesión de trading).
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
        });

        const resultText = response.text;
        setAnalysis(resultText);

      } catch (e) {
        console.error(e);
        const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
        setError(`Error al generar el análisis de la sesión: ${errorMessage}`);
      } finally {
        setIsLoading(false);
      }
    };

    runAnalysis();
  }, [isOpen, sessionTrades, initialBalance, finalBalance, tradingPlan]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-3xl h-full max-h-[90vh] flex flex-col rounded-lg futuristic-panel">
        <div className="flex justify-between items-center mb-3 flex-shrink-0">
          <h2 className="text-xl font-bold text-glow-cyan uppercase">Revisión de la Sesión por IA</h2>
        </div>
        <div className="w-full h-px bg-cyan/50 mb-4"></div>
        <div className="flex-grow overflow-y-auto pr-2">
          {isLoading && <div className="flex items-center justify-center h-full"><LoadingSpinner /></div>}
          {error && <p className="text-red-500 text-center">{error}</p>}
          {!isLoading && !error && <MarkdownRenderer content={analysis} />}
        </div>
        <div className="mt-4 pt-4 border-t border-border-color flex-shrink-0">
          <button onClick={onClose} className="w-full futuristic-button font-bold py-3 px-6 rounded-lg">
            Cerrar y Reiniciar Sesión
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionReviewModal;
