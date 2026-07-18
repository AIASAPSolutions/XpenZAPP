import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ProgressBar } from 'react-native-paper';
import * as Haptics from 'expo-haptics';

import useExpenses from '../../hooks/useExpenses';
import useTheme from '../../hooks/useTheme';
import { spacing } from '../../constants/spacing';
import { typography } from '../../constants/typography';
import { formatINR } from '../../utils/currency';

// Custom elements
import Card from '../../components/common/Card';
import ExpenseCard from '../../components/expenses/ExpenseCard';
import Button from '../../components/common/Button';

export const ProjectDetailScreen = ({ route, navigation }) => {
  const { id } = route.params;
  const { colors } = useTheme();
  const { expenses, projects } = useExpenses();

  const project = projects.find(p => p.id === id);

  if (!project) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.errorWrapper}>
          <Text style={{ color: colors.text }}>Project Workspace not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Filter expenses belonging to this project
  const projectExpenses = expenses.filter(e => e.project === project.id);
  const spent = projectExpenses.reduce((sum, e) => sum + e.amount, 0);
  const limit = project.budget || 150000;
  const ratio = Math.min(1.0, spent / limit);

  const handleAddExpenseToProject = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('Expenses', {
      screen: 'AddExpense',
      params: { prefillData: { project: project.id } }
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header controls bar */}
      <View style={styles.header}>
        <TouchableOpacity activeOpacity={0.7} onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Project Detail</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* PROJECT SCOPE CARD */}
        <Card style={styles.detailsCard} elevation="heavy">
          <View style={styles.headerRow}>
            <View style={[styles.dot, { backgroundColor: project.color || colors.primary }]} />
            <Text style={[styles.projNameText, { color: colors.text }]}>{project.name}</Text>
          </View>
          <Text style={[styles.projDescText, { color: colors.textSecondary }]}>
            Finance workspace mapping spending limits and team records for corporate client targets.
          </Text>

          <Divider style={{ marginVertical: spacing.lg }} />

          {/* Budget Progress Meter */}
          <View style={styles.spentMeta}>
            <View>
              <Text style={[styles.metaTitle, { color: colors.textSecondary }]}>Spends Allocated</Text>
              <Text style={[styles.metaVal, { color: colors.text }]}>{formatINR(spent)}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={[styles.metaTitle, { color: colors.textSecondary }]}>Target Budget</Text>
              <Text style={[styles.metaVal, { color: colors.textSecondary }]}>{formatINR(limit)}</Text>
            </View>
          </View>

          <ProgressBar
            progress={ratio}
            color={ratio > 0.8 ? colors.error : ratio > 0.6 ? colors.warning : colors.success}
            style={styles.progressBar}
          />
          <Text style={[styles.percentLabel, { color: colors.textSecondary }]}>
            {Math.round(ratio * 100)}% consumed of overall project ceilings
          </Text>
        </Card>

        {/* Add Shortcut trigger */}
        <Button
          title="Add Expense to Project"
          onPress={handleAddExpenseToProject}
          variant="primary"
          icon={<MaterialCommunityIcons name="plus" size={20} color="#ffffff" />}
          style={styles.actionBtn}
        />

        {/* LIST OF FILTERED EXPENSES */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Transactions under Project</Text>

        {projectExpenses.length === 0 ? (
          <View style={styles.emptyList}>
            <Text style={{ color: colors.textSecondary }}>No transactions logged under this project.</Text>
          </View>
        ) : (
          <View style={styles.listContainer}>
            {projectExpenses.map(expense => (
              <ExpenseCard
                key={expense.id}
                expense={expense}
                onPress={() => navigation.navigate('Expenses', { screen: 'ExpenseDetail', params: { id: expense.id } })}
              />
            ))}
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
  detailsCard: {
    padding: spacing.xl,
    marginBottom: spacing.xl,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: spacing.sm,
  },
  projNameText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
  },
  projDescText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.sm,
    lineHeight: typography.lineHeights.sm,
  },
  spentMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  metaTitle: {
    fontFamily: typography.fontFamily,
    fontSize: 9,
    fontWeight: typography.weights.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  metaVal: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    marginBottom: spacing.xs,
  },
  percentLabel: {
    fontFamily: typography.fontFamily,
    fontSize: 10,
    fontWeight: typography.weights.semibold,
  },
  actionBtn: {
    width: '100%',
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.md,
  },
  emptyList: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  listContainer: {
    gap: spacing.xs,
  },
  errorWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
export default ProjectDetailScreen;
