// src/components/ReportModal.tsx
import * as React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
} from 'react-native';

interface ReportModalProps {
  visible: boolean;
  onClose: () => void;
  transactions: any[];
  onRefresh?: () => void;
  onDelete?: (id: string) => void;
  showUndoToast?: boolean;
  undoMessage?: string;
  onUndo?: () => void;
  onHideToast?: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  visible,
  onClose,
  transactions,
  onRefresh,
  onDelete,
  showUndoToast = false,
  undoMessage = '',
  onUndo,
  onHideToast,
}) => {
  const [refreshing, setRefreshing] = React.useState(false);

  // Auto hide toast after 5s
  React.useEffect(() => {
    if (showUndoToast) {
      const timer = setTimeout(() => {
        onHideToast?.();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showUndoToast]);

  const handleRefresh = () => {
    setRefreshing(true);
    onRefresh?.();
    setTimeout(() => setRefreshing(false), 1000);
  };

  // Calculate totals
  const today = new Date().toDateString();
  const todayTotal = transactions
    .filter(t => new Date(t.timestamp).toDateString() === today)
    .reduce((sum, t) => sum + t.amount, 0);

  const weekTotal = transactions
    .filter(t => {
      const date = new Date(t.timestamp);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return date >= weekAgo;
    })
    .reduce((sum, t) => sum + t.amount, 0);

  const monthTotal = transactions
    .filter(t => {
      const date = new Date(t.timestamp);
      const monthStart = new Date();
      monthStart.setDate(1);
      return date >= monthStart;
    })
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Chi tiêu</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          {/* Summary Cards */}
          <View style={styles.summaryContainer}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Hôm nay</Text>
              <Text style={styles.summaryAmount}>
                {todayTotal.toLocaleString('vi-VN')}₫
              </Text>
            </View>

            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Tuần này</Text>
              <Text style={styles.summaryAmount}>
                {weekTotal.toLocaleString('vi-VN')}₫
              </Text>
            </View>

            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Tháng này</Text>
              <Text style={styles.summaryAmount}>
                {monthTotal.toLocaleString('vi-VN')}₫
              </Text>
            </View>
          </View>

          {/* Transaction List */}
          <View style={styles.transactionSection}>
            <Text style={styles.sectionTitle}>Chi tiết</Text>
            {transactions.map((t) => (
              <TouchableOpacity
                key={t.id}
                style={styles.transactionItem}
                activeOpacity={0.7}  // MOVED HERE - as prop not style
                onLongPress={() => {
                  if (onDelete) {  // Add safety check
                    onDelete(t.id);
                  }
                }}
              >
                <View style={styles.transactionLeft}>
                  <Text style={styles.transactionIcon}>{t.category.icon}</Text>
                  <View>
                    <Text style={styles.transactionName}>
                      {t.title || t.category.name}
                    </Text>
                    <Text style={styles.transactionTime}>
                      {new Date(t.timestamp).toLocaleTimeString('vi-VN', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  </View>
                </View>
                <Text style={styles.transactionAmount}>
                  {t.amount.toLocaleString('vi-VN')}₫
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {showUndoToast && (
          <View style={styles.toastContainer}>
            <Text style={styles.toastText}>Đã xóa chi tiêu</Text>
            <TouchableOpacity onPress={() => {
              onUndo?.();
              onHideToast?.();
            }}>
              <Text style={styles.undoButton}>Hoàn tác</Text>
            </TouchableOpacity>
          </View>
        )}

      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
  },
  closeButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    fontSize: 24,
    color: '#666',
  },
  summaryContainer: {
    padding: 20,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
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
  transactionItem: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    // REMOVED activeOpacity from here
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transactionIcon: {
    fontSize: 24,
    marginRight: 12,
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
  transactionAmount: {
    fontSize: 18,
    fontWeight: '500',
  },

  // ADD TOAST STYLES:
  toastContainer: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    backgroundColor: '#333',
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    elevation: 5,
  },

  toastText: {
    color: '#fff',
    fontSize: 14,
  },
  undoButton: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
});