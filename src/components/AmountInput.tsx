// Tạo file: src/components/AmountInput.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, FontSizes, Spacing } from '../constants/theme';

interface AmountInputProps {
  amount: string;
}

export const AmountInput: React.FC<AmountInputProps> = ({ amount }) => {
  // Format number với comma separator
   const formatAmount = (value:string): string => {
    if (!value || value === '0') return '0';
    
    // Remove non-digits
    const number = value.replace(/\D/g, '');
    if (!number) return '0'; // Handle empty string after regex
    
    // Add thousand separators
    const parsed = parseInt(number);
    if (isNaN(parsed)) return '0'; //Handle NaN
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
    paddingVertical: Spacing.xxl,
  },
  currency: {
    fontSize: 48,
    color: Colors.textSecondary,
    marginRight: Spacing.sm,
  },
  amount: {
    fontSize: FontSizes.huge,
    fontWeight: '200',
    color: Colors.text,
    letterSpacing: -2,
  },
  cursor: {
    width: 3,
    height: 60,
    backgroundColor: Colors.primary,
    marginLeft: Spacing.xs,
    // Blinking animation will be added later
  },
});