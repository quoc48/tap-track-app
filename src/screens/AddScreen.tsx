// src/screens/AddScreen.tsx - OPTIMIZED VERSION
import * as React from 'react';
const { useState, useRef, useCallback } = React;
import { 
  StyleSheet, 
  Text, 
  View, 
  SafeAreaView, 
  Alert,
  TouchableOpacity,
  TextInput,
  Keyboard,
  TouchableWithoutFeedback,
  Modal,
  Platform,
  KeyboardAvoidingView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { AmountInput } from '../components/AmountInput';
import { CategoryGrid } from '../components/CategoryGrid';
import { useTransactions } from '../context/TransactionContext';
import { CATEGORIES, EXPENSE_TYPE_LABELS, EXPENSE_TYPE_COLORS } from '../constants/categories';
import { ExpenseType, Category } from '../types';
// Remove KeyboardAwareScrollView - use native ScrollView
import { ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export const AddScreen = () => {
  const [amount, setAmount] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [description, setDescription] = useState('');
  const [selectedType, setSelectedType] = useState<ExpenseType>(ExpenseType.REQUIRED);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  const { transactions, addTransaction, getWeeklyCategoryStats } = useTransactions();
  const hiddenInputRef = useRef(null);
  const scrollViewRef = useRef<ScrollView>(null);

  // Reset screen state when tab comes into focus
  useFocusEffect(
    useCallback(() => {
      // Reset any problematic state
      Keyboard.dismiss();
      setShowConfirmModal(false);
      setShowDatePicker(false);
      
      // Ensure scroll view is responsive
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ y: 0, animated: false });
      }
    }, [])
  );
  
  const weeklyStats = React.useMemo(() => getWeeklyCategoryStats(), [getWeeklyCategoryStats]);

  const handleAmountChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    if (cleaned.length <= 9) {
      setAmount(cleaned);
    }
  };

  const handleCategorySelect = (category: Category) => {
    if (!amount || amount === '0') {
      Alert.alert('Nhập số tiền', 'Vui lòng nhập số tiền trước');
      return;
    }

    setSelectedCategory(category);
    setSelectedType(category.defaultType || ExpenseType.INCIDENTAL);
    setShowConfirmModal(true);
  };

  const handleConfirmTransaction = async () => {
    if (!selectedCategory) return;

    try {
      await addTransaction({
        amount: parseInt(amount),
        description: description.trim() || undefined,
        categoryId: selectedCategory.id,
        categoryName: selectedCategory.name,
        categoryIcon: selectedCategory.icon,
        expenseType: selectedType,
        transactionDate: selectedDate.toISOString(),
        createdAt: new Date().toISOString(),
      });

      // Reset all
      setAmount('');
      setDescription('');
      setSelectedType(ExpenseType.REQUIRED);
      setSelectedDate(new Date());
      setShowConfirmModal(false);
      setSelectedCategory(null);
      Keyboard.dismiss();
      
      // Success feedback
      Alert.alert('✅', 'Đã lưu!', [{ text: 'OK' }], { cancelable: true });
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể lưu giao dịch');
    }
  };

  const todayTotal = React.useMemo(() => {
    return transactions
      .filter(t => {
        const today = new Date().toDateString();
        const tDate = new Date(t.transactionDate).toDateString();
        return today === tDate;
      })
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const focusInput = useCallback(() => {
    hiddenInputRef.current?.focus();
  }, []);

  const handleVoiceInput = useCallback(() => {
    Alert.alert('Voice Input', 'Tính năng này sẽ sớm ra mắt!');
  }, []);

  const closeModal = useCallback(() => {
    Keyboard.dismiss();
    setShowConfirmModal(false);
    setDescription('');
    setSelectedDate(new Date());
    setShowDatePicker(false);
  }, []);

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
          ref={scrollViewRef}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          removeClippedSubviews={false}
          maintainVisibleContentPosition={null}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.dateText}>Hôm nay</Text>
            <Text style={styles.totalText}>
              {todayTotal.toLocaleString('vi-VN')}₫
            </Text>
          </View>

          {/* Amount Input */}
          <View style={styles.amountSection}>
            <TouchableOpacity 
              onPress={focusInput} 
              activeOpacity={0.8} 
              style={styles.amountInputWrapper}
            >
              <AmountInput amount={amount} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.voiceButton}
              onPress={handleVoiceInput}
            >
              <Ionicons name="mic" size={24} color="#007AFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.instructionContainer}>
            <Text style={styles.instructionText}>
              Nhấn vào số tiền để nhập
            </Text>
          </View>

          {/* Categories */}
          <View style={styles.categoriesWrapper}>
            <CategoryGrid
              categories={CATEGORIES}
              onSelectCategory={handleCategorySelect}
            />
          </View>
          
          {/* Weekly Stats */}
          {weeklyStats.length > 0 && (
            <View style={styles.statsSection}>
              <Text style={styles.sectionTitle}>Top danh mục tuần này</Text>
              {weeklyStats.map((stat, index) => (
                <View key={`${stat.categoryId}-${index}`} style={styles.statItem}>
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

        {/* Confirmation Modal */}
        <Modal
          visible={showConfirmModal}
          transparent={true}
          animationType="slide"
          onRequestClose={closeModal}
        >
          <View style={styles.modalOverlay}>
            <KeyboardAvoidingView 
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.keyboardAvoidingView}
            >
              <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                  {/* Fixed Header */}
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Xác nhận chi tiêu</Text>
                    <TouchableOpacity 
                      style={styles.closeButton}
                      onPress={closeModal}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Ionicons name="close" size={24} color="#666" />
                    </TouchableOpacity>
                  </View>
                  
                  {/* Scrollable Content */}
                  <View style={styles.modalScrollContent}>
                    {/* Amount & Category Display */}
                    <View style={styles.confirmInfo}>
                      <Text style={styles.confirmAmount}>
                        {parseInt(amount || '0').toLocaleString('vi-VN')}₫
                      </Text>
                      <View style={styles.confirmCategory}>
                        <Text style={styles.confirmIcon}>{selectedCategory?.icon}</Text>
                        <Text style={styles.confirmCategoryName}>{selectedCategory?.name}</Text>
                      </View>
                    </View>

                    {/* Expense Type Selector */}
                    <Text style={styles.inputLabel}>Loại chi tiêu</Text>
                    <View style={styles.typeSelector}>
                      {Object.values(ExpenseType).map((type) => (
                        <TouchableOpacity
                          key={type}
                          style={[
                            styles.typeButton,
                            selectedType === type && styles.typeButtonActive,
                            { borderColor: EXPENSE_TYPE_COLORS[type] }
                          ]}
                          onPress={() => setSelectedType(type)}
                        >
                          <Text style={[
                            styles.typeButtonText,
                            selectedType === type && { color: EXPENSE_TYPE_COLORS[type] }
                          ]}>
                            {EXPENSE_TYPE_LABELS[type]}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>

                    {/* Description Input */}
                    <Text style={styles.inputLabel}>Mô tả (tuỳ chọn)</Text>
                    <TextInput
                      style={styles.descriptionInput}
                      placeholder="VD: Cà phê với bạn A"
                      value={description}
                      onChangeText={setDescription}
                      multiline
                      returnKeyType="done"
                      onSubmitEditing={Keyboard.dismiss}
                    />

                    {/* Date Picker */}
                    <Text style={styles.inputLabel}>Ngày</Text>
                    <TouchableOpacity 
                      style={styles.dateButton}
                      onPress={() => {
                        Keyboard.dismiss();
                        setShowDatePicker(true);
                      }}
                    >
                      <Text style={styles.dateButtonText}>
                        {selectedDate.toLocaleDateString('vi-VN')}
                      </Text>
                      <Ionicons name="calendar-outline" size={20} color="#007AFF" />
                    </TouchableOpacity>

                    {showDatePicker && Platform.OS === 'ios' && (
                      <DateTimePicker
                        value={selectedDate}
                        mode="date"
                        display="spinner"
                        onChange={(_, date) => {
                          if (date) setSelectedDate(date);
                        }}
                        maximumDate={new Date()}
                        style={styles.datePickerIOS}
                      />
                    )}
                  </View>

                  {/* Fixed Action Buttons */}
                  <View style={styles.modalActions}>
                    <TouchableOpacity 
                      style={[styles.modalButton, styles.cancelButton]}
                      onPress={closeModal}
                    >
                      <Text style={styles.cancelButtonText}>Huỷ</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={[styles.modalButton, styles.confirmButton]}
                      onPress={() => {
                        Keyboard.dismiss();
                        handleConfirmTransaction();
                      }}
                    >
                      <Text style={styles.confirmButtonText}>Thêm</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </KeyboardAvoidingView>
          </View>
        </Modal>

        {/* Android Date Picker */}
        {showDatePicker && Platform.OS === 'android' && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="default"
            onChange={(_, date) => {
              setShowDatePicker(false);
              if (date) setSelectedDate(date);
            }}
            maximumDate={new Date()}
          />
        )}
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

// Styles remain the same...
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  categoriesWrapper: {
    flex: 1,
  },
  // ... rest of styles unchanged
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
  amountSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  amountInputWrapper: {
    flex: 1,
  },
  voiceButton: {
    backgroundColor: '#F2F2F7',
    padding: 12,
    borderRadius: 20,
    marginLeft: 12,
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  keyboardAvoidingView: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContainer: {
    maxHeight: SCREEN_HEIGHT * 0.9,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  closeButton: {
    padding: 5,
  },
  modalScrollView: {
    maxHeight: SCREEN_HEIGHT * 0.5,
  },
  modalScrollContent: {
    padding: 20,
    paddingTop: 10,
  },
  confirmInfo: {
    alignItems: 'center',
    marginBottom: 20,
    padding: 20,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
  },
  confirmAmount: {
    fontSize: 32,
    fontWeight: '600',
    color: '#000',
    marginBottom: 10,
  },
  confirmCategory: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  confirmIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  confirmCategoryName: {
    fontSize: 18,
    fontWeight: '500',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 8,
    marginTop: 16,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
  },
  typeButtonActive: {
    backgroundColor: '#F0F8FF',
  },
  typeButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#666',
  },
  descriptionInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    minHeight: 60,
    maxHeight: 100,
    textAlignVertical: 'top',
  },
  dateButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    padding: 12,
  },
  dateButtonText: {
    fontSize: 16,
    color: '#000',
  },
  datePickerIOS: {
    height: 180,
    marginTop: -10,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    backgroundColor: '#FFFFFF',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F2F2F7',
  },
  confirmButton: {
    backgroundColor: '#007AFF',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});