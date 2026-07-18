import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, KeyboardAvoidingView, ScrollView, Platform, TouchableOpacity, Image } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';

import { expenseSchema } from '../../utils/validators';
import useExpenses from '../../hooks/useExpenses';
import useTheme from '../../hooks/useTheme';
import { useUiStore } from '../../store/uiStore';
import { spacing } from '../../constants/spacing';
import { typography } from '../../constants/typography';
import { categories } from '../../constants/categories';

// Custom elements
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export const AddExpenseScreen = ({ route, navigation }) => {
  const { colors } = useTheme();
  const { addExpense, updateExpense, parseReceiptImage, projects, fetchProjects } = useExpenses();
  const showToast = useUiStore((state) => state.showToast);

  useEffect(() => {
    if (!projects.length) fetchProjects();
  }, []);

  const prefillData = route.params?.prefillData;
  const isEditing = !!prefillData;

  const [receiptUri, setReceiptUri] = useState(prefillData?.receiptUri || null);
  const [ocrLoading, setOcrLoading] = useState(false);

  const { control, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      amount: prefillData?.amount || '',
      vendor: prefillData?.vendor || '',
      category: prefillData?.category || '',
      date: prefillData?.date ? new Date(prefillData.date) : new Date(),
      project: prefillData?.project || '',
      paymentMethod: prefillData?.paymentMethod || 'UPI',
      notes: prefillData?.notes || '',
      receiptUri: prefillData?.receiptUri || '',
      isAiParsed: prefillData?.isAiParsed || false,
    }
  });

  const selectedCat = watch('category');
  const selectedMethod = watch('paymentMethod');
  const selectedProject = watch('project');

  // Trigger OCR if passed via quick dashboard trigger
  useEffect(() => {
    if (route.params?.triggerOcr) {
      handleCameraCapture();
    }
  }, [route.params]);

  const handleCameraCapture = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      showToast("Camera access permission is required to snap receipt bills.", "error");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets?.[0]?.uri) {
      const uri = result.assets[0].uri;
      setReceiptUri(uri);
      setValue('receiptUri', uri);
      showToast("Receipt captured! Tap 'Parse with AI' to scan.", "success");
    }
  };

  const handleGalleryUpload = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      showToast("Storage access permission is required to upload files.", "error");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets?.[0]?.uri) {
      const uri = result.assets[0].uri;
      setReceiptUri(uri);
      setValue('receiptUri', uri);
      showToast("Receipt selected! Tap 'Parse with AI' to scan.", "success");
    }
  };

  const handleAiParsing = async () => {
    if (!receiptUri) {
      showToast("Please capture or upload a bill receipt first.", "error");
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setOcrLoading(true);

    const res = await parseReceiptImage(receiptUri);
    setOcrLoading(false);

    if (res.success && res.parsedData) {
      const parsed = res.parsedData;
      if (parsed.amount !== undefined) setValue('amount', parsed.amount);
      if (parsed.vendor !== undefined) setValue('vendor', parsed.vendor);
      if (parsed.category !== undefined) setValue('category', parsed.category);
      if (parsed.paymentMethod !== undefined) setValue('paymentMethod', parsed.paymentMethod);
      if (parsed.notes !== undefined) setValue('notes', parsed.notes);
      if (parsed.receiptUri) {
        setReceiptUri(parsed.receiptUri);
        setValue('receiptUri', parsed.receiptUri);
      }
      setValue('isAiParsed', true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showToast("Bill scanned! Form autofilled via XpenZ AI ?", "success");
    } else {
      showToast(res.error || "Receipt scan failed.", "error");
    }
  };

  const handleCategoryPress = (catId) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setValue('category', catId);
  };

  const handleMethodPress = (method) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setValue('paymentMethod', method);
  };

  const onSubmit = async (data) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    let res;
    if (isEditing) {
      res = await updateExpense(prefillData.id, data);
    } else {
      res = await addExpense(data);
    }

    if (res.success) {
      showToast(isEditing ? "Expense updated successfully!" : "Expense logged successfully!", "success");
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
      {/* Dynamic Header */}
      <View style={styles.header}>
        <TouchableOpacity activeOpacity={0.7} onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialCommunityIcons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {isEditing ? 'Edit Expense' : 'New Expense'}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {ocrLoading && <LoadingSpinner fullScreen message="AI OCR reads invoice details..." />}

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Large Amount Field */}
        <View style={styles.amountContainer}>
          <Text style={[styles.amountLabel, { color: colors.textSecondary }]}>Amount Spent</Text>
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

        {/* Vendor field */}
        <Controller
          control={control}
          name="vendor"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Merchant / Vendor Name"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="e.g., Swiggy, Ola Cabs, AWS"
              icon="store-outline"
              error={errors.vendor?.message}
            />
          )}
        />

        {/* CATEGORY GRID CHIP SELECTOR */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Expense Category</Text>
          <View style={styles.categoryGrid}>
            {categories.map((c) => {
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

        {/* PAYMENT METHOD ROW */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Payment Method</Text>
          <View style={styles.methodRow}>
            {['Cash', 'UPI', 'Card', 'Net Banking'].map((m) => {
              const isSelected = selectedMethod === m;
              return (
                <TouchableOpacity
                  key={m}
                  activeOpacity={0.8}
                  onPress={() => handleMethodPress(m)}
                  style={[
                    styles.methodChip,
                    { borderColor: colors.border },
                    isSelected && { backgroundColor: colors.primaryContainer, borderColor: colors.primary }
                  ]}
                >
                  <Text style={[styles.methodText, { color: colors.text }]}>{m}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Project picker (from GET /projects) */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Associated Project</Text>
          {projects.length === 0 ? (
            <Text style={[styles.errorText, { color: colors.textSecondary }]}>
              No project workspaces yet — create one from the Projects tab first.
            </Text>
          ) : (
            <View style={styles.methodRow}>
              {projects.map((p) => {
                const isSelected = selectedProject === p.id;
                return (
                  <TouchableOpacity
                    key={p.id}
                    activeOpacity={0.8}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setValue('project', p.id);
                    }}
                    style={[
                      styles.methodChip,
                      { borderColor: colors.border },
                      isSelected && { backgroundColor: colors.primaryContainer, borderColor: colors.primary }
                    ]}
                  >
                    <Text style={[styles.methodText, { color: colors.text }]} numberOfLines={1}>
                      {p.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        {/* Notes memo text */}
        <Controller
          control={control}
          name="notes"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Memo Notes / Description"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="Write any additional context here..."
              icon="note-text-outline"
              multiline
              numberOfLines={3}
              inputStyle={{ height: 80, textAlignVertical: 'top' }}
            />
          )}
        />

        {/* RECEIPT IMAGE UPLOAD SECTION */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Receipt File Attachments</Text>
          
          {receiptUri ? (
            <View style={styles.imagePreviewWrapper}>
              <Image source={{ uri: receiptUri }} style={styles.receiptPreviewImage} />
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => {
                  setReceiptUri(null);
                  setValue('receiptUri', '');
                }}
                style={styles.removeImageBtn}
              >
                <MaterialCommunityIcons name="close-circle" size={24} color="#ffffff" />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.uploadOptionsRow}>
              <TouchableOpacity activeOpacity={0.8} onPress={handleGalleryUpload} style={[styles.uploadBtn, { borderColor: colors.border, backgroundColor: colors.card }]}>
                <MaterialCommunityIcons name="image-plus" size={28} color={colors.primary} />
                <Text style={[styles.uploadText, { color: colors.textSecondary }]}>Gallery Upload</Text>
              </TouchableOpacity>

              <TouchableOpacity activeOpacity={0.8} onPress={handleCameraCapture} style={[styles.uploadBtn, { borderColor: colors.border, backgroundColor: colors.card }]}>
                <MaterialCommunityIcons name="camera" size={28} color={colors.primary} />
                <Text style={[styles.uploadText, { color: colors.textSecondary }]}>Camera Snap</Text>
              </TouchableOpacity>
            </View>
          )}

          {receiptUri && (
            <Button
              title="Parse with AI ?"
              onPress={handleAiParsing}
              variant="outline"
              style={styles.parseBtn}
            />
          )}
        </View>

        {/* Save button */}
        <Button
          title={isEditing ? 'Update Expense' : 'Save Expense'}
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
    padding: 0, // Remove text input padding defaults
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
  methodRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  methodChip: {
    flex: 1,
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md - 2,
    borderWidth: 1.5,
    borderRadius: spacing.borderRadius.md,
  },
  methodText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.xs + 1,
    fontWeight: typography.weights.bold,
  },
  uploadOptionsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  uploadBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 90,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: spacing.borderRadius.md,
    gap: spacing.xs,
  },
  uploadText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
  },
  imagePreviewWrapper: {
    width: '100%',
    height: 180,
    borderRadius: spacing.borderRadius.md,
    overflow: 'hidden',
    position: 'relative',
  },
  receiptPreviewImage: {
    width: '100%',
    height: '100%',
  },
  removeImageBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  parseBtn: {
    width: '100%',
    marginTop: spacing.md,
  },
  saveBtn: {
    width: '100%',
    marginTop: spacing.md,
  },
});
export default AddExpenseScreen;

