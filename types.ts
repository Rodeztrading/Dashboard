export interface VisualTrade {
  id: string;
  tradeImage: {
    base64: string;
    mimeType: string;
  };
  userAction: 'CALL' | 'PUT';
  outcome: 'WIN' | 'LOSS';
  amountInvested: number;
  payout: number;
  createdAt: number; // Timestamp
  // Optional result image for losses or specific confirmations
  resultImage?: {
    base64: string;
    mimeType: string;
  };
}

export interface TradingDay {
  date: string; // YYYY-MM-DD
  status: 'PENDING' | 'ACTIVE' | 'CLOSED' | 'WEEKEND';
  pnl: number;
  trades: VisualTrade[];
  itm: number;
  otm: number;
  dayOfWeek: number;
}

export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  SNIPER = 'SNIPER',
  SETTINGS = 'SETTINGS'
}