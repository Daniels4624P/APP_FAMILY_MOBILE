import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react-native';
import { getGoogleAuthUrl, getXAuthUrl } from '@/utils/api';
import * as WebBrowser from 'expo-web-browser';

interface RegisterFormProps {
  onSwitchToLogin: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSwitchToLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<'google' | 'twitter' | null>(null);
  
  const { register } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const styles = createStyles(isDark);

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      await register(name, email, password);
      // Navigation will be handled by the auth context
    } catch (error: any) {
      Alert.alert('Registration Failed', error.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    setSocialLoading('google');
    try {
      console.log('🔄 Starting Google OAuth registration...');
      const response = await getGoogleAuthUrl();
      
      if (response.data && response.data.authUrl) {
        console.log('✅ Received Google auth URL:', response.data.authUrl);
        
        // Redirect to the OAuth URL
        const result = await WebBrowser.openAuthSessionAsync(
          response.data.authUrl, 
          'myapp://auth/google/callback'
        );
        
        console.log('🔄 OAuth result:', result);
        
        if (result.type === 'success' && result.url) {
          // Handle the callback URL
          const url = new URL(result.url);
          const code = url.searchParams.get('code');
          const state = url.searchParams.get('state');
          
          if (code && state) {
            console.log('✅ Google OAuth successful, processing callback...');
            // The callback will be handled by the API interceptor
          }
        } else if (result.type === 'cancel') {
          console.log('⚠️ User cancelled Google OAuth');
        }
      } else {
        throw new Error('No auth URL received from server');
      }
    } catch (error: any) {
      console.error('❌ Google registration failed:', error);
      Alert.alert('Google Registration Failed', error.message || 'Failed to authenticate with Google');
    } finally {
      setSocialLoading(null);
    }
  };

  const handleTwitterRegister = async () => {
    setSocialLoading('twitter');
    try {
      console.log('🔄 Starting Twitter OAuth registration...');
      const response = await getXAuthUrl();
      
      if (response.data && response.data.authUrl) {
        console.log('✅ Received Twitter auth URL:', response.data.authUrl);
        
        // Redirect to the OAuth URL
        const result = await WebBrowser.openAuthSessionAsync(
          response.data.authUrl, 
          'myapp://auth/x/callback'
        );
        
        console.log('🔄 OAuth result:', result);
        
        if (result.type === 'success' && result.url) {
          // Handle the callback URL
          const url = new URL(result.url);
          const code = url.searchParams.get('code');
          const state = url.searchParams.get('state');
          
          if (code && state) {
            console.log('✅ Twitter OAuth successful, processing callback...');
            // The callback will be handled by the API interceptor
          }
        } else if (result.type === 'cancel') {
          console.log('⚠️ User cancelled Twitter OAuth');
        }
      } else {
        throw new Error('No auth URL received from server');
      }
    } catch (error: any) {
      console.error('❌ Twitter registration failed:', error);
      Alert.alert('Twitter Registration Failed', error.message || 'Failed to authenticate with Twitter');
    } finally {
      setSocialLoading(null);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <User size={20} color={isDark ? '#9CA3AF' : '#6B7280'} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            autoCorrect={false}
          />
        </View>

        <View style={styles.inputWrapper}>
          <Mail size={20} color={isDark ? '#9CA3AF' : '#6B7280'} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <View style={styles.inputWrapper}>
          <Lock size={20} color={isDark ? '#9CA3AF' : '#6B7280'} style={styles.inputIcon} />
          <TextInput
            style={[styles.input, styles.passwordInput]}
            placeholder="Password"
            placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
            ) : (
              <Eye size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.inputWrapper}>
          <Lock size={20} color={isDark ? '#9CA3AF' : '#6B7280'} style={styles.inputIcon} />
          <TextInput
            style={[styles.input, styles.passwordInput]}
            placeholder="Confirm Password"
            placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirmPassword}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? (
              <EyeOff size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
            ) : (
              <Eye size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.registerButton, loading && styles.registerButtonDisabled]}
        onPress={handleRegister}
        disabled={loading}
      >
        <Text style={styles.registerButtonText}>
          {loading ? 'Creating Account...' : 'Create Account'}
        </Text>
      </TouchableOpacity>

      <View style={styles.dividerContainer}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>or continue with</Text>
        <View style={styles.dividerLine} />
      </View>

      <View style={styles.socialButtonsContainer}>
        <TouchableOpacity
          style={[styles.socialButton, styles.googleButton, socialLoading === 'google' && styles.socialButtonDisabled]}
          onPress={handleGoogleRegister}
          disabled={socialLoading !== null}
        >
          <View style={styles.socialButtonContent}>
            <View style={styles.googleIcon}>
              <Text style={styles.googleIconText}>G</Text>
            </View>
            <Text style={styles.socialButtonText}>
              {socialLoading === 'google' ? 'Connecting...' : 'Google'}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.socialButton, styles.twitterButton, socialLoading === 'twitter' && styles.socialButtonDisabled]}
          onPress={handleTwitterRegister}
          disabled={socialLoading !== null}
        >
          <View style={styles.socialButtonContent}>
            <View style={styles.twitterIcon}>
              <Text style={styles.twitterIconText}>𝕏</Text>
            </View>
            <Text style={styles.socialButtonText}>
              {socialLoading === 'twitter' ? 'Connecting...' : 'Twitter'}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.switchContainer}>
        <Text style={styles.switchText}>Already have an account? </Text>
        <TouchableOpacity onPress={onSwitchToLogin}>
          <Text style={styles.switchLink}>Sign in</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const createStyles = (isDark: boolean) => StyleSheet.create({
  container: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: isDark ? '#202020' : '#FFFFFF',
    borderRadius: 12,
    marginBottom: 15,
    paddingHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: isDark ? '#FFFFFF' : '#000000',
  },
  passwordInput: {
    paddingRight: 40,
  },
  eyeIcon: {
    position: 'absolute',
    right: 15,
    padding: 5,
  },
  registerButton: {
    backgroundColor: '#FF6B35',
    borderRadius: 12,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  registerButtonDisabled: {
    opacity: 0.6,
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: isDark ? '#404040' : '#E5E7EB',
  },
  dividerText: {
    marginHorizontal: 15,
    color: isDark ? '#9CA3AF' : '#6B7280',
    fontSize: 14,
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 10,
  },
  socialButton: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  googleButton: {
    backgroundColor: isDark ? '#202020' : '#FFFFFF',
    borderWidth: 1,
    borderColor: isDark ? '#404040' : '#E5E7EB',
  },
  twitterButton: {
    backgroundColor: '#000000',
  },
  socialButtonDisabled: {
    opacity: 0.6,
  },
  socialButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#4285F4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  googleIconText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  twitterIcon: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  twitterIconText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: isDark ? '#FFFFFF' : '#000000',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  switchText: {
    color: isDark ? '#9CA3AF' : '#6B7280',
    fontSize: 14,
  },
  switchLink: {
    color: '#FF6B35',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default RegisterForm;