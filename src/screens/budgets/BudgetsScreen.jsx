import React, { useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ProgressBar } from 'react-native-paper';
import * as Haptics from 'expo-haptics';

import useBudgets from '../../hooks/useBudgets';
import useExpenses from '../../hooks/useExpenses';
import useTheme from '../../hooks/useTheme';
import { useUiStore } from '../../store/uiStore';
import { spacing } from '../../constants/spacing';
import { typography } from '../../constants/typography';
import { getCategoryById } from '../../constants/categories';
import { formatINR } from '../../utils/currency';

// Custom elements
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';

export const BudgetsScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const { budgets, fetchBudgets, deleteBudget } = useBudgets();
  const { expenses, fetchExpenses } = useExpenses();
  const showToast = useUiStore((state) => state.showToast);

  useEffect(() => {
    fetchBudgets();
    fetchExpenses();
  }, []);

  // Compute Overall Budget Metrics
  const totalBudgetLimit = budgets.reduce((sum, b) => sum + b.amount, 0);
  const totalSpentThisMonth = expenses.reduce((sum, e) => {
    // Check if expense is in current month
    const d = new Date(e.date);
    const now = new Date();
    if (d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) {
      return sum + e.amount;
    }
    return sum;
  }, 0);

  const overallRatio = totalBudgetLimit > 0 ? totalSpentThisMonth / totalBudgetLimit : 0;

  const handleDelete = (id, name) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert(
      "Remove Budget",
      `Are you sure you want to remove the budget limit for "${name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const res = await deleteBudget(id);
            if (res.success) {
              showToast("Budget limit deleted.", "success");
            } else {
              showToast(res.error, "error");
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* HEADER ROW */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: colors.text }]}>Budgets</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {new Date().toLocaleString('en-IN', { month: 'long', year: 'numeric' })}
          </Text>
        </View>

        <Button
          title="+ New"
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            navigation.navigate('CreateBudget');
          }}
          variant="secondary"
          style={styles.headerBtn}
          textStyle={{ fontSize: 13 }}
        />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* OVERALL BUDGET SUMMARY PROGRESS PANEL */}
        {budgets.length > 0 && (
          <Card style={styles.summaryCard} elevation="heavy">
            <Text style={[styles.summaryTitle, { color: colors.textSecondary }]}>Overall Monthly Budget</Text>
            <View style={styles.amountProgressRow}>
              <Text style={[styles.spentAmount, { color: colors.text }]}>
                {formatINR(totalSpentThisMonth)}
              </Text>
              <Text style={[styles.totalAmount, { color: colors.textSecondary }]}>
                spent of {formatINR(totalBudgetLimit)}
              </Text>
            </View>
            <ProgressBar
              progress={Math.min(1.0, overallRatio)}
              color={overallRatio > 0.8 ? colors.error : overallRatio > 0.6 ? colors.warning : colors.success}
              style={styles.summaryBar}
            />
            <View style={styles.summaryFooter}>
              <Text style={[styles.percentText, { color: colors.text }]}>
                {Math.round(overallRatio * 100)}% consumed
              </Text>
              <Text style={[styles.remainingText, { color: colors.textSecondary }]}>
                {formatINR(Math.max(0, totalBudgetLimit - totalSpentThisMonth))} remaining
              </Text>
            </View>
          </Card>
        )}

        {/* SPECIFIC BUDGET LIST SECTION */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Category Budgets</Text>

        {budgets.length === 0 ? (
          <EmptyState
            icon="wallet"
            title="No Category Budgets Set"
            description="Control category expenditures by setting alert thresholds!"
            actionTitle="+ New Budget"
            onActionPress={() => navigation.navigate('CreateBudget')}
          />
        ) : (
          <View style={styles.budgetsList}>
            {budgets.map((bud) => {
              const cat = getCategoryById(bud.category);
              
              // Sum category expenses
              const catExpenses = expenses.filter(e => e.category === bud.category);
              const spent = catExpenses.reduce((sum, e) => sum + e.amount, 0);
              const ratio = Math.min(1.0, spent / bud.amount);
              const remainingPercent = Math.max(0, 100 - Math.round((spent / bud.amount) * 100));

              return (
                <TouchableOpacity
                  key={bud.id}
                  activeOpacity={0.8}
                  onPress={() => navigation.navigate('BudgetDetail', { id: bud.id })}
                >
                  <Card style={styles.budgetCard} elevation="light">
                    {/* Header info */}
                    <View style={styles.budgetHeader}>
                      <View style={styles.catWrapper}>
                        <View style={[styles.catIconCircle, { backgroundColor: `${cat.color}15` }]}>
                          <MaterialCommunityIcons name={cat.icon} size={20} color={cat.color} />
                        </View>
                        <View>
                          <Text style={[styles.budgetName, { color: colors.text }]}>{bud.name}</Text>
                          <Text style={[styles.remainingLabel, { color: colors.textSecondary }]}>
                            {remainingPercent}% remaining
                          </Text>
                        </View>
                      </View>

                      {/* Right values */}
                      <View style={styles.valueWrapper}>
                        <Text style={[styles.amountLabelVal, { color: colors.text }]}>
                          {formatINR(spent)}
                        </Text>
                        <Text style={[styles.limitLabelVal, { color: colors.textSecondary }]}>
                          of {formatINR(bud.amount)}
                        </Text>
                      </View>
                    </View>

                    {/* Progress Bar */}
                    <ProgressBar
                      progress={ratio}
                      color={ratio > 0.8 ? colors.error : ratio > 0.6 ? colors.warning : colors.success}
                      style={styles.cardProgress}
                    />

                    {/* Warnings & delete footer */}
                    <View style={styles.cardFooter}>
                      {ratio >= 0.8 ? (
                        <View style={styles.alertRow}>
                          <MaterialCommunityIcons name="alert-outline" size={16} color={colors.error} />
                          <Text style={[styles.alertText, { color: colors.error }]}>
                            {ratio >= 1.0 ? '🚫 Over Budget!' : '⚠ Nearing limit! (>80%)'}
                          </Text>
                        </View>
                      ) : (
                        <View style={styles.alertRow}>
                          <MaterialCommunityIcons name="check-circle-outline" size={16} color={colors.success} />
                          <Text style={[styles.safeText, { color: colors.success }]}>Within Safe Constraints</Text>
                        </View>
                      )}

                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => handleDelete(bud.id, bud.name)}
                        style={styles.deleteBtn}
                      >
                        <MaterialCommunityIcons name="trash-can-outline" size={18} color={colors.textSecondary} />
                      </TouchableOpacity>
                    </View>
                  </Card>
                </TouchableOpacity>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingTop: 16,
    paddingBottom: spacing.md,
  },
  title: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.xxl - 2,
    fontWeight: typography.weights.bold,
  },
  subtitle: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    marginTop: 2,
  },
  headerBtn: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: spacing.borderRadius.round,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: 84, // Space for Bottom Tab
  },
  summaryCard: {
    padding: spacing.xl,
    marginBottom: spacing.xl,
  },
  summaryTitle: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.xs + 1,
    fontWeight: typography.weights.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  amountProgressRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  spentAmount: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.black,
  },
  totalAmount: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
  },
  summaryBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: spacing.md,
  },
  summaryFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  percentText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.xs + 1,
    fontWeight: typography.weights.bold,
  },
  remainingText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.xs + 1,
    fontWeight: typography.weights.medium,
  },
  sectionTitle: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.md,
  },
  budgetsList: {
    gap: spacing.md,
  },
  budgetCard: {
    padding: spacing.md + 2,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  catWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  catIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  budgetName: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.sm + 1,
    fontWeight: typography.weights.bold,
    marginBottom: 2,
  },
  remainingLabel: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
  },
  valueWrapper: {
    alignItems: 'flex-end',
  },
  amountLabelVal: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.sm + 1,
    fontWeight: typography.weights.bold,
    marginBottom: 2,
  },
  limitLabelVal: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
  },
  cardProgress: {
    height: 6,
    borderRadius: 3,
    marginBottom: spacing.md,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  alertRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  alertText: {
    fontFamily: typography.fontFamily,
    fontSize: 11,
    fontWeight: typography.weights.bold,
  },
  safeText: {
    fontFamily: typography.fontFamily,
    fontSize: 11,
    fontWeight: typography.weights.bold,
  },
  deleteBtn: {
    padding: spacing.xs,
  },
});
export default BudgetsScreen;
