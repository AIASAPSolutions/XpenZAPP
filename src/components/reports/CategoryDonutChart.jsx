import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, Dimensions } from 'react-native';
import { PieChart } from 'react-native-chart-kit';

import useTheme from '../../hooks/useTheme';
import useExpenses from '../../hooks/useExpenses';
import { spacing } from '../../constants/spacing';
import { typography } from '../../constants/typography';
import { getCategoryById } from '../../constants/categories';
import { formatINR } from '../../utils/currency';
import * as reportsApi from '../../api/reports';
import SkeletonLoader from '../common/SkeletonLoader';

const chartWidth = Dimensions.get('window').width - spacing.xl * 2 - spacing.md * 2;

export const CHART_COLORS = [
  '#6C47FF', // purple - primary
  '#FF6B6B', // coral red
  '#4ECDC4', // teal
  '#FFD93D', // yellow
  '#96CEB4', // mint green
  '#FF6B9D', // pink
  '#45B7D1', // blue
  '#C3A6FF', // lavender
  '#FF8C42', // orange
];

const buildChartData = (breakdown) => {
  const entries = Object.entries(breakdown || {});
  if (!entries.length) {
    return [{ name: 'None', amount: 1, color: '#94a3b8', legendFontColor: '#64748b', legendFontSize: 11 }];
  }
  return entries.map(([categoryId, amount], index) => {
    const cat = getCategoryById(categoryId);
    return {
      name: cat.name,
      amount,
      color: CHART_COLORS[index % CHART_COLORS.length],
      legendFontColor: '#64748b',
      legendFontSize: 11,
    };
  });
};

export const CategoryDonutChart = () => {
  const { colors } = useTheme();
  const { expenses } = useExpenses();
  const [breakdown, setBreakdown] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await reportsApi.getReportsByCategory();
        if (mounted) setBreakdown(res.data);
      } catch {
        if (mounted) setBreakdown({});
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  if (loading) {
    return <SkeletonLoader height={220} style={styles.loader} />;
  }

  const chartData = buildChartData(breakdown);
  const coloredData = chartData.map((item, index) => ({
    ...item,
    color: CHART_COLORS[index % CHART_COLORS.length],
    legendFontColor: colors.text,
    legendFontSize: 12,
  }));

  const breakdownTotal = Object.values(breakdown || {}).reduce((s, v) => s + v, 0);
  const totalMapped = expenses?.reduce((sum, e) =>
    sum + (parseFloat(e.amount) || 0), 0
  ) || breakdownTotal || 0;

  return (
    <View>
      <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>
        Total mapped: {formatINR(totalMapped)}
      </Text>
      <PieChart
        data={coloredData}
        width={chartWidth}
        height={200}
        chartConfig={{
          color: () => colors.text,
          labelColor: () => colors.textSecondary,
        }}
        accessor="amount"
        backgroundColor="transparent"
        paddingLeft="12"
        center={[8, 0]}
        absolute
        hasLegend
      />
    </View>
  );
};

const styles = StyleSheet.create({
  loader: {
    marginVertical: spacing.md,
    borderRadius: spacing.borderRadius.lg,
  },
  totalLabel: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    marginBottom: spacing.sm,
  },
});

export default CategoryDonutChart;
