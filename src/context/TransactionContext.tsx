// src/context/TransactionContext.tsx - NO AUTH VERSION
import * as React from 'react';
const { createContext, useContext, useState, useEffect } = React;
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TransactionService } from '../services/transactionService';
import { Transaction, CategoryStat } from '../types';

interface TransactionContextType {
  transactions: Transaction[];
  loading: boolean;
  isAuthenticated: boolean;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  loadTransactions: () => Promise<void>;
  getWeeklyCategoryStats: () => CategoryStat[];
  migrateData: () => Promise<{ success: boolean; imported: number }>;
}

const TransactionContext = createContext<TransactionContextType | null>(null);

export const useTransactions = () => {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error('useTransactions must be used within TransactionProvider');
  }
  return context;
};

export const TransactionProvider = ({ children }: { children: React.ReactNode }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated] = useState(true); // Always authenticated for testing

  useEffect(() => {
    console.log('🔄 TransactionProvider initializing (no auth mode)...');
    initializeData();
  }, []);

  const initializeData = async () => {
    try {
      console.log('⚠️ TEMPORARILY SKIPPING DATA LOADING FOR DEBUGGING');
      // Temporarily skip loading transactions to test if this is the performance issue
      // await loadTransactions();
      // await checkAndMigrate();
      
      // Just set empty state for testing
      setTransactions([]);
    } catch (error) {
      console.error('❌ Initialize data failed:', error);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const loadTransactions = async () => {
    console.log('⚠️ COMPLETELY DISABLED loadTransactions for UI debugging');
    // Do nothing - completely disable all transaction loading
    setTransactions([]);
    return;
  };

  const loadTransactionsFromLocal = async () => {
    try {
      console.log('📱 Loading transactions from AsyncStorage...');
      const saved = await AsyncStorage.getItem('@transactions');
      if (saved) {
        const parsedData = JSON.parse(saved);
        
        // Handle legacy data migration
        const migratedData = parsedData.map((t: any) => {
          if (t.category && typeof t.category === 'object') {
            return {
              ...t,
              categoryId: t.categoryId || t.category.id,
              categoryName: t.categoryName || t.category.name,
              categoryIcon: t.categoryIcon || t.category.icon,
              expenseType: t.expenseType || 'incidental',
              transactionDate: t.transactionDate || t.timestamp,
              createdAt: t.createdAt || t.timestamp,
              description: t.description || t.title || undefined,
            };
          }
          return t;
        });
        
        console.log(`✅ Loaded ${migratedData.length} transactions from local storage`);
        setTransactions(migratedData);
      } else {
        console.log('ℹ️ No local transactions found');
        setTransactions([]);
      }
    } catch (e) {
      console.error('❌ Load from local storage failed:', e);
      setTransactions([]);
    }
  };

  const saveToLocalStorage = async (data: Transaction[]) => {
    try {
      console.log(`⚠️ SKIPPING LOCAL STORAGE SAVE - Would save ${data.length} transactions`);
      // Temporarily disable to test if this is causing UI freeze
      // await AsyncStorage.setItem('@transactions', JSON.stringify(data));
      // console.log(`💾 Saved ${data.length} transactions to local storage`);
    } catch (e) {
      console.error('❌ Save to local storage failed:', e);
    }
  };

  const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    let tempId = '';
    
    try {
      console.log('➕ Adding transaction (no auth):', transaction.amount, transaction.categoryName);
      
      // Generate optimistic ID
      tempId = `temp-${Date.now()}`;
      const tempTransaction: Transaction = {
        ...transaction,
        id: tempId,
        createdAt: transaction.createdAt || new Date().toISOString(),
      };

      // Optimistic update
      setTransactions(prev => {
        const newTransactions = [tempTransaction, ...prev];
        // Save to local storage asynchronously to avoid blocking UI
        setTimeout(() => saveToLocalStorage(newTransactions), 0);
        return newTransactions;
      });

      try {
        console.log('☁️ Saving to Supabase (no auth)...');
        const savedTransaction = await TransactionService.addExpense(transaction);
        
        // Replace temp transaction with real one
        setTransactions(prev => {
          const updatedTransactions = prev.map(t => t.id === tempId ? savedTransaction : t);
          // Save updated state to local storage asynchronously
          setTimeout(() => saveToLocalStorage(updatedTransactions), 0);
          return updatedTransactions;
        });
        
        console.log('✅ Transaction saved to Supabase with ID:', savedTransaction.id);
      } catch (supabaseError) {
        console.error('❌ Supabase save failed:', supabaseError);
        console.log('💾 Keeping temp transaction in local storage');
      }

    } catch (error) {
      console.error('❌ Add transaction failed:', error);
      
      // Revert optimistic update
      if (tempId) {
        setTransactions(prev => prev.filter(t => t.id !== tempId));
      }
      throw error;
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      console.log('🗑️ Deleting transaction (no auth):', id);
      
      // Optimistic update
      const originalTransactions = transactions;
      setTransactions(prev => prev.filter(t => t.id !== id));

      if (!id.startsWith('temp-')) {
        try {
          await TransactionService.deleteExpense(id);
          console.log('✅ Transaction deleted from Supabase');
        } catch (supabaseError) {
          console.error('❌ Supabase delete failed:', supabaseError);
          setTransactions(originalTransactions);
          throw supabaseError;
        }
      }

      // Update local storage
      const updatedTransactions = originalTransactions.filter(t => t.id !== id);
      await saveToLocalStorage(updatedTransactions);

    } catch (error) {
      console.error('❌ Delete transaction failed:', error);
      throw error;
    }
  };


  const getWeeklyCategoryStats = (): CategoryStat[] => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const weeklyTransactions = transactions.filter(t => {
      const transDate = new Date(t.transactionDate);
      return transDate >= weekAgo;
    });

    const statsMap = new Map<string, CategoryStat>();
    
    weeklyTransactions.forEach(t => {
      const catId = t.categoryId;
      if (statsMap.has(catId)) {
        const stat = statsMap.get(catId)!;
        stat.count += 1;
        stat.totalAmount += t.amount;
      } else {
        statsMap.set(catId, {
          categoryId: catId,
          categoryName: t.categoryName,
          categoryIcon: t.categoryIcon,
          count: 1,
          totalAmount: t.amount,
        });
      }
    });

    return Array.from(statsMap.values())
      .sort((a, b) => b.totalAmount - a.totalAmount)
      .slice(0, 3);
  };

  const migrateData = async (): Promise<{ success: boolean; imported: number }> => {
    try {
      console.log('🔄 Starting data migration (no auth)...');
      
      const result = await TransactionService.migrateFromAsyncStorage();
      
      if (result.success && result.imported > 0) {
        console.log(`✅ Migration completed: ${result.imported} transactions`);
        await loadTransactions();
      }
      
      return result;
    } catch (error) {
      console.error('❌ Migration failed:', error);
      return { success: false, imported: 0 };
    }
  };

  const checkAndMigrate = async () => {
    try {
      const needsMigration = await TransactionService.needsMigration();
      if (needsMigration) {
        console.log('🔄 Auto-migration needed');
        const result = await migrateData();
        
        if (result.success && result.imported > 0) {
          console.log(`🎉 Auto-migrated ${result.imported} transactions!`);
        }
      } else {
        console.log('ℹ️ No migration needed');
      }
    } catch (error) {
      console.error('❌ Auto-migration check failed:', error);
    }
  };

  return (
    <TransactionContext.Provider value={{
      transactions,
      loading,
      isAuthenticated,
      addTransaction,
      deleteTransaction,
      loadTransactions,
      getWeeklyCategoryStats,
      migrateData,
    }}>
      {children}
    </TransactionContext.Provider>
  );
};