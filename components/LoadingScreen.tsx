import React from 'react';
import { Target } from 'lucide-react';

export const LoadingScreen: React.FC = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center">
            <div className="text-center">
                <div className="w-32 h-32 mx-auto mb-6">
                    <img src="/logo_rodez.png" alt="RODEZ Logo" className="w-full h-full object-contain" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-4 tracking-[0.2em]">
                    RODEZ
                </h1>
                <div className="flex items-center justify-center space-x-2">
                    <div className="w-2 h-2 bg-rodez-red rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-rodez-red rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-rodez-red rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
                <p className="text-gray-400 mt-4">Cargando...</p>
            </div>
        </div>
    );
};
