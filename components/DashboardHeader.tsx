import React, { useState, useEffect } from 'react';

const BellIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
    </svg>
);

const SearchIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
);

const CogIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12a7.5 7.5 0 0015 0m-15 0a7.5 7.5 0 1115 0m-15 0H3m18 0h-1.5m-15 0a7.5 7.5 0 1115 0m-15 0H3m18 0h-1.5m-15 0a7.5 7.5 0 0015 0m-15 0a7.5 7.5 0 1115 0m-15 0H3m18 0h-1.5" />
    </svg>
);


const Clock: React.FC = () => {
    const [time, setTime] = useState(new Date());
    useEffect(() => {
        const timerId = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timerId);
    }, []);
    return <div className="text-xl md:text-2xl font-bold text-text-primary">{time.toLocaleTimeString('en-GB')}</div>;
};

interface DashboardHeaderProps {
    viewTitle: string;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ viewTitle }) => {
    const titleMap: { [key: string]: string } = {
        dashboard: 'Dashboard',
        settings: 'Configuración',
        sniper: 'Sniper',
    };

    const currentTitle = titleMap[viewTitle] || 'Dashboard';
    
    return (
        <header className="flex flex-wrap justify-between items-center gap-4">
            <div>
                <h2 className="text-2xl font-bold uppercase text-glow-cyan">{currentTitle}</h2>
                <p className="text-xs text-text-secondary">Home / Library / {currentTitle}</p>
            </div>
            <div className="flex items-center space-x-4 md:space-x-6">
                <Clock />
                <div className="flex items-center space-x-4 text-text-secondary">
                    <button className="hover:text-white" aria-label="Notifications"><BellIcon /></button>
                    <button className="hover:text-white" aria-label="Search"><SearchIcon /></button>
                    <button className="hover:text-white" aria-label="Settings"><CogIcon /></button>
                </div>
            </div>
        </header>
    );
};
export default DashboardHeader;