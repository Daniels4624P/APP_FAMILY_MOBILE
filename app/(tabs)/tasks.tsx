import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Wallet, FolderOpen, FileText, ChartBar as BarChart2, Calendar, Plus } from 'lucide-react-native';
import { router } from 'expo-router';

export default function TasksScreen() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const styles = createStyles(isDark);

  const taskOptions = [
    {
      title: 'Projects',
      description: 'Organize tasks into projects',
      icon: Wallet,
      color: '#3B82F6',
      route: '/tasks/projects',
    },
    {
      title: 'Folders',
      description: 'Group related tasks together',
      icon: FolderOpen,
      color: '#10B981',
      route: '/tasks/folders',
    },
    {
      title: 'All Tasks',
      description: 'View and manage all your tasks',
      icon: FileText,
      color: '#8B5CF6',
      route: '/tasks/list',
    },
    {
      title: 'Calendar',
      description: 'View tasks in calendar format',
      icon: Calendar,
      color: '#F59E0B',
      route: '/tasks/calendar',
    },
    {
      title: 'Analytics',
      description: 'Track your productivity',
      icon: BarChart2,
      color: '#EF4444',
      route: '/tasks/analytics',
    },
    {
      title: 'Create Task',
      description: 'Add a new task quickly',
      icon: Plus,
      color: '#FF6B35',
      route: '/tasks/create',
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Tasks</Text>
          <Text style={styles.subtitle}>Stay organized and productive</Text>
        </View>

        <View style={styles.optionsGrid}>
          {taskOptions.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={styles.optionCard}
              onPress={() => router.push(option.route as any)}
            >
              <View style={[styles.optionIcon, { backgroundColor: option.color }]}>
                <option.icon size={24} color="white" />
              </View>
              <Text style={styles.optionTitle}>{option.title}</Text>
              <Text style={styles.optionDescription}>{option.description}</Text>
            </TouchableOpacity>
          ))}
        </View>
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
    padding: 20,
    paddingTop: 60,
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: isDark ? '#FFFFFF' : '#000000',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: isDark ? '#9CA3AF' : '#6B7280',
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  optionCard: {
    width: '48%',
    backgroundColor: isDark ? '#202020' : '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  optionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: isDark ? '#FFFFFF' : '#000000',
    marginBottom: 5,
  },
  optionDescription: {
    fontSize: 12,
    color: isDark ? '#9CA3AF' : '#6B7280',
    lineHeight: 16,
  },
});