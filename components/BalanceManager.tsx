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
      setInputBalance('');
    }
  };

  if (initialBalance === null) {
    return (
      <div className="futuristic-panel p-4">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-glow-cyan uppercase">Iniciar Sesión de Trading</h3>
            <p className="text-text-secondary text-sm mt-1">Establece tu capital inicial para comenzar a registrar operaciones</p>
          </div>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-3">
            <div className="flex items-center gap-2">
              <label htmlFor="initial-balance" className="font-semibold whitespace-nowrap text-sm">Capital ($):</label>
              <input
                type="number"
                id="initial-balance"
                value={inputBalance}
                onChange={(e) => setInputBalance(e.target.value)}
                className="futuristic-input rounded-md p-2 w-32"
                placeholder="1000"
                min="1"
                step="any"
                required
              />
            </div>
            <button type="submit" className="futuristic-button font-bold py-2 px-4 rounded-lg whitespace-nowrap">
              Iniciar Sesión
            </button>
          </form>
        </div>
      </div>
    );
  }
  
  const profitLoss = currentBalance! - initialBalance;
  const plPercentage = initialBalance > 0 ? (profitLoss / initialBalance) * 100 : 0;
  const plColor = profitLoss >= 0 ? 'text-cyan' : 'text-magenta';

  return (
    <div className="futuristic-panel mb-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
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
