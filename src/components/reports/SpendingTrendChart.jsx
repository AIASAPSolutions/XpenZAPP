import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

import useTheme from '../../hooks/useTheme';
import { spacing } from '../../constants/spacing';
import { typography } from '../../constants/typography';
import * as reportsApi from '../../api/reports';
import { formatINR } from '../../utils/currency';
import SkeletonLoader from '../common/SkeletonLoader';

const chartWidth = Dimensions.get('window').width - spacing.xl * 2 - spacing.md * 2;

export const SpendingTrendChart = () => {
  const { colors, isDark } = useTheme();
  const [trends, setTrends] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await reportsApi.getReportsTrends();
        if (mounted) setTrends(res.data);
      } catch {
        if (mounted) {
          setTrends({
            labels: ['W1', 'W2', 'W3', 'W4'],
            data: [15000, 32000, 48000, 24000],
          });
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  if (loading) {
    return <SkeletonLoader height={220} style={styles.loader} />;
  }

  const labels = trends?.labels || [];
  const data = trends?.data || [];
  const peak = Math.max(...data, 1);

  return (
    <View>
      <Text style={[styles.caption, { color: colors.textSecondary }]}>
        Peak week: {formatINR(peak)}
      </Text>
      <LineChart
        data={{
          labels,
          datasets: [{ data: data.length ? data : [0] }],
        }}
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
