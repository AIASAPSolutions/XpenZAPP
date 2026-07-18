import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import useExpenses from '../../hooks/useExpenses';
import useTheme from '../../hooks/useTheme';
import { useUiStore } from '../../store/uiStore';
import { spacing } from '../../constants/spacing';
import { typography } from '../../constants/typography';
import { getCategoryById } from '../../constants/categories';
import { formatCurrency, convertFromINR, getCurrencySymbol } from '../../utils/currency';

// Custom elements
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Divider from '../../components/common/Divider';
import ScreenHeader from '../../components/common/ScreenHeader';
import SpendingTrendChart from '../../components/reports/SpendingTrendChart';
import CategoryDonutChart from '../../components/reports/CategoryDonutChart';
import * as reportsApi from '../../api/reports';
import * as exportApi from '../../api/export';

const PERIODS = ['Week', 'Month', 'Quarter', 'Year'];
const CURRENCIES = ['INR', 'USD', 'EUR', 'GBP'];

export const ReportsScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const { expenses, fetchExpenses } = useExpenses();
  const showToast = useUiStore((state) => state.showToast);

  const [activePeriod, setActivePeriod] = useState('Month');
  const [activeCurrency, setActiveCurrency] = useState('INR');
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    fetchExpenses();
    reportsApi.getAnalyticsOverview().then((res) => setSummary(res.data)).catch(() => {});
  }, [fetchExpenses]);

  // Format amount values according to active currency selections
  const renderVal = (valInINR) => {
    const converted = convertFromINR(valInINR, activeCurrency);
    return formatCurrency(converted, activeCurrency);
  };

  // Summary Metrics
  const totalSpent = summary?.totalSpent ?? expenses.reduce((sum, e) => sum + e.amount, 0);
  const avgPerDay = totalSpent / 29;
  const highestExpense = expenses.length > 0 ? Math.max(...expenses.map(e => e.amount)) : 0;
  const savingsPct = summary?.savingsChangePercent;

  // AI-generated Insights
  const INSIGHTS = [
    { type: 'tip', icon: 'lightbulb-on-outline', color: '#f59e0b', text: "You spent 34% more on Swiggy Food this month than average." },
    { type: 'success', icon: 'check-circle-outline', color: '#22c55e', text: "Outstanding! You are currently 15% under budget on Transport." },
    { type: 'warning', icon: 'alert-decagram-outline', color: '#ef4444', text: "AWS Utility hosting spike detected in Week 3." }
  ];

  const handleExport = async (format) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    showToast(`Exporting analytical payload as ${format.toUpperCase()}...`, 'success');
    try {
      await exportApi.exportData(format);
      showToast(`Export ready — ${format.toUpperCase()} download dispatched!`, 'success');
    } catch {
      showToast(`Failed to export ${format.toUpperCase()} report.`, 'error');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      
      <ScreenHeader
        navigation={navigation}
        title="Reports & Insights"
        subtitle={savingsPct != null ? `${savingsPct}% vs last month` : 'Analytical overview'}
        rightAction={(
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => handleExport('pdf')}
            style={[styles.exportBtn, { borderColor: colors.border, backgroundColor: colors.card }]}
          >
            <MaterialCommunityIcons name="file-pdf-box" size={24} color={colors.primary} />
          </TouchableOpacity>
        )}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* PERIOD SELECTOR CHIPS */}
        <View style={[styles.selectorWrapper, { backgroundColor: colors.primaryContainer }]}>
          {PERIODS.map(p => (
            <TouchableOpacity
              key={p}
              activeOpacity={0.8}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setActivePeriod(p);
              }}
              style={[
                styles.periodChip,
                activePeriod === p && { backgroundColor: colors.primary }
              ]}
            >
              <Text
                style={[
                  styles.periodText,
                  { color: activePeriod === p ? '#ffffff' : colors.onPrimaryContainer }
                ]}
              >
                {p}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* CURRENCY SELECTOR */}
        <View style={styles.currencyWrapper}>
          <Text style={[styles.currencyLabel, { color: colors.textSecondary }]}>Convert View Value:</Text>
          <View style={styles.currencyRow}>
            {CURRENCIES.map(c => (
              <TouchableOpacity
                key={c}
                activeOpacity={0.7}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setActiveCurrency(c);
                }}
                style={[
                  styles.currChip,
                  { borderColor: colors.border },
                  activeCurrency === c && { backgroundColor: colors.primaryContainer, borderColor: colors.primary }
                ]}
              >
                <Text style={[styles.currText, { color: colors.text }]}>{c}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* SUMMARY STATS GRID */}
        <View style={styles.statsGrid}>
          <Card style={styles.statCell} elevation="light">
            <Text style={[styles.cellLabel, { color: colors.textSecondary }]}>Total Volume</Text>
            <Text style={[styles.cellVal, { color: colors.text }]}>{renderVal(totalSpent)}</Text>
          </Card>

          <Card style={styles.statCell} elevation="light">
            <Text style={[styles.cellLabel, { color: colors.textSecondary }]}>Daily Average</Text>
            <Text style={[styles.cellVal, { color: colors.text }]}>{renderVal(avgPerDay)}</Text>
          </Card>

          <Card style={styles.statCell} elevation="light">
            <Text style={[styles.cellLabel, { color: colors.textSecondary }]}>Peak Expense</Text>
            <Text style={[styles.cellVal, { color: colors.text }]}>{renderVal(highestExpense)}</Text>
          </Card>
        </View>

        <Card style={styles.chartCard} elevation="medium">
          <Text style={[styles.chartTitle, { color: colors.text }]}>Spending Trends</Text>
          <SpendingTrendChart />
        </Card>

        <Card style={styles.chartCard} elevation="medium">
          <Text style={[styles.chartTitle, { color: colors.text }]}>Category Donut</Text>
          <CategoryDonutChart />
        </Card>

        {/* VISUAL SPENDING CATEGORY GRAPH (CUSTOM HIGH-FIDELITY SEGMENTS) */}
        <Card style={styles.chartCard} elevation="medium">
          <Text style={[styles.chartTitle, { color: colors.text }]}>Category Breakdowns</Text>
          
          <View style={styles.customChartWrapper}>
            {expenses.slice(0, 4).map((e, idx) => {
              const cat = getCategoryById(e.category);
              const ratio = totalSpent > 0 ? e.amount / totalSpent : 0;
              const percent = Math.round(ratio * 100);

              return (
                <View key={`ch-${idx}`} style={styles.chartProgressRow}>
                  <View style={styles.progressLabelRow}>
                    <View style={styles.progressIconName}>
                      <MaterialCommunityIcons name={cat.icon} size={18} color={cat.color} style={{ marginRight: 6 }} />
                      <Text style={[styles.progressCatName, { color: colors.text }]}>{cat.name}</Text>
                    </View>
                    <Text style={[styles.progressPercent, { color: colors.textSecondary }]}>
                      {percent}% ({renderVal(e.amount)})
                    </Text>
                  </View>
                  <View style={[styles.barBg, { backgroundColor: colors.border }]}>
                    <View style={[styles.barActive, { backgroundColor: cat.color, width: `${percent}%` }]} />
                  </View>
                </View>
              );
            })}
          </View>
        </Card>

        {/* AI INSIGHTS MODULE */}
        <View style={styles.insightsSection}>
          <Text style={[styles.insightsTitle, { color: colors.text }]}>XpenZ AI Insights ✨</Text>
          <View style={styles.insightsList}>
            {INSIGHTS.map((ins, idx) => (
              <Card key={`ins-${idx}`} style={[styles.insightCard, { borderColor: colors.border }]} elevation="light">
                <MaterialCommunityIcons name={ins.icon} size={22} color={ins.color} style={{ marginRight: spacing.md }} />
                <Text style={[styles.insightText, { color: colors.text }]}>{ins.text}</Text>
              </Card>
            ))}
          </View>
        </View>

        {/* TOP TRANSACTION LISTING (LIMIT 10) */}
        <Text style={[styles.listTitle, { color: colors.text }]}>Top Expenses Mapped</Text>
        <Card style={styles.topExpensesCard} elevation="light">
          {expenses.slice(0, 10).map((e, idx) => {
            const cat = getCategoryById(e.category);
            return (
              <View key={`top-${e.id}`}>
                <View style={styles.topExpRow}>
                  <View style={[styles.topIconCircle, { backgroundColor: `${cat.color}15` }]}>
                    <MaterialCommunityIcons name={cat.icon} size={18} color={cat.color} />
                  </View>
                  <View style={styles.topDetails}>
                    <Text style={[styles.topVendor, { color: colors.text }]} numberOfLines={1}>{e.vendor}</Text>
                    <Text style={[styles.topMeta, { color: colors.textSecondary }]}>{cat.name} • {new Date(e.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</Text>
                  </View>
                  <Text style={[styles.topAmount, { color: colors.text }]}>{renderVal(e.amount)}</Text>
                </View>
                {idx < expenses.slice(0, 10).length - 1 && <Divider style={{ marginVertical: spacing.xs }} />}
              </View>
            );
          })}
        </Card>

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
  exportBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: 84, // Space for Bottom Tab
  },
  selectorWrapper: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: spacing.borderRadius.md,
    marginBottom: spacing.md,
  },
  periodChip: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: spacing.borderRadius.md - 2,
  },
  periodText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.xs + 1,
    fontWeight: typography.weights.bold,
  },
  currencyWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  currencyLabel: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
  },
  currencyRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  currChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: spacing.borderRadius.sm,
    borderWidth: 1,
  },
  currText: {
    fontFamily: typography.fontFamily,
    fontSize: 10,
    fontWeight: typography.weights.bold,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  statCell: {
    flex: 1,
    padding: spacing.md - 2,
    alignItems: 'center',
  },
  cellLabel: {
    fontFamily: typography.fontFamily,
    fontSize: 9,
    fontWeight: typography.weights.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  cellVal: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.black,
  },
  chartCard: {
    padding: spacing.xl,
    marginBottom: spacing.xl,
  },
  chartTitle: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.lg,
  },
  customChartWrapper: {
    gap: spacing.md,
  },
  chartProgressRow: {
    width: '100%',
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  progressIconName: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressCatName: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.xs + 1,
    fontWeight: typography.weights.bold,
  },
  progressPercent: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
  },
  barBg: {
    height: 8,
    borderRadius: 4,
    width: '100%',
  },
  barActive: {
    height: '100%',
    borderRadius: 4,
  },
  insightsSection: {
    marginBottom: spacing.xl,
  },
  insightsTitle: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.md,
  },
  insightsList: {
    gap: spacing.sm,
  },
  insightCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderWidth: 1.2,
  },
  insightText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.xs + 1,
    fontWeight: typography.weights.medium,
    flex: 1,
    lineHeight: typography.lineHeights.xs + 2,
  },
  listTitle: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.md,
  },
  topExpensesCard: {
    padding: spacing.md,
  },
  topExpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  topIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  topDetails: {
    flex: 1,
    marginRight: spacing.xs,
  },
  topVendor: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    marginBottom: 2,
  },
  topMeta: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.xs - 1,
    fontWeight: typography.weights.medium,
  },
  topAmount: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
});
export default ReportsScreen;
