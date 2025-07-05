import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import LoginForm from '@/components/auth/LoginForm';
import RegisterForm from '@/components/auth/RegisterForm';
import PasswordRecoveryForm from '@/components/auth/PasswordRecoveryForm';

export default function AuthScreen() {
  const { isAuthenticated } = useAuth();
  const { theme } = useTheme();
  const [currentForm, setCurrentForm] = useState<'login' | 'register' | 'recovery'>('login');
  
  const isDark = theme === 'dark';
  const styles = createStyles(isDark);

  if (isAuthenticated) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>You are already logged in!</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Task & Expenses</Text>
          <Text style={styles.subtitle}>
            {currentForm === 'login' && 'Welcome back'}
            {currentForm === 'register' && 'Create your account'}
            {currentForm === 'recovery' && 'Reset your password'}
          </Text>
        </View>

        {currentForm === 'login' && (
          <LoginForm 
            onSwitchToRegister={() => setCurrentForm('register')}
            onSwitchToRecovery={() => setCurrentForm('recovery')}
          />
        )}
        
        {currentForm === 'register' && (
          <RegisterForm 
            onSwitchToLogin={() => setCurrentForm('login')}
          />
        )}
        
        {currentForm === 'recovery' && (
          <PasswordRecoveryForm 
            onSwitchToLogin={() => setCurrentForm('login')}
          />
        )}
      </ScrollView>
    </View>
  );
}

const createStyles = (isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isDark ? '#191919' : '#F7F6F3',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: isDark ? '#FFFFFF' : '#000000',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: isDark ? '#9CA3AF' : '#6B7280',
    textAlign: 'center',
  },
});