import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react-native';
import { getGoogleAuthUrl, getXAuthUrl } from '@/utils/api';
import * as WebBrowser from 'expo-web-browser';

interface LoginFormProps {
  onSwitchToRegister: () => void;
  onSwitchToRecovery: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToRegister, onSwitchToRecovery }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<'google' | 'twitter' | null>(null);
  
  const { login } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const styles = createStyles(isDark);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      console.log(email, password)
      await login(email, password);
      // Navigation will be handled by the auth context
    } catch (error: any) {
      Alert.alert('Login Failed', error.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setSocialLoading('google');
    try {
      console.log('🔄 Starting Google OAuth...');
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
      console.error('❌ Google login failed:', error);
      Alert.alert('Google Login Failed', error.message || 'Failed to authenticate with Google');
    } finally {
      setSocialLoading(null);
    }
  };

  const handleTwitterLogin = async () => {
    setSocialLoading('twitter');
    try {
      console.log('🔄 Starting Twitter OAuth...');
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
      console.error('❌ Twitter login failed:', error);
      Alert.alert('Twitter Login Failed', error.message || 'Failed to authenticate with Twitter');
    } finally {
      setSocialLoading(null);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
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
      </View>

      <TouchableOpacity
        style={[styles.loginButton, loading && styles.loginButtonDisabled]}
        onPress={handleLogin}
        disabled={loading}
      >
        <Text style={styles.loginButtonText}>
          {loading ? 'Logging in...' : 'Login'}
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
          onPress={handleGoogleLogin}
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
          onPress={handleTwitterLogin}
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

      <TouchableOpacity onPress={onSwitchToRecovery}>
        <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
      </TouchableOpacity>

      <View style={styles.switchContainer}>
        <Text style={styles.switchText}>Don't have an account? </Text>
        <TouchableOpacity onPress={onSwitchToRegister}>
          <Text style={styles.switchLink}>Sign up</Text>
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
  loginButton: {
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
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
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
  forgotPasswordText: {
    color: '#FF6B35',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
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

export default LoginForm;