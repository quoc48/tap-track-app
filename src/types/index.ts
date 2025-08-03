// src/types/index.ts - COMPLETE FILE
export interface Transaction {
  id: string;
  amount: number;
  description?: string;
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
  expenseType: ExpenseType;
  transactionDate: string;
  createdAt: string;
}

export enum ExpenseType {
  REQUIRED = 'required',
  INCIDENTAL = 'incidental',
  WASTEFUL = 'wasteful'
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  defaultType?: ExpenseType;
}

export interface CategoryStat {
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
  count: number;
  totalAmount: number;
}

export interface DailySummary {
  date: string;
  total: number;
  transactions: Transaction[];
}