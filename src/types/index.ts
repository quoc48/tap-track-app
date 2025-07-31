// File: src/types/index.ts
export interface Transaction {
  id: string;
  amount: number;
  title?: string;              // Optional title
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
  date: string;
  timestamp: number;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color?: string;
}

export interface DailySummary {
  date: string;
  total: number;
  transactions: Transaction[];
}