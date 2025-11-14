import React from 'react';
import Profile from './Profile';
import type { VisualTrade } from '../types';

// Icons
const HomeIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /></svg>;
const CogIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12a7.5 7.5 0 0115 0m-15 0a7.5 7.5 0 1115 0m-15 0H3m18 0h-1.5m-15 0a7.5 7.5 0 0015 0m-15 0a7.5 7.5 0 1115 0m-15 0H3m18 0h-1.5m-15 0a7.5 7.5 0 0015 0m-15 0a7.5 7.5 0 1115 0m-15 0H3m18 0h-1.5" /></svg>;
const SniperIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-2.467m0 0l-2.225-2.51.569-2.467m0 0l2.225-2.51 2.467.569m0 0l2.51 2.225-2.467.569M12 12a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" /><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;


interface SidebarProps {
    activeView: string;
    setActiveView: (view: string) => void;
    userProfile: { name: string; handle: string; avatar: string; };
    tradingPlan: string;
}

const NavItem: React.FC<{
    id: string;
    label: string;
    icon: React.ReactNode;
    isActive: boolean;
    onClick: () => void;
}> = ({ id, label, icon, isActive, onClick }) => {
    return (
        <li>
            <button
                onClick={onClick}
                className={`flex items-center justify-center md:justify-start w-full p-3 my-1 rounded-lg transition-all duration-200 group ${
                    isActive 
                    ? 'bg-cyan/20 text-white font-bold' 
                    : 'text-text-secondary hover:bg-cyan/10 hover:text-white'
                }`}
                aria-current={isActive ? 'page' : undefined}
                title={label}
            >
                {icon}
                <span className="ml-4 hidden md:inline">{label}</span>
            </button>
        </li>
    );
};

const TradingPlanDisplay: React.FC<{ plan: string }> = ({ plan }) => (
    <div className="hidden md:block border-t border-border-color pt-3 mt-3">
        <h4 className="text-xs uppercase text-text-secondary font-bold mb-2">Plan de Trading</h4>
        <p className="text-xs text-text-primary whitespace-pre-wrap max-h-48 overflow-y-auto pr-2">
            {plan || "Define tu plan en la sección de Configuración."}
        </p>
    </div>
);


const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, userProfile, tradingPlan }) => {
    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: <HomeIcon /> },
        { id: 'sniper', label: 'Sniper', icon: <SniperIcon /> },
        { id: 'settings', label: 'Configuración', icon: <CogIcon /> },
    ];

    return (
        <aside className="bg-[#0c1322]/80 border-r border-border-color flex flex-col p-3 md:p-4 space-y-4 overflow-y-auto">
            <div className="text-center border-b border-border-color pb-4">
                 <h1 className="text-2xl font-black uppercase text-glow-cyan tracking-tighter hidden md:block">
                    SUPER ADMIN 1.0
                </h1>
                <span className="font-black text-glow-cyan text-2xl md:hidden">SA</span>
            </div>
            
            <Profile user={userProfile} />

            <nav className="flex-grow">
                <ul className="space-y-1">
                    {navItems.map(item => (
                        <NavItem 
                            key={item.id}
                            id={item.id}
                            label={item.label}
                            icon={item.icon}
                            isActive={activeView === item.id}
                            onClick={() => setActiveView(item.id)}
                        />
                    ))}
                </ul>
            </nav>

            <TradingPlanDisplay plan={tradingPlan} />
            
            <div className="text-center text-xs text-gray-600 mt-auto pt-4">
                <p className="hidden md:block">&copy; 2024 Visual AI Journal</p>
            </div>
        </aside>
    );
}

export default Sidebar;