// App.tsx - FIXED VERSION
import * as React from 'react';
const { useState, useEffect } = React;
import { 
  StyleSheet, 
  Text, 
  View, 
  SafeAreaView, 
  ScrollView,
  Alert 
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AmountInput } from './src/components/AmountInput';
import { CategoryGrid } from './src/components/CategoryGrid';
import { NumberPad } from './src/components/NumberPad';

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

export default function App() {
  const [amount, setAmount] = useState('');
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    loadTransactions();
  }, []);

  useEffect(() => {
    if (transactions.length > 0) {
      saveTransactions();
    }
  }, [transactions]);

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

  const saveTransactions = async () => {
    try {
      await AsyncStorage.setItem('@transactions', JSON.stringify(transactions));
    } catch (e) {
      console.log('Save error:', e);
    }
  };

  const handleNumberPress = (num) => {
  console.log('Current amount:', amount);
  console.log('Pressing:', num);
  
  if (amount.length < 9) {
    const newAmount = amount + num;
    console.log('New amount:', newAmount);
    setAmount(newAmount);
  }
  };

  const handleCategorySelect = (category) => {
    if (!amount || amount === '0') {
      Alert.alert('Nhập số tiền', 'Vui lòng nhập số tiền trước');
      return;
    }

    const newTransaction = {
      id: Date.now().toString(),
      amount: parseInt(amount),
      category: category,
      timestamp: new Date().toISOString(),
    };

    setTransactions([newTransaction, ...transactions]);
    setAmount('');
    
    Alert.alert('✅', 'Đã lưu!', [{ text: 'OK' }], { cancelable: true });
  };

  const todayTotal = transactions
    .filter(t => {
      const today = new Date().toDateString();
      const tDate = new Date(t.timestamp).toDateString();
      return today === tDate;
    })
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.dateText}>Hôm nay</Text>
          <Text style={styles.totalText}>
            {todayTotal.toLocaleString('vi-VN')}₫
          </Text>
        </View>

        <AmountInput amount={amount} />

        <NumberPad
          onNumberPress={handleNumberPress}
          onDeletePress={() => setAmount(amount.slice(0, -1))}
          onClearPress={() => setAmount('')}
        />

        <CategoryGrid
          categories={CATEGORIES}
          onSelectCategory={handleCategorySelect}
        />

        {transactions.length > 0 && (
          <View style={styles.transactionList}>
            <Text style={styles.sectionTitle}>Gần đây</Text>
            {transactions.slice(0, 5).map((t) => (
              <View key={t.id} style={styles.transactionItem}>
                <View style={styles.transactionLeft}>
                  <Text style={styles.transactionIcon}>{t.category.icon}</Text>
                  <Text>{t.category.name}</Text>
                </View>
                <Text style={styles.transactionAmount}>
                  {t.amount.toLocaleString('vi-VN')}₫
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 10,
  },
  dateText: {
    fontSize: 16,
    color: '#666666',
  },
  totalText: {
    fontSize: 24,
    fontWeight: '600',
    marginTop: 4,
    color: '#000000',
  },
  transactionList: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transactionIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '500',
  },
}); // <-- FIXED: Proper closing