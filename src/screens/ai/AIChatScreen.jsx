import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';

import useAIChat from '../../hooks/useAIChat';
import useExpenses from '../../hooks/useExpenses';
import useTheme from '../../hooks/useTheme';
import { useUiStore } from '../../store/uiStore';
import { spacing } from '../../constants/spacing';
import { typography } from '../../constants/typography';
import { formatINR } from '../../utils/currency';
import BentoCard from '../../components/common/BentoCard';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';

const SUGGESTION_IMAGES = [
  {
    text: 'Log ₹500 Swiggy dinner',
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=300&q=80',
  },
  {
    text: "This week's spending",
    image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=300&q=80',
  },
  {
    text: 'Add Uber cab ₹250',
    image: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=300&q=80',
  },
  {
    text: 'Monthly report',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=300&q=80',
  },
];

const PROJECT_IMAGES = {
  'operations': {
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=200&q=80',
    icon: 'briefcase',
    color: '#6C47FF',
  },
  'marketing': {
    image: 'https://images.unsplash.com/photo-1533750516457-a7f992034fec?w=200&q=80',
    icon: 'bullhorn',
    color: '#FF6B6B',
  },
  'travel': {
    image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=200&q=80',
    icon: 'airplane',
    color: '#4ECDC4',
  },
  'ticket': {
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=200&q=80',
    icon: 'ticket',
    color: '#FFD93D',
  },
  'default': {
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
    icon: 'folder',
    color: '#96CEB4',
  },
};

const getProjectStyle = (projectName) => {
  const key = projectName?.toLowerCase();
  for (const k of Object.keys(PROJECT_IMAGES)) {
    if (k !== 'default' && key?.includes(k)) {
      return PROJECT_IMAGES[k];
    }
  }
  return PROJECT_IMAGES['default'];
};

export const AIChatScreen = ({ navigation, route }) => {
  const { colors } = useTheme();
  const { messages, sendMessage, loading } = useAIChat();
  const { addExpense, projects, activeProjectId, setActiveProjectId } = useExpenses();
  const showToast = useUiStore((state) => state.showToast);
  const [inputText, setInputText] = useState('');
  const scrollViewRef = useRef(null);

  useEffect(() => {
    // Scroll to bottom on load or new message
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages, loading]);

  useEffect(() => {
    // If entered via Dashboard voice button
    if (route.params?.autoVoice) {
      showToast("Voice capture activated... Say what you spent!", "success");
      // Simulate input voice log
      setTimeout(() => {
        sendMessage("Log ₹1200 Ola cab to airport");
      }, 1000);
    }
  }, [route.params]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    sendMessage(inputText.trim());
    setInputText('');
  };

  const handleChipPress = (chipText) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    sendMessage(chipText);
  };

  const handleAttachImage = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      showToast("Storage gallery permission is required to upload receipts.", "error");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets?.[0]?.uri) {
      const uri = result.assets[0].uri;
      showToast("AI OCR scanning bill receipt...", "success");
      // Send image log
      sendMessage(null, uri);
    }
  };

  const handleMicPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    showToast("Voice logging: 'Swiggy dinner ₹500'", "info");
    sendMessage("Log swiggy dinner ₹500");
  };

  const handleConfirmExpense = async (confirmCardData, msgId) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const res = await addExpense(confirmCardData);
    if (res.success) {
      showToast("Expense logged successfully via AI!", "success");
      // Append local feedback confirmation in messages
      sendMessage("Confirm ✓");
    } else {
      showToast("Failed to confirm expense.", "error");
    }
  };

  const handleEditExpense = (confirmCardData) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('Expenses', {
      screen: 'EditExpense',
      params: { prefillData: confirmCardData },
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Dynamic Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Avatar size={40} name="XP" style={styles.headerAvatar} />
        <View style={styles.headerDetails}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>XpenZ AI Assistant</Text>
          <View style={styles.onlineWrapper}>
            <View style={[styles.onlineDot, { backgroundColor: colors.success }]} />
            <Text style={[styles.onlineText, { color: colors.textSecondary }]}>Active Online</Text>
          </View>
        </View>
        <TouchableOpacity activeOpacity={0.7} onPress={() => navigation.goBack()} style={styles.closeBtn}>
          <MaterialCommunityIcons name="chevron-down" size={28} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* PROJECT CONTEXT SELECTOR */}
      {projects.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.projectScrollRow}
          contentContainerStyle={styles.projectScrollContent}
        >
          {projects.map((project) => {
            const pStyle = getProjectStyle(project.name);
            const isSelected = (activeProjectId || projects[0]?.id) === project.id;
            return (
              <TouchableOpacity
                key={project.id}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setActiveProjectId(project.id);
                }}
                style={[
                  styles.projectImageCard,
                  isSelected && styles.projectImageCardSelected,
                ]}
                activeOpacity={0.8}
              >
                <ImageBackground
                  source={{ uri: pStyle.image }}
                  style={styles.projectImageArea}
                  imageStyle={{ borderRadius: 14 }}
                >
                  <View style={[
                    styles.projectImageOverlay,
                    isSelected && { backgroundColor: 'rgba(108,71,255,0.5)' }
                  ]} />
                  <MaterialCommunityIcons
                    name={pStyle.icon}
                    size={22}
                    color="#FFFFFF"
                  />
                  {isSelected && (
                    <View style={styles.projectSelectedBadge}>
                      <MaterialCommunityIcons
                        name="check-circle"
                        size={12}
                        color="#FFFFFF"
                      />
                    </View>
                  )}
                </ImageBackground>
                <Text
                  style={[
                    styles.projectImageLabel,
                    { color: colors.textSecondary },
                    isSelected && { color: colors.primary, fontWeight: '700' }
                  ]}
                  numberOfLines={1}
                >
                  {project.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        style={{ flex: 1 }}
      >
        {/* Messages List Area */}
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.messagesScroll}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((msg) => {
            const isAi = msg.sender === 'ai';
            return (
              <View
                key={msg.id}
                style={[
                  styles.messageRow,
                  isAi ? styles.rowAi : styles.rowUser
                ]}
              >
                {isAi && (
                  <View style={[styles.xpAvatarWrapper, { backgroundColor: colors.primaryContainer }]}>
                    <Text style={[styles.xpAvatarText, { color: colors.primary }]}>XP</Text>
                  </View>
                )}
                
                <View style={styles.messageContent}>
                  <View
                    style={[
                      styles.bubble,
                      isAi
                        ? [styles.bubbleAi, { backgroundColor: colors.card, borderColor: colors.border }]
                        : [styles.bubbleUser, { backgroundColor: colors.primary }]
                    ]}
                  >
                    <Text style={[styles.bubbleText, { color: isAi ? colors.text : '#ffffff' }]}>
                      {msg.text}
                    </Text>
                    {msg.receiptUri && (
                      <View style={styles.imageAttachmentPreview}>
                        <MaterialCommunityIcons name="image" size={16} color="#ffffff" style={{ marginRight: 4 }} />
                        <Text style={styles.attachmentLabel}>Attached Invoice Receipt</Text>
                      </View>
                    )}
                  </View>

                  {/* RENDER EXPENSE CONFIRMATION CARD IF DISPATCHED */}
                  {isAi && msg.expenseConfirmation && (
                    <BentoCard style={styles.confirmCard}>
                      <View style={styles.confirmHeader}>
                        <Badge text="AI PARSED RECEIPT ✨" variant="primary" />
                        <Text style={[styles.confirmAmount, { color: colors.text }]}>
                          {formatINR(msg.expenseConfirmation.amount)}
                        </Text>
                      </View>
                      
                      <View style={styles.confirmFields}>
                        <View style={styles.confirmFieldRow}>
                          <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Vendor:</Text>
                          <Text style={[styles.fieldVal, { color: colors.text }]}>{msg.expenseConfirmation.vendor}</Text>
                        </View>
                        <View style={styles.confirmFieldRow}>
                          <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Category:</Text>
                          <Text style={[styles.fieldVal, { color: colors.text, textTransform: 'capitalize' }]}>
                            {msg.expenseConfirmation.category}
                          </Text>
                        </View>
                        <View style={styles.confirmFieldRow}>
                          <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Payment:</Text>
                          <Text style={[styles.fieldVal, { color: colors.text }]}>
                            {msg.expenseConfirmation.paymentMethod}
                          </Text>
                        </View>
                      </View>

                      {/* Action buttons */}
                      <View style={styles.confirmActions}>
                        <TouchableOpacity
                          activeOpacity={0.7}
                          onPress={() => handleEditExpense(msg.expenseConfirmation)}
                          style={[styles.confirmActionBtn, styles.editBtn, { borderColor: colors.border }]}
                        >
                          <MaterialCommunityIcons name="pencil-outline" size={18} color={colors.text} />
                          <Text style={[styles.actionBtnText, { color: colors.text }]}>Edit ✗</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          activeOpacity={0.7}
                          onPress={() => handleConfirmExpense(msg.expenseConfirmation, msg.id)}
                          style={[styles.confirmActionBtn, { backgroundColor: colors.primary }]}
                        >
                          <MaterialCommunityIcons name="check-bold" size={18} color="#ffffff" />
                          <Text style={[styles.actionBtnText, { color: '#ffffff' }]}>Confirm ✓</Text>
                        </TouchableOpacity>
                      </View>
                    </BentoCard>
                  )}
                  
                  <Text style={[styles.timeText, { color: colors.textSecondary }]}>
                    {new Date(msg.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
              </View>
            );
          })}

          {/* Typing indicator bubble */}
          {loading && (
            <View style={[styles.messageRow, styles.rowAi]}>
              <View style={[styles.xpAvatarWrapper, { backgroundColor: colors.primaryContainer }]}>
                <Text style={[styles.xpAvatarText, { color: colors.primary }]}>XP</Text>
              </View>
              <View style={[styles.bubble, styles.bubbleAi, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.typingDotsWrapper}>
                  <View style={[styles.typingDot, { backgroundColor: colors.primary }]} />
                  <View style={[styles.typingDot, { backgroundColor: colors.primary, marginHorizontal: 3 }]} />
                  <View style={[styles.typingDot, { backgroundColor: colors.primary }]} />
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Suggested Quick Prompt Chips Container */}
        {messages.length <= 2 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.suggestionsRow}
          >
            {SUGGESTION_IMAGES.map((s, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => handleChipPress(s.text)}
                activeOpacity={0.85}
                style={styles.suggestionChip}
              >
                <ImageBackground
                  source={{ uri: s.image }}
                  style={styles.suggestionBg}
                  imageStyle={styles.suggestionBgImage}
                >
                  <View style={styles.suggestionOverlay} />
                  <Text style={styles.suggestionText} numberOfLines={2}>{s.text}</Text>
                </ImageBackground>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* BOTTOM INPUT BAR SECTION */}
        <View style={[styles.inputBarWrapper, { borderTopColor: colors.border, backgroundColor: colors.card }]}>
          <TouchableOpacity activeOpacity={0.7} onPress={handleAttachImage} style={styles.inputIconBtn}>
            <MaterialCommunityIcons name="camera-outline" size={24} color={colors.primary} />
          </TouchableOpacity>
          
          <TextInput
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type swiggy, uber, ola expense details..."
            placeholderTextColor={colors.textSecondary}
            multiline
            style={[styles.textInput, { color: colors.text, borderColor: colors.border }]}
          />

          {inputText.trim() ? (
            <TouchableOpacity activeOpacity={0.7} onPress={handleSend} style={[styles.sendBtn, { backgroundColor: colors.primary }]}>
              <MaterialCommunityIcons name="send" size={20} color="#ffffff" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity activeOpacity={0.7} onPress={handleMicPress} style={styles.inputIconBtn}>
              <MaterialCommunityIcons name="microphone-outline" size={24} color={colors.primary} />
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
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
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderBottomWidth: 1.5,
  },
  headerAvatar: {
    marginRight: spacing.md,
  },
  headerDetails: {
    flex: 1,
  },
  headerTitle: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
  },
  onlineWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  onlineText: {
    fontFamily: typography.fontFamily,
    fontSize: 10,
    fontWeight: typography.weights.semibold,
  },
  closeBtn: {
    padding: spacing.xs,
  },
  projectSelectorScroll: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
    borderBottomWidth: 1,
  },
  projectChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 1,
    borderRadius: spacing.borderRadius.round,
    borderWidth: 1.5,
  },
  projectChipText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    maxWidth: 120,
  },
  projectScrollRow: {
    maxHeight: 110,
    marginBottom: 8,
  },
  projectScrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 10,
    flexDirection: 'row',
  },
  projectImageCard: {
    width: 80,
    alignItems: 'center',
  },
  projectImageCardSelected: {
    transform: [{ scale: 1.05 }],
  },
  projectImageArea: {
    width: 72,
    height: 72,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: 4,
  },
  projectImageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 14,
  },
  projectSelectedBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(108,71,255,0.8)',
    borderRadius: 8,
    padding: 2,
  },
  projectImageLabel: {
    fontSize: 10,
    fontWeight: '500',
    textAlign: 'center',
    width: 72,
  },
  messagesScroll: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
    gap: spacing.lg,
  },
  messageRow: {
    flexDirection: 'row',
    width: '100%',
  },
  rowAi: {
    alignSelf: 'flex-start',
    justifyContent: 'flex-start',
  },
  rowUser: {
    alignSelf: 'flex-end',
    justifyContent: 'flex-end',
  },
  xpAvatarWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  xpAvatarText: {
    fontFamily: typography.fontFamily,
    fontSize: 11,
    fontWeight: typography.weights.black,
  },
  messageContent: {
    maxWidth: '80%',
  },
  bubble: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  bubbleAi: {
    borderWidth: 1,
    borderTopLeftRadius: 4,
  },
  bubbleUser: {
    borderTopRightRadius: 4,
  },
  bubbleText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.sm + 1,
    lineHeight: typography.lineHeights.sm,
  },
  imageAttachmentPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: spacing.borderRadius.sm,
    marginTop: spacing.sm,
  },
  attachmentLabel: {
    fontFamily: typography.fontFamily,
    fontSize: 10,
    color: '#ffffff',
    fontWeight: typography.weights.bold,
  },
  timeText: {
    fontFamily: typography.fontFamily,
    fontSize: 9,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  confirmCard: {
    marginTop: spacing.md,
    marginBottom: 0,
  },
  confirmHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  confirmAmount: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.black,
  },
  confirmFields: {
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  confirmFieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  fieldLabel: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.xs + 1,
    fontWeight: typography.weights.medium,
  },
  fieldVal: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.xs + 1,
    fontWeight: typography.weights.bold,
  },
  confirmActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  confirmActionBtn: {
    flex: 1,
    flexDirection: 'row',
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    gap: spacing.xs,
  },
  editBtn: {
    borderWidth: 1.5,
  },
  actionBtnText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.xs + 1,
    fontWeight: typography.weights.bold,
  },
  typingDotsWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 16,
    paddingHorizontal: spacing.xs,
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  suggestionsRow: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 10,
    flexDirection: 'row',
  },
  suggestionChip: {
    borderRadius: 20,
    overflow: 'hidden',
    height: 64,
    minWidth: 140,
    maxWidth: 180,
  },
  suggestionBg: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  suggestionBgImage: {
    borderRadius: 20,
  },
  suggestionOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 20,
  },
  suggestionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 16,
  },
  inputBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  inputIconBtn: {
    padding: spacing.sm,
  },
  textInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginHorizontal: spacing.xs,
    fontSize: typography.sizes.sm + 1,
    textAlignVertical: 'center',
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
export default AIChatScreen;
