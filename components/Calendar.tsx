import React, { useState } from 'react';
import type { VisualTrade } from '../types';

interface CalendarProps {
  trades: VisualTrade[];
  selectedDate: Date | null;
  onDateSelect: (date: Date | null) => void;
  isMini?: boolean;
}

const Calendar: React.FC<CalendarProps> = ({ trades, selectedDate, onDateSelect, isMini = false }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const tradeDates = React.useMemo(() => 
    new Set(trades.map(trade => new Date(trade.id).toDateString())),
    [trades]
  );

  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const startDay = startOfMonth.getDay();
  const daysInMonth = endOfMonth.getDate();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };
  
  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const days = [];
  for (let i = 0; i < startDay; i++) {
    days.push(<div key={`empty-${i}`} className="p-1"></div>);
  }

  for (let i = 1; i <= daysInMonth; i++) {
    const dayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
    const dateString = dayDate.toDateString();
    const isToday = dateString === new Date().toDateString();
    const hasTrades = tradeDates.has(dateString);
    const isSelected = selectedDate?.toDateString() === dateString;

    let buttonClass = 'w-8 h-8 flex items-center justify-center rounded-full transition-colors duration-200 text-xs';
    if (isSelected) {
      buttonClass += ' bg-cyan text-black font-bold ring-2 ring-offset-2 ring-offset-panel-bg ring-cyan';
    } else if (isToday) {
      buttonClass += ' bg-cyan/30 text-white';
    } else {
      buttonClass += ' text-text-primary hover:bg-cyan/20';
    }
    if (hasTrades && !isSelected) {
        buttonClass += ' border border-cyan';
    }

    days.push(
      <div key={i} className="flex items-center justify-center">
        <button className={buttonClass} onClick={() => onDateSelect(dayDate)}>
          {i}
        </button>
      </div>
    );
  }

  const weekdays = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'];

  const containerClass = isMini ? "bg-background-dark/50 p-2 rounded-lg border border-border-color" : "futuristic-panel";

  return (
    <div className={containerClass}>
      <div className="flex items-center justify-between mb-2">
        <button onClick={handlePrevMonth} className="p-1 rounded-full hover:bg-cyan/20 text-text-secondary">&lt;</button>
        <h3 className="text-sm font-bold text-white capitalize">
          {currentDate.toLocaleString('es-ES', { month: 'short', year: 'numeric' })}
        </h3>
        <button onClick={handleNextMonth} className="p-1 rounded-full hover:bg-cyan/20 text-text-secondary">&gt;</button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-text-secondary mb-2">
        {weekdays.map(day => <div key={day}>{day.substring(0,2)}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days}
      </div>
    </div>
  );
};

export default Calendar;