import React, { useEffect, useRef, useState } from 'react';
import { generateTimelineData, getTodayString } from '../utils/dateHelper';
import { TradingDay, VisualTrade } from '../types';
import { TradeWorkflow } from './TradeWorkflow';
import { Activity, Crosshair, Clock, Plus, TrendingUp, TrendingDown, Maximize2, X, ChevronLeft, ChevronRight } from 'lucide-react';

interface SniperViewProps {
  trades: VisualTrade[];
  onSaveTrade: (trade: Omit<VisualTrade, 'id' | 'createdAt'>) => void;
}

export const SniperView: React.FC<SniperViewProps> = ({ trades, onSaveTrade }) => {
  const [days, setDays] = useState<TradingDay[]>([]);
  const [selectedDay, setSelectedDay] = useState<TradingDay | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasScrolledToToday, setHasScrolledToToday] = useState(false);

  // State for Image Lightbox
  const [viewTrade, setViewTrade] = useState<VisualTrade | null>(null);

  // References for auto-scroll
  const dateRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const containerRef = useRef<HTMLDivElement>(null);

  // Derived state for display order (Newest first) to ensure Grid and Lightbox match
  const displayTrades = selectedDay ? [...selectedDay.trades].reverse() : [];

  useEffect(() => {
    // Generate data from trades
    const data = generateTimelineData(trades, 30, 5);
    setDays(data);

    // Maintain selection or select today if nothing selected
    if (selectedDay) {
      const updatedDay = data.find(d => d.date === selectedDay.date);
      if (updatedDay) setSelectedDay(updatedDay);
    } else {
      const today = getTodayString();
      const todayData = data.find(d => d.date === today);
      if (todayData) setSelectedDay(todayData);
    }
  }, [trades]);

  // AUTO-SCROLL LOGIC: Scroll to today when days are loaded (only once on first load)
  useEffect(() => {
    if (days.length > 0 && !hasScrolledToToday) {
      const today = getTodayString();
      const element = dateRefs.current[today];
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          setHasScrolledToToday(true);
        }, 100);
      }
    }
  }, [days.length, hasScrolledToToday]);

  // KEYBOARD NAVIGATION FOR LIGHTBOX
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!viewTrade) return;

      if (e.key === 'Escape') {
        setViewTrade(null);
      } else if (e.key === 'ArrowLeft') {
        navigateTrade('prev');
      } else if (e.key === 'ArrowRight') {
        navigateTrade('next');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewTrade, displayTrades]);

  const handleDayClick = (day: TradingDay) => {
    setSelectedDay(day);
  };

  const handleNewTradeSave = (tradeData: Omit<VisualTrade, 'id' | 'createdAt'>) => {
    onSaveTrade(tradeData);
    setIsModalOpen(false);
  };

  const calculateWinRate = (day: TradingDay) => {
    const total = day.itm + day.otm;
    return total > 0 ? ((day.itm / total) * 100).toFixed(0) : 0;
  };

  const navigateTrade = (direction: 'next' | 'prev') => {
    if (!viewTrade || displayTrades.length === 0) return;

    const currentIndex = displayTrades.findIndex(t => t.id === viewTrade.id);
    if (currentIndex === -1) return;

    if (direction === 'next' && currentIndex < displayTrades.length - 1) {
      setViewTrade(displayTrades[currentIndex + 1]);
    } else if (direction === 'prev' && currentIndex > 0) {
      setViewTrade(displayTrades[currentIndex - 1]);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-full w-full bg-gray-950 text-gray-100 overflow-hidden relative">
      {/* LEFT COLUMN: TIMELINE */}
      <div className="w-full md:w-1/3 lg:w-1/5 border-r border-gray-800 flex flex-col h-1/3 md:h-full bg-gray-900/50 order-first md:order-none">
        <div className="p-4 border-b border-gray-800 bg-gray-900/80 backdrop-blur-sm z-10 sticky top-0">
          <h2 className="text-sm font-bold flex items-center text-white uppercase tracking-wider">
            <Activity className="w-4 h-4 mr-2 text-sniper-blue" />
            Timeline
          </h2>
        </div>
        <div ref={containerRef} className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
          {days.map((day) => {
            const isToday = day.date === getTodayString();
            const isSelected = selectedDay?.date === day.date;
            const hasActivity = day.trades.length > 0;
            const isProfit = day.pnl >= 0;
            return (
              <div
                key={day.date}
                ref={(el) => { dateRefs.current[day.date] = el; }}
                onClick={() => handleDayClick(day)}
                className={`
              relative p-3 rounded-lg border cursor-pointer transition-all duration-200
              ${isSelected ? 'bg-gray-800 border-sniper-blue ring-1 ring-sniper-blue' : 'bg-transparent border-gray-800 hover:bg-gray-800/50 hover:border-gray-700'}
              ${day.status === 'WEEKEND' ? 'opacity-40' : ''}
            `}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className={`text-xs font-mono font-bold ${isToday ? 'text-sniper-blue' : 'text-gray-400'}`}>
                    {day.date}
                  </span>
                  {isToday && <span className="w-2 h-2 rounded-full bg-sniper-blue animate-pulse" />}
                </div>
                {hasActivity ? (
                  <div className="flex justify-between items-end">
                    <div className="text-[10px] text-gray-500">
                      {day.itm}W - {day.otm}L
                    </div>
                    <div className={`text-xs font-bold font-mono ${isProfit ? 'text-green-400' : 'text-red-400'}`}>
                      {day.pnl >= 0 ? '+' : ''}{day.pnl}
                    </div>
                  </div>
                ) : (
                  <div className="text-[10px] text-gray-600 italic">Sin actividad</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      {/* RIGHT COLUMN: DETAILS */}
      <div className="flex-1 h-full bg-gray-950 p-4 md:p-8 overflow-y-auto order-last md:order-none">
        {selectedDay ? (
          <div className="max-w-5xl mx-auto">
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-gray-800 pb-6 mb-6">
              <div>
                <div className="flex items-center space-x-3 mb-1">
                  <h1 className="text-3xl font-bold text-white font-mono">{selectedDay.date}</h1>
                  {selectedDay.date === getTodayString() && (
                    <span className="bg-sniper-blue text-black text-xs font-bold px-2 py-1 rounded">SESIÓN ACTIVA</span>
                  )}
                </div>
                <p className="text-gray-500 text-sm flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {selectedDay.status === 'WEEKEND' ? 'Mercado OTC / Cerrado' : 'Registro de Operaciones'}
                </p>
              </div>
              <div className="mt-4 md:mt-0 text-right flex items-center space-x-6">
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Efectividad</div>
                  <div className="text-2xl font-bold text-white">{calculateWinRate(selectedDay)}%</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">P/L Neto</div>
                  <div className={`text-4xl font-bold font-mono ${selectedDay.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {selectedDay.pnl >= 0 ? '+' : ''}${selectedDay.pnl.toFixed(2)}
                  </div>
                </div>
              </div>
            </header>
            {/* Actions for Today */}
            {selectedDay.date === getTodayString() && (
              <div className="mb-8">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="w-full bg-gray-900 border border-gray-700 hover:border-sniper-blue hover:bg-gray-800 text-white p-6 rounded-xl border-dashed flex flex-col items-center justify-center transition-all group"
                >
                  <div className="bg-sniper-blue/10 p-3 rounded-full mb-3 group-hover:bg-sniper-blue/20 transition-colors">
                    <Plus className="w-8 h-8 text-sniper-blue" />
                  </div>
                  <span className="font-bold text-lg">Registrar Nueva Operación</span>
                  <span className="text-sm text-gray-500 mt-1">Sube captura y registra resultados</span>
                </button>
              </div>
            )}
            {/* Trades Grid */}


            {/* Trades Grid */}
            {displayTrades.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayTrades.map((trade, idx) => (
                  <div key={trade.id} className="bg-gray-900 rounded-xl overflow-hidden border border-gray-800 group hover:border-gray-600 transition-all">
                    {/* Image Header */}
                    <div
                      className="aspect-video bg-black relative cursor-zoom-in overflow-hidden"
                      onClick={() => setViewTrade(trade)}
                    >
                      <img
                        src={`data:${trade.tradeImage.mimeType};base64,${trade.tradeImage.base64}`}
                        alt="Trade"
                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300"
                      />

                      {/* Hover Overlay for Zoom Indication */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Maximize2 className="text-white w-8 h-8 drop-shadow-lg" />
                      </div>

                      <div className="absolute top-2 right-2 flex space-x-2">
                        <span className={`px-2 py-1 rounded text-xs font-bold flex items-center ${trade.outcome === 'WIN' ? 'bg-green-500 text-black' : 'bg-red-500 text-white'}`}>
                          {trade.outcome === 'WIN' ? 'WIN' : 'LOSS'}
                        </span>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 to-transparent">
                        <div className="flex justify-between items-center">
                          <span className={`flex items-center text-sm font-bold ${trade.userAction === 'CALL' ? 'text-green-400' : 'text-red-400'}`}>
                            {trade.userAction === 'CALL' ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                            {trade.userAction}
                          </span>
                          <span className="text-white font-mono text-sm">${trade.amountInvested}</span>
                        </div>
                      </div>
                    </div>

                    {/* Details Footer */}
                    <div className="p-4 flex justify-between items-center bg-gray-900">
                      <span className="text-xs text-gray-500">#{displayTrades.length - idx}</span>
                      <span className={`font-mono font-bold ${trade.outcome === 'WIN' ? 'text-green-400' : 'text-red-400'}`}>
                        {trade.outcome === 'WIN' ? '+' : '-'}${trade.outcome === 'WIN' ? (trade.amountInvested * (trade.payout / 100)).toFixed(2) : trade.amountInvested.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 opacity-30">
                <Crosshair className="w-16 h-16 mx-auto mb-4" />
                <p className="text-xl">No hay operaciones registradas este día</p>
              </div>
            )}

          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-600">
            <p>Selecciona un día en la línea de tiempo</p>
          </div>
        )}
      </div>

      {/* NEW TRADE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <TradeWorkflow
            onSave={handleNewTradeSave}
            onCancel={() => setIsModalOpen(false)}
          />
        </div>
      )}

      {/* LIGHTBOX / GALLERY MODAL */}
      {viewTrade && (
        <div
          className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setViewTrade(null)}
        >
          <button
            onClick={() => setViewTrade(null)}
            className="absolute top-4 right-4 p-2 bg-gray-800 rounded-full text-white hover:bg-red-500 hover:text-white transition-colors z-50"
          >
            <X size={24} />
          </button>

          {/* Navigation Buttons */}
          <button
            onClick={(e) => { e.stopPropagation(); navigateTrade('prev'); }}
            disabled={displayTrades.indexOf(viewTrade) === 0}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-gray-800/50 hover:bg-sniper-blue hover:text-black text-white rounded-full transition-all disabled:opacity-0 disabled:pointer-events-none z-50"
          >
            <ChevronLeft size={32} />
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); navigateTrade('next'); }}
            disabled={displayTrades.indexOf(viewTrade) === displayTrades.length - 1}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-gray-800/50 hover:bg-sniper-blue hover:text-black text-white rounded-full transition-all disabled:opacity-0 disabled:pointer-events-none z-50"
          >
            <ChevronRight size={32} />
          </button>

          <div
            className="relative max-w-[90vw] max-h-[85vh] flex flex-col items-center"
            onClick={e => e.stopPropagation()}
          >
            <img
              src={`data:${viewTrade.tradeImage.mimeType};base64,${viewTrade.tradeImage.base64}`}
              alt="Full View"
              className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-2xl border border-gray-800 bg-black"
            />

            <div className="mt-6 flex flex-wrap items-center justify-center gap-4 md:gap-6 bg-gray-900/80 px-8 py-4 rounded-full border border-gray-700 backdrop-blur-sm shadow-xl">
              <div className={`flex items-center text-lg font-bold ${viewTrade.userAction === 'CALL' ? 'text-green-400' : 'text-red-400'}`}>
                {viewTrade.userAction === 'CALL' ? <TrendingUp className="mr-2" /> : <TrendingDown className="mr-2" />}
                {viewTrade.userAction}
              </div>
              <div className="h-6 w-px bg-gray-700"></div>
              <div className="font-mono text-xl text-white">
                ${viewTrade.amountInvested}
              </div>
              <div className="h-6 w-px bg-gray-700"></div>
              <div className={`text-xl font-bold px-3 py-1 rounded ${viewTrade.outcome === 'WIN' ? 'bg-green-500 text-black' : 'bg-red-500 text-white'}`}>
                {viewTrade.outcome === 'WIN' ? 'WIN' : 'LOSS'}
              </div>

              <span className="text-xs text-gray-500 ml-2">
                {displayTrades.indexOf(viewTrade) + 1} / {displayTrades.length}
              </span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};