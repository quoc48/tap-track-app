// src/screens/ReportScreen.tsx - FIXED VERSION
import * as React from 'react';
const { useState, useCallback } = React;
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTransactions } from '../context/TransactionContext';
import { EXPENSE_TYPE_LABELS, EXPENSE_TYPE_COLORS } from '../constants/categories';

type PeriodType = 'today' | 'week' | 'month';

export const ReportScreen = () => {
  const { transactions, deleteTransaction, loadTransactions } = useTransactions();
  const [refreshing, setRefreshing] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('today');
  const [selectedPeriodLabel, setSelectedPeriodLabel] = useState('');

  // Reload when screen focuses
  useFocusEffect(
    useCallback(() => {
      loadTransactions();
    }, [])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadTransactions();
    setRefreshing(false);
  };

  // Handle opening detail modal
  const handleShowDetails = (period: PeriodType, label: string) => {
    setSelectedPeriod(period);
    setSelectedPeriodLabel(label);
    setShowDetailModal(true);
  };

  // Get filtered transactions based on selected period
  const getFilteredTransactions = () => {
    const now = new Date();
    
    switch (selectedPeriod) {
      case 'today':
        const today = now.toDateString();
        return transactions.filter(t => 
          new Date(t.transactionDate).toDateString() === today
        );
      
      case 'week':
        const weekAgo = new Date();
        weekAgo.setDate(now.getDate() - 7);
        return transactions.filter(t => 
          new Date(t.transactionDate) >= weekAgo
        );
      
      case 'month':
        const monthStart = new Date();
        monthStart.setDate(1);
        return transactions.filter(t => 
          new Date(t.transactionDate) >= monthStart
        );
      
      default:
        return transactions;
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      'Xóa chi tiêu',
      'Bạn có chắc muốn xóa?',
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Xóa', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTransaction(id);
              setToastVisible(true);
              setTimeout(() => setToastVisible(false), 3000);
            } catch (error) {
              Alert.alert('Lỗi', 'Không thể xóa giao dịch');
            }
          }
        }
      ]
    );
  };

  // Calculate totals
  const today = new Date().toDateString();
  const todayTotal = transactions
    .filter(t => new Date(t.transactionDate).toDateString() === today)
    .reduce((sum, t) => sum + t.amount, 0);

  const weekTotal = transactions
    .filter(t => {
      const date = new Date(t.transactionDate);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return date >= weekAgo;
    })
    .reduce((sum, t) => sum + t.amount, 0);

  const monthTotal = transactions
    .filter(t => {
      const date = new Date(t.transactionDate);
      const monthStart = new Date();
      monthStart.setDate(1);
      return date >= monthStart;
    })
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Báo cáo chi tiêu</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Summary Cards */}
        <View style={styles.summaryContainer}>
          <TouchableOpacity 
            style={styles.summaryCard}
            onPress={() => handleShowDetails('today', 'Hôm nay')}
          >
            <View style={styles.summaryHeader}>
              <Text style={styles.summaryLabel}>Hôm nay</Text>
              <Text style={styles.detailButton}>Xem chi tiết</Text>
            </View>
            <Text style={styles.summaryAmount}>
              {todayTotal.toLocaleString('vi-VN')}₫
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.summaryCard}
            onPress={() => handleShowDetails('week', 'Tuần này')}
          >
            <View style={styles.summaryHeader}>
              <Text style={styles.summaryLabel}>Tuần này</Text>
              <Text style={styles.detailButton}>Xem chi tiết</Text>
            </View>
            <Text style={styles.summaryAmount}>
              {weekTotal.toLocaleString('vi-VN')}₫
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.summaryCard}
            onPress={() => handleShowDetails('month', 'Tháng này')}
          >
            <View style={styles.summaryHeader}>
              <Text style={styles.summaryLabel}>Tháng này</Text>
              <Text style={styles.detailButton}>Xem chi tiết</Text>
            </View>
            <Text style={styles.summaryAmount}>
              {monthTotal.toLocaleString('vi-VN')}₫
            </Text>
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* Detail Modal */}
      <Modal
        visible={showDetailModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowDetailModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              Chi tiết - {selectedPeriodLabel}
            </Text>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowDetailModal(false)}
            >
              <Text style={styles.closeButtonText}>Đóng</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            {getFilteredTransactions().length === 0 ? (
              <Text style={styles.emptyText}>Chưa có giao dịch nào</Text>
            ) : (
              getFilteredTransactions().map((t) => (
                <TouchableOpacity
                  key={t.id}
                  style={styles.transactionItem}
                  onLongPress={() => handleDelete(t.id)}
                >
                  <View style={styles.transactionLeft}>
                    <Text style={styles.transactionIcon}>{t.categoryIcon}</Text>
                    <View style={styles.transactionInfo}>
                      <Text style={styles.transactionName}>
                        {t.description || t.categoryName}
                      </Text>
                      <Text style={styles.transactionTime}>
                        {new Date(t.transactionDate).toLocaleString('vi-VN', {
                          day: '2-digit',
                          month: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.transactionRight}>
                    <Text style={styles.transactionAmount}>
                      {t.amount.toLocaleString('vi-VN')}₫
                    </Text>
                    {t.expenseType && (
                      <Text style={[
                        styles.expenseTypeLabel,
                        { color: EXPENSE_TYPE_COLORS[t.expenseType] || '#666' }
                      ]}>
                        {EXPENSE_TYPE_LABELS[t.expenseType] || t.expenseType}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Simple Toast */}
      {toastVisible && (
        <View style={styles.toast}>
          <Text style={styles.toastText}>Đã xóa chi tiêu</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    padding: 20,
    paddingTop: 10,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
  },
  summaryContainer: {
    padding: 20,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailButton: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
  },
  summaryAmount: {
    fontSize: 32,
    fontWeight: '600',
  },
  transactionSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 20,
  },
  transactionItem: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionName: {
    fontSize: 16,
    fontWeight: '500',
  },
  transactionTime: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 18,
    fontWeight: '500',
  },
  expenseTypeLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  toast: {
    position: 'absolute',
    bottom: 100,
    alignSelf: 'center',
    backgroundColor: '#333',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  toastText: {
    color: '#fff',
    fontSize: 14,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '500',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
});