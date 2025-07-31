// File: src/screens/MainScreen.tsx
import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  SafeAreaView, 
  ScrollView,
  Alert,
  ActivityIndicator
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { AmountInput } from '../components/AmountInput';
import { CategoryGrid } from '../components/CategoryGrid';
import { NumberPad } from '../components/NumberPad';
import { TitleInputModal } from '../components/TitleInputModal';
import { useTransactionStore } from '../store/useTransactionStore';
import { useSettingsStore } from '../store/useSettingsStore';

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

export const MainScreen: React.FC = () => {
  const [amount, setAmount] = useState('');
  const [showTitleModal, setShowTitleModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  
  const { 
    addTransaction, 
    getTodayTotal, 
    loadTransactions, 
    loading 
  } = useTransactionStore();
  
  const { 
    updateCategoryUsage, 
    frequentCategoryId, 
    loadSettings 
  } = useSettingsStore();

  useEffect(() => {
    loadTransactions();
    loadSettings();
  }, []);

  const handleNumberPress = (num: string) => {
    if (amount.length < 9) {
      setAmount(amount + num);
    }
  };

  const handleDeletePress = () => {
    setAmount(amount.slice(0, -1));
  };

  const handleClearPress = () => {
    setAmount('');
  };

  const handleCategorySelect = (category: any) => {
    if (!amount || amount === '0') {
      Alert.alert('Nhập số tiền', 'Vui lòng nhập số tiền trước');
      return;
    }

    setSelectedCategory(category);

    // Show action dialog
    Alert.alert(
      'Lưu chi tiêu',
      `${parseInt(amount).toLocaleString('vi-VN')}₫ - ${category.name}`,
      [
        {
          text: '+ Thêm ghi chú',
          onPress: () => setShowTitleModal(true)
        },
        {
          text: 'Lưu nhanh',
          style: 'default',
          onPress: () => saveTransaction(category, '')
        },
        {
          text: 'Hủy',
          style: 'cancel'
        }
      ]
    );
  };

  const saveTransaction = async (category: any, title: string) => {
    const numAmount = parseInt(amount);
    
    // Save transaction
    await addTransaction({
      amount: numAmount,
      title: title || undefined, // Only save if not empty
      categoryId: category.id,
      categoryName: category.name,
      categoryIcon: category.icon,
      date: new Date().toISOString(),
    });

    // Update category usage
    await updateCategoryUsage(category.id);
    
    // Reset
    setAmount('');
    setShowTitleModal(false);
    setSelectedCategory(null);
    
    // Simple feedback
    Alert.alert(
      '✅', 
      `Đã lưu ${numAmount.toLocaleString('vi-VN')}₫`,
      [{ text: 'OK' }],
      { cancelable: true }
    );
  };

  const handleTitleSave = (title: string) => {
    if (selectedCategory) {
      saveTransaction(selectedCategory, title);
    }
  };

  const getSuggestion = () => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 10) return '☕ Buổi sáng rồi';
    if (hour >= 11 && hour < 14) return '🍜 Giờ ăn trưa';
    if (hour >= 17 && hour < 20) return '🍜 Giờ ăn tối';
    return '💡 Nhập chi tiêu của bạn';
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#007AFF" />
      </SafeAreaView>
    );
  }

  const todayTotal = getTodayTotal();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.dateText}>Hôm nay</Text>
          <Text style={styles.totalText}>
            {todayTotal.toLocaleString('vi-VN')}₫
          </Text>
        </View>

        {/* Amount Input */}
        <AmountInput amount={amount} />

        {/* Smart Suggestion */}
        <View style={styles.suggestionContainer}>
          <Text style={styles.suggestionText}>
            {getSuggestion()}
          </Text>
        </View>

        {/* Number Pad */}
        <NumberPad
          onNumberPress={handleNumberPress}
          onDeletePress={handleDeletePress}
          onClearPress={handleClearPress}
        />

        {/* Categories */}
        <CategoryGrid
          categories={CATEGORIES}
          onSelectCategory={handleCategorySelect}
          frequentCategoryId={frequentCategoryId}
        />
      </ScrollView>

      {/* Title Input Modal */}
      <TitleInputModal
        visible={showTitleModal}
        amount={amount}
        category={selectedCategory || { name: '', icon: '' }}
        onSave={handleTitleSave}
        onCancel={() => setShowTitleModal(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
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
  suggestionContainer: {
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  suggestionText: {
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    fontSize: 14,
    color: '#666666',
  },
});