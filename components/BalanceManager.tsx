import React, { useState } from 'react';

interface BalanceManagerProps {
  initialBalance: number | null;
  currentBalance: number | null;
  onSetBalance: (balance: number) => void;
}

const BalanceManager: React.FC<BalanceManagerProps> = ({ initialBalance, currentBalance, onSetBalance }) => {
  const [inputBalance, setInputBalance] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const balance = parseFloat(inputBalance);
    if (!isNaN(balance) && balance > 0) {
      onSetBalance(balance);
    }
  };

  if (initialBalance === null) {
    return (
      <div className="futuristic-panel">
        <h2 className="text-xl font-bold text-glow-cyan mb-4 uppercase">Iniciar Sesión</h2>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-4">
          <label htmlFor="initial-balance" className="font-semibold whitespace-nowrap">Capital Inicial ($):</label>
          <input
            type="number"
            id="initial-balance"
            value={inputBalance}
            onChange={(e) => setInputBalance(e.target.value)}
            className="futuristic-input rounded-md p-2 w-full sm:w-48 text-black focus:ring-0 focus:ring-offset-0 focus:border-cyan-400"
            placeholder="Ej: 1000"
            required
            min="1"
            step="any"
          />
          <button type="submit" className="font-bold py-2.5 px-4 rounded-md transition-all text-sm w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white">
            Establecer Capital
          </button>
        </form>
      </div>
    );
  }
  
  const profitLoss = currentBalance! - initialBalance;
  const plPercentage = initialBalance > 0 ? (profitLoss / initialBalance) * 100 : 0;
  const plColor = profitLoss >= 0 ? 'text-cyan' : 'text-magenta';

  return (
    <div className="futuristic-panel grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
        <div>
            <p className="text-sm text-gray-400 uppercase">Capital Inicial</p>
            <p className="text-xl font-bold">${initialBalance.toFixed(2)}</p>
        </div>
        <div>
            <p className="text-sm text-gray-400 uppercase">Capital Actual</p>
            <p className="text-2xl font-bold text-glow-cyan">${currentBalance!.toFixed(2)}</p>
        </div>
        <div>
            <p className="text-sm text-gray-400 uppercase">P/L Sesión</p>
            <p className={`text-xl font-bold ${profitLoss >= 0 ? 'text-glow-cyan' : 'text-glow-magenta'}`}>
                {profitLoss >= 0 ? '+' : ''}${profitLoss.toFixed(2)} ({plPercentage.toFixed(2)}%)
            </p>
        </div>
    </div>
  );
};

export default BalanceManager;