import { TradingDay, VisualTrade } from '../types';

export const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const getTodayString = (): string => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return formatDate(d);
};

export const generateTimelineData = (trades: VisualTrade[], daysBack: number, daysForward: number): TradingDay[] => {
  const days: TradingDay[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Group trades by date
  const tradesByDate: { [key: string]: VisualTrade[] } = {};
  trades.forEach(trade => {
    const dateStr = formatDate(new Date(trade.createdAt));
    if (!tradesByDate[dateStr]) tradesByDate[dateStr] = [];
    tradesByDate[dateStr].push(trade);
  });

  for (let i = -daysBack; i <= daysForward; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dateStr = formatDate(d);
    const dayOfWeek = d.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    
    const dayTrades = tradesByDate[dateStr] || [];
    
    // Calculate Stats
    let pnl = 0;
    let itm = 0;
    let otm = 0;

    dayTrades.forEach(t => {
      if (t.outcome === 'WIN') {
        pnl += t.amountInvested * (t.payout / 100);
        itm++;
      } else {
        pnl -= t.amountInvested;
        otm++;
      }
    });

    let status: TradingDay['status'] = 'PENDING';
    if (isWeekend) status = 'WEEKEND';
    else if (dateStr === getTodayString()) status = 'ACTIVE';
    else if (i < 0) status = 'CLOSED';

    days.push({
      date: dateStr,
      status,
      pnl: parseFloat(pnl.toFixed(2)),
      trades: dayTrades,
      itm,
      otm,
      dayOfWeek
    });
  }
  return days;
};