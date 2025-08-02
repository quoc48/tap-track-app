// App.tsx - FULL CODE với Report Modal
import * as React from 'react';
const { useState, useEffect } = React;
import { 
  StyleSheet, 
  Text, 
  View, 
  SafeAreaView, 
  ScrollView,
  Alert,
  TouchableOpacity 
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AmountInput } from './src/components/AmountInput';
import { CategoryGrid } from './src/components/CategoryGrid';
import { NumberPad } from './src/components/NumberPad';
import { ReportModal } from './src/components/ReportModal';
import { UndoToast } from './src/components/UndoToast';

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
  const [showReport, setShowReport] = useState(false);

  // Add states cho Undo
  const [showUndoToast, setShowUndoToast] = useState(false);
  const [deletedTransaction, setDeletedTransaction] = useState(null);
  const [previousTransactions, setPreviousTransactions] = useState([]);

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
    if (amount.length < 9) {
      setAmount(amount + num);
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

const handleDeleteTransaction = (id) => {
  Alert.alert(
    'Xóa chi tiêu',
    'Bạn có chắc muốn xóa?',
    [
      { text: 'Hủy', style: 'cancel' },
      { 
        text: 'Xóa', 
        style: 'destructive',
        onPress: () => {
          // Save current state for undo
          setPreviousTransactions(transactions);
          
          // Find transaction to delete
          const toDelete = transactions.find(t => t.id === id);
          setDeletedTransaction(toDelete);
          
          // Delete it
          const updatedTransactions = transactions.filter(t => t.id !== id);
          setTransactions(updatedTransactions);
          
          // Show undo toast
          setShowUndoToast(true);
        }
      }
    ]
  );
};

const handleUndo = () => {
  if (previousTransactions.length > 0) {
    setTransactions(previousTransactions);
    setPreviousTransactions([]);
    setDeletedTransaction(null);
  }
};

  const todayTotal = transactions
    .filter(t => {
      const today = new Date().toDateString();
      const tDate = new Date(t.timestamp).toDateString();
      return today === tDate;
    })
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <>
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

          {/* Report Button - ADD THIS SECTION */}
          <TouchableOpacity
            onPress={() => setShowReport(true)}
            style={styles.reportButton}
          >
            <Text style={styles.reportButtonText}>Xem báo cáo</Text>
          </TouchableOpacity>

          {/* Recent Transactions */}
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

        {/* Report Modal - ADD THIS AT THE END */}
        <ReportModal
          visible={showReport}
          onClose={() => setShowReport(false)}
          transactions={transactions}
          onRefresh={loadTransactions}
          onDelete={handleDeleteTransaction}
          showUndoToast={showUndoToast}
          onUndo={handleUndo}
          onHideToast={() => setShowUndoToast(false)}
        />
      </SafeAreaView>

      <UndoToast
          visible={showUndoToast}
          message="Đã xóa chi tiêu"
          onUndo={handleUndo}
          onHide={() => setShowUndoToast(false)}
        />
    </>
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
  // ADD THESE NEW STYLES
  reportButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    margin: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  reportButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  // END NEW STYLES
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
});