// src/services/transactionService.ts - NO AUTH VERSION
import { supabase } from '../lib/supabase';
import { Transaction, ExpenseType } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Fixed user ID để skip auth
const FIXED_USER_ID = '00000000-0000-0000-0000-000000000000';

export class TransactionService {
  // Get user's expenses (no auth required)
  static async getExpenses(): Promise<Transaction[]> {
    try {
      console.log('📊 Fetching expenses from Supabase (no auth)...');
      
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .order('transaction_date', { ascending: false });

      if (error) {
        console.error('Supabase getExpenses error:', error);
        throw error;
      }

      console.log(`📊 Raw Supabase data: ${data?.length || 0} records`);

      // Transform to match current Transaction interface exactly
      return data.map(expense => ({
        id: expense.id,
        amount: expense.amount,
        description: expense.description,
        categoryId: expense.category_id,
        categoryName: expense.category_name,
        categoryIcon: expense.category_icon,
        expenseType: expense.expense_type as ExpenseType,
        transactionDate: expense.transaction_date,
        createdAt: expense.created_at,
      }));
    } catch (error) {
      console.error('getExpenses failed:', error);
      throw error;
    }
  }

  // Add expense (no auth required - use fixed user ID)
  static async addExpense(transaction: Omit<Transaction, 'id'>): Promise<Transaction> {
    try {
      console.log('➕ Adding expense to Supabase (no auth)...');
      console.log('➕ Transaction data:', {
        amount: transaction.amount,
        category: transaction.categoryName,
        type: transaction.expenseType
      });

      const { data, error } = await supabase
        .from('expenses')
        .insert({
          user_id: FIXED_USER_ID, // Fixed user ID
          amount: transaction.amount,
          description: transaction.description || null,
          category_id: transaction.categoryId,
          category_name: transaction.categoryName,
          category_icon: transaction.categoryIcon,
          expense_type: transaction.expenseType,
          transaction_date: transaction.transactionDate,
        })
        .select()
        .single();

      if (error) {
        console.error('Supabase addExpense error:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        throw error;
      }

      console.log('✅ Expense added to Supabase:', data.id);

      // Transform response to Transaction interface
      return {
        id: data.id,
        amount: data.amount,
        description: data.description,
        categoryId: data.category_id,
        categoryName: data.category_name,
        categoryIcon: data.category_icon,
        expenseType: data.expense_type as ExpenseType,
        transactionDate: data.transaction_date,
        createdAt: data.created_at,
      };
    } catch (error) {
      console.error('addExpense failed:', error);
      throw error;
    }
  }

  // Delete expense (no auth required)
  static async deleteExpense(id: string): Promise<void> {
    try {
      console.log('🗑️ Deleting expense from Supabase:', id);
      
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Supabase deleteExpense error:', error);
        throw error;
      }

      console.log('✅ Expense deleted from Supabase');
    } catch (error) {
      console.error('deleteExpense failed:', error);
      throw error;
    }
  }

  // Get categories
  static async getCategories() {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_default', true)
        .order('id');

      if (error) {
        console.error('Supabase getCategories error:', error);
        throw error;
      }

      return data.map(cat => ({
        id: cat.id,
        name: cat.name,
        icon: cat.icon,
        defaultType: cat.default_type as ExpenseType,
      }));
    } catch (error) {
      console.error('getCategories failed:', error);
      throw error;
    }
  }

  // Migration from AsyncStorage (no auth required)
  static async migrateFromAsyncStorage(): Promise<{ 
    success: boolean; 
    imported: number; 
    error?: string 
  }> {
    try {
      console.log('🔄 Starting migration from AsyncStorage (no auth)...');
      
      // Check if migration already done
      const migrationFlag = await AsyncStorage.getItem('@migration_completed');
      if (migrationFlag) {
        console.log('✅ Migration already completed');
        return { success: true, imported: 0 };
      }

      // Get local data
      const localData = await AsyncStorage.getItem('@transactions');
      if (!localData) {
        console.log('ℹ️ No local data to migrate');
        await AsyncStorage.setItem('@migration_completed', 'true');
        return { success: true, imported: 0 };
      }

      const transactions: Transaction[] = JSON.parse(localData);
      console.log(`📊 Found ${transactions.length} local transactions to migrate`);

      // Transform to Supabase format
      const expensesToInsert = transactions.map(t => ({
        user_id: FIXED_USER_ID, // Use fixed user ID
        amount: t.amount,
        description: t.description || null,
        category_id: t.categoryId,
        category_name: t.categoryName,
        category_icon: t.categoryIcon,
        expense_type: t.expenseType,
        transaction_date: t.transactionDate,
      }));

      console.log('📊 Inserting expenses to Supabase...');
      console.log('📊 Sample expense:', expensesToInsert[0]);

      // Batch insert with error handling
      const { data, error } = await supabase
        .from('expenses')
        .insert(expensesToInsert)
        .select();

      if (error) {
        console.error('Migration insert error:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        throw error;
      }

      // Mark migration as completed
      await AsyncStorage.setItem('@migration_completed', 'true');
      
      console.log(`✅ Successfully migrated ${transactions.length} transactions`);
      console.log(`📊 Inserted ${data?.length || 0} records to Supabase`);

      return { success: true, imported: transactions.length };
    } catch (error) {
      console.error('❌ Migration error:', error);
      return { 
        success: false, 
        imported: 0, 
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Check if migration needed
  static async needsMigration(): Promise<boolean> {
    try {
      const migrationFlag = await AsyncStorage.getItem('@migration_completed');
      const localData = await AsyncStorage.getItem('@transactions');
      
      return !migrationFlag && !!localData;
    } catch {
      return false;
    }
  }
}