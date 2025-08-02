// src/screens/AddScreen.tsx
import * as React from 'react';
const { useState, useRef } = React;
import { 
  StyleSheet, 
  Text, 
  View, 
  SafeAreaView, 
  ScrollView,
  Alert,
  TouchableOpacity,
  TextInput,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { AmountInput } from '../components/AmountInput';
import { CategoryGrid } from '../components/CategoryGrid';
import { useTransactions } from '../context/TransactionContext';

const CATEGORIES = [
  { id: '1', name: 'Cà phê', icon: '☕' },
  { id: '2', name: 'Ăn uống', icon: '🍜' },
  { id: '3', name: 'Di chuyển', icon: '🛵' },
  { id: '4', name: 'Mua sắm', icon: '🛒' },
  { id: '5', name: 'Giải trí', icon: '🎬' },
  { id: '6', name: 'Sức khỏe', icon: '💊' },
  { id: '7', name: 'Nhà cửa', icon: '🏠' },
  { id: '8', name: 'Khác', icon: '➕' },
];

export const AddScreen = () => {
  const [amount, setAmount] = useState('');
  const { transactions, addTransaction, getWeeklyCategoryStats } = useTransactions();
  const hiddenInputRef = useRef(null);

  // Get weekly stats
  const weeklyStats = getWeeklyCategoryStats();

  const handleAmountChange = (text) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    if (cleaned.length <= 9) {
      setAmount(cleaned);
    }
  };

  const handleCategorySelect = async (category) => {
    if (!amount || amount === '0') {
      Alert.alert('Nhập số tiền', 'Vui lòng nhập số tiền trước');
      return;
    }

    try {
      await addTransaction({
        amount: parseInt(amount),
        category: category,
        timestamp: new Date().toISOString(),
      });

      setAmount('');
      Keyboard.dismiss();
      Alert.alert('✅', 'Đã lưu!', [{ text: 'OK' }], { cancelable: true });
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể lưu giao dịch');
    }
  };

  const todayTotal = transactions
    .filter(t => {
      const today = new Date().toDateString();
      const tDate = new Date(t.timestamp).toDateString();
      return today === tDate;
    })
    .reduce((sum, t) => sum + t.amount, 0);

  const focusInput = () => {
    hiddenInputRef.current?.focus();
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.container}>
        <TextInput
          ref={hiddenInputRef}
          style={styles.hiddenInput}
          value={amount}
          onChangeText={handleAmountChange}
          keyboardType="number-pad"
          maxLength={9}
        />
        
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.dateText}>Hôm nay</Text>
            <Text style={styles.totalText}>
              {todayTotal.toLocaleString('vi-VN')}₫
            </Text>
          </View>

          <TouchableOpacity onPress={focusInput} activeOpacity={0.8}>
            <AmountInput amount={amount} />
          </TouchableOpacity>

          <View style={styles.instructionContainer}>
            <Text style={styles.instructionText}>
              Nhấn vào số tiền để nhập
            </Text>
          </View>

          <CategoryGrid
            categories={CATEGORIES}
            onSelectCategory={handleCategorySelect}
          />

          {weeklyStats.length > 0 && (
            <View style={styles.statsSection}>
              <Text style={styles.sectionTitle}>Top danh mục tuần này</Text>
              {weeklyStats.map((stat, index) => (
                <View key={stat.categoryId} style={styles.statItem}>
                  <View style={styles.statLeft}>
                    <Text style={styles.statRank}>#{index + 1}</Text>
                    <Text style={styles.statIcon}>{stat.categoryIcon}</Text>
                    <View>
                      <Text style={styles.statName}>{stat.categoryName}</Text>
                      <Text style={styles.statCount}>{stat.count} lần</Text>
                    </View>
                  </View>
                  <Text style={styles.statAmount}>
                    {stat.totalAmount.toLocaleString('vi-VN')}₫
                  </Text>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
  },
  hiddenInput: {
    position: 'absolute',
    left: -1000,
    top: -1000,
  },
  header: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 20,
  },
  dateText: {
    fontSize: 16,
    color: '#666666',
  },
  totalText: {
    fontSize: 28,
    fontWeight: '600',
    marginTop: 4,
    color: '#000000',
  },
  instructionContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  instructionText: {
    fontSize: 12,
    color: '#999',
  },
  statsSection: {
    padding: 20,
    backgroundColor: '#F8F9FA',
    marginTop: 10,
  },
  statItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
  },
  statLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statRank: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
    marginRight: 12,
  },
  statIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  statName: {
    fontSize: 15,
    fontWeight: '500',
  },
  statCount: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  statAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#28A745',
  },
});