import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, FlatList, TextInput, TouchableOpacity, Modal, ScrollView, Alert, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Swipeable } from 'react-native-gesture-handler';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import useExpenses from '../../hooks/useExpenses';
import useTheme from '../../hooks/useTheme';
import { useUiStore } from '../../store/uiStore';
import { spacing } from '../../constants/spacing';
import { typography } from '../../constants/typography';
import { bentoText } from '../../constants/bento';
import { categories } from '../../constants/categories';
import { formatINR } from '../../utils/currency';
import { groupExpensesByDate } from '../../utils/dateHelpers';

// Custom elements
import BentoCard from '../../components/common/BentoCard';
import BentoRow from '../../components/common/BentoRow';
import Divider from '../../components/common/Divider';
import ExpenseCard from '../../components/expenses/ExpenseCard';
import { SkeletonCardList } from '../../components/common/SkeletonLoader';
import { openAppDrawer } from '../../utils/navigation';

const CATEGORY_STYLES = {
  'Food & Dining': {
    icon: 'food-fork-drink',
    color: '#FF6B6B',
    bg: '#FFF0F0',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=200&q=80',
  },
  'Transport': {
    icon: 'car',
    color: '#4ECDC4',
    bg: '#F0FFFE',
    image: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=200&q=80',
  },
  'Shopping': {
    icon: 'shopping',
    color: '#45B7D1',
    bg: '#F0F8FF',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=200&q=80',
  },
  'Entertainment': {
    icon: 'movie-open',
    color: '#96CEB4',
    bg: '#F0FFF4',
    image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=200&q=80',
  },
  'Healthcare': {
    icon: 'hospital-box',
    color: '#FF6B9D',
    bg: '#FFF0F7',
    image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=200&q=80',
  },
  'Education': {
    icon: 'school',
    color: '#C3A6FF',
    bg: '#F8F0FF',
    image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=200&q=80',
  },
  'Utilities': {
    icon: 'lightning-bolt',
    color: '#FFD93D',
    bg: '#FFFBF0',
    image: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=200&q=80',
  },
  'Travel': {
    icon: 'airplane',
    color: '#6C47FF',
    bg: '#F3F0FF',
    image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=200&q=80',
  },
  'Other': {
    icon: 'dots-horizontal',
    color: '#888888',
    bg: '#F5F5F5',
    image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=200&q=80',
  },
};

export const ExpensesListScreen = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const {
    expenses,
    projects,
    loading,
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
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Filter form states
  const [selectedCats, setSelectedCats] = useState(filters.categories);
  const [sortBy, setSortBy] = useState(filters.sortBy);
  const [dateRange, setDateRange] = useState(filters.dateRange);
  const [amountRange, setAmountRange] = useState(filters.amountRange);
  const [selectedProject, setSelectedProject] = useState(filters.project || '');

  const filtered = getFilteredExpenses();
  const categoryFiltered = selectedCategory
    ? filtered.filter((e) => (e.category || 'Other') === selectedCategory)
    : filtered;
  const grouped = groupExpensesByDate(categoryFiltered);

  const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);
  const thisMonthAmount = expenses
    .filter((e) => {
      const d = new Date(e.date);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((sum, e) => sum + e.amount, 0);

  const toggleQuickCategory = (catId) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const next = filters.categories.includes(catId)
      ? filters.categories.filter((id) => id !== catId)
      : [...filters.categories, catId];
    setFilters({ categories: next });
  };

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
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#0A0A0A' : '#F5F5F7' }]}>
      {/* HEADER SECTION */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => openAppDrawer(navigation)}
            style={[styles.menuBtn, { borderColor: colors.border, backgroundColor: colors.card }]}
          >
            <MaterialCommunityIcons name="menu" size={22} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>Expenses</Text>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setIsSearchExpanded(!isSearchExpanded);
            }}
            style={[styles.headerBtn, { borderColor: colors.border, backgroundColor: colors.card }]}
          >
            <MaterialCommunityIcons name={isSearchExpanded ? "close" : "magnify"} size={22} color={colors.text} />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setIsFilterVisible(true);
            }}
            style={[styles.headerBtn, { borderColor: colors.border, backgroundColor: colors.card }]}
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

      {/* ROW 1: Stats cards */}
      <BentoRow style={styles.statsRow}>
        <BentoCard size="third" style={styles.statCard}>
          <Text style={[bentoText.label, { color: colors.textSecondary }]}>Total</Text>
          <Text style={[styles.statValue, { color: colors.text }]} numberOfLines={1}>{formatINR(totalAmount)}</Text>
        </BentoCard>
        <BentoCard size="third" style={styles.statCard}>
          <Text style={[bentoText.label, { color: colors.textSecondary }]}>This Month</Text>
          <Text style={[styles.statValue, { color: colors.text }]} numberOfLines={1}>{formatINR(thisMonthAmount)}</Text>
        </BentoCard>
        <BentoCard size="third" style={styles.statCard}>
          <Text style={[bentoText.label, { color: colors.textSecondary }]}>Count</Text>
          <Text style={[styles.statValue, { color: colors.text }]} numberOfLines={1}>{expenses.length}</Text>
        </BentoCard>
      </BentoRow>

      {/* ROW 2: Category grid */}
      <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>CATEGORIES</Text>
      <View style={styles.categoryGrid}>
        {Object.entries(CATEGORY_STYLES).map(([name, style]) => {
          const catExpenses = expenses.filter(e =>
            (e.category || 'Other') === name
          );
          const total = catExpenses.reduce((sum, e) =>
            sum + (parseFloat(e.amount) || 0), 0
          );
          return (
            <TouchableOpacity
              key={name}
              style={[
                styles.categoryCard,
                { backgroundColor: colors.card, borderColor: colors.border },
                selectedCategory === name && { borderColor: style.color, borderWidth: 2 },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSelectedCategory(
                  selectedCategory === name ? null : name
                );
              }}
              activeOpacity={0.8}
            >
              {/* Icon area - top */}
              <ImageBackground
                source={{ uri: style.image }}
                style={styles.categoryIconArea}
                imageStyle={{
                  borderTopLeftRadius: 16,
                  borderTopRightRadius: 16
                }}
              >
                <View style={styles.categoryImageOverlay} />
                <MaterialCommunityIcons
                  name={style.icon}
                  size={36}
                  color="#FFFFFF"
                />
                {selectedCategory === name && (
                  <View style={styles.selectedDot} />
                )}
              </ImageBackground>
              {/* Text area - bottom */}
              <View style={[styles.categoryTextArea, { backgroundColor: colors.card }]}>
                <Text
                  style={[styles.categoryCardName, { color: colors.text }]}
                  numberOfLines={1}
                >
                  {name}
                </Text>
                <Text style={[
                  styles.categoryCardAmount,
                  { color: style.color }
                ]} numberOfLines={1}>
                  {formatINR(total)}
                </Text>
                <Text style={[styles.categoryCardCount, { color: colors.textSecondary }]} numberOfLines={1}>
                  {catExpenses.length} expense{catExpenses.length !== 1 ? 's' : ''}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {selectedCategory && (
        <TouchableOpacity
          style={[styles.clearFilter, { backgroundColor: colors.primary }]}
          onPress={() => setSelectedCategory(null)}
        >
          <Text style={styles.clearFilterText}>
            ✕ {selectedCategory}
          </Text>
        </TouchableOpacity>
      )}

      {/* ROW 3: Expense cards grouped by date */}
      {loading && expenses.length === 0 ? (
        <View style={styles.listScroll}>
          <SkeletonCardList count={5} />
        </View>
      ) : grouped.length === 0 ? (
        <View style={styles.simpleEmpty}>
          <MaterialCommunityIcons
            name="receipt"
            size={48}
            color={colors.textSecondary}
            style={{ opacity: 0.4 }}
          />
          <Text style={[styles.simpleEmptyText, { color: colors.text }]}>No expenses yet</Text>
          <Text style={[styles.simpleEmptySubtext, { color: colors.textSecondary }]}>
            Add your first expense using the + button
          </Text>
        </View>
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
    paddingHorizontal: 16,
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
    borderWidth: 1,
  },
  title: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.xxl - 2,
    fontWeight: typography.weights.bold,
  },
  headerRight: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  headerBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    paddingHorizontal: spacing.md,
    height: 48,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: typography.sizes.sm + 1,
  },
  statsRow: {
    paddingHorizontal: 16,
  },
  statCard: {
    padding: 14,
  },
  statValue: {
    fontFamily: typography.fontFamily,
    fontSize: 18,
    fontWeight: typography.weights.bold,
    marginTop: 4,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 10,
    marginTop: 4,
    paddingHorizontal: 16,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  categoryCard: {
    width: '30.5%',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  categoryIconArea: {
    height: 90,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
  },
  categoryImageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  selectedDot: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  categoryTextArea: {
    padding: 8,
  },
  categoryCardName: {
    fontSize: 10,
    fontWeight: '600',
    marginBottom: 2,
  },
  categoryCardAmount: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 1,
  },
  categoryCardCount: {
    fontSize: 9,
  },
  clearFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginHorizontal: 16,
    marginBottom: 12,
  },
  clearFilterText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  simpleEmpty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  simpleEmptyText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
    opacity: 0.6,
  },
  simpleEmptySubtext: {
    fontSize: 13,
    marginTop: 4,
    textAlign: 'center',
  },
  listScroll: {
    paddingHorizontal: 16,
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
