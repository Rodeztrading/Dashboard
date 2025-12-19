import React, { useState, useEffect } from 'react';
import {
    Account,
    Transaction,
    FinancialSummary,
    AccountType,
    TransactionType
} from '../types';
import {
    getAllAccounts,
    createAccount,
    getAllTransactions,
    createTransaction,
    getFinancialSummary
} from '../services/budgetService';
import { useAuth } from '../hooks/useAuth';
import { AddAccountModal } from './AddAccountModal';
import { AddTransactionModal } from './AddTransactionModal';
import { CategoriesView } from './CategoriesView';
import { BillsView } from './BillsView';
import { MonthlyTransactionsModal } from './MonthlyTransactionsModal';
import {
    Wallet,
    TrendingUp,
    TrendingDown,
    PiggyBank,
    CreditCard,
    Plus,
    DollarSign,
    Calendar,
    ArrowUpRight,
    ArrowDownRight,
    List,
    FileText
} from 'lucide-react';

interface BudgetViewProps { }

type Tab = 'ACCOUNTS' | 'CATEGORIES' | 'BILLS';

export const BudgetView: React.FC<BudgetViewProps> = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<Tab>('ACCOUNTS');
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [summary, setSummary] = useState<FinancialSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [showAddAccount, setShowAddAccount] = useState(false);
    const [showAddTransaction, setShowAddTransaction] = useState(false);
    const [showMonthlyModal, setShowMonthlyModal] = useState(false);
    const [monthlyModalType, setMonthlyModalType] = useState<TransactionType>(TransactionType.INCOME);

    // Load data
    useEffect(() => {
        if (user && activeTab === 'ACCOUNTS') {
            loadData();
        }
    }, [user, activeTab]);

    const loadData = async () => {
        if (!user) return;
        try {
            setLoading(true);
            const [accountsData, transactionsData, summaryData] = await Promise.all([
                getAllAccounts(user.uid),
                getAllTransactions(user.uid),
                getFinancialSummary(user.uid),
            ]);

            setAccounts(accountsData);
            setTransactions(transactionsData);
            setSummary(summaryData);
        } catch (error) {
            console.error('Error loading budget data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddAccount = async (accountData: Omit<Account, 'id' | 'createdAt'>) => {
        if (!user) return;
        try {
            await createAccount(accountData, user.uid);
            await loadData();
            setShowAddAccount(false);
        } catch (error) {
            console.error('Error adding account:', error);
            alert('Error al crear la cuenta');
        }
    };

    const handleAddTransaction = async (transactionData: Omit<Transaction, 'id' | 'createdAt'>) => {
        if (!user) return;
        try {
            await createTransaction(transactionData, user.uid);
            await loadData();
            setShowAddTransaction(false);
        } catch (error) {
            console.error('Error adding transaction:', error);
            alert('Error al crear la transacción');
        }
    };

    const getAccountIcon = (type: AccountType) => {
        switch (type) {
            case AccountType.CASH:
                return <Wallet className="w-5 h-5" />;
            case AccountType.BANK:
                return <CreditCard className="w-5 h-5" />;
            case AccountType.SAVINGS:
                return <PiggyBank className="w-5 h-5" />;
            case AccountType.CREDIT_CARD:
                return <CreditCard className="w-5 h-5" />;
            default:
                return <DollarSign className="w-5 h-5" />;
        }
    };

    const getAccountTypeName = (type: AccountType) => {
        switch (type) {
            case AccountType.CASH:
                return 'Efectivo';
            case AccountType.BANK:
                return 'Banco';
            case AccountType.SAVINGS:
                return 'Ahorros';
            case AccountType.CREDIT_CARD:
                return 'Tarjeta de Crédito';
            default:
                return type;
        }
    };

    const renderAccountsTab = () => {
        if (loading) {
            return (
                <div className="flex items-center justify-center py-12">
                    <div className="text-gray-400">Cargando...</div>
                </div>
            );
        }

        return (
            <div className="space-y-6">
                {/* Financial Summary */}
                {summary && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Total Balance */}
                        <div className="bg-gradient-to-br from-blue-900/50 to-blue-800/30 border border-blue-700/50 rounded-xl p-6">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-blue-300 text-sm font-medium">Balance Total</span>
                                <DollarSign className="w-5 h-5 text-blue-400" />
                            </div>
                            <div className="text-3xl font-bold text-white">
                                ${summary.totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                        </div>

                        {/* Monthly Income */}
                        <div
                            onClick={() => {
                                setMonthlyModalType(TransactionType.INCOME);
                                setShowMonthlyModal(true);
                            }}
                            className="bg-gradient-to-br from-green-900/50 to-green-800/30 border border-green-700/50 rounded-xl p-6 cursor-pointer hover:border-green-500 transition-all group relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="flex items-center justify-between mb-2 relative z-10">
                                <span className="text-green-300 text-sm font-medium group-hover:text-green-200">Ingresos del Mes</span>
                                <ArrowUpRight className="w-5 h-5 text-green-400 group-hover:scale-110 transition-transform" />
                            </div>
                            <div className="text-3xl font-bold text-white relative z-10">
                                +${summary.monthlyIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                            <div className="text-xs text-green-400/70 mt-2 flex items-center relative z-10">
                                <Calendar className="w-3 h-3 mr-1" />
                                Ver detalle mensual
                            </div>
                        </div>

                        {/* Monthly Expenses */}
                        <div
                            onClick={() => {
                                setMonthlyModalType(TransactionType.EXPENSE);
                                setShowMonthlyModal(true);
                            }}
                            className="bg-gradient-to-br from-red-900/50 to-red-800/30 border border-red-700/50 rounded-xl p-6 cursor-pointer hover:border-red-500 transition-all group relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="flex items-center justify-between mb-2 relative z-10">
                                <span className="text-red-300 text-sm font-medium group-hover:text-red-200">Gastos del Mes</span>
                                <ArrowDownRight className="w-5 h-5 text-red-400 group-hover:scale-110 transition-transform" />
                            </div>
                            <div className="text-3xl font-bold text-white relative z-10">
                                -${summary.monthlyExpenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                            <div className="text-xs text-red-400/70 mt-2 flex items-center relative z-10">
                                <Calendar className="w-3 h-3 mr-1" />
                                Ver detalle mensual
                            </div>
                        </div>

                        {/* Net Balance */}
                        <div className={`bg-gradient-to-br ${summary.netBalance >= 0 ? 'from-purple-900/50 to-purple-800/30 border-purple-700/50' : 'from-orange-900/50 to-orange-800/30 border-orange-700/50'} border rounded-xl p-6`}>
                            <div className="flex items-center justify-between mb-2">
                                <span className={`${summary.netBalance >= 0 ? 'text-purple-300' : 'text-orange-300'} text-sm font-medium`}>
                                    Balance Neto
                                </span>
                                <TrendingUp className={`w-5 h-5 ${summary.netBalance >= 0 ? 'text-purple-400' : 'text-orange-400'}`} />
                            </div>
                            <div className="text-3xl font-bold text-white">
                                {summary.netBalance >= 0 ? '+' : ''}${summary.netBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                        </div>
                    </div>
                )}

                {/* Accounts */}
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-white">Cuentas</h2>
                        <button
                            onClick={() => setShowAddAccount(true)}
                            className="text-sm text-rodez-red hover:text-blue-400 transition-colors"
                        >
                            + Agregar Cuenta
                        </button>
                    </div>

                    {accounts.length === 0 ? (
                        <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
                            <Wallet className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                            <p className="text-gray-400">No tienes cuentas registradas</p>
                            <button
                                onClick={() => setShowAddAccount(true)}
                                className="mt-4 px-4 py-2 bg-rodez-red hover:bg-blue-600 text-white rounded-lg transition-colors"
                            >
                                Crear Primera Cuenta
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {accounts.map(account => (
                                <div
                                    key={account.id}
                                    className="bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-xl p-6 transition-all"
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center space-x-3">
                                            <div className={`p-2 rounded-lg ${account.color || 'bg-gray-800'}`}>
                                                {getAccountIcon(account.type)}
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-white">{account.name}</h3>
                                                <p className="text-xs text-gray-500">{getAccountTypeName(account.type)}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-2xl font-bold text-white">
                                        ${account.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">{account.currency}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>


            </div>
        );
    };

    return (
        <div className="h-full overflow-y-auto bg-gray-950 p-4 md:p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Presupuesto</h1>
                        <p className="text-gray-400 mt-1">Gestión de finanzas personales</p>
                    </div>
                    <div className="flex space-x-3 w-full md:w-auto">
                        {activeTab === 'ACCOUNTS' && (
                            <button
                                onClick={() => setShowAddTransaction(true)}
                                className="px-4 py-2 bg-rodez-red hover:bg-blue-600 text-white rounded-lg flex items-center justify-center space-x-2 transition-colors w-full md:w-auto"
                                disabled={accounts.length === 0}
                            >
                                <Plus className="w-4 h-4" />
                                <span>Nueva Transacción</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex space-x-1 bg-gray-900 p-1 rounded-lg w-full md:w-fit overflow-x-auto">
                    <button
                        onClick={() => setActiveTab('ACCOUNTS')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-2 whitespace-nowrap ${activeTab === 'ACCOUNTS' ? 'bg-gray-800 text-white shadow-sm' : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                            }`}
                    >
                        <Wallet className="w-4 h-4" />
                        <span>Cuentas</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('CATEGORIES')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-2 whitespace-nowrap ${activeTab === 'CATEGORIES' ? 'bg-gray-800 text-white shadow-sm' : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                            }`}
                    >
                        <List className="w-4 h-4" />
                        <span>Categorías</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('BILLS')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-2 whitespace-nowrap ${activeTab === 'BILLS' ? 'bg-gray-800 text-white shadow-sm' : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                            }`}
                    >
                        <FileText className="w-4 h-4" />
                        <span>Facturas</span>
                    </button>
                </div>

                {/* Content */}
                <div className="mt-6">
                    {activeTab === 'ACCOUNTS' && renderAccountsTab()}
                    {activeTab === 'CATEGORIES' && <CategoriesView />}
                    {activeTab === 'BILLS' && <BillsView accounts={accounts} onRefresh={loadData} />}
                </div>
            </div>

            {/* Modals */}
            {showAddAccount && (
                <AddAccountModal
                    onClose={() => setShowAddAccount(false)}
                    onSave={handleAddAccount}
                />
            )}

            {showAddTransaction && (
                <AddTransactionModal
                    accounts={accounts}
                    onClose={() => setShowAddTransaction(false)}
                    onSave={handleAddTransaction}
                />
            )}

            <MonthlyTransactionsModal
                isOpen={showMonthlyModal}
                onClose={() => setShowMonthlyModal(false)}
                initialType={monthlyModalType}
            />
        </div>
    );
};
