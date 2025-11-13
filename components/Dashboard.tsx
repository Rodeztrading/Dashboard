import React from 'react';
import type { VisualTrade } from '../types';

interface DashboardProps {
  trades: VisualTrade[];
  initialBalance: number | null;
  selectedDate: Date | null;
}

const SparkLine: React.FC<{ data: number[] }> = ({ data }) => {
  if (data.length < 2) return null;
  const width = 100;
  const height = 30;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min === 0 ? 1 : max - min;
  const points = data.map((d, i) => `${(i / (data.length - 1)) * width},${height - ((d - min) / range) * height}`).join(' ');

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-8 mt-2" preserveAspectRatio="none">
      <polyline points={points} fill="none" stroke="var(--cyan)" strokeWidth="2" />
    </svg>
  );
};

const StatCard: React.FC<{ label: string; value: string; data: number[]; colorClass?: string }> = ({ label, value, data, colorClass = 'text-glow-cyan' }) => (
  <div className="bg-background-dark/50 p-4 border border-border-color rounded-lg">
    <p className="text-sm text-text-secondary uppercase tracking-wider">{label}</p>
    <p className={`text-3xl font-black ${colorClass}`}>{value}</p>
    <SparkLine data={data} />
  </div>
);

const StatisticsChart: React.FC<{ plHistory: number[] }> = ({ plHistory }) => {
    const data = plHistory;
    const width = 500;
    const height = 200;
    const padding = 20;

    if (data.length < 2) {
        return <div className="flex items-center justify-center h-full text-text-secondary">No hay suficientes datos para el gráfico.</div>;
    }

    const max = Math.max(...data, 0);
    const min = Math.min(...data, 0);
    const range = max - min === 0 ? 1 : max - min;
    
    const points = data.map((d, i) => `${padding + (i / (data.length - 1)) * (width - 2*padding)},${height - padding - ((d - min) / range) * (height - 2*padding)}`).join(' ');
    const areaPoints = `${padding},${height - padding} ${points} ${padding + (width-2*padding)},${height-padding}`;
    
    return (
        <div className="h-full">
            <h3 className="text-lg font-bold uppercase mb-2">Estadísticas de P/L</h3>
             <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
                <defs>
                    <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--cyan)" stopOpacity="0.4"/>
                        <stop offset="100%" stopColor="var(--cyan)" stopOpacity="0"/>
                    </linearGradient>
                </defs>
                <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="var(--border-color)" strokeWidth="1"/>
                <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="var(--border-color)" strokeWidth="1"/>
                <polyline points={areaPoints} fill="url(#areaGradient)" />
                <polyline points={points} fill="none" stroke="var(--cyan)" strokeWidth="2" />
            </svg>
        </div>
    );
};

const CircularProgress: React.FC<{ percentage: number; label: string }> = ({ percentage, label }) => {
    const radius = 50;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    return (
        <div className="flex flex-col items-center">
            <svg className="w-32 h-32 transform -rotate-90">
                <circle className="text-border-color" strokeWidth="8" stroke="currentColor" fill="transparent" r={radius} cx="64" cy="64" />
                <circle
                    className="text-cyan"
                    strokeWidth="8"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx="64"
                    cy="64"
                />
            </svg>
            <span className="text-xl font-bold text-white -mt-20">{percentage.toFixed(1)}%</span>
            <p className="mt-16 text-xs uppercase text-text-secondary">{label}</p>
        </div>
    );
};

const Dashboard: React.FC<DashboardProps> = ({ trades, initialBalance, selectedDate }) => {
  
  const filteredTrades = React.useMemo(() => {
    if (!selectedDate) return trades;
    return trades.filter(trade => {
      const tradeDate = new Date(trade.id);
      return tradeDate.toDateString() === selectedDate.toDateString();
    });
  }, [trades, selectedDate]);

  const stats = React.useMemo(() => {
    const totalTrades = filteredTrades.length;
    const wins = filteredTrades.filter(t => t.outcome === 'WIN').length;
    const losses = totalTrades - wins;
    const winRate = totalTrades > 0 ? (wins / totalTrades) * 100 : 0;

    const calls = filteredTrades.filter(t => t.userAction === 'CALL');
    const callWins = calls.filter(t => t.outcome === 'WIN').length;
    const callWinRate = calls.length > 0 ? (callWins / calls.length) * 100 : 0;

    const puts = filteredTrades.filter(t => t.userAction === 'PUT');
    const putWins = puts.filter(t => t.outcome === 'WIN').length;
    const putWinRate = puts.length > 0 ? (putWins / puts.length) * 100 : 0;

    let totalPL = 0;
    const plHistory = [0];
    filteredTrades.forEach(trade => {
        const pnl = trade.outcome === 'WIN' 
            ? trade.amountInvested * (trade.payout / 100)
            : -trade.amountInvested;
        totalPL += pnl;
        plHistory.push(totalPL);
    });
    
    // Dummy data for sparklines to look populated
    const winsHistory = filteredTrades.map((t,i) => t.outcome === 'WIN' ? i+1 : i).slice(-10);
    const lossesHistory = filteredTrades.map((t,i) => t.outcome === 'LOSS' ? i+1 : i).slice(-10);

    return { wins, losses, winRate, totalTrades, totalPL, plHistory, callWinRate, putWinRate, winsHistory, lossesHistory };
  }, [filteredTrades]);

  if (!initialBalance) {
    return null;
  }
  
  const dashboardTitle = selectedDate 
    ? `Resumen del Día: ${selectedDate.toLocaleDateString('es-ES')}`
    : "Resumen General (Todo el Historial)";

  const content = (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total P/L" value={`$${stats.totalPL.toFixed(2)}`} data={stats.plHistory} colorClass={stats.totalPL >= 0 ? 'text-glow-cyan' : 'text-magenta'} />
          <StatCard label="Operaciones" value={stats.totalTrades.toString()} data={stats.plHistory.map((_, i) => i)} />
          <StatCard label="Victorias" value={stats.wins.toString()} data={[0, ...stats.winsHistory]} />
          <StatCard label="Pérdidas" value={stats.losses.toString()} data={[0, ...stats.lossesHistory]} colorClass="text-magenta"/>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 futuristic-panel min-h-[250px]">
              <StatisticsChart plHistory={stats.plHistory} />
          </div>
            <div className="futuristic-panel text-center">
                <h3 className="text-lg font-bold uppercase mb-2">Rendimiento</h3>
                <div className="flex justify-around items-center h-full">
                  <CircularProgress percentage={stats.callWinRate} label="CALLS" />
                  <CircularProgress percentage={stats.putWinRate} label="PUTS" />
                </div>
          </div>
      </div>

      <div className="futuristic-panel text-center">
            <h3 className="text-lg font-bold uppercase mb-2">Win Rate General</h3>
            <div className="flex justify-around">
                <CircularProgress percentage={stats.winRate} label="Total" />
            </div>
      </div>
    </>
  );

  return (
    <div className="space-y-4">
        <div className="futuristic-panel !py-3 !px-4 text-center">
            <h3 className="text-md font-bold uppercase text-glow-cyan tracking-wider">
                {dashboardTitle}
            </h3>
        </div>
        
        {filteredTrades.length === 0 && selectedDate ? (
            <div className="futuristic-panel text-center py-10">
                <p className="text-text-secondary">No hay operaciones registradas para esta fecha.</p>
            </div>
        ) : content}

    </div>
  );
};

export default Dashboard;
