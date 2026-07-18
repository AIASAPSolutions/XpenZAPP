import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
import { bentoText } from '../../constants/bento';
import { formatINR } from '../../utils/currency';
import { getCategoryById } from '../../constants/categories';
import * as reportsApi from '../../api/reports';

// Custom elements
import BentoCard from '../../components/common/BentoCard';
import BentoRow from '../../components/common/BentoRow';
import ExpenseCard from '../../components/expenses/ExpenseCard';
import EmptyState from '../../components/common/EmptyState';
import SpendingTrendChart from '../../components/reports/SpendingTrendChart';
import { openAppDrawer } from '../../utils/navigation';

export const DashboardScreen = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const { user } = useAuth();
  const { expenses, projects, fetchExpenses } = useExpenses();
  const { budgets, fetchBudgets } = useBudgets();
  const showToast = useUiStore((state) => state.showToast);
  const [overview, setOverview] = useState(null);

  useEffect(() => {
    fetchExpenses();
    fetchBudgets();
    reportsApi.getAnalyticsOverview().then((res) => setOverview(res.data)).catch(() => {});
  }, []);

  // Compute Dashboard Metrics
  const currentMonthExpenses = expenses.filter(e => {
    const d = new Date(e.date);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const totalSpentThisMonth = currentMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
  // Prefer the backend analytics total when available, fall back to local sum
  const displayTotalSpent = overview?.totalSpent ?? totalSpentThisMonth;
  const aiParsedCount = expenses.filter(e => e.isAiParsed).length;
  const aiEfficiencyPercent = expenses.length > 0 ? Math.round((aiParsedCount / expenses.length) * 100) : 0;

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

  const ACTIONS = [
    { id: 'add', icon: 'plus', label: 'Add Expense' },
    { id: 'scan', icon: 'camera', label: 'Scan Receipt' },
    { id: 'reports', icon: 'chart-arc', label: 'Reports' },
    { id: 'projects', icon: 'folder-text', label: 'Projects' },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#0A0A0A' : '#F5F5F7' }]}>
      {/* Top Bar */}
      <View style={styles.topHeader}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.getParent('LeftDrawer')?.openDrawer()}
          style={[styles.iconBtn, { borderColor: colors.border, backgroundColor: colors.card }]}
        >
          <MaterialCommunityIcons name="menu" size={22} color={colors.text} />
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => showToast("No new notifications.", "info")}
          style={[styles.iconBtn, { borderColor: colors.border, backgroundColor: colors.card }]}
        >
          <MaterialCommunityIcons name="bell-badge-outline" size={22} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* ROW 1: Large — Total Spent + greeting */}
        <BentoCard size="full" accent>
          <Text style={[bentoText.label, { color: 'rgba(255,255,255,0.75)' }]}>Total Spent · This Month</Text>
          <Text style={[bentoText.value, { color: '#ffffff', marginTop: 6 }]}>
            {formatINR(displayTotalSpent)}
          </Text>
          <Text style={[bentoText.subtitle, { color: 'rgba(255,255,255,0.85)', marginTop: 6 }]}>
            {getGreeting()}, {user?.fullName?.split(' ')[0] || 'there'}! 👋 · {new Date().toLocaleString('en-IN', { month: 'long', year: 'numeric' })}
          </Text>
        </BentoCard>

        {/* ROW 2: Active Projects | AI Efficiency */}
        <BentoRow>
          <BentoCard size="half">
            <Text style={[bentoText.label, { color: colors.textSecondary }]}>Active Projects</Text>
            <Text style={[bentoText.value, { color: colors.text, marginTop: 6 }]}>{projects.length}</Text>
            <Text style={[bentoText.subtitle, { color: colors.textSecondary, marginTop: 6 }]}>Workspaces tracked</Text>
          </BentoCard>
          <BentoCard size="half">
            <Text style={[bentoText.label, { color: colors.textSecondary }]}>AI Efficiency</Text>
            <Text style={[bentoText.value, { color: colors.text, marginTop: 6 }]}>{aiEfficiencyPercent}%</Text>
            <Text style={[bentoText.subtitle, { color: colors.textSecondary, marginTop: 6 }]}>Auto-logged via AI</Text>
          </BentoCard>
        </BentoRow>

        {/* ROW 3: Quick action chips */}
        <BentoRow style={styles.actionsRow}>
          {ACTIONS.map((action) => (
            <BentoCard key={action.id} style={styles.actionChip}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => handleQuickAction(action.id)}
                style={styles.actionChipInner}
              >
                <View style={[styles.actionIconWrapper, { backgroundColor: colors.primaryContainer }]}>
                  <MaterialCommunityIcons name={action.icon} size={20} color={colors.primary} />
                </View>
                <Text style={[styles.actionLabel, { color: colors.text }]} numberOfLines={2}>
                  {action.label}
                </Text>
              </TouchableOpacity>
            </BentoCard>
          ))}
        </BentoRow>

        {/* AI quick input entry point */}
        <BentoCard size="full" style={styles.aiCard}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => navigation.navigate('AIChat')}
            style={styles.aiCardInner}
          >
            <MaterialCommunityIcons name="auto-fix" size={20} color={colors.primary} />
            <Text style={[styles.aiText, { color: colors.textSecondary }]}>
              Tell XpenZ what you spent...
            </Text>
            <TouchableOpacity activeOpacity={0.7} onPress={handleMicPress} style={styles.micBtn}>
              <MaterialCommunityIcons name="microphone" size={20} color={colors.primary} />
            </TouchableOpacity>
          </TouchableOpacity>
        </BentoCard>

        {/* ROW 4: Large — Recent Expenses */}
        <BentoCard size="full">
          <View style={styles.cardHeaderRow}>
            <Text style={[bentoText.label, { color: colors.textSecondary }]}>Recent Expenses</Text>
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
        </BentoCard>

        {/* ROW 5: Spending trend chart */}
        <BentoCard size="full">
          <Text style={[bentoText.label, { color: colors.textSecondary, marginBottom: spacing.md }]}>Spending Trend</Text>
          <SpendingTrendChart />
        </BentoCard>

        {/* BUDGET OVERVIEW */}
        <View style={styles.cardHeaderRow}>
          <Text style={[bentoText.label, { color: colors.textSecondary }]}>Budgets Tracker</Text>
          <TouchableOpacity activeOpacity={0.7} onPress={() => navigation.navigate('Budgets')}>
            <Text style={[styles.seeAllText, { color: colors.primary }]}>View All</Text>
          </TouchableOpacity>
        </View>

        {budgets.length === 0 ? (
          <EmptyState
            icon="wallet"
            title="No Budgets Defined"
            description="Create categories limits to track overspending automatically."
          />
        ) : (
          <BentoRow style={styles.budgetsWrap}>
            {budgets.slice(0, 4).map((bud) => {
              const cat = getCategoryById(bud.category);
              const catExpenses = expenses.filter(e => e.category === bud.category);
              const spentAmount = catExpenses.reduce((sum, e) => sum + e.amount, 0);
              const ratio = Math.min(1.0, spentAmount / bud.amount);

              return (
                <BentoCard key={bud.id} size="half">
                  <View style={styles.budgetHeader}>
                    <View style={styles.categoryNameRow}>
                      <MaterialCommunityIcons name={cat.icon} size={18} color={cat.color} style={{ marginRight: spacing.sm }} />
                      <Text style={[styles.budgetNameText, { color: colors.text }]} numberOfLines={1}>{bud.name}</Text>
                    </View>
                  </View>
                  <Text style={[styles.budgetSpentText, { color: colors.text }]}>
                    {formatINR(spentAmount)} <Text style={{ color: colors.textSecondary }}>/ {formatINR(bud.amount)}</Text>
                  </Text>
                  <ProgressBar
                    progress={ratio}
                    color={ratio > 0.8 ? colors.error : ratio > 0.6 ? colors.warning : colors.success}
                    style={styles.budgetProgress}
                  />
                  {ratio >= 0.8 && (
                    <View style={styles.warningRow}>
                      <MaterialCommunityIcons name="alert-circle-outline" size={14} color={colors.error} />
                      <Text style={[styles.warningText, { color: colors.error }]}>
                        {ratio >= 1.0 ? '🚫 Exceeded!' : '⚠ Nearing limit'}
                      </Text>
                    </View>
                  )}
                </BentoCard>
              );
            })}
          </BentoRow>
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
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 40 : 16,
    paddingBottom: spacing.md,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 84, // Space for Bottom Tab
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  seeAllText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.xs + 1,
    fontWeight: typography.weights.bold,
  },
  actionsRow: {
    marginBottom: 0,
  },
  actionChip: {
    width: '23%',
    padding: 0,
    marginBottom: 12,
  },
  actionChipInner: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 6,
  },
  actionIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs + 2,
  },
  actionLabel: {
    fontFamily: typography.fontFamily,
    fontSize: 10,
    fontWeight: typography.weights.bold,
    textAlign: 'center',
  },
  aiCard: {
    padding: 0,
  },
  aiCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  aiText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    marginLeft: spacing.sm,
    flex: 1,
  },
  micBtn: {
    padding: spacing.xs,
  },
  listContainer: {
    gap: spacing.sm,
  },
  budgetsWrap: {
    flexWrap: 'wrap',
  },
  budgetHeader: {
    marginBottom: spacing.sm,
  },
  categoryNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  budgetNameText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
  budgetSpentText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.sm,
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
