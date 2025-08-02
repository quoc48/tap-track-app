// src/context/TransactionContext.tsx - SIMPLIFIED VERSION
import * as React from 'react';
const { createContext, useContext, useState, useEffect } = React;
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Transaction {
  id: string;
  amount: number;
  category: any;
  timestamp: string;
  title?: string;
}

interface CategoryStat {
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
  count: number;
  totalAmount: number;
}

interface TransactionContextType {
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  loadTransactions: () => Promise<void>;
  getWeeklyCategoryStats: () => CategoryStat[];
}

const TransactionContext = createContext<TransactionContextType>(null);

export const useTransactions = () => {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error('useTransactions must be used within TransactionProvider');
  }
  return context;
};

export const TransactionProvider = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      const saved = await AsyncStorage.getItem('@transactions');
      if (saved) {
        setTransactions(JSON.parse(saved));
      }
    } catch (e) {
      console.log('Load error:', e);
    }
  };

  const saveToStorage = async (data: Transaction[]) => {
    try {
      await AsyncStorage.setItem('@transactions', JSON.stringify(data));
    } catch (e) {
      console.log('Save error:', e);
    }
  };

  const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction = {
      ...transaction,
      id: Date.now().toString(),
    };
    const updated = [newTransaction, ...transactions];
    setTransactions(updated);
    await saveToStorage(updated);
  };

  const deleteTransaction = async (id: string) => {
    const updated = transactions.filter(t => t.id !== id);
    setTransactions(updated);
    await saveToStorage(updated);
  };

  const getWeeklyCategoryStats = (): CategoryStat[] => {
    // Get transactions from last 7 days
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const weeklyTransactions = transactions.filter(t => {
      const transDate = new Date(t.timestamp);
      return transDate >= weekAgo;
    });

    // Calculate stats by category
    const statsMap = new Map<string, CategoryStat>();
    
    weeklyTransactions.forEach(t => {
      const catId = t.category.id;
      if (statsMap.has(catId)) {
        const stat = statsMap.get(catId)!;
        stat.count += 1;
        stat.totalAmount += t.amount;
      } else {
        statsMap.set(catId, {
          categoryId: catId,
          categoryName: t.category.name,
          categoryIcon: t.category.icon,
          count: 1,
          totalAmount: t.amount,
        });
      }
    });

    // Sort by count and return top 3
    return Array.from(statsMap.values())
    .sort((a, b) => b.totalAmount - a.totalAmount)  // Sort by money
    .slice(0, 3);
  };

  return (
    <TransactionContext.Provider value={{
      transactions,
      addTransaction,
      deleteTransaction,
      loadTransactions,
      getWeeklyCategoryStats,
    }}>
      {children}
    </TransactionContext.Provider>
  );
};