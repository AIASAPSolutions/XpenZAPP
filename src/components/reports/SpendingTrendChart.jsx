import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

import useTheme from '../../hooks/useTheme';
import { spacing } from '../../constants/spacing';
import { typography } from '../../constants/typography';
import * as reportsApi from '../../api/reports';
import { formatINR } from '../../utils/currency';
import SkeletonLoader from '../common/SkeletonLoader';
import { useExpenseStore } from '../../store/expenseStore';

const chartWidth = Dimensions.get('window').width - spacing.xl * 2 - spacing.md * 2;

// Handles the several trend payload shapes different backend deployments send.
const normalizeTrendData = (raw) => {
  if (!raw) return { labels: ['No data'], datasets: [{ data: [0] }] };

  // Already in chart format
  if (raw.labels && raw.datasets) return raw;

  // {labels: [...], data: [...]}
  if (raw.labels && raw.data) {
    return { labels: raw.labels, datasets: [{ data: raw.data.map(v => parseFloat(v) || 0) }] };
  }

  // Array of {date, amount}
  if (Array.isArray(raw) && raw[0]?.date) {
    return {
      labels: raw.map(d => d.date?.slice(5) || ''),
      datasets: [{ data: raw.map(d => parseFloat(d.amount || d.total || d.spent || 0)) }]
    };
  }

  // Array of {period, spent}
  if (Array.isArray(raw) && raw[0]?.period) {
    return {
      labels: raw.map(d => d.period?.slice(5) || ''),
      datasets: [{ data: raw.map(d => parseFloat(d.spent || d.amount || 0)) }]
    };
  }

  // {daily: [...]}
  if (raw.daily) {
    return {
      labels: raw.daily.map(d => d.day?.slice(5) || ''),
      datasets: [{ data: raw.daily.map(d => parseFloat(d.total || 0)) }]
    };
  }

  // {trends: [...]}
  if (raw.trends) {
    return normalizeTrendData(raw.trends);
  }

  // Fallback
  return { labels: ['No data'], datasets: [{ data: [0] }] };
};

const buildChartFromExpenses = (expenses) => {
  if (!expenses?.length) return { labels: ['No data'], datasets: [{ data: [0] }] };

  const last7 = {};
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(5, 10);
    last7[key] = 0;
  }

  expenses.forEach(e => {
    const key = (e.date || e.created_at || '').toString().slice(5, 10);
    if (last7[key] !== undefined) {
      last7[key] += parseFloat(e.amount) || 0;
    }
  });

  return {
    labels: Object.keys(last7),
    datasets: [{ data: Object.values(last7) }],
  };
};

export const SpendingTrendChart = () => {
  const { colors, isDark } = useTheme();
  const [trends, setTrends] = useState(null);
  const [loading, setLoading] = useState(true);
  const expenses = useExpenseStore(s => s.expenses);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await reportsApi.getAnalyticsTrends(7);
        if (mounted) setTrends(res.data);
      } catch {
        if (mounted) setTrends(null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  if (loading) {
    return <SkeletonLoader height={220} style={styles.loader} />;
  }

  const chartData = normalizeTrendData(trends);
  const finalChartData = chartData?.datasets?.[0]?.data?.some(v => v > 0)
    ? chartData
    : buildChartFromExpenses(expenses);

  const peak = Math.max(...finalChartData.datasets[0].data, 1);

  return (
    <View>
      <Text style={[styles.caption, { color: colors.textSecondary }]}>
        Peak week: {formatINR(peak)}
      </Text>
      <LineChart
        data={finalChartData}
        width={chartWidth}
        height={200}
        yAxisLabel="₹"
        yAxisSuffix=""
        chartConfig={{
          backgroundColor: colors.card,
          backgroundGradientFrom: colors.card,
          backgroundGradientTo: colors.card,
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
          labelColor: () => colors.textSecondary,
          propsForDots: {
            r: '5',
            strokeWidth: '2',
            stroke: colors.primary,
          },
          propsForBackgroundLines: {
            stroke: colors.border,
          },
        }}
        bezier
        style={[styles.chart, { backgroundColor: colors.card }]}
        withInnerLines={!isDark}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  loader: {
    marginVertical: spacing.md,
    borderRadius: spacing.borderRadius.lg,
  },
  caption: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    marginBottom: spacing.sm,
  },
  chart: {
    borderRadius: spacing.borderRadius.lg,
    marginVertical: spacing.xs,
  },
});

export default SpendingTrendChart;
