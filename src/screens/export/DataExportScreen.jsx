import React from 'react';
import { StyleSheet, View, Text, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import useTheme from '../../hooks/useTheme';
import { useUiStore } from '../../store/uiStore';
import { spacing } from '../../constants/spacing';
import { typography } from '../../constants/typography';
import { openAppDrawer } from '../../utils/navigation';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';

const FORMATS = [
  { id: 'csv', label: 'CSV Spreadsheet', icon: 'file-delimited-outline', desc: 'All transactions for Excel / Sheets' },
  { id: 'pdf', label: 'PDF Summary', icon: 'file-pdf-box', desc: 'Monthly report with category charts' },
  { id: 'json', label: 'JSON Backup', icon: 'code-json', desc: 'Full offline backup payload' },
];

export const DataExportScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const showToast = useUiStore((state) => state.showToast);

  const handleExport = (format) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    showToast(`Preparing ${format.toUpperCase()} export...`, 'success');
    setTimeout(() => {
      showToast(`Export ready — download link simulated for ${format.toUpperCase()}`, 'success');
    }, 1500);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => openAppDrawer(navigation)}
          style={[styles.menuBtn, { borderColor: colors.border }]}
        >
          <MaterialCommunityIcons name="menu" size={22} color={colors.text} />
        </TouchableOpacity>
        <View>
          <Text style={[styles.title, { color: colors.text }]}>Data Export</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Download your expense ledger
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {FORMATS.map((fmt) => (
          <Card key={fmt.id} style={styles.formatCard} elevation="light">
            <View style={styles.formatRow}>
              <View style={[styles.iconWrap, { backgroundColor: colors.primaryContainer }]}>
                <MaterialCommunityIcons name={fmt.icon} size={28} color={colors.primary} />
              </View>
              <View style={styles.formatText}>
                <Text style={[styles.formatLabel, { color: colors.text }]}>{fmt.label}</Text>
                <Text style={[styles.formatDesc, { color: colors.textSecondary }]}>{fmt.desc}</Text>
              </View>
            </View>
            <Button
              title={`Export ${fmt.label.split(' ')[0]}`}
              onPress={() => handleExport(fmt.id)}
              variant="primary"
              style={styles.exportBtn}
            />
          </Card>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingTop: 16,
    paddingBottom: spacing.md,
  },
  menuBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  title: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.xxl - 2,
    fontWeight: typography.weights.bold,
  },
  subtitle: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.sm,
    marginTop: 2,
  },
  scroll: {
    padding: spacing.xl,
    paddingBottom: 100,
    gap: spacing.md,
  },
  formatCard: { padding: spacing.lg },
  formatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  formatText: { flex: 1 },
  formatLabel: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
  },
  formatDesc: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.xs + 1,
    marginTop: 4,
  },
  exportBtn: { width: '100%' },
});

export default DataExportScreen;
