import React, { useState, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as SpeechRecognition from 'expo-speech-recognition';

interface VoiceInputProps {
  onVoiceResult: (text: string) => void;
  onError?: (error: string) => void;
}

export const VoiceInput: React.FC<VoiceInputProps> = ({ onVoiceResult, onError }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const pulseAnim = new Animated.Value(1);

  useEffect(() => {
    checkPermissionsAndSupport();
  }, []);

  useEffect(() => {
    if (isRecording) {
      startPulse();
    } else {
      stopPulse();
    }
  }, [isRecording]);

  const checkPermissionsAndSupport = async () => {
    try {
      // Check if speech recognition is available
      const available = await SpeechRecognition.getAvailableServicesAsync();
      setIsSupported(available.length > 0);

      // Request permissions
      const { granted } = await SpeechRecognition.requestPermissionsAsync();
      if (!granted) {
        Alert.alert('Quyền truy cập', 'Cần quyền microphone để sử dụng tính năng này');
      }
    } catch (error) {
      console.log('Permission error:', error);
      setIsSupported(false);
    }
  };

  const startPulse = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const stopPulse = () => {
    pulseAnim.stopAnimation();
    Animated.timing(pulseAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const startRecording = async () => {
    try {
      setTranscription('');
      setIsRecording(true);

      const options = {
        language: 'vi-VN',
        interimResults: true,
        maxAlternatives: 1,
        continuous: false,
        requiresOnDeviceRecognition: false,
      };

      const result = await SpeechRecognition.startAsync(options);
      
      setIsRecording(false);
      
      if (result.transcription) {
        setTranscription(result.transcription);
        onVoiceResult(result.transcription);
      } else {
        onError?.('Không nhận diện được giọng nói');
      }
    } catch (error) {
      console.log('Speech recognition error:', error);
      setIsRecording(false);
      onError?.('Lỗi khi nhận diện giọng nói');
    }
  };

  const stopRecording = async () => {
    try {
      await SpeechRecognition.stopAsync();
      setIsRecording(false);
    } catch (error) {
      console.log('Error stopping speech recognition:', error);
      setIsRecording(false);
    }
  };

  const handlePress = () => {
    if (!isSupported) {
      Alert.alert(
        'Không hỗ trợ', 
        'Thiết bị này không hỗ trợ nhận diện giọng nói'
      );
      return;
    }

    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.micContainer, { transform: [{ scale: pulseAnim }] }]}>
        <TouchableOpacity
          style={[
            styles.micButton,
            isRecording ? styles.micButtonActive : styles.micButtonInactive,
          ]}
          onPress={handlePress}
          disabled={!isSupported}
        >
          <Ionicons 
            name={isRecording ? "mic" : "mic-outline"} 
            size={24} 
            color={isRecording ? "#FF3B30" : "#007AFF"} 
          />
        </TouchableOpacity>
      </Animated.View>
      
      {isRecording && (
        <Text style={styles.statusText}>Đang nghe...</Text>
      )}
      
      {transcription && !isRecording && (
        <View style={styles.transcriptionContainer}>
          <Text style={styles.transcriptionText}>{transcription}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  micContainer: {
    marginBottom: 10,
  },
  micButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  micButtonActive: {
    backgroundColor: '#FFE5E5',
    borderWidth: 2,
    borderColor: '#FF3B30',
  },
  micButtonInactive: {
    backgroundColor: '#E3F2FD',
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  statusText: {
    fontSize: 14,
    color: '#FF3B30',
    fontWeight: '500',
    marginTop: 5,
  },
  transcriptionContainer: {
    backgroundColor: '#F8F9FA',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    maxWidth: 300,
  },
  transcriptionText: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
  },
});