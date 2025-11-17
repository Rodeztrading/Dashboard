import { GoogleGenAI } from '@google/genai';
import React, { useState, useEffect } from 'react';
import MarkdownRenderer from './MarkdownRenderer';

interface GeminiAnalysisProps {
  tradeImage: {
    base64: string;
    mimeType: string;
  };
  onAnalysisComplete: (analysis: string) => void;
}

const LoadingSpinner: React.FC = () => (
    <div className="flex items-center justify-center space-x-2">
      <div className="w-3 h-3 rounded-full bg-cyan animate-pulse" style={{ animationDelay: '0s' }}></div>
      <div className="w-3 h-3 rounded-full bg-cyan animate-pulse" style={{ animationDelay: '0.2s' }}></div>
      <div className="w-3 h-3 rounded-full bg-cyan animate-pulse" style={{ animationDelay: '0.4s' }}></div>
      <p className="text-text-secondary">Analizando gráfico...</p>
    </div>
);

const GeminiAnalysis: React.FC<GeminiAnalysisProps> = ({ tradeImage, onAnalysisComplete }) => {
  const [analysis, setAnalysis] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const runAnalysis = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
        
        const imagePart = {
          inlineData: {
            data: tradeImage.base64,
            mimeType: tradeImage.mimeType,
          },
        };
        
        const prompt = `Actúa como un analista técnico experto en trading de opciones binarias de 1 minuto. Tu única tarea es analizar la imagen del gráfico proporcionada. Concéntrate en identificar patrones de velas envolventes (alcistas o bajistas) que indiquen una posible entrada.
        
        Tu análisis debe ser conciso y seguir este formato Markdown:
        
        ### Análisis Pre-Operación
        *   **Patrón Detectado:** (Describe el patrón de vela envolvente encontrado. Si no hay ninguno, indica "Ningún patrón de vela envolvente claro". Menciona si es alcista o bajista).
        *   **Contexto del Mercado:** (Describe brevemente la tendencia general visible en el gráfico: alcista, bajista o lateral).
        *   **Confirmación Adicional:** (Sugiere qué buscarías como confirmación, por ejemplo, volumen, un nivel de soporte/resistencia cercano, etc.).
        *   **Conclusión:** (Ofrece una conclusión breve sobre la viabilidad de una operación basada en el patrón).
        
        Sé directo y enfócate en la acción. No incluyas advertencias de riesgo.`;

        const response = await ai.models.generateContent({
            model: 'gemini-flash-latest',
            contents: { parts: [{ text: prompt }, imagePart] },
        });

        const resultText = response.text;
        setAnalysis(resultText);
        onAnalysisComplete(resultText);

      } catch (e) {
        console.error(e);
        const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
        setError(`Error al analizar la imagen: ${errorMessage}`);
      } finally {
        setIsLoading(false);
      }
    };

    runAnalysis();
  }, [tradeImage, onAnalysisComplete]);

  return (
    <div className="space-y-4 p-4 bg-background-dark/50 rounded-lg border border-border-color h-full flex flex-col">
      <h3 className="text-lg font-semibold text-cyan text-center uppercase">Análisis del Observador IA</h3>
      <div className="flex-grow overflow-y-auto pr-2">
        {isLoading && <div className="flex items-center justify-center h-full"><LoadingSpinner /></div>}
        {error && <p className="text-red-500 text-center">{error}</p>}
        {!isLoading && !error && <MarkdownRenderer content={analysis} />}
      </div>
    </div>
  );
};

export default GeminiAnalysis;
