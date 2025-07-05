import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface LoaderProps {
  size?: 'small' | 'large';
  text?: string;
}

const Loader: React.FC<LoaderProps> = ({ size = 'large', text }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const styles = createStyles(isDark);

  return (
    <View style={styles.container}>
      <ActivityIndicator 
        size={size} 
        color="#FF6B35" 
      />
      {text && <Text style={styles.text}>{text}</Text>}
    </View>
  );
};

const createStyles = (isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: isDark ? '#191919' : '#F7F6F3',
  },
  text: {
    marginTop: 10,
    fontSize: 16,
    color: isDark ? '#FFFFFF' : '#000000',
  },
});

export default Loader;