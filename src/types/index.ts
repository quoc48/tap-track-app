// Tạo file: src/types/index.ts
export interface Transaction {
  id: string;
  amount: number;
  category: Category;
  date: Date;
  createdAt: Date;
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