export interface VisualTrade {
  id: string;
  tradeImage: {
    base64: string;
    mimeType: string;
  };
  userAction: 'CALL' | 'PUT' | null;
  outcome: 'WIN' | 'LOSS' | null;
  amountInvested: number;
  payout: number;
}
