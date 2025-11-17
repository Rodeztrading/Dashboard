
import React, { useRef, useState, useEffect } from 'react';
import { updateProfile } from 'firebase/auth';
import { auth } from '../services/firebase';
import type { VisualTrade } from '../types';

interface SettingsProps {
    tradingPlan: string;
    onTradingPlanChange: (notes: string) => void;
    onExportData: () => void;
    onImportData: (data: { trades: VisualTrade[], tradingPlan: string }) => void;
    theme?: string;
    onThemeChange?: (theme: string) => void;
}

const Settings: React.FC<SettingsProps> = ({ tradingPlan, onTradingPlanChange, onExportData, onImportData, theme = 'futuristic', onThemeChange }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [displayName, setDisplayName] = useState(auth.currentUser?.displayName || '');
    const [isUpdatingName, setIsUpdatingName] = useState(false);
    const [selectedTheme, setSelectedTheme] = useState(theme);

    // Update displayName when user changes
    React.useEffect(() => {
        setDisplayName(auth.currentUser?.displayName || '');
    }, [auth.currentUser?.displayName]);

    const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onTradingPlanChange(e.target.value);
    };
    
    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result;
                if (typeof text === 'string') {
                    const data = JSON.parse(text);
                    onImportData(data);
                }
            } catch (error) {
                console.error("Error parsing imported file:", error);
                alert("Error al leer el archivo. Asegúrate de que es un archivo de respaldo válido.");
            }
        };
        reader.readAsText(file);
        // Reset file input to allow importing the same file again
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleUpdateDisplayName = async () => {
        if (!auth.currentUser || !displayName.trim()) return;

        setIsUpdatingName(true);
        try {
            await updateProfile(auth.currentUser, {
                displayName: displayName.trim()
            });
            alert('Nombre de usuario actualizado exitosamente.');
        } catch (error) {
            console.error('Error updating display name:', error);
            alert('Error al actualizar el nombre de usuario.');
        } finally {
            setIsUpdatingName(false);
        }
    };

    const handleThemeChange = (newTheme: string) => {
        setSelectedTheme(newTheme);
        onThemeChange?.(newTheme);
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 h-full">
            <div className="futuristic-panel p-4 h-full flex flex-col">
                <h3 className="text-lg font-bold text-glow-cyan mb-2 uppercase">Plan de Trading</h3>
                <p className="text-sm text-text-secondary mb-4">
                    Tus notas se guardan automáticamente en este dispositivo.
                </p>
                <textarea
                    value={tradingPlan}
                    onChange={handleNotesChange}
                    placeholder="Describe tu enfoque, reglas y objetivos para esta sesión..."
                    className={`w-full flex-grow futuristic-input rounded-md p-3 text-sm resize-none min-h-[300px] ${
                        theme === 'casual' ? 'text-black' : 'text-white'
                    }`}
                />
            </div>
            <div className="futuristic-panel p-4">
                <h3 className="text-lg font-bold text-glow-cyan mb-2 uppercase">Perfil de Usuario</h3>
                <p className="text-sm text-text-secondary mb-4">
                    Personaliza tu nombre de usuario que se mostrará en la aplicación.
                </p>
                <div className="space-y-4">
                    <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Tu nombre de usuario"
                        className={`w-full futuristic-input rounded-md p-3 text-center ${
                            theme === 'casual' ? 'text-black' : 'text-white'
                        }`}
                    />
                    <button
                        onClick={handleUpdateDisplayName}
                        disabled={!displayName.trim() || isUpdatingName}
                        className={`w-full font-bold py-2.5 px-4 rounded-md transition-all text-sm ${
                            theme === 'casual'
                                ? 'bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-300 disabled:text-gray-500'
                                : theme === 'trading'
                                ? 'bg-green-600 hover:bg-green-700 text-white disabled:bg-gray-600 disabled:text-gray-400'
                                : 'futuristic-button'
                        }`}
                    >
                        {isUpdatingName ? 'Actualizando...' : 'Actualizar Nombre'}
                    </button>
                </div>
                <div className="border-t border-border-color mt-6 pt-4 text-xs text-text-secondary">
                    <p className="font-bold">INFORMACIÓN:</p>
                    <p className="mt-2">Email: {auth.currentUser?.email}</p>
                </div>
            </div>
            <div className="futuristic-panel p-4">
                <h3 className="text-lg font-bold text-glow-cyan mb-2 uppercase">Estilos de Tema</h3>
                <p className="text-sm text-text-secondary mb-4">
                    Elige el estilo visual que prefieras para la aplicación.
                </p>
                <div className="space-y-3">
                    <button
                        onClick={() => handleThemeChange('futuristic')}
                        className={`w-full p-3 rounded-lg border-2 transition-all ${
                            selectedTheme === 'futuristic'
                                ? 'border-cyan-400 bg-cyan-400/20 text-cyan-400'
                                : 'border-gray-600 hover:border-cyan-400 text-gray-300'
                        }`}
                    >
                        🚀 Futurista
                    </button>
                    <button
                        onClick={() => handleThemeChange('casual')}
                        className={`w-full p-3 rounded-lg border-2 transition-all ${
                            selectedTheme === 'casual'
                                ? 'border-cyan-400 bg-cyan-400/20 text-cyan-400'
                                : 'border-gray-600 hover:border-cyan-400 text-gray-300'
                        }`}
                    >
                        💼 Casual
                    </button>
                    <button
                        onClick={() => handleThemeChange('trading')}
                        className={`w-full p-3 rounded-lg border-2 transition-all ${
                            selectedTheme === 'trading'
                                ? 'border-cyan-400 bg-cyan-400/20 text-cyan-400'
                                : 'border-gray-600 hover:border-cyan-400 text-gray-300'
                        }`}
                    >
                        📈 Trading Pro
                    </button>
                </div>
            </div>
            <div className="futuristic-panel p-4">
                <h3 className="text-lg font-bold text-glow-cyan mb-2 uppercase">Gestión de Datos</h3>
                 <p className="text-sm text-text-secondary mb-4">
                    Exporta tus datos para tener una copia de seguridad o para transferirlos a otro dispositivo.
                </p>
                <div className="space-y-4">
                    <button onClick={onExportData} className={`w-full font-bold py-2.5 px-4 rounded-md transition-all text-sm ${
                        theme === 'casual'
                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                            : theme === 'trading'
                            ? 'bg-green-600 hover:bg-green-700 text-white'
                            : 'futuristic-button'
                    }`}>
                        Exportar Datos
                    </button>
                    <button onClick={handleImportClick} className={`w-full font-bold py-2.5 px-4 rounded-md transition-all text-sm ${
                        theme === 'casual'
                            ? 'bg-red-600 hover:bg-red-700 text-white'
                            : theme === 'trading'
                            ? 'bg-red-600 hover:bg-red-700 text-white'
                            : 'futuristic-button-red'
                    }`}>
                        Importar Datos
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileImport}
                        className="hidden"
                        accept="application/json"
                    />
                </div>
                <div className="border-t border-border-color mt-6 pt-4 text-xs text-text-secondary">
                    <p className="font-bold">IMPORTANTE:</p>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>Al importar, los datos actuales serán <strong className="text-magenta">completamente reemplazados</strong>.</li>
                        <li>Asegúrate de que el archivo importado sea un respaldo válido generado por esta aplicación.</li>
                        <li>Se recomienda exportar tus datos actuales antes de importar.</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default Settings;
