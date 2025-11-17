

/**
 * Represents a single trading operation with all its associated data.
 */
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
  aiAnalysis: string;
  createdAt: number;
}
