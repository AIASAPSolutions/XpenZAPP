import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Modal, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ProgressBar } from 'react-native-paper';
import * as Haptics from 'expo-haptics';

import useExpenses from '../../hooks/useExpenses';
import useTheme from '../../hooks/useTheme';
import { useUiStore } from '../../store/uiStore';
import { spacing } from '../../constants/spacing';
import { typography } from '../../constants/typography';
import { bentoText } from '../../constants/bento';
import { formatINR } from '../../utils/currency';

// Custom elements
import BentoCard from '../../components/common/BentoCard';
import BentoRow from '../../components/common/BentoRow';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import { SkeletonCardList } from '../../components/common/SkeletonLoader';
import { openAppDrawer } from '../../utils/navigation';

export const ProjectsScreen = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const { projects, loading, fetchProjects, createProject } = useExpenses();
  const showToast = useUiStore((state) => state.showToast);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectBudget, setNewProjectBudget] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const openCreateModal = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowCreateModal(true);
  };

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) {
      showToast('Project name is required', 'error');
      return;
    }
    setCreating(true);
    try {
      await createProject({
        name: newProjectName.trim(),
        budget: newProjectBudget ? parseFloat(newProjectBudget) : null,
        description: newProjectDesc.trim() || null,
      });
      setShowCreateModal(false);
      setNewProjectName('');
      setNewProjectBudget('');
      setNewProjectDesc('');
      showToast('Project created!', 'success');
      fetchProjects();
    } catch (e) {
      showToast(e?.response?.data?.detail || 'Failed to create project', 'error');
    } finally {
      setCreating(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#0A0A0A' : '#F5F5F7' }]}>

      {/* HEADER SECTION */}
      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => openAppDrawer(navigation)}
          style={[styles.menuBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <MaterialCommunityIcons name="menu" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Projects Workspace</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* ROW 1: Large "New Project" card */}
        <TouchableOpacity activeOpacity={0.85} onPress={openCreateModal}>
          <BentoCard size="full" accent style={styles.newProjectCard}>
            <View style={styles.newProjectRow}>
              <View>
                <Text style={[bentoText.label, { color: 'rgba(255,255,255,0.75)' }]}>Corporate Workspaces</Text>
                <Text style={[styles.newProjectTitle, { color: '#ffffff' }]}>Initialize New Project</Text>
                <Text style={[bentoText.subtitle, { color: 'rgba(255,255,255,0.85)', marginTop: 4 }]}>
                  Track expenditure with dedicated budgets
                </Text>
              </View>
              <View style={styles.plusCircle}>
                <MaterialCommunityIcons name="plus" size={26} color={colors.primary} />
              </View>
            </View>
          </BentoCard>
        </TouchableOpacity>

        {/* ROW 2+: Project cards, 2 per row */}
        {loading && projects.length === 0 ? (
          <SkeletonCardList count={3} />
        ) : projects.length === 0 ? (
          <EmptyState
            icon="folder-open-outline"
            title="No Projects Yet"
            description="Create your first project workspace to start tracking expenses."
            actionTitle="+ New Project"
            onActionPress={openCreateModal}
          />
        ) : (
          <BentoRow style={styles.projectsWrap}>
            {projects.map((proj) => {
              const ratio = proj.budget > 0 ? proj.totalSpent / proj.budget : 0;
              const percentUsed = Math.round(ratio * 100);

              return (
                <TouchableOpacity
                  key={proj.id}
                  activeOpacity={0.8}
                  onPress={() => navigation.navigate('ProjectDetail', { id: proj.id })}
                  style={styles.projTouchable}
                >
                  <BentoCard style={styles.projCard}>
                    <View style={styles.projHeader}>
                      <View style={styles.nameRow}>
                        <View style={[styles.dot, { backgroundColor: proj.color || colors.primary }]} />
                        <Text style={[styles.projName, { color: colors.text }]} numberOfLines={1}>{proj.name}</Text>
                      </View>
                      <Badge text="Active" variant="success" />
                    </View>

                    <Text style={[styles.spentAmount, { color: colors.text }]}>
                      {formatINR(proj.totalSpent)}
                    </Text>
                    {proj.budget > 0 && (
                      <Text style={[styles.budgetSubtitle, { color: colors.textSecondary }]}>
                        of {formatINR(proj.budget)} budget
                      </Text>
                    )}

                    {proj.budget > 0 && (
                      <View style={styles.progressSection}>
                        <ProgressBar
                          progress={Math.min(1.0, ratio)}
                          color={ratio > 0.8 ? colors.error : ratio > 0.6 ? colors.warning : colors.success}
                          style={styles.progressBar}
                        />
                        <Text style={[styles.progressText, { color: colors.textSecondary }]}>
                          {percentUsed}% used
                        </Text>
                      </View>
                    )}

                    <View style={styles.logsRow}>
                      <MaterialCommunityIcons name="receipt" size={13} color={colors.textSecondary} style={{ marginRight: 4 }} />
                      <Text style={[styles.logsText, { color: colors.textSecondary }]}>{proj.expenseCount} logs</Text>
                    </View>
                  </BentoCard>
                </TouchableOpacity>
              );
            })}
          </BentoRow>
        )}

      </ScrollView>

      {/* CREATE PROJECT MODAL */}
      <Modal
        visible={showCreateModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>New Project</Text>

            <TextInput
              style={[styles.modalInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
              placeholder="Project Name *"
              placeholderTextColor={colors.textSecondary}
              value={newProjectName}
              onChangeText={setNewProjectName}
            />

            <TextInput
              style={[styles.modalInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
              placeholder="Budget (₹ optional)"
              placeholderTextColor={colors.textSecondary}
              value={newProjectBudget}
              onChangeText={setNewProjectBudget}
              keyboardType="numeric"
            />

            <TextInput
              style={[styles.modalInput, styles.modalTextArea, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
              placeholder="Description (optional)"
              placeholderTextColor={colors.textSecondary}
              value={newProjectDesc}
              onChangeText={setNewProjectDesc}
              multiline
              numberOfLines={3}
            />

            <TouchableOpacity
              style={[styles.modalBtn, { backgroundColor: colors.primary }]}
              onPress={handleCreateProject}
              disabled={creating}
            >
              {creating
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.modalBtnText}>Create Project</Text>
              }
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalBtn, styles.modalCancelBtn, { backgroundColor: colors.background, borderColor: colors.border }]}
              onPress={() => setShowCreateModal(false)}
            >
              <Text style={[styles.modalBtnText, { color: colors.text }]}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: spacing.md,
  },
  menuBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  headerTitle: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.md + 2,
    fontWeight: typography.weights.bold,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 48,
  },
  newProjectCard: {
    marginBottom: 12,
  },
  newProjectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  newProjectTitle: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    marginTop: 4,
  },
  plusCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  projectsWrap: {
    flexWrap: 'wrap',
  },
  projTouchable: {
    width: '48.5%',
  },
  projCard: {
    width: '100%',
  },
  projHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: spacing.xs,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.xs,
  },
  projName: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    flexShrink: 1,
  },
  spentAmount: {
    fontFamily: typography.fontFamily,
    fontSize: 20,
    fontWeight: typography.weights.bold,
  },
  budgetSubtitle: {
    fontFamily: typography.fontFamily,
    fontSize: 11,
    fontWeight: typography.weights.medium,
    marginBottom: spacing.sm,
  },
  progressSection: {
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  progressBar: {
    height: 5,
    borderRadius: 3,
    marginBottom: 4,
  },
  progressText: {
    fontFamily: typography.fontFamily,
    fontSize: 10,
    fontWeight: typography.weights.semibold,
  },
  logsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logsText: {
    fontFamily: typography.fontFamily,
    fontSize: 10,
    fontWeight: typography.weights.semibold,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
  },
  modalInput: {
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    marginBottom: 12,
    borderWidth: 1,
  },
  modalTextArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  modalBtn: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  modalCancelBtn: {
    borderWidth: 1,
  },
  modalBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
export default ProjectsScreen;
