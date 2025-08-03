// App.tsx - COMPLETE UPDATED VERSION WITH TEST CODE
import * as React from 'react';
import { View, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AddScreen } from './src/screens/AddScreen';
import { ReportScreen } from './src/screens/ReportScreen';
import { TransactionProvider } from './src/context/TransactionContext';
import { Ionicons } from '@expo/vector-icons';

// THÊM IMPORT NÀY ĐỂ TEST SUPABASE CONNECTION
import { testSupabaseConnection } from './src/lib/testSupabase';

const Tab = createBottomTabNavigator();

export default function App() {
  // THÊM USEEFFECT NÀY ĐỂ TEST CONNECTION KHI APP START
  React.useEffect(() => {
    // Test Supabase connection khi app khởi động
    console.log('🚀 App started, testing Supabase connection...');
    testSupabaseConnection();
  }, []);

  return (
    <TransactionProvider>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={{
            tabBarStyle: {
              backgroundColor: '#FFFFFF',
              borderTopWidth: 0,
              elevation: 10,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: -3 },
              shadowOpacity: 0.1,
              shadowRadius: 3,
              height: Platform.OS === 'ios' ? 85 : 65,
              paddingTop: 5,
            },
            tabBarActiveTintColor: '#007AFF',
            tabBarInactiveTintColor: '#8E8E93',
            headerShown: false,
            tabBarLabelStyle: {
              fontSize: 12,
              fontWeight: '600',
              marginBottom: Platform.OS === 'ios' ? 0 : 5,
            },
            tabBarIconStyle: {
              marginTop: 5,
            },
          }}
        >
          <Tab.Screen 
            name="Add" 
            component={AddScreen}
            options={{
              tabBarLabel: 'Thêm',
              tabBarIcon: ({ color, focused }) => (
                <View style={{
                  backgroundColor: focused ? '#E3F2FD' : 'transparent',
                  padding: 8,
                  borderRadius: 20,
                }}>
                  <Ionicons 
                    name={focused ? "add-circle" : "add-circle-outline"} 
                    size={26} 
                    color={color} 
                  />
                </View>
              ),
            }}
          />
          <Tab.Screen 
            name="Report" 
            component={ReportScreen}
            options={{
              tabBarLabel: 'Báo cáo',
              tabBarIcon: ({ color, focused }) => (
                <View style={{
                  backgroundColor: focused ? '#E3F2FD' : 'transparent',
                  padding: 8,
                  borderRadius: 20,
                }}>
                  <Ionicons 
                    name={focused ? "stats-chart" : "stats-chart-outline"} 
                    size={24} 
                    color={color} 
                  />
                </View>
              ),
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </TransactionProvider>
  );
}