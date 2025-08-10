import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
  Animated,
  TextInput,
  ScrollView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
// Conditional import for speech recognition (requires development build)
let ExpoSpeechRecognitionModule: any = null;
let useSpeechRecognitionEvent: any = null;
let AudioEncodingAndroid: any = null;

try {
  const SpeechModule = require('expo-speech-recognition');
  ExpoSpeechRecognitionModule = SpeechModule.ExpoSpeechRecognitionModule;
  useSpeechRecognitionEvent = SpeechModule.useSpeechRecognitionEvent;
  AudioEncodingAndroid = SpeechModule.AudioEncodingAndroid;
  console.log('🎤 Speech recognition module loaded successfully');
} catch (error) {
  console.warn('🎤 Speech recognition module not available:', error);
  console.warn('🎤 This is expected when running in Expo Go');
}

interface VoiceInputProps {
  onVoiceResult: (text: string) => void;
  onError?: (error: string) => void;
}

export const VoiceInputFallback: React.FC<VoiceInputProps> = ({ 
  onVoiceResult, 
  onError 
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isRecognitionAvailable, setIsRecognitionAvailable] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [transcribedText, setTranscribedText] = useState('');
  const [supportedLocales, setSupportedLocales] = useState<string[]>([]);
  const [useManualInput, setUseManualInput] = useState(false);
  
  const pulseAnimation = useRef(new Animated.Value(1)).current;
  const waveAnimation = useRef(new Animated.Value(0)).current;

  const examples = [
    'mua cà phê 25 nghìn',
    'ăn phở 45k', 
    'đi taxi 80 nghìn',
    'mua sắm 150k',
    'trả tiền điện 200k'
  ];

  // Initialize speech recognition
  useEffect(() => {
    const initializeSpeechRecognition = async () => {
      try {
        console.log('🎤 Initializing speech recognition...');
        
        // Check if native module is available (development build required)
        if (!ExpoSpeechRecognitionModule) {
          console.warn('🎤 ExpoSpeechRecognition native module not available - using text input fallback');
          console.warn('🎤 Voice recognition requires a development build, not available in Expo Go');
          setIsRecognitionAvailable(false);
          setUseManualInput(true);
          return;
        }
        
        // Check if speech recognition is available
        const available = await ExpoSpeechRecognitionModule.getStateAsync();
        console.log('🎤 Speech recognition state:', available);
        setIsRecognitionAvailable(available !== 'unavailable');

        if (available !== 'unavailable') {
          // Request permissions
          const { granted } = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
          console.log('🎤 Permissions granted:', granted);
          
          if (granted) {
            // Get supported locales
            const locales = await ExpoSpeechRecognitionModule.getSupportedLocalesAsync();
            console.log('🎤 Supported locales:', locales);
            setSupportedLocales(locales);
            
            // Check if Vietnamese is supported
            const hasVietnamese = locales.some((locale: string) => 
              locale.includes('vi') || locale.includes('VN')
            );
            console.log('🎤 Vietnamese supported:', hasVietnamese);
            
            if (!hasVietnamese && Platform.OS === 'android') {
              console.log('🎤 Attempting to download Vietnamese model...');
              try {
                await ExpoSpeechRecognitionModule.androidTriggerOfflineModelDownload({
                  locale: 'vi-VN'
                });
              } catch (err) {
                console.log('🎤 Could not download Vietnamese model:', err);
              }
            }
          } else {
            console.log('🎤 Permissions not granted - using text input');
            setUseManualInput(true);
          }
        } else {
          console.log('🎤 Speech recognition unavailable - using text input');
          setUseManualInput(true);
        }
      } catch (error) {
        console.error('🎤 Error initializing speech recognition:', error);
        console.log('🎤 Falling back to manual text input');
        setIsRecognitionAvailable(false);
        setUseManualInput(true);
      }
    };

    initializeSpeechRecognition();
  }, []);

  // Speech recognition event handlers (only if module is available)
  useEffect(() => {
    if (!useSpeechRecognitionEvent || !ExpoSpeechRecognitionModule) {
      console.log('🎤 Speech recognition event handlers not available');
      return;
    }

    try {
      const startListener = useSpeechRecognitionEvent('start', () => {
        console.log('🎤 Speech recognition started');
        setIsListening(true);
        startPulseAnimation();
      });

      const endListener = useSpeechRecognitionEvent('end', () => {
        console.log('🎤 Speech recognition ended');
        setIsListening(false);
        stopPulseAnimation();
      });

      const resultListener = useSpeechRecognitionEvent('result', (event) => {
        console.log('🎤 Speech recognition result:', event);
        const transcript = event.results?.[0]?.transcript;
        if (transcript) {
          console.log('🎤 Transcribed text:', transcript);
          setTranscribedText(transcript);
          setTextInput(transcript);
        }
      });

      const errorListener = useSpeechRecognitionEvent('error', (event) => {
        console.error('🎤 Speech recognition error:', event);
        setIsListening(false);
        stopPulseAnimation();
        onError?.(event.error || 'Lỗi nhận diện giọng nói');
        Alert.alert('Lỗi', 'Không thể nhận diện giọng nói. Vui lòng thử lại hoặc nhập bằng tay.');
      });

      // Cleanup function
      return () => {
        // Note: The actual cleanup depends on the library's API
        console.log('🎤 Cleaning up speech recognition event listeners');
      };
    } catch (error) {
      console.warn('🎤 Could not set up speech recognition event handlers:', error);
    }
  }, [onError]);

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnimation, {
          toValue: 1.2,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnimation, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.timing(waveAnimation, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    ).start();
  };

  const stopPulseAnimation = () => {
    pulseAnimation.stopAnimation();
    waveAnimation.stopAnimation();
    Animated.timing(pulseAnimation, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
    Animated.timing(waveAnimation, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const startVoiceRecognition = async () => {
    try {
      console.log('🎤 Starting voice recognition...');
      
      if (!ExpoSpeechRecognitionModule) {
        console.warn('🎤 Speech recognition module not available');
        Alert.alert('Thông báo', 'Nhận diện giọng nói không khả dụng. Sử dụng nhập bằng tay.');
        setUseManualInput(true);
        return;
      }
      
      const options = {
        lang: supportedLocales.find(locale => locale.includes('vi')) || 'vi-VN',
        interimResults: true,
        maxAlternatives: 1,
        continuous: false,
        ...(Platform.OS === 'android' && AudioEncodingAndroid && {
          audioEncoding: AudioEncodingAndroid.ENCODING_AMR_WB,
        }),
      };

      console.log('🎤 Recognition options:', options);
      ExpoSpeechRecognitionModule.start(options);
    } catch (error) {
      console.error('🎤 Error starting voice recognition:', error);
      Alert.alert('Lỗi', 'Không thể bắt đầu nhận diện giọng nói. Sử dụng nhập bằng tay.');
      setUseManualInput(true);
    }
  };

  const stopVoiceRecognition = async () => {
    try {
      console.log('🎤 Stopping voice recognition...');
      ExpoSpeechRecognitionModule.stop();
    } catch (error) {
      console.error('🎤 Error stopping voice recognition:', error);
    }
  };

  const handleVoiceButtonPress = () => {
    if (!isRecognitionAvailable || useManualInput) {
      setUseManualInput(true);
      return;
    }

    if (isListening) {
      stopVoiceRecognition();
    } else {
      startVoiceRecognition();
    }
  };

  const handleSubmit = () => {
    const finalText = textInput.trim() || transcribedText.trim();
    console.log('🎤 Submitting text:', finalText);
    
    if (finalText) {
      onVoiceResult(finalText);
      setTextInput('');
      setTranscribedText('');
    } else {
      Alert.alert('Lỗi', 'Vui lòng nhập hoặc nói nội dung giao dịch');
    }
  };

  const handleExamplePress = (example: string) => {
    console.log('🎤 Setting example:', example);
    setTextInput(example);
    setTranscribedText('');
  };

  const toggleInputMethod = () => {
    setUseManualInput(!useManualInput);
    setTextInput('');
    setTranscribedText('');
    if (isListening) {
      stopVoiceRecognition();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>
          {useManualInput ? 'Nhập giao dịch' : 'Nhập bằng giọng nói'}
        </Text>
        
        <Text style={styles.modalSubtitle}>
          {useManualInput 
            ? 'Nhập theo mẫu: "mua cà phê 25 nghìn"'
            : 'Nói rõ ràng: "mua cà phê 25 nghìn"'
          }
        </Text>

        {/* Development build notice */}
        {!ExpoSpeechRecognitionModule && (
          <View style={styles.noticeContainer}>
            <Ionicons name="information-circle" size={16} color="#FF9500" />
            <Text style={styles.noticeText}>
              Nhận diện giọng nói cần Development Build, không khả dụng trong Expo Go
            </Text>
          </View>
        )}

        {/* Voice Recognition Button */}
        {!useManualInput && isRecognitionAvailable && (
          <View style={styles.voiceSection}>
            <TouchableOpacity
              style={[
                styles.voiceButton,
                isListening && styles.voiceButtonActive
              ]}
              onPress={handleVoiceButtonPress}
              disabled={!isRecognitionAvailable}
            >
              <Animated.View style={{
                transform: [{ scale: pulseAnimation }]
              }}>
                <Ionicons 
                  name={isListening ? "stop" : "mic"} 
                  size={32} 
                  color={isListening ? "#FF3B30" : "#007AFF"} 
                />
              </Animated.View>
            </TouchableOpacity>
            
            <Text style={styles.voiceStatus}>
              {isListening ? 'Đang nghe...' : 'Nhấn để nói'}
            </Text>

            {/* Voice Wave Animation */}
            {isListening && (
              <Animated.View style={[
                styles.waveContainer,
                { opacity: waveAnimation }
              ]}>
                <View style={[styles.wave, styles.wave1]} />
                <View style={[styles.wave, styles.wave2]} />
                <View style={[styles.wave, styles.wave3]} />
              </Animated.View>
            )}
          </View>
        )}

        {/* Transcribed Text Display */}
        {transcribedText && (
          <View style={styles.transcriptionContainer}>
            <Text style={styles.transcriptionLabel}>Đã nhận diện:</Text>
            <Text style={styles.transcriptionText}>{transcribedText}</Text>
          </View>
        )}

        {/* Manual Input or Correction */}
        <TextInput
          style={styles.textInput}
          value={textInput}
          onChangeText={setTextInput}
          placeholder={useManualInput ? "Nhập: mua cà phê 25k" : "Chỉnh sửa nếu cần"}
          multiline={false}
          returnKeyType="done"
          onSubmitEditing={handleSubmit}
        />

        {/* Examples */}
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

        {/* Actions */}
        <View style={styles.modalActions}>
          {isRecognitionAvailable && (
            <TouchableOpacity
              style={[styles.button, styles.toggleButton]}
              onPress={toggleInputMethod}
            >
              <Ionicons 
                name={useManualInput ? "mic" : "create"} 
                size={16} 
                color="#666" 
              />
              <Text style={styles.toggleButtonText}>
                {useManualInput ? 'Dùng giọng nói' : 'Nhập tay'}
              </Text>
            </TouchableOpacity>
          )}
          
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
    minWidth: 320,
    maxWidth: '90%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 10,
    textAlign: 'center',
    color: '#333',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  noticeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    borderLeftWidth: 3,
    borderLeftColor: '#FF9500',
  },
  noticeText: {
    fontSize: 12,
    color: '#E65100',
    marginLeft: 8,
    flex: 1,
  },
  voiceSection: {
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  voiceButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#007AFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  voiceButtonActive: {
    backgroundColor: '#FFEBEE',
    borderColor: '#FF3B30',
  },
  voiceStatus: {
    fontSize: 14,
    color: '#007AFF',
    marginTop: 10,
    fontWeight: '500',
  },
  waveContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'none',
  },
  wave: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  wave1: {
    width: 100,
    height: 100,
    borderRadius: 50,
    opacity: 0.3,
  },
  wave2: {
    width: 120,
    height: 120,
    borderRadius: 60,
    opacity: 0.2,
  },
  wave3: {
    width: 140,
    height: 140,
    borderRadius: 70,
    opacity: 0.1,
  },
  transcriptionContainer: {
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
  transcriptionLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  transcriptionText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    marginBottom: 15,
    backgroundColor: '#FAFAFA',
  },
  examplesTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 10,
    color: '#333',
  },
  examplesContainer: {
    maxHeight: 100,
    marginBottom: 15,
  },
  exampleButton: {
    backgroundColor: '#F8F9FA',
    padding: 10,
    borderRadius: 8,
    marginBottom: 6,
  },
  exampleText: {
    fontSize: 14,
    color: '#007AFF',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleButton: {
    backgroundColor: '#F8F9FA',
    flex: 1,
    marginRight: 10,
    justifyContent: 'center',
  },
  toggleButtonText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
  },
  submitButtonText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#FFF',
    fontWeight: '500',
  },
});