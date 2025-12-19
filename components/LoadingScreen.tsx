import React from 'react';
import { Target } from 'lucide-react';

export const LoadingScreen: React.FC = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center">
            <div className="text-center">
                <div className="w-64 h-64 md:w-80 md:h-80 mx-auto mb-6">
                    <img src="/logo_rodez.png" alt="RODEZ Logo" className="w-full h-full object-contain" />
                </div>
                <p className="text-gray-400 mt-4">Cargando...</p>
            </div>
        </div>
    );
};
