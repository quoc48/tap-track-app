// Tạo file: src/components/NumberPad.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';

interface NumberPadProps {
  onNumberPress: (num: string) => void;
  onDeletePress: () => void;
  onClearPress?: () => void;
}

export const NumberPad: React.FC<NumberPadProps> = ({
  onNumberPress,
  onDeletePress,
  onClearPress
}) => {
  const numbers = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['C', '0', '←']
  ];

  const handlePress = (value: string) => {
    // Comment out Haptics for now to avoid issues
    // Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (value === '←') {
      onDeletePress();
    } else if (value === 'C') {
      onClearPress?.();
    } else {
      onNumberPress(value);
    }
  };

  return (
    <View style={styles.container}>
      {numbers.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((num) => (
            <TouchableOpacity
              key={num}
              style={styles.button}
              onPress={() => handlePress(num)}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.buttonText,
                (num === '←' || num === 'C') && styles.specialButton
              ]}>
                {num}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 40,
    paddingBottom: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  button: {
    width: 70,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 35,
  },
  buttonText: {
    fontSize: 24,
    fontWeight: '400',
    color: '#000000',
  },
  specialButton: {
    color: '#007AFF',
    fontSize: 20,
  },
});