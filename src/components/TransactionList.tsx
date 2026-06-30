import React, { useState, useMemo } from 'react';
import { Transaction, TransactionCategory, TransactionStatus } from '../types';
import { 
  ShoppingBag, 
  Utensils, 
  Film, 
  Zap, 
  ArrowLeftRight, 
  TrendingUp, 
  Search, 
  Filter,
  CheckCircle,
  Clock,
  AlertCircle,
  ArrowDownLeft,
  ArrowUpRight,
  Inbox
} from 'lucide-react';

interface TransactionListProps {
  transactions: Transaction[];
  cardId: string;
}

export const TransactionList: React.FC<TransactionListProps> = ({ transactions, cardId }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Filter the transactions based on selected card, search, category, and status
  const cardTransactions = useMemo(() => {
    return transactions.filter(tx => tx.cardId === cardId);
  }, [transactions, cardId]);

  const filteredTransactions = useMemo(() => {
    return cardTransactions.filter((tx) => {
      const matchesSearch = tx.merchant.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || tx.category === selectedCategory;
      const matchesStatus = selectedStatus === 'all' || tx.status === selectedStatus;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [cardTransactions, searchTerm, selectedCategory, selectedStatus]);

  // Compute stats for current filtered selection
  const stats = useMemo(() => {
    let income = 0;
    let expenses = 0;
    filteredTransactions.forEach((tx) => {
      if (tx.status === 'approved') {
        if (tx.amount > 0) {
          income += tx.amount;
        } else {
          expenses += Math.abs(tx.amount);
        }
      }
    });
    return { income, expenses };
  }, [filteredTransactions]);

  // Map categories to appropriate styling
  const getCategoryIcon = (category: TransactionCategory) => {
    switch (category) {
      case 'shopping':
        return <ShoppingBag className="w-4 h-4 text-purple-600" />;
      case 'dining':
        return <Utensils className="w-4 h-4 text-amber-600" />;
      case 'entertainment':
        return <Film className="w-4 h-4 text-rose-600" />;
      case 'utilities':
        return <Zap className="w-4 h-4 text-blue-600" />;
      case 'transfer':
        return <ArrowLeftRight className="w-4 h-4 text-indigo-600" />;
      case 'funding':
        return <TrendingUp className="w-4 h-4 text-emerald-600" />;
    }
  };

  const getCategoryBg = (category: TransactionCategory) => {
    switch (category) {
      case 'shopping': return 'bg-purple-50';
      case 'dining': return 'bg-amber-50';
      case 'entertainment': return 'bg-rose-50';
      case 'utilities': return 'bg-blue-50';
      case 'transfer': return 'bg-indigo-50';
      case 'funding': return 'bg-emerald-50';
    }
  };

  const getStatusIcon = (status: TransactionStatus) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-3.5 h-3.5 text-emerald-500" title="Approved" />;
      case 'pending':
        return <Clock className="w-3.5 h-3.5 text-amber-500 animate-spin-slow" title="Pending" />;
      case 'declined':
        return <AlertCircle className="w-3.5 h-3.5 text-red-500" title="Declined" />;
    }
  };

  const getStatusColor = (status: TransactionStatus) => {
    switch (status) {
      case 'approved': return 'text-emerald-700 bg-emerald-50';
      case 'pending': return 'text-amber-700 bg-amber-50';
      case 'declined': return 'text-red-700 bg-red-50';
    }
  };

  // Human-readable category labels
  const categories: { value: string; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'shopping', label: 'Shopping' },
    { value: 'dining', label: 'Dining' },
    { value: 'entertainment', label: 'Entertainment' },
    { value: 'utilities', label: 'Utilities' },
    { value: 'transfer', label: 'Transfers' },
    { value: 'funding', label: 'Funding' },
  ];

  return (
    <div className="flex flex-col h-full bg-slate-50 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-slate-800 tracking-tight">Transaction History</h3>
        <span className="text-[11px] bg-slate-200 text-slate-700 font-medium px-2 py-0.5 rounded-full">
          {filteredTransactions.length} items
        </span>
      </div>

      {/* Search Input */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          id="input-transaction-search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search merchant or category..."
          className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-slate-700 placeholder-slate-400"
        />
      </div>

      {/* Filter Filters Rows */}
      <div className="flex flex-col space-y-2 mb-3">
        {/* Category Tabs Scroll */}
        <div className="flex overflow-x-auto scrollbar-none pb-1 -mx-1 px-1 space-x-1.5">
          {categories.map((cat) => (
            <button
              key={cat.value}
              id={`tab-cat-${cat.value}`}
              type="button"
              onClick={() => setSelectedCategory(cat.value)}
              className={`flex-shrink-0 px-3 py-1.5 text-[10px] font-semibold rounded-full transition-all border ${
                selectedCategory === cat.value
                  ? 'bg-slate-900 border-slate-900 text-white shadow-sm'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Status Filter Selector */}
        <div className="flex items-center space-x-2">
          <Filter className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          <span className="text-[10px] text-slate-500 font-medium">Status:</span>
          <div className="flex space-x-1">
            {['all', 'approved', 'pending', 'declined'].map((status) => (
              <button
                key={status}
                id={`btn-status-filter-${status}`}
                type="button"
                onClick={() => setSelectedStatus(status)}
                className={`px-2 py-0.5 text-[9px] font-medium rounded-md uppercase tracking-wider transition-all border ${
                  selectedStatus === status
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-semibold'
                    : 'bg-white border-slate-100 text-slate-500 hover:border-slate-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Mini ledger metrics showing approved flow */}
      {filteredTransactions.length > 0 && (
        <div className="grid grid-cols-2 gap-2 p-2 bg-white rounded-lg border border-slate-200/60 mb-3 text-[11px]">
          <div className="flex items-center space-x-1.5 border-r border-slate-100">
            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500" />
            <div>
              <span className="text-[9px] text-slate-400 block font-medium">Total Funded</span>
              <span className="font-mono font-bold text-emerald-600">₦{stats.income.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          </div>
          <div className="flex items-center space-x-1.5 pl-1">
            <ArrowDownLeft className="w-3.5 h-3.5 text-slate-500" />
            <div>
              <span className="text-[9px] text-slate-400 block font-medium">Total Spent</span>
              <span className="font-mono font-bold text-slate-700">₦{stats.expenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>
      )}

      {/* Transaction List Body */}
      <div className="flex-1 overflow-y-auto max-h-[220px] scrollbar-thin">
        {filteredTransactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center text-slate-400">
            <Inbox className="w-8 h-8 text-slate-300 mb-1.5" />
            <p className="text-xs font-semibold">No Transactions Found</p>
            <p className="text-[10px] text-slate-400 max-w-[200px] mt-0.5">
              {searchTerm || selectedCategory !== 'all' || selectedStatus !== 'all'
                ? "Try updating your search query or status filters."
                : "This card doesn't have any activity history yet."}
            </p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {filteredTransactions.map((tx) => {
              const isPositive = tx.amount > 0;
              const formattedDate = new Date(tx.date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={tx.id}
                  className={`flex items-center justify-between p-2 rounded-lg bg-white border border-slate-100 hover:border-slate-200 transition-all ${
                    tx.status === 'declined' ? 'opacity-80' : ''
                  }`}
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    {/* Category Icon */}
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${getCategoryBg(tx.category)}`}>
                      {getCategoryIcon(tx.category)}
                    </div>

                    {/* Merchant & Date */}
                    <div className="min-w-0">
                      <div className="flex items-center space-x-1">
                        <p className="text-xs font-bold text-slate-800 truncate max-w-[120px]">
                          {tx.merchant}
                        </p>
                        <span className="flex-shrink-0">
                          {getStatusIcon(tx.status)}
                        </span>
                      </div>
                      <p className="text-[9px] text-slate-400 font-medium">
                        {formattedDate}
                      </p>
                    </div>
                  </div>

                  {/* Transaction Amount */}
                  <div className="text-right">
                    <p className={`text-xs font-bold font-mono ${
                      tx.status === 'declined'
                        ? 'text-red-400 line-through'
                        : isPositive
                          ? 'text-emerald-600'
                          : 'text-slate-700'
                    }`}>
                      {isPositive ? '+' : '-'}₦{Math.abs(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <span className={`text-[8px] px-1 py-0.2 rounded font-mono font-semibold uppercase ${getStatusColor(tx.status)}`}>
                      {tx.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
