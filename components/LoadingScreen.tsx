import React from 'react';
import { Target } from 'lucide-react';

export const LoadingScreen: React.FC = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center">
            <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-sniper-blue rounded-2xl mb-6 shadow-lg shadow-blue-900/50 animate-pulse">
                    <Target className="w-12 h-12 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-4">
                    SNIPER<span className="text-sniper-blue">.PRO</span>
                </h1>
                <div className="flex items-center justify-center space-x-2">
                    <div className="w-2 h-2 bg-sniper-blue rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-sniper-blue rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-sniper-blue rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
                <p className="text-gray-400 mt-4">Cargando...</p>
            </div>
        </div>
    );
};
