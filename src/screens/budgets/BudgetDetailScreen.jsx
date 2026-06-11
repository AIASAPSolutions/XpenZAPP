import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';
import * as Haptics from 'expo-haptics';

import useBudgets from '../../hooks/useBudgets';
import useExpenses from '../../hooks/useExpenses';
import useTheme from '../../hooks/useTheme';
import { spacing } from '../../constants/spacing';
import { typography } from '../../constants/typography';
import { getCategoryById } from '../../constants/categories';
import { formatINR } from '../../utils/currency';

// Custom elements
import Card from '../../components/common/Card';
import ExpenseCard from '../../components/expenses/ExpenseCard';
import Badge from '../../components/common/Badge';

export const BudgetDetailScreen = ({ route, navigation }) => {
  const { id } = route.params;
  const { colors } = useTheme();
  const { budgets } = useBudgets();
  const { expenses } = useExpenses();

  const budget = budgets.find(b => b.id === id);

  if (!budget) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.errorWrapper}>
          <Text style={[styles.errorText, { color: colors.text }]}>Budget not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const cat = getCategoryById(budget.category);
  const catExpenses = expenses.filter(e => e.category === budget.category);
  
  // Math metrics
  const spent = catExpenses.reduce((sum, e) => sum + e.amount, 0);
  const limit = budget.amount;
  const remaining = Math.max(0, limit - spent);
  const ratio = Math.min(1.0, spent / limit);
  const percentage = Math.round(ratio * 100);

  // SVG Circular Ring setup
  const size = 180;
  const strokeWidth = 16;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - ratio * circumference;

  // Daily Averages
  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
  const currentDay = new Date().getDate();
  const dailyAverage = spent / currentDay;
  const projectedEom = dailyAverage * daysInMonth;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header controls bar */}
      <View style={styles.header}>
        <TouchableOpacity activeOpacity={0.7} onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Budget Limits</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* CIRCULAR PROGRESS RING CARD */}
        <Card style={styles.ringCard} elevation="heavy">
          
          {/* Header */}
          <View style={styles.catHeader}>
            <View style={[styles.catCircle, { backgroundColor: `${cat.color}15` }]}>
              <MaterialCommunityIcons name={cat.icon} size={24} color={cat.color} />
            </View>
            <View>
              <Text style={[styles.budgetNameText, { color: colors.text }]}>{budget.name}</Text>
              <Text style={[styles.periodText, { color: colors.textSecondary }]}>{budget.period} Limit</Text>
            </View>
          </View>

          {/* SVG Canvas Ring */}
          <View style={styles.ringWrapper}>
            <Svg width={size} height={size}>
              {/* Background circle */}
              <Circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke={colors.divider}
                strokeWidth={strokeWidth}
                fill="transparent"
              />
              {/* Highlight active circle */}
              <Circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke={ratio > 0.8 ? colors.error : ratio > 0.6 ? colors.warning : colors.success}
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                transform={`rotate(-90 ${size / 2} ${size / 2})`}
              />
            </Svg>
            
            {/* Overlay texts */}
            <View style={styles.ringOverlayText}>
              <Text style={[styles.ringPercentText, { color: colors.text }]}>{percentage}%</Text>
              <Text style={[styles.ringLabelText, { color: colors.textSecondary }]}>Consumed</Text>
            </View>
          </View>

          {/* Spent vs remaining grids */}
          <View style={styles.metricsGrid}>
            <View style={styles.metricItem}>
              <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Spent This Month</Text>
              <Text style={[styles.metricVal, { color: colors.text }]}>{formatINR(spent)}</Text>
            </View>

            <View style={styles.metricItem}>
              <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Remaining Cap</Text>
              <Text style={[styles.metricVal, { color: remaining > 0 ? colors.success : colors.error }]}>
                {formatINR(remaining)}
              </Text>
            </View>
          </View>
        </Card>

        {/* ANALYTICS SUMMARY CARD */}
        <Card style={styles.analyticsCard} elevation="light">
          <Text style={[styles.analyticsTitle, { color: colors.text }]}>Spending Insights</Text>
          
          <View style={styles.analyticsRow}>
            <View style={styles.analyticsCell}>
              <Text style={[styles.cellLabel, { color: colors.textSecondary }]}>Daily Average</Text>
              <Text style={[styles.cellVal, { color: colors.text }]}>{formatINR(dailyAverage)}</Text>
            </View>

            <View style={styles.analyticsCell}>
              <Text style={[styles.cellLabel, { color: colors.textSecondary }]}>Projected End of Month</Text>
              <Text style={[styles.cellVal, { color: colors.text }]}>{formatINR(projectedEom)}</Text>
            </View>
          </View>

          {projectedEom > limit && (
            <View style={[styles.alertBanner, { backgroundColor: '#fee2e2' }]}>
              <MaterialCommunityIcons name="alert-decagram" size={20} color={colors.error} style={{ marginRight: 6 }} />
              <Text style={[styles.alertBannerText, { color: colors.error }]}>
                Warning: Current spend velocity projects you will exceed this budget by {Math.round(((projectedEom - limit) / limit) * 100)}%!
              </Text>
            </View>
          )}
        </Card>

        {/* TRANSACTIONS UNDER BUDGET LIST */}
        <Text style={[styles.listTitle, { color: colors.text }]}>Associated Transactions</Text>

        {catExpenses.length === 0 ? (
          <View style={styles.emptyList}>
            <Text style={{ color: colors.textSecondary }}>No transactions mapped to this budget category.</Text>
          </View>
        ) : (
          <View style={styles.transactionsList}>
            {catExpenses.map(expense => (
              <ExpenseCard
                key={expense.id}
                expense={expense}
                onPress={() => navigation.navigate('Expenses', { screen: 'ExpenseDetail', params: { id: expense.id } })}
              />
            ))}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingTop: 16,
    paddingBottom: spacing.md,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.md + 2,
    fontWeight: typography.weights.bold,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: 48,
  },
  ringCard: {
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  catHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    alignSelf: 'flex-start',
    marginBottom: spacing.xl,
  },
  catCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  budgetNameText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.md + 1,
    fontWeight: typography.weights.bold,
  },
  periodText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
  },
  ringWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  ringOverlayText: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringPercentText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.xxxl,
    fontWeight: typography.weights.black,
  },
  ringLabelText: {
    fontFamily: typography.fontFamily,
    fontSize: 10,
    fontWeight: typography.weights.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  metricsGrid: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    borderTopWidth: 1.5,
    borderTopColor: '#f1f5f9',
    paddingTop: spacing.lg,
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricLabel: {
    fontFamily: typography.fontFamily,
    fontSize: 10,
    fontWeight: typography.weights.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  metricVal: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
  },
  analyticsCard: {
    padding: spacing.md + 2,
    marginBottom: spacing.xl,
  },
  analyticsTitle: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.sm + 1,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.md,
  },
  analyticsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  analyticsCell: {
    flex: 1,
  },
  cellLabel: {
    fontFamily: typography.fontFamily,
    fontSize: 10,
    fontWeight: typography.weights.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  cellVal: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.md - 1,
    fontWeight: typography.weights.bold,
  },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md - 2,
    borderRadius: spacing.borderRadius.md,
  },
  alertBannerText: {
    fontFamily: typography.fontFamily,
    fontSize: 10,
    fontWeight: typography.weights.bold,
    flex: 1,
  },
  listTitle: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.md + 1,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.md,
  },
  emptyList: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  transactionsList: {
    gap: spacing.xs,
  },
  errorWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
export default BudgetDetailScreen;
