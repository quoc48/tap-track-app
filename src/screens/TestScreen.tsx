// TestScreen.tsx - Minimal test screen to isolate UI freeze issue
import * as React from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, StyleSheet } from 'react-native';

export const TestScreen = () => {
  const [count, setCount] = React.useState(0);
  const [logs, setLogs] = React.useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `${timestamp}: ${message}`;
    console.log(logEntry);
    setLogs(prev => [logEntry, ...prev.slice(0, 19)]); // Keep last 20 logs
  };

  const testBasicInteraction = () => {
    addLog('Basic interaction test started');
    setCount(prev => prev + 1);
    
    setTimeout(() => {
      addLog('setTimeout callback executed');
      
      // Start monitoring
      let monitorCount = 0;
      const monitor = setInterval(() => {
        monitorCount++;
        addLog(`Monitor ${monitorCount}: UI responsive`);
        
        if (monitorCount >= 5) {
          clearInterval(monitor);
          addLog('Monitor test complete - check UI responsiveness');
        }
      }, 500);
    }, 100);
  };

  const testStateUpdates = () => {
    addLog('State update test started');
    
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        setCount(prev => prev + 1);
        addLog(`State update ${i + 1}/5`);
      }, i * 100);
    }
    
    setTimeout(() => {
      addLog('All state updates completed');
    }, 600);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>UI Freeze Test Screen</Text>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={testBasicInteraction}>
            <Text style={styles.buttonText}>Test Basic Interaction</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.button} onPress={testStateUpdates}>
            <Text style={styles.buttonText}>Test State Updates</Text>
          </TouchableOpacity>
          
          <Text style={styles.counter}>Count: {count}</Text>
        </View>
        
        <View style={styles.logContainer}>
          <Text style={styles.logTitle}>Logs:</Text>
          {logs.map((log, index) => (
            <Text key={index} style={styles.logText}>{log}</Text>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
  },
  buttonContainer: {
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '600',
  },
  counter: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 10,
  },
  logContainer: {
    backgroundColor: '#F8F9FA',
    padding: 15,
    borderRadius: 8,
  },
  logTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  logText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
});