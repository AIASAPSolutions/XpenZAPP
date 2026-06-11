import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import useTheme from '../../hooks/useTheme';
import { spacing } from '../../constants/spacing';
import { typography } from '../../constants/typography';
import { getCategoryById } from '../../constants/categories';
import { formatINR } from '../../utils/currency';
import { formatDate, formatTime } from '../../utils/dateHelpers';
import Card from '../common/Card';
import Badge from '../common/Badge';

export const ExpenseCard = ({ expense, onPress, style }) => {
  const { colors } = useTheme();
  const cat = getCategoryById(expense.category);

  return (
    <TouchableOpacity activeOpacity={0.7} onPress={onPress}>
      <Card style={[styles.card, style]} elevation="light">
        <View style={styles.leftRow}>
          {/* Circular icon colored by category */}
          <View style={[styles.iconWrapper, { backgroundColor: `${cat.color}15` }]}>
            <MaterialCommunityIcons name={cat.icon} size={24} color={cat.color} />
          </View>
          
          <View style={styles.details}>
            <Text style={[styles.vendor, { color: colors.text }]} numberOfLines={1}>
              {expense.vendor}
            </Text>
            <View style={styles.meta}>
              <Text style={[styles.categoryLabel, { color: colors.textSecondary }]}>
                {cat.name}
              </Text>
              {expense.project && (
                <>
                  <Text style={[styles.bullet, { color: colors.textSecondary }]}>•</Text>
                  <Badge
                    text="Project"
                    variant="accent"
                    style={styles.projectBadge}
                    textStyle={{ fontSize: 9 }}
                  />
                </>
              )}
            </View>
          </View>
        </View>

        {/* Right content containing amount and time */}
        <View style={styles.rightColumn}>
          <Text style={[styles.amount, { color: colors.text }]}>
            {formatINR(expense.amount)}
          </Text>
          <Text style={[styles.dateText, { color: colors.textSecondary }]}>
            {formatDate(expense.date, 'dd MMM')} • {formatTime(expense.date)}
          </Text>
        </View>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: spacing.sm,
  },
  iconWrapper: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  details: {
    flex: 1,
  },
  vendor: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    marginBottom: 2,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  categoryLabel: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.xs + 1,
    fontWeight: typography.weights.medium,
  },
  bullet: {
    marginHorizontal: spacing.xs,
    fontSize: 10,
  },
  projectBadge: {
    paddingVertical: 1,
    paddingHorizontal: spacing.xs,
  },
  rightColumn: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  amount: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    marginBottom: 4,
  },
  dateText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
  },
});
export default ExpenseCard;
