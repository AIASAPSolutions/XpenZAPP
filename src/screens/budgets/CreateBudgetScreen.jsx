import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet, Platform, KeyboardAvoidingView } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { budgetSchema } from '../../utils/validators';
import useBudgets from '../../hooks/useBudgets';
import useTheme from '../../hooks/useTheme';
import { useUiStore } from '../../store/uiStore';
import { spacing } from '../../constants/spacing';
import { typography } from '../../constants/typography';
import { categories } from '../../constants/categories';

// Custom elements
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

export const CreateBudgetScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const { createBudget } = useBudgets();
  const showToast = useUiStore((state) => state.showToast);

  const { control, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      name: '',
      category: '',
      amount: '',
      period: 'Monthly',
      alertThreshold: 80,
    }
  });

  const selectedCat = watch('category');
  const selectedPeriod = watch('period');
  const activeThreshold = watch('alertThreshold');

  const handleCategoryPress = (catId) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setValue('category', catId);
    
    // Auto-fill budget name based on category
    const cat = categories.find(c => c.id === catId);
    if (cat) {
      setValue('name', `${cat.name} Budget`);
    }
  };

  const handlePeriodPress = (period) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setValue('period', period);
  };

  const handleThresholdPress = (val) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setValue('alertThreshold', val);
  };

  const onSubmit = async (data) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const res = await createBudget(data);
    if (res.success) {
      showToast("Budget limit configured!", "success");
      navigation.goBack();
    } else {
      showToast(res.error, "error");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {/* Header controls bar */}
      <View style={styles.header}>
        <TouchableOpacity activeOpacity={0.7} onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialCommunityIcons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Configure Budget</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Large Numeric Amount field */}
        <View style={styles.amountContainer}>
          <Text style={[styles.amountLabel, { color: colors.textSecondary }]}>Budget Ceiling</Text>
          <View style={styles.amountRow}>
            <Text style={[styles.currencyPrefix, { color: colors.text }]}>₹</Text>
            <Controller
              control={control}
              name="amount"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  value={value ? String(value) : ''}
                  onChangeText={onChange}
                  placeholder="0.00"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="numeric"
                  style={[styles.amountInput, { color: colors.text }]}
                />
              )}
            />
          </View>
          {errors.amount && <Text style={[styles.errorText, { color: colors.error }]}>{errors.amount.message}</Text>}
        </View>

        {/* Category selector grid */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Category Scope</Text>
          <View style={styles.categoryGrid}>
            {categories.slice(0, -1).map((c) => {
              const isSelected = selectedCat === c.id;
              return (
                <TouchableOpacity
                  key={c.id}
                  activeOpacity={0.8}
                  onPress={() => handleCategoryPress(c.id)}
                  style={[
                    styles.catChip,
                    { borderColor: colors.border },
                    isSelected && { backgroundColor: `${c.color}15`, borderColor: c.color }
                  ]}
                >
                  <MaterialCommunityIcons name={c.icon} size={20} color={isSelected ? c.color : colors.textSecondary} />
                  <Text style={[styles.catChipLabel, { color: isSelected ? colors.text : colors.textSecondary }]}>
                    {c.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          {errors.category && <Text style={[styles.errorText, { color: colors.error }]}>{errors.category.message}</Text>}
        </View>

        {/* Budget name input */}
        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Budget Title"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="e.g., Food & Dining Budget"
              icon="tag-outline"
              error={errors.name?.message}
            />
          )}
        />

        {/* Period Selector row */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Budget Period</Text>
          <View style={styles.periodRow}>
            {['Weekly', 'Monthly', 'Custom'].map((p) => {
              const isSelected = selectedPeriod === p;
              return (
                <TouchableOpacity
                  key={p}
                  activeOpacity={0.8}
                  onPress={() => handlePeriodPress(p)}
                  style={[
                    styles.periodChip,
                    { borderColor: colors.border },
                    isSelected && { backgroundColor: colors.primaryContainer, borderColor: colors.primary }
                  ]}
                >
                  <Text style={[styles.periodText, { color: colors.text }]}>{p}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Dynamic Custom Threshold selector */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Alert Notification Threshold</Text>
          <Text style={[styles.sectionDesc, { color: colors.textSecondary }]}>
            Warn when expenditure consumes a set ratio of limits:
          </Text>
          
          <View style={styles.thresholdRow}>
            {[50, 75, 90].map((t) => {
              const isSelected = activeThreshold === t;
              return (
                <TouchableOpacity
                  key={t}
                  activeOpacity={0.85}
                  onPress={() => handleThresholdPress(t)}
                  style={[
                    styles.thresholdBtn,
                    { borderColor: colors.border },
                    isSelected && { backgroundColor: colors.primary, borderColor: colors.primary }
                  ]}
                >
                  <Text style={[styles.thresholdText, { color: isSelected ? '#ffffff' : colors.text }]}>
                    {t}% used
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Save button */}
        <Button
          title="Save Budget"
          onPress={handleSubmit(onSubmit)}
          variant="primary"
          style={styles.saveBtn}
        />

      </ScrollView>
    </KeyboardAvoidingView>
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
  amountContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  amountLabel: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    marginBottom: spacing.xs,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  currencyPrefix: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.xxxl,
    fontWeight: typography.weights.black,
    marginRight: spacing.xs,
  },
  amountInput: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.xxxl,
    fontWeight: typography.weights.black,
    minWidth: 120,
    textAlign: 'center',
    padding: 0,
  },
  errorText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    marginTop: spacing.xs,
  },
  sectionContainer: {
    width: '100%',
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    marginBottom: spacing.sm,
  },
  sectionDesc: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.xs + 1,
    marginBottom: spacing.md,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: spacing.borderRadius.md,
    borderWidth: 1.5,
  },
  catChipLabel: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.xs + 1,
    fontWeight: typography.weights.bold,
    marginLeft: 4,
  },
  periodRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  periodChip: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md - 2,
    borderWidth: 1.5,
    borderRadius: spacing.borderRadius.md,
  },
  periodText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.xs + 1,
    fontWeight: typography.weights.bold,
  },
  thresholdRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  thresholdBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderWidth: 1.5,
    borderRadius: spacing.borderRadius.md,
  },
  thresholdText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.xs + 1,
    fontWeight: typography.weights.bold,
  },
  saveBtn: {
    width: '100%',
    marginTop: spacing.md,
  },
});
export default CreateBudgetScreen;

