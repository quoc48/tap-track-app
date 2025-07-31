// File: src/store/useTransactionStore.ts
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Transaction {
  id: string;
  amount: number;
  title?: string;              // Added optional title
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
  date: string;
  timestamp: number;
}

interface TransactionStore {
  transactions: Transaction[];
  loading: boolean;
  
  // Actions
  addTransaction: (transaction: Omit<Transaction, 'id' | 'timestamp'>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  updateTransaction: (id: string, updates: Partial<Transaction>) => Promise<void>;
  loadTransactions: () => Promise<void>;
  
  // Getters
  getTodayTotal: () => number;
  getWeekTotal: () => number;
  getMonthTotal: () => number;
  getRecentTransactions: (limit?: number) => Transaction[];
  getTransactionsByDate: (date: string) => Transaction[];
}

const STORAGE_KEY = '@tap_track_transactions';

export const useTransactionStore = create<TransactionStore>((set, get) => ({
  transactions: [],
  loading: true,

  addTransaction: async (transaction) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
    };

    const updatedTransactions = [newTransaction, ...get().transactions];
    set({ transactions: updatedTransactions });
    
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTransactions));
    } catch (error) {
      console.error('Error saving transaction:', error);
    }
  },

  deleteTransaction: async (id) => {
    const updatedTransactions = get().transactions.filter(t => t.id !== id);
    set({ transactions: updatedTransactions });
    
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTransactions));
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  },

  updateTransaction: async (id, updates) => {
    const updatedTransactions = get().transactions.map(t => 
      t.id === id ? { ...t, ...updates } : t
    );
    set({ transactions: updatedTransactions });
    
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTransactions));
    } catch (error) {
      console.error('Error updating transaction:', error);
    }
  },

  loadTransactions: async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        set({ transactions: JSON.parse(stored), loading: false });
      } else {
        set({ loading: false });
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
      set({ loading: false });
    }
  },

  getTodayTotal: () => {
    const today = new Date().toISOString().split('T')[0];
    return get().transactions
      .filter(t => t.date.startsWith(today))
      .reduce((sum, t) => sum + t.amount, 0);
  },

  getWeekTotal: () => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    return get().transactions
      .filter(t => new Date(t.date) >= weekAgo)
      .reduce((sum, t) => sum + t.amount, 0);
  },

  getMonthTotal: () => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    
    return get().transactions
      .filter(t => new Date(t.date) >= monthStart)
      .reduce((sum, t) => sum + t.amount, 0);
  },

  getRecentTransactions: (limit = 5) => {
    return get().transactions.slice(0, limit);
  },

  getTransactionsByDate: (date) => {
    return get().transactions.filter(t => t.date.startsWith(date));
  },
}));