// App.tsx - Add NumberPad
import React, { useState } from 'react';
import { View, Text, SafeAreaView, StyleSheet } from 'react-native';
import { AmountInput } from './src/components/AmountInput';
import { NumberPad } from './src/components/NumberPad';

export default function App() {
  const [amount, setAmount] = useState('');

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Test NumberPad</Text>
      <AmountInput amount={amount} />
      <NumberPad
        onNumberPress={(num) => setAmount(amount + num)}
        onDeletePress={() => setAmount(amount.slice(0, -1))}
        onClearPress={() => setAmount('')}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
    marginTop: 50,
  },
});