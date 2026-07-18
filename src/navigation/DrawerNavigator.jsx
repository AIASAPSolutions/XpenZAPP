import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import useTheme from '../hooks/useTheme';
import useAuth from '../hooks/useAuth';
import { spacing } from '../constants/spacing';
import { typography } from '../constants/typography';

// Custom elements
import Avatar from '../components/common/Avatar';
import Divider from '../components/common/Divider';

// Screens imports
import MainNavigator from './MainNavigator';
import ProfileScreen from '../screens/profile/ProfileScreen';
import SettingsScreen from '../screens/profile/SettingsScreen';
import ProjectsScreen from '../screens/projects/ProjectsScreen';
import ProjectDetailScreen from '../screens/projects/ProjectDetailScreen';
import DataExportScreen from '../screens/export/DataExportScreen';

const Drawer = createDrawerNavigator();
const Stack = createNativeStackNavigator();

// Projects Stack nested inside drawer
const ProjectsStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
    <Stack.Screen name="ProjectsHome" component={ProjectsScreen} />
    <Stack.Screen name="ProjectDetail" component={ProjectDetailScreen} />
  </Stack.Navigator>
);

// Custom Drawer Header & Custom Items Layout
const CustomDrawerContent = (props) => {
  const { colors } = useTheme();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    logout();
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <DrawerContentScrollView {...props} contentContainerStyle={{ paddingTop: 0 }}>
        {/* User Profile Header Block */}
        <View style={[styles.headerContainer, { backgroundColor: colors.primaryContainer }]}>
          <Avatar size={64} name={user?.fullName || user?.email || 'User'} style={styles.avatar} />
        <Text style={[styles.userName, { color: colors.onPrimaryContainer }]}>
          {user?.fullName || user?.email?.split('@')[0] || 'User'}
        </Text>
        <Text style={[styles.userRole, { color: colors.textSecondary }]}>
          {user?.role || 'Member'} • {user?.organizationName || ''}
        </Text>
          {user?.accountType && (
            <View style={[styles.badge, { backgroundColor: colors.primary }]}>
              <Text style={styles.badgeText}>{user.accountType.toUpperCase()}</Text>
            </View>
          )}
        </View>

        <Divider style={{ marginVertical: spacing.sm }} />

        {/* Default routes list */}
        <DrawerItemList {...props} />
      </DrawerContentScrollView>

      {/* Branded Red Logout block at the bottom */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={handleLogout}
        style={[styles.logoutButton, { borderTopColor: colors.border }]}
      >
        <MaterialCommunityIcons name="logout" size={22} color={colors.error} />
        <Text style={[styles.logoutText, { color: colors.error }]}>Log Out</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export const DrawerNavigator = () => {
  const { colors, isDark } = useTheme();

  return (
    <Drawer.Navigator
      id="LeftDrawer"
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerActiveTintColor: colors.primary,
        drawerInactiveTintColor: colors.textSecondary,
        drawerActiveBackgroundColor: colors.primaryContainer,
        drawerStyle: {
          backgroundColor: colors.card,
          width: 280,
        },
        drawerLabelStyle: {
          fontFamily: typography.fontFamily,
          fontSize: typography.sizes.md,
          fontWeight: typography.weights.semibold,
          marginLeft: -spacing.sm,
        }
      }}
    >
      <Drawer.Screen
        name="DashboardDrawer"
        component={MainNavigator}
        options={{
          drawerLabel: 'Home Dashboard',
          drawerIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="view-dashboard-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          drawerLabel: 'My Profile',
          drawerIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account-circle-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Projects"
        component={ProjectsStack}
        options={{
          drawerLabel: 'Projects Hub',
          drawerIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="folder-open-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="DataExport"
        component={DataExportScreen}
        options={{
          drawerLabel: 'Data Export',
          drawerIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="database-export-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          drawerLabel: 'Settings',
          drawerIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="cog-outline" size={size} color={color} />
          ),
        }}
      />
    </Drawer.Navigator>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    padding: spacing.xl,
    paddingTop: 48,
    alignItems: 'flex-start',
    borderBottomLeftRadius: spacing.borderRadius.lg,
    borderBottomRightRadius: spacing.borderRadius.lg,
    marginBottom: spacing.md,
  },
  avatar: {
    marginBottom: spacing.md,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  userName: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.xs - 2,
  },
  userRole: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.xs + 1,
    fontWeight: typography.weights.medium,
    marginBottom: spacing.sm,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs - 2,
    borderRadius: spacing.borderRadius.sm,
  },
  badgeText: {
    fontFamily: typography.fontFamily,
    fontSize: 9,
    color: '#ffffff',
    fontWeight: typography.weights.bold,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderTopWidth: 1,
    gap: spacing.md,
  },
  logoutText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
  },
});
export default DrawerNavigator;
