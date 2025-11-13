import React, { useState } from 'react';

interface SettingsProps {
    userProfile: {
        name: string;
        handle: string;
        avatar: string;
    };
    onSave: (newProfile: { name: string; handle: string; avatar: string; }) => void;
    tradingPlan: string;
    onTradingPlanChange: (notes: string) => void;
}

const Settings: React.FC<SettingsProps> = ({ userProfile, onSave, tradingPlan, onTradingPlanChange }) => {
    const [name, setName] = useState(userProfile.name);
    const [handle, setHandle] = useState(userProfile.handle);

    const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onTradingPlanChange(e.target.value);
    };

    const handleSaveChanges = () => {
        onSave({ ...userProfile, name, handle });
        alert('Perfil actualizado!');
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
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="futuristic-input w-full rounded-md p-2"
                        />
                    </div>
                    <div>
                        <label htmlFor="handle" className="block text-sm font-medium text-text-secondary mb-1">Handle</label>
                        <input
                            type="text"
                            id="handle"
                            value={handle}
                            onChange={(e) => setHandle(e.target.value)}
                            className="futuristic-input w-full rounded-md p-2"
                        />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Avatar</label>
                        <div className="flex items-center gap-4">
                            <img src={userProfile.avatar} alt="Avatar" className="w-16 h-16 rounded-full" />
                            <button className="futuristic-button text-sm py-1 px-3 rounded-md disabled:opacity-50" disabled>Cambiar</button>
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
