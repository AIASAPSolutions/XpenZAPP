import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, FlatList, TextInput, TouchableOpacity, Modal, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Swipeable } from 'react-native-gesture-handler';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import useExpenses from '../../hooks/useExpenses';
import useTheme from '../../hooks/useTheme';
import { useUiStore } from '../../store/uiStore';
import { spacing } from '../../constants/spacing';
import { typography } from '../../constants/typography';
import { categories } from '../../constants/categories';
import { formatINR } from '../../utils/currency';
import { groupExpensesByDate } from '../../utils/dateHelpers';

// Custom elements
import Card from '../../components/common/Card';
import Divider from '../../components/common/Divider';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import ExpenseCard from '../../components/expenses/ExpenseCard';
import { openAppDrawer } from '../../utils/navigation';

export const ExpensesListScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const {
    expenses,
    projects,
    fetchExpenses,
    fetchProjects,
    getFilteredExpenses,
    deleteExpense,
    filters,
    setFilters,
    resetFilters,
  } = useExpenses();
  const swipeableRefs = useRef({});
  const showToast = useUiStore((state) => state.showToast);

  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isFilterVisible, setIsFilterVisible] = useState(false);

  // Filter form states
  const [selectedCats, setSelectedCats] = useState(filters.categories);
  const [sortBy, setSortBy] = useState(filters.sortBy);
  const [dateRange, setDateRange] = useState(filters.dateRange);
  const [amountRange, setAmountRange] = useState(filters.amountRange);
  const [selectedProject, setSelectedProject] = useState(filters.project || '');

  const filtered = getFilteredExpenses();
  const grouped = groupExpensesByDate(filtered);

  useEffect(() => {
    fetchExpenses();
    fetchProjects();
  }, [fetchExpenses, fetchProjects]);

  // Synchronize internal filter states
  useEffect(() => {
    setSelectedCats(filters.categories);
    setSortBy(filters.sortBy);
    setDateRange(filters.dateRange);
    setAmountRange(filters.amountRange);
    setSelectedProject(filters.project || '');
  }, [filters]);

  const closeSwipe = (id) => swipeableRefs.current[id]?.close();

  const handleSearch = (text) => {
    setFilters({ searchQuery: text });
  };

  const handleApplyFilters = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFilters({
      categories: selectedCats,
      sortBy,
      dateRange: dateRange ?? 'All',
      amountRange,
      project: selectedProject,
    });
    setIsFilterVisible(false);
    showToast("Filters applied!", "success");
  };

  const handleResetFilters = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    resetFilters();
    setSelectedCats([]);
    setSortBy('Newest');
    setDateRange('This Month');
    setAmountRange([0, 50000]);
    setSelectedProject('');
    setIsFilterVisible(false);
    showToast("Filters cleared.", "info");
  };

  const toggleCategory = (catId) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (selectedCats.includes(catId)) {
      setSelectedCats(selectedCats.filter(id => id !== catId));
    } else {
      setSelectedCats([...selectedCats, catId]);
    }
  };

  const handleDelete = (id, vendor) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert(
      "Confirm Delete",
      `Are you sure you want to permanently delete the expense for "${vendor}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const res = await deleteExpense(id);
            if (res.success) {
              showToast("Expense deleted successfully.", "success");
            } else {
              showToast(res.error, "error");
            }
          }
        }
      ]
    );
  };

  const handleEdit = (expense) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('EditExpense', { prefillData: expense });
  };

  const renderLeftActions = (expense) => (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => {
        closeSwipe(expense.id);
        handleEdit(expense);
      }}
      style={[styles.swipeAction, styles.swipeEdit, { backgroundColor: colors.primary }]}
    >
      <MaterialCommunityIcons name="pencil-outline" size={22} color="#ffffff" />
      <Text style={styles.swipeActionText}>Edit</Text>
    </TouchableOpacity>
  );

  const renderRightActions = (expense) => (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => {
        closeSwipe(expense.id);
        handleDelete(expense.id, expense.vendor);
      }}
      style={[styles.swipeAction, styles.swipeDelete, { backgroundColor: colors.error }]}
    >
      <MaterialCommunityIcons name="trash-can-outline" size={22} color="#ffffff" />
      <Text style={styles.swipeActionText}>Delete</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* HEADER SECTION */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => openAppDrawer(navigation)}
            style={[styles.menuBtn, { borderColor: colors.border }]}
          >
            <MaterialCommunityIcons name="menu" size={22} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>Expenses</Text>
          <Badge text={`${filtered.length} total`} variant="primary" style={styles.countBadge} />
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setIsSearchExpanded(!isSearchExpanded);
            }}
            style={[styles.headerBtn, { borderColor: colors.border }]}
          >
            <MaterialCommunityIcons name={isSearchExpanded ? "close" : "magnify"} size={22} color={colors.text} />
          </TouchableOpacity>
          
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setIsFilterVisible(true);
            }}
            style={[styles.headerBtn, { borderColor: colors.border }]}
          >
            <MaterialCommunityIcons name="tune" size={22} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* EXPANDABLE SEARCH BAR */}
      {isSearchExpanded && (
        <View style={[styles.searchBarWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <MaterialCommunityIcons name="magnify" size={20} color={colors.textSecondary} style={{ marginRight: spacing.sm }} />
          <TextInput
            value={filters.searchQuery}
            onChangeText={handleSearch}
            placeholder="Search by vendor or category..."
            placeholderTextColor={colors.textSecondary}
            style={[styles.searchInput, { color: colors.text }]}
            autoFocus
          />
        </View>
      )}

      {/* MAIN EXPENSES FlatList GROUPED BY DATE */}
      {grouped.length === 0 ? (
        <EmptyState
          icon="receipt"
          title="No Expenses Logged"
          description="Log Swiggy dinners or Ola cab bookings by talking with XpenZ AI assistant!"
          actionTitle="+ Add Expense"
          onActionPress={() => navigation.navigate('AddExpense')}
        />
      ) : (
        <FlatList
          data={grouped}
          keyExtractor={(item) => item.dateStr}
          contentContainerStyle={styles.listScroll}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.dateGroup}>
              {/* Relatives date title header */}
              <Text style={[styles.dateHeader, { color: colors.textSecondary }]}>{item.title}</Text>
              
              {/* List of cards */}
              {item.data.map((expense) => (
                <Swipeable
                  key={expense.id}
                  ref={(ref) => { swipeableRefs.current[expense.id] = ref; }}
                  friction={2}
                  overshootLeft={false}
                  overshootRight={false}
                  renderLeftActions={() => renderLeftActions(expense)}
                  renderRightActions={() => renderRightActions(expense)}
                >
                  <ExpenseCard
                    expense={expense}
                    onPress={() => navigation.navigate('ExpenseDetail', { id: expense.id })}
                    style={styles.foregroundCard}
                  />
                </Swipeable>
              ))}
            </View>
          )}
        />
      )}

      {/* Floating Action Button (+ Add Expense) */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          navigation.navigate('AddExpense');
        }}
        style={[styles.fab, { backgroundColor: colors.primary, shadowColor: colors.primary }]}
      >
        <MaterialCommunityIcons name="plus" size={28} color="#ffffff" />
      </TouchableOpacity>

      {/* BOTTOM SHEET FILTER MODAL */}
      <Modal
        visible={isFilterVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setIsFilterVisible(false)}
      >
        <View style={styles.modalOverlay}>
          {/* Custom bottom card */}
          <View style={[styles.modalSheet, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Filter Expenses</Text>
              <TouchableOpacity activeOpacity={0.7} onPress={() => setIsFilterVisible(false)}>
                <MaterialCommunityIcons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalContent} showsVerticalScrollIndicator={false}>
              
              {/* Date Ranges */}
              <Text style={[styles.filterSectionTitle, { color: colors.text }]}>Date Period</Text>
              <View style={styles.periodRow}>
                {['This Week', 'This Month', 'All'].map((p) => (
                  <TouchableOpacity
                    key={p}
                    activeOpacity={0.8}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setDateRange(p === 'All' ? null : p);
                    }}
                    style={[
                      styles.periodChip,
                      { borderColor: colors.border },
                      ((p === 'All' && !dateRange) || dateRange === p) && { backgroundColor: colors.primaryContainer, borderColor: colors.primary }
                    ]}
                  >
                    <Text style={[styles.periodText, { color: colors.text }]}>{p}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Divider style={{ marginVertical: spacing.md }} />

              {/* Categories Grid Multi-Select */}
              <Text style={[styles.filterSectionTitle, { color: colors.text }]}>Categories</Text>
              <View style={styles.categoriesGrid}>
                {categories.map((c) => {
                  const isSelected = selectedCats.includes(c.id);
                  return (
                    <TouchableOpacity
                      key={c.id}
                      activeOpacity={0.8}
                      onPress={() => toggleCategory(c.id)}
                      style={[
                        styles.catFilterChip,
                        { borderColor: colors.border },
                        isSelected && { backgroundColor: `${c.color}15`, borderColor: c.color }
                      ]}
                    >
                      <MaterialCommunityIcons name={c.icon} size={16} color={isSelected ? c.color : colors.textSecondary} style={{ marginRight: 4 }} />
                      <Text style={[styles.catFilterText, { color: isSelected ? colors.text : colors.textSecondary }]}>
                        {c.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Divider style={{ marginVertical: spacing.md }} />

              <Text style={[styles.filterSectionTitle, { color: colors.text }]}>Amount Range (₹)</Text>
              <View style={styles.periodRow}>
                {[
                  { label: 'All', range: [0, 50000] },
                  { label: 'Under ₹5K', range: [0, 5000] },
                  { label: '₹5K–15K', range: [5000, 15000] },
                  { label: '₹15K+', range: [15000, 50000] },
                ].map((band) => (
                  <TouchableOpacity
                    key={band.label}
                    activeOpacity={0.8}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setAmountRange(band.range);
                    }}
                    style={[
                      styles.periodChip,
                      { borderColor: colors.border },
                      amountRange[0] === band.range[0] && amountRange[1] === band.range[1] && {
                        backgroundColor: colors.primaryContainer,
                        borderColor: colors.primary,
                      },
                    ]}
                  >
                    <Text style={[styles.periodText, { color: colors.text }]}>{band.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Divider style={{ marginVertical: spacing.md }} />

              <Text style={[styles.filterSectionTitle, { color: colors.text }]}>Project</Text>
              <View style={styles.periodRow}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setSelectedProject('');
                  }}
                  style={[
                    styles.periodChip,
                    { borderColor: colors.border },
                    !selectedProject && { backgroundColor: colors.primaryContainer, borderColor: colors.primary },
                  ]}
                >
                  <Text style={[styles.periodText, { color: colors.text }]}>All Projects</Text>
                </TouchableOpacity>
                {projects.map((p) => (
                  <TouchableOpacity
                    key={p.id}
                    activeOpacity={0.8}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setSelectedProject(p.id);
                    }}
                    style={[
                      styles.periodChip,
                      { borderColor: colors.border },
                      selectedProject === p.id && {
                        backgroundColor: colors.primaryContainer,
                        borderColor: colors.primary,
                      },
                    ]}
                  >
                    <Text style={[styles.periodText, { color: colors.text }]} numberOfLines={1}>
                      {p.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Divider style={{ marginVertical: spacing.md }} />

              {/* Sort Bys */}
              <Text style={[styles.filterSectionTitle, { color: colors.text }]}>Sort By</Text>
              <View style={styles.periodRow}>
                {['Newest', 'Highest', 'Lowest'].map((s) => (
                  <TouchableOpacity
                    key={s}
                    activeOpacity={0.8}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setSortBy(s);
                    }}
                    style={[
                      styles.periodChip,
                      { borderColor: colors.border },
                      sortBy === s && { backgroundColor: colors.primaryContainer, borderColor: colors.primary }
                    ]}
                  >
                    <Text style={[styles.periodText, { color: colors.text }]}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Modal buttons */}
              <View style={styles.modalActions}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={handleResetFilters}
                  style={[styles.modalActionBtn, styles.resetBtn, { borderColor: colors.border }]}
                >
                  <Text style={[styles.actionBtnTextText, { color: colors.textSecondary }]}>Clear All</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={handleApplyFilters}
                  style={[styles.modalActionBtn, { backgroundColor: colors.primary }]}
                >
                  <Text style={[styles.actionBtnTextText, { color: '#ffffff' }]}>Apply Filters</Text>
                </TouchableOpacity>
              </View>

            </ScrollView>
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
    paddingHorizontal: spacing.xl,
    paddingTop: 16,
    paddingBottom: spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  menuBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  title: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.xxl - 2,
    fontWeight: typography.weights.bold,
  },
  countBadge: {
    paddingVertical: 2,
    paddingHorizontal: spacing.sm,
  },
  headerRight: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  headerBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.xl,
    paddingHorizontal: spacing.md,
    height: 48,
    borderRadius: spacing.borderRadius.md,
    borderWidth: 1.5,
    marginBottom: spacing.md,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: typography.sizes.sm + 1,
  },
  listScroll: {
    paddingHorizontal: spacing.xl,
    paddingBottom: 84, // Space for Bottom Tab
  },
  dateGroup: {
    marginBottom: spacing.lg,
  },
  dateHeader: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.xs + 1,
    fontWeight: typography.weights.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  swipeAction: {
    width: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
    borderRadius: spacing.borderRadius.lg,
  },
  swipeEdit: {
    marginRight: spacing.xs,
  },
  swipeDelete: {
    marginLeft: spacing.xs,
  },
  swipeActionText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 4,
  },
  foregroundCard: {
    marginBottom: spacing.sm,
  },
  fab: {
    position: 'absolute',
    bottom: 84, // Sit above bottom tabs
    right: spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 15, 26, 0.45)', // Custom glass overlay
    justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopLeftRadius: spacing.borderRadius.xl,
    borderTopRightRadius: spacing.borderRadius.xl,
    maxHeight: '80%',
    paddingBottom: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.xl,
    borderBottomWidth: 1.5,
    borderBottomColor: '#f1f5f9',
  },
  modalTitle: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
  },
  modalContent: {
    padding: spacing.xl,
  },
  filterSectionTitle: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.sm + 1,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.md,
  },
  periodRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  periodChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: spacing.borderRadius.round,
    borderWidth: 1.5,
  },
  periodText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.xs + 1,
    fontWeight: typography.weights.semibold,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  catFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm - 2,
    borderRadius: spacing.borderRadius.round,
    borderWidth: 1.5,
  },
  catFilterText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.xs + 1,
    fontWeight: typography.weights.semibold,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginTop: spacing.xxl,
  },
  modalActionBtn: {
    flex: 1,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: spacing.borderRadius.md,
  },
  resetBtn: {
    borderWidth: 1.5,
  },
  actionBtnTextText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
});
export default ExpensesListScreen;
