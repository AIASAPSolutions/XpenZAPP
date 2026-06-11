import React, { useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, SafeAreaView, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ProgressBar } from 'react-native-paper';
import * as Haptics from 'expo-haptics';

import useAuth from '../../hooks/useAuth';
import useExpenses from '../../hooks/useExpenses';
import useBudgets from '../../hooks/useBudgets';
import useTheme from '../../hooks/useTheme';
import { useUiStore } from '../../store/uiStore';
import { spacing } from '../../constants/spacing';
import { typography } from '../../constants/typography';
import { formatINR } from '../../utils/currency';
import { getCategoryById } from '../../constants/categories';

// Custom elements
import Card from '../../components/common/Card';
import ExpenseCard from '../../components/expenses/ExpenseCard';
import Divider from '../../components/common/Divider';
import EmptyState from '../../components/common/EmptyState';
import { openAppDrawer } from '../../utils/navigation';

export const DashboardScreen = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const { user } = useAuth();
  const { expenses, fetchExpenses } = useExpenses();
  const { budgets, fetchBudgets } = useBudgets();
  const showToast = useUiStore((state) => state.showToast);

  useEffect(() => {
    fetchExpenses();
    fetchBudgets();
  }, []);

  // Compute Dashboard Metrics
  const currentMonthExpenses = expenses.filter(e => {
    const d = new Date(e.date);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const totalSpentThisMonth = currentMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalBudgeted = budgets.reduce((sum, b) => sum + b.amount, 0) || 97000;
  const remainingBudget = Math.max(0, totalBudgeted - totalSpentThisMonth);
  const consumedPercent = totalBudgeted > 0 ? (totalSpentThisMonth / totalBudgeted) : 0;

  const handleMicPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('AIChat', { autoVoice: true });
  };

  const handleQuickAction = (action) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (action === 'add') {
      navigation.navigate('Expenses', { screen: 'AddExpense' });
    } else if (action === 'scan') {
      navigation.navigate('Expenses', { screen: 'AddExpense', params: { triggerOcr: true } });
    } else if (action === 'reports') {
      navigation.navigate('Reports');
    } else if (action === 'projects') {
      openAppDrawer(navigation);
    }
  };

  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return 'Good morning';
    if (hr < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top Welcome Header */}
      <View style={styles.topHeader}>
        <View>
          <Text style={[styles.greeting, { color: colors.textSecondary }]}>
            {getGreeting()}, {user?.fullName?.split(' ')[0] || 'Rahul'}! 👋
          </Text>
          <Text style={[styles.dateRange, { color: colors.text }]}>
            {new Date().toLocaleString('en-IN', { month: 'long', year: 'numeric' })}
          </Text>
        </View>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => showToast("No new notifications.", "info")}
          style={[styles.bellContainer, { borderColor: colors.border, backgroundColor: colors.card }]}
        >
          <MaterialCommunityIcons name="bell-badge-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* HORIZONTAL SUMMARY CARD ROW */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.summaryRow}
          decelerationRate="fast"
          snapToInterval={280}
        >
          {/* Card 1: Total Spent */}
          <Card style={styles.summaryCard} elevation="medium">
            <View style={styles.summaryHeader}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Total Spent</Text>
              <MaterialCommunityIcons name="currency-inr" size={20} color={colors.primary} />
            </View>
            <Text style={[styles.summaryVal, { color: colors.text }]}>
              {formatINR(totalSpentThisMonth)}
            </Text>
            <Text style={[styles.summaryChange, { color: colors.success }]}>
              ↓ 12% vs last month
            </Text>
          </Card>

          {/* Card 2: Remaining Budget */}
          <Card style={styles.summaryCard} elevation="medium">
            <View style={styles.summaryHeader}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Remaining Budget</Text>
              <MaterialCommunityIcons name="wallet-membership" size={20} color={colors.success} />
            </View>
            <Text style={[styles.summaryVal, { color: colors.text }]}>
              {formatINR(remainingBudget)}
            </Text>
            {/* Horizontal mini Progress indicator */}
            <ProgressBar
              progress={consumedPercent}
              color={consumedPercent > 0.8 ? colors.error : consumedPercent > 0.6 ? colors.warning : colors.success}
              style={styles.summaryProgress}
            />
            <Text style={[styles.summaryPercentLabel, { color: colors.textSecondary }]}>
              {Math.round(consumedPercent * 100)}% consumed
            </Text>
          </Card>

          {/* Card 3: Expenses count */}
          <Card style={styles.summaryCard} elevation="medium">
            <View style={styles.summaryHeader}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Logged Count</Text>
              <MaterialCommunityIcons name="file-document-outline" size={20} color={colors.secondary} />
            </View>
            <Text style={[styles.summaryVal, { color: colors.text }]}>
              {currentMonthExpenses.length} bills
            </Text>
            <Text style={[styles.summaryChange, { color: colors.textSecondary }]}>
              Updated just now
            </Text>
          </Card>
        </ScrollView>

        {/* AI QUICK INPUT BAR */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => navigation.navigate('AIChat')}
          style={[styles.aiBar, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <MaterialCommunityIcons name="sparkles" size={22} color={colors.primary} />
          <Text style={[styles.aiText, { color: colors.textSecondary }]}>
            Tell XpenZ what you spent...
          </Text>
          <TouchableOpacity activeOpacity={0.7} onPress={handleMicPress} style={styles.micBtn}>
            <MaterialCommunityIcons name="microphone" size={20} color={colors.primary} />
          </TouchableOpacity>
        </TouchableOpacity>

        {/* QUICK ACTION BUTTONS ROW */}
        <View style={styles.actionsRow}>
          <TouchableOpacity activeOpacity={0.8} onPress={() => handleQuickAction('add')} style={styles.actionBtn}>
            <View style={[styles.actionIconWrapper, { backgroundColor: '#e0e7ff' }]}>
              <MaterialCommunityIcons name="plus" size={24} color={colors.primary} />
            </View>
            <Text style={[styles.actionLabel, { color: colors.text }]}>Add Expense</Text>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.8} onPress={() => handleQuickAction('scan')} style={styles.actionBtn}>
            <View style={[styles.actionIconWrapper, { backgroundColor: '#dcfce7' }]}>
              <MaterialCommunityIcons name="camera" size={22} color="#15803d" />
            </View>
            <Text style={[styles.actionLabel, { color: colors.text }]}>Scan Receipt</Text>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.8} onPress={() => handleQuickAction('reports')} style={styles.actionBtn}>
            <View style={[styles.actionIconWrapper, { backgroundColor: '#fef3c7' }]}>
              <MaterialCommunityIcons name="chart-arc" size={22} color="#b45309" />
            </View>
            <Text style={[styles.actionLabel, { color: colors.text }]}>Reports</Text>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.8} onPress={() => handleQuickAction('projects')} style={styles.actionBtn}>
            <View style={[styles.actionIconWrapper, { backgroundColor: '#fee2e2' }]}>
              <MaterialCommunityIcons name="folder-text" size={22} color="#b91c1c" />
            </View>
            <Text style={[styles.actionLabel, { color: colors.text }]}>Projects</Text>
          </TouchableOpacity>
        </View>

        {/* RECENT EXPENSES SECTION */}
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Expenses</Text>
          <TouchableOpacity activeOpacity={0.7} onPress={() => navigation.navigate('Expenses')}>
            <Text style={[styles.seeAllText, { color: colors.primary }]}>See All</Text>
          </TouchableOpacity>
        </View>

        {expenses.length === 0 ? (
          <EmptyState
            icon="receipt"
            title="No Expenses Logged"
            description="Log your first business expense by talking to XpenZ AI sidekick!"
          />
        ) : (
          <View style={styles.listContainer}>
            {expenses.slice(0, 5).map((expense) => (
              <ExpenseCard
                key={expense.id}
                expense={expense}
                onPress={() => navigation.navigate('Expenses', { screen: 'ExpenseDetail', params: { id: expense.id } })}
              />
            ))}
          </View>
        )}

        {/* BUDGET OVERVIEW SECTION */}
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Budgets Tracker</Text>
          <TouchableOpacity activeOpacity={0.7} onPress={() => navigation.navigate('Budgets')}>
            <Text style={[styles.seeAllText, { color: colors.primary }]}>View All Budgets</Text>
          </TouchableOpacity>
        </View>

        {budgets.length === 0 ? (
          <EmptyState
            icon="wallet"
            title="No Budgets Defined"
            description="Create categories limits to track overspending automatically."
          />
        ) : (
          <View style={styles.budgetsOverviewContainer}>
            {budgets.slice(0, 3).map((bud) => {
              const cat = getCategoryById(bud.category);
              const catExpenses = expenses.filter(e => e.category === bud.category);
              const spentAmount = catExpenses.reduce((sum, e) => sum + e.amount, 0);
              const ratio = Math.min(1.0, spentAmount / bud.amount);
              
              return (
                <Card key={bud.id} style={styles.budgetOverviewCard} elevation="light">
                  <View style={styles.budgetHeader}>
                    <View style={styles.categoryNameRow}>
                      <MaterialCommunityIcons name={cat.icon} size={20} color={cat.color} style={{ marginRight: spacing.sm }} />
                      <Text style={[styles.budgetNameText, { color: colors.text }]}>{bud.name}</Text>
                    </View>
                    <Text style={[styles.budgetSpentText, { color: colors.text }]}>
                      {formatINR(spentAmount)} / <Text style={{ color: colors.textSecondary }}>{formatINR(bud.amount)}</Text>
                    </Text>
                  </View>
                  <ProgressBar
                    progress={ratio}
                    color={ratio > 0.8 ? colors.error : ratio > 0.6 ? colors.warning : colors.success}
                    style={styles.budgetProgress}
                  />
                  {ratio >= 0.8 && (
                    <View style={styles.warningRow}>
                      <MaterialCommunityIcons name="alert-circle-outline" size={14} color={colors.error} />
                      <Text style={[styles.warningText, { color: colors.error }]}>
                        {ratio >= 1.0 ? '🚫 Budget exceeded limit!' : '⚠ Nearing limits (>80%)'}
                      </Text>
                    </View>
                  )}
                </Card>
              );
            })}
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingTop: Platform.OS === 'android' ? 40 : 16,
    paddingBottom: spacing.md,
  },
  greeting: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.xs + 2,
    fontWeight: typography.weights.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dateRange: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.xxl - 2,
    fontWeight: typography.weights.bold,
    marginTop: 2,
  },
  bellContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  scrollContent: {
    paddingBottom: 84, // Space for Bottom Tab
  },
  summaryRow: {
    paddingLeft: spacing.xl,
    paddingRight: spacing.sm,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  summaryCard: {
    width: 250,
    padding: spacing.md + 2,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  summaryLabel: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.xs + 1,
    fontWeight: typography.weights.semibold,
  },
  summaryVal: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.xxl - 2,
    fontWeight: typography.weights.black,
    marginBottom: spacing.xs,
  },
  summaryChange: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
  },
  summaryProgress: {
    height: 4,
    borderRadius: 2,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  summaryPercentLabel: {
    fontFamily: typography.fontFamily,
    fontSize: 10,
    fontWeight: typography.weights.medium,
  },
  aiBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.xl,
    paddingVertical: spacing.md - 2,
    paddingHorizontal: spacing.lg,
    borderRadius: spacing.borderRadius.xl,
    borderWidth: 1.5,
    marginVertical: spacing.md,
  },
  aiText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.sm + 1,
    fontWeight: typography.weights.semibold,
    marginLeft: spacing.sm,
    flex: 1,
  },
  micBtn: {
    padding: spacing.xs,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: spacing.xl,
    marginVertical: spacing.md,
  },
  actionBtn: {
    alignItems: 'center',
    flex: 1,
  },
  actionIconWrapper: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  actionLabel: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.xs - 1,
    fontWeight: typography.weights.bold,
    textAlign: 'center',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
  },
  seeAllText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
  listContainer: {
    paddingHorizontal: spacing.xl,
  },
  budgetsOverviewContainer: {
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  budgetOverviewCard: {
    padding: spacing.md,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  categoryNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  budgetNameText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.sm + 1,
    fontWeight: typography.weights.bold,
  },
  budgetSpentText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
  },
  budgetProgress: {
    height: 6,
    borderRadius: 3,
  },
  warningRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
    gap: 4,
  },
  warningText: {
    fontFamily: typography.fontFamily,
    fontSize: 10,
    fontWeight: typography.weights.bold,
  },
});
export default DashboardScreen;
