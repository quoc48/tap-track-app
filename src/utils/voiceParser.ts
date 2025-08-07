import { CATEGORIES } from '../constants/categories';
import { Category, ExpenseType } from '../types';

interface ParsedTransaction {
  amount: number;
  category?: Category;
  description: string;
  expenseType?: ExpenseType;
  confidence: number;
}

// Vietnamese number patterns
const NUMBER_PATTERNS = {
  // Handle "k", "nghìn", "đồng", numbers
  amount: /(\d+(?:\.\d+)?)\s*(k|nghìn|đồng|dong)?/gi,
  // Handle written numbers
  writtenNumbers: {
    'một': 1, 'hai': 2, 'ba': 3, 'bốn': 4, 'năm': 5,
    'sáu': 6, 'bảy': 7, 'tám': 8, 'chín': 9, 'mười': 10,
    'mười một': 11, 'mười hai': 12, 'hai mười': 20, 'ba mười': 30,
    'trăm': 100, 'nghìn': 1000,
  }
};

// Category mapping with Vietnamese keywords (matching actual categories)
const CATEGORY_KEYWORDS = {
  'Cà phê': ['cà phê', 'cafe', 'coffee', 'caphe', 'cà-phê', 'tra sua', 'trà sữa', 'nước uống'],
  'Thực phẩm': ['ăn', 'phở', 'pho', 'cơm', 'bún', 'bánh', 'thức ăn', 'đồ ăn', 'ăn uống', 'cơm trưa', 'cơm tối', 'sáng', 'trưa', 'tối', 'food', 'rice', 'noodle'],
  'Đi lại': ['taxi', 'grab', 'xe om', 'xe ôm', 'bus', 'xe bus', 'xăng', 'di chuyển', 'đi lại', 'xe', 'đi', 'về'],
  'Tạp hoá': ['mua', 'shopping', 'siêu thị', 'chợ', 'cửa hàng', 'mua sắm', 'shop', 'tạp hoá'],
  'Giải trí': ['xem phim', 'phim', 'karaoke', 'bar', 'club', 'giải trí', 'vui chơi', 'movie'],
  'Sức khoẻ': ['thuốc', 'bệnh viện', 'khám', 'y tế', 'sức khỏe', 'doctor', 'medicine'],
  'Tiền nhà': ['điện', 'nước', 'internet', 'nhà', 'thuê nhà', 'tiền nhà', 'house', 'rent'],
  'Thời trang': ['quần áo', 'giày', 'thời trang', 'áo', 'quần', 'fashion'],
  'Quà vặt': ['snack', 'kẹo', 'bánh kẹo', 'quà vặt', 'ăn vặt'],
};

// Expense type keywords
const EXPENSE_TYPE_KEYWORDS = {
  [ExpenseType.REQUIRED]: ['cần thiết', 'quan trọng', 'phải có', 'thiết yếu'],
  [ExpenseType.ENTERTAINMENT]: ['giải trí', 'vui chơi', 'thích', 'muốn'],
  [ExpenseType.INVESTMENT]: ['đầu tư', 'investment', 'mua vào', 'tiết kiệm'],
};

export function parseVietnameseTransaction(text: string): ParsedTransaction {
  const originalText = text.toLowerCase().trim();
  console.log('Parsing voice input:', originalText);
  
  let confidence = 0;
  let amount = 0;
  let category: Category | undefined;
  let description = originalText;
  let expenseType: ExpenseType = ExpenseType.REQUIRED;

  // 1. Extract amount
  const amountResult = extractAmount(originalText);
  if (amountResult.amount > 0) {
    amount = amountResult.amount;
    confidence += 30;
    console.log('Extracted amount:', amount);
  }

  // 2. Detect category
  const categoryResult = detectCategory(originalText);
  if (categoryResult.category) {
    category = categoryResult.category;
    confidence += 40;
    console.log('Detected category:', category.name);
  }

  // 3. Detect expense type
  const typeResult = detectExpenseType(originalText);
  if (typeResult.type) {
    expenseType = typeResult.type;
    confidence += 10;
  }

  // 4. Clean up description
  description = cleanDescription(originalText, amount, category);
  
  if (description.trim()) {
    confidence += 20;
  }

  return {
    amount,
    category,
    description: description || originalText,
    expenseType,
    confidence: Math.min(confidence, 100),
  };
}

function extractAmount(text: string): { amount: number; confidence: number } {
  // Try to find number patterns
  const matches = Array.from(text.matchAll(NUMBER_PATTERNS.amount));
  let bestAmount = 0;
  
  for (const match of matches) {
    let num = parseFloat(match[1]);
    const unit = match[2]?.toLowerCase();
    
    // Handle units
    if (unit === 'k' || unit === 'nghìn') {
      num *= 1000;
    }
    // 'đồng' doesn't change the value
    
    // Take the largest reasonable amount
    if (num > bestAmount && num < 10000000) { // Max 10M VND
      bestAmount = num;
    }
  }
  
  return { amount: bestAmount, confidence: bestAmount > 0 ? 100 : 0 };
}

function detectCategory(text: string): { category: Category | undefined; confidence: number } {
  let bestCategory: Category | undefined;
  let highestScore = 0;
  
  for (const [categoryName, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    let score = 0;
    
    for (const keyword of keywords) {
      if (text.includes(keyword.toLowerCase())) {
        score += keyword.length; // Longer keywords get higher scores
      }
    }
    
    if (score > highestScore) {
      highestScore = score;
      bestCategory = CATEGORIES.find(cat => cat.name === categoryName);
    }
  }
  
  return { 
    category: bestCategory, 
    confidence: highestScore > 0 ? Math.min(highestScore * 10, 100) : 0 
  };
}

function detectExpenseType(text: string): { type: ExpenseType | undefined; confidence: number } {
  for (const [type, keywords] of Object.entries(EXPENSE_TYPE_KEYWORDS)) {
    for (const keyword of keywords) {
      if (text.includes(keyword)) {
        return { type: type as ExpenseType, confidence: 80 };
      }
    }
  }
  
  return { type: undefined, confidence: 0 };
}

function cleanDescription(text: string, amount: number, category?: Category): string {
  let cleaned = text;
  
  // Remove amount patterns
  cleaned = cleaned.replace(NUMBER_PATTERNS.amount, '').trim();
  
  // Remove category keywords if found
  if (category) {
    const categoryKeywords = CATEGORY_KEYWORDS[category.name] || [];
    for (const keyword of categoryKeywords) {
      cleaned = cleaned.replace(new RegExp(keyword, 'gi'), '').trim();
    }
  }
  
  // Remove common words
  const commonWords = ['mua', 'chi', 'trả', 'tiền', 'đồng', 'vnd'];
  for (const word of commonWords) {
    cleaned = cleaned.replace(new RegExp(`\\b${word}\\b`, 'gi'), '').trim();
  }
  
  // Clean up extra spaces
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  
  return cleaned || (category ? `${category.name} ${amount.toLocaleString('vi-VN')}₫` : 'Giao dịch');
}

// Test examples
export const VOICE_EXAMPLES = [
  'mua cà phê 25 nghìn',
  'ăn phở 45k',
  'đi taxi 80 nghìn đồng',
  'mua sắm siêu thị 150k',
  'xem phim 120 nghìn',
];

console.log('Voice parser loaded with examples:', VOICE_EXAMPLES);