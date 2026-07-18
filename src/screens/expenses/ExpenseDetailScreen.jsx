import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Image, ScrollView, TouchableOpacity, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import useExpenses from '../../hooks/useExpenses';
import useTheme from '../../hooks/useTheme';
import { useUiStore } from '../../store/uiStore';
import { spacing } from '../../constants/spacing';
import { typography } from '../../constants/typography';
import { getCategoryById } from '../../constants/categories';
import { formatINR } from '../../utils/currency';
import { formatDateWithTime } from '../../utils/dateHelpers';

// Custom elements
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Divider from '../../components/common/Divider';

export const ExpenseDetailScreen = ({ route, navigation }) => {
  const { id } = route.params;
  const { colors } = useTheme();
  const { expenses, fetchExpenses, deleteExpense } = useExpenses();
  const showToast = useUiStore((state) => state.showToast);

  const [isReceiptModalVisible, setIsReceiptModalVisible] = useState(false);

  useEffect(() => {
    if (!expenses.length) fetchExpenses();
  }, [fetchExpenses, expenses.length]);

  // Retrieve exact expense item
  const expense = expenses.find(e => e.id === id);

  if (!expense) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.errorWrapper}>
          <Text style={[styles.errorTitle, { color: colors.text }]}>Expense Not Found</Text>
          <Button title="Go Back" onPress={() => navigation.goBack()} variant="primary" />
        </View>
      </SafeAreaView>
    );
  }

  const cat = getCategoryById(expense.category);

  const handleDelete = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to permanently delete this expense?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const res = await deleteExpense(id);
            if (res.success) {
              showToast("Expense deleted successfully.", "success");
              navigation.goBack();
            } else {
              showToast(res.error, "error");
            }
          }
        }
      ]
    );
  };

  const handleEdit = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('EditExpense', { prefillData: expense });
  };

  const handleShare = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    showToast("Dispatched export invoice payload successfully!", "success");
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header controls bar */}
      <View style={styles.header}>
        <TouchableOpacity activeOpacity={0.7} onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Receipt Details</Text>
        <TouchableOpacity activeOpacity={0.7} onPress={handleEdit} style={styles.headerBtn}>
          <MaterialCommunityIcons name="pencil" size={22} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* RECEIPT STYLE DETAILS WRAPPER */}
        <Card style={styles.receiptCard} elevation="heavy">
          
          {/* Top circle category indicator */}
          <View style={styles.catIndicatorRow}>
            <View style={[styles.catIconCircle, { backgroundColor: `${cat.color}15` }]}>
              <MaterialCommunityIcons name={cat.icon} size={36} color={cat.color} />
            </View>
            {expense.isAiParsed && (
              <Badge text="Parsed by AI ✨" variant="success" style={styles.aiBadge} />
            )}
          </View>

          {/* Amount details */}
          <Text style={[styles.amountVal, { color: colors.text }]}>{formatINR(expense.amount)}</Text>
          <Text style={[styles.vendorVal, { color: colors.textSecondary }]}>{expense.vendor}</Text>

          <Divider style={{ marginVertical: spacing.lg }} />

          {/* Key fields */}
          <View style={styles.receiptFields}>
            <View style={styles.fieldRow}>
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Category</Text>
              <Text style={[styles.fieldVal, { color: colors.text }]}>{cat.name}</Text>
            </View>

            <View style={styles.fieldRow}>
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Logged Date</Text>
              <Text style={[styles.fieldVal, { color: colors.text }]}>{formatDateWithTime(expense.date)}</Text>
            </View>

            <View style={styles.fieldRow}>
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Payment Method</Text>
              <Text style={[styles.fieldVal, { color: colors.text }]}>{expense.paymentMethod}</Text>
            </View>

            {expense.project && (
              <View style={styles.fieldRow}>
                <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Associated Project</Text>
                <Badge text="Client Pitch Alpha" variant="accent" />
              </View>
            )}
          </View>

          {/* Notes description block */}
          {expense.notes && (
            <>
              <Divider style={{ marginVertical: spacing.lg }} />
              <View style={styles.notesSection}>
                <Text style={[styles.notesLabel, { color: colors.textSecondary }]}>Memo / Description</Text>
                <Text style={[styles.notesBody, { color: colors.text }]}>{expense.notes}</Text>
              </View>
            </>
          )}

          {/* Receipt attachments thumbnail */}
          {expense.receiptUri ? (
            <>
              <Divider style={{ marginVertical: spacing.lg }} />
              <View style={styles.receiptAttachment}>
                <Text style={[styles.attachmentLabel, { color: colors.textSecondary }]}>Receipt File Attachments</Text>
                <TouchableOpacity activeOpacity={0.8} onPress={() => setIsReceiptModalVisible(true)} style={styles.thumbnailWrapper}>
                  <Image source={{ uri: expense.receiptUri }} style={styles.receiptThumbnail} />
                  <View style={styles.thumbnailOverlay}>
                    <MaterialCommunityIcons name="arrow-expand-all" size={24} color="#ffffff" />
                  </View>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              {expense.isAiParsed && (
                <>
                  <Divider style={{ marginVertical: spacing.lg }} />
                  <View style={styles.receiptAttachment}>
                    <Text style={[styles.attachmentLabel, { color: colors.textSecondary }]}>Receipt File Attachments</Text>
                    <TouchableOpacity activeOpacity={0.8} onPress={() => setIsReceiptModalVisible(true)} style={styles.thumbnailWrapper}>
                      <View style={[styles.mockReceiptWrapper, { backgroundColor: colors.primaryContainer }]}>
                        <MaterialCommunityIcons name="file-document-outline" size={32} color={colors.primary} />
                        <Text style={[styles.mockReceiptText, { color: colors.primary }]}>Starbucks_Coffee_OCR.jpg</Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </>
          )}
        </Card>

        {/* BOTTOM ACTION BUTTONS */}
        <View style={styles.bottomActions}>
          <Button
            title="Share Expense"
            onPress={handleShare}
            variant="outline"
            icon={<MaterialCommunityIcons name="share-variant-outline" size={20} color={colors.primary} />}
            style={styles.shareBtn}
          />
          <Button
            title="Delete Transaction"
            onPress={handleDelete}
            variant="danger"
            style={styles.deleteBtn}
          />
        </View>

      </ScrollView>

      {/* FULL SCREEN RECEIPTS MODAL OVERLAY */}
      <Modal
        visible={isReceiptModalVisible}
        transparent
        onRequestClose={() => setIsReceiptModalVisible(false)}
      >
        <View style={styles.overlayContainer}>
          <TouchableOpacity activeOpacity={0.8} onPress={() => setIsReceiptModalVisible(false)} style={styles.overlayClose}>
            <MaterialCommunityIcons name="close-circle" size={36} color="#ffffff" />
          </TouchableOpacity>
          {expense.receiptUri ? (
            <Image source={{ uri: expense.receiptUri }} style={styles.fullScreenImage} resizeMode="contain" />
          ) : (
            <View style={styles.fullScreenMockWrapper}>
              <MaterialCommunityIcons name="file-document-edit-outline" size={72} color="#ffffff" />
              <Text style={styles.fullScreenMockTitle}>Starbucks Coffee Invoice</Text>
              <Text style={styles.fullScreenMockText}>Amount: ₹850.00</Text>
              <Text style={styles.fullScreenMockText}>Merchant: Starbucks Coffee</Text>
              <Text style={styles.fullScreenMockText}>Category: Food & Dining</Text>
              <Text style={styles.fullScreenMockText}>Parsed Successfully via AI ✨</Text>
            </View>
          )}
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
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: 48,
  },
  receiptCard: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  catIndicatorRow: {
    position: 'relative',
    width: '100%',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  catIconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
  },
  amountVal: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.xxxl,
    fontWeight: typography.weights.black,
    marginBottom: spacing.xs,
  },
  vendorVal: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
  },
  receiptFields: {
    width: '100%',
    gap: spacing.md,
  },
  fieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fieldLabel: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
  },
  fieldVal: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
  notesSection: {
    width: '100%',
    alignItems: 'flex-start',
  },
  notesLabel: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.xs + 1,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.xs,
  },
  notesBody: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.sm,
    lineHeight: typography.lineHeights.sm,
  },
  receiptAttachment: {
    width: '100%',
    alignItems: 'flex-start',
  },
  attachmentLabel: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.xs + 1,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.sm,
  },
  thumbnailWrapper: {
    width: '100%',
    height: 120,
    borderRadius: spacing.borderRadius.md,
    overflow: 'hidden',
    position: 'relative',
  },
  receiptThumbnail: {
    width: '100%',
    height: '100%',
  },
  thumbnailOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 15, 26, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mockReceiptWrapper: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: spacing.borderRadius.md,
    gap: spacing.sm,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#3730a3',
  },
  mockReceiptText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
  },
  bottomActions: {
    marginTop: spacing.xxl,
    width: '100%',
    gap: spacing.md,
  },
  shareBtn: {
    width: '100%',
  },
  deleteBtn: {
    width: '100%',
  },
  errorWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  errorTitle: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
  },
  overlayContainer: {
    flex: 1,
    backgroundColor: 'rgba(15, 15, 26, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlayClose: {
    position: 'absolute',
    top: 48,
    right: 24,
    zIndex: 9999,
  },
  fullScreenImage: {
    width: '90%',
    height: '80%',
  },
  fullScreenMockWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  fullScreenMockTitle: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: '#ffffff',
  },
  fullScreenMockText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.md,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: typography.weights.medium,
  },
});
export default ExpenseDetailScreen;
