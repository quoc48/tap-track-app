import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
  Animated,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface VoiceInputFallbackProps {
  onVoiceResult: (text: string) => void;
  onError?: (error: string) => void;
}

export const VoiceInputFallback: React.FC<VoiceInputFallbackProps> = ({ 
  onVoiceResult, 
  onError 
}) => {
  const [textInput, setTextInput] = useState('');

  const examples = [
    'mua cà phê 25 nghìn',
    'ăn phở 45k', 
    'đi taxi 80 nghìn',
    'mua sắm 150k'
  ];

  const handleSubmit = () => {
    console.log('🎤 VoiceInputFallback: handleSubmit called');
    if (textInput.trim()) {
      console.log('🎤 VoiceInputFallback: calling onVoiceResult with:', textInput.trim());
      onVoiceResult(textInput.trim());
      setTextInput('');
    } else {
      console.log('🎤 VoiceInputFallback: empty input, showing alert');
      Alert.alert('Lỗi', 'Vui lòng nhập nội dung');
    }
  };

  const handleExamplePress = (example: string) => {
    console.log('🎤 VoiceInputFallback: setting example:', example);
    setTextInput(example);
  };

  // SIMPLIFIED: No nested modal, just render content directly
  return (
    <View style={styles.container}>
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>Nhập nhanh giao dịch</Text>
        <Text style={styles.modalSubtitle}>
          Nhập theo mẫu: "mua cà phê 25 nghìn"
        </Text>

        <TextInput
          style={styles.textInput}
          value={textInput}
          onChangeText={setTextInput}
          placeholder="Ví dụ: mua cà phê 25k"
          multiline={false}
          autoFocus={true}
          returnKeyType="done"
          onSubmitEditing={handleSubmit}
        />

        <Text style={styles.examplesTitle}>Ví dụ:</Text>
        <ScrollView style={styles.examplesContainer} showsVerticalScrollIndicator={false}>
          {examples.map((example, index) => (
            <TouchableOpacity
              key={index}
              style={styles.exampleButton}
              onPress={() => handleExamplePress(example)}
            >
              <Text style={styles.exampleText}>"{example}"</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.modalActions}>
          <TouchableOpacity
            style={[styles.button, styles.submitButton]}
            onPress={handleSubmit}
          >
            <Text style={styles.submitButtonText}>Xử lý</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 20,
    minWidth: 300,
    maxWidth: '90%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    marginBottom: 15,
  },
  examplesTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 10,
  },
  examplesContainer: {
    maxHeight: 120,
    marginBottom: 15,
  },
  exampleButton: {
    backgroundColor: '#F8F9FA',
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  exampleText: {
    fontSize: 14,
    color: '#007AFF',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  submitButton: {
    backgroundColor: '#007AFF',
  },
  submitButtonText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#FFF',
    fontWeight: '500',
  },
});