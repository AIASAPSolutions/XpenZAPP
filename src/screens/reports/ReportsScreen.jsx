import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import useExpenses from '../../hooks/useExpenses';
import useTheme from '../../hooks/useTheme';
import { useUiStore } from '../../store/uiStore';
import { spacing } from '../../constants/spacing';
import { typography } from '../../constants/typography';
import { bentoText } from '../../constants/bento';
import { getCategoryById } from '../../constants/categories';
import { formatCurrency, convertFromINR } from '../../utils/currency';

// Custom elements
import BentoCard from '../../components/common/BentoCard';
import BentoRow from '../../components/common/BentoRow';
import Divider from '../../components/common/Divider';
import ScreenHeader from '../../components/common/ScreenHeader';
import SpendingTrendChart from '../../components/reports/SpendingTrendChart';
import CategoryDonutChart from '../../components/reports/CategoryDonutChart';
import * as reportsApi from '../../api/reports';
import { downloadAndShareExport } from '../../utils/exportDownload';

const PERIODS = ['Week', 'Month', 'Quarter', 'Year'];
const CURRENCIES = ['INR', 'USD', 'EUR', 'GBP'];

export const ReportsScreen = ({ navigation }) => {
  const { colors, isDark } = useTheme();
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

  // Top category — computed from real expense data
  const categoryTotals = expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {});
  const topCategoryEntry = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];
  const topCategory = topCategoryEntry ? getCategoryById(topCategoryEntry[0]) : null;
  const topCategoryAmount = topCategoryEntry ? topCategoryEntry[1] : 0;

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
      await downloadAndShareExport(format);
      showToast(`Export ready — ${format.toUpperCase()} downloaded!`, 'success');
    } catch {
      showToast(`Failed to export ${format.toUpperCase()} report.`, 'error');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#0A0A0A' : '#F5F5F7' }]}>

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
            <MaterialCommunityIcons name="file-pdf-box" size={22} color={colors.primary} />
          </TouchableOpacity>
        )}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

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
                  { borderColor: colors.border, backgroundColor: colors.card },
                  activeCurrency === c && { backgroundColor: colors.primaryContainer, borderColor: colors.primary }
                ]}
              >
                <Text style={[styles.currText, { color: colors.text }]}>{c}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ROW 1: Total Spent | Top Category */}
        <BentoRow>
          <BentoCard size="half">
            <Text style={[bentoText.label, { color: colors.textSecondary }]}>Total Spent</Text>
            <Text style={[bentoText.value, { color: colors.text, marginTop: 6, fontSize: 22 }]} numberOfLines={1}>
              {renderVal(totalSpent)}
            </Text>
          </BentoCard>
          <BentoCard size="half">
            <Text style={[bentoText.label, { color: colors.textSecondary }]}>Top Category</Text>
            {topCategory ? (
              <>
                <View style={styles.topCatRow}>
                  <MaterialCommunityIcons name={topCategory.icon} size={18} color={topCategory.color} style={{ marginRight: 6 }} />
                  <Text style={[styles.topCatName, { color: colors.text }]} numberOfLines={1}>{topCategory.name}</Text>
                </View>
                <Text style={[bentoText.subtitle, { color: colors.textSecondary, marginTop: 4 }]} numberOfLines={1}>
                  {renderVal(topCategoryAmount)}
                </Text>
              </>
            ) : (
              <Text style={[bentoText.value, { color: colors.text, marginTop: 6, fontSize: 22 }]}>—</Text>
            )}
          </BentoCard>
        </BentoRow>

        {/* ROW 2: Category Donut */}
        <BentoCard size="full">
          <Text style={[bentoText.label, { color: colors.textSecondary, marginBottom: spacing.lg }]}>Category Breakdown</Text>
          <CategoryDonutChart />
        </BentoCard>

        {/* ROW 3: Spending Trend + time filter pills */}
        <BentoCard size="full">
          <View style={styles.cardHeaderRow}>
            <Text style={[bentoText.label, { color: colors.textSecondary }]}>Spending Trends</Text>
          </View>
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
          <SpendingTrendChart />
        </BentoCard>

        {/* ROW 4: Avg/day | Biggest expense */}
        <BentoRow>
          <BentoCard size="half">
            <Text style={[bentoText.label, { color: colors.textSecondary }]}>Daily Average</Text>
            <Text style={[bentoText.value, { color: colors.text, marginTop: 6, fontSize: 22 }]} numberOfLines={1}>
              {renderVal(avgPerDay)}
            </Text>
          </BentoCard>
          <BentoCard size="half">
            <Text style={[bentoText.label, { color: colors.textSecondary }]}>Biggest Expense</Text>
            <Text style={[bentoText.value, { color: colors.text, marginTop: 6, fontSize: 22 }]} numberOfLines={1}>
              {renderVal(highestExpense)}
            </Text>
          </BentoCard>
        </BentoRow>

        {/* AI INSIGHTS MODULE */}
        <View style={styles.cardHeaderRow}>
          <Text style={[bentoText.label, { color: colors.textSecondary }]}>XpenZ AI Insights ✨</Text>
        </View>
        <View style={styles.insightsList}>
          {INSIGHTS.map((ins, idx) => (
            <BentoCard key={`ins-${idx}`} style={styles.insightCard}>
              <MaterialCommunityIcons name={ins.icon} size={20} color={ins.color} style={{ marginRight: spacing.md }} />
              <Text style={[styles.insightText, { color: colors.text }]}>{ins.text}</Text>
            </BentoCard>
          ))}
        </View>

        {/* TOP TRANSACTION LISTING (LIMIT 10) */}
        <View style={styles.cardHeaderRow}>
          <Text style={[bentoText.label, { color: colors.textSecondary }]}>Top Expenses Mapped</Text>
        </View>
        <BentoCard size="full" style={styles.topExpensesCard}>
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
        </BentoCard>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  exportBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: spacing.md,
    paddingBottom: 84, // Space for Bottom Tab
  },
  cardHeaderRow: {
    marginBottom: spacing.md,
  },
  currencyWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
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
  topCatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  topCatName: {
    fontFamily: typography.fontFamily,
    fontSize: 18,
    fontWeight: typography.weights.bold,
    flexShrink: 1,
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
  insightsList: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  insightCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  insightText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.xs + 1,
    fontWeight: typography.weights.medium,
    flex: 1,
    lineHeight: typography.lineHeights.xs + 2,
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
