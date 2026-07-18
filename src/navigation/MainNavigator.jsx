import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import useTheme from '../hooks/useTheme';
import { spacing } from '../constants/spacing';
import { typography } from '../constants/typography';

// Screens imports
import DashboardScreen from '../screens/dashboard/DashboardScreen';
import AIChatScreen from '../screens/ai/AIChatScreen';
import ExpensesListScreen from '../screens/expenses/ExpensesListScreen';
import ExpenseDetailScreen from '../screens/expenses/ExpenseDetailScreen';
import AddExpenseScreen from '../screens/expenses/AddExpenseScreen';
import EditExpenseScreen from '../screens/expenses/EditExpenseScreen';
import BudgetsScreen from '../screens/budgets/BudgetsScreen';
import BudgetDetailScreen from '../screens/budgets/BudgetDetailScreen';
import CreateBudgetScreen from '../screens/budgets/CreateBudgetScreen';
import ReportsScreen from '../screens/reports/ReportsScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Stacks for nested views
const DashboardStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
    <Stack.Screen name="DashboardHome" component={DashboardScreen} />
  </Stack.Navigator>
);

const ExpensesStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
    <Stack.Screen name="ExpensesHome" component={ExpensesListScreen} />
    <Stack.Screen name="ExpenseDetail" component={ExpenseDetailScreen} />
    <Stack.Screen name="AddExpense" component={AddExpenseScreen} />
    <Stack.Screen name="EditExpense" component={EditExpenseScreen} />
  </Stack.Navigator>
);

const BudgetsStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
    <Stack.Screen name="BudgetsHome" component={BudgetsScreen} />
    <Stack.Screen name="BudgetDetail" component={BudgetDetailScreen} />
    <Stack.Screen name="CreateBudget" component={CreateBudgetScreen} />
  </Stack.Navigator>
);

const ReportsStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
    <Stack.Screen name="ReportsHome" component={ReportsScreen} />
  </Stack.Navigator>
);

// Center Custom AI FAB Button
const CustomTabBarButton = ({ children, onPress }) => {
  const { colors } = useTheme();
  
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (onPress) onPress();
  };

  return (
    <TouchableOpacity
      style={styles.customFabContainer}
      activeOpacity={0.85}
      onPress={handlePress}
    >
      <View style={[styles.customFab, { backgroundColor: colors.primary, shadowColor: colors.primary }]}>
        {children}
      </View>
    </TouchableOpacity>
  );
};

export const MainNavigator = () => {
  const { colors, isDark } = useTheme();

  return (
    <Tab.Navigator
      initialRouteName="Dashboard"
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          height: 64,
          paddingBottom: spacing.sm,
          paddingTop: spacing.xs,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          elevation: 10,
          borderTopWidth: isDark ? 1 : 1.5,
          borderTopLeftRadius: spacing.borderRadius.lg,
          borderTopRightRadius: spacing.borderRadius.lg,
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
        },
        tabBarLabelStyle: {
          fontFamily: typography.fontFamily,
          fontSize: typography.sizes.xs - 1,
          fontWeight: typography.weights.semibold,
        }
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardStack}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home-minus-outline" size={size + 2} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Expenses"
        component={ExpensesStack}
        options={{
          tabBarLabel: 'Expenses',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="receipt" size={size + 1} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="AIChat"
        component={AIChatScreen}
        options={{
          tabBarLabel: '',
          tabBarIcon: () => (
            <MaterialCommunityIcons name="auto-fix" size={28} color="#ffffff" />
          ),
          tabBarButton: (props) => <CustomTabBarButton {...props} />,
        }}
      />
      <Tab.Screen
        name="Budgets"
        component={BudgetsStack}
        options={{
          tabBarLabel: 'Budgets',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="wallet-outline" size={size + 2} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Reports"
        component={ReportsStack}
        options={{
          tabBarLabel: 'Reports',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="chart-box-outline" size={size + 2} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  customFabContainer: {
    top: -24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  customFab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
});
export default MainNavigator;
