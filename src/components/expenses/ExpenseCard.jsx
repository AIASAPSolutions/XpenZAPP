import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import useTheme from '../../hooks/useTheme';
import { typography } from '../../constants/typography';
import { getCategoryById } from '../../constants/categories';
import { formatINR } from '../../utils/currency';
import { formatDate, formatTime } from '../../utils/dateHelpers';
import BentoCard from '../common/BentoCard';

export const ExpenseCard = ({ expense, onPress, style }) => {
  const { colors } = useTheme();
  const cat = getCategoryById(expense.category);

  return (
    <TouchableOpacity activeOpacity={0.7} onPress={onPress}>
      <BentoCard style={[styles.card, style]}>
        <View style={styles.topRow}>
          <View style={[styles.catChip, { backgroundColor: `${cat.color}18` }]}>
            <MaterialCommunityIcons name={cat.icon} size={13} color={cat.color} style={{ marginRight: 4 }} />
            <Text style={[styles.catChipText, { color: cat.color }]} numberOfLines={1}>{cat.name}</Text>
          </View>
          <Text style={[styles.dateText, { color: colors.textSecondary }]}>
            {formatDate(expense.date, 'dd MMM')} • {formatTime(expense.date)}
          </Text>
        </View>

        <Text style={[styles.amount, { color: colors.text }]}>
          {formatINR(expense.amount)}
        </Text>

        <Text style={[styles.vendor, { color: colors.textSecondary }]} numberOfLines={1}>
          {expense.vendor}
        </Text>
      </BentoCard>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 14,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    maxWidth: '55%',
  },
  catChipText: {
    fontFamily: typography.fontFamily,
    fontSize: 10,
    fontWeight: typography.weights.bold,
  },
  dateText: {
    fontFamily: typography.fontFamily,
    fontSize: 11,
    fontWeight: typography.weights.medium,
  },
  amount: {
    fontFamily: typography.fontFamily,
    fontSize: 24,
    fontWeight: typography.weights.bold,
    marginBottom: 2,
  },
  vendor: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
  },
});
export default ExpenseCard;
