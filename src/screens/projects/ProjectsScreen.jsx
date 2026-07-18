import React, { useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ProgressBar } from 'react-native-paper';
import * as Haptics from 'expo-haptics';

import useExpenses from '../../hooks/useExpenses';
import useTheme from '../../hooks/useTheme';
import { useUiStore } from '../../store/uiStore';
import { spacing } from '../../constants/spacing';
import { typography } from '../../constants/typography';
import { formatINR } from '../../utils/currency';

// Custom elements
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import { SkeletonCardList } from '../../components/common/SkeletonLoader';
import { openAppDrawer } from '../../utils/navigation';

export const ProjectsScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const { projects, loading, fetchProjects, createProject } = useExpenses();
  const showToast = useUiStore((state) => state.showToast);

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateProject = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.prompt(
      "Configure New Project Workspace",
      "Enter a name for your business project workspace:",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Create",
          onPress: async (name) => {
            if (!name?.trim()) return;
            const res = await createProject(name.trim(), 120000);
            if (res.success) {
              showToast(`Project workspace "${name}" initialized!`, "success");
            } else {
              showToast(res.error, "error");
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      
      {/* HEADER SECTION */}
      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => openAppDrawer(navigation)}
          style={styles.menuBtn}
        >
          <MaterialCommunityIcons name="menu" size={26} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Projects Workspace</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Top welcome banner */}
        <View style={styles.introBlock}>
          <Text style={[styles.titleText, { color: colors.text }]}>Corporate Workspaces</Text>
          <Text style={[styles.descText, { color: colors.textSecondary }]}>
            Monitor expenditure and assign dedicated budgets to specific business projects.
          </Text>
        </View>

        {/* Action create button */}
        <Button
          title="Initialize New Project"
          onPress={handleCreateProject}
          variant="outline"
          icon={<MaterialCommunityIcons name="folder-plus-outline" size={20} color={colors.primary} />}
          style={styles.createBtn}
        />

        {/* LIST OF PROJECT CARDS */}
        {loading && projects.length === 0 ? (
          <SkeletonCardList count={3} />
        ) : projects.length === 0 ? (
          <EmptyState
            icon="folder-open-outline"
            title="No Projects Yet"
            description="Create your first project workspace to start tracking expenses."
            actionTitle="+ New Project"
            onActionPress={handleCreateProject}
          />
        ) : (
        <View style={styles.projectList}>
          {projects.map((proj) => {
            const ratio = proj.budget > 0 ? proj.totalSpent / proj.budget : 0;
            const percentUsed = Math.round(ratio * 100);

            return (
              <TouchableOpacity
                key={proj.id}
                activeOpacity={0.8}
                onPress={() => navigation.navigate('ProjectDetail', { id: proj.id })}
              >
                <Card style={styles.projCard} elevation="light">
                  <View style={styles.projHeader}>
                    <View style={styles.nameRow}>
                      <View style={[styles.dot, { backgroundColor: proj.color || colors.primary }]} />
                      <Text style={[styles.projName, { color: colors.text }]}>{proj.name}</Text>
                    </View>
                    <Badge text={`${proj.expenseCount} logs`} variant="primary" />
                  </View>

                  <View style={styles.spentRow}>
                    <View>
                      <Text style={[styles.spentTitle, { color: colors.textSecondary }]}>Total Spent</Text>
                      <Text style={[styles.spentAmount, { color: colors.text }]}>
                        {formatINR(proj.totalSpent)}
                      </Text>
                    </View>
                    
                    {proj.budget > 0 && (
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={[styles.spentTitle, { color: colors.textSecondary }]}>Project Budget</Text>
                        <Text style={[styles.spentAmount, { color: colors.textSecondary }]}>
                          {formatINR(proj.budget)}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Progress Meter */}
                  {proj.budget > 0 && (
                    <View style={styles.progressSection}>
                      <ProgressBar
                        progress={Math.min(1.0, ratio)}
                        color={ratio > 0.8 ? colors.error : ratio > 0.6 ? colors.warning : colors.success}
                        style={styles.progressBar}
                      />
                      <Text style={[styles.progressText, { color: colors.textSecondary }]}>
                        {percentUsed}% consumed
                      </Text>
                    </View>
                  )}

                </Card>
              </TouchableOpacity>
            );
          })}
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
  menuBtn: {
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
  introBlock: {
    marginBottom: spacing.lg,
  },
  titleText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.xs,
  },
  descText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.sm,
    lineHeight: typography.lineHeights.sm,
  },
  createBtn: {
    width: '100%',
    marginBottom: spacing.xl,
  },
  projectList: {
    gap: spacing.md,
  },
  projCard: {
    padding: spacing.md + 2,
  },
  projHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: spacing.sm,
  },
  projName: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.sm + 1,
    fontWeight: typography.weights.bold,
  },
  spentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  spentTitle: {
    fontFamily: typography.fontFamily,
    fontSize: 9,
    fontWeight: typography.weights.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  spentAmount: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
  },
  progressSection: {
    marginBottom: spacing.md,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    marginBottom: 4,
  },
  progressText: {
    fontFamily: typography.fontFamily,
    fontSize: 10,
    fontWeight: typography.weights.semibold,
  },
});
export default ProjectsScreen;
