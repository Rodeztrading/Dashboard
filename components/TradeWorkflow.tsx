import React, { useState } from 'react';
import ImageUploader from './ImageUploader';
import type { VisualTrade } from '../types';

interface TradeWorkflowProps {
  onSaveTrade: (trade: Omit<VisualTrade, 'id' | 'createdAt'>) => void;
  isSessionActive: boolean;
  onClose: () => void;
}

type WorkflowStep = 'upload' | 'details';

const TradeWorkflow: React.FC<TradeWorkflowProps> = ({ onSaveTrade, isSessionActive, onClose }) => {
  const [step, setStep] = useState<WorkflowStep>('upload');
  const [tradeImage, setTradeImage] = useState<{ base64: string; mimeType: string } | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [isAnalysisComplete, setIsAnalysisComplete] = useState<boolean>(false);
  const [userAction, setUserAction] = useState<'CALL' | 'PUT' | null>(null);
  const [outcome, setOutcome] = useState<'WIN' | 'LOSS' | null>(null);
  const [amountInvested, setAmountInvested] = useState<string>('');
  const [payout, setPayout] = useState<string>('');

  const isDisabled = !isSessionActive;

  const handleImageUpload = (base64: string, mimeType: string, dataUrl: string) => {
    setTradeImage({ base64, mimeType });
    setImagePreviewUrl(dataUrl);
    setStep('details'); // Skip analysis step
  };

  const handleAnalysisComplete = (analysis: string) => {
    setAiAnalysis(analysis);
    setIsAnalysisComplete(true);
  };

  const handleSave = () => {
    if (!tradeImage || !userAction || !outcome || !amountInvested || !payout) return;

    const newTrade: Omit<VisualTrade, 'id' | 'createdAt'> = {
      tradeImage,
      userAction,
      outcome,
      amountInvested: parseFloat(amountInvested),
      payout: parseFloat(payout),
      aiAnalysis,
    };

    onSaveTrade(newTrade);
    resetWorkflow();
  };

  const resetWorkflow = () => {
    setStep('upload');
    setTradeImage(null);
    setImagePreviewUrl(null);
    setAiAnalysis('');
    setIsAnalysisComplete(false);
    setUserAction(null);
    setOutcome(null);
    setAmountInvested('');
    setPayout('');
  };
  
  const handleCancel = () => {
    resetWorkflow();
    onClose();
  };

  if (isDisabled) {
    return (
      <div className="futuristic-panel text-center text-gray-500">
        <h2 className="text-xl font-bold text-cyan mb-4 uppercase">Consola de Operaciones</h2>
        <p>Capital requerido para iniciar.</p>
      </div>
    );
  }

  const isFormComplete = userAction && outcome && amountInvested && payout;

  const renderContent = () => {
    switch (step) {
      case 'upload':
        return (
          <>
            <h3 className="text-lg font-semibold mb-4 text-cyan">1. CARGAR GRÁFICO</h3>
            <div className="flex justify-center items-center py-8">
              <div className="w-full max-w-md">
                <ImageUploader onImageUpload={handleImageUpload} />
              </div>
            </div>
          </>
        );
      case 'details':
        return (
          <div className="grid grid-cols-1 gap-6">
            {/* Detalles de la Operación */}
            <div className="flex flex-col h-full space-y-4">
              <div className="w-full h-48 rounded-lg flex items-center justify-center border-2 border-solid border-cyan/30 p-1 mb-4">
                {imagePreviewUrl && <img src={imagePreviewUrl} alt="Preview" className="max-h-full max-w-full rounded-lg object-contain" />}
              </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-cyan">Acción</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setUserAction('CALL')}
                      className={`w-full futuristic-button font-bold py-2 px-4 rounded-lg ${userAction === 'CALL' ? 'active' : ''}`}
                    >
                      CALL
                    </button>
                    <button
                      onClick={() => setUserAction('PUT')}
                      className={`w-full futuristic-button-red font-bold py-2 px-4 rounded-lg ${userAction === 'PUT' ? 'active' : ''}`}
                    >
                      PUT
                    </button>
                  </div>
                </div>
  
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-cyan">Finanzas</h3>
                  <div className="space-y-3">
                    <input type="number" value={amountInvested} onChange={(e) => setAmountInvested(e.target.value)} placeholder="Monto Invertido ($)" className="futuristic-input w-full rounded-md p-2" required min="0.01" step="0.01" />
                    <input type="number" value={payout} onChange={(e) => setPayout(e.target.value)} placeholder="Payout (%) Ej: 85" className="futuristic-input w-full rounded-md p-2" required min="1" max="500" step="1" />
                  </div>
                </div>
  
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-cyan">Resultado</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => setOutcome('WIN')} className={`w-full futuristic-button font-bold py-2 px-4 rounded-lg ${outcome === 'WIN' ? 'active' : ''}`}>VICTORIA</button>
                    <button onClick={() => setOutcome('LOSS')} className={`w-full futuristic-button-red font-bold py-2 px-4 rounded-lg ${outcome === 'LOSS' ? 'active' : ''}`}>PÉRDIDA</button>
                  </div>
                </div>
  
                <button
                  onClick={handleSave}
                  disabled={!isFormComplete}
                  className="w-full bg-slate-700 text-slate-400 border border-slate-600 font-bold py-3 px-6 rounded-lg mt-auto enabled:futuristic-button enabled:text-cyan enabled:border-cyan"
                >
                  Guardar Operación
                </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="futuristic-panel">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-glow-cyan uppercase">Registrar Operación</h2>
        <button onClick={handleCancel} className="text-sm text-gray-400 hover:text-white underline">
          Cerrar
        </button>
      </div>
      <div className="w-full h-px bg-cyan/50 my-3"></div>
      {renderContent()}
    </div>
  );
};

export default TradeWorkflow;