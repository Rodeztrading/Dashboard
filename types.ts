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
  BUDGET = 'BUDGET',
  SETTINGS = 'SETTINGS'
}

// ============================================
// BUDGET MODULE TYPES
// ============================================

export enum AccountType {
  CASH = 'CASH',
  BANK = 'BANK',
  SAVINGS = 'SAVINGS',
  CREDIT_CARD = 'CREDIT_CARD'
}

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
  currency: string;
  icon?: string;
  color?: string;
  createdAt: number;
}

export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
  TRANSFER = 'TRANSFER'
}

export enum ExpenseCategory {
  FOOD = 'Comida',
  TRANSPORT = 'Transporte',
  UTILITIES = 'Servicios',
  ENTERTAINMENT = 'Entretenimiento',
  HEALTH = 'Salud',
  EDUCATION = 'Educación',
  SHOPPING = 'Compras',
  BILLS = 'Facturas',
  RENT = 'Alquiler',
  SAVINGS_GOAL = 'Ahorro',
  OTHER = 'Otro'
}

export interface Subcategory {
  id: string;
  name: string;
  isDefault?: boolean;
}

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  subcategories: Subcategory[];
  color?: string;
  icon?: string;
  isDefault?: boolean;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  description: string;
  categoryId?: string; // ID de la categoría principal
  subcategoryId?: string; // ID de la subcategoría (opcional)
  categoryName?: string; // Legacy support or display name
  accountId: string;
  toAccountId?: string; // For transfers
  date: number;
  createdAt: number;
  isPending?: boolean; // Para facturas pendientes
  dueDate?: number; // Fecha de vencimiento para facturas
  isPaid?: boolean; // Si ya fue pagada
  recurringDebtId?: string; // ID de la deuda recurrente asociada
}

export interface RecurringDebt {
  id: string;
  name: string; // Ej: "Carro", "Casa", "Préstamo Personal"
  totalAmount: number; // Monto total de la deuda (ej: 200.000.000)
  remainingAmount: number; // Saldo pendiente
  monthlyPayment: number; // Cuota mensual (ej: 5.000.000)
  categoryId?: string;
  subcategoryId?: string;
  accountId: string; // Cuenta desde la que se paga
  startDate: number; // Fecha de inicio de la deuda
  dueDay: number; // Día del mes en que vence (1-31)
  isActive: boolean; // Si está activa o ya fue pagada completamente
  createdAt: number;
}

export interface MonthlyBudget {
  id: string;
  month: string; // Format: "YYYY-MM"
  income: number;
  expenses: number;
  savings: number;
  categoryBudgets: Record<string, number>; // categoryId -> amount
}

export interface FinancialSummary {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  netBalance: number;
  pendingBillsAmount?: number; // Total de facturas pendientes
  expensesByCategory: {
    category: string;
    amount: number;
    percentage: number;
  }[];
}