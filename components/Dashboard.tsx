
import React from 'react';
import type { VisualTrade } from '../types';

interface ChartDataPoint {
    date: Date;
    dailyPnl: number;
    cumulativePnl: number;
}

const HistoricalPerformanceChart: React.FC<{ data: ChartDataPoint[] }> = ({ data }) => {
    const width = 500;
    const height = 300;
    const padding = { top: 20, right: 20, bottom: 60, left: 50 };

    if (data.length === 0) {
        return <div className="flex items-center justify-center h-full text-text-secondary">No hay datos para mostrar.</div>;
    }

    const equityHeight = height * 0.6;
    const volumeHeight = height * 0.3;

    // Equity Curve Calculations
    const cumulativePnls = data.map(d => d.cumulativePnl);
    const maxCumulativePnl = Math.max(0, ...cumulativePnls);
    const minCumulativePnl = Math.min(0, ...cumulativePnls);
    const equityRange = maxCumulativePnl - minCumulativePnl === 0 ? 1 : maxCumulativePnl - minCumulativePnl;
    
    const equityYScale = (pnl: number) => padding.top + equityHeight - ((pnl - minCumulativePnl) / equityRange) * equityHeight;
    const equityPath = data.map((d, i) => `${padding.left + i * ((width - padding.left - padding.right) / (data.length -1 || 1))},${equityYScale(d.cumulativePnl)}`).join(' L ');
    const areaPath = `M ${padding.left},${equityYScale(data[0].cumulativePnl)} L ${equityPath} L ${width - padding.right},${equityYScale(0)} L ${padding.left},${equityYScale(0)} Z`;


    // Volume Bar Calculations
    const dailyPnls = data.map(d => d.dailyPnl);
    const maxDailyPnl = Math.max(0, ...dailyPnls);
    const minDailyPnl = Math.min(0, ...dailyPnls);
    const maxAbsDailyPnl = Math.max(maxDailyPnl, Math.abs(minDailyPnl));

    const barWidth = (width - padding.left - padding.right) / (data.length * 1.5);

    return (
        <div className="h-full">
            <h3 className="text-lg font-bold uppercase mb-2 text-center">Curva de Capital y P/L Diario</h3>
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
                {/* Y-Axis labels for Equity Curve */}
                <text x={padding.left - 10} y={padding.top} dy="0.3em" fill="var(--text-secondary)" textAnchor="end" fontSize="10">${maxCumulativePnl.toFixed(0)}</text>
                <text x={padding.left - 10} y={equityYScale(0)} dy="0.3em" fill="var(--text-secondary)" textAnchor="end" fontSize="10">$0</text>
                <text x={padding.left - 10} y={padding.top + equityHeight} dy="0.3em" fill="var(--text-secondary)" textAnchor="end" fontSize="10">${minCumulativePnl.toFixed(0)}</text>
                
                {/* Equity Curve Area and Line */}
                <defs>
                    <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--cyan)" stopOpacity="0.3"/>
                        <stop offset="100%" stopColor="var(--cyan)" stopOpacity="0"/>
                    </linearGradient>
                </defs>
                <path d={`M ${padding.left},${equityYScale(data[0].cumulativePnl)} L ${equityPath}`} stroke="var(--cyan)" strokeWidth="2" fill="none" />
                <path d={`M ${padding.left},${equityYScale(data[0].cumulativePnl)} L ${equityPath} L ${width - padding.right},${padding.top + equityHeight} L ${padding.left},${padding.top + equityHeight} Z`} fill="url(#equityGradient)" />


                {/* Volume Bars */}
                {data.map((d, i) => {
                    const x = padding.left + i * (barWidth * 1.5);
                    const barHeight = (Math.abs(d.dailyPnl) / maxAbsDailyPnl) * (volumeHeight);
                    const y = height - padding.bottom - barHeight;
                    const fill = d.dailyPnl >= 0 ? "var(--cyan)" : "var(--magenta)";
                    
                    return (
                        <g key={i}>
                            <rect
                                x={x}
                                y={y}
                                width={barWidth}
                                height={barHeight}
                                fill={fill}
                            />
                            <text
                                x={x + barWidth / 2}
                                y={y - 4}
                                fill="var(--text-secondary)"
                                textAnchor="middle"
                                fontSize="8"
                                fontWeight="bold"
                            >
                                {`$${d.dailyPnl.toFixed(2)}`}
                            </text>
                            <text x={x + barWidth / 2} y={height - padding.bottom + 15} fill="var(--text-secondary)" textAnchor="middle" fontSize="8">
                                {d.date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}
                            </text>
                        </g>
                    );
                })}

                {/* Y-Axis labels for Volume */}
                 <text x={padding.left - 10} y={height - padding.bottom - volumeHeight} dy="0.3em" fill="var(--text-secondary)" textAnchor="end" fontSize="10">${maxAbsDailyPnl.toFixed(0)}</text>
                 <text x={padding.left - 10} y={height - padding.bottom} dy="0.3em" fill="var(--text-secondary)" textAnchor="end" fontSize="10">$0</text>
            </svg>
        </div>
    );
};


const StatCard: React.FC<{ label: string; value: string; subValue?: string; colorClass?: string }> = ({ label, value, subValue, colorClass = 'text-glow-cyan' }) => (
  <div className="bg-background-dark/50 p-4 border border-border-color rounded-lg text-center">
    <p className="text-sm text-text-secondary uppercase tracking-wider">{label}</p>
    <p className={`text-3xl font-black ${colorClass}`}>{value}</p>
    {subValue && <p className="text-xs text-text-secondary mt-1">{subValue}</p>}
  </div>
);


const Dashboard: React.FC<{ trades: VisualTrade[] }> = ({ trades }) => {

  const historicalStats = React.useMemo(() => {
    const dailyPL: Record<string, number> = {};
    trades.forEach(trade => {
        const date = new Date(trade.createdAt).toDateString();
        const pnl = trade.outcome === 'WIN' 
            ? trade.amountInvested * (trade.payout / 100)
            : -trade.amountInvested;
        dailyPL[date] = (dailyPL[date] || 0) + pnl;
    });

    let cumulativePnl = 0;
    const chartData = Object.entries(dailyPL)
      .map(([dateStr, pnl]) => ({ date: new Date(dateStr), pnl }))
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .map(d => {
          cumulativePnl += d.pnl;
          return { date: d.date, dailyPnl: d.pnl, cumulativePnl };
      });

    const totalPL = trades.reduce((acc, trade) => {
        const pnl = trade.outcome === 'WIN' 
            ? trade.amountInvested * (trade.payout / 100)
            : -trade.amountInvested;
        return acc + pnl;
    }, 0);

    const wins = trades.filter(t => t.outcome === 'WIN').length;
    const totalTrades = trades.length;
    const winRate = totalTrades > 0 ? (wins / totalTrades) * 100 : 0;
    
    let bestDay = { pnl: 0, date: '' };
    let worstDay = { pnl: 0, date: '' };
    Object.entries(dailyPL).forEach(([date, pnl]) => {
        if (pnl > bestDay.pnl) bestDay = { pnl, date };
        if (pnl < worstDay.pnl) worstDay = { pnl, date };
    });

    return { chartData, totalPL, winRate, totalTrades, bestDay, worstDay };
  }, [trades]);

  return (
    <div className="space-y-4">
        <div className="futuristic-panel text-center">
            <h3 className="text-xl font-bold uppercase text-glow-cyan tracking-wider">
                Resumen Histórico General
            </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total P/L Histórico" value={`$${historicalStats.totalPL.toFixed(2)}`} colorClass={historicalStats.totalPL >= 0 ? 'text-glow-cyan' : 'text-magenta'} />
          <StatCard label="Win Rate General" value={`${historicalStats.winRate.toFixed(1)}%`} subValue={`${trades.filter(t=>t.outcome === 'WIN').length}W / ${trades.filter(t=>t.outcome === 'LOSS').length}L`} />
          <StatCard label="Mejor Día" value={`+$${historicalStats.bestDay.pnl.toFixed(2)}`} subValue={historicalStats.bestDay.date ? new Date(historicalStats.bestDay.date).toLocaleDateString('es-ES') : 'N/A'} />
          <StatCard label="Peor Día" value={`$${historicalStats.worstDay.pnl.toFixed(2)}`} subValue={historicalStats.worstDay.date ? new Date(historicalStats.worstDay.date).toLocaleDateString('es-ES') : 'N/A'} colorClass="text-magenta" />
      </div>

      <div className="futuristic-panel min-h-[350px]">
          <HistoricalPerformanceChart data={historicalStats.chartData} />
      </div>

    </div>
  );
};

export default Dashboard;
