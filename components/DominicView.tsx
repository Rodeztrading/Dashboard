import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Save, RefreshCw } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { CustodyOverride, CustodyDay } from '../types';
import { saveCustodyOverride, getCustodyOverrides, deleteCustodyOverride } from '../services/firebaseService';

export const DominicView: React.FC = () => {
    const { user } = useAuth();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [overrides, setOverrides] = useState<Record<string, CustodyOverride>>({});
    const [loading, setLoading] = useState(true);

    // Load overrides
    useEffect(() => {
        if (user) {
            loadOverrides();
        }
    }, [user]);

    const loadOverrides = async () => {
        if (!user) return;
        try {
            setLoading(true);
            const data = await getCustodyOverrides();
            const overridesMap: Record<string, CustodyOverride> = {};
            data.forEach(o => {
                overridesMap[o.date] = o;
            });
            setOverrides(overridesMap);
        } catch (error) {
            console.error('Error loading overrides:', error);
        } finally {
            setLoading(false);
        }
    };

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        const days: Date[] = [];

        // Add padding days from previous month
        const firstDayOfWeek = firstDay.getDay(); // 0 = Sunday
        // Adjust for Monday start (0 = Monday, 6 = Sunday)
        const adjustedFirstDay = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

        for (let i = adjustedFirstDay; i > 0; i--) {
            days.push(new Date(year, month, 1 - i));
        }

        // Add days of current month
        for (let i = 1; i <= lastDay.getDate(); i++) {
            days.push(new Date(year, month, i));
        }

        // Add padding days for next month to complete the grid (42 cells max usually)
        const remainingCells = 42 - days.length;
        for (let i = 1; i <= remainingCells; i++) {
            days.push(new Date(year, month + 1, i));
        }

        return days;
    };

    const getResponsible = (date: Date): { responsible: 'MOM' | 'DAD', isOverride: boolean, originalResponsible?: 'MOM' | 'DAD' } => {
        const dateString = date.toISOString().split('T')[0];

        // Check override
        if (overrides[dateString]) {
            const o = overrides[dateString];
            return { responsible: o.responsible, isOverride: true, originalResponsible: o.originalResponsible };
        }

        // Calculate based on pattern
        // Epoch: Jan 3, 2024 (Wednesday) -> Dad start of 2‑day rotation
        const epoch = new Date('2024-01-03T00:00:00');
        // Reset time parts to avoid timezone issues affecting diff
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        epoch.setHours(0, 0, 0, 0);

        const diffTime = d.getTime() - epoch.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        // Pattern: 2 days Mom, 2 days Dad
        // Cycle length: 4
        // 0, 1: Mom
        // 2, 3: Dad
        // Handle negative diffs correctly
        const mod = ((diffDays % 4) + 4) % 4;

        return {
            responsible: mod < 2 ? 'DAD' : 'MOM',
            isOverride: false,
            // No originalResponsible when there is no override
        };

    };

    const handleDayClick = async (date: Date) => {
        if (!user) return;

        const dateString = date.toISOString().split('T')[0];
        const current = getResponsible(date);
        const newResponsible = current.responsible === 'MOM' ? 'DAD' : 'MOM';

        // Optimistic update
        const newOverrides = { ...overrides };

        if (current.isOverride) {
            // Existing override: keep originalResponsible unchanged
            const existing = overrides[dateString];
            const override: CustodyOverride = {
                id: dateString,
                date: dateString,
                responsible: newResponsible,
                originalResponsible: existing.originalResponsible,
                createdAt: Date.now()
            };
            newOverrides[dateString] = override;
            setOverrides(newOverrides);

            try {
                await saveCustodyOverride(override);
            } catch (error) {
                console.error('Failed to save override', error);
                setOverrides(overrides);
            }
        } else {
            // Create new override, store the original responsible
            const override: CustodyOverride = {
                id: dateString,
                date: dateString,
                responsible: newResponsible,
                originalResponsible: current.responsible,
                createdAt: Date.now()
            };
            newOverrides[dateString] = override;
            setOverrides(newOverrides);

            try {
                await saveCustodyOverride(override);
            } catch (error) {
                console.error('Failed to save override', error);
                setOverrides(overrides);
            }
        }
    };

    const handleResetOverride = async (e: React.MouseEvent, date: Date) => {
        e.stopPropagation();
        if (!user) return;

        const dateString = date.toISOString().split('T')[0];
        if (!overrides[dateString]) return;

        const newOverrides = { ...overrides };
        delete newOverrides[dateString];
        setOverrides(newOverrides);

        try {
            await deleteCustodyOverride(dateString);
        } catch (error) {
            console.error('Failed to delete override', error);
            setOverrides(overrides);
        }
    };

    const changeMonth = (delta: number) => {
        const newDate = new Date(currentDate);
        newDate.setMonth(newDate.getMonth() + delta);
        setCurrentDate(newDate);
    };

    const days = getDaysInMonth(currentDate);
    const monthName = currentDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' });

    return (
        <div className="h-full overflow-y-auto bg-gray-950 p-4 md:p-6">
            <div className="max-w-5xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Calendario de Dominic</h1>
                        <p className="text-gray-400 mt-1">Gestión de custodia compartida</p>
                    </div>

                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2 text-sm">
                            <div className="flex items-center">
                                <div className="w-3 h-3 rounded-full bg-pink-500 mr-2"></div>
                                <span className="text-gray-300">Mamá</span>
                            </div>
                            <div className="flex items-center">
                                <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                                <span className="text-gray-300">Papá</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden shadow-xl">
                    {/* Calendar Header */}
                    <div className="p-4 flex items-center justify-between border-b border-gray-800 bg-gray-800/50">
                        <button
                            onClick={() => changeMonth(-1)}
                            className="p-2 hover:bg-gray-700 rounded-lg transition-colors text-gray-300"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                        <h2 className="text-xl font-bold text-white capitalize">{monthName}</h2>
                        <button
                            onClick={() => changeMonth(1)}
                            className="p-2 hover:bg-gray-700 rounded-lg transition-colors text-gray-300"
                        >
                            <ChevronRight className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Days Header */}
                    <div className="grid grid-cols-7 border-b border-gray-800 bg-gray-900">
                        {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(day => (
                            <div key={day} className="py-3 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 auto-rows-fr">
                        {days.map((date, index) => {
                            const { responsible, isOverride, originalResponsible } = getResponsible(date);
                            const isCurrentMonth = date.getMonth() === currentDate.getMonth();
                            const isToday = new Date().toDateString() === date.toDateString();
                            const dateString = date.toISOString().split('T')[0];

                            return (
                                <div
                                    key={index}
                                    onClick={() => handleDayClick(date)}
                                    className={`
                                        min-h-[100px] p-2 border-b border-r border-gray-800 relative cursor-pointer transition-all hover:bg-gray-800/50
                                        ${!isCurrentMonth ? 'opacity-30 bg-gray-950' : ''}
                                        ${isToday ? 'ring-1 ring-inset ring-sniper-blue' : ''}
                                    `}
                                >
                                    <div className="flex justify-between items-start">
                                        <span className={`
                                            text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full
                                            ${isToday ? 'bg-sniper-blue text-white' : 'text-gray-400'}
                                        `}>
                                            {date.getDate()}
                                        </span>
                                        {isOverride && (
                                            <button
                                                onClick={(e) => handleResetOverride(e, date)}
                                                className="text-yellow-500 hover:text-yellow-400"
                                                title="Restaurar original"
                                            >
                                                <RefreshCw className="w-3 h-3" />
                                            </button>
                                        )}
                                    </div>

                                    {isOverride && originalResponsible && (
                                        <div className="text-xs text-gray-500 text-center mt-1">
                                            {originalResponsible === 'MOM' ? 'Mamá' : 'Papá'}
                                        </div>
                                    )}

                                    <div className={`
                                        mt-2 p-2 rounded-lg text-xs font-bold text-center uppercase tracking-wide
                                        ${responsible === 'MOM'
                                            ? 'bg-pink-500/20 text-pink-300 border border-pink-500/30'
                                            : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'}
                                        ${isOverride ? 'ring-1 ring-yellow-500/50' : ''}
                                    `}>
                                        {responsible === 'MOM' ? 'Mamá' : 'Papá'}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};
