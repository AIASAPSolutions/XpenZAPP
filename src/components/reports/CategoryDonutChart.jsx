import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, Dimensions } from 'react-native';
import { PieChart } from 'react-native-chart-kit';

import useTheme from '../../hooks/useTheme';
import { spacing } from '../../constants/spacing';
import { typography } from '../../constants/typography';
import { getCategoryById } from '../../constants/categories';
import { formatINR } from '../../utils/currency';
import * as reportsApi from '../../api/reports';
import SkeletonLoader from '../common/SkeletonLoader';

const chartWidth = Dimensions.get('window').width - spacing.xl * 2 - spacing.md * 2;

const buildChartData = (breakdown) => {
  const entries = Object.entries(breakdown || {});
  if (!entries.length) {
    return [{ name: 'None', amount: 1, color: '#94a3b8', legendFontColor: '#64748b', legendFontSize: 11 }];
  }
  return entries.map(([categoryId, amount]) => {
    const cat = getCategoryById(categoryId);
    return {
      name: cat.name,
      amount,
      color: cat.color,
      legendFontColor: '#64748b',
      legendFontSize: 11,
    };
  });
};

export const CategoryDonutChart = () => {
  const { colors } = useTheme();
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
  const total = Object.values(breakdown || {}).reduce((s, v) => s + v, 0);

  return (
    <View>
      <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>
        Total mapped: {formatINR(total)}
      </Text>
      <PieChart
        data={chartData}
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
