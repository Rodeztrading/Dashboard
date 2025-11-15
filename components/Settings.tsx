import React, { useState, useRef } from 'react';
import type { VisualTrade } from '../types';

interface SettingsProps {
    userProfile: {
        name: string;
        handle: string;
        avatar: string;
    };
    onSave: (newProfile: { name: string; handle: string; avatar: string; }) => void;
    tradingPlan: string;
    onTradingPlanChange: (notes: string) => void;
    trades: VisualTrade[];
    onImportData: (jsonString: string) => void;
}

const Settings: React.FC<SettingsProps> = ({ userProfile, onSave, tradingPlan, onTradingPlanChange, trades, onImportData }) => {
    const [formData, setFormData] = useState(userProfile);
    const avatarFileInputRef = useRef<HTMLInputElement>(null);
    const dataImportFileInputRef = useRef<HTMLInputElement>(null);

    const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onTradingPlanChange(e.target.value);
    };
    
    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({...prev, [id]: value}));
    }

    const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const resultString = reader.result as string;
                setFormData(prev => ({...prev, avatar: resultString}));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveChanges = () => {
        onSave(formData);
        alert('Perfil actualizado!');
    };

    const handleExport = () => {
      const dataToExport = {
        trades: trades,
        tradingPlan: tradingPlan,
      };
      const jsonString = JSON.stringify(dataToExport, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const date = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = `visual-ai-journal-backup-${date}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    };

    const handleImportClick = () => {
        dataImportFileInputRef.current?.click();
    };

    const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result;
            if (typeof text === 'string') {
                onImportData(text);
            }
        };
        reader.onerror = () => {
            alert('Error al leer el archivo.');
        };
        reader.readAsText(file);
        
        if (event.target) {
            event.target.value = '';
        }
    };


    return (
        <div className="space-y-4">
            <div className="futuristic-panel p-4">
                <h2 className="text-lg font-bold text-glow-cyan mb-4 uppercase">Configuración de Perfil</h2>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-text-secondary mb-1">Nombre</label>
                        <input
                            type="text"
                            id="name"
                            value={formData.name}
                            onChange={handleFormChange}
                            className="futuristic-input w-full rounded-md p-2"
                        />
                    </div>
                    <div>
                        <label htmlFor="handle" className="block text-sm font-medium text-text-secondary mb-1">Handle</label>
                        <input
                            type="text"
                            id="handle"
                            value={formData.handle}
                            onChange={handleFormChange}
                            className="futuristic-input w-full rounded-md p-2"
                        />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Avatar</label>
                        <div className="flex items-center gap-4">
                            <img src={formData.avatar} alt="Avatar" className="w-16 h-16 rounded-full object-cover" />
                            <input
                                type="file"
                                ref={avatarFileInputRef}
                                onChange={handleAvatarChange}
                                className="hidden"
                                accept="image/png, image/jpeg, image/webp"
                            />
                            <button 
                                onClick={() => avatarFileInputRef.current?.click()}
                                className="futuristic-button text-sm py-1 px-3 rounded-md"
                            >
                                Cambiar
                            </button>
                        </div>
                    </div>
                    <button
                        onClick={handleSaveChanges}
                        className="futuristic-button font-bold py-2 px-6 rounded-lg"
                    >
                        Guardar Cambios
                    </button>
                </div>
            </div>

            <div className="futuristic-panel p-4">
                <h2 className="text-lg font-bold text-glow-cyan mb-4 uppercase">Gestión de Datos (Sincronización)</h2>
                <p className="text-sm text-text-secondary mb-4">
                    Para usar tus datos en otro dispositivo (como tu celular), primero 'Exporta' los datos desde tu dispositivo actual para crear un archivo de respaldo. Luego, en el otro dispositivo, usa la opción 'Importar' y selecciona ese archivo.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                    <button onClick={handleExport} className="futuristic-button font-bold py-2 px-6 rounded-lg w-full">
                        Exportar Datos
                    </button>
                    <button onClick={handleImportClick} className="futuristic-button font-bold py-2 px-6 rounded-lg w-full">
                        Importar Datos
                    </button>
                    <input
                        type="file"
                        ref={dataImportFileInputRef}
                        onChange={handleFileImport}
                        className="hidden"
                        accept="application/json,.json"
                    />
                </div>
                <p className="text-xs text-text-secondary mt-3">
                    <strong>Importante:</strong> Al importar se reemplazarán todos los datos existentes en el dispositivo actual.
                </p>
            </div>

            <div className="futuristic-panel p-4 h-full flex flex-col" style={{ minHeight: '300px' }}>
                <h3 className="text-lg font-bold text-glow-cyan mb-2 uppercase">Plan de Trading</h3>
                <textarea
                    value={tradingPlan}
                    onChange={handleNotesChange}
                    placeholder="Describe tu enfoque, reglas y objetivos para esta sesión..."
                    className="w-full flex-grow futuristic-input text-white rounded-md p-3 text-sm resize-none"
                />
                <p className="text-xs text-text-secondary mt-2">Guardado automático en este dispositivo.</p>
            </div>
        </div>
    );
};

export default Settings;
