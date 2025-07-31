// Replace nội dung App.tsx
import React, { useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { AmountInput } from './src/components/AmountInput';
import { Colors, Spacing, FontSizes } from './src/constants/theme';

export default function App() {
  const [amount, setAmount] = useState('20000');

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.dateText}>Hôm nay</Text>
        <Text style={styles.totalText}>0₫</Text>
      </View>

      {/* Amount Input */}
      <AmountInput amount={amount} />

      {/* Smart Suggestion */}
      <View style={styles.suggestionContainer}>
        <Text style={styles.suggestionText}>
          ☕ Thường là cà phê buổi sáng
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    alignItems: 'center',
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  dateText: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
  },
  totalText: {
    fontSize: FontSizes.xl,
    fontWeight: '600',
    marginTop: Spacing.xs,
    color: Colors.text,
  },
  suggestionContainer: {
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  suggestionText: {
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
});