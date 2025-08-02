// src/components/AmountInput.tsx
import * as React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

interface AmountInputProps {
  amount: string;
}

export const AmountInput: React.FC<AmountInputProps> = ({ amount }) => {
  console.log('AmountInput received:', amount);
  const formatAmount = (value: string): string => {
    if (!value || value === '') return '0';
    
    // Remove all non-digits
    const numericValue = value.replace(/\D/g, '');
    
    // Convert to number and format
    const number = parseInt(numericValue) || 0;
    return number.toLocaleString('vi-VN');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.currency}>₫</Text>
      <Text style={styles.amount}>
        {formatAmount(amount)}
      </Text>
      <View style={styles.cursor} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
    minHeight: 120,
  },
  currency: {
    fontSize: 48,
    color: '#666666',
    marginRight: 8,
  },
  amount: {
    fontSize: 72,
    fontWeight: '200',
    color: '#000000',
    letterSpacing: -2,
    minWidth: 50, // Ensure space for display
  },
  cursor: {
    width: 3,
    height: 60,
    backgroundColor: '#007AFF',
    marginLeft: 4,
  },
});