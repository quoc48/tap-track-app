// src/components/UndoToast.tsx
import * as React from 'react';
import {
  Animated,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

interface UndoToastProps {
  visible: boolean;
  message: string;
  onUndo: () => void;
  onHide: () => void;
}

export const UndoToast: React.FC<UndoToastProps> = ({
  visible,
  message,
  onUndo,
  onHide,
}) => {
  const translateY = React.useRef(new Animated.Value(-100)).current;

  React.useEffect(() => {
    if (visible) {
      // Slide down from top
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Auto hide after 5s
      const timer = setTimeout(() => {
        hideToast();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  const hideToast = () => {
    Animated.timing(translateY, {
      toValue: -100,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      onHide();
    });
  };

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        { transform: [{ translateY }] }
      ]}
    >
      <Text style={styles.message}>{message}</Text>
      <TouchableOpacity onPress={() => {
        onUndo();
        hideToast();
      }}>
        <Text style={styles.undoButton}>Hoàn tác</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 999,
    zIndex: 999,
  },
  message: {
    color: '#fff',
    fontSize: 14,
  },
  undoButton: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

// Animation from bottom:
const translateY = React.useRef(new Animated.Value(100)).current; // From bottom

// Hide animation:
const hideToast = () => {
  Animated.timing(translateY, {
    toValue: 100,  // Slide down
    duration: 300,
    useNativeDriver: true,
  }).start(() => {
    onHide();
  });
};