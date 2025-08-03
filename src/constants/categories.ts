import { Category, ExpenseType } from '../types';

export const CATEGORIES: Category[] = [
  { id: '1', name: 'Thời trang', icon: '👔', defaultType: ExpenseType.INCIDENTAL },
  { id: '2', name: 'Tạp hoá', icon: '🛒', defaultType: ExpenseType.REQUIRED },
  { id: '3', name: 'Thực phẩm', icon: '🍜', defaultType: ExpenseType.REQUIRED },
  { id: '4', name: 'Giáo dục', icon: '📚', defaultType: ExpenseType.REQUIRED },
  { id: '5', name: 'Tiền nhà', icon: '🏠', defaultType: ExpenseType.REQUIRED },
  { id: '6', name: 'Sức khoẻ', icon: '💊', defaultType: ExpenseType.REQUIRED },
  { id: '7', name: 'Giải trí', icon: '🎬', defaultType: ExpenseType.INCIDENTAL },
  { id: '8', name: 'Hoá đơn', icon: '📄', defaultType: ExpenseType.REQUIRED },
  { id: '9', name: 'Đi lại', icon: '🛵', defaultType: ExpenseType.REQUIRED },
  { id: '10', name: 'Du lịch', icon: '✈️', defaultType: ExpenseType.INCIDENTAL },
  { id: '11', name: 'Cà phê', icon: '☕', defaultType: ExpenseType.INCIDENTAL },
  { id: '12', name: 'Quà vặt', icon: '🍿', defaultType: ExpenseType.WASTEFUL },
  { id: '13', name: 'Biếu gia đình', icon: '🎁', defaultType: ExpenseType.INCIDENTAL },
  { id: '14', name: 'Tết', icon: '🧧', defaultType: ExpenseType.INCIDENTAL },
];

export const EXPENSE_TYPE_LABELS = {
  [ExpenseType.REQUIRED]: 'Phải chi',
  [ExpenseType.INCIDENTAL]: 'Phát sinh',
  [ExpenseType.WASTEFUL]: 'Lãng phí',
};

export const EXPENSE_TYPE_COLORS = {
  [ExpenseType.REQUIRED]: '#28A745',    // Green - necessary
  [ExpenseType.INCIDENTAL]: '#FFC107',  // Yellow - unexpected
  [ExpenseType.WASTEFUL]: '#DC3545',    // Red - wasteful
};